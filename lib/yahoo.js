const FIVE_MINUTES = 300;
const ONE_MINUTE = 60;

export function setYahooCacheHeaders(response) {
  response.setHeader("Cache-Control", `public, max-age=0, s-maxage=${FIVE_MINUTES}, stale-while-revalidate=${ONE_MINUTE}`);
  response.setHeader("Vercel-CDN-Cache-Control", `public, max-age=${FIVE_MINUTES}, stale-while-revalidate=${ONE_MINUTE}`);
}

export function sendApiError(response, status, code, message) {
  response.setHeader("Cache-Control", "no-store");
  return response.status(status).json({ error: { code, message } });
}

export function queryValue(request, name) {
  const value = request.query?.[name];
  return String(Array.isArray(value) ? value[0] : value || "").trim();
}

export function normalizeYahooSymbol(value, fallback = "7203.T") {
  const symbol = String(value || fallback).trim().toUpperCase();
  if (!/^[0-9A-Z]{4}\.T$/.test(symbol)) return "";
  return symbol;
}

export function cleanCompanyName(value) {
  return String(value || "")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&#39;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/\s+/g, " ")
    .replace(/\b[0-9A-Z]{4}\.T\b/gi, "")
    .replace(/株式会社|㈱|\(株\)|（株）/g, "")
    .trim();
}

export async function fetchYahoo(url, responseType = "json") {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(url, {
      headers: {
        Accept: responseType === "json" ? "application/json" : "text/html,application/xhtml+xml",
        "Accept-Language": "ja-JP,ja;q=0.9,en;q=0.7",
        "User-Agent": "Mozilla/5.0 (compatible; TechnicalTradeLab/1.0)",
      },
      signal: controller.signal,
    });
    if (!response.ok) {
      const error = new Error(`Yahoo Finance returned HTTP ${response.status}`);
      error.status = response.status;
      throw error;
    }
    return responseType === "json" ? response.json() : response.text();
  } finally {
    clearTimeout(timer);
  }
}

export function upstreamErrorMessage(error, subject) {
  if (error?.name === "AbortError") return `${subject}の取得がタイムアウトしました。少し待ってから再度お試しください。`;
  if (error?.status === 404) return `${subject}が見つかりませんでした。銘柄コードを確認してください。`;
  if (error?.status === 429) return "Yahoo Financeへのアクセスが混み合っています。5分ほど待ってから再度お試しください。";
  return `${subject}を取得できませんでした。少し待ってから再度お試しください。`;
}
