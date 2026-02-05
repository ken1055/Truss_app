# Truss App - Supabase セットアップガイド

このガイドでは、TrussアプリのSupabaseデータベースのセットアップ方法を説明します。

## 目次

1. [Supabaseプロジェクトの作成](#1-supabaseプロジェクトの作成)
2. [データベースのセットアップ](#2-データベースのセットアップ)
3. [環境変数の設定](#3-環境変数の設定)
4. [認証の設定](#4-認証の設定)
5. [ストレージの設定](#5-ストレージの設定)
6. [アプリへの統合](#6-アプリへの統合)

---

## 1. Supabaseプロジェクトの作成

1. [Supabase](https://supabase.com) にアクセスしてアカウントを作成
2. 「New Project」をクリック
3. プロジェクト情報を入力：
   - **Name**: `truss-app`（任意）
   - **Database Password**: 強力なパスワードを設定（後で使用するので保存しておく）
   - **Region**: `Northeast Asia (Tokyo)` を推奨
4. 「Create new project」をクリック

## 2. データベースのセットアップ

### SQLエディタでマイグレーションを実行

1. Supabaseダッシュボードで「SQL Editor」を開く
2. 以下のファイルを順番に実行：

#### Step 1: 初期スキーマ
`supabase/migrations/001_initial_schema.sql` の内容をコピーして実行

#### Step 2: ヘルパー関数
`supabase/migrations/002_functions.sql` の内容をコピーして実行

#### Step 3: ストレージ設定
`supabase/migrations/003_storage.sql` の内容をコピーして実行

### テーブル構造

作成されるテーブル：

| テーブル名 | 説明 |
|-----------|------|
| `users` | ユーザー情報 |
| `events` | イベント情報 |
| `event_participants` | イベント参加者 |
| `event_likes` | イベントいいね |
| `messages` | メッセージ |
| `chat_thread_metadata` | チャットスレッドメタデータ |
| `notifications` | 通知 |
| `board_posts` | 掲示板投稿 |
| `board_post_replies` | 掲示板返信 |
| `board_post_interests` | 掲示板興味 |
| `gallery_photos` | ギャラリー写真 |
| `gallery_photo_likes` | 写真いいね |

## 3. 環境変数の設定

1. Supabaseダッシュボードで「Settings」→「API」を開く
2. 以下の値をコピー：
   - **Project URL**: `https://xxxxx.supabase.co`
   - **anon public key**: `eyJhbGci...`

3. プロジェクトルートに `.env` ファイルを作成：

```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

> ⚠️ `.env` ファイルは `.gitignore` に追加して、Gitにコミットしないでください。

## 4. 認証の設定

### メール認証の設定

1. Supabaseダッシュボードで「Authentication」→「Providers」を開く
2. 「Email」が有効になっていることを確認
3. 「Email Templates」でメールテンプレートをカスタマイズ（オプション）

### リダイレクトURLの設定

1. 「Authentication」→「URL Configuration」を開く
2. 以下を設定：
   - **Site URL**: `http://localhost:5173`（開発時）または本番URL
   - **Redirect URLs**: 
     - `http://localhost:5173/auth/callback`
     - `https://your-production-url.com/auth/callback`

### メール送信の設定（本番環境）

1. 「Project Settings」→「Authentication」を開く
2. 「SMTP Settings」でカスタムSMTPサーバーを設定
   - 推奨: SendGrid, Mailgun, Amazon SES など

## 5. ストレージの設定

マイグレーション `003_storage.sql` を実行すると、以下のバケットが作成されます：

| バケット名 | 公開設定 | 用途 |
|-----------|---------|------|
| `student-id-images` | Private | 学生証画像（承認後削除） |
| `event-images` | Public | イベント画像 |
| `gallery-photos` | Public | ギャラリー写真 |
| `user-avatars` | Public | ユーザーアバター |

### 手動でバケットを作成する場合

1. Supabaseダッシュボードで「Storage」を開く
2. 「New bucket」をクリック
3. 上記の設定でバケットを作成

## 6. アプリへの統合

### 依存関係のインストール

```bash
npm install @supabase/supabase-js
```

### 使用例

#### 認証

```typescript
import { signUp, signIn, signOut } from './lib/supabase';

// サインアップ
const { data, error } = await signUp('user@example.com', 'password123');

// サインイン
const { data, error } = await signIn('user@example.com', 'password123');

// サインアウト
const { error } = await signOut();
```

#### データ取得（hooks使用）

```typescript
import { useCurrentUser, useEvents, useBoardPosts } from './hooks/useSupabase';

function MyComponent() {
  // 現在のユーザー
  const { user, loading, updateUser } = useCurrentUser();
  
  // イベント一覧
  const { events, createEvent, updateEvent, deleteEvent } = useEvents();
  
  // 掲示板投稿
  const { posts, createPost, addReply } = useBoardPosts();
  
  // ...
}
```

#### リアルタイム購読

```typescript
import { subscribeToMessages, subscribeToNotifications } from './lib/supabase';

// メッセージの購読
const channel = subscribeToMessages(userId, (payload) => {
  console.log('New message:', payload.new);
});

// クリーンアップ
channel.unsubscribe();
```

## トラブルシューティング

### よくある問題

#### 1. RLSエラー
- Row Level Security (RLS) が有効な場合、適切なポリシーが設定されていることを確認
- 開発中はSupabaseダッシュボードで「Disable RLS」を一時的に有効にしてデバッグ可能

#### 2. 認証エラー
- `.env` ファイルのURLとキーが正しいか確認
- Supabaseダッシュボードで認証プロバイダーが有効か確認

#### 3. ストレージエラー
- バケットのポリシーが正しく設定されているか確認
- ファイルサイズ制限を超えていないか確認

### デバッグ方法

```typescript
// Supabaseクライアントでエラーをログ
const { data, error } = await supabase.from('users').select('*');
if (error) {
  console.error('Supabase error:', error.message, error.details, error.hint);
}
```

## 管理者アカウントの作成

初期管理者を作成するには、SQLエディタで以下を実行：

```sql
-- まず通常通りサインアップしてから、以下を実行
UPDATE users
SET is_admin = TRUE
WHERE email = 'admin@example.com';
```

## 本番環境への移行チェックリスト

- [ ] 本番用のSupabaseプロジェクトを作成
- [ ] すべてのマイグレーションを実行
- [ ] 環境変数を本番用に更新
- [ ] カスタムSMTPを設定
- [ ] リダイレクトURLを本番URLに更新
- [ ] RLSポリシーをテスト
- [ ] バックアップを設定

---

## サポート

問題が発生した場合は、以下を確認してください：

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Discord](https://discord.supabase.com)
- [GitHub Issues](https://github.com/supabase/supabase/issues)
