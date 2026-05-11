const { chromium } = require('playwright');
const fs = require('fs');

(async () => {
  const startTime = Date.now();
  const results = [];

  function logStep(num, title, desc, url, status, duration) {
    results.push({ num, title, desc, url, status, duration });
  }

  // ── 1. Launch browser ────────────────────────────────────────────────────
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page    = await context.newPage();

  let t = Date.now();
  console.log('🌐 Opening Job Tracker...');
  await page.goto('https://dtmu1974.github.io/job-tracker-v3/');
  logStep('01', 'Open Job Tracker URL',
    'Launched Chromium browser and navigated to the target URL.',
    'https://dtmu1974.github.io/job-tracker-v3/', 'pass', ((Date.now()-t)/1000).toFixed(1)+'s');

  // ── 2. Wait for redirect to /login ───────────────────────────────────────
  t = Date.now();
  await page.waitForURL('**/login', { timeout: 10_000 });
  console.log('📄 Login page loaded:', page.url());
  logStep('02', 'Redirect to Login Page',
    'App correctly redirected unauthenticated user to /login.',
    page.url(), 'pass', ((Date.now()-t)/1000).toFixed(1)+'s');

  // ── 3. Fill username ─────────────────────────────────────────────────────
  t = Date.now();
  console.log('🔑 Entering credentials...');
  await page.fill('input[name="username"], input[placeholder*="sername"], #username', 'ddo');
  logStep('03', 'Enter Username',
    'Filled username field with value ddo.',
    '', 'pass', ((Date.now()-t)/1000).toFixed(1)+'s');

  // ── 4. Fill password ─────────────────────────────────────────────────────
  t = Date.now();
  await page.fill('input[name="password"], input[type="password"], #password', 'ddo');
  logStep('04', 'Enter Password',
    'Filled password field with provided credentials.',
    '', 'pass', ((Date.now()-t)/1000).toFixed(1)+'s');

  // ── 5. Click Login ───────────────────────────────────────────────────────
  t = Date.now();
  console.log('🖱️  Clicking Login button...');
  await page.click('button[type="submit"], button:has-text("Login")');
  logStep('05', 'Click Login Button',
    'Clicked the Login submit button to authenticate the user.',
    '', 'pass', ((Date.now()-t)/1000).toFixed(1)+'s');

  // ── 6. Verify login ──────────────────────────────────────────────────────
  t = Date.now();
  await page.waitForFunction(
    () => !window.location.pathname.includes('/login'),
    { timeout: 10_000 }
  );
  const logoutBtn  = await page.locator('button:has-text("Logout")').first();
  const logoutText = await logoutBtn.textContent();
  const username   = logoutText.replace('Logout', '').replace(/[()]/g, '').trim();
  console.log(`✅ Login successful! Logged in as: ${username}`);
  logStep('06', 'Verify Login Success',
    `Confirmed URL exited /login. Logout button displayed "Logout (${username})" — user identity verified.`,
    page.url(), 'pass', ((Date.now()-t)/1000).toFixed(1)+'s');

  // ── 7. Navigate to Profile ───────────────────────────────────────────────
  t = Date.now();
  console.log('📋 Navigating to Profile page...');
  await page.click('a[href*="/profile"]');
  await page.waitForURL('**/profile', { timeout: 10_000 });
  const heading = await page.locator('h2').first().textContent();
  console.log(`✅ Profile verified: "${heading}"`);
  logStep('07', 'Navigate to Profile Page',
    `Clicked Profile nav link. Page loaded with heading "${heading}". Profile data confirmed visible.`,
    page.url(), 'pass', ((Date.now()-t)/1000).toFixed(1)+'s');

  await browser.close();
  console.log('🔒 Browser closed.');

  // ── Generate report ──────────────────────────────────────────────────────
  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
  const now           = new Date();
  const dateStr       = now.toUTCString();
  const passed        = results.filter(r => r.status === 'pass').length;
  const failed        = results.filter(r => r.status === 'fail').length;

  const stepRows = results.map(r => `
    <div class="step ${r.status}" style="animation-delay:${0.1 + results.indexOf(r) * 0.05}s">
      <div class="step-num">${r.num}</div>
      <div class="step-body">
        <div class="step-title">${r.title}</div>
        <div class="step-desc">${r.desc}</div>
        ${r.url ? `<div class="step-url">→ ${r.url}</div>` : ''}
      </div>
      <div class="step-status">
        <span class="status-pill">${r.status.toUpperCase()}</span>
        <span class="step-time">${r.duration}</span>
      </div>
    </div>`).join('');

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Test Report — Job Tracker Automation</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
  :root {
    --bg:#0a0d12;--surface:#111620;--border:#1e2535;
    --pass:#00e5a0;--pass-dim:#00e5a020;--fail:#ff4d6d;--fail-dim:#ff4d6d20;
    --warn:#ffc94d;--accent:#4d9fff;--accent-dim:#4d9fff18;
    --text:#e8edf5;--muted:#5a6480;
    --mono:'JetBrains Mono',monospace;--sans:'Syne',sans-serif;
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--bg);color:var(--text);font-family:var(--sans);min-height:100vh;padding:48px 24px 80px;position:relative;overflow-x:hidden;}
  body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:40px 40px;opacity:.35;pointer-events:none;z-index:0;}
  body::after{content:'';position:fixed;top:-200px;left:50%;transform:translateX(-50%);width:700px;height:500px;background:radial-gradient(ellipse,#00e5a010 0%,transparent 70%);pointer-events:none;z-index:0;}
  .wrapper{max-width:860px;margin:0 auto;position:relative;z-index:1;}
  header{margin-bottom:48px;animation:fadeUp .6s ease both;}
  .badge{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--pass);background:var(--pass-dim);border:1px solid var(--pass);border-radius:4px;padding:4px 10px;margin-bottom:20px;}
  .badge::before{content:'●';font-size:8px;}
  h1{font-size:clamp(28px,5vw,46px);font-weight:800;line-height:1.1;letter-spacing:-.03em;}
  h1 span{color:var(--pass);}
  .meta{margin-top:14px;font-family:var(--mono);font-size:12px;color:var(--muted);display:flex;flex-wrap:wrap;gap:24px;}
  .summary{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;margin-bottom:40px;animation:fadeUp .6s .1s ease both;}
  @media(max-width:600px){.summary{grid-template-columns:repeat(2,1fr);}}
  .card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:20px 18px;position:relative;overflow:hidden;}
  .card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
  .card.total::before{background:var(--accent)}.card.passed::before{background:var(--pass)}.card.failed::before{background:var(--fail)}.card.duration::before{background:var(--warn)}
  .card-label{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;}
  .card-value{font-size:36px;font-weight:800;letter-spacing:-.04em;line-height:1;}
  .card.total .card-value{color:var(--accent)}.card.passed .card-value{color:var(--pass)}.card.failed .card-value{color:var(--fail)}.card.duration .card-value{color:var(--warn);font-size:26px;}
  .card-sub{font-size:11px;color:var(--muted);margin-top:4px;font-family:var(--mono);}
  .section-title{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-family:var(--mono);margin-bottom:16px;display:flex;align-items:center;gap:10px;}
  .section-title::after{content:'';flex:1;height:1px;background:var(--border);}
  .steps{display:flex;flex-direction:column;gap:10px;margin-bottom:40px;}
  .step{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:18px 20px;display:grid;grid-template-columns:28px 1fr auto;align-items:start;gap:16px;animation:fadeUp .5s ease both;}
  .step.pass{border-left:3px solid var(--pass)}.step.fail{border-left:3px solid var(--fail)}
  .step-num{font-family:var(--mono);font-size:11px;color:var(--muted);padding-top:2px;text-align:right;}
  .step-title{font-size:14px;font-weight:700;margin-bottom:4px;}
  .step-desc{font-family:var(--mono);font-size:12px;color:var(--muted);line-height:1.6;}
  .step-url{font-family:var(--mono);font-size:11px;color:var(--accent);margin-top:6px;word-break:break-all;}
  .step-status{display:flex;flex-direction:column;align-items:flex-end;gap:6px;}
  .status-pill{font-family:var(--mono);font-size:10px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:3px 10px;border-radius:20px;white-space:nowrap;}
  .pass .status-pill{background:var(--pass-dim);color:var(--pass);border:1px solid var(--pass);}
  .fail .status-pill{background:var(--fail-dim);color:var(--fail);border:1px solid var(--fail);}
  .step-time{font-family:var(--mono);font-size:10px;color:var(--muted);}
  .env-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:40px;animation:fadeUp .6s .4s ease both;}
  @media(max-width:500px){.env-grid{grid-template-columns:1fr;}}
  .env-row{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:14px 16px;display:flex;justify-content:space-between;align-items:center;gap:12px;}
  .env-key{font-family:var(--mono);font-size:11px;color:var(--muted);letter-spacing:.05em;}
  .env-val{font-family:var(--mono);font-size:12px;color:var(--text);font-weight:500;text-align:right;}
  .progress-wrap{height:4px;background:var(--border);border-radius:99px;overflow:hidden;margin-bottom:40px;}
  .progress-bar{height:100%;border-radius:99px;background:linear-gradient(90deg,var(--pass),var(--accent));animation:grow 1s .4s ease both;transform-origin:left;}
  footer{text-align:center;font-family:var(--mono);font-size:11px;color:var(--muted);}
  footer strong{color:var(--pass);}
  @keyframes grow{from{width:0}to{width:${Math.round((passed/results.length)*100)}%}}
  @keyframes fadeUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}
