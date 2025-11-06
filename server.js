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
  const designSettings = JSON.parse(req.body.designSettings || '{}');

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // ★★★ ここからが最後の聖句 ★★★
    // 1. まず、HTMLの構造だけを読み込ませる
    await page.setContent(htmlTemplate, {waitUntil: 'domcontentloaded'});

    // 2. 「神の目」を使い、絵描きの魂に、絶対呪文を破壊し、神のデータを注入する
    await page.evaluate((data, rank, settings) => {
      // a. 絶対呪文 window.onload を、完全に沈黙させる
      window.onload = null;

      // b. 神の真のデータを注入する
      document.getElementById('previewDummyData').value = data;
      window.globalRankValue = rank;
      
      // c. フォームに「最新の設計図」を強制的に反映させる
      populateForm(settings);

      // d. 最終的な描画を命令する
      updatePreview();
    }, chartData, globalRankValue, designSettings);
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
