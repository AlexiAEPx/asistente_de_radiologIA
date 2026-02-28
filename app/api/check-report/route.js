const {
  ContractError,
  normalizeClinicalReport,
  normalizeClinicalRequest,
  normalizeQAResult,
} = require("../../../lib/server/contracts");
const { badRequest, parseJson, serverError } = require("../../../lib/server/http");

const buildDeterministicQA = (request, report) => {
  const issues = [];

  if (report.critical && !report.recommendation) {
    issues.push({
      code: "CRITICAL_WITHOUT_RECOMMENDATION",
      severity: "high",
      message: "Hallazgo crítico sin recomendación explícita.",
    });
  }

  if (request.study.comparisonAvailable && !report.findings.some((item) => /compar/i.test(item))) {
    issues.push({
      code: "NO_COMPARISON_MENTIONED",
      severity: "medium",
      message: "Se indicó comparación disponible pero no aparece en hallazgos.",
    });
  }

  const qa = {
    status: issues.length ? "fail" : "pass",
    issues,
    followup: report.recommendation
      ? [
          {
            finding: report.impression[0],
            modality: request.study.modality,
            interval: "según protocolo",
            priority: report.critical ? "critical" : "medium",
            status: "pending",
          },
        ]
      : [],
  };

  return normalizeQAResult(qa);
};

export async function POST(request) {
  try {
    const body = await parseJson(request);
    const clinicalRequest = normalizeClinicalRequest(body.request);
    const report = normalizeClinicalReport(body.report);
    const qa = buildDeterministicQA(clinicalRequest, report);

    return Response.json({ request: clinicalRequest, report, qa });
  } catch (error) {
    if (error instanceof ContractError) {
      return badRequest(error.message, error.details);
    }
    return serverError(error);
  }
}
