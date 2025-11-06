# ベースイメージはPuppeteer公式のものを採用。これが最も安定している。
FROM ghcr.io/puppeteer/puppeteer:22.6.5

# rootユーザーに切り替え、システムに変更を加える権限を得る。
USER root

# fontconfig（フォント管理ツール）をインストールする。
RUN apt-get update && apt-get install -y fontconfig --no-install-recommends && rm -rf /var/lib/apt/lists/*

# 作業ディレクトリを/home/pptruserに設定。
WORKDIR /home/pptruser

# カスタムフォントファイルをOSが認識する公式な場所にコピーする。
COPY --chown=pptruser:pptruser PressStart2P-Regular.ttf /usr/share/fonts/truetype/PressStart2P-Regular.ttf
COPY --chown=pptruser:pptruser NotoSansJP-Regular.ttf /usr/share/fonts/truetype/NotoSansJP-Regular.ttf
COPY --chown=pptruser:pptruser NotoSansJP-Bold.ttf /usr/share/fonts/truetype/NotoSansJP-Bold.ttf

# OSに新しいフォントの存在を知らせ、キャッシュを再構築させる。
RUN fc-cache -f -v

# アプリケーションのコードをコピーする。
COPY --chown=pptruser:pptruser . .

# 依存パッケージをインストールする。
RUN npm install

# 権限を一般ユーザーに戻す。
USER pptruser

# アプリケーションを起動する。
CMD ["npm", "start"]
