import {
  fetchYahoo,
  normalizeYahooSymbol,
  queryValue,
  sendApiError,
  setYahooCacheHeaders,
  upstreamErrorMessage,
} from "../lib/yahoo.js";

const ALLOWED_INTERVALS = new Set(["1d", "1wk", "1mo"]);
const ALLOWED_RANGES = new Set(["5y", "10y", "20y", "max"]);

export default async function handler(request, response) {
  if (request.method !== "GET") return sendApiError(response, 405, "METHOD_NOT_ALLOWED", "GETリクエストのみ利用できます。");

  const symbol = normalizeYahooSymbol(queryValue(request, "symbol"));
  const interval = queryValue(request, "interval") || "1d";
  const range = queryValue(request, "range") || "10y";
  if (!symbol) return sendApiError(response, 400, "INVALID_SYMBOL", "銘柄コードの形式が正しくありません。例: 7203");
  if (!ALLOWED_INTERVALS.has(interval) || !ALLOWED_RANGES.has(range)) {
    return sendApiError(response, 400, "INVALID_PERIOD", "足種または取得期間の指定が正しくありません。");
  }

  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?range=${encodeURIComponent(range)}&interval=${encodeURIComponent(interval)}&events=history`;
  try {
    const data = await fetchYahoo(url);
    if (!data?.chart?.result?.[0] || data.chart?.error) {
      return sendApiError(response, 502, "YAHOO_EMPTY_RESPONSE", data.chart?.error?.description || "Yahoo Financeから株価データが返されませんでした。");
    }
    setYahooCacheHeaders(response);
    return response.status(200).json(data);
  } catch (error) {
    return sendApiError(response, 502, "YAHOO_FETCH_FAILED", upstreamErrorMessage(error, "株価データ"));
  }
}
