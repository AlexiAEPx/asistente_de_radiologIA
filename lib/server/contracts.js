const allowedModalities = ["rx", "tc", "rm", "us", "mamografia", "pet-tc", "otro"];
const allowedPriorities = ["routine", "urgent", "critical"];
const allowedFollowUpStatus = ["pending", "scheduled", "completed", "not-applicable"];
const allowedFollowUpPriority = ["low", "medium", "high", "critical"];

class ContractError extends Error {
  constructor(message, details = []) {
    super(message);
    this.name = "ContractError";
    this.details = details;
  }
}

const isObject = (value) => !!value && typeof value === "object" && !Array.isArray(value);
const asString = (value) => (typeof value === "string" ? value.trim() : "");
const asArray = (value) => (Array.isArray(value) ? value : []);

const assert = (condition, message, details = []) => {
  if (!condition) {
    throw new ContractError(message, details);
  }
};

const requireString = (value, field, details, { min = 1 } = {}) => {
  const normalized = asString(value);
  if (normalized.length < min) {
    details.push(`${field} must be a non-empty string`);
    return "";
  }
  return normalized;
};

const normalizeClinicalRequest = (input) => {
  const details = [];
  assert(isObject(input), "Invalid request contract", ["body must be an object"]);

  const patient = isObject(input.patient) ? input.patient : {};
  const study = isObject(input.study) ? input.study : {};

  const normalized = {
    patient: {
      age: Number.isFinite(patient.age) ? patient.age : null,
      sex: asString(patient.sex) || "unknown",
      history: asArray(patient.history).map((item) => asString(item)).filter(Boolean),
    },
    study: {
      requested: requireString(study.requested, "study.requested", details),
      modality: asString(study.modality) || "otro",
      reason: requireString(study.reason, "study.reason", details),
      priority: asString(study.priority) || "routine",
      comparisonAvailable: Boolean(study.comparisonAvailable),
    },
    notes: asString(input.notes),
    language: asString(input.language) || "es",
  };

  if (!allowedModalities.includes(normalized.study.modality)) {
    details.push(`study.modality must be one of: ${allowedModalities.join(", ")}`);
  }
  if (!allowedPriorities.includes(normalized.study.priority)) {
    details.push(`study.priority must be one of: ${allowedPriorities.join(", ")}`);
  }
  if (normalized.patient.age !== null && (normalized.patient.age < 0 || normalized.patient.age > 130)) {
    details.push("patient.age must be between 0 and 130");
  }

  assert(details.length === 0, "Invalid request contract", details);
  return normalized;
};

const normalizeClinicalReport = (input) => {
  const details = [];
  assert(isObject(input), "Invalid report contract", ["body must be an object"]);

  const normalized = {
    exam: requireString(input.exam, "exam", details),
    technique: requireString(input.technique, "technique", details),
    findings: asArray(input.findings).map((item) => asString(item)).filter(Boolean),
    impression: asArray(input.impression).map((item) => asString(item)).filter(Boolean),
    recommendation: asString(input.recommendation),
    critical: Boolean(input.critical),
    language: asString(input.language) || "es",
  };

  if (!normalized.findings.length) {
    details.push("findings must include at least one item");
  }
  if (!normalized.impression.length) {
    details.push("impression must include at least one item");
  }

  assert(details.length === 0, "Invalid report contract", details);
  return normalized;
};

const normalizeFollowUp = (input) => {
  const details = [];
  assert(isObject(input), "Invalid followup contract", ["body must be an object"]);

  const normalized = {
    finding: requireString(input.finding, "finding", details),
    modality: requireString(input.modality, "modality", details),
    interval: requireString(input.interval, "interval", details),
    priority: asString(input.priority) || "medium",
    status: asString(input.status) || "pending",
  };

  if (!allowedFollowUpPriority.includes(normalized.priority)) {
    details.push(`priority must be one of: ${allowedFollowUpPriority.join(", ")}`);
  }
  if (!allowedFollowUpStatus.includes(normalized.status)) {
    details.push(`status must be one of: ${allowedFollowUpStatus.join(", ")}`);
  }

  assert(details.length === 0, "Invalid followup contract", details);
  return normalized;
};

const normalizeQAResult = (input) => {
  const details = [];
  assert(isObject(input), "Invalid QA contract", ["body must be an object"]);

  const issues = asArray(input.issues)
    .map((issue) => {
      if (!isObject(issue)) return null;
      const code = asString(issue.code);
      const severity = asString(issue.severity);
      const message = asString(issue.message);
      if (!code || !severity || !message) return null;
      return { code, severity, message };
    })
    .filter(Boolean);

  const normalized = {
    status: asString(input.status) || (issues.length ? "fail" : "pass"),
    issues,
    followup: asArray(input.followup).map((item) => normalizeFollowUp(item)),
  };

  if (!["pass", "fail"].includes(normalized.status)) {
    details.push("status must be pass or fail");
  }

  assert(details.length === 0, "Invalid QA contract", details);
  return normalized;
};

module.exports = {
  ContractError,
  normalizeClinicalRequest,
  normalizeClinicalReport,
  normalizeFollowUp,
  normalizeQAResult,
};
