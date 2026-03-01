const { ContractError } = require("./contracts");

const jsonError = (status, message, details = []) =>
  Response.json({ error: message, details }, { status });

const badRequest = (message, details = []) => jsonError(400, message, details);

const serverError = (error) =>
  jsonError(500, "Server error", [error?.message || "Unknown error"]);

const handleRouteError = (error) => {
  if (error instanceof ContractError) {
    return badRequest(error.message, error.details);
  }
  return serverError(error);
};

const parseJson = async (request) => {
  try {
    return await request.json();
  } catch (_error) {
    throw new ContractError("Invalid JSON body", ["Body must be valid JSON"]);
  }
};

module.exports = { badRequest, serverError, handleRouteError, parseJson };
