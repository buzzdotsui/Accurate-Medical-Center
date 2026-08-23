const { chromium } = require('playwright');

(async () => {
  console.log("Starting network audit...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();

  const requests = [];

  page.on('request', request => {
    const url = request.url();
    if (url.includes('cloudinary.com')) {
      requests.push({
        url,
        type: request.resourceType(),
        method: request.method()
      });
      console.log(`[NETWORK] -> ${request.resourceType().toUpperCase()}: ${url}`);
    }
  });

  // Navigate to localhost:3000 (wait until network is idle so we capture all eager requests)
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
  console.log("\n--- Initial Load Complete ---\n");

  const videos = requests.filter(r => r.type === 'media' || r.url.endsWith('.mp4'));
  const images = requests.filter(r => r.type === 'image' || r.url.endsWith('.jpg'));

  console.log(`Total Cloudinary Images Requested: ${images.length}`);
  console.log(`Total Cloudinary Videos Requested: ${videos.length}`);

  console.log("\nSummary of Media Requests on Initial Page Load (Viewport at Y=0):");
  videos.forEach(v => console.log(`  🎥 ${v.url}`));
  images.forEach(i => console.log(`  🖼️ ${i.url}`));

  if (videos.some(v => v.url.includes('company-video'))) {
    console.error("❌ FAILED: Company video was requested on initial load!");
  } else {
    console.log("✅ SUCCESS: Company video was NOT requested on initial load.");
  }

  if (videos.some(v => v.url.includes('slideshow'))) {
    console.error("❌ FAILED: A Look Inside carousel video was requested on initial load!");
  } else {
    console.log("✅ SUCCESS: No Look Inside carousel videos were requested on initial load.");
  }

  if (images.some(i => i.url.includes('hero.jpg'))) {
    console.log("✅ SUCCESS: Hero poster was requested.");
  } else {
    console.error("❌ FAILED: Hero poster was NOT requested!");
  }

  // Now, let's scroll down to trigger the company video
  console.log("\nScrolling down to company section to trigger lazy loading...");
  await page.evaluate(() => window.scrollTo(0, 1500));
  await page.waitForTimeout(2000); // Wait for IntersectionObserver

  const lazyVideos = requests.filter(r => r.type === 'media' && r.url.includes('company-video'));
  if (lazyVideos.length > 0) {
    console.log("✅ SUCCESS: Company video requested after scrolling.");
  } else {
    console.error("❌ FAILED: Company video NOT requested after scrolling.");
  }

  // Scroll to Look Inside
  console.log("\nScrolling down to Look Inside section...");
  await page.evaluate(() => document.querySelector('#experience')?.scrollIntoView());
  await page.waitForTimeout(2000); // Wait for IntersectionObserver
  
  const carouselVideos = requests.filter(r => r.type === 'media' && r.url.includes('slideshow'));
  if (carouselVideos.length > 0) {
    console.log("✅ SUCCESS: Active Look Inside video requested after scrolling to section.");
  } else {
    console.error("❌ FAILED: Active Look Inside video NOT requested after scrolling to section.");
  }

  await browser.close();
})();
