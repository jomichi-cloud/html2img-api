const express = require('express');
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const app = express();
app.use(express.json({limit: '2mb'}));

const API_KEY = 'kami-no-aikotoba-12345';

app.post('/html2img', async (req, res) => {
  const providedApiKey = req.headers['x-api-key'];
  if (providedApiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
  }

  const html = req.body.html || '<h1>NO HTML</h1>';
  let browser = null;

  try {
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, {waitUntil: 'domcontentloaded'}); // ★★★ まずHTML構造を読み込む

    // ★★★ 神のフォントが読み込まれるまで、ひたすら待つ命令 ★★★
    await page.evaluateHandle('document.fonts.ready');

    // ★★★ 神のデザインの大きさをHTMLから読み取り、窓の大きさを合わせる命令 ★★★
    const dimensions = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return {
        width: canvas ? canvas.width : 440, // デフォルト440px
        height: canvas ? canvas.height : 500, // デフォルト500px
      };
    });
    await page.setViewport({ width: dimensions.width, height: dimensions.height });

    // ★★★ 完璧な状態で撮影する命令 ★★★
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
