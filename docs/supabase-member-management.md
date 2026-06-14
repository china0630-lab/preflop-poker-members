# Supabase会員管理セットアップ

## 目的

ログインID/メール、パスワード、招待コード、会員ステータスをSupabase側で管理する。

現在の想定:

- 最初は無料会員20名程度
- 将来は月額課金の有料会員サイトへ移行
- 登録時にゲスト名は集めない

## 1. Supabaseプロジェクトを作る

Supabaseで新規プロジェクトを作成する。

控えるもの:

- Project URL
- anon public key

どちらも `Project Settings` → `API` で確認できます。

## 2. SQLを実行する

Supabaseの `SQL Editor` で、次を実行する。

```text
supabase/schema.sql
```

作成されるもの:

- `preflop_profiles`
  - ユーザーごとの会員状態
  - `membership_status`: `inactive`, `free`, `trialing`, `active`, `past_due`, `canceled`
  - `plan`: `free`, `monthly`, `annual`
- `preflop_invite_codes`
  - 招待コードと利用上限
- `preflop_invite_redemptions`
  - 誰がどの招待コードを使ったか
- `claim_preflop_invite_code`
  - 登録者が招待コードを使って会員化する関数

## 3. サイトにSupabase設定を入れる

`supabase-config.js` を編集する。

```js
window.PREFLOP_SUPABASE_CONFIG = {
  enabled: true,
  url: "https://YOUR_PROJECT_ID.supabase.co",
  anonKey: "YOUR_SUPABASE_ANON_KEY"
};
```

`anonKey` はブラウザで使う公開キーです。SupabaseはRLSで守る前提なので、service role keyは絶対に入れません。

## 4. 認証設定

Supabaseの `Authentication` で確認する。

- Email provider: 有効
- Password signups: 有効
- Site URL:

```text
https://china0630-lab.github.io/preflop-poker-members/
```

Redirect URLsにも同じURLを追加する。

## 5. 招待コード管理

初期SQLでは次のコードを20名まで使えるようにしています。

```text
PREFLOP-2026
YUJI-WEEKLY
RANGE-LAB
```

追加する場合:

```sql
insert into public.preflop_invite_codes (code, max_uses, membership_status, plan)
values ('NEW-CODE-2026', 20, 'free', 'free');
```

無効化する場合:

```sql
update public.preflop_invite_codes
set max_uses = used_count
where code = 'NEW-CODE-2026';
```

## 6. 有料会員への移行

将来、月額課金を始める場合はStripe連携を追加する。
詳しい段階設計は `docs/paid-membership-roadmap.md` を参照してください。

最小構成:

- Stripe Checkoutで決済
- 決済成功Webhookで `preflop_profiles.membership_status = 'active'`
- 解約/支払い失敗Webhookで `past_due` または `canceled`

この時点では、`preflop_profiles` に以下の列をすでに用意済み。

- `stripe_customer_id`
- `stripe_subscription_id`

## 7. 重要な注意

Supabase Authでログイン情報は管理できます。
ただし、現在の記事本文は `content/articles.js` に入っているため、HTML/JSを直接見る人から完全には隠せません。

有料記事を本当に守る段階では、記事本文もSupabase DatabaseまたはStorageに移し、ログイン済みで `membership_status = active` の人だけ取得できる構成にします。
