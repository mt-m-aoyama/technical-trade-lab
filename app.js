const yen = new Intl.NumberFormat("ja-JP", {
  style: "currency",
  currency: "JPY",
  maximumFractionDigits: 0,
});

const yenText = (value) => `${Math.round(value).toLocaleString("ja-JP")}円`;
const signedYenText = (value) => {
  const rounded = Math.round(value);
  if (rounded > 0) return `＋${rounded.toLocaleString("ja-JP")}円`;
  if (rounded < 0) return `－${Math.abs(rounded).toLocaleString("ja-JP")}円`;
  return "0円";
};

const pnlClass = (value) => {
  const rounded = Math.round(value);
  if (rounded > 0) return "pnl-plus";
  if (rounded < 0) return "pnl-minus";
  return "pnl-zero";
};

const TRADE_RECORDS_KEY = "technical-trade-lab-records";
const WATCHLIST_KEY = "technical-trade-lab-watchlist";
const MONITOR_LIST_KEY = "technical-trade-lab-monitor-list";

const state = {
  candles: [],
  symbol: "6954.jp",
  timeframe: "1d",
  companyName: "",
  symbolSearchResults: [],
  symbolSearchTimer: null,
  source: "",
  index: 0,
  windowSize: 60,
  hoverPoint: null,
  timer: null,
  initialCash: 20_000_000,
  cash: 20_000_000,
  realizedSpot: 0,
  realizedShort: 0,
  holdings: 0,
  holdingCost: 0,
  shortQty: 0,
  shortAvg: 0,
  history: [],
  showTradeMarkers: true,
  watchlist: [],
  monitorList: [],
  averages: [
    { enabled: true, period: 5, color: "#ff1f1f" },
    { enabled: true, period: 20, color: "#006dff" },
    { enabled: true, period: 50, color: "#8a2be2" },
    { enabled: true, period: 100, color: "#ff9500" },
    { enabled: true, period: 200, color: "#aeb6c2", lineWidth: 2, lineDash: [2, 4] },
  ],
};

const DEFAULT_AVERAGE_PERIODS = {
  "1d": [5, 20, 50, 100, 200],
  "1wk": [10, 20, 40],
  "1mo": [12, 24, 60],
};

const INITIAL_SYMBOL_POOL = [
  "7203.jp",
  "8306.jp",
  "9984.jp",
  "8035.jp",
  "9983.jp",
  "285A.jp",
  "6501.jp",
  "8316.jp",
  "8031.jp",
  "7011.jp",
  "4063.jp",
  "6758.jp",
  "6098.jp",
  "7974.jp",
  "6861.jp",
  "4568.jp",
  "9432.jp",
  "4519.jp",
  "8766.jp",
  "2914.jp",
  "8001.jp",
  "8058.jp",
  "6857.jp",
  "6902.jp",
  "7267.jp",
  "6367.jp",
  "9433.jp",
  "7741.jp",
  "3382.jp",
  "6273.jp",
  "6954.jp",
  "6702.jp",
  "4502.jp",
  "4503.jp",
  "6503.jp",
  "6981.jp",
  "6504.jp",
  "8725.jp",
  "4543.jp",
  "8036.jp",
  "5108.jp",
  "7751.jp",
  "7733.jp",
  "6201.jp",
  "6723.jp",
  "8801.jp",
  "8802.jp",
  "9022.jp",
  "9020.jp",
  "9021.jp",
  "1605.jp",
  "8053.jp",
  "8002.jp",
  "8015.jp",
  "6301.jp",
  "4661.jp",
  "4901.jp",
  "4911.jp",
  "8804.jp",
  "1925.jp",
  "1928.jp",
  "2502.jp",
  "2503.jp",
  "2802.jp",
  "4452.jp",
  "4578.jp",
  "4523.jp",
  "4151.jp",
  "4507.jp",
  "4689.jp",
  "4755.jp",
  "9434.jp",
  "9613.jp",
  "3659.jp",
  "4307.jp",
  "7832.jp",
  "5803.jp",
  "5802.jp",
  "3407.jp",
  "3402.jp",
  "3405.jp",
  "4188.jp",
  "4183.jp",
  "4005.jp",
  "8591.jp",
  "8604.jp",
  "8750.jp",
  "8795.jp",
  "8308.jp",
  "8309.jp",
  "8411.jp",
  "7182.jp",
  "7269.jp",
  "7201.jp",
  "7261.jp",
  "7270.jp",
  "7202.jp",
  "9735.jp",
  "9766.jp",
  "9843.jp",
  "8267.jp",
];

const TOP_MARKET_CAP_SYMBOLS = [
  "7203.jp",
  "8306.jp",
  "6758.jp",
  "6501.jp",
  "9984.jp",
  "6098.jp",
  "6861.jp",
  "9983.jp",
  "8035.jp",
  "9432.jp",
];

const TOP_MARKET_CAP_SYMBOL_POOL = Array.from(new Set([
  ...TOP_MARKET_CAP_SYMBOLS,
  ...INITIAL_SYMBOL_POOL,
]));

const TOP_MARKET_CAP_100_SYMBOLS = [
  "1605.jp",
  "1812.jp",
  "1925.jp",
  "2802.jp",
  "285A.jp",
  "2914.jp",
  "3382.jp",
  "4004.jp",
  "4062.jp",
  "4063.jp",
  "4091.jp",
  "4307.jp",
  "4452.jp",
  "4502.jp",
  "4503.jp",
  "4507.jp",
  "4519.jp",
  "4543.jp",
  "4568.jp",
  "4578.jp",
  "4661.jp",
  "4689.jp",
  "4901.jp",
  "5016.jp",
  "5020.jp",
  "5108.jp",
  "5401.jp",
  "5706.jp",
  "5713.jp",
  "5801.jp",
  "5802.jp",
  "5803.jp",
  "6098.jp",
  "6146.jp",
  "6178.jp",
  "6273.jp",
  "6301.jp",
  "6326.jp",
  "6367.jp",
  "6383.jp",
  "6501.jp",
  "6503.jp",
  "6594.jp",
  "6701.jp",
  "6702.jp",
  "6723.jp",
  "6752.jp",
  "6758.jp",
  "6762.jp",
  "6857.jp",
  "6861.jp",
  "6902.jp",
  "6920.jp",
  "6954.jp",
  "6971.jp",
  "6981.jp",
  "7011.jp",
  "7013.jp",
  "7182.jp",
  "7203.jp",
  "7267.jp",
  "7269.jp",
  "7532.jp",
  "7741.jp",
  "7751.jp",
  "7936.jp",
  "7974.jp",
  "8001.jp",
  "8002.jp",
  "8015.jp",
  "8031.jp",
  "8035.jp",
  "8053.jp",
  "8058.jp",
  "8267.jp",
  "8306.jp",
  "8308.jp",
  "8309.jp",
  "8316.jp",
  "8411.jp",
  "8591.jp",
  "8604.jp",
  "8630.jp",
  "8725.jp",
  "8750.jp",
  "8766.jp",
  "8795.jp",
  "8801.jp",
  "8802.jp",
  "8830.jp",
  "9020.jp",
  "9022.jp",
  "9432.jp",
  "9433.jp",
  "9434.jp",
  "9503.jp",
  "9735.jp",
  "9766.jp",
  "9983.jp",
  "9984.jp",
];

const el = {
  chart: document.getElementById("chartCanvas"),
  openTradeRecords: document.getElementById("openTradeRecords"),
  currentDate: document.getElementById("currentDate"),
  currentPrice: document.getElementById("currentPrice"),
  rangeLabel: document.getElementById("rangeLabel"),
  assetTotal: document.getElementById("assetTotal"),
  totalPnl: document.getElementById("totalPnl"),
  cashValue: document.getElementById("cashValue"),
  shareCount: document.getElementById("shareCount"),
  spotAverageCost: document.getElementById("spotAverageCost"),
  holdingValue: document.getElementById("holdingValue"),
  spotPnl: document.getElementById("spotPnl"),
  spotTotalPnl: document.getElementById("spotTotalPnl"),
  shortShareCount: document.getElementById("shortShareCount"),
  shortAveragePrice: document.getElementById("shortAveragePrice"),
  shortPositionAmount: document.getElementById("shortPositionAmount"),
  shortPnl: document.getElementById("shortPnl"),
  shortTotalPnl: document.getElementById("shortTotalPnl"),
  quantity: document.getElementById("quantity"),
  quantityDownLarge: document.getElementById("quantityDownLarge"),
  quantityDown: document.getElementById("quantityDown"),
  quantityUp: document.getElementById("quantityUp"),
  quantityUpLarge: document.getElementById("quantityUpLarge"),
  orderValue: document.getElementById("orderValue"),
  message: document.getElementById("message"),
  toggleTradeMarkers: document.getElementById("toggleTradeMarkers"),
  saveChartImage: document.getElementById("saveChartImage"),
  analyzeChartInChatGPT: document.getElementById("analyzeChartInChatGPT"),
  saveWatchlistPdf: document.getElementById("saveWatchlistPdf"),
  saveTopMarketCapPdf: document.getElementById("saveTopMarketCapPdf"),
  saveTopMarketCap50Pdf: document.getElementById("saveTopMarketCap50Pdf"),
  saveTopMarketCap100Pdf: document.getElementById("saveTopMarketCap100Pdf"),
  saveMonitorPdf: document.getElementById("saveMonitorPdf"),
  saveTop10DailyWeeklyPdf: document.getElementById("saveTop10DailyWeeklyPdf"),
  saveTop100DailyWeeklyPdf: document.getElementById("saveTop100DailyWeeklyPdf"),
  watchlist: document.getElementById("watchlist"),
  registerCurrentSymbol: document.getElementById("registerCurrentSymbol"),
  monitorCsvFile: document.getElementById("monitorCsvFile"),
  clearMonitorList: document.getElementById("clearMonitorList"),
  monitorList: document.getElementById("monitorList"),
  playPause: document.getElementById("playPause"),
  stepBack: document.getElementById("stepBack"),
  stepForward: document.getElementById("stepForward"),
  speed: document.getElementById("speed"),
  windowSize: document.getElementById("windowSize"),
  resetButton: document.getElementById("resetButton"),
  scoreButton: document.getElementById("scoreButton"),
  scoreDialog: document.getElementById("scoreDialog"),
  scoreBody: document.getElementById("scoreBody"),
  chartHint: document.getElementById("chartHint"),
  symbolInput: document.getElementById("symbolInput"),
  symbolSuggestions: document.getElementById("symbolSuggestions"),
  timeframe: document.getElementById("timeframe"),
  loadSymbol: document.getElementById("loadSymbol"),
  loadSymbolLatest: document.getElementById("loadSymbolLatest"),
  loadRandomSymbol: document.getElementById("loadRandomSymbol"),
  loadRandomLatest: document.getElementById("loadRandomLatest"),
  initialCash: document.getElementById("initialCash"),
  chartTitle: document.getElementById("chartTitle"),
  companyName: document.getElementById("companyName"),
  dataPeriod: document.getElementById("dataPeriod"),
  dataCount: document.getElementById("dataCount"),
  dataSource: document.getElementById("dataSource"),
  startDate: document.getElementById("startDate"),
  rangeStart: document.getElementById("rangeStart"),
  sliderStartLabel: document.getElementById("sliderStartLabel"),
  sliderEndLabel: document.getElementById("sliderEndLabel"),
  maEnabled: [...document.querySelectorAll(".ma-enabled")],
  maPeriods: [...document.querySelectorAll(".ma-period")],
  maColors: [...document.querySelectorAll(".ma-color")],
};

function current() {
  return state.candles[state.index];
}

function visibleCandles() {
  const start = visibleStartIndex();
  return state.candles.slice(start, state.index + 1);
}

function visibleStartIndex() {
  return Math.max(0, state.index - state.windowSize + 1);
}

function normalizeSymbol(input) {
  const value = input.trim().toLowerCase();
  if (!value) return "6954.jp";
  if (/^[0-9a-z]{4}$/i.test(value)) return `${value}.jp`;
  return value;
}

function randomInitialSymbol() {
  return INITIAL_SYMBOL_POOL[Math.floor(Math.random() * INITIAL_SYMBOL_POOL.length)];
}

function displaySymbol(symbol) {
  return symbol.replace(/\.jp$/i, "");
}

