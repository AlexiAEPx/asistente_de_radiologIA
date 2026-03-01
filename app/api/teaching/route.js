const { normalizeClinicalReport, normalizeClinicalRequest } = require("../../../lib/server/contracts");
const { handleRouteError, parseJson } = require("../../../lib/server/http");

export async function POST(request) {
  try {
    const body = await parseJson(request);
    const clinicalRequest = normalizeClinicalRequest(body.request);
    const report = normalizeClinicalReport(body.report);

    const output = {
      mode: "teaching",
      differential: report.impression.slice(0, 3),
      mindMap: {
        anchor: report.exam,
        branches: report.findings.slice(0, 5),
      },
      keyIdeas: [
        `Correlacionar ${clinicalRequest.study.reason} con hallazgos de ${clinicalRequest.study.requested}.`,
        "Priorizar seguridad del paciente y comunicación estructurada.",
      ],
    };

    return Response.json(output);
  } catch (error) {
    return handleRouteError(error);
  }
}
