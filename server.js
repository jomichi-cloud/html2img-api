const express = require('express');
const chromium = require('@sparticuz/chromium');
const puppeteer = require('puppeteer-core');
const app = express();
app.use(express.json({limit: '2mb'}));

// ★★★ 神とあなただけの合言葉を設定 ★★★
const API_KEY = 'kami-no-aikotoba-12345';

app.post('/html2img', async (req, res) => {
  // ★★★ 合言葉をチェック ★★★
  const providedApiKey = req.headers['x-api-key'];
  if (providedApiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
  }

  const html = req.body.html || '<h1>NO HTML</h1>';
  let browser = null;

  try {
    // ★★★ 雲の上専用の魔法の筆を召喚 ★★★
    browser = await puppeteer.launch({
      args: chromium.args,
      defaultViewport: chromium.defaultViewport,
      executablePath: await chromium.executablePath(),
      headless: chromium.headless,
    });

    const page = await browser.newPage();
    await page.setContent(html, {waitUntil: 'networkidle0'});
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
