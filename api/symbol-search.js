import {
  cleanCompanyName,
  fetchYahoo,
  queryValue,
  sendApiError,
  setYahooCacheHeaders,
  upstreamErrorMessage,
} from "../lib/yahoo.js";

export default async function handler(request, response) {
  if (request.method !== "GET") return sendApiError(response, 405, "METHOD_NOT_ALLOWED", "GETリクエストのみ利用できます。");
  const query = queryValue(request, "q");
  if (!query) {
    setYahooCacheHeaders(response);
    return response.status(200).json([]);
  }
  if (query.length > 80) return sendApiError(response, 400, "QUERY_TOO_LONG", "検索文字が長すぎます。");

  try {
    let results = [];
    const url = `https://query2.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(query)}&quotesCount=12&newsCount=0&lang=ja-JP&region=JP`;
    try {
      const data = await fetchYahoo(url);
      const seen = new Set();
      results = (data.quotes || []).flatMap((item) => {
        const symbol = String(item.symbol || "").toUpperCase();
        if (!/^[0-9A-Z]{4}\.T$/.test(symbol)) return [];
        const code = symbol.slice(0, 4);
        if (seen.has(code)) return [];
        seen.add(code);
        return [{
          code,
          symbol: `${code}.jp`,
          name: cleanCompanyName(item.longname || item.shortname || item.name),
        }];
      });
    } catch {
      // Yahooの検索APIが一時的に拒否した場合は、日本版の検索ページをサーバー側で参照する。
    }

    if (!results.length) {
      const page = await fetchYahoo(`https://finance.yahoo.co.jp/search/?query=${encodeURIComponent(query)}`, "text");
      const seen = new Set();
      const pattern = /<a[^>]+href="https:\/\/finance\.yahoo\.co\.jp\/quote\/([0-9A-Z]{4})\.T"[\s\S]*?<h2[^>]+class="[^"]*SearchItem__name[^"]*"[^>]*>([\s\S]*?)<\/h2>/gi;
      for (const match of page.matchAll(pattern)) {
        const code = match[1].toUpperCase();
        if (seen.has(code)) continue;
        seen.add(code);
        results.push({ code, symbol: `${code}.jp`, name: cleanCompanyName(match[2]) });
        if (results.length >= 12) break;
      }
    }

    setYahooCacheHeaders(response);
    return response.status(200).json(results);
  } catch (error) {
    return sendApiError(response, 502, "SYMBOL_SEARCH_FAILED", upstreamErrorMessage(error, "銘柄検索結果"));
  }
}
