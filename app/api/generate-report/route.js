const { ContractError, normalizeClinicalReport, normalizeClinicalRequest } = require("../../../lib/server/contracts");
const { badRequest, parseJson, serverError } = require("../../../lib/server/http");

export async function POST(request) {
  try {
    const body = await parseJson(request);
    const clinicalRequest = normalizeClinicalRequest(body.request);
    const report = normalizeClinicalReport(body.reportDraft);

    const output = {
      mode: "clinical",
      request: clinicalRequest,
      report,
    };

    return Response.json(output);
  } catch (error) {
    if (error instanceof ContractError) {
      return badRequest(error.message, error.details);
    }
    return serverError(error);
  }
}
