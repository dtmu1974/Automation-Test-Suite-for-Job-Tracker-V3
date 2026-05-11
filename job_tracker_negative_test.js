/**
 * Playwright Negative Test Script — Login Validation
 * Site    : https://dtmu1974.github.io/job-tracker-v3/
 * Actions :
 *   Test 1 — Login with correct username (ddo) + wrong password → expect "invalid credential"
 *   Test 2 — Login with wrong username (ddo1) + blank password  → expect "invalid credential"
 *
 * Run:
 *   node job_tracker_negative_test.js
 */

const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const startTime = Date.now();
  const results   = [];
  let   stepNum   = 0;

  function logStep(title, desc, url, status, duration, expected = '', actual = '') {
    stepNum++;
    const num = String(stepNum).padStart(2, '0');
    results.push({ num, title, desc, url, status, duration, expected, actual });
    const icon = status === 'pass' ? '✅' : status === 'fail' ? '❌' : '🔵';
    console.log(`${icon} [Step ${num}] ${title} (${duration})`);
    if (expected) console.log(`   Expected : ${expected}`);
    if (actual)   console.log(`   Actual   : ${actual}`);
  }

  // ── Launch browser ───────────────────────────────────────────────────────
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page    = await context.newPage();

  console.log('\n🚀 Starting Negative Login Tests...\n');

  // ════════════════════════════════════════════════════════════════════════
  // TEST CASE 1 — Valid username + Wrong password
  // ════════════════════════════════════════════════════════════════════════
  console.log('─'.repeat(60));
  console.log('TEST CASE 1: Valid username (ddo) + Wrong password (password)');
  console.log('─'.repeat(60));

  // Step 1 — Navigate to login page
  let t = Date.now();
  await page.goto('https://dtmu1974.github.io/job-tracker-v3/');
  await page.waitForURL('**/login', { timeout: 10_000 });
  logStep(
    'Open Login Page',
    'Navigated to Job Tracker. App redirected unauthenticated user to /login.',
    page.url(), 'pass', ((Date.now() - t) / 1000).toFixed(1) + 's'
  );

  // Step 2 — Enter username: ddo
  t = Date.now();
  await page.fill('input[name="username"], input[placeholder*="sername"], #username', 'ddo');
  logStep(
    'Enter Username',
    'Typed username value into the username field.',
    '', 'pass', ((Date.now() - t) / 1000).toFixed(1) + 's',
    'Field accepts "ddo"', 'Field filled with "ddo"'
  );

  // Step 3 — Enter wrong password
  t = Date.now();
  await page.fill('input[name="password"], input[type="password"], #password', 'password');
  logStep(
    'Enter Wrong Password',
    'Typed incorrect password "password" into the password field.',
    '', 'pass', ((Date.now() - t) / 1000).toFixed(1) + 's',
    'Field accepts "password"', 'Field filled with "password"'
  );

  // Step 4 — Click Login
  t = Date.now();
  await page.click('button[type="submit"], button:has-text("Login")');
  logStep(
    'Click Login Button',
    'Clicked the Login button to attempt authentication with invalid credentials.',
    '', 'pass', ((Date.now() - t) / 1000).toFixed(1) + 's'
  );

  // Step 5 — Verify "invalid credential" alert
  t = Date.now();
  try {
    const dialog = await page.waitForEvent('dialog', { timeout: 5_000 });
    const msg    = dialog.message();
    const status = msg.toLowerCase().includes('invalid') ? 'pass' : 'fail';
    logStep(
      'Verify "Invalid Credential" Message',
      `Alert dialog appeared with message: "${msg}"`,
      '', status, ((Date.now() - t) / 1000).toFixed(1) + 's',
      '"invalid credential" message displayed',
      `"${msg}"`
    );
    await dialog.accept();
    logStep('Click OK on Alert', 'Dismissed the alert dialog by clicking OK.', '', 'pass', '0.0s');
  } catch {
    try {
      const errEl = page.locator('text=/invalid/i, .error, [role="alert"]').first();
      await errEl.waitFor({ timeout: 5_000 });
      const msg    = (await errEl.textContent()).trim();
      const status = msg.toLowerCase().includes('invalid') ? 'pass' : 'fail';
      logStep('Verify "Invalid Credential" Message (Inline)', `Inline error: "${msg}"`,
        '', status, ((Date.now() - t) / 1000).toFixed(1) + 's',
        '"invalid credential" message displayed', `"${msg}"`);
    } catch {
      logStep('Verify "Invalid Credential" Message', 'No error message detected.',
        '', 'fail', ((Date.now() - t) / 1000).toFixed(1) + 's',
        '"invalid credential" message displayed', 'No error message found');
    }
  }

  // Step 6 — Confirm still on login page
  t = Date.now();
  await page.waitForTimeout(500);
  const urlTC1    = page.url();
  const blockedTC1 = urlTC1.includes('/login');
  logStep(
    'Confirm Login Was Rejected',
    `User remained on: ${urlTC1}`,
    urlTC1, blockedTC1 ? 'pass' : 'fail',
    ((Date.now() - t) / 1000).toFixed(1) + 's',
    'User stays on /login page',
    blockedTC1 ? 'User stayed on login page ✓' : 'User was redirected — unexpected!'
  );

  // ════════════════════════════════════════════════════════════════════════
  // TEST CASE 2 — Wrong username (ddo1) + Blank password
  // ════════════════════════════════════════════════════════════════════════
  console.log('\n' + '─'.repeat(60));
  console.log('TEST CASE 2: Wrong username (ddo1) + Blank password');
  console.log('─'.repeat(60));

  // Step 7 — Enter username: ddo1
  t = Date.now();
  await page.fill('input[name="username"], input[placeholder*="sername"], #username', '');
  await page.fill('input[name="username"], input[placeholder*="sername"], #username', 'ddo1');
  logStep(
    'Enter Wrong Username',
    'Cleared and typed incorrect username "ddo1".',
    '', 'pass', ((Date.now() - t) / 1000).toFixed(1) + 's',
    'Field accepts "ddo1"', 'Field filled with "ddo1"'
  );

  // Step 8 — Leave password blank
  t = Date.now();
  await page.fill('input[name="password"], input[type="password"], #password', '');
  logStep(
    'Leave Password Blank',
    'Cleared the password field and left it empty.',
    '', 'pass', ((Date.now() - t) / 1000).toFixed(1) + 's',
    'Password field is empty', 'Password field cleared/blank'
  );

  // Step 9 — Click Login
  t = Date.now();
  await page.click('button[type="submit"], button:has-text("Login")');
  logStep(
    'Click Login Button',
    'Clicked Login button with wrong username and blank password.',
    '', 'pass', ((Date.now() - t) / 1000).toFixed(1) + 's'
  );

  // Step 10 — Verify "invalid credential" alert
  t = Date.now();
  try {
    const dialog2 = await page.waitForEvent('dialog', { timeout: 5_000 });
    const msg2    = dialog2.message();
    const status2 = msg2.toLowerCase().includes('invalid') ? 'pass' : 'fail';
    logStep(
      'Verify "Invalid Credential" Message',
      `Alert dialog appeared with message: "${msg2}"`,
      '', status2, ((Date.now() - t) / 1000).toFixed(1) + 's',
      '"invalid credential" message displayed',
      `"${msg2}"`
    );
    await dialog2.accept();
    logStep('Click OK on Alert', 'Dismissed the alert dialog by clicking OK.', '', 'pass', '0.0s');
  } catch {
    try {
      const errEl2 = page.locator('text=/invalid/i, .error, [role="alert"]').first();
      await errEl2.waitFor({ timeout: 5_000 });
      const msg2    = (await errEl2.textContent()).trim();
      const status2 = msg2.toLowerCase().includes('invalid') ? 'pass' : 'fail';
      logStep('Verify "Invalid Credential" Message (Inline)', `Inline error: "${msg2}"`,
        '', status2, ((Date.now() - t) / 1000).toFixed(1) + 's',
        '"invalid credential" message displayed', `"${msg2}"`);
    } catch {
      logStep('Verify "Invalid Credential" Message', 'No error message detected.',
        '', 'fail', ((Date.now() - t) / 1000).toFixed(1) + 's',
        '"invalid credential" message displayed', 'No error message found');
    }
  }

  // Step 11 — Confirm still on login page
  t = Date.now();
  await page.waitForTimeout(500);
  const urlTC2     = page.url();
  const blockedTC2 = urlTC2.includes('/login');
  logStep(
    'Confirm Login Was Rejected',
    `User remained on: ${urlTC2}`,
    urlTC2, blockedTC2 ? 'pass' : 'fail',
    ((Date.now() - t) / 1000).toFixed(1) + 's',
    'User stays on /login page',
    blockedTC2 ? 'User stayed on login page ✓' : 'User was redirected — unexpected!'
  );

  // ── Close browser ────────────────────────────────────────────────────────
  await browser.close();
  console.log('\n🔒 Browser closed.\n');

  // ── Generate HTML Report ─────────────────────────────────────────────────
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
  const dateStr       = new Date().toUTCString();
  const passed        = results.filter(r => r.status === 'pass').length;
  const failed        = results.filter(r => r.status === 'fail').length;
  const tc2StartIdx   = results.findIndex(r => r.title === 'Enter Wrong Username');

  console.log(`📊 Results: ${passed} passed, ${failed} failed, ${totalDuration}s total`);

  const renderSteps = (list) => list.map((r, i) => `
    <div class="step ${r.status}" style="animation-delay:${0.1 + i * 0.05}s">
      <div class="step-num">${r.num}</div>
      <div class="step-body">
        <div class="step-title">${r.title}</div>
        <div class="step-desc">${r.desc}</div>
        ${r.expected ? `<div class="step-expect"><span class="label">Expected: </span>${r.expected}</div>` : ''}
        ${r.actual   ? `<div class="step-actual ${r.status}"><span class="label">Actual: </span>${r.actual}</div>` : ''}
        ${r.url      ? `<div class="step-url">→ ${r.url}</div>` : ''}
      </div>
      <div class="step-status">
        <span class="status-pill">${r.status.toUpperCase()}</span>
        <span class="step-time">${r.duration}</span>
      </div>
    </div>`).join('');

  const tc1Steps = results.slice(0, tc2StartIdx);
  const tc2Steps = results.slice(tc2StartIdx);

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Negative Test Report — Job Tracker</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
  :root{--bg:#0a0d12;--surface:#111620;--border:#1e2535;--pass:#00e5a0;--pass-dim:#00e5a020;--fail:#ff4d6d;--fail-dim:#ff4d6d20;--warn:#ffc94d;--accent:#4d9fff;--text:#e8edf5;--muted:#5a6480;--mono:'JetBrains Mono',monospace;--sans:'Syne',sans-serif;}
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--bg);color:var(--text);font-family:var(--sans);min-height:100vh;padding:48px 24px 80px;position:relative;overflow-x:hidden;}
  body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:40px 40px;opacity:.35;pointer-events:none;z-index:0;}
  body::after{content:'';position:fixed;top:-200px;left:50%;transform:translateX(-50%);width:700px;height:500px;background:radial-gradient(ellipse,#ff4d6d08 0%,transparent 70%);pointer-events:none;z-index:0;}
  .wrapper{max-width:900px;margin:0 auto;position:relative;z-index:1;}
  header{margin-bottom:48px;animation:fadeUp .6s ease both;}
  .badge{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--fail);background:var(--fail-dim);border:1px solid var(--fail);border-radius:4px;padding:4px 10px;margin-bottom:20px;}
  .badge::before{content:'●';font-size:8px;}
  h1{font-size:clamp(26px,5vw,44px);font-weight:800;line-height:1.1;letter-spacing:-.03em;}
  h1 span{color:var(--fail);}
  .meta{margin-top:14px;font-family:var(--mono);font-size:12px;color:var(--muted);display:flex;flex-wrap:wrap;gap:20px;}
  .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:40px;animation:fadeUp .6s .1s ease both;}
  @media(max-width:600px){.summary{grid-template-columns:repeat(2,1fr);}}
  .card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:20px 18px;position:relative;overflow:hidden;}
  .card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
  .card.total::before{background:var(--accent)}.card.passed::before{background:var(--pass)}.card.failed::before{background:var(--fail)}.card.duration::before{background:var(--warn)}
  .card-label{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;}
  .card-value{font-size:36px;font-weight:800;letter-spacing:-.04em;line-height:1;}
  .card.total .card-value{color:var(--accent)}.card.passed .card-value{color:var(--pass)}.card.failed .card-value{color:var(--fail)}.card.duration .card-value{color:var(--warn);font-size:26px;}
  .card-sub{font-size:11px;color:var(--muted);margin-top:4px;font-family:var(--mono);}
  .tc-label{font-size:11px;font-family:var(--mono);letter-spacing:.14em;text-transform:uppercase;color:var(--muted);margin:32px 0 14px;display:flex;align-items:center;gap:10px;}
  .tc-label::after{content:'';flex:1;height:1px;background:var(--border);}
  .tc-label.tc1{color:var(--warn)}.tc-label.tc2{color:var(--accent)}
  .section-title{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-family:var(--mono);margin:32px 0 14px;display:flex;align-items:center;gap:10px;}
  .section-title::after{content:'';flex:1;height:1px;background:var(--border);}
  .steps{display:flex;flex-direction:column;gap:10px;margin-bottom:12px;}
  .step{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:18px 20px;display:grid;grid-template-columns:28px 1fr auto;align-items:start;gap:16px;animation:fadeUp .5s ease both;}
  .step.pass{border-left:3px solid var(--pass)}.step.fail{border-left:3px solid var(--fail)}
  .step-num{font-family:var(--mono);font-size:11px;color:var(--muted);padding-top:2px;text-align:right;}
  .step-title{font-size:14px;font-weight:700;margin-bottom:5px;}
  .step-desc{font-family:var(--mono);font-size:12px;color:var(--muted);line-height:1.6;}
  .step-expect,.step-actual{font-family:var(--mono);font-size:11px;margin-top:5px;line-height:1.5;}
  .step-expect{color:var(--muted)}.step-actual.pass{color:var(--pass)}.step-actual.fail{color:var(--fail)}
  .label{opacity:.6;margin-right:4px;}
  .step-url{font-family:var(--mono);font-size:11px;color:var(--accent);margin-top:6px;word-break:break-all;}
  .step-status{display:flex;flex-direction:column;align-items:flex-end;gap:6px;}
  .status-pill{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:3px 10px;border-radius:20px;white-space:nowrap;}
  .pass .status-pill{background:var(--pass-dim);color:var(--pass);border:1px solid var(--pass);}
  .fail .status-pill{background:var(--fail-dim);color:var(--fail);border:1px solid var(--fail);}
  .step-time{font-family:var(--mono);font-size:10px;color:var(--muted);}
  .env-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:40px;}
  @media(max-width:500px){.env-grid{grid-template-columns:1fr;}}
  .env-row{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:12px;}
  .env-key{font-family:var(--mono);font-size:11px;color:var(--muted);}
  .env-val{font-family:var(--mono);font-size:12px;color:var(--text);font-weight:500;text-align:right;}
  .progress-wrap{height:4px;background:var(--border);border-radius:99px;overflow:hidden;margin-bottom:40px;}
  .progress-bar{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--pass),var(--accent));width:${Math.round((passed/results.length)*100)}%;}
  footer{text-align:center;font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:40px;}
  footer strong{color:var(--fail);}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
