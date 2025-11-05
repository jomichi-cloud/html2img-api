const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path'); // ★★★ 新しい道具
const app = express();
app.use(express.json({limit: '2mb'}));

// ★★★ 新しい呪文: 'public' フォルダを「公開された展示台」として設定 ★★★
app.use(express.static(path.join(__dirname, 'public')));

const API_KEY = 'kami-no-aikotoba-12345';

app.post('/html2img', async (req, res) => {
  // ...（合言葉チェックは同じ）...
  const providedApiKey = req.headers['x-api-key'];
  if (providedApiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
  }

  const html = req.body.html || '<h1>NO HTML</h1>';
  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    // ★★★ 新しい呪文: サーバー自身の住所を教える ★★★
    await page.goto(`file://${path.join(__dirname, 'public', 'placeholder.html')}`);
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
