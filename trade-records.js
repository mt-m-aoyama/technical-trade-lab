const RECORDS_KEY = "technical-trade-lab-records";

const yen = (value) => `${Math.round(Number(value) || 0).toLocaleString("ja-JP")}円`;
const signedYen = (value) => {
  const amount = Math.round(Number(value) || 0);
  if (amount > 0) return `＋${amount.toLocaleString("ja-JP")}円`;
  if (amount < 0) return `－${Math.abs(amount).toLocaleString("ja-JP")}円`;
  return "0円";
};

const pnlClass = (value) => {
  const amount = Math.round(Number(value) || 0);
  if (amount > 0) return "pnl-plus";
  if (amount < 0) return "pnl-minus";
  return "pnl-zero";
};

const actionClass = (action) => {
  if (action === "買") return "buy";
  if (action === "売") return "sell";
  if (action === "新規売") return "short";
  if (action === "返済買") return "cover";
  return "";
};

const el = {
  todaySummary: document.getElementById("todaySummary"),
  todaySymbols: document.getElementById("todaySymbols"),
  allSummary: document.getElementById("allSummary"),
  resetAllRecords: document.getElementById("resetAllRecords"),
  lastUpdated: document.getElementById("lastUpdated"),
  recordsBody: document.getElementById("recordsBody"),
};

function cleanCompanyName(value) {
  return String(value || "")
    .replace(/\(株\)|（株）|㈱|株式会社/g, "")
    .trim();
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function loadSnapshot() {
  try {
    return JSON.parse(localStorage.getItem(RECORDS_KEY) || "{}");
  } catch {
    return {};
  }
}

function todayKey() {
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function itemDateKey(item) {
  if (!item.executedAt) return "";
  return new Intl.DateTimeFormat("sv-SE", {
    timeZone: "Asia/Tokyo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date(item.executedAt));
}

function tradeAmount(item) {
  return Math.round((Number(item.qty) || 0) * (Number(item.price) || 0));
}

function summarize(items) {
  return items.reduce(
    (acc, item) => {
      acc.count += 1;
      acc.qty += Number(item.qty) || 0;
      acc.amount += tradeAmount(item);
      acc.pnl += Number(item.pnl) || 0;
      return acc;
    },
    { count: 0, qty: 0, amount: 0, pnl: 0 },
  );
}

function companyLabel(item) {
  const name = cleanCompanyName(item.companyName);
  if (name) return `${name}（${item.symbol || ""}）`;
  return item.symbol || "--";
}

function renderMetricList(target, summary) {
  target.innerHTML = `
    <div><dt>取引回数</dt><dd>${summary.count.toLocaleString("ja-JP")}回</dd></div>
    <div><dt>取引株数</dt><dd>${summary.qty.toLocaleString("ja-JP")}株</dd></div>
    <div><dt>売買代金</dt><dd>${yen(summary.amount)}</dd></div>
    <div><dt>実現損益</dt><dd class="${pnlClass(summary.pnl)}">${signedYen(summary.pnl)}</dd></div>
  `;
}

function renderSymbolSummary(todayItems) {
  if (!todayItems.length) {
    el.todaySymbols.innerHTML = '<p class="symbol-empty">本日の取引はまだありません。</p>';
    return;
  }

  const bySymbol = new Map();
  todayItems.forEach((item) => {
    const key = item.symbol || companyLabel(item);
    const current = bySymbol.get(key) || { label: companyLabel(item), items: [] };
    current.items.push(item);
    bySymbol.set(key, current);
  });

  const rows = Array.from(bySymbol.values())
    .map(({ label, items }) => {
      const summary = summarize(items);
      return `
        <tr>
          <td>${escapeHtml(label)}</td>
          <td class="num">${summary.count.toLocaleString("ja-JP")}回</td>
          <td class="num">${summary.qty.toLocaleString("ja-JP")}株</td>
          <td class="num">${yen(summary.amount)}</td>
          <td class="num ${pnlClass(summary.pnl)}">${signedYen(summary.pnl)}</td>
        </tr>
      `;
    })
    .join("");

  el.todaySymbols.innerHTML = `
    <table class="symbol-table">
      <thead>
        <tr>
          <th>銘柄</th>
          <th class="num">取引回数</th>
          <th class="num">取引株数</th>
          <th class="num">売買代金</th>
          <th class="num">実現損益</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>
  `;
}

function render() {
  const data = loadSnapshot();
  const history = Array.isArray(data.history) ? data.history : [];
  const todayItems = history.filter((item) => itemDateKey(item) === todayKey());

  renderMetricList(el.todaySummary, summarize(todayItems));
  renderSymbolSummary(todayItems);
  renderMetricList(el.allSummary, summarize(history));

  el.lastUpdated.textContent = data.updatedAt
    ? `最終更新 ${new Date(data.updatedAt).toLocaleString("ja-JP")}`
    : "更新待ち";

  if (!history.length) {
    el.recordsBody.innerHTML = '<tr><td class="empty" colspan="7">まだ取引はありません。</td></tr>';
    return;
  }

  el.recordsBody.innerHTML = history
    .map((item) => {
      const action = item.action || "";
      const pnl = Number(item.pnl) || 0;
      return `
        <tr>
          <td>${escapeHtml(item.day || "--")}</td>
          <td>${escapeHtml(companyLabel(item))}</td>
          <td>${escapeHtml(item.timeframe || data.timeframe || "--")}</td>
          <td><span class="action ${actionClass(action)}">${escapeHtml(action || "--")}</span></td>
          <td class="num">${Number(item.qty || 0).toLocaleString("ja-JP")}株</td>
          <td class="num">${yen(item.price)}</td>
          <td class="num ${pnlClass(pnl)}">${item.pnl ? signedYen(pnl) : "--"}</td>
        </tr>
      `;
    })
    .join("");
}

function resetAllRecords() {
  if (!window.confirm("今までの売買記録をすべてリセットします。よろしいですか？")) return;
  const snapshot = loadSnapshot();
  const nextSnapshot = {
    ...snapshot,
    updatedAt: new Date().toISOString(),
    history: [],
  };
  localStorage.setItem(RECORDS_KEY, JSON.stringify(nextSnapshot));
  render();
}

window.addEventListener("storage", (event) => {
  if (event.key === RECORDS_KEY) render();
});

el.resetAllRecords?.addEventListener("click", resetAllRecords);

render();
window.setInterval(render, 1000);
