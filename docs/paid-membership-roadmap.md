# 有料会員化ロードマップ

## 現在の段階

無料会員20名程度を想定し、Supabaseで次を管理する。

- メール/パスワードログイン
- 招待コード
- 会員ステータス
- 無料会員/有料会員へ移行できるプロフィール情報

## 会員ステータス

`preflop_profiles.membership_status` で管理する。

```text
inactive  未承認・招待コード未適用
free      無料会員
trialing  有料トライアル
active    有料会員
past_due  支払い失敗
canceled  解約済み
```

## 無料期間の運用

無料会員を招待する場合:

```sql
insert into public.preflop_invite_codes (code, max_uses, membership_status, plan)
values ('FREE-FOUNDERS-2026', 20, 'free', 'free');
```

退会・停止する場合:

```sql
update public.preflop_profiles
set membership_status = 'inactive'
where email = 'user@example.com';
```

## 月額課金を始める時

次の順番で追加する。

1. Stripeアカウントを作る
2. 月額商品を作る
3. Stripe Checkoutを追加する
4. Stripe WebhookでSupabaseの `preflop_profiles` を更新する
5. 有料記事本文をSupabase DatabaseまたはStorageへ移す

Webhookで更新する値:

```text
checkout.session.completed -> active
invoice.payment_failed -> past_due
customer.subscription.deleted -> canceled
```

## 重要

Supabase Authだけでは、GitHub Pages上の静的な記事データを完全には隠せません。
月額課金を開始する前に、記事本文もSupabase側へ移し、`membership_status = active` のユーザーだけ取得できるようにします。
