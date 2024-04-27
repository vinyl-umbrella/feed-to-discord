# feed-to-discord

## 概要
RSSの更新があれば，discordに記事のURLを投げるbotです．<br/>
- [x] 複数のサーバに対応
- [x] 複数のチャンネルに対応
- [x] スレッドにも対応

## 導入方法
### .envを設定
```
DB_ROOT_PASSWORD=    # mysqlのrootパスワード
DB_USER=             # mysqlのユーザ名
DB_DATABASE=         # mysqlのDB名
DB_PASSWORD=         # mysqlのパスワード
DB_PORT=             # mysqlのポート番号
TOKEN=               # discord botのトークン
```

### 起動
```sh
docker compose up -d
```

## botコマンド
- `/subscribe url`: 任意のRSSのURLを登録する
- `/unsubscribe url`: 任意のRSSのURLを登録解除する
- `/list`: このコマンドを実行したチャンネル(スレッド)の登録済みのRSSを表示する
- `/listall`: このコマンドを実行したサーバの登録済みのRSSを表示する
- `/help`: ヘルプを表示する
