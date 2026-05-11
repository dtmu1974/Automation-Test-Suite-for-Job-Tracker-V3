/**
 * Playwright Automation Script
 * Site    : https://dtmu1974.github.io/job-tracker-v3/
 * Actions : Open site → Login as ddo → Verify login → Navigate to Profile → Close browser
 *
 * Prerequisites:
 *   npm install playwright
 *   npx playwright install chromium
 *
 * Run:
 *   node job_tracker_automation.js
 */

const { chromium } = require('playwright');

(async () => {
  // ── 1. Launch browser ────────────────────────────────────────────────────
  const browser = await chromium.launch({ headless: true }); // set true to run silently
  const context = await browser.newContext();
  const page    = await context.newPage();

  console.log('🌐 Opening Job Tracker...');
  await page.goto('https://dtmu1974.github.io/job-tracker-v3/');

  // The app redirects unauthenticated users to /login — wait for that page
  await page.waitForURL('**/login', { timeout: 10_000 });
  console.log('📄 Login page loaded:', page.url());

  // ── 2. Fill in credentials ───────────────────────────────────────────────
  console.log('🔑 Entering credentials...');
  await page.fill('input[name="username"], input[placeholder*="sername"], #username', 'ddo');
  await page.fill('input[name="password"], input[type="password"], #password', 'ddo');

  // ── 3. Click Login ───────────────────────────────────────────────────────
  console.log('🖱️  Clicking Login button...');
  await page.click('button[type="submit"], button:has-text("Login")');

  // ── 4. Verify successful login ───────────────────────────────────────────
  // After login, the app should redirect away from /login
  await page.waitForFunction(
    () => !window.location.pathname.includes('/login'),
    { timeout: 10_000 }
  );
  console.log('✅ Login successful! Current page:', page.url());

  // Confirm the logged-in user indicator is present
  const logoutBtn = await page.locator('button:has-text("Logout")').first();
  const logoutText = await logoutBtn.textContent();
  console.log(`👤 Logged in as: ${logoutText.replace('Logout', '').replace(/[()]/g, '').trim()}`);

  // ── 5. Navigate to Profile page ──────────────────────────────────────────
  console.log('📋 Navigating to Profile page...');
  await page.click('a[href*="/profile"]');
  await page.waitForURL('**/profile', { timeout: 10_000 });
  console.log('📄 Profile page loaded:', page.url());

  // Verify profile heading is visible
  const profileHeading = await page.locator('h2').first().textContent();
  console.log(`✅ Profile verified: "${profileHeading}"`);

  // ── 6. Close the browser ─────────────────────────────────────────────────
  console.log('🔒 Closing browser...');
  await browser.close();
  console.log('✅ Done.');
})();
