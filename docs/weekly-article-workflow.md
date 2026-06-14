# 毎週の記事更新フロー

## 目的

ユウジさんが毎週作成する記事を、PreFlopサイトに1ページずつ追加していく。

## 更新手順

1. ユウジさんの記事本文を受け取る
2. `content/articles.js` に記事オブジェクトを追加する
3. 画像がある場合は `assets/` に追加する
4. `id` はURLになるので半角英数字とハイフンにする
5. ブラウザで記事一覧と詳細ページを確認する
6. GitにコミットしてGitHubへpushする
7. GitHub Pagesのデプロイ完了後、公開URLで確認する

## URLの考え方

記事URLは次の形式です。

```text
https://china0630-lab.github.io/preflop-poker-members/#article/{article-id}
```

サイト本体のURLは固定し、記事だけを追加していきます。

## 記事追加時のチェック

- タイトルが一覧に出ている
- 未ログイン時は会員限定ガードが出る
- ログイン後に本文が読める
- スマホで画像と本文が横にはみ出さない
- 日付とカテゴリが正しい

## Markdown原稿から雛形を作る

ユウジさんからMarkdownやテキスト原稿を受け取ったら、まず `drafts/` に保存します。

例:

```text
drafts/2026-06-20-btn-open-range.md
```

次に補助スクリプトを実行します。

```bash
node scripts/make-article.mjs drafts/2026-06-20-btn-open-range.md
```

出力された記事オブジェクトを `content/articles.js` の配列末尾に追加します。

見出しと本文の変換ルール:

- `# タイトル` → 記事タイトル
- `## 見出し` → 記事内見出し
- `> 強調文` → コールアウト
- その他の行 → 段落

このスクリプトは記事追加の下書き作成用です。最終公開前に `subtitle`, `summary`, `tags`, `category` は人の目で整えてください。
