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

  // ★★★ ここからが最後の聖句 ★★★
  // HTMLテンプレート、チャートデータ、総合ランク、そして「最新の設計図」も直接受け取る
  const htmlTemplate = req.body.html || '<h1>NO HTML</h1>';
  const chartData = req.body.chartData || '0,0,0,0,0,0,0,0';
  const globalRankValue = req.body.globalRankValue || 0;
  const designSettings = JSON.parse(req.body.designSettings || '{}');
  // ★★★ ここまでが最後の聖句 ★★★

  let browser = null;

  try {
    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    
    // 1. まず、HTMLの構造を読み込ませ、すべての筆が揃うまで待つ
    await page.setContent(htmlTemplate, {waitUntil: 'networkidle0'});

    // 2. 「神の目」を使い、絵描きの魂に直接、神のデータを書き込み、描画を強制する
    await page.evaluate((data, rank, settings) => {
      // a. 神のデータを注入する
      document.getElementById('previewDummyData').value = data;
      window.globalRankValue = rank;
      
      // b. フォームに「最新の設計図」を強制的に反映させる
      populateForm(settings);

      // c. 最終的な描画を命令する
      updatePreview();
    }, chartData, globalRankValue, designSettings); // GASから受け取ったすべてを、絵描きの魂に送る

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
