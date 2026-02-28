const PROVIDER_KEYS = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
};

const asText = (value) => (typeof value === "string" ? value : String(value || ""));

const normalizeAnthropicBlockToOpenAI = (block) => {
  if (!block || typeof block !== "object") return null;

  if (block.type === "text") {
    return { type: "text", text: asText(block.text) };
  }

  if (block.type === "image" && block.source?.type === "base64") {
    const mediaType = block.source.media_type || "image/png";
    const data = block.source.data || "";
    if (!data) return null;
    return {
      type: "image_url",
      image_url: { url: `data:${mediaType};base64,${data}` },
    };
  }

  return null;
};

const normalizeMessageForOpenAI = (message) => {
  if (!message || typeof message !== "object") {
    return { role: "user", content: "" };
  }

  const role = message.role || "user";

  if (!Array.isArray(message.content)) {
    return { role, content: asText(message.content) };
  }

  const contentBlocks = message.content
    .map(normalizeAnthropicBlockToOpenAI)
    .filter(Boolean);

  if (!contentBlocks.length) {
    return { role, content: "" };
  }

  return { role, content: contentBlocks };
};

const providerConfigs = {
  anthropic: {
    url: "https://api.anthropic.com/v1/messages",
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    }),
    buildBody: ({ model, max_tokens, system, messages }) => ({ model, max_tokens, system, messages }),
    parseText: async (response) => response.json(),
  },
  openai: {
    url: "https://api.openai.com/v1/chat/completions",
    buildHeaders: (apiKey) => ({
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    }),
    buildBody: ({ model, max_tokens, system, messages }) => ({
      model,
      max_tokens,
      messages: [
        ...(system ? [{ role: "system", content: system }] : []),
        ...messages.map(normalizeMessageForOpenAI),
      ],
    }),
    parseText: async (response) => {
      const data = await response.json();
      const text = data?.choices?.[0]?.message?.content || "";
      const usage = data?.usage
        ? {
            input_tokens: data.usage.prompt_tokens || 0,
            output_tokens: data.usage.completion_tokens || 0,
          }
        : undefined;
      return { content: [{ type: "text", text }], usage };
    },
  },
};

export async function POST(request) {
  try {
    const body = await request.json();
    const { provider = "anthropic", model, max_tokens, system, messages } = body;

    if (!model || typeof model !== "string") {
      return Response.json({ error: "Invalid model" }, { status: 400 });
    }
    if (!Array.isArray(messages)) {
      return Response.json({ error: "Invalid messages payload" }, { status: 400 });
    }

    const config = providerConfigs[provider];
    if (!config) {
      return Response.json({ error: `Provider not supported: ${provider}` }, { status: 400 });
    }

    const keyName = PROVIDER_KEYS[provider];
    const apiKey = process.env[keyName];
    if (!apiKey) {
      return Response.json({ error: `${keyName} not configured` }, { status: 500 });
    }

    const response = await fetch(config.url, {
      method: "POST",
      headers: config.buildHeaders(apiKey),
      body: JSON.stringify(config.buildBody({ model, max_tokens, system, messages })),
    });

    if (!response.ok) {
      const err = await response.text();
      return Response.json(
        { error: `${provider} API error: ${response.status}`, details: err },
        { status: response.status }
      );
    }

    const data = await config.parseText(response);
    return Response.json(data);
  } catch (error) {
    return Response.json({ error: "Server error", details: error.message }, { status: 500 });
  }
}
