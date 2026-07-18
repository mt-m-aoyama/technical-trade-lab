# Technical Trade Lab

実際の株価データを使い、ローソク足を1本ずつ進めながら株式売買を練習するWebアプリです。

## このアプリの技術構成

- 画面: HTML、CSS、JavaScript（フレームワークなし）
- チャート: HTML Canvas
- 公開用ビルド: Vite
- 公開先: Vercel
- 公開版のサーバーAPI: Vercel Functions（Node.js）
- 株価・銘柄情報: Yahoo Financeの公開Web APIをサーバー側から取得
- ローカル起動用サーバー: Python `server.py`

ブラウザはYahoo Financeへ直接アクセスしません。ブラウザは同じサイトの`/api/yahoo`、`/api/company-name`、`/api/symbol-search`だけを呼び出し、Vercelのサーバー側APIがYahoo Financeへアクセスします。

## 5分キャッシュ

Yahoo Financeから正常に取得した株価・社名・検索結果は、VercelのCDNで300秒（5分）キャッシュします。同じ条件のアクセスが続いても、毎回Yahoo Financeへ問い合わせないため、表示が速くなり、アクセス集中も抑えられます。

エラー応答や利用者ごとの取引データはキャッシュしません。取引データは従来どおりブラウザ内に保存され、サーバーへ送信されません。

## ファイル構成

```text
api/                    Vercelで動くサーバーAPI
lib/yahoo.js            Yahoo Finance接続の共通処理
app.js                  メイン画面の動作
index.html              メイン画面
style.css               メイン画面のデザイン
trade-records.*         売買記録画面
vite.config.js          Viteのビルド設定
vercel.json             Vercelの設定
package.json            npmの設定
server.py               ローカル起動用Pythonサーバー
```

## パソコン上でビルドを確認する

Node.js 20.19以上をインストールしてから、このフォルダーで次を実行します。

```powershell
npm install
npm run build
```

成功すると`dist`フォルダーが作られます。`dist`と`node_modules`は自動生成物なので、GitHubには登録しません。

従来どおりローカルで株価データを使って起動する場合は、次を実行します。

```powershell
python server.py
```

ブラウザで次を開きます。

```text
http://127.0.0.1:5174/
```

## GitHubへ登録する手順

### 1. GitHubで空の保存場所を作る

1. [GitHub](https://github.com/)へログインします。
2. 右上の`+`から`New repository`を選びます。
3. Repository nameに、例として`technical-trade-lab`と入力します。
4. 公開してよければ`Public`、自分だけにしたければ`Private`を選びます。Vercelはどちらも接続できます。
5. `Add a README file`などのチェックは付けず、空のまま`Create repository`を押します。

### 2. このフォルダーをGitHubへ送る

GitHubが表示するURLの`ユーザー名`部分を自分のGitHub名へ置き換え、PowerShellで順番に実行します。

```powershell
git init
git add .
git commit -m "Vercel公開の準備"
git branch -M main
git remote add origin https://github.com/ユーザー名/technical-trade-lab.git
git push -u origin main
```

すでにGitの設定が済んでいる場合、`git init`や`git remote add origin`は不要です。GitHubへのログイン画面が出たら、画面の案内に従って認証します。パスワード欄にGitHubの通常パスワードを直接入力する方式は使いません。

## Vercelで公開する手順

### 1. GitHubとVercelを接続する

1. [Vercel](https://vercel.com/)を開き、`Continue with GitHub`でログインします。
2. `Add New...`から`Project`を選びます。
3. GitHubに登録した`technical-trade-lab`の横にある`Import`を押します。
4. GitHubから接続許可を求められた場合は、このリポジトリへのアクセスを許可します。

### 2. 公開設定を確認する

通常は`vercel.json`と`package.json`から自動認識されます。画面に設定欄が出た場合は、次の値を確認します。

```text
Framework Preset: Vite
Build Command: npm run build
Output Directory: dist
Install Command: npm install
```

環境変数の登録は不要です。`Deploy`を押すと、ビルド後に公開URLが表示されます。

### 3. 公開後に確認する

1. Vercelが表示したURLを開きます。
2. 銘柄を読み込み、ローソク足と日本語の社名が表示されることを確認します。
3. Vercelの`Deployments`画面で公開が`Ready`になっていることを確認します。

以後はGitHubの`main`へ変更を送るたびに、Vercelが自動で再公開します。

## エラーが出たとき

- `株価データを取得できませんでした`: 銘柄コードを確認し、数分待って再度読み込みます。
- `アクセスが混み合っています`: Yahoo Finance側の制限です。5分ほど待って再度試します。
- Vercelの公開が失敗する: Vercelの`Deployments`から失敗した公開を開き、`Build Logs`の赤い行を確認します。
- `npm run build`が失敗する: Node.jsが20.19以上か、先に`npm install`を実行したかを確認します。

## 注意

Yahoo FinanceのWeb APIは、このアプリ専用に保証された公式契約APIではありません。Yahoo側の仕様変更やアクセス制限により、将来取得できなくなる可能性があります。また、このアプリは学習用であり、投資判断や実取引の正確性を保証するものではありません。
