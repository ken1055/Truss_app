# Truss App - 本番環境移行ガイド

## 概要

開発環境のSupabaseから、本番環境用の新しいSupabaseプロジェクトへ移行する手順です。

---

## 必要なもの

1. 新しいSupabaseアカウント/プロジェクト
2. Vercelアカウント（既存）
3. Google Cloud Console アクセス（OAuth設定用）

---

## Step 1: 新しいSupabaseプロジェクトを作成

1. https://supabase.com にアクセス
2. 新しいアカウントでサインアップ、または既存アカウントでログイン
3. **「New Project」** をクリック
4. 以下を設定：
   - **Project name**: `truss-production`（任意）
   - **Database Password**: 強力なパスワードを設定（メモしておく）
   - **Region**: `Northeast Asia (Tokyo)` を推奨
5. **「Create new project」** をクリック

---

## Step 2: データベーススキーマを作成

1. Supabase Dashboard → **SQL Editor** を開く
2. `supabase/PRODUCTION_SETUP.sql` の内容をコピー
3. SQL Editorに貼り付けて **「Run」** をクリック
4. 成功メッセージを確認

---

## Step 3: 管理者アカウントを作成

1. Supabase Dashboard → **Authentication** → **Users**
2. **「Add user」** をクリック
3. 以下を入力：
   - **Email**: `admin@truss.com`
   - **Password**: `j6u@KVv5&P#v`（または任意）
   - ☑️ **Auto Confirm User** にチェック
4. **「Create user」** をクリック

5. SQL Editorで以下を実行（IDを確認）：
```sql
SELECT id FROM auth.users WHERE email = 'admin@truss.com';
```

6. 取得したIDを使って以下を実行：
```sql
INSERT INTO public.users (id, auth_id, email, name, is_admin, approved, category, registration_step, email_verified, profile_completed, fee_paid)
VALUES (
  '取得したID',
  '取得したID',
  'admin@truss.com',
  '管理者',
  true,
  true,
  'japanese',
  'fully_active',
  true,
  true,
  true
);
```

---

## Step 4: Google OAuth を設定

### 4.1 Google Cloud Console で設定

1. https://console.cloud.google.com にアクセス
2. プロジェクトを選択（または新規作成）
3. **APIs & Services** → **Credentials** に移動
4. **「CREATE CREDENTIALS」** → **「OAuth client ID」**
5. **Application type**: `Web application`
6. **Name**: `Truss Production`
7. **Authorized redirect URIs** に以下を追加：
   ```
   https://YOUR_SUPABASE_PROJECT_ID.supabase.co/auth/v1/callback
   ```
   ※ `YOUR_SUPABASE_PROJECT_ID` はSupabase DashboardのURL（例: `abcdefghijk`）
8. **「CREATE」** をクリック
9. **Client ID** と **Client Secret** をメモ

### 4.2 Supabase で Google Provider を有効化

1. Supabase Dashboard → **Authentication** → **Providers**
2. **Google** をクリック
3. **Enable Google provider** をON
4. **Client ID** と **Client Secret** を入力
5. **「Save」** をクリック

---

## Step 5: 環境変数を取得

Supabase Dashboard → **Settings** → **API** から以下をメモ：

| 項目 | 場所 |
|------|------|
| `VITE_SUPABASE_URL` | Project URL |
| `VITE_SUPABASE_ANON_KEY` | anon / public key |

---

## Step 6: Vercel の環境変数を更新

1. https://vercel.com にログイン
2. Trussプロジェクトを選択
3. **Settings** → **Environment Variables**
4. 以下の変数を **更新**：

| Name | Value |
|------|-------|
| `VITE_SUPABASE_URL` | 新しいSupabaseのProject URL |
| `VITE_SUPABASE_ANON_KEY` | 新しいSupabaseのanon key |

5. **「Save」** をクリック

---

## Step 7: 再デプロイ

1. Vercel Dashboard → **Deployments**
2. 最新のデプロイの **「...」** → **「Redeploy」**
3. デプロイ完了を待つ

---

## Step 8: 動作確認

1. アプリにアクセス
2. Google でログインできるか確認
3. 管理者アカウント（`admin@truss.com`）でログインできるか確認
4. 各機能が動作するか確認

---

## トラブルシューティング

### ログインできない
- Google OAuth の Redirect URI が正しいか確認
- Supabase の Google Provider が有効か確認

### データが表示されない
- 環境変数が正しく設定されているか確認
- Vercel で再デプロイしたか確認

### 500エラーが出る
- SQL が正しく実行されたか確認
- Supabase Dashboard → Database → Tables でテーブルが存在するか確認

---

## データ移行（オプション）

既存の開発環境からデータを移行したい場合：

1. 開発環境のSupabase Dashboard → **Table Editor**
2. 各テーブルを選択 → **「Export」** → **CSV**
3. 本番環境のSupabase Dashboard → **Table Editor**
4. 各テーブルを選択 → **「Import」** → CSVをアップロード

**注意**: `users` テーブルは `auth.users` と連携しているため、手動での移行が複雑です。新規ユーザーとして再登録することを推奨します。

---

## 完了チェックリスト

- [ ] 新しいSupabaseプロジェクト作成
- [ ] PRODUCTION_SETUP.sql 実行
- [ ] 管理者アカウント作成
- [ ] Google OAuth 設定
- [ ] Vercel 環境変数更新
- [ ] 再デプロイ
- [ ] 動作確認
