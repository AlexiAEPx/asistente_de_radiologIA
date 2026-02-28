const { ContractError } = require("./contracts");

const badRequest = (message, details = []) =>
  Response.json({ error: message, details }, { status: 400 });

const serverError = (error) =>
  Response.json(
    { error: "Server error", details: error?.message || "Unknown error" },
    { status: 500 }
  );

const parseJson = async (request) => {
  try {
    return await request.json();
  } catch (_error) {
    throw new ContractError("Invalid JSON body", ["Body must be valid JSON"]);
  }
};

module.exports = { badRequest, serverError, parseJson };
