# 固定URLデプロイ手順

## 目的

Netlify Dropの一時URLではなく、毎週記事を更新しても変わらない固定URLでPreFlopサイトを運用する。

## 推奨ルート: GitHub + Netlify

1. GitHubで新しいリポジトリを作成する
   - 推奨名: `preflop-poker-members`
   - Public/Privateはどちらでも可
2. このフォルダをリポジトリへpushする
3. Netlifyで `Add new project` → `Import an existing project`
4. GitHubの `preflop-poker-members` を選ぶ
5. Build settingsは次の通り
   - Build command: 空欄
   - Publish directory: `.`
6. Deployする
7. Netlifyの `Site configuration` → `Change site name` でURL名を固定する
   - 例: `preflop-poker-lab`
   - URL例: `https://preflop-poker-lab.netlify.app/`

以後は、記事を追加してGitHubへpushするだけで同じURLが更新される。

## ZIPアップロードで固定プロジェクトを作る場合

Netlifyの `Upload your project files` に次をアップロードする。

```text
/Users/chinatsusakura/Downloads/PreFlopポーカー攻略サイト.zip
```

注意:

- 上部のAI Agent欄にZIPを添付しない
- 画面下の `Upload your project files` の点線枠へ入れる
- 一度Netlifyプロジェクトとして作成したら、Site nameを変更してURLを固定する

## 毎週更新時

1. `content/articles.js` に記事を追加
2. ローカルで確認
3. Git commit
4. GitHubへpush
5. Netlifyが同じURLを自動更新

## 現在のローカルGit状態

このフォルダはGit初期化済み。

初回コミット:

```text
Initial PreFlop member site
```

