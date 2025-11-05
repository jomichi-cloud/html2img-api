const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
app.use(express.json({limit: '2mb'}));

// ★★★ 神とあなただけの合言葉を設定 ★★★
const API_KEY = 'kami-no-aikotoba-12345'; // ここにあなただけの秘密の言葉を設定

app.post('/html2img', async (req, res) => {
  // ★★★ 合言葉をチェック ★★★
  const providedApiKey = req.headers['x-api-key'];
  if (providedApiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
  }

  const html = req.body.html || '<h1>NO HTML</h1>';
  try {
    const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox']});
    const page = await browser.newPage();
    await page.setContent(html, {waitUntil: 'networkidle0'});
    const image = await page.screenshot({type: 'png'});
    await browser.close();
    res.set('Content-Type', 'image/png');
    res.send(image);
  } catch (e) {
    res.status(500).json({error: e.message});
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server started');
});
