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

  // HTMLテンプレート、チャートデータ、総合ランク値を直接受け取る
  const htmlTemplate = req.body.html || '<h1>NO HTML</h1>';
  const chartData = req.body.chartData || '0,0,0,0,0,0,0,0';
  const globalRankValue = req.body.globalRankValue || 0;

  let browser = null;

  try {
    // HTMLから、不要な呪文を破壊し、浄化する
    let finalHtml = htmlTemplate
      .replace(/<link href="https:\/\/fonts\.googleapis\.com\/[^>]+>/g, '')
      .replace(/const base64JsonString = '[^']+/g, 'const base64JsonString = null;');

    // サーバー自身の手で、神のデータをHTMLに注入する
    const dataInjectionScript = `
      <script>
        document.getElementById('previewDummyData').value = '${chartData}';
        globalRankValue = ${globalRankValue};
        window.onload(); // 強制的に再描画をトリガー
      </script>
    `;
    finalHtml = finalHtml.replace('</body>', `${dataInjectionScript}</body>`);

    browser = await puppeteer.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--single-process',
        '--disable-gpu'
      ]
    });

    const page = await browser.newPage();
    await page.setContent(finalHtml, {waitUntil: 'networkidle0'});

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
