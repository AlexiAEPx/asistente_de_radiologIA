const PROVIDER_KEYS = {
  anthropic: "ANTHROPIC_API_KEY",
  openai: "OPENAI_API_KEY",
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
        ...messages.map((m) => {
          if (Array.isArray(m.content)) {
            const textOnly = m.content
              .filter((b) => b?.type === "text")
              .map((b) => b.text)
              .join("\n");
            return { role: m.role, content: textOnly };
          }
          return { role: m.role, content: typeof m.content === "string" ? m.content : String(m.content || "") };
        }),
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
