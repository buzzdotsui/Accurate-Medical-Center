const fs = require('fs');
const path = require('path');
const https = require('https');

const fontsDir = path.join(__dirname, '../public/fonts');

if (!fs.existsSync(fontsDir)) {
  fs.mkdirSync(fontsDir, { recursive: true });
}

const fontsToDownload = [
  {
    name: 'Inter',
    url: 'https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap',
    filename: 'Inter-Variable.woff2'
  },
  {
    name: 'Plus Jakarta Sans',
    url: 'https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@200..800&display=swap',
    filename: 'PlusJakartaSans-Variable.woff2'
  },
  {
    name: 'Playfair Display',
    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:wght@400..900&display=swap',
    filename: 'PlayfairDisplay-Variable.woff2'
  },
  {
    name: 'Playfair Display Italic',
    url: 'https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@1,400..900&display=swap',
    filename: 'PlayfairDisplay-Italic-Variable.woff2'
  }
];

async function fetchCss(url) {
  return new Promise((resolve, reject) => {
    https.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
    }).on('error', reject);
  });
}

async function downloadFile(url, dest) {
  return new Promise((resolve, reject) => {
    const file = fs.createWriteStream(dest);
    https.get(url, (res) => {
      res.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve();
      });
    }).on('error', (err) => {
      fs.unlink(dest, () => {});
      reject(err);
    });
  });
}

async function main() {
  for (const font of fontsToDownload) {
    console.log(`Fetching CSS for ${font.name}...`);
    const css = await fetchCss(font.url);
    
    // Extract the latin woff2 URL (since subsets: ["latin"] is used in layout.tsx)
    let woff2Url = '';
    const regex = /src:\s*url\((https:\/\/[^)]+\.woff2)\)/g;
    
    const latinMatch = css.match(/\/\*\s*latin\s*\*\/[\s\S]*?src:\s*url\((https:\/\/[^)]+\.woff2)\)/);
    if (latinMatch) {
      woff2Url = latinMatch[1];
    } else {
      const match = regex.exec(css);
      if (match) woff2Url = match[1];
    }
    
    if (woff2Url) {
      console.log(`Downloading ${font.name} from ${woff2Url}...`);
      await downloadFile(woff2Url, path.join(fontsDir, font.filename));
      console.log(`Saved to ${font.filename}`);
    } else {
      console.error(`Failed to find WOFF2 URL for ${font.name}`);
    }
  }
}

main().catch(console.error);
