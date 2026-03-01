const { normalizeClinicalReport, normalizeClinicalRequest } = require("../../../lib/server/contracts");
const { handleRouteError, parseJson } = require("../../../lib/server/http");

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
    return handleRouteError(error);
  }
}
