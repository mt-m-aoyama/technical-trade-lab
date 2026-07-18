from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from urllib.error import HTTPError, URLError
from urllib.parse import parse_qs, quote, urlparse
from urllib.request import Request, urlopen
import html
import json
import re


class StockTrainingHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        if parsed.path == "/api/yahoo":
            self.handle_yahoo(parsed)
            return
        if parsed.path == "/api/company-name":
            self.handle_company_name(parsed)
            return
        if parsed.path == "/api/symbol-search":
            self.handle_symbol_search(parsed)
            return
        if parsed.path == "/api/stooq":
            self.handle_stooq(parsed)
            return
        super().do_GET()

    def handle_yahoo(self, parsed):
        symbol = parse_qs(parsed.query).get("symbol", ["6146.T"])[0].strip().upper()
        interval = parse_qs(parsed.query).get("interval", ["1d"])[0].strip()
        range_value = parse_qs(parsed.query).get("range", ["5y"])[0].strip()
        if not symbol:
            symbol = "6146.T"
        if interval not in {"1d", "1wk", "1mo"}:
            interval = "1d"
        if range_value not in {"5y", "10y", "20y", "max"}:
            range_value = "5y"
        url = f"https://query1.finance.yahoo.com/v8/finance/chart/{quote(symbol)}?range={range_value}&interval={interval}"
        request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urlopen(request, timeout=15) as response:
                body = response.read()
        except (HTTPError, URLError, TimeoutError) as exc:
            message = f"Failed to fetch Yahoo Finance data: {exc}".encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(message)))
            self.end_headers()
            self.wfile.write(message)
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_company_name(self, parsed):
        symbol = parse_qs(parsed.query).get("symbol", ["6146.T"])[0].strip().upper()
        if not symbol:
            symbol = "6146.T"
        url = f"https://finance.yahoo.co.jp/quote/{quote(symbol)}"
        request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urlopen(request, timeout=15) as response:
                html = response.read().decode("utf-8", "replace")
            match = re.search(r"<title>(.*?)</title>", html, re.S)
            if not match:
                raise ValueError("title not found")
            title = re.sub(r"\s+", " ", match.group(1)).strip()
            name = title.split("【", 1)[0].strip()
            if not name:
                raise ValueError("company name not found")
            body = name.encode("utf-8")
        except (HTTPError, URLError, TimeoutError, ValueError) as exc:
            message = f"Failed to fetch Japanese company name: {exc}".encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(message)))
            self.end_headers()
            self.wfile.write(message)
            return

        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def handle_company_name(self, parsed):
        symbol = parse_qs(parsed.query).get("symbol", ["6146.T"])[0].strip().upper()
        if not symbol:
            symbol = "6146.T"
        try:
            name = self.lookup_company_name(symbol)
            if not name:
                raise ValueError("company name not found")
            body = name.encode("utf-8")
        except (HTTPError, URLError, TimeoutError, ValueError) as exc:
            message = f"Failed to fetch Japanese company name: {exc}".encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(message)))
            self.end_headers()
            self.wfile.write(message)
            return

        self.send_response(200)
        self.send_header("Content-Type", "text/plain; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def lookup_company_name(self, symbol):
        code = symbol.split(".", 1)[0]
        search_url = (
            "https://query2.finance.yahoo.com/v1/finance/search"
            f"?q={quote(code)}&quotesCount=8&newsCount=0&lang=ja-JP&region=JP"
        )
        request = Request(search_url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urlopen(request, timeout=15) as response:
                data = json.loads(response.read().decode("utf-8", "replace"))
            for quote_data in data.get("quotes", []):
                if str(quote_data.get("symbol", "")).upper() != symbol:
                    continue
                name = (
                    quote_data.get("longname")
                    or quote_data.get("shortname")
                    or quote_data.get("name")
                    or ""
                )
                name = self.clean_company_name(name)
                if name:
                    return name
        except (HTTPError, URLError, TimeoutError, json.JSONDecodeError):
            pass

        page_url = f"https://finance.yahoo.co.jp/quote/{quote(symbol)}"
        request = Request(page_url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(request, timeout=15) as response:
            page = response.read().decode("utf-8", "replace")
        candidates = [
            r"<h1[^>]*>(.*?)</h1>",
            r'"name"\s*:\s*"([^"]+)"',
            r"<title>(.*?)</title>",
        ]
        for pattern in candidates:
            match = re.search(pattern, page, re.S)
            if not match:
                continue
            name = html.unescape(re.sub(r"<[^>]+>", "", match.group(1)))
            name = re.split(r"【| - |｜|\|", name, 1)[0]
            name = self.clean_company_name(name)
            if name:
                return name
        return ""

    def clean_company_name(self, name):
        name = re.sub(r"\s+", " ", str(name or "")).strip()
        name = re.sub(r"\b\d{4}\.T\b", "", name).strip()
        name = re.sub(r"株式会社|㈱|\(株\)|（株）", "", name).strip()
        return name

    def handle_symbol_search(self, parsed):
        query = parse_qs(parsed.query).get("q", [""])[0].strip()
        if not query:
            body = b"[]"
            self.send_response(200)
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(body)))
            self.end_headers()
            self.wfile.write(body)
            return

        try:
            results = self.search_yahoo_api(query)
            if not results:
                results = self.search_yahoo_japan(query)
            body = json.dumps(results, ensure_ascii=False).encode("utf-8")
        except (HTTPError, URLError, TimeoutError, ValueError, json.JSONDecodeError) as exc:
            message = f"Failed to search symbols: {exc}".encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(message)))
            self.end_headers()
            self.wfile.write(message)
            return

        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

    def search_yahoo_api(self, query):
        url = (
            "https://query2.finance.yahoo.com/v1/finance/search"
            f"?q={quote(query)}&quotesCount=12&newsCount=0&lang=ja-JP&region=JP"
        )
        request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urlopen(request, timeout=15) as response:
                data = json.loads(response.read().decode("utf-8", "replace"))
        except HTTPError:
            return []
        quotes = data.get("quotes", [])
        results = []
        seen = set()
        for quote_data in quotes:
            symbol = str(quote_data.get("symbol", "")).upper()
            if not symbol.endswith(".T"):
                continue
            code = symbol[:-2]
            if not re.fullmatch(r"\d{4}", code) or code in seen:
                continue
            seen.add(code)
            name = (
                quote_data.get("longname")
                or quote_data.get("shortname")
                or quote_data.get("name")
                or ""
            )
            results.append({"code": code, "symbol": f"{code}.jp", "name": name})
        return results

    def search_yahoo_japan(self, query):
        url = f"https://finance.yahoo.co.jp/search/?query={quote(query)}"
        request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urlopen(request, timeout=15) as response:
            page = response.read().decode("utf-8", "replace")
        results = []
        seen = set()
        pattern = re.compile(
            r'href="https://finance\.yahoo\.co\.jp/quote/(\d{4})\.T".*?'
            r'<h2[^>]*class="[^"]*SearchItem__name[^"]*"[^>]*>(.*?)</h2>',
            re.S,
        )
        for code, raw_name in pattern.findall(page):
            if code in seen:
                continue
            seen.add(code)
            name = re.sub(r"<[^>]+>", "", raw_name)
            name = html.unescape(re.sub(r"\s+", " ", name)).strip()
            results.append({"code": code, "symbol": f"{code}.jp", "name": name})
            if len(results) >= 12:
                break
        return results

    def handle_stooq(self, parsed):
        symbol = parse_qs(parsed.query).get("symbol", ["6146.jp"])[0].strip().lower()
        if not symbol:
            symbol = "6146.jp"
        url = f"https://stooq.com/q/d/l/?s={symbol}&i=d"
        request = Request(url, headers={"User-Agent": "Mozilla/5.0"})
        try:
            with urlopen(request, timeout=15) as response:
                body = response.read()
        except (HTTPError, URLError, TimeoutError) as exc:
            message = f"Failed to fetch Stooq data: {exc}".encode("utf-8")
            self.send_response(502)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Content-Length", str(len(message)))
            self.end_headers()
            self.wfile.write(message)
            return

        self.send_response(200)
        self.send_header("Content-Type", "text/csv; charset=utf-8")
        self.send_header("Cache-Control", "no-store")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)

if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", 5174), StockTrainingHandler)
    print("Serving stock training app at http://127.0.0.1:5174/")
    server.serve_forever()
