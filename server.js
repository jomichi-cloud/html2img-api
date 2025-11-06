const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
app.use(express.json({limit: '2mb'}));

const API_KEY = 'kami-no-aikotoba-12345';

app.post('/html2img', async (req, res) => {
  const providedApiKey = req.headers['x-api-key'];
  if (providedApiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
  }

  const htmlTemplate = req.body.html || '<h1>NO HTML</h1>';
  const chartData = req.body.chartData || '0,0,0,0,0,0,0,0';
  const globalRankValue = req.body.globalRankValue || 0;

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // ★★★ ここからが最後の聖句 ★★★
    // 1. まず、HTMLの構造を読み込ませ、すべての筆が揃うまで待つ
    await page.setContent(htmlTemplate, {waitUntil: 'networkidle0'});

    // 2. 「神の目」を使い、絵描きの魂に直接、神のデータを書き込み、描画を強制する
    await page.evaluate((data, rank) => {
      document.getElementById('previewDummyData').value = data;
      globalRankValue = rank;
      updatePreview(); // 描画命令
    }, chartData, globalRankValue); // GASから受け取ったデータを、絵描きの魂に送る
    // ★★★ ここまでが最後の聖句 ★★★

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
