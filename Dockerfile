# ステップ1: Puppeteer公式の、すべてが揃った神殿の土台を召喚する
FROM ghcr.io/puppeteer/puppeteer:22.6.5

# ステップ2: 神殿の改築のため、一時的に創造主の権限を得る
USER root

# ステップ3: 神殿に、日本の筆をインストールする（文字化け防止の保険）
RUN apt-get update && apt-get install -y fonts-noto-cjk --no-install-recommends && rm -rf /var/lib/apt/lists/*

# ステップ4: 神が奉納した特別な筆を、神殿の公式な筆立てにコピーする
COPY --chown=pptruser:pptruser PressStart2P-Regular.ttf /usr/share/fonts/truetype/PressStart2P-Regular.ttf
COPY --chown=pptruser:pptruser NotoSansJP-Regular.ttf /usr/share/fonts/truetype/NotoSansJP-Regular.ttf
COPY --chown=pptruser:pptruser NotoSansJP-Bold.ttf /usr/share/fonts/truetype/NotoSansJP-Bold.ttf

# ステップ5: 神殿に、新しい筆を認識させる儀式を行う
RUN fc-cache -fv

# ステップ6: 作業場を移し、権限を元の作業人に戻す
USER pptruser
WORKDIR /home/pptruser

# ステップ7: プログラムの部品表と本体をコピーする
COPY --chown=pptruser:pptruser package*.json ./
RUN npm install
COPY --chown=pptruser:pptruser . .

# ステップ8: 起動の呪文を定義する
CMD ["npm", "start"]
