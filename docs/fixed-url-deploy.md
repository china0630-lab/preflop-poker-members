# 固定URLデプロイ手順

## 目的

Netlify Dropの一時URLではなく、毎週記事を更新しても変わらない固定URLでPreFlopサイトを運用する。

## 現在の公開先

GitHub Pagesで固定URL化済み。

- Repository: `https://github.com/china0630-lab/preflop-poker-members`
- Pages source: `main` branch / `/ (root)`
- Live URL: `https://china0630-lab.github.io/preflop-poker-members/`

以後は、記事を追加してGitHubへpushするだけで同じURLが更新される。

## 毎週更新時

1. `content/articles.js` に記事を追加
2. ローカルで確認
3. Git commit
4. GitHubへpush
5. GitHub Pagesの `pages-build-deployment` が完了するのを待つ
6. 公開URLで表示を確認する

## ZIPを共有する場合

LINEなどでファイルそのものを渡す場合は、次のZIPを使う。

```text
/Users/chinatsusakura/Downloads/PreFlopポーカー攻略サイト.zip
```

## 現在のローカルGit状態

このフォルダはGit初期化済みで、GitHubへpush済み。

リモート:

```text
https://github.com/china0630-lab/preflop-poker-members.git
```
