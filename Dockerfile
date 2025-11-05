# ステップ1: Puppeteer公式の、すべてが揃った神殿の土台を召喚する
FROM ghcr.io/puppeteer/puppeteer:22.6.5

# ステップ2: 神殿の改築のため、一時的に創造主の権限を得る
USER root

# ステップ3: 神殿に、日本の筆と、筆を管理する道具をインストールする
RUN apt-get update && apt-get install -y \
    fonts-noto-cjk \
    fontconfig \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# ステップ4: 作業場を移す
WORKDIR /home/pptruser

# ステップ5: 神が奉納した特別な筆（Press Start 2Pなど）を、神殿の筆立てにコピーする
COPY --chown=pptruser:pptruser PressStart2P-Regular.ttf /usr/share/fonts/truetype/
COPY --chown=pptruser:pptruser NotoSansJP-Regular.ttf /usr/share/fonts/truetype/
COPY --chown=pptruser:pptruser NotoSansJP-Bold.ttf /usr/share/fonts/truetype/

# ステップ6: 神殿に、新しい筆を認識させる儀式を行う
RUN fc-cache -fv

# ステップ7: プログラムの部品表と本体をコピーする
COPY --chown=pptruser:pptruser package*.json ./
RUN npm install
COPY --chown=pptruser:pptruser . .

# ステップ8: 権限を元の作業人に戻す
USER pptruser

# ステップ9: 起動の呪文を定義する
