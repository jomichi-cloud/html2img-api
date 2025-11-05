# ステップ1: 神殿の土台を築く (Node.js 18)
FROM node:18-slim

# ステップ2: 神殿に、日本の筆と神の筆をインストールする
RUN apt-get update && apt-get install -y \
    fonts-noto-cjk \
    fontconfig \
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