function cleanCompanyName(companyName = "") {
  return companyName
    .replace(/株式会社/g, "")
    .replace(/[（(]\s*株\s*[）)]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function displayCompanyName(symbol, companyName = "") {
  const name = cleanCompanyName(companyName);
  const code = displaySymbol(symbol);
  return name ? `${name}（${code}）` : "";
}

function displaySymbolInput(symbol, companyName = "") {
  return displayCompanyName(symbol, companyName) || displaySymbol(symbol);
}

function loadWatchlist() {
  try {
    const items = JSON.parse(localStorage.getItem(WATCHLIST_KEY) || "[]");
    state.watchlist = Array.isArray(items) ? items : [];
  } catch {
    state.watchlist = [];
  }
}

function saveWatchlist() {
  try {
    localStorage.setItem(WATCHLIST_KEY, JSON.stringify(state.watchlist));
  } catch {
    // 注目銘柄の保存に失敗しても、チャート操作は止めない。
  }
}

function loadMonitorList() {
  try {
    const items = JSON.parse(localStorage.getItem(MONITOR_LIST_KEY) || "[]");
    state.monitorList = Array.isArray(items)
      ? items.map((item) => ({
          symbol: normalizeSymbol(item.symbol || ""),
          companyName: cleanCompanyName(item.companyName || item.name || ""),
        })).filter((item) => item.symbol)
      : [];
  } catch {
    state.monitorList = [];
  }
}

function saveMonitorList() {
  try {
    localStorage.setItem(MONITOR_LIST_KEY, JSON.stringify(state.monitorList));
  } catch {
    // Ignore storage failures; the list can still be used in the current session.
  }
}

function parseMonitorCsvSymbols(text) {
  return Array.from(new Set(String(text).match(/\b\d{4}\b/g) || [])).map((code) => `${code}.jp`);
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function registerCurrentSymbol() {
  if (!state.symbol) return;
  const symbol = normalizeSymbol(state.symbol);
  const item = {
    symbol,
    companyName: cleanCompanyName(state.companyName),
  };
  const existing = state.watchlist.findIndex((entry) => normalizeSymbol(entry.symbol) === symbol);
  if (existing >= 0) {
    state.watchlist[existing] = item;
  } else {
    state.watchlist.unshift(item);
  }
  saveWatchlist();
  renderWatchlist();
}

function removeWatchlistSymbol(symbol) {
  const normalized = normalizeSymbol(symbol);
  state.watchlist = state.watchlist.filter((entry) => normalizeSymbol(entry.symbol) !== normalized);
  saveWatchlist();
  renderWatchlist();
}

async function loadWatchlistSymbol(symbol) {
  setLoading(true);
  try {
    const loaded = await loadSymbolData(symbol, { keepLoading: true });
    if (loaded) setLatestDisplayStart();
  } finally {
    setLoading(false);
  }
}

async function loadMonitorSymbol(symbol) {
  const normalized = normalizeSymbol(symbol);
  if (!normalized) return;
  stop();
  setLoading(true);
  try {
    const loaded = await loadSymbolData(normalized, { keepLoading: true });
    if (loaded) setLatestDisplayStart();
  } finally {
    setLoading(false);
  }
}

async function loadMonitorCsvFile() {
  const file = el.monitorCsvFile?.files?.[0];
  if (!file) return;
  const text = await file.text();
  const symbols = parseMonitorCsvSymbols(text);
  const current = new Map(state.monitorList.map((item) => [normalizeSymbol(item.symbol), item]));
  state.monitorList = symbols.map((symbol) => {
    const existing = current.get(symbol);
    return existing || { symbol, companyName: "" };
  });
  saveMonitorList();
  renderMonitorList();

  for (const item of state.monitorList) {
    if (item.companyName) continue;
    item.companyName = cleanCompanyName(await fetchJapaneseCompanyName(item.symbol));
    saveMonitorList();
    renderMonitorList();
  }
}

function clearMonitorList() {
  state.monitorList = [];
  saveMonitorList();
  renderMonitorList();
  if (el.monitorCsvFile) el.monitorCsvFile.value = "";
}

function symbolOptionLabel(result) {
  return result.name ? `${result.code} ${result.name}` : result.code;
}

function selectedSearchResult(input) {
  const value = input.trim();
  return state.symbolSearchResults.find((result) => {
    return value === result.code || value === result.symbol || value === symbolOptionLabel(result);
  });
}

async function resolveSymbolInput(input) {
  const value = input.trim();
  if (!value || /^[0-9a-z]{4}(\.jp)?$/i.test(value)) return normalizeSymbol(value);

  const selected = selectedSearchResult(value);
  if (selected) return selected.symbol;

  const results = await searchSymbols(value);
  const query = value.toLowerCase();
  const best =
    results.find((result) => result.name && result.name.toLowerCase() === query) ||
    results.find((result) => result.name && result.name.toLowerCase().includes(query)) ||
    results[0];
  if (!best) throw new Error("銘柄名に一致する銘柄が見つかりませんでした。");
  return best.symbol;
}

async function searchSymbols(query) {
  const value = query.trim();
  if (!value || /^[0-9a-z]{4}(\.jp)?$/i.test(value)) {
    updateSymbolSuggestions([]);
    return [];
  }

  const results = await fetchApiJson(
    `/api/symbol-search?q=${encodeURIComponent(value)}`,
    "銘柄検索に失敗しました。少し待ってから再度お試しください。",
  );
  state.symbolSearchResults = Array.isArray(results) ? results : [];
  updateSymbolSuggestions(state.symbolSearchResults);
  return state.symbolSearchResults;
}

async function apiErrorMessage(response, fallbackMessage) {
  try {
    const contentType = response.headers.get("content-type") || "";
    if (contentType.includes("application/json")) {
      const body = await response.json();
      return body?.error?.message || fallbackMessage;
    }
    await response.text();
    return fallbackMessage;
  } catch {
    return fallbackMessage;
  }
}

async function fetchApiJson(url, fallbackMessage) {
  let response;
  try {
    response = await fetch(url);
  } catch {
    throw new Error("サーバーに接続できませんでした。通信環境を確認して、再度お試しください。");
  }
  if (!response.ok) throw new Error(await apiErrorMessage(response, fallbackMessage));
  try {
    return await response.json();
  } catch {
    throw new Error("サーバーから受け取ったデータを読み取れませんでした。再度お試しください。");
  }
}

function updateSymbolSuggestions(results) {
  if (!el.symbolSuggestions) return;
  el.symbolSuggestions.innerHTML = "";
  results.forEach((result) => {
    const option = document.createElement("option");
    option.value = symbolOptionLabel(result);
    el.symbolSuggestions.appendChild(option);
  });
}

function queueSymbolSearch() {
  clearTimeout(state.symbolSearchTimer);
  state.symbolSearchTimer = setTimeout(async () => {
    try {
      await searchSymbols(el.symbolInput.value);
    } catch {
      updateSymbolSuggestions([]);
    }
  }, 280);
}

async function loadSymbolFromInput() {
  setLoading(true);
  try {
    const symbol = await resolveSymbolInput(el.symbolInput.value);
    await loadSymbolData(symbol, { keepLoading: true });
  } catch (error) {
    setMessage(error.message || "銘柄を検索できませんでした。", "down");
  } finally {
    setLoading(false);
  }
}

async function loadSymbolFromInputLatest() {
  setLoading(true);
  try {
    const symbol = await resolveSymbolInput(el.symbolInput.value);
    const loaded = await loadSymbolData(symbol, { keepLoading: true });
    if (loaded) setLatestDisplayStart();
  } catch (error) {
    setMessage(error.message || "銘柄を検索できませんでした。", "down");
  } finally {
    setLoading(false);
  }
}

async function loadSymbolData(symbol, options = {}) {
  if (!options.keepLoading) setLoading(true);
  state.timeframe = el.timeframe.value;
  setMessage(`実際の${timeframeLabel(state.timeframe)}データを取得しています。`);
  try {
    const data = await fetchYahooChart(symbol, state.timeframe);
    const candles = aggregateCandles(parseYahooChart(data), state.timeframe);
    const companyName = (await fetchJapaneseCompanyName(symbol)) || getCompanyName(data);
    applyData(candles, symbol, `Yahoo Finance chart API / ${timeframeLabel(state.timeframe)}`, companyName);
    setMessage("");
    return true;
  } catch (error) {
    const message = error.message || "株価データを取得できませんでした。銘柄コードを確認してください。";
    setMessage(message, "down");
    clearChart(message);
    return false;
  } finally {
    if (!options.keepLoading) setLoading(false);
  }
}

async function loadRandomInitialSymbol() {
  const tried = new Set();
  const maxTries = Math.min(8, INITIAL_SYMBOL_POOL.length);
  setLoading(true);
  try {
    for (let i = 0; i < maxTries; i += 1) {
      let symbol = randomInitialSymbol();
      while (tried.has(symbol) && tried.size < INITIAL_SYMBOL_POOL.length) {
        symbol = randomInitialSymbol();
      }
      tried.add(symbol);
      el.symbolInput.value = displaySymbol(symbol);
      const loaded = await loadSymbolData(symbol, { keepLoading: true });
      if (loaded) return;
    }
    await loadSymbolData("7203.jp", { keepLoading: true });
  } finally {
    setLoading(false);
  }
}

async function loadRandomSymbolWithDate() {
  const tried = new Set();
  const maxTries = Math.min(8, INITIAL_SYMBOL_POOL.length);
  setLoading(true);
  try {
    for (let i = 0; i < maxTries; i += 1) {
      let symbol = randomInitialSymbol();
      while (tried.has(symbol) && tried.size < INITIAL_SYMBOL_POOL.length) {
        symbol = randomInitialSymbol();
      }
      tried.add(symbol);
      el.symbolInput.value = displaySymbol(symbol);
      const loaded = await loadSymbolData(symbol, { keepLoading: true });
      if (loaded) {
        setRandomDisplayStart();
        return;
      }
    }
    const loaded = await loadSymbolData("7203.jp", { keepLoading: true });
    if (loaded) setRandomDisplayStart();
  } finally {
    setLoading(false);
  }
}

async function loadRandomSymbolLatest() {
  const tried = new Set();
  const maxTries = Math.min(8, INITIAL_SYMBOL_POOL.length);
  setLoading(true);
  try {
    for (let i = 0; i < maxTries; i += 1) {
      let symbol = randomInitialSymbol();
      while (tried.has(symbol) && tried.size < INITIAL_SYMBOL_POOL.length) {
        symbol = randomInitialSymbol();
      }
      tried.add(symbol);
      el.symbolInput.value = displaySymbol(symbol);
      const loaded = await loadSymbolData(symbol, { keepLoading: true });
      if (loaded) {
        setLatestDisplayStart();
        return;
      }
    }
    const loaded = await loadSymbolData("7203.jp", { keepLoading: true });
    if (loaded) setLatestDisplayStart();
  } finally {
    setLoading(false);
  }
}

async function fetchYahooChart(symbol, timeframe) {
  const yahooSymbol = toYahooSymbol(symbol);
  const config = timeframeConfig(timeframe);
  const url = `/api/yahoo?symbol=${encodeURIComponent(yahooSymbol)}&range=${encodeURIComponent(config.range)}&interval=${encodeURIComponent(config.interval)}`;
  const data = await fetchApiJson(url, "株価データを取得できませんでした。少し待ってから再度お試しください。");
  if (data.chart?.error) throw new Error(data.chart.error.description || "Yahoo Financeから株価データを取得できませんでした。");
  return data;
}

function timeframeConfig(timeframe) {
  if (timeframe === "1wk") return { interval: "1wk", range: "20y" };
  if (timeframe === "1mo") return { interval: "1mo", range: "max" };
  return { interval: "1d", range: "10y" };
}

function timeframeLabel(timeframe = state.timeframe) {
  if (timeframe === "1wk") return "週足";
  if (timeframe === "1mo") return "月足";
  return "日足";
}

function timeframeUnit(timeframe = state.timeframe) {
  if (timeframe === "1wk") return "週";
  if (timeframe === "1mo") return "月";
  return "日";
}

function toYahooSymbol(symbol) {
  if (/^[0-9a-z]{4}\.jp$/i.test(symbol)) return symbol.replace(/\.jp$/i, ".T").toUpperCase();
  if (/^[0-9a-z]{4}$/i.test(symbol)) return `${symbol}.T`.toUpperCase();
  return symbol.toUpperCase();
}

function parseYahooChart(data) {
  const result = data.chart?.result?.[0];
  const quote = result?.indicators?.quote?.[0];
  const timestamps = result?.timestamp || [];
  if (!result || !quote || timestamps.length === 0) {
    throw new Error("Yahoo Financeから日足データを取得できませんでした。");
  }

  const candles = timestamps
    .map((time, i) => {
      const tradedAt = new Date(time * 1000);
      const date = tradedAt.toLocaleDateString("ja-JP", {
        timeZone: result.meta?.exchangeTimezoneName || "Asia/Tokyo",
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
      });
      return {
        date,
        dateKey: normalizeDateKey(date),
        open: quote.open?.[i],
        high: quote.high?.[i],
        low: quote.low?.[i],
        close: quote.close?.[i],
        volume: quote.volume?.[i] || 0,
      };
    })
    .filter((c) => [c.open, c.high, c.low, c.close].every(Number.isFinite));

  if (candles.length < 40) {
    throw new Error("練習には40本以上の日足データが必要です。");
  }
  return candles;
}

function aggregateCandles(candles, timeframe) {
  if (timeframe === "1d") return candles;
  const groups = new Map();
  candles.forEach((candle) => {
    const key = timeframe === "1mo" ? candle.dateKey.slice(0, 7) : weekKey(candle.dateKey);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(candle);
  });
  return [...groups.values()]
    .map((group) => {
      const first = group[0];
      const last = group[group.length - 1];
      return {
        date: last.date,
        dateKey: last.dateKey,
        open: first.open,
        high: Math.max(...group.map((c) => c.high)),
        low: Math.min(...group.map((c) => c.low)),
        close: last.close,
        volume: group.reduce((sum, c) => sum + c.volume, 0),
      };
    })
    .filter((c) => [c.open, c.high, c.low, c.close].every(Number.isFinite));
}

function weekKey(dateKey) {
  const date = new Date(`${dateKey}T00:00:00`);
  const day = date.getDay() || 7;
  date.setDate(date.getDate() - day + 1);
  return date.toISOString().slice(0, 10);
}

function getCompanyName(data) {
  const meta = data.chart?.result?.[0]?.meta || {};
  return meta.longName || meta.shortName || "";
}

async function fetchJapaneseCompanyName(symbol) {
  const yahooSymbol = toYahooSymbol(symbol);
  try {
    const response = await fetch(`/api/company-name?symbol=${encodeURIComponent(yahooSymbol)}`);
    if (!response.ok) return "";
    return (await response.text()).trim();
  } catch {
    return "";
  }
}

function normalizeDateKey(value) {
  const text = String(value || "").trim();
  const match = text.match(/^(\d{4})[/-](\d{1,2})[/-](\d{1,2})$/);
  if (!match) return text;
  const [, year, month, day] = match;
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function applyData(candles, symbol, source, companyName = "") {
  stop();
  state.candles = candles;
  state.symbol = symbol;
  state.source = source;
  state.companyName = companyName;
  state.index = Math.min(candles.length - 1, Math.max(Math.min(39, candles.length - 1), Math.floor(candles.length * 0.34)));
  resetAccount();
  setupStartDateControl();
  el.symbolInput.value = displaySymbolInput(symbol, companyName);
  el.chartTitle.textContent = displayCompanyName(symbol, companyName) || displaySymbol(symbol);
  el.companyName.textContent = `${timeframeLabel()}チャート`;
  update();
}

function setupStartDateControl() {
  if (!state.candles.length) return;
  const first = state.candles[0].dateKey;
  const maxStartIndex = Math.max(0, state.candles.length - state.windowSize);
  const last = state.candles[maxStartIndex].dateKey;
  el.startDate.min = first;
  el.startDate.max = last;
  el.startDate.value = state.candles[visibleStartIndex()].dateKey;
  el.rangeStart.min = "0";
  el.rangeStart.max = String(maxStartIndex);
  el.rangeStart.value = String(visibleStartIndex());
}

function setDisplayStart(dateKey) {
  if (!state.candles.length || !dateKey) return;
  const target = normalizeDateKey(dateKey);
  const found = state.candles.findIndex((c) => c.dateKey >= target);
  const start = found >= 0 ? found : state.candles.length - 1;
  state.index = Math.min(state.candles.length - 1, start + state.windowSize - 1);
  update();
}

function setDisplayStartIndex(startIndex) {
  if (!state.candles.length) return;
  const maxStartIndex = Math.max(0, state.candles.length - state.windowSize);
  const start = Math.max(0, Math.min(maxStartIndex, Number(startIndex) || 0));
  state.index = Math.min(state.candles.length - 1, start + state.windowSize - 1);
  update();
}

function setRandomDisplayStart() {
  if (!state.candles.length) return;
  const maxStartIndex = Math.max(0, state.candles.length - state.windowSize);
  const start = Math.floor(Math.random() * (maxStartIndex + 1));
  setDisplayStartIndex(start);
}

function setLatestDisplayStart() {
  if (!state.candles.length) return;
  state.index = state.candles.length - 1;
  update();
}

function updateRangeSliderWindow(start) {
  if (!state.candles.length) {
    el.rangeStart.style.setProperty("--window-left", "0%");
    el.rangeStart.style.setProperty("--window-right", "0%");
    return;
  }
  const totalLastIndex = Math.max(1, state.candles.length - 1);
  const end = Math.min(state.candles.length - 1, start + state.windowSize - 1);
  const left = (start / totalLastIndex) * 100;
  const right = (end / totalLastIndex) * 100;
  el.rangeStart.style.setProperty("--window-left", `${left}%`);
  el.rangeStart.style.setProperty("--window-right", `${right}%`);
}

function resetAccount() {
  const cash = Math.max(100_000, parseNumberInput(el.initialCash.value) || state.initialCash);
  state.initialCash = cash;
  state.cash = cash;
  state.realizedSpot = 0;
  state.realizedShort = 0;
  state.holdings = 0;
  state.holdingCost = 0;
  state.shortQty = 0;
  state.shortAvg = 0;
  state.history = [];
}

function clearChart(reason) {
  state.candles = [];
  const ctx = el.chart.getContext("2d");
  const rect = el.chart.getBoundingClientRect();
  ctx.clearRect(0, 0, rect.width, rect.height);
  el.currentDate.textContent = "--";
  el.currentPrice.textContent = "--";
  el.rangeLabel.textContent = "データ未読込";
  updateRangeSliderWindow(0);
  el.chartHint.hidden = false;
  el.chartHint.textContent = reason || "データを読み込んでください";
}

function drawChart() {
  const canvas = el.chart;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = canvas.getBoundingClientRect();
  canvas.width = Math.round(rect.width * dpr);
  canvas.height = Math.round(rect.height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const w = rect.width;
  const h = rect.height;
  ctx.clearRect(0, 0, w, h);
  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, w, h);

  if (!state.candles.length) return;

  const pad = { top: 24, right: 72, bottom: 30, left: 58 };
  const labelY = h - 14;
  const volumeHeight = Math.max(120, Math.min(170, h * 0.24));
  const volumeBottom = h - 34;
  const volumeTop = volumeBottom - volumeHeight;
  const gap = 92;
  const priceBottom = volumeTop - gap;
  const nineTitleY = priceBottom + 18;
  const nineUpY = priceBottom + 44;
  const nineDownY = priceBottom + 67;
  const visibleStart = visibleStartIndex();
  const data = visibleCandles();
  const highs = data.map((c) => c.high);
  const lows = data.map((c) => c.low);
  const rawMax = Math.max(...highs) * 1.025;
  const rawMin = Math.min(...lows) * 0.975;
  const priceScale = buildPriceScale(rawMin, rawMax);
  const { min, max, ticks } = priceScale;
  const range = max - min || 1;
  const plotH = priceBottom - pad.top;
  const xStep = (w - pad.left - pad.right) / data.length;
  const y = (price) => pad.top + ((max - price) / range) * plotH;
  const x = (i) => pad.left + i * xStep + xStep / 2;

  ctx.strokeStyle = "#e5e7df";
  ctx.lineWidth = 1;
  ctx.fillStyle = "#68707b";
  ctx.font = "14px Meiryo, sans-serif";

  ticks.forEach((price) => {
    const yy = y(price);
    ctx.beginPath();
    ctx.moveTo(pad.left, yy);
    ctx.lineTo(w - pad.right, yy);
    ctx.stroke();
    ctx.fillText(price.toLocaleString("ja-JP"), w - pad.right + 8, yy + 4);
  });

  drawTimeMarkerLines(ctx, data, x, pad.top, volumeBottom);

  ctx.strokeStyle = "#c9cec6";
  ctx.beginPath();
  ctx.moveTo(pad.left, volumeTop - 6);
  ctx.lineTo(w - pad.right, volumeTop - 6);
  ctx.stroke();

  drawNineLawCounts(ctx, visibleStart, data.length, x, nineTitleY, nineUpY, nineDownY, xStep, pad.left);
  ctx.save();
  ctx.strokeStyle = "#e7ebf0";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(pad.left, priceBottom + 82);
  ctx.lineTo(w - pad.right, priceBottom + 82);
  ctx.stroke();
  ctx.restore();

  const maxVolume = Math.max(...data.map((c) => c.volume)) || 1;
  const volumeScale = buildVolumeScale(maxVolume);
  volumeScale.ticks.forEach((volume) => {
    const yy = volumeBottom - (volume / volumeScale.max) * volumeHeight;
    ctx.strokeStyle = "#eef0ea";
    ctx.beginPath();
    ctx.moveTo(pad.left, yy);
    ctx.lineTo(w - pad.right, yy);
    ctx.stroke();
    ctx.fillStyle = "#8a949e";
    ctx.fillText(formatVolume(volume), w - pad.right + 8, yy + 4);
  });
  data.forEach((c, i) => {
    const cx = x(i);
    const up = c.close >= c.open;
    const color = "#111820";
    const bodyTop = y(Math.max(c.open, c.close));
    const bodyBottom = y(Math.min(c.open, c.close));
    const bodyH = Math.max(2, bodyBottom - bodyTop);
    const bodyW = Math.max(3, xStep * 0.58);
    const volH = (c.volume / volumeScale.max) * volumeHeight;

    ctx.strokeStyle = color;
    ctx.beginPath();
    ctx.moveTo(cx, y(c.high));
    ctx.lineTo(cx, y(c.low));
    ctx.stroke();
    if (up) {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(cx - bodyW / 2, bodyTop, bodyW, bodyH);
      ctx.strokeRect(cx - bodyW / 2, bodyTop, bodyW, bodyH);
    } else {
      ctx.fillStyle = color;
      ctx.fillRect(cx - bodyW / 2, bodyTop, bodyW, bodyH);
    }

    ctx.fillStyle = up ? "#747d87" : "#111820";
    ctx.fillRect(cx - bodyW / 2, volumeBottom - volH, bodyW, volH);
  });

  const activeAverages = state.averages.filter((average) => average.enabled && average.period > 0);
  activeAverages.forEach((average) => {
    drawAverage(ctx, state.candles, visibleStart, data.length, average.period, average.color, x, y, average);
  });

  drawTradeMarkers(ctx, data, visibleStart, x, y, xStep, pad.top, priceBottom, pad.left, w - pad.right);

  activeAverages.forEach((average, index) => {
    ctx.fillStyle = average.color;
    ctx.fillText(`${average.period}${timeframeUnit()}`, pad.left + index * 56, 18);
  });

  const last = current();
  const lastY = y(last.close);
  ctx.strokeStyle = "#d11f1f";
  ctx.setLineDash([5, 4]);
  ctx.beginPath();
  ctx.moveTo(pad.left, lastY);
  ctx.lineTo(w - pad.right, lastY);
  ctx.stroke();
  ctx.setLineDash([]);
  drawCurrentPriceAxisLabel(ctx, Math.round(last.close), w - pad.right, lastY);

  drawTimeMarkerLabels(ctx, data, x, labelY);
  drawHoverPriceGuide(ctx, state.hoverPoint, data, visibleStart, pad, priceBottom, x, xStep, min, max, range, plotH, w);
}

function drawCurrentPriceAxisLabel(ctx, price, axisX, yPosition) {
  const label = price.toLocaleString("ja-JP");
  const paddingX = 7;
  const height = 22;
  ctx.save();
  ctx.font = "700 14px Meiryo, sans-serif";
  ctx.textBaseline = "middle";
  const width = Math.ceil(ctx.measureText(label).width) + paddingX * 2;
  const x = axisX + 6;
  const y = yPosition - height / 2;
  ctx.fillStyle = "#0b2755";
  ctx.fillRect(x, y, width, height);
  ctx.fillStyle = "#ffffff";
  ctx.fillText(label, x + paddingX, yPosition);
  ctx.restore();
}

function drawTradeMarkers(ctx, data, visibleStart, x, y, xStep, topY, bottomY, leftX, rightX) {
  if (!state.showTradeMarkers || !state.history.length || !data.length) return;
  const visibleDates = new Map(data.map((candle, index) => [candle.date, index]));
  const markersByIndex = new Map();
  state.history.forEach((trade) => {
    const index = visibleDates.get(trade.day);
    if (!Number.isInteger(index)) return;
    const marker = tradeMarkerStyle(trade.type || "");
    if (!marker) return;
    marker.price = Number(trade.price) || 0;
    marker.priceText = `${Math.round(marker.price).toLocaleString("ja-JP")}円`;
    const qtyLabel = (trade.type || "").includes("信用") || (trade.type || "").includes("返済") ? "建" : "株";
    marker.qtyText = `${qtyLabel} ${Math.round(Number(trade.qty) || 0).toLocaleString("ja-JP")}`;
    if (!markersByIndex.has(index)) markersByIndex.set(index, { upper: [], lower: [] });
    markersByIndex.get(index)[marker.position].push(marker);
  });

  if (!markersByIndex.size) return;

  ctx.save();
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  const occupiedRects = candleCollisionRects(data, x, y, xStep);
  const bearishBodyRects = bearishCandleBodyRects(data, x, y, xStep);
  markersByIndex.forEach((groups, index) => {
    const candle = data[index];
    const cx = x(index);
    const markerW = Math.max(58, Math.min(74, xStep * 1.7));
    const markerH = 40;
    const gap = 4;
    const clearance = 10;
    const highY = y(candle.high);
    const lowY = y(candle.low);
    groups.upper.forEach((marker, markerIndex) => {
      const position = markerPosition({
        cx,
        preferredY: highY - markerH / 2 - clearance - markerIndex * (markerH + gap),
        topY,
        bottomY,
        markerW,
        markerH,
        leftX,
        rightX,
        candleY: highY,
        direction: "upper",
        index: markerIndex,
        occupiedRects,
      });
      occupiedRects.push(position.rect);
      drawTradeMarkerConnector(ctx, marker, cx, y(marker.price || candle.close), position.cx, position.cy, markerW, markerH, bearishBodyRects);
      drawTradeMarkerLabel(ctx, marker, position.cx, position.cy, markerW, markerH);
    });
    groups.lower.forEach((marker, markerIndex) => {
      const position = markerPosition({
        cx,
        preferredY: lowY + markerH / 2 + clearance + markerIndex * (markerH + gap),
        topY,
        bottomY,
        markerW,
        markerH,
        leftX,
        rightX,
        candleY: lowY,
        direction: "lower",
        index: markerIndex,
        occupiedRects,
      });
      occupiedRects.push(position.rect);
      drawTradeMarkerConnector(ctx, marker, cx, y(marker.price || candle.close), position.cx, position.cy, markerW, markerH, bearishBodyRects);
      drawTradeMarkerLabel(ctx, marker, position.cx, position.cy, markerW, markerH);
    });
  });
  ctx.restore();
}

function candleCollisionRects(data, x, y, xStep) {
  const bodyW = Math.max(3, xStep * 0.58);
  return data.flatMap((candle, index) => {
    const cx = x(index);
    const bodyTop = y(Math.max(candle.open, candle.close));
    const bodyBottom = y(Math.min(candle.open, candle.close));
    return [
      {
        left: cx - 4,
        right: cx + 4,
        top: y(candle.high) - 4,
        bottom: y(candle.low) + 4,
      },
      {
        left: cx - bodyW / 2 - 5,
        right: cx + bodyW / 2 + 5,
        top: bodyTop - 5,
        bottom: bodyBottom + 5,
      },
    ];
  });
}

function bearishCandleBodyRects(data, x, y, xStep) {
  const bodyW = Math.max(3, xStep * 0.58);
  return data
    .filter((candle) => candle.close < candle.open)
    .map((candle) => {
      const cx = x(data.indexOf(candle));
      return {
        left: cx - bodyW / 2,
        right: cx + bodyW / 2,
        top: y(candle.open),
        bottom: y(candle.close),
      };
    });
}

function markerPosition({ cx, preferredY, topY, bottomY, markerW, markerH, leftX, rightX, candleY, direction, index, occupiedRects }) {
  const minY = topY + markerH / 2 + 2;
  const maxY = bottomY - markerH / 2 - 2;
  const verticalSign = direction === "upper" ? -1 : 1;
  const baseY = Math.max(minY, Math.min(maxY, preferredY));
  const candidateOffsets = [
    [1, 0],
    [-1, 0],
    [1, 1],
    [-1, 1],
    [1, 2],
    [-1, 2],
    [1, 3],
    [-1, 3],
    [1.75, 1],
    [-1.75, 1],
    [2.5, 2],
    [-2.5, 2],
  ];

  for (const [horizontalStep, verticalStep] of candidateOffsets) {
    const markerGapX = markerW * (0.72 + index * 0.12);
    const nextX = clamp(cx + markerGapX * horizontalStep, leftX + markerW / 2 + 2, rightX - markerW / 2 - 2);
    const nextY = clamp(baseY + verticalSign * verticalStep * (markerH + 8), minY, maxY);
    const rect = markerRect(nextX, nextY, markerW, markerH, 3);
    if (!occupiedRects.some((occupied) => rectsOverlap(rect, occupied))) {
      return { cx: nextX, cy: nextY, rect };
    }
  }

  const fallbackY = direction === "upper"
    ? clamp(candleY - markerH - 20 - index * (markerH + 8), minY, maxY)
    : clamp(candleY + markerH + 20 + index * (markerH + 8), minY, maxY);
  const fallbackX = clamp(cx + markerW * 1.15, leftX + markerW / 2 + 2, rightX - markerW / 2 - 2);
  const rect = markerRect(fallbackX, fallbackY, markerW, markerH, 3);
  return { cx: fallbackX, cy: fallbackY, rect };
}

function markerRect(cx, cy, width, height, padding = 0) {
  return {
    left: cx - width / 2 - padding,
    right: cx + width / 2 + padding,
    top: cy - height / 2 - padding,
    bottom: cy + height / 2 + padding,
  };
}

function rectsOverlap(a, b) {
  return a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top;
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function drawTradeMarkerConnector(ctx, marker, candleX, priceY, markerX, markerY, markerW, markerH, bearishBodyRects = []) {
  const fromX = candleX;
  const fromY = priceY;
  const markerLeft = markerX - markerW / 2;
  const markerRight = markerX + markerW / 2;
  const toX = markerX >= candleX ? markerLeft : markerRight;
  const toY = Math.max(markerY - markerH / 2 + 6, Math.min(markerY + markerH / 2 - 6, priceY));
  ctx.save();
  ctx.strokeStyle = marker.stroke;
  ctx.globalAlpha = 0.72;
  ctx.lineWidth = 1.25;
  ctx.setLineDash([2, 3]);
  ctx.beginPath();
  ctx.moveTo(fromX, fromY);
  ctx.lineTo(toX, toY);
  ctx.stroke();
  ctx.restore();

  bearishBodyRects.forEach((rect) => {
    const segment = lineRectSegment(fromX, fromY, toX, toY, rect);
    if (!segment) return;
    ctx.save();
    ctx.strokeStyle = "#ffffff";
    ctx.globalAlpha = 0.98;
    ctx.lineWidth = 1.6;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(segment.x1, segment.y1);
    ctx.lineTo(segment.x2, segment.y2);
    ctx.stroke();
    ctx.restore();
  });
}

function lineRectSegment(x1, y1, x2, y2, rect) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  const tests = [
    [-dx, x1 - rect.left],
    [dx, rect.right - x1],
    [-dy, y1 - rect.top],
    [dy, rect.bottom - y1],
  ];

  for (const [p, q] of tests) {
    if (p === 0) {
      if (q < 0) return null;
      continue;
    }
    const r = q / p;
    if (p < 0) {
      if (r > t1) return null;
      if (r > t0) t0 = r;
    } else {
      if (r < t0) return null;
      if (r < t1) t1 = r;
    }
  }

  if (t1 <= t0) return null;
  return {
    x1: x1 + dx * t0,
    y1: y1 + dy * t0,
    x2: x1 + dx * t1,
    y2: y1 + dy * t1,
  };
}

function tradeMarkerStyle(type) {
  if (type.includes("現物買")) return { label: "買", fill: "#ffffff", stroke: "#d33f3f", textColor: "#d33f3f", position: "lower" };
  if (type.includes("現物売")) return { label: "売", fill: "#ffffff", stroke: "#2768b7", textColor: "#2768b7", position: "upper" };
  if (type.includes("信用売")) return { label: "新規売", fill: "#ffffff", stroke: "#5c80bd", textColor: "#5c80bd", position: "upper" };
  if (type.includes("返済買")) return { label: "返済買", fill: "#ffffff", stroke: "#d86a61", textColor: "#d86a61", position: "lower" };
  return null;
}

function drawTradeMarkerLabel(ctx, marker, cx, cy, width, height) {
  const x = cx - width / 2;
  const y = cy - height / 2;
  ctx.fillStyle = marker.fill;
  ctx.strokeStyle = marker.stroke;
  ctx.lineWidth = 1.4;
  drawRoundedRect(ctx, x, y, width, height, 4);
  ctx.fill();
  ctx.stroke();
  drawTradeMarkerText(ctx, marker.label, cx, cy - 11, "700 10px Meiryo, sans-serif", marker);
  drawTradeMarkerText(ctx, marker.priceText || "", cx, cy + 1, "700 9px Meiryo, sans-serif", marker);
  drawTradeMarkerText(ctx, marker.qtyText || "", cx, cy + 12, "700 9px Meiryo, sans-serif", marker);
}

function drawTradeMarkerText(ctx, text, x, y, font, marker) {
  if (!text) return;
  ctx.font = font;
  ctx.fillStyle = marker.textColor;
  ctx.fillText(text, x, y);
}

function drawHoverPriceGuide(ctx, hoverPoint, data, visibleStart, pad, priceBottom, x, xStep, min, max, range, plotH, width) {
  if (!hoverPoint || !data.length) return;
  const chartLeft = pad.left;
  const chartRight = width - pad.right;
  const chartTop = pad.top;
  const chartBottom = priceBottom;
  if (hoverPoint.x < chartLeft || hoverPoint.x > chartRight || hoverPoint.y < chartTop || hoverPoint.y > chartBottom) return;

  const index = Math.max(0, Math.min(data.length - 1, Math.floor((hoverPoint.x - chartLeft) / xStep)));
  const verticalX = x(index);
  const price = max - ((hoverPoint.y - chartTop) / plotH) * range;
  const priceLabel = `${Math.round(Math.max(min, Math.min(max, price))).toLocaleString("ja-JP")}円`;
  const dateLabel = data[index].date;
  const nineLaw = hoverNineLawLabel(visibleStart + index);
  const volumeLabel = `出来高 ${formatHoverVolume(data[index].volume)}万株`;
  const labels = [
    { text: dateLabel, color: "#0b2755" },
    { text: priceLabel, color: "#0b2755" },
    nineLaw || { text: "ー", color: "#0b2755" },
    { text: volumeLabel, color: "#0b2755" },
  ];

  ctx.save();
  ctx.strokeStyle = "rgba(24, 74, 145, 0.68)";
  ctx.lineWidth = 1.4;
  ctx.setLineDash([3, 4]);
  ctx.beginPath();
  ctx.moveTo(chartLeft, hoverPoint.y);
  ctx.lineTo(chartRight, hoverPoint.y);
  ctx.moveTo(verticalX, chartTop);
  ctx.lineTo(verticalX, chartBottom);
  ctx.stroke();
  ctx.setLineDash([]);

  ctx.font = "700 13px Meiryo, sans-serif";
  ctx.textBaseline = "top";
  const paddingX = 8;
  const lineHeight = 18;
  const boxWidth = Math.max(...labels.map((label) => ctx.measureText(label.text).width)) + paddingX * 2;
  const boxHeight = lineHeight * labels.length + 8;
  let boxX = hoverPoint.x + 22;
  let boxY = hoverPoint.y + 12;
  if (boxX + boxWidth > chartRight) boxX = hoverPoint.x - boxWidth - 18;
  if (boxY + boxHeight > chartBottom) boxY = hoverPoint.y - boxHeight - 12;
  boxX = Math.max(chartLeft + 4, boxX);
  boxY = Math.max(chartTop + 4, boxY);

  ctx.fillStyle = "rgba(255, 255, 255, 0.94)";
  ctx.strokeStyle = "#9fb0c4";
  ctx.lineWidth = 1;
  ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
  ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);
  labels.forEach((label, lineIndex) => {
    ctx.fillStyle = label.color;
    ctx.fillText(label.text, boxX + paddingX, boxY + 5 + lineHeight * lineIndex);
  });
  ctx.restore();
}

function hoverNineLawLabel(globalIndex) {
  const counts = nineLawCounts(state.candles.slice(0, state.index + 1));
  const count = counts[globalIndex];
  if (!count) return null;
  if (count.up) return { text: `＋上昇 ${count.up}日目`, color: "#d11f1f" };
  if (count.down) return { text: `▲下落 ${count.down}日目`, color: "#1f5fbf" };
  return null;
}

function formatHoverVolume(volume) {
  const value = Number(volume) || 0;
  return (value / 10_000).toLocaleString("ja-JP", { maximumFractionDigits: 1 });
}

function drawTimeMarkerLines(ctx, data, x, topY, bottomY) {
  data.forEach((candle, index) => {
    if (!shouldDrawTimeMarker(data, index)) return;
    const labelX = x(index);
    ctx.strokeStyle = "#c9cec6";
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(labelX, topY);
    ctx.lineTo(labelX, bottomY);
    ctx.stroke();
    ctx.setLineDash([]);
  });
}

function drawTimeMarkerLabels(ctx, data, x, labelY) {
  ctx.fillStyle = "#20242a";
  ctx.font = "14px Meiryo, sans-serif";
  data.forEach((candle, index) => {
    if (!shouldDrawTimeMarker(data, index)) return;
    const labelX = x(index);
    const label = formatTimeMarkerLabel(data, index);
    ctx.fillStyle = "#20242a";
    ctx.fillText(label, labelX - (label.length > 3 ? 20 : 8), labelY);
  });
}

function drawNineLawCounts(ctx, visibleStart, length, x, titleY, upY, downY, xStep, leftX) {
  const counts = nineLawCounts(state.candles.slice(0, state.index + 1));
  const styles = nineLawStyles(counts);
  const labelSize = trendCountLabelSize(length, xStep);
  ctx.save();
  ctx.font = `700 ${labelSize.font}px Meiryo, sans-serif`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = "#0b2755";
  ctx.textAlign = "left";
  ctx.fillText("9の法則", leftX, titleY);
  ctx.textAlign = "center";
  for (let i = 0; i < length; i += 1) {
    const trend = counts[visibleStart + i];
    const style = styles[visibleStart + i];
    if (!trend) continue;
    if (trend.up) {
      const alternateUp = style.up === "connected";
      drawTrendCountLabel(ctx, String(trend.up), x(i), upY, {
        framed: trend.caution,
        rounded: false,
        text: trend.caution ? "#c40000" : "#ffffff",
        fill: trend.caution ? "#fff04a" : "#d62424",
        alternateFill: trend.caution ? "#fff04a" : "#e56d6d",
        stroke: "#111820",
        strokeWidth: 2.5,
        emphasis: trend.caution,
        alternate: alternateUp,
        minWidth: labelSize.minWidth,
        padding: labelSize.padding,
        height: labelSize.height,
      });
    }
    if (trend.down) {
      const connectedDown = style.down === "connected";
      drawTrendCountLabel(ctx, String(trend.down), x(i), downY, {
        framed: trend.caution,
        rounded: false,
        text: trend.caution ? "#004fc4" : "#ffffff",
        fill: trend.caution ? "#fff04a" : "#1f5fbf",
        alternateFill: trend.caution ? "#fff04a" : "#6f9ee0",
        stroke: "#111820",
        strokeWidth: 2.5,
        emphasis: trend.caution,
        alternate: connectedDown,
        minWidth: labelSize.minWidth,
        padding: labelSize.padding,
        height: labelSize.height,
      });
    }
  }
  ctx.restore();
}

function trendCountLabelSize(length, xStep) {
  if (length >= 115 || xStep < 8.5) {
    return { font: 12, minWidth: 9, padding: 1, height: 13 };
  }
  if (length >= 85 || xStep < 12) {
    return { font: 14, minWidth: 11, padding: 1, height: 15 };
  }
  return { font: 17, minWidth: 14, padding: 2, height: 18 };
}

function drawTrendCountLabel(ctx, text, cx, cy, style) {
  const metrics = ctx.measureText(text);
  const emphasisBoost = style.emphasis ? 4 : 0;
  const size = Math.max(style.height, style.minWidth, metrics.width + style.padding) + emphasisBoost;
  const width = size;
  const height = size;
  ctx.fillStyle = style.alternate ? style.alternateFill : style.fill;
  if (style.rounded) {
    drawRoundedRect(ctx, cx - width / 2, cy - height / 2, width, height, height / 2);
    ctx.fill();
  } else {
    ctx.fillRect(cx - width / 2, cy - height / 2, width, height);
  }
  if (style.framed) {
    ctx.strokeStyle = style.stroke;
    ctx.lineWidth = style.strokeWidth || 1;
    if (style.rounded) {
      drawRoundedRect(ctx, cx - width / 2, cy - height / 2, width, height, height / 2);
      ctx.stroke();
    } else {
      ctx.strokeRect(cx - width / 2, cy - height / 2, width, height);
    }
    ctx.lineWidth = 1;
  }
  ctx.fillStyle = style.text;
  ctx.fillText(text, cx, cy + 0.5);
}

function drawRoundedRect(ctx, x, y, width, height, radius) {
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + width - radius, y);
  ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
  ctx.lineTo(x + width, y + height - radius);
  ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
  ctx.lineTo(x + radius, y + height);
  ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function closeTrendCounts(candles) {
  let direction = 0;
  let count = 0;
  let upGroup = 0;
  let downGroup = 0;
  const counts = candles.map(() => ({ up: 0, down: 0, upGroup: 0, downGroup: 0 }));

  candles.forEach((candle, index) => {
    if (index === 0) return;
    const previous = candles[index - 1];
    const nextDirection = candle.close > previous.close ? 1 : candle.close < previous.close ? -1 : 0;
    if (nextDirection === 0) {
      direction = 0;
      count = 0;
      return;
    }

    if (nextDirection !== direction) {
      if (nextDirection > 0) upGroup += 1;
      if (nextDirection < 0) downGroup += 1;
      count = 1;
      if (nextDirection > 0 && !counts[index - 1].up) {
        counts[index - 1].up = 1;
        counts[index - 1].upGroup = upGroup;
      }
      if (nextDirection < 0 && !counts[index - 1].down) {
        counts[index - 1].down = 1;
        counts[index - 1].downGroup = downGroup;
      }
    } else {
      count += 1;
    }

    direction = nextDirection;
    const displayCount = count + 1;
    if (direction > 0) {
      counts[index].up = displayCount;
      counts[index].upGroup = upGroup;
    }
    if (direction < 0) {
      counts[index].down = displayCount;
      counts[index].downGroup = downGroup;
    }
  });

  return counts;
}

function nineLawStyles(counts) {
  const styles = counts.map(() => ({ up: "normal", down: "normal" }));
  let upStyle = "normal";
  let downStyle = "normal";

  counts.forEach((trend, index) => {
    if (trend.up) {
      if (trend.up === 1) {
        upStyle = counts[index - 1]?.up ? "connected" : "normal";
      }
      styles[index].up = upStyle;
    } else {
      upStyle = "normal";
    }

    if (trend.down) {
      if (trend.down === 1) {
        downStyle = counts[index - 1]?.down ? "connected" : "normal";
      }
      styles[index].down = downStyle;
    } else {
      downStyle = "normal";
    }
  });

  return styles;
}

function movingAverageAt(candles, index, period) {
  if (index < period - 1) return NaN;
  let total = 0;
  for (let i = index - period + 1; i <= index; i += 1) {
    total += candles[i].close;
  }
  return total / period;
}

function nineLawCounts(candles) {
  const counts = candles.map(() => ({ up: 0, down: 0, upGroup: 0, downGroup: 0, caution: false }));
  let direction = 0;
  let currentCount = 0;
  let upGroup = 0;
  let downGroup = 0;
  const isCaution = (count) => count === 8 || count === 9 || count === 17 || count === 23;

  const setCount = (index, side, count, group) => {
    if (index < 0 || index >= counts.length) return;
    if (side > 0) {
      counts[index].up = count;
      counts[index].down = 0;
      counts[index].upGroup = group;
    } else {
      counts[index].down = count;
      counts[index].up = 0;
      counts[index].downGroup = group;
    }
    counts[index].caution = isCaution(count);
  };

  const startsUpAt = (index) =>
    index >= 2 &&
    candles[index - 1].close > candles[index - 2].close &&
    candles[index].close > candles[index - 1].close;

  const startsDownAt = (index) =>
    index >= 2 &&
    candles[index - 1].close < candles[index - 2].close &&
    candles[index].close < candles[index - 1].close;

  for (let index = 1; index < candles.length; index += 1) {
    const close = candles[index].close;
    const previousClose = candles[index - 1].close;
    const ma5 = movingAverageAt(candles, index, 5);

    if (direction > 0) {
      const continues = close > previousClose || (close <= previousClose && Number.isFinite(ma5) && close > ma5);
      if (continues) {
        currentCount += 1;
        setCount(index, 1, currentCount, upGroup);
        continue;
      }
      direction = 0;
      currentCount = 0;
    }

    if (direction < 0) {
      const continues = close < previousClose || (close >= previousClose && Number.isFinite(ma5) && close < ma5);
      if (continues) {
        currentCount += 1;
        setCount(index, -1, currentCount, downGroup);
        continue;
      }
      direction = 0;
      currentCount = 0;
    }

    if (startsUpAt(index)) {
      direction = 1;
      currentCount = 3;
      upGroup += 1;
      for (let offset = 2; offset >= 0; offset -= 1) {
        setCount(index - offset, 1, 3 - offset, upGroup);
      }
      continue;
    }

    if (startsDownAt(index)) {
      direction = -1;
      currentCount = 3;
      downGroup += 1;
      for (let offset = 2; offset >= 0; offset -= 1) {
        setCount(index - offset, -1, 3 - offset, downGroup);
      }
    }
  }

  return counts;
}

function shouldDrawTimeMarker(data, index) {
  const candle = data[index];
  const previous = data[index - 1];
  const isFirst = index === 0;
  const isNewMonth = isFirst || candle.dateKey.slice(0, 7) !== previous.dateKey.slice(0, 7);
  if (!isNewMonth) return false;

  if (state.timeframe === "1d") return true;

  const month = Number(candle.dateKey.slice(5, 7));
  return isFirst || month === 1 || month === 4 || month === 7 || month === 10;
}

function formatTimeMarkerLabel(data, index) {
  const candle = data[index];
  const year = candle.dateKey.slice(0, 4);
  const month = candle.dateKey.slice(5, 7);
  const previous = data[index - 1];
  const isFirst = index === 0;
  const isNewYear = !previous || year !== previous.dateKey.slice(0, 4);
  return isFirst || isNewYear || month === "01" ? `${year}/${month}` : month;
}

function buildPriceScale(rawMin, rawMax) {
  const range = Math.max(1, rawMax - rawMin);
  const roughStep = range / 5;
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  let niceMultiplier = 1;
  if (normalized > 5) niceMultiplier = 10;
  else if (normalized > 2) niceMultiplier = 5;
  else if (normalized > 1) niceMultiplier = 2;
  const step = niceMultiplier * magnitude;
  const min = Math.floor(rawMin / step) * step;
  const max = Math.ceil(rawMax / step) * step;
  const ticks = [];
  for (let price = max; price >= min; price -= step) {
    ticks.push(Math.round(price));
  }
  return { min, max, ticks };
}

function buildVolumeScale(rawMax) {
  const roughStep = Math.max(1, rawMax / 2);
  const magnitude = 10 ** Math.floor(Math.log10(roughStep));
  const normalized = roughStep / magnitude;
  let niceMultiplier = 1;
  if (normalized > 5) niceMultiplier = 10;
  else if (normalized > 2) niceMultiplier = 5;
  else if (normalized > 1) niceMultiplier = 2;
  const step = niceMultiplier * magnitude;
  const max = Math.ceil(rawMax / step) * step;
  return { max, ticks: [max, max / 2, 0] };
}

function formatVolume(value) {
  if (value >= 100_000_000) return `${(value / 100_000_000).toLocaleString("ja-JP", { maximumFractionDigits: 1 })}億`;
  if (value >= 10_000) return `${Math.round(value / 10_000).toLocaleString("ja-JP")}万`;
  return Math.round(value).toLocaleString("ja-JP");
}

function drawAverage(ctx, allData, visibleStart, visibleCount, span, color, x, y, options = {}) {
  if (!Number.isFinite(span) || span <= 0) return;
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = options.lineWidth || 2;
  ctx.setLineDash(options.lineDash || []);
  ctx.lineCap = options.lineDash?.length ? "round" : "butt";
  ctx.beginPath();
  let started = false;
  for (let visibleIndex = 0; visibleIndex < visibleCount; visibleIndex += 1) {
    const absoluteIndex = visibleStart + visibleIndex;
    if (absoluteIndex + 1 < span) continue;
    const slice = allData.slice(absoluteIndex + 1 - span, absoluteIndex + 1);
    const avg = slice.reduce((sum, c) => sum + c.close, 0) / span;
    if (!started) {
      ctx.moveTo(x(visibleIndex), y(avg));
      started = true;
    } else {
      ctx.lineTo(x(visibleIndex), y(avg));
    }
  }
  ctx.stroke();
  ctx.restore();
}

function syncAverageSettings() {
  state.averages = state.averages.map((average, index) => ({
    ...average,
    enabled: Boolean(el.maEnabled[index]?.checked),
    period: Math.max(1, Math.min(300, Number(el.maPeriods[index]?.value) || average.period)),
    color: el.maColors[index]?.value || average.color,
  }));
}

function applyTimeframeAverageDefaults(timeframe, options = {}) {
  const periods = DEFAULT_AVERAGE_PERIODS[timeframe] || DEFAULT_AVERAGE_PERIODS["1d"];
  state.timeframe = timeframe;
  state.averages = state.averages.map((average, index) => ({
    ...average,
    enabled: index < periods.length,
    period: periods[index] ?? average.period,
  }));
  state.averages.forEach((average, index) => {
    if (el.maEnabled[index]) el.maEnabled[index].checked = average.enabled;
    if (el.maPeriods[index]) el.maPeriods[index].value = String(average.period);
  });
  if (options.update !== false) update();
}

function quantity() {
  const value = parseNumberInput(el.quantity.value);
  return Number.isFinite(value) && value > 0 ? Math.max(100, Math.floor(value / 100) * 100) : 100;
}

function adjustQuantity(delta) {
  const nextQuantity = Math.max(100, quantity() + delta);
  el.quantity.value = nextQuantity.toLocaleString("ja-JP");
  updateOrderValue();
}

function parseNumberInput(value) {
  const parsed = Number(String(value || "").replace(/,/g, "").trim());
  return Number.isFinite(parsed) ? parsed : 0;
}

function formatNumberInput(input) {
  const raw = String(input.value || "").replace(/[^\d]/g, "");
  input.value = raw ? Number(raw).toLocaleString("ja-JP") : "";
}

function updateOrderValue() {
  if (!el.orderValue) return;
  if (!state.candles.length) {
    el.orderValue.textContent = "--";
    return;
  }
  el.orderValue.textContent = yenText(current().close * quantity());
}

function setMessage(text, tone = "") {
  el.message.textContent = text;
  el.message.className = `message ${tone}`;
  el.message.hidden = !text;
}

function updateTradeMarkerToggle() {
  if (!el.toggleTradeMarkers) return;
  el.toggleTradeMarkers.textContent = state.showTradeMarkers ? "売買マーカー 表示" : "売買マーカー 非表示";
  el.toggleTradeMarkers.setAttribute("aria-pressed", String(state.showTradeMarkers));
}

function toggleTradeMarkers() {
  state.showTradeMarkers = !state.showTradeMarkers;
  updateTradeMarkerToggle();
  drawChart();
}

function chartImageFileName() {
  const code = displaySymbol(state.symbol) || "chart";
  const name = displayCompanyName(state.symbol, state.companyName) || code;
  const date = state.candles.length ? current().dateKey : new Date().toISOString().slice(0, 10);
  return `${name}_${timeframeLabel()}_${date}.jpg`.replace(/[\\/:*?"<>|]/g, "-");
}

function canvasBlob(canvas, type = "image/jpeg", quality = 0.97) {
  return new Promise((resolve) => canvas.toBlob(resolve, type, quality));
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;
  link.click();
  URL.revokeObjectURL(url);
}

async function writeChartImage(blob, fileName, options = {}) {
  const pickerTypes = options.types || [
    {
      description: "PNG画像",
      accept: { "image/jpeg": [".jpg", ".jpeg"] },
    },
  ];
  if (window.showSaveFilePicker) {
    const handle = await window.showSaveFilePicker({
      suggestedName: fileName,
      types: pickerTypes,
    });
    const writable = await handle.createWritable();
    await writable.write(blob);
    await writable.close();
    return;
  }
  downloadBlob(blob, fileName);
}

async function chooseSaveFile(fileName, options = {}) {
  if (!window.showSaveFilePicker) return null;
  const pickerTypes = options.types || [
    {
      description: "PNG画像",
      accept: { "image/jpeg": [".jpg", ".jpeg"] },
    },
  ];
  return window.showSaveFilePicker({
    suggestedName: fileName,
    types: pickerTypes,
  });
}

async function writeBlobToHandle(handle, blob) {
  const writable = await handle.createWritable();
  await writable.write(blob);
  await writable.close();
}

function chartExportCanvas(options = {}) {
  const includeTitle = options.includeTitle !== false;
  const includeFooter = options.includeFooter ?? includeTitle;
  const sourceRect = el.chart.getBoundingClientRect();
  const scale = 2;
  const padding = 18;
  const headerHeight = includeTitle ? 22 : 0;
  const footerGap = includeFooter ? 5 : 0;
  const footerHeight = includeFooter ? 76 : 0;
  const width = Math.round(sourceRect.width + padding * 2);
  const height = Math.round(headerHeight + sourceRect.height + footerGap + footerHeight + padding * 2);
  const exportCanvas = document.createElement("canvas");
  exportCanvas.width = width * scale;
  exportCanvas.height = height * scale;
  const ctx = exportCanvas.getContext("2d");
  ctx.setTransform(scale, 0, 0, scale, 0, 0);

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, width, height);

  const metadata = includeTitle || includeFooter ? pdfChartMetadata() : null;
  if (includeTitle) {
    const chartTitle = `${metadata?.companyName || "ー"}（${metadata?.symbol || "ー"}）`;
    ctx.fillStyle = "#0b2755";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.font = "11px Meiryo, sans-serif";
    ctx.fillText(chartTitle, padding, padding);
  }

  const chartX = padding;
  const chartY = padding + headerHeight;
  ctx.strokeStyle = "#d8e0ec";
  ctx.lineWidth = 1;
  ctx.strokeRect(chartX - 0.5, chartY - 0.5, sourceRect.width + 1, sourceRect.height + 1);
  ctx.drawImage(el.chart, chartX, chartY, sourceRect.width, sourceRect.height);

  if (includeFooter) {
    const footerTop = chartY + sourceRect.height + footerGap;
    const footerRows = chartFooterRows(metadata, "001");
    const columnWidth = sourceRect.width / 4;
    const rowHeight = footerHeight / 4;

    ctx.strokeStyle = "#d8e0ec";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let rowIndex = 0; rowIndex < 4; rowIndex += 1) {
      const lineY = footerTop + rowHeight * rowIndex + 0.5;
      ctx.moveTo(chartX, lineY);
      ctx.lineTo(chartX + sourceRect.width, lineY);
    }
    for (let columnIndex = 1; columnIndex < 4; columnIndex += 1) {
      const lineX = chartX + columnWidth * columnIndex + 0.5;
      ctx.moveTo(lineX, footerTop);
      ctx.lineTo(lineX, footerTop + footerHeight);
    }
    ctx.stroke();

    ctx.fillStyle = "#0b2755";
    ctx.font = "11px Meiryo, sans-serif";
    ctx.textAlign = "left";
    ctx.textBaseline = "middle";
    footerRows.forEach((row, rowIndex) => {
      row.forEach((line, columnIndex) => {
        const textX = chartX + columnWidth * columnIndex + 5;
        const textY = footerTop + rowHeight * rowIndex + rowHeight / 2;
        ctx.fillText(line, textX, textY, columnWidth - 10);
      });
    });
  }
  return exportCanvas;
}

async function saveChartImage() {
  if (!state.candles.length) {
    setMessage("先に株価チャートを表示してください。", "down");
    return;
  }
  drawChart();
  const blob = await canvasBlob(chartExportCanvas());
  if (!blob) {
    setMessage("チャート画像を作成できませんでした。", "down");
    return;
  }
  const fileName = chartImageFileName();

  try {
    await writeChartImage(blob, fileName);
    setMessage("表示中の株価チャート画像を保存しました。", "up");
  } catch (error) {
    if (error?.name !== "AbortError") {
      setMessage("チャート画像を保存できませんでした。", "down");
    }
  }
}

async function analyzeChartInChatGPT() {
  if (!state.candles.length) {
    setMessage("先に株価チャートを表示してください。", "down");
    return;
  }
  drawChart();
  const blob = await canvasBlob(chartExportCanvas());
  if (!blob) {
    setMessage("チャート画像を作成できませんでした。", "down");
    return;
  }

  try {
    if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
      setMessage("このブラウザでは画像のクリップボードコピーに対応していません。通常の保存ボタンを使ってください。", "down");
      return;
    }
    try {
      await navigator.clipboard.write([new ClipboardItem({ "image/jpeg": blob })]);
    } catch (jpegError) {
      const pngBlob = await canvasBlob(chartExportCanvas(), "image/png");
      if (!pngBlob) throw jpegError;
      await navigator.clipboard.write([new ClipboardItem({ "image/png": pngBlob })]);
    }
    setMessage("表示中の株価チャート画像をクリップボードへコピーしました。ChatGPTの入力欄に貼り付けてください。", "up");
  } catch (error) {
    setMessage("画像をクリップボードへコピーできませんでした。通常の保存ボタンを使ってください。", "down");
  }
}

function snapshotAppState() {
  return {
    state: {
      candles: state.candles,
      symbol: state.symbol,
      timeframe: state.timeframe,
      companyName: state.companyName,
      symbolSearchResults: state.symbolSearchResults,
      source: state.source,
      index: state.index,
      windowSize: state.windowSize,
      hoverPoint: state.hoverPoint,
      initialCash: state.initialCash,
      cash: state.cash,
      realizedSpot: state.realizedSpot,
      realizedShort: state.realizedShort,
      holdings: state.holdings,
      holdingCost: state.holdingCost,
      shortQty: state.shortQty,
      shortAvg: state.shortAvg,
      history: state.history,
      showTradeMarkers: state.showTradeMarkers,
      watchlist: state.watchlist,
      averages: state.averages.map((average) => ({ ...average })),
    },
    fields: {
      symbolInput: el.symbolInput.value,
      timeframe: el.timeframe.value,
      windowSize: el.windowSize.value,
      startDate: el.startDate.value,
      rangeStart: el.rangeStart.value,
      chartTitle: el.chartTitle.textContent,
      companyName: el.companyName.textContent,
      dataPeriod: el.dataPeriod.textContent,
      dataSource: el.dataSource.textContent,
      currentDate: el.currentDate.textContent,
      currentPrice: el.currentPrice.textContent,
      rangeLabel: el.rangeLabel.textContent,
      sliderStartLabel: el.sliderStartLabel.textContent,
      sliderEndLabel: el.sliderEndLabel.textContent,
      message: el.message.textContent,
      messageClass: el.message.className,
    },
  };
}

function restoreAppState(snapshot) {
  Object.assign(state, snapshot.state);
  el.symbolInput.value = snapshot.fields.symbolInput;
  el.timeframe.value = snapshot.fields.timeframe;
  el.windowSize.value = snapshot.fields.windowSize;
  el.startDate.value = snapshot.fields.startDate;
  el.rangeStart.value = snapshot.fields.rangeStart;
  el.chartTitle.textContent = snapshot.fields.chartTitle;
  el.companyName.textContent = snapshot.fields.companyName;
  el.dataPeriod.textContent = snapshot.fields.dataPeriod;
  el.dataSource.textContent = snapshot.fields.dataSource;
  el.currentDate.textContent = snapshot.fields.currentDate;
  el.currentPrice.textContent = snapshot.fields.currentPrice;
  el.rangeLabel.textContent = snapshot.fields.rangeLabel;
  el.sliderStartLabel.textContent = snapshot.fields.sliderStartLabel;
  el.sliderEndLabel.textContent = snapshot.fields.sliderEndLabel;
  el.message.textContent = snapshot.fields.message;
  el.message.className = snapshot.fields.messageClass;
  state.averages.forEach((average, index) => {
    if (el.maEnabled[index]) el.maEnabled[index].checked = average.enabled;
    if (el.maPeriods[index]) el.maPeriods[index].value = String(average.period);
    if (el.maColors[index]) el.maColors[index].value = average.color;
  });
  drawChart();
  renderStats();
  renderWatchlist();
  updateTradeMarkerToggle();
}

function judgeLowerBodyForPdf(candles, index) {
  if (!Array.isArray(candles) || index < 1 || index >= candles.length) return "データ不足";
  const candle = candles[index];
  const open = Number(candle?.open);
  const close = Number(candle?.close);
  const ma5 = movingAverageAt(candles, index, 5);
  const ma5Previous = movingAverageAt(candles, index - 1, 5);
  if (![open, close, ma5, ma5Previous].every(Number.isFinite)) return "データ不足";

  const bodyMiddle = (open + close) / 2;
  if (close > open && close > ma5) {
    if (bodyMiddle >= ma5 && ma5 >= ma5Previous) return "下半身あり";
    return "下半身気味";
  }
  if (close < open && close < ma5) {
    if (bodyMiddle <= ma5 && ma5 <= ma5Previous) return "逆下半身あり";
    return "逆下半身気味";
  }
  return "なし";
}

function judgePppForPdf(candles, index) {
  if (!Array.isArray(candles) || index < 0 || index >= candles.length) return "データ不足";
  const close = Number(candles[index]?.close);
  const ma5 = movingAverageAt(candles, index, 5);
  const ma20 = movingAverageAt(candles, index, 20);
  const ma60 = movingAverageAt(candles, index, 60);
  const ma100 = movingAverageAt(candles, index, 100);
  if (![close, ma5, ma20, ma60, ma100].every(Number.isFinite)) return "データ不足";
  if (close > ma5 && ma5 > ma20 && ma20 > ma60 && ma60 > ma100) return "PPP";
  if (close < ma5 && ma5 < ma20 && ma20 < ma60 && ma60 < ma100) return "逆PPP";
  return "NON";
}

function judgeNineLawForPdf(candles, index) {
  if (!Array.isArray(candles) || candles.length < 6 || index < 5 || index >= candles.length) {
    return "データ不足";
  }
  const close = Number(candles[index]?.close);
  const ma5 = movingAverageAt(candles, index, 5);
  const ma5Previous = movingAverageAt(candles, index - 1, 5);
  if (![close, ma5, ma5Previous].every(Number.isFinite) || ma5 === 0 || ma5Previous === 0) {
    return "データ不足";
  }

  const count = nineLawCounts(candles.slice(0, index + 1))[index];
  if (count?.up) return `上昇${count.up}本目`;
  if (count?.down) return `下落${count.down}本目`;

  const tolerance = 0.003;
  const closeNearMa5 = Math.abs(close - ma5) / Math.abs(ma5) <= tolerance;
  const ma5Flat = Math.abs(ma5 - ma5Previous) / Math.abs(ma5Previous) <= tolerance;
  if (closeNearMa5 && ma5Flat) return "横ばい";

  const ma20 = movingAverageAt(candles, index, 20);
  const ma20Previous = movingAverageAt(candles, index - 1, 20);
  if ([ma20, ma20Previous].every(Number.isFinite)) {
    const broaderUptrend = ma20 >= ma20Previous;
    const broaderDowntrend = ma20 <= ma20Previous;
    const isPullback = broaderUptrend && close <= ma5 && (ma5 > ma20 || close > ma20);
    const isRebound = broaderDowntrend && close >= ma5 && (ma5 < ma20 || close < ma20);
    if (isPullback) return "押し目中";
    if (isRebound) return "戻り中";
  }

  const hasUpDirection = close > ma5 && ma5 >= ma5Previous;
  const hasDownDirection = close < ma5 && ma5 <= ma5Previous;
  if (hasUpDirection) return "上昇中・起点不明";
  if (hasDownDirection) return "下落中・起点不明";
  if (closeNearMa5 || ma5Flat) return "横ばい";
  return "カウント困難";
}

function formatPdfPrice(value) {
  const number = Number(value);
  return Number.isFinite(number)
    ? `${number.toLocaleString("ja-JP", { maximumFractionDigits: 1 })}円`
    : "データ不足";
}

function pdfChartMetadata() {
  const candle = current();
  const close = Number(candle?.close);
  const ma100 = movingAverageAt(state.candles, state.index, 100);
  const unit = timeframeUnit();
  const movingAverages = state.averages.slice(0, 4).map((average) => {
    const value = movingAverageAt(state.candles, state.index, average.period);
    return {
      label: `${average.period}${unit}線`,
      value: !average.enabled
        ? "非表示"
        : Number.isFinite(value)
          ? `${value.toLocaleString("ja-JP", { maximumFractionDigits: 1 })}円`
          : "データ不足",
    };
  });
  let pricePosition = "データ不足";
  if (Number.isFinite(close) && Number.isFinite(ma100) && ma100 > 0) {
    const differenceRate = (close - ma100) / ma100;
    pricePosition = `100${unit}線付近`;
    if (differenceRate > 0.005) pricePosition = `100${unit}線上`;
    if (differenceRate < -0.005) pricePosition = `100${unit}線下`;
  }

  return {
    symbol: displaySymbol(state.symbol),
    companyName: cleanCompanyName(state.companyName)
      .replace(/[（(]株[）)]/g, "")
      .replace(/株式会社/g, "")
      .trim(),
    timeframe: timeframeLabel(),
    date: String(candle?.dateKey || "").replaceAll("-", "/"),
    open: formatPdfPrice(candle?.open),
    high: formatPdfPrice(candle?.high),
    low: formatPdfPrice(candle?.low),
    close: formatPdfPrice(candle?.close),
    pricePosition,
    ppp: judgePppForPdf(state.candles, state.index),
    lowerBody: judgeLowerBodyForPdf(state.candles, state.index),
    nineLaw: judgeNineLawForPdf(state.candles, state.index),
    movingAverages,
  };
}

function chartFooterRows(metadata, pageNumber) {
  const averageItems = Array.isArray(metadata?.movingAverages)
    ? metadata.movingAverages.slice(0, 4).map((average) => `${average.label}：${average.value}`)
    : ["移動平均：データ不足"];
  while (averageItems.length < 4) averageItems.push("");
  const footerColumns = [
    [
      `ページNo：${pageNumber}`,
      `銘柄コード：${metadata?.symbol || "ー"}`,
      `銘柄名：${metadata?.companyName || "ー"}`,
      `基準日：${metadata?.date || "ー"}`,
    ],
    [
      `始値：${metadata?.open || "データ不足"}`,
      `高値：${metadata?.high || "データ不足"}`,
      `安値：${metadata?.low || "データ不足"}`,
      `終値：${metadata?.close || "ー"}`,
    ],
    [
      `時間軸：${metadata?.timeframe || "ー"}`,
      `MA配列：${metadata?.ppp || "データ不足"}`,
      `下半身判定：${metadata?.lowerBody || "データ不足"}`,
      `9の法則：${metadata?.nineLaw || "データ不足"}`,
    ],
    averageItems,
  ];
  return Array.from({ length: 4 }, (_, rowIndex) =>
    footerColumns.map((column) => column[rowIndex] || ""),
  );
}

function imageDataFromCanvas(canvas) {
  const maxWidth = 2200;
  const scale = Math.min(1, maxWidth / canvas.width);
  const width = Math.max(1, Math.round(canvas.width * scale));
  const height = Math.max(1, Math.round(canvas.height * scale));
  const imageCanvas = document.createElement("canvas");
  imageCanvas.width = width;
  imageCanvas.height = height;
  const imageCtx = imageCanvas.getContext("2d");
  imageCtx.fillStyle = "#ffffff";
  imageCtx.fillRect(0, 0, width, height);
  imageCtx.drawImage(canvas, 0, 0, width, height);
  const jpegDataUrl = imageCanvas.toDataURL("image/jpeg", 0.97);
  const jpegBytes = binaryStringToBytes(atob(jpegDataUrl.split(",")[1]));
  return {
    width,
    height,
    data: jpegBytes,
    metadata: pdfChartMetadata(),
  };
}

function binaryStringToBytes(value) {
  const bytes = new Uint8Array(value.length);
  for (let i = 0; i < value.length; i += 1) {
    bytes[i] = value.charCodeAt(i);
  }
  return bytes;
}

function pdfEscape(value) {
  return String(value).replace(/[\\()]/g, "\\$&");
}

function pdfUtf16Hex(value) {
  let hex = "";
  for (const character of String(value)) {
    const codePoint = character.codePointAt(0);
    if (codePoint <= 0xffff) {
      hex += codePoint.toString(16).padStart(4, "0").toUpperCase();
    } else {
      const adjusted = codePoint - 0x10000;
      const high = 0xd800 + (adjusted >> 10);
      const low = 0xdc00 + (adjusted & 0x3ff);
      hex += high.toString(16).padStart(4, "0").toUpperCase();
      hex += low.toString(16).padStart(4, "0").toUpperCase();
    }
  }
  return `<${hex}>`;
}

function pdfTableText(value, characterSpacing = 135) {
  const characters = Array.from(String(value));
  const isJapanese = (character) => /^[\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Han}ー々〆ヶ]$/u.test(character || "");
  const needsSpacing = (left, right) => Boolean(right) && !(isJapanese(left) && isJapanese(right));
  if (!characters.some((character, index) =>
    needsSpacing(character, characters[index + 1]))) {
    return `${pdfUtf16Hex(value)} Tj`;
  }

  const parts = [];
  let run = "";
  characters.forEach((character, index) => {
    run += character;
    if (needsSpacing(character, characters[index + 1])) {
      parts.push(pdfUtf16Hex(run), `-${characterSpacing}`);
      run = "";
    }
  });
  if (run) parts.push(pdfUtf16Hex(run));
  return `[${parts.join(" ")}] TJ`;
}

function buildImagePdf(images, options = {}) {
  const encoder = new TextEncoder();
  const objects = [];
  const addObject = (parts) => {
    objects.push(Array.isArray(parts) ? parts : [parts]);
    return objects.length;
  };
  const pages = [];

  const fontDescriptorId = addObject("<< /Type /FontDescriptor /FontName /Meiryo /FontFamily (Meiryo) /Flags 4 /FontBBox [-1000 -500 3000 2000] /ItalicAngle 0 /Ascent 1100 /Descent -300 /CapHeight 750 /StemV 80 >>");
  const cidFontId = addObject(`<< /Type /Font /Subtype /CIDFontType0 /BaseFont /Meiryo /CIDSystemInfo << /Registry (Adobe) /Ordering (Japan1) /Supplement 6 >> /FontDescriptor ${fontDescriptorId} 0 R /DW 1000 /W [1 95 500] >>`);
  const fontId = addObject(`<< /Type /Font /Subtype /Type0 /BaseFont /Meiryo /Encoding /UniJIS-UTF16-H /DescendantFonts [${cidFontId} 0 R] >>`);
  const titleFontDescriptorId = addObject("<< /Type /FontDescriptor /FontName /Meiryo /FontFamily (Meiryo) /Flags 4 /FontBBox [-1000 -500 3000 2000] /ItalicAngle 0 /Ascent 1100 /Descent -300 /CapHeight 750 /StemV 80 >>");
  const titleCidFontId = addObject(`<< /Type /Font /Subtype /CIDFontType0 /BaseFont /Meiryo /CIDSystemInfo << /Registry (Adobe) /Ordering (Japan1) /Supplement 6 >> /FontDescriptor ${titleFontDescriptorId} 0 R /DW 1000 /W [1 95 600] >>`);
  const titleFontId = addObject(`<< /Type /Font /Subtype /Type0 /BaseFont /Meiryo /Encoding /UniJIS-UTF16-H /DescendantFonts [${titleCidFontId} 0 R] >>`);

  const listGroups = Array.isArray(options.listGroups) && options.listGroups.length
    ? options.listGroups
    : [{ title: "銘柄一覧ページ", images }];
  const listPageCount = listGroups.length;
  const imagePageNumbers = new Map(
    images.map((image, imageIndex) => [image, imageIndex + listPageCount + 1]),
  );
  const listPageWidth = (images[0]?.width || 1800) * 0.36;
  const listSideMargin = 18;
  const listContentWidth = listPageWidth - listSideMargin * 2;
  const listRowHeight = 8.2;
  const listHeaderHeight = 9.2;
  const listTitleHeight = 15;
  const listBottomMargin = 12;
  const listColumnRatios = [0.04, 0.05, 0.14, 0.07, 0.045, 0.045, 0.045, 0.045, 0.04, 0.055, 0.065, 0.085, 0.06875, 0.06875, 0.06875, 0.06875];

  listGroups.forEach((group) => {
    const groupImages = Array.isArray(group.images) ? group.images : [];
    const listPageHeight = Math.max(
      120,
      listBottomMargin + listTitleHeight + listHeaderHeight + groupImages.length * listRowHeight + 8,
    );
    const listTableTop = listPageHeight - listTitleHeight;
    const listTableBottom = listTableTop - listHeaderHeight - groupImages.length * listRowHeight;
    const listAverageLabels = Array.isArray(groupImages[0]?.metadata?.movingAverages)
      ? groupImages[0].metadata.movingAverages.slice(0, 4).map((average) => average.label)
      : ["5線", "20線", "50線", "100線"];
    const listHeaders = [
      "ページNo", "銘柄コード", "銘柄名", "基準日",
      "始値", "高値", "安値", "終値",
      "時間軸", "MA配列", "下半身判定", "9の法則",
      ...listAverageLabels,
    ];
    const listRows = groupImages.map((image) => {
      const metadata = image.metadata || {};
      const averageValues = Array.isArray(metadata.movingAverages)
        ? metadata.movingAverages.slice(0, 4).map((average) => average.value)
        : ["データ不足", "データ不足", "データ不足", "データ不足"];
      return [
        String(imagePageNumbers.get(image) || "").padStart(3, "0"),
        metadata.symbol || "ー",
        metadata.companyName || "ー",
        metadata.date || "ー",
        metadata.open || "データ不足",
        metadata.high || "データ不足",
        metadata.low || "データ不足",
        metadata.close || "ー",
        metadata.timeframe || "ー",
        metadata.ppp || "データ不足",
        metadata.lowerBody || "データ不足",
        metadata.nineLaw || "データ不足",
        ...averageValues,
      ];
    });
    const listColumnXs = [listSideMargin];
    listColumnRatios.forEach((ratio) => {
      listColumnXs.push(listColumnXs[listColumnXs.length - 1] + listContentWidth * ratio);
    });
    const listTextCommands = [
      `BT /FJ 5.8 Tf 1 0 0 1 ${listSideMargin} ${(listPageHeight - 9).toFixed(2)} Tm ${pdfTableText(group.title || "銘柄一覧ページ")} ET`,
      ...listHeaders.map((header, columnIndex) =>
        `BT /FJ 5.8 Tf 1 0 0 1 ${(listColumnXs[columnIndex] + 2).toFixed(2)} ${(listTableTop - 6.7).toFixed(2)} Tm ${pdfTableText(header, columnIndex === 9 ? 280 : 135)} ET`,
      ),
      ...listRows.flatMap((row, rowIndex) =>
        row.map((value, columnIndex) => {
          const x = listColumnXs[columnIndex] + 2;
          const y = listTableTop - listHeaderHeight - 5.9 - rowIndex * listRowHeight;
          return `BT /FJ 5.8 Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm ${pdfTableText(value, columnIndex === 9 ? 280 : 135)} ET`;
        }),
      ),
    ].join("\n");
    const listVerticalLines = listColumnXs
      .map((x) => `${x.toFixed(2)} ${listTableBottom.toFixed(2)} m ${x.toFixed(2)} ${listTableTop.toFixed(2)} l S`)
      .join("\n");
    const listHorizontalLines = Array.from({ length: groupImages.length + 2 }, (_, lineIndex) => {
      const y = lineIndex === 0
        ? listTableTop
        : listTableTop - listHeaderHeight - (lineIndex - 1) * listRowHeight;
      return `${listSideMargin} ${y.toFixed(2)} m ${(listPageWidth - listSideMargin).toFixed(2)} ${y.toFixed(2)} l S`;
    }).join("\n");
    const listHeaderBottom = listTableTop - listHeaderHeight;
    const listContent = `0.95 0.97 0.99 rg\n${listSideMargin} ${listHeaderBottom.toFixed(2)} ${listContentWidth.toFixed(2)} ${listHeaderHeight.toFixed(2)} re f\n0.82 0.86 0.91 RG\n0.35 w\n${listVerticalLines}\n${listHorizontalLines}\n0.04 0.15 0.33 rg\n${listTextCommands}`;
    const listContentId = addObject(`<< /Length ${encoder.encode(listContent).length} >>\nstream\n${listContent}\nendstream`);
    const listPageId = addObject(`<< /Type /Page /Parent __PAGES__ /MediaBox [0 0 ${listPageWidth.toFixed(2)} ${listPageHeight.toFixed(2)}] /Resources << /ProcSet [/PDF /Text] /Font << /FJ ${fontId} 0 R >> >> /Contents ${listContentId} 0 R >>`);
    pages.push(listPageId);
  });

  images.forEach((image, pageIndex) => {
    const pageWidth = image.width * 0.36;
    const imageHeight = image.height * 0.36;
    const headerHeight = 57;
    const titleHeight = 21;
    const pageHeight = imageHeight + headerHeight + titleHeight;
    const imageId = addObject([
      `<< /Type /XObject /Subtype /Image /Width ${image.width} /Height ${image.height} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.data.length} >>\nstream\n`,
      image.data,
      "\nendstream",
    ]);
    const metadata = image.metadata || {};
    const chartTitle = `${metadata.companyName || "ー"}（${metadata.symbol || "ー"}）`;
    const footerRows = chartFooterRows(metadata, String(pageIndex + listPageCount + 1).padStart(3, "0"));
    const sideMargin = 18;
    const columnWidth = (pageWidth - sideMargin * 2) / 4;
    const textCommands = footerRows
      .flatMap((row, rowIndex) =>
        row.map((line, columnIndex) => {
          const x = sideMargin + columnWidth * columnIndex + 2;
          const y = headerHeight - 10 - rowIndex * 13;
          const characterSpacing = line.startsWith("MA配列：") ? 280 : 135;
          return `BT /FJ 5.8 Tf 1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm ${pdfTableText(line, characterSpacing)} ET`;
        }),
      )
      .join("\n");
    const dividerY = headerHeight - 4;
    const footerVerticalLines = Array.from({ length: 3 }, (_, index) => {
      const x = sideMargin + columnWidth * (index + 1);
      return `${x.toFixed(2)} 3 m\n${x.toFixed(2)} ${dividerY.toFixed(2)} l\nS`;
    }).join("\n");
    const footerHorizontalLines = [headerHeight - 16.5, headerHeight - 29.5, headerHeight - 42.5]
      .map((y) => `${sideMargin} ${y.toFixed(2)} m\n${(pageWidth - sideMargin).toFixed(2)} ${y.toFixed(2)} l\nS`)
      .join("\n");
    const titleY = pageHeight - 14;
    const content = `q\n${pageWidth} 0 0 ${imageHeight} 0 ${headerHeight} cm\n/Im${imageId} Do\nQ\n0.04 0.15 0.33 rg\nBT /FT 11 Tf 0 Tr 1 0 0 1 ${sideMargin} ${titleY.toFixed(2)} Tm ${pdfTableText(chartTitle)} ET\n0.86 0.89 0.93 RG\n0.5 w\n${sideMargin} ${dividerY.toFixed(2)} m\n${(pageWidth - sideMargin).toFixed(2)} ${dividerY.toFixed(2)} l\nS\n${footerHorizontalLines}\n${footerVerticalLines}\n0.04 0.15 0.33 rg\n${textCommands}`;
    const contentLength = encoder.encode(content).length;
    const contentId = addObject(`<< /Length ${contentLength} >>\nstream\n${content}\nendstream`);
    const pageId = addObject(`<< /Type /Page /Parent __PAGES__ /MediaBox [0 0 ${pageWidth.toFixed(2)} ${pageHeight.toFixed(2)}] /Resources << /ProcSet [/PDF /Text /ImageC] /Font << /FJ ${fontId} 0 R /FT ${titleFontId} 0 R >> /XObject << /Im${imageId} ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    pages.push(pageId);
  });

  const pagesId = addObject(`<< /Type /Pages /Kids [${pages.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`);
  const catalogId = addObject(`<< /Type /Catalog /Pages ${pagesId} 0 R >>`);
  const chunks = [];
  const offsets = [];
  let byteLength = 0;
  const append = (part) => {
    const chunk = typeof part === "string" ? encoder.encode(part) : part;
    chunks.push(chunk);
    byteLength += chunk.length;
  };

  append(new Uint8Array([0x25, 0x50, 0x44, 0x46, 0x2d, 0x31, 0x2e, 0x34, 0x0a, 0x25, 0xe2, 0xe3, 0xcf, 0xd3, 0x0a]));
  objects.forEach((objectParts, index) => {
    offsets.push(byteLength);
    append(`${index + 1} 0 obj\n`);
    objectParts.forEach((part) => {
      append(typeof part === "string" ? part.replaceAll("__PAGES__", `${pagesId} 0 R`) : part);
    });
    append("\nendobj\n");
  });
  const xrefOffset = byteLength;
  append(`xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`);
  offsets.forEach((offset) => {
    append(`${String(offset).padStart(10, "0")} 00000 n \n`);
  });
  append(`trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`);
  return new Blob(chunks, { type: "application/pdf" });
}

function sortSymbolsByCodeAsc(symbols) {
  return [...symbols].sort((a, b) => {
    const left = displaySymbol(normalizeSymbol(a || "")).toUpperCase();
    const right = displaySymbol(normalizeSymbol(b || "")).toUpperCase();
    return left.localeCompare(right, "ja", { numeric: true, sensitivity: "base" });
  });
}

async function saveWatchlistPdf() {
  if (!state.watchlist.length) {
    setMessage("注目銘柄が登録されていません。", "down");
    return;
  }
  const fileName = `注目銘柄チャート_${new Date().toISOString().slice(0, 10)}.pdf`;
  const pdfPickerOptions = {
    types: [
      {
        description: "PDFファイル",
        accept: { "application/pdf": [".pdf"] },
      },
    ],
  };
  let saveHandle = null;
  try {
    saveHandle = await chooseSaveFile(fileName, pdfPickerOptions);
  } catch (error) {
    if (error?.name !== "AbortError") {
      setMessage("PDFの保存先を指定できませんでした。", "down");
    }
    return;
  }
  const snapshot = snapshotAppState();
  const images = [];
  setLoading(true);
  try {
    for (const symbol of sortSymbolsByCodeAsc(state.watchlist.map((item) => item.symbol))) {
      const loaded = await loadSymbolData(symbol, { keepLoading: true });
      if (!loaded) continue;
      setLatestDisplayStart();
      drawChart();
      images.push(imageDataFromCanvas(chartExportCanvas({ includeTitle: false })));
    }
    if (!images.length) {
      setMessage("PDFにできるチャート画像を作成できませんでした。", "down");
      return;
    }
    const pdf = buildImagePdf(images);
    if (saveHandle) {
      await writeBlobToHandle(saveHandle, pdf);
    } else {
      downloadBlob(pdf, fileName);
    }
    setMessage(`注目銘柄 ${images.length}社分のPDFを保存しました。`, "up");
  } catch (error) {
    if (error?.name !== "AbortError") {
      setMessage("注目銘柄PDFを保存できませんでした。", "down");
    }
  } finally {
    restoreAppState(snapshot);
    setLoading(false);
  }
}

async function saveTopMarketCapPdf(limit = 10, sourceSymbols = TOP_MARKET_CAP_SYMBOL_POOL, labelLimit = limit) {
  const symbols = sortSymbolsByCodeAsc(sourceSymbols.slice(0, limit));
  const fileName = `時価総額上位${labelLimit}社チャート_${new Date().toISOString().slice(0, 10)}.pdf`;
  const pdfPickerOptions = {
    types: [
      {
        description: "PDFファイル",
        accept: { "application/pdf": [".pdf"] },
      },
    ],
  };
  let saveHandle = null;
  try {
    saveHandle = await chooseSaveFile(fileName, pdfPickerOptions);
  } catch (error) {
    if (error?.name !== "AbortError") {
      setMessage("PDFの保存先を指定できませんでした。", "down");
    }
    return;
  }
  const snapshot = snapshotAppState();
  const images = [];
  setLoading(true);
  try {
    for (const symbol of symbols) {
      const loaded = await loadSymbolData(symbol, { keepLoading: true });
      if (!loaded) continue;
      setLatestDisplayStart();
      drawChart();
      images.push(imageDataFromCanvas(chartExportCanvas({ includeTitle: false })));
    }
    if (!images.length) {
      setMessage("PDFにできるチャート画像を作成できませんでした。", "down");
      return;
    }
    const pdf = buildImagePdf(images);
    if (saveHandle) {
      await writeBlobToHandle(saveHandle, pdf);
    } else {
      downloadBlob(pdf, fileName);
    }
    setMessage(`時価総額上位${labelLimit}社 ${images.length}社分のPDFを保存しました。`, "up");
  } catch (error) {
    if (error?.name !== "AbortError") {
      setMessage(`時価総額上位${labelLimit}社PDFを保存できませんでした。`, "down");
    }
  } finally {
    restoreAppState(snapshot);
    setLoading(false);
  }
}

async function saveTopMarketCap50Pdf() {
  await saveTopMarketCapPdf(50);
}

async function saveTopMarketCap100Pdf() {
  await saveTopMarketCapPdf(TOP_MARKET_CAP_100_SYMBOLS.length, TOP_MARKET_CAP_100_SYMBOLS, 100);
}

async function captureLatestTimeframeImage(symbol, timeframe) {
  el.timeframe.value = timeframe;
  applyTimeframeAverageDefaults(timeframe, { update: false });
  const loaded = await loadSymbolData(symbol, { keepLoading: true });
  if (!loaded) return null;
  setLatestDisplayStart();
  drawChart();
  return imageDataFromCanvas(chartExportCanvas({ includeTitle: false }));
}

async function saveDailyWeeklyMarketCapPdf(limit, sourceSymbols, labelLimit) {
  const symbols = sortSymbolsByCodeAsc(sourceSymbols.slice(0, limit));
  const fileName = `時価総額上位${labelLimit}社_日足週足_${new Date().toISOString().slice(0, 10)}.pdf`;
  const pdfPickerOptions = {
    types: [
      {
        description: "PDFファイル",
        accept: { "application/pdf": [".pdf"] },
      },
    ],
  };
  let saveHandle = null;
  try {
    saveHandle = await chooseSaveFile(fileName, pdfPickerOptions);
  } catch (error) {
    if (error?.name !== "AbortError") {
      setMessage("PDFの保存先を指定できませんでした。", "down");
    }
    return;
  }

  const snapshot = snapshotAppState();
  const images = [];
  const dailyImages = [];
  const weeklyImages = [];
  setLoading(true);
  try {
    for (const symbol of symbols) {
      setMessage(`${displaySymbol(symbol)}の日足・週足を取得しています。`);
      const dailyImage = await captureLatestTimeframeImage(symbol, "1d");
      if (dailyImage) {
        images.push(dailyImage);
        dailyImages.push(dailyImage);
      }
      const weeklyImage = await captureLatestTimeframeImage(symbol, "1wk");
      if (weeklyImage) {
        images.push(weeklyImage);
        weeklyImages.push(weeklyImage);
      }
    }
    if (!images.length) {
      setMessage("PDFにできるチャート画像を作成できませんでした。", "down");
      return;
    }
    const pdf = buildImagePdf(images, {
      listGroups: [
        { title: "日足 銘柄一覧ページ", images: dailyImages },
        { title: "週足 銘柄一覧ページ", images: weeklyImages },
      ],
    });
    if (saveHandle) {
      await writeBlobToHandle(saveHandle, pdf);
    } else {
      downloadBlob(pdf, fileName);
    }
    setMessage(`上位${labelLimit}社の日足・週足PDFを保存しました。`, "up");
  } catch (error) {
    if (error?.name !== "AbortError") {
      setMessage(`上位${labelLimit}社の日足・週足PDFを保存できませんでした。`, "down");
    }
  } finally {
    restoreAppState(snapshot);
    setLoading(false);
  }
}

async function saveTop10DailyWeeklyPdf() {
  await saveDailyWeeklyMarketCapPdf(10, TOP_MARKET_CAP_SYMBOL_POOL, 10);
}

async function saveTop100DailyWeeklyPdf() {
  await saveDailyWeeklyMarketCapPdf(
    TOP_MARKET_CAP_100_SYMBOLS.length,
    TOP_MARKET_CAP_100_SYMBOLS,
    100,
  );
}

async function saveMonitorPdf() {
  if (!state.monitorList.length) {
    setMessage("監視銘柄が登録されていません。", "down");
    return;
  }
  const fileName = `監視銘柄チャート_${new Date().toISOString().slice(0, 10)}.pdf`;
  const pdfPickerOptions = {
    types: [
      {
        description: "PDFファイル",
        accept: { "application/pdf": [".pdf"] },
      },
    ],
  };
  let saveHandle = null;
  try {
    saveHandle = await chooseSaveFile(fileName, pdfPickerOptions);
  } catch (error) {
    if (error?.name !== "AbortError") {
      setMessage("PDFの保存先を指定できませんでした。", "down");
    }
    return;
  }
  const snapshot = snapshotAppState();
  const images = [];
  setLoading(true);
  try {
    for (const symbol of sortSymbolsByCodeAsc(state.monitorList.map((item) => item.symbol))) {
      const loaded = await loadSymbolData(symbol, { keepLoading: true });
      if (!loaded) continue;
      setLatestDisplayStart();
      drawChart();
      images.push(imageDataFromCanvas(chartExportCanvas({ includeTitle: false })));
    }
    if (!images.length) {
      setMessage("PDFにできるチャート画像を作成できませんでした。", "down");
      return;
    }
    const pdf = buildImagePdf(images);
    if (saveHandle) {
      await writeBlobToHandle(saveHandle, pdf);
    } else {
      downloadBlob(pdf, fileName);
    }
    setMessage(`監視銘柄 ${images.length}社分のPDFを保存しました。`, "up");
  } catch (error) {
    if (error?.name !== "AbortError") {
      setMessage("監視銘柄PDFを保存できませんでした。", "down");
    }
  } finally {
    restoreAppState(snapshot);
    setLoading(false);
  }
}

function addHistory(type, qty, price, pnl = 0) {
  const item = {
    day: current().date,
    executedAt: new Date().toISOString(),
    type,
    qty,
    price,
    pnl,
    symbol: displaySymbol(state.symbol),
    companyName: state.companyName,
    timeframe: timeframeLabel(),
  };
  state.history.unshift(item);
  appendTradeRecord(item);
}

function historyTypeLabel(type) {
  if (type.includes("現物買")) return { text: "買", className: "buy" };
  if (type.includes("現物売")) return { text: "売", className: "sell" };
  if (type.includes("信用売")) return { text: "新規売", className: "short" };
  if (type.includes("返済買")) return { text: "返済買", className: "cover" };
  return { text: type, className: "" };
}

function tradeActionLabel(type) {
  const label = historyTypeLabel(type);
  if (label.className === "buy") return "買";
  if (label.className === "sell") return "売";
  if (label.className === "short") return "新規売";
  if (label.className === "cover") return "返済買";
  return label.text;
}

function readTradeRecordSnapshot() {
  try {
    return JSON.parse(localStorage.getItem(TRADE_RECORDS_KEY) || "{}");
  } catch {
    return {};
  }
}

function normalizeTradeRecord(item) {
  return {
    ...item,
    action: item.action || tradeActionLabel(item.type || ""),
    price: Math.round(Number(item.price) || 0),
    pnl: Math.round(Number(item.pnl) || 0),
  };
}

function persistentTradeHistory() {
  const snapshot = readTradeRecordSnapshot();
  return Array.isArray(snapshot.history) ? snapshot.history.map(normalizeTradeRecord) : [];
}

function buildTradeRecordSnapshot(history = persistentTradeHistory()) {
  const m = markToMarket();
  return {
    updatedAt: new Date().toISOString(),
    symbol: displaySymbol(state.symbol),
    companyName: state.companyName,
    timeframe: timeframeLabel(),
    currentDate: state.candles.length ? current().date : "",
    currentPrice: state.candles.length ? Math.round(m.price) : 0,
    total: Math.round(m.total),
    totalPnl: Math.round(m.total - state.initialCash),
    initialCash: state.initialCash,
    history,
  };
}

function publishTradeRecords() {
  try {
    localStorage.setItem(TRADE_RECORDS_KEY, JSON.stringify(buildTradeRecordSnapshot()));
  } catch {
    // 売買記録タブへの共有に失敗しても、練習画面の操作は止めない。
  }
}

function appendTradeRecord(item) {
  try {
    const history = [normalizeTradeRecord(item), ...persistentTradeHistory()];
    localStorage.setItem(TRADE_RECORDS_KEY, JSON.stringify(buildTradeRecordSnapshot(history)));
  } catch {
    // 売買記録タブへの保存に失敗しても、売買操作は止めない。
  }
}

function guardData() {
  if (state.candles.length) return true;
  setMessage("先に実データを読み込んでください。", "down");
  return false;
}

function cashBuy() {
  if (!guardData()) return;
  const q = quantity();
  const price = current().close;
  const cost = q * price;
  if (state.cash < cost) {
    setMessage("現金が足りません。株数を減らすか、開始資金を増やして読み直してください。", "down");
    return;
  }
  state.cash -= cost;
  state.holdingCost += cost;
  state.holdings += q;
  addHistory("現物買い", q, price);
  setMessage(`${q}株を現物買いしました。`, "up");
  update();
}

function cashSell() {
  if (!guardData()) return;
  const q = Math.min(quantity(), state.holdings);
  const price = current().close;
  if (q <= 0) {
    setMessage("売却できる現物株がありません。", "down");
    return;
  }
  const avg = state.holdingCost / state.holdings;
  const pnl = Math.round((price - avg) * q);
  state.cash += q * price;
  state.holdings -= q;
  state.holdingCost -= avg * q;
  state.realizedSpot += pnl;
  if (state.holdings === 0) state.holdingCost = 0;
  addHistory("現物売り", q, price, pnl);
  setMessage(`現物を売却しました。確定損益 ${yenText(pnl)}。`, pnl >= 0 ? "up" : "down");
  update();
}

function shortSell() {
  if (!guardData()) return;
  const q = quantity();
  const price = current().close;
  const currentValue = state.shortAvg * state.shortQty;
  state.shortAvg = (currentValue + price * q) / (state.shortQty + q);
  state.shortQty += q;
  addHistory("信用売り", q, price);
  setMessage(`${q}株を信用売りしました。下落すると利益になります。`, "up");
  update();
}

function coverBuy() {
  if (!guardData()) return;
  const q = Math.min(quantity(), state.shortQty);
  const price = current().close;
  if (q <= 0) {
    setMessage("返済する売建玉がありません。", "down");
    return;
  }
  const pnl = Math.round((state.shortAvg - price) * q);
  state.cash += pnl;
  state.shortQty -= q;
  if (state.shortQty === 0) state.shortAvg = 0;
  state.realizedShort += pnl;
  addHistory("返済買い", q, price, pnl);
  setMessage(`返済買いしました。確定損益 ${yenText(pnl)}。`, pnl >= 0 ? "up" : "down");
  update();
}

function markToMarket() {
  if (!state.candles.length) {
    return { price: 0, holdingValue: 0, shortPositionAmount: 0, spotUnrealized: 0, shortUnrealized: 0, total: state.cash };
  }
  const price = current().close;
  const holdingValue = state.holdings * price;
  const spotUnrealized = state.holdings ? holdingValue - state.holdingCost : 0;
  const shortUnrealized = state.shortQty ? (state.shortAvg - price) * state.shortQty : 0;
  const shortPositionAmount = state.shortQty * state.shortAvg;
  return {
    price,
    holdingValue,
    shortPositionAmount,
    spotUnrealized,
    shortUnrealized,
    total: state.cash + holdingValue + shortUnrealized,
  };
}

function renderStats() {
  const m = markToMarket();
  el.currentPrice.textContent = state.candles.length ? `${Math.round(m.price).toLocaleString("ja-JP")}円/株` : "--";
  updateOrderValue();
  const totalPnl = m.total - state.initialCash;
  el.assetTotal.textContent = yenText(m.total);
  el.totalPnl.textContent = signedYenText(totalPnl);
  el.totalPnl.className = pnlClass(totalPnl);
  el.cashValue.textContent = yenText(state.cash);
  el.shareCount.textContent = `${state.holdings.toLocaleString("ja-JP")} 株`;
  el.spotAverageCost.textContent = state.holdings ? yenText(state.holdingCost / state.holdings) : "--";
  el.holdingValue.textContent = yenText(m.holdingValue);
  const spotPnl = state.holdings ? m.spotUnrealized : 0;
  const spotTotalPnl = state.realizedSpot + m.spotUnrealized;
  const shortPnl = state.shortQty ? m.shortUnrealized : 0;
  const shortTotalPnl = state.realizedShort + m.shortUnrealized;
  el.spotPnl.textContent = signedYenText(spotPnl);
  el.spotTotalPnl.textContent = signedYenText(spotTotalPnl);
  el.shortShareCount.textContent = `${state.shortQty.toLocaleString("ja-JP")} 株`;
  el.shortAveragePrice.textContent = state.shortQty ? yenText(state.shortAvg) : "--";
  el.shortPositionAmount.textContent = yenText(m.shortPositionAmount);
  el.shortPnl.textContent = signedYenText(shortPnl);
  el.shortTotalPnl.textContent = signedYenText(shortTotalPnl);
  el.spotPnl.className = pnlClass(spotPnl);
  el.spotTotalPnl.className = pnlClass(spotTotalPnl);
  el.shortPnl.className = pnlClass(shortPnl);
  el.shortTotalPnl.className = pnlClass(shortTotalPnl);

  if (state.candles.length) {
    el.currentDate.textContent = current().date;
    el.rangeLabel.textContent = `（${state.index + 1} / ${state.candles.length} 本）`;
    const start = visibleStartIndex();
    el.startDate.value = state.candles[start].dateKey;
    el.rangeStart.value = String(start);
    updateRangeSliderWindow(start);
    el.sliderStartLabel.textContent = state.candles[start].date;
    el.sliderEndLabel.textContent = current().date;
    el.dataPeriod.textContent = `${state.candles[0].date} - ${state.candles[state.candles.length - 1].date}`;
    el.dataSource.textContent = state.source;
  }
}

function renderWatchlist() {
  if (!el.watchlist) return;
  if (!state.watchlist.length) {
    el.watchlist.textContent = "登録銘柄はまだありません。";
    return;
  }
  el.watchlist.innerHTML = state.watchlist
    .map((item) => {
      const code = displaySymbol(item.symbol);
      const label = item.companyName ? `${item.companyName}（${code}）` : code;
      return `
        <div class="watchlist-row">
          <button class="watchlist-item" type="button" data-symbol="${escapeHtml(item.symbol)}">${escapeHtml(label)}</button>
          <button class="watchlist-remove" type="button" data-remove-symbol="${escapeHtml(item.symbol)}" aria-label="${escapeHtml(label)}を削除">×</button>
        </div>
      `;
    })
    .join("");
}

function renderMonitorList() {
  if (!el.monitorList) return;
  if (!state.monitorList.length) {
    el.monitorList.textContent = "CSVファイルを読み込んでください。";
    return;
  }
  el.monitorList.innerHTML = state.monitorList
    .map((item) => {
      const code = displaySymbol(item.symbol);
      const companyName = cleanCompanyName(item.companyName || item.name || "");
      const label = companyName ? `${companyName}（${code}）` : code;
      return `<button class="monitor-item" type="button" data-symbol="${escapeHtml(item.symbol)}">${escapeHtml(label)}</button>`;
    })
    .join("");
}

function update() {
  drawChart();
  renderStats();
  renderWatchlist();
  renderMonitorList();
  updateTradeMarkerToggle();
  publishTradeRecords();
  el.chartHint.hidden = state.candles.length > 0 && (state.index > Math.min(65, state.candles.length - 1) || Boolean(state.timer));
  if (!el.chartHint.hidden) {
    el.chartHint.textContent = state.candles.length ? "▶で時間を進める" : "データを読み込んでください";
  }
}

function step(direction) {
  if (!guardData()) return;
  state.index = Math.max(20, Math.min(state.candles.length - 1, state.index + direction));
  if (state.index === state.candles.length - 1) stop();
  update();
}

function play() {
  if (!guardData()) return;
  if (state.timer) {
    stop();
    return;
  }
  el.playPause.textContent = "一時停止";
  state.timer = window.setInterval(() => step(1), Number(el.speed.value));
}

function stop() {
  window.clearInterval(state.timer);
  state.timer = null;
  el.playPause.textContent = "▶ 再生";
}

function reset() {
  stop();
  if (!state.candles.length) {
    resetAccount();
    update();
    return;
  }
  const previousIndex = state.index;
  resetAccount();
  state.index = previousIndex;
  setMessage("履歴をクリアしました。", "");
  update();
}

function showScore() {
  if (!guardData()) return;
  const m = markToMarket();
  const best = Math.max(...state.candles.slice(0, state.index + 1).map((c) => c.high));
  const worst = Math.min(...state.candles.slice(0, state.index + 1).map((c) => c.low));
  const result = m.total - state.initialCash;
  el.scoreBody.innerHTML = `
    <div><dt>総資産</dt><dd>${yen.format(m.total)}</dd></div>
    <div><dt>開始時からの損益</dt><dd class="${result >= 0 ? "up" : "down"}">${yen.format(result)}</dd></div>
    <div><dt>取引回数</dt><dd>${state.history.length} 回</dd></div>
    <div><dt>練習済み区間の高値 / 安値</dt><dd>${yen.format(best)} / ${yen.format(worst)}</dd></div>
  `;
  el.scoreDialog.showModal();
}

function setLoading(isLoading) {
  el.loadSymbol.disabled = isLoading;
  el.loadSymbolLatest.disabled = isLoading;
  el.loadRandomSymbol.disabled = isLoading;
  el.loadRandomLatest.disabled = isLoading;
  el.loadSymbol.textContent = isLoading ? "読込中" : "指定銘柄";
  el.loadSymbolLatest.textContent = isLoading ? "読込中" : "指定銘柄/ 最新";
  el.loadRandomSymbol.textContent = isLoading ? "読込中" : "ランダム銘柄";
  el.loadRandomLatest.textContent = isLoading ? "読込中" : "ランダム銘柄/ 最新";
}

function initEvents() {
  el.openTradeRecords?.addEventListener("click", () => {
    const opened = window.open("./trade-records.html?v=20260516-7", "technicalTradeRecords");
    if (opened) opened.focus();
  });
  document.getElementById("cashBuy").addEventListener("click", cashBuy);
  document.getElementById("cashSell").addEventListener("click", cashSell);
  document.getElementById("shortSell").addEventListener("click", shortSell);
  document.getElementById("coverBuy").addEventListener("click", coverBuy);
  el.toggleTradeMarkers?.addEventListener("click", toggleTradeMarkers);
  el.saveChartImage?.addEventListener("click", saveChartImage);
  el.analyzeChartInChatGPT?.addEventListener("click", analyzeChartInChatGPT);
  el.saveWatchlistPdf?.addEventListener("click", saveWatchlistPdf);
  el.saveTopMarketCapPdf?.addEventListener("click", () => saveTopMarketCapPdf(10));
  el.saveTopMarketCap50Pdf?.addEventListener("click", saveTopMarketCap50Pdf);
  el.saveTopMarketCap100Pdf?.addEventListener("click", saveTopMarketCap100Pdf);
  el.saveMonitorPdf?.addEventListener("click", saveMonitorPdf);
  el.saveTop10DailyWeeklyPdf?.addEventListener("click", saveTop10DailyWeeklyPdf);
  el.saveTop100DailyWeeklyPdf?.addEventListener("click", saveTop100DailyWeeklyPdf);
  el.playPause.addEventListener("click", play);
  el.stepBack.addEventListener("click", () => step(-1));
  el.stepForward.addEventListener("click", () => step(1));
  el.speed.addEventListener("input", () => {
    if (state.timer) {
      stop();
      play();
    }
  });
  el.windowSize.addEventListener("change", () => {
    const startDate = state.candles.length ? state.candles[visibleStartIndex()].dateKey : "";
    state.windowSize = Number(el.windowSize.value);
    setupStartDateControl();
    if (startDate) {
      setDisplayStart(startDate);
      return;
    }
    update();
  });
  el.startDate.addEventListener("change", () => setDisplayStart(el.startDate.value));
  el.rangeStart.addEventListener("input", () => setDisplayStartIndex(el.rangeStart.value));
  [...el.maEnabled, ...el.maPeriods, ...el.maColors].forEach((input) => {
    input.addEventListener("input", () => {
      syncAverageSettings();
      update();
    });
    input.addEventListener("change", () => {
      syncAverageSettings();
      update();
    });
  });
  el.resetButton.addEventListener("click", reset);
  el.scoreButton.addEventListener("click", showScore);
  el.quantityDownLarge.addEventListener("click", () => adjustQuantity(-500));
  el.quantityDown.addEventListener("click", () => adjustQuantity(-100));
  el.quantityUp.addEventListener("click", () => adjustQuantity(100));
  el.quantityUpLarge.addEventListener("click", () => adjustQuantity(500));
  el.loadSymbol.addEventListener("click", loadSymbolFromInput);
  el.loadSymbolLatest.addEventListener("click", loadSymbolFromInputLatest);
  el.loadRandomSymbol.addEventListener("click", loadRandomSymbolWithDate);
  el.loadRandomLatest.addEventListener("click", loadRandomSymbolLatest);
  el.registerCurrentSymbol.addEventListener("click", registerCurrentSymbol);
  el.chartTitle.addEventListener("click", registerCurrentSymbol);
  el.watchlist.addEventListener("click", (event) => {
    const removeButton = event.target.closest("[data-remove-symbol]");
    if (removeButton) {
      removeWatchlistSymbol(removeButton.dataset.removeSymbol);
      return;
    }
    const button = event.target.closest("[data-symbol]");
    if (!button) return;
    loadWatchlistSymbol(button.dataset.symbol);
  });
  el.monitorCsvFile?.addEventListener("change", loadMonitorCsvFile);
  el.clearMonitorList?.addEventListener("click", clearMonitorList);
  el.monitorList?.addEventListener("click", (event) => {
    const button = event.target.closest("[data-symbol]");
    if (!button) return;
    loadMonitorSymbol(button.dataset.symbol);
  });
  el.timeframe.addEventListener("change", () => {
    applyTimeframeAverageDefaults(el.timeframe.value);
    loadSymbolFromInput();
  });
  el.symbolInput.addEventListener("input", queueSymbolSearch);
  el.symbolInput.addEventListener("focus", () => el.symbolInput.select());
  el.symbolInput.addEventListener("mouseup", (event) => event.preventDefault());
  el.symbolInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") loadSymbolFromInput();
  });
  el.chart.addEventListener("mousemove", (event) => {
    const rect = el.chart.getBoundingClientRect();
    state.hoverPoint = {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
    drawChart();
  });
  el.chart.addEventListener("mouseleave", () => {
    state.hoverPoint = null;
    drawChart();
  });
  window.addEventListener("keydown", (event) => {
    const target = event.target;
    const isTyping =
      target instanceof HTMLInputElement ||
      target instanceof HTMLTextAreaElement ||
      target instanceof HTMLSelectElement ||
      target?.isContentEditable;
    if (isTyping) return;
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      step(-1);
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      step(1);
    }
  });
  [el.initialCash, el.quantity].forEach((input) => {
    input.addEventListener("input", () => {
      formatNumberInput(input);
      if (input === el.quantity) updateOrderValue();
    });
    input.addEventListener("blur", () => {
      formatNumberInput(input);
      if (input === el.quantity) updateOrderValue();
    });
  });
  window.addEventListener("resize", update);
}

initEvents();
loadWatchlist();
loadMonitorList();
resetAccount();
update();
loadRandomSymbolWithDate();
