const test = require("node:test");
const assert = require("node:assert/strict");

const {
  ContractError,
  normalizeClinicalRequest,
  normalizeClinicalReport,
  normalizeQAResult,
} = require("../lib/server/contracts");

test("normalizeClinicalRequest accepts valid payload", () => {
  const data = normalizeClinicalRequest({
    patient: { age: 66, sex: "f", history: ["tabaco"] },
    study: {
      requested: "TC tórax",
      modality: "tc",
      reason: "disnea",
      priority: "urgent",
      comparisonAvailable: true,
    },
  });

  assert.equal(data.study.modality, "tc");
  assert.equal(data.patient.history.length, 1);
});

test("normalizeClinicalReport rejects missing findings", () => {
  assert.throws(
    () =>
      normalizeClinicalReport({
        exam: "TC tórax",
        technique: "Sin contraste",
        findings: [],
        impression: ["Sin hallazgos agudos"],
      }),
    ContractError
  );
});

test("normalizeQAResult validates followup enums", () => {
  assert.throws(
    () =>
      normalizeQAResult({
        status: "pass",
        issues: [],
        followup: [
          {
            finding: "nódulo",
            modality: "tc",
            interval: "3 meses",
            priority: "invalid",
            status: "pending",
          },
        ],
      }),
    ContractError
  );
});

test("normalizeClinicalRequest rejects unrealistic ages", () => {
  assert.throws(
    () =>
      normalizeClinicalRequest({
        patient: { age: 999, sex: "f" },
        study: {
          requested: "TC tórax",
          modality: "tc",
          reason: "disnea",
          priority: "urgent",
        },
      }),
    ContractError
  );
});
