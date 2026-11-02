# ナンプレメモ

ナンバープレース（数独）を解く補助をするWebアプリ。

- **問題登録**: 9x9のマスに数字を入力して「登録」。登録者のみ編集・削除可能
- **問題回答**: 登録済み問題（全ユーザー共有）を「回答」「メモ」モードで解く
  - メモ: 1〜9の候補を自由にトグル
  - 回答: 数字を確定するとそのマスのメモはクリア。同じ数字の再入力 / 消去で取り消し、別の数字で上書き
  - 元に戻す、重複の赤表示、完成判定、進捗のサーバー自動保存

技術: Next.js 15 (App Router) / Auth.js v5 (Google) / Prisma 7 + Neon (PostgreSQL) / Vercel

## セットアップ

Node.js 24.22.1 以上（`.node-version`）と npm 11.21.1 以上が必要です。

1. Neon でデータベースを作成（Vercel の Storage → Neon からでも可）し、接続文字列を控える
2. Google Cloud Console で OAuth クライアント（ウェブアプリケーション）を作成
   - 承認済みリダイレクトURI: `http://localhost:3000/api/auth/callback/google` と `https://<本番ドメイン>/api/auth/callback/google`
3. `.env.example` を参考に `.env` を設定（`AUTH_SECRET` は `npx auth secret` で生成）
4. 依存関係とDB

```bash
npm ci
npx prisma migrate deploy
npm run dev
```

## Vercel へのデプロイ

環境変数 `DATABASE_URL` / `AUTH_SECRET` / `AUTH_GOOGLE_ID` / `AUTH_GOOGLE_SECRET` を設定してデプロイ。
`build` スクリプトで `prisma generate` が実行されます。マイグレーションは手元から `npx prisma migrate deploy` で適用してください。

## スクリプト

- `npm run dev` 開発サーバー
- `npm test` ユニットテスト（`src/lib/sudoku.ts`）
- `npm run lint` / `npm run build`

## 依存関係のセキュリティ方針

サプライチェーン攻撃（乗っ取られたパッケージの悪性版）とゼロデイを避けるため、次のルールで運用します。

- **公開から14日未満の版は入れない**: `.npmrc` の `min-release-age=14` でnpm自体が強制します。Dependabotも `cooldown` で同じ14日を待ちます
- **バージョン固定**: `save-exact=true` で `package.json` に固定版を書き、インストールは `npm ci`（lockfile通り）で行います
- **インストール時スクリプトは許可制**: `package.json` の `allowScripts` で、中身を確認したパッケージだけ実行を許可します。未承認のものがあると `strict-allow-scripts` でインストールが失敗します
  - 承認: `prisma`（Nodeのバージョン確認）、`@prisma/engines`（マイグレーション用エンジンの取得）
  - 拒否: `fsevents`（ビルド済みバイナリ同梱）、`unrs-resolver`（ネイティブバイナリの補完ダウンロード）
  - 新しく出てきたら `npm install-scripts ls` で確認し、中身を読んでから `npm install-scripts approve|deny <pkg>`
- **git直参照の依存は禁止**: `allow-git=none`
- **定期確認**: `npm audit` を実行し、残っているものが下記の既知事項だけであることを確認します

### 緊急のセキュリティ修正が14日未満の版にしかない場合

その版のリリースノートと差分を確認してから、そのパッケージだけ待機期間の対象外にして入れます。

```bash
npm install next@<修正版> --min-release-age-exclude=next
```

### 既知の残存事項（2026-11-03時点）

ツール類に moderate の脆弱性が残っています。どちらも修正版がまだ公開14日未満のため、待機期間が明けたら更新します。どちらもアプリのビルド成果物（`.next`）には含まれません。

- `fast-uri`（prisma CLIのローカル開発サーバー経由。`@prisma/client` が prisma CLI を依存に持つため `--omit=dev` でも表示される）: 3.1.9で修正。11/03以降に更新可能
- `minimatch`（ESLint経由、ReDoS）: 11.0.1で修正。11/10以降に更新可能
