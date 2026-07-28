const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const port = Number(process.env.PORT) || 8080;
const botToken = process.env.TELEGRAM_BOT_TOKEN;
const chatId = process.env.TELEGRAM_CHAT_ID;
const requests = new Map();
const mimeTypes = {
  ".css": "text/css; charset=utf-8", ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon", ".jpg": "image/jpeg", ".jpeg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8", ".png": "image/png",
  ".svg": "image/svg+xml", ".webp": "image/webp",
};

function sendJson(response, status, payload) {
  response.writeHead(status, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" });
  response.end(JSON.stringify(payload));
}

function escapeHtml(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;");
}

function isRateLimited(request) {
  const ip = String(request.headers["x-forwarded-for"] || request.socket.remoteAddress || "unknown").split(",")[0].trim();
  const now = Date.now();
  const recent = (requests.get(ip) || []).filter((time) => now - time < 10 * 60 * 1000);
  recent.push(now);
  requests.set(ip, recent);
  return recent.length > 5;
}

async function receiveLead(request, response) {
  if (isRateLimited(request)) return sendJson(response, 429, { ok: false, error: "Please wait before sending another request." });
  let body = "";
  for await (const chunk of request) {
    body += chunk;
    if (body.length > 32_000) return sendJson(response, 413, { ok: false, error: "Request is too large." });
  }

  let lead;
  try { lead = JSON.parse(body); } catch { return sendJson(response, 400, { ok: false, error: "Invalid request." }); }
  if (lead.website) return sendJson(response, 200, { ok: true });
  if (["tour", "date", "guests", "name", "phone"].some((field) => !String(lead[field] || "").trim())) {
    return sendJson(response, 400, { ok: false, error: "Please complete all required fields." });
  }
  if (!botToken || !chatId) {
    console.error("TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is not configured.");
    return sendJson(response, 503, { ok: false, error: "Booking service is being configured." });
  }

  const text = [
    "🔔 <b>New ProTours lead</b>", "",
    `<b>Tour:</b> ${escapeHtml(lead.tour)}`,
    `<b>Date:</b> ${escapeHtml(lead.date)}`,
    `<b>Guests:</b> ${escapeHtml(lead.guests)}`,
    `<b>Name:</b> ${escapeHtml(lead.name)}`,
    `<b>Phone / WhatsApp:</b> ${escapeHtml(lead.phone)}`,
    "", `📍 <a href="https://www.protours.fr">protours.fr</a>`,
  ].join("\n");

  try {
    const telegramResponse = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML", disable_web_page_preview: true }),
    });
    const result = await telegramResponse.json();
    if (!telegramResponse.ok || !result.ok) throw new Error(result.description || "Telegram rejected the request.");
    return sendJson(response, 200, { ok: true });
  } catch (error) {
    console.error("Telegram lead delivery failed:", error.message);
    return sendJson(response, 502, { ok: false, error: "We could not send your request right now." });
  }
}

function serveStatic(request, response) {
  const requestPath = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
  const relativePath = requestPath === "/" ? "index.html" : requestPath.replace(/^\/+/, "");
  const filePath = path.resolve(root, relativePath);
  if (!filePath.startsWith(`${root}${path.sep}`)) {
    response.writeHead(403);
    return response.end("Forbidden");
  }
  fs.stat(filePath, (error, stats) => {
    if (error || !stats.isFile()) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      return response.end("Not found");
    }
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filePath).toLowerCase()] || "application/octet-stream",
      "Cache-Control": filePath.endsWith(".html") ? "no-cache" : "public, max-age=86400",
    });
    fs.createReadStream(filePath).pipe(response);
  });
}

http.createServer((request, response) => {
  if (request.method === "POST" && request.url === "/api/leads") return receiveLead(request, response);
  if (request.method === "GET" || request.method === "HEAD") return serveStatic(request, response);
  response.writeHead(405, { Allow: "GET, HEAD, POST" });
  response.end("Method not allowed");
}).listen(port, "0.0.0.0", () => console.log(`ProTours server listening on port ${port}`));
