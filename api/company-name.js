import {
  cleanCompanyName,
  fetchYahoo,
  normalizeYahooSymbol,
  queryValue,
  sendApiError,
  setYahooCacheHeaders,
  upstreamErrorMessage,
} from "../lib/yahoo.js";

export default async function handler(request, response) {
  if (request.method !== "GET") return sendApiError(response, 405, "METHOD_NOT_ALLOWED", "GETリクエストのみ利用できます。");
  const symbol = normalizeYahooSymbol(queryValue(request, "symbol"));
  if (!symbol) return sendApiError(response, 400, "INVALID_SYMBOL", "銘柄コードの形式が正しくありません。例: 7203");

  try {
    const code = symbol.slice(0, 4);
    const searchUrl = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(code)}&quotesCount=8&newsCount=0&lang=ja-JP&region=JP`;
    const data = await fetchYahoo(searchUrl);
    const quote = (data.quotes || []).find((item) => String(item.symbol || "").toUpperCase() === symbol);
    let name = cleanCompanyName(quote?.longname || quote?.shortname || quote?.name);

    if (!name) {
      const page = await fetchYahoo(`https://finance.yahoo.co.jp/quote/${encodeURIComponent(symbol)}`, "text");
      const candidate = page.match(/<h1[^>]*>(.*?)<\/h1>/s)?.[1] || page.match(/<title>(.*?)<\/title>/s)?.[1] || "";
      name = cleanCompanyName(candidate.split(/【| - |｜|\|/)[0]);
    }
    if (!name) return sendApiError(response, 404, "COMPANY_NAME_NOT_FOUND", "日本語の銘柄名を取得できませんでした。");

    setYahooCacheHeaders(response);
    response.setHeader("Content-Type", "text/plain; charset=utf-8");
    return response.status(200).send(name);
  } catch (error) {
    return sendApiError(response, 502, "COMPANY_NAME_FETCH_FAILED", upstreamErrorMessage(error, "銘柄名"));
  }
}
