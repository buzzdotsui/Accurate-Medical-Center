const { chromium } = require('playwright');

(async () => {
  console.log("Starting functional end-to-end audit...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  
  const results = {
    public_homepage: false,
    look_inside_videos: [],
    book_appointment: false,
    login_page: false,
  };

  try {
    // 1. PUBLIC WEBSITE - HOMEPAGE
    console.log("Testing Homepage (/)");
    const response = await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    if (response.ok()) results.public_homepage = true;
    
    // Scroll through to test Look Inside
    console.log("Scrolling to Look Inside...");
    await page.evaluate(() => document.querySelector('#experience')?.scrollIntoView());
    await page.waitForTimeout(2000);
    
    // Get all Look Inside Slides
    const slides = await page.$$eval('#experience h3', els => els.map(e => e.textContent.trim()));
    console.log("Found slides:", slides);
    
    // We want to verify slide 3 specifically (CONSULTATION)
    // Click indicator for slide 3 (index 2)
    const indicators = await page.$$('button[role="tab"]');
    if (indicators.length >= 3) {
      console.log("Clicking slide 3 (Consultation)...");
      await indicators[2].click();
      await page.waitForTimeout(1500); // Wait for transition
      
      // Take screenshot of consultation slide
      await page.screenshot({ path: 'consultation_slide.png', fullPage: false });
      console.log("Screenshot of Consultation slide saved as consultation_slide.png");
    }

    // 2. APPOINTMENT WORKFLOW
    console.log("Testing /book-appointment...");
    await page.goto('http://localhost:3000/book-appointment', { waitUntil: 'networkidle' });
    
    // Fill out the form
    // Note: Depends on exactly how the form is structured. We will just check if form exists.
    const hasForm = await page.$('form');
    if (hasForm) {
      console.log("Book Appointment form found.");
      results.book_appointment = true;
    } else {
      console.error("Book Appointment form NOT found.");
    }
    
    // 3. AUTHENTICATION
    console.log("Testing /login...");
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    const hasLoginForm = await page.$('form');
    if (hasLoginForm) {
      console.log("Login form found.");
      results.login_page = true;
    } else {
      console.error("Login form NOT found.");
    }
    
  } catch (err) {
    console.error("Audit error:", err);
  } finally {
    await browser.close();
    console.log("Audit complete. Results:", results);
  }
})();