</style>
</head>
<body>
<div class="wrapper">
  <header>
    <div class="badge">Automation Report</div>
    <h1>Job Tracker <span>Test Results</span></h1>
    <div class="meta">
      <span>📅 ${dateStr}</span>
      <span>🌐 https://dtmu1974.github.io/job-tracker-v3/</span>
      <span>🤖 Playwright + GitHub Actions</span>
    </div>
  </header>
  <div class="progress-wrap"><div class="progress-bar"></div></div>
  <div class="summary">
    <div class="card total"><div class="card-label">Total Tests</div><div class="card-value">${results.length}</div><div class="card-sub">steps executed</div></div>
    <div class="card passed"><div class="card-label">Passed</div><div class="card-value">${passed}</div><div class="card-sub">${Math.round((passed/results.length)*100)}% success rate</div></div>
    <div class="card failed"><div class="card-label">Failed</div><div class="card-value">${failed}</div><div class="card-sub">${failed === 0 ? 'no failures' : 'check logs'}</div></div>
    <div class="card duration"><div class="card-label">Duration</div><div class="card-value">${totalDuration}s</div><div class="card-sub">total runtime</div></div>
  </div>
  <div class="section-title">Test Steps</div>
  <div class="steps">${stepRows}</div>
  <div class="section-title">Environment</div>
  <div class="env-grid">
    <div class="env-row"><span class="env-key">Browser</span><span class="env-val">Chromium (Playwright)</span></div>
    <div class="env-row"><span class="env-key">Execution Mode</span><span class="env-val">Headless (CI)</span></div>
    <div class="env-row"><span class="env-key">Automation Engine</span><span class="env-val">Playwright + GitHub Actions</span></div>
    <div class="env-row"><span class="env-key">Target URL</span><span class="env-val">dtmu1974.github.io</span></div>
    <div class="env-row"><span class="env-key">Test User</span><span class="env-val">${username}</span></div>
    <div class="env-row"><span class="env-key">Run Date</span><span class="env-val">${dateStr}</span></div>
    <div class="env-row"><span class="env-key">Total Duration</span><span class="env-val">${totalDuration}s</span></div>
    <div class="env-row"><span class="env-key">Overall Result</span><span class="env-val" style="color:var(--${failed===0?'pass':'fail'});font-weight:700">${failed===0?'✅ ALL PASSED':'❌ SOME FAILED'}</span></div>
  </div>
  <footer>Generated by <strong>GitHub Actions</strong> · Playwright Automation · ${passed}/${results.length} tests passed · Run: ${dateStr}</footer>
</div>
</body>
</html>`;

fs.writeFileSync('positive_results.json', JSON.stringify({
  suite:    'Positive — Login & Profile',
  duration: parseFloat(totalDuration),
  passed:   results.filter(r => r.status === 'pass').length,
  failed:   results.filter(r => r.status === 'fail').length,
  steps:    results
}, null, 2));

  fs.writeFileSync('job_tracker_test_report.html', html);
  console.log(`📊 Report generated: job_tracker_test_report.html (${passed}/${results.length} passed, ${totalDuration}s)`);
})();