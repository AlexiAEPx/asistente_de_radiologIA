const { normalizeClinicalRequest } = require("../../../lib/server/contracts");
const { handleRouteError, parseJson } = require("../../../lib/server/http");

export async function POST(request) {
  try {
    const body = await parseJson(request);
    const input = normalizeClinicalRequest(body);

    const output = {
      request: input,
      summary: {
        modality: input.study.modality,
        priority: input.study.priority,
        hasHistory: input.patient.history.length > 0,
      },
    };

    return Response.json(output);
  } catch (error) {
    return handleRouteError(error);
  }
}