</style>
</head>
<body>
<div class="wrapper">
  <header>
    <div class="badge">Negative Test Report</div>
    <h1>Login <span>Negative Tests</span></h1>
    <div class="meta">
      <span>📅 ${dateStr}</span>
      <span>🌐 https://dtmu1974.github.io/job-tracker-v3/</span>
      <span>🤖 Playwright + GitHub Actions</span>
    </div>
  </header>
  <div class="progress-wrap"><div class="progress-bar"></div></div>
  <div class="summary">
    <div class="card total"><div class="card-label">Total Steps</div><div class="card-value">${results.length}</div><div class="card-sub">across 2 test cases</div></div>
    <div class="card passed"><div class="card-label">Passed</div><div class="card-value">${passed}</div><div class="card-sub">${Math.round((passed/results.length)*100)}% success rate</div></div>
    <div class="card failed"><div class="card-label">Failed</div><div class="card-value">${failed}</div><div class="card-sub">${failed===0?'no failures':'check steps'}</div></div>
    <div class="card duration"><div class="card-label">Duration</div><div class="card-value">${totalDuration}s</div><div class="card-sub">total runtime</div></div>
  </div>
  <div class="tc-label tc1">Test Case 1 — Valid Username + Wrong Password (ddo / password)</div>
  <div class="steps">${renderSteps(tc1Steps)}</div>
  <div class="tc-label tc2">Test Case 2 — Wrong Username + Blank Password (ddo1 / blank)</div>
  <div class="steps">${renderSteps(tc2Steps)}</div>
  <div class="section-title">Environment</div>
  <div class="env-grid">
    <div class="env-row"><span class="env-key">Browser</span><span class="env-val">Chromium (Playwright)</span></div>
    <div class="env-row"><span class="env-key">Execution Mode</span><span class="env-val">Headless (CI)</span></div>
    <div class="env-row"><span class="env-key">Test Type</span><span class="env-val">Negative / Security</span></div>
    <div class="env-row"><span class="env-key">Target URL</span><span class="env-val">dtmu1974.github.io</span></div>
    <div class="env-row"><span class="env-key">TC1 Credentials</span><span class="env-val">ddo / password (wrong)</span></div>
    <div class="env-row"><span class="env-key">TC2 Credentials</span><span class="env-val">ddo1 / (blank)</span></div>
    <div class="env-row"><span class="env-key">Run Date</span><span class="env-val">${dateStr}</span></div>
    <div class="env-row"><span class="env-key">Overall Result</span><span class="env-val" style="color:var(--${failed===0?'pass':'fail'});font-weight:700">${failed===0?'✅ ALL PASSED':'❌ SOME FAILED'}</span></div>
  </div>
  <footer>Generated by <strong>GitHub Actions</strong> · Playwright Negative Tests · ${passed}/${results.length} steps passed · ${dateStr}</footer>
</div>
</body>
</html>`;

fs.writeFileSync('negative_results.json', JSON.stringify({
  suite:    'Negative — Invalid Login Attempts',
  duration: parseFloat(totalDuration),
  passed:   results.filter(r => r.status === 'pass').length,
  failed:   results.filter(r => r.status === 'fail').length,
  steps:    results,
  tc1Steps: results.slice(0, tc2StartIdx),
  tc2Steps: results.slice(tc2StartIdx)
}, null, 2));

  fs.writeFileSync('job_tracker_negative_test_report.html', html);
  console.log('📄 Report saved: job_tracker_negative_test_report.html');
})();
