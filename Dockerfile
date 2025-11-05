# ステップ1: Puppeteer公式の、すべてが揃った神殿の土台を召喚する
FROM ghcr.io/puppeteer/puppeteer:22.6.5

# ステップ2: 作業場を移し、権限を正しく設定する
WORKDIR /home/pptruser
COPY --chown=pptruser:pptruser . .

# ステップ3: 部品を組み立てる
RUN npm install

# ステップ4: 起動の呪文を定義する
CMD ["npm", "start"]
