const { callLLM } = require("../../../lib/server/llm");
const { serverError } = require("../../../lib/server/http");

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await callLLM(body);

    if (result.error) {
      return Response.json(
        {
          error: result.error,
          details: result.details,
          deprecation: "Use /api/analyze-request, /api/generate-report, /api/check-report or /api/teaching.",
        },
        { status: result.status || 400 }
      );
    }

    return Response.json({
      ...result.data,
      deprecation: "Temporary compatibility endpoint. Migrate to JSON-first endpoints.",
    });
  } catch (error) {
    return serverError(error);
  }
}
