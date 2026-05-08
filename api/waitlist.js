const BREVO_CONTACTS_URL = "https://api.brevo.com/v3/contacts";

function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json");
  response.end(JSON.stringify(payload));
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function readRequestBody(request) {
  if (request.body && typeof request.body === "object") {
    return request.body;
  }

  if (typeof request.body === "string") {
    return JSON.parse(request.body || "{}");
  }

  const chunks = [];

  for await (const chunk of request) {
    chunks.push(chunk);
  }

  const rawBody = Buffer.concat(chunks).toString("utf8");
  return JSON.parse(rawBody || "{}");
}

module.exports = async function waitlist(request, response) {
  if (request.method !== "POST") {
    response.setHeader("Allow", "POST");
    return sendJson(response, 405, { error: "Method not allowed" });
  }

  const apiKey = process.env.BREVO_API_KEY;
  const listId = Number(process.env.BREVO_LIST_ID);

  if (!apiKey || !Number.isInteger(listId)) {
    return sendJson(response, 500, { error: "Waitlist is not configured" });
  }

  let body;

  try {
    body = await readRequestBody(request);
  } catch (error) {
    return sendJson(response, 400, { error: "Invalid request body" });
  }

  const email = String(body.email || "").trim().toLowerCase();

  if (!isValidEmail(email)) {
    return sendJson(response, 400, { error: "Valid email is required" });
  }

  const brevoResponse = await fetch(BREVO_CONTACTS_URL, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "api-key": apiKey
    },
    body: JSON.stringify({
      email,
      listIds: [listId],
      updateEnabled: true
    })
  });

  if (!brevoResponse.ok) {
    const errorBody = await brevoResponse.text();
    console.error("Brevo waitlist error", brevoResponse.status, errorBody);
    return sendJson(response, 502, { error: "Could not add email to waitlist" });
  }

  return sendJson(response, 200, { ok: true });
};
