const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function captureScreenshots() {
  // Create Screenshots directory if it doesn't exist
  const screenshotDir = path.join(__dirname, '..', 'Screenshots');
  if (!fs.existsSync(screenshotDir)) {
    fs.mkdirSync(screenshotDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage'],
    userDataDir: path.join(__dirname, '..', '.puppeteer-temp')
  });

  try {
    const page = await browser.newPage();

    // Set different viewport sizes
    const viewports = [
      { name: 'desktop', width: 1920, height: 1080 },
      { name: 'laptop', width: 1366, height: 768 },
      { name: 'tablet', width: 768, height: 1024 },
      { name: 'mobile', width: 375, height: 812 }
    ];

    // Navigate to the home page
    await page.goto('http://localhost:3000', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    // Capture screenshots for each viewport
    for (const viewport of viewports) {
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await new Promise(r => setTimeout(r, 1000)); // Wait for any animations

      const screenshotPath = path.join(screenshotDir, `homepage-${viewport.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      console.log(`✅ Captured ${viewport.name} screenshot: ${screenshotPath}`);
    }

    // Also capture the login page
    await page.goto('http://localhost:3000/login', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    for (const viewport of viewports) {
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await new Promise(r => setTimeout(r, 1000));

      const screenshotPath = path.join(screenshotDir, `login-${viewport.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      console.log(`✅ Captured login ${viewport.name} screenshot: ${screenshotPath}`);
    }

    // Navigate to dashboard (demo mode)
    await page.goto('http://localhost:3000/dashboard', {
      waitUntil: 'networkidle2',
      timeout: 30000
    });

    for (const viewport of viewports) {
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await new Promise(r => setTimeout(r, 1000));

      const screenshotPath = path.join(screenshotDir, `dashboard-${viewport.name}.png`);
      await page.screenshot({
        path: screenshotPath,
        fullPage: true
      });

      console.log(`✅ Captured dashboard ${viewport.name} screenshot: ${screenshotPath}`);
    }

  } catch (error) {
    console.error('Error capturing screenshots:', error);
  } finally {
    await browser.close();
  }
}

captureScreenshots();