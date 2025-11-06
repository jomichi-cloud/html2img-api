const express = require('express');
const puppeteer = require('puppeteer');
const fs = require('fs').promises; // ★★★ 新しい道具
const path = require('path');
const app = express();
app.use(express.json({limit: '2mb'}));

const API_KEY = 'kami-no-aikotoba-12345';

// ★★★ ここからが最後の聖句 ★★★
// サーバー起動時に、一度だけ筆を魔法のインクに変えておく
let pressStartFontBase64, notoRegularFontBase64, notoBoldFontBase64;
(async () => {
    try {
        pressStartFontBase64 = await fs.readFile(path.join(__dirname, 'public', 'PressStart2P-Regular.ttf'), 'base64');
        notoRegularFontBase64 = await fs.readFile(path.join(__dirname, 'public', 'NotoSansJP-Regular.ttf'), 'base64');
        notoBoldFontBase64 = await fs.readFile(path.join(__dirname, 'public', 'NotoSansJP-Bold.ttf'), 'base64');
        console.log('Fonts loaded and converted to Base64 successfully!');
    } catch (err) {
        console.error('FATAL ERROR: Failed to load fonts. The server will not work.', err);
        process.exit(1); // 筆がなければサーバーは起動しない
    }
})();
// ★★★ ここまでが最後の聖句 ★★★

app.post('/html2img', async (req, res) => {
  const providedApiKey = req.headers['x-api-key'];
  if (providedApiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
  }

  let html = req.body.html || '<h1>NO HTML</h1>';
  let browser = null;

  try {
    // ★★★ 魔法のインクをHTMLに練り込む儀式 ★★★
    const fontFaceStyle = `
      <style>
        @font-face {
          font-family: 'Press Start 2P';
          src: url(data:font/truetype;base64,${pressStartFontBase64});
        }
        @font-face {
          font-family: 'Noto Sans JP';
          font-weight: 400;
          src: url(data:font/truetype;base64,${notoRegularFontBase64});
        }
        @font-face {
          font-family: 'Noto Sans JP';
          font-weight: 700;
          src: url(data:font/truetype;base64,${notoBoldFontBase64});
        }
      </style>
    `;
    html = html.replace('</head>', `${fontFaceStyle}</head>`);
    html = html.replace(/<link href="https:\/\/fonts\.googleapis\.com\/[^>]+>/g, '');

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    await page.setContent(html, {waitUntil: 'networkidle0'});

    const dimensions = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return {
        width: canvas ? canvas.width : 440,
        height: canvas ? canvas.height : 500,
      };
    });
    await page.setViewport({ width: dimensions.width, height: dimensions.height });

    const image = await page.screenshot({type: 'png'});
    
    res.set('Content-Type', 'image/png');
    res.send(image);

  } catch (e) {
    res.status(500).json({error: e.message});
  } finally {
    if (browser !== null) {
      await browser.close();
    }
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server started');
});
