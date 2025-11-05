# ステップ1: 神殿の土台を築く (Node.js 18)
FROM node:18-slim

# ステップ2: 魔法の筆を動かすための、すべての聖なる部品をインストールする
RUN apt-get update && apt-get install -y \
    gconf-service \
    libasound2 \
    libatk1.0-0 \
    libatk-bridge2.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgcc1 \
    libgconf-2-4 \
    libgdk-pixbuf2.0-0 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxss1 \
    libxtst6 \
    ca-certificates \
    fonts-liberation \
    libappindicator1 \
    libnss3 \
    lsb-release \
    xdg-utils \
    wget \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# ステップ3: 作業場を作る
WORKDIR /app

# ステップ4: プログラムの部品表を先にコピーする
COPY package*.json ./

# ステップ5: 部品を組み立てる
RUN npm install

# ステップ6: プログラム本体と、奉納した筆をすべてコピーする
COPY . .

# ステップ7: 起動の呪文を定義する
CMD ["npm", "start"]
