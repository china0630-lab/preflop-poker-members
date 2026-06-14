# 会員制サイト化メモ

## 現在の状態

Supabase設定を入れると、会員登録とログイン情報はSupabase Authで管理できます。
Supabase未設定時だけ、フロントエンドの簡易実装にフォールバックします。

- ユーザー情報: Supabase Auth
- 招待コード: Supabase `preflop_invite_codes`
- 会員状態: Supabase `preflop_profiles.membership_status`

セットアップ手順は `docs/supabase-member-management.md` を参照してください。

## 入力項目の方針

現時点では、登録時にゲスト名は求めません。

- 必須: ログインID/メール、パスワード、招待コード
- 不要: ゲスト名、住所、電話番号、SNSアカウント

集める情報は少ないほど管理リスクが下がります。

## 本番で必要なもの

- サーバー側のユーザー管理: Supabase Authで対応
- パスワードの安全な保存: Supabase Authで対応
- 招待コードのサーバー側検証: `claim_preflop_invite_code` で対応
- 会員限定コンテンツのサーバー側保護
- パスワード再設定
- 管理者による招待コード発行

## 推奨構成

最短で進めるなら、現在のGitHub Pages公開を活かしつつ、認証と会員データだけ外部サービスに持たせる構成が現実的です。

```text
GitHub Pages Hosting
Supabase Auth
Supabase Database
```

記事は最初は `content/articles.js` 管理で始め、会員数が増えたらCMSやDBへ移行できます。

## 共有前の注意

GitHub Pages上の静的サイトでは、JavaScriptや画像ファイル自体は公開されています。
そのため、現在の「会員限定」は友人向けの確認やデザイン検証には使えますが、有料会員コンテンツを本気で守る用途には使えません。

本当に保護したい場合は、ログイン済みユーザーだけが記事本文をサーバーから取得できる構成に切り替えます。
