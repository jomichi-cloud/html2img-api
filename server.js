const express = require('express');
const puppeteer = require('puppeteer');
const app = express();
app.use(express.json({limit: '5mb'}));

const API_KEY = 'kami-no-aikotoba-12345';

app.post('/html2img', async (req, res) => {
  const providedApiKey = req.headers['x-api-key'];
  if (providedApiKey !== API_KEY) {
    return res.status(403).json({ error: 'Forbidden: Invalid API Key' });
  }

  // 描画ロジック、データ、設計図を直接受け取る
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
        <canvas id="myChart"></canvas>
        <input type="hidden" id="previewDummyData">
      </body>
      </html>
    `;
    await page.setContent(cleanHtml, {waitUntil: 'domcontentloaded'});

    // 2. 「神の目」を使い、清浄な体に、魂とデータを注入し、描画を強制する
    await page.evaluate((script, data, rank, settings) => {
      const scriptTag = document.createElement('script');
      scriptTag.type = 'text/javascript';
      scriptTag.text = script;
      document.body.appendChild(scriptTag);

      document.getElementById('previewDummyData').value = data;
      window.globalRankValue = rank;
      
      // HTMLに存在しないフォーム要素は無視される
      if (typeof populateForm === 'function') {
        populateForm(settings);
      }
      if (typeof updatePreview === 'function') {
        updatePreview();
      }
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
