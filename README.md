# PreFlop ポーカー攻略班

会員制ポーカー攻略サイトの静的プロトタイプです。

## できること

- 毎週の記事追加: `content/articles.js` に記事オブジェクトを追加
- 会員登録ベース: ログインID、パスワード、招待コード
- 招待コード: `PREFLOP-2026`, `YUJI-WEEKLY`, `RANGE-LAB`
- 会員限定記事: 未ログインの場合はログイン/登録画面へ誘導
- 固定URL運用: GitHub Pagesで公開し、同じサイトURLを維持

## 公開URL

```text
https://china0630-lab.github.io/preflop-poker-members/
```

## 毎週の記事更新

1. `content/articles.js` を開く
2. 既存の記事オブジェクトをコピーする
3. `id`, `title`, `date`, `body` を更新する
4. GitへコミットしてGitHubへpushする

記事本文の型は `templates/article-template.js` を参照してください。

Markdown原稿から記事オブジェクトの雛形を作る場合:

```bash
node scripts/make-article.mjs drafts/weekly-article-sample.md
```

## 固定URL運用

GitHub Pagesを使っているため、毎週記事を追加しても公開URLは変わりません。

- Repository: `https://github.com/china0630-lab/preflop-poker-members`
- Pages source: `main` branch / `/ (root)`
- Live URL: `https://china0630-lab.github.io/preflop-poker-members/`

以後は、記事を追加して`main`へpushするだけで同じURLが更新されます。

## 本番会員制にする場合

このプロトタイプのログイン情報はブラウザのlocalStorageに保存する簡易実装です。
本番公開時は、次のいずれかに置き換えてください。

- Supabase Auth
- Firebase Auth
- 独自バックエンド認証

招待コードも本番ではサーバー側で検証する必要があります。
