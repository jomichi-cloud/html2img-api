const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
app.use(express.json({limit: '5mb'})); // 容量を少し増やす

const API_KEY = 'kami-no-aikotoba-12345';

app.post('/html2img', async (req, res) => {
  const providedApiKey = req.headers['x-api-key'];
  if (providedApiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
  }

  // 描画プログラムの魂、チャートデータ、総合ランク、そして「最新の設計図」を直接受け取る
  const drawingScript = req.body.drawingScript || '';
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
    
    // 1. まっさらな、清浄な体（HTML）を用意する
    const cleanHtml = `
      <!DOCTYPE html>
      <html>
      <head><meta charset="utf-8"></head>
      <body>
        <!-- 描画の器と、データの一時的な保管場所だけを用意 -->
        <canvas id="myChart"></canvas>
        <input type="hidden" id="previewDummyData">
      </body>
      </html>
    `;
    await page.setContent(cleanHtml, {waitUntil: 'domcontentloaded'});

    // 2. 「神の目」を使い、清浄な体に、魂とデータを注入し、描画を強制する
    await page.evaluate((script, data, rank, settings) => {
      // a. 描画プログラムの魂を注入する
      const scriptTag = document.createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.text = script;
      document.body.appendChild(scriptTag);

      // b. 神の真のデータを注入する
      document.getElementById('previewDummyData').value = data;
      window.globalRankValue = rank;
      
      // c. フォームに「最新の設計図」を強制的に反映させる
      //    この時、HTMLに存在しないフォーム要素は無視される
      populateForm(settings);

      // d. 最終的な描画を命令する
      updatePreview();
    }, drawingScript, chartData, globalRankValue, designSettings);

    const dimensions = await page.evaluate(() => {
      const canvas = document.querySelector('canvas');
      return {
        width: canvas.width,
        height: canvas.height,
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
