const { ContractError, normalizeClinicalRequest } = require("../../../lib/server/contracts");
const { badRequest, parseJson, serverError } = require("../../../lib/server/http");

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
    if (error instanceof ContractError) {
      return badRequest(error.message, error.details);
    }
    return serverError(error);
  }
}
