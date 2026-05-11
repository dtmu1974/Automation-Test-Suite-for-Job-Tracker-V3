/**
 * Combined Test Report Generator
 * Reads both positive and negative test result JSON files
 * and produces a single unified HTML report.
 *
 * Run after both test scripts:
 *   node generate_combined_report.js
 */

const fs = require('fs');

// ── Load result JSON files written by each test script ───────────────────
const positiveResults = JSON.parse(fs.readFileSync('positive_results.json', 'utf8'));
const negativeResults = JSON.parse(fs.readFileSync('negative_results.json', 'utf8'));

const dateStr      = new Date().toUTCString();
const allResults   = [...positiveResults.steps, ...negativeResults.steps];
const totalPassed  = allResults.filter(r => r.status === 'pass').length;
const totalFailed  = allResults.filter(r => r.status === 'fail').length;
const totalSteps   = allResults.length;
const passRate     = Math.round((totalPassed / totalSteps) * 100);
const overallStatus = totalFailed === 0 ? 'pass' : 'fail';
const totalDuration = (positiveResults.duration + negativeResults.duration).toFixed(1);

const renderSteps = (steps) => steps.map((r, i) => `
  <div class="step ${r.status}" style="animation-delay:${0.05 + i * 0.04}s">
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

const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8"/>
<meta name="viewport" content="width=device-width, initial-scale=1.0"/>
<title>Combined Test Report — Job Tracker</title>
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet"/>
<style>
  :root{
    --bg:#0a0d12;--surface:#111620;--border:#1e2535;
    --pass:#00e5a0;--pass-dim:#00e5a015;
    --fail:#ff4d6d;--fail-dim:#ff4d6d15;
    --warn:#ffc94d;--accent:#4d9fff;--accent-dim:#4d9fff15;
    --text:#e8edf5;--muted:#5a6480;
    --mono:'JetBrains Mono',monospace;--sans:'Syne',sans-serif;
  }
  *,*::before,*::after{box-sizing:border-box;margin:0;padding:0;}
  body{background:var(--bg);color:var(--text);font-family:var(--sans);min-height:100vh;padding:48px 24px 80px;overflow-x:hidden;position:relative;}
  body::before{content:'';position:fixed;inset:0;background-image:linear-gradient(var(--border) 1px,transparent 1px),linear-gradient(90deg,var(--border) 1px,transparent 1px);background-size:40px 40px;opacity:.3;pointer-events:none;z-index:0;}
  .wrapper{max-width:960px;margin:0 auto;position:relative;z-index:1;}

  /* ── Header ── */
  header{margin-bottom:48px;animation:fadeUp .6s ease both;}
  .badge{display:inline-flex;align-items:center;gap:6px;font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;padding:4px 10px;border-radius:4px;margin-bottom:20px;}
  .badge.pass{color:var(--pass);background:var(--pass-dim);border:1px solid var(--pass);}
  .badge.fail{color:var(--fail);background:var(--fail-dim);border:1px solid var(--fail);}
  .badge::before{content:'●';font-size:8px;}
  h1{font-size:clamp(26px,5vw,48px);font-weight:800;line-height:1.1;letter-spacing:-.03em;}
  h1 span{background:linear-gradient(135deg,var(--pass),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .meta{margin-top:14px;font-family:var(--mono);font-size:12px;color:var(--muted);display:flex;flex-wrap:wrap;gap:20px;}

  /* ── Overall verdict ── */
  .verdict{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:28px 32px;margin-bottom:32px;display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:20px;animation:fadeUp .6s .05s ease both;position:relative;overflow:hidden;}
  .verdict::before{content:'';position:absolute;inset:0;background:${overallStatus === 'pass' ? 'radial-gradient(ellipse at top right,#00e5a010,transparent 60%)' : 'radial-gradient(ellipse at top right,#ff4d6d10,transparent 60%)'};pointer-events:none;}
  .verdict-left{}
  .verdict-label{font-family:var(--mono);font-size:11px;letter-spacing:.12em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;}
  .verdict-status{font-size:clamp(28px,5vw,42px);font-weight:800;color:var(--${overallStatus === 'pass' ? 'pass' : 'fail'});}
  .verdict-sub{font-family:var(--mono);font-size:12px;color:var(--muted);margin-top:6px;}
  .verdict-ring{width:100px;height:100px;position:relative;}
  .verdict-ring svg{transform:rotate(-90deg);}
  .ring-bg{fill:none;stroke:var(--border);stroke-width:8;}
  .ring-fg{fill:none;stroke:var(--${overallStatus === 'pass' ? 'pass' : 'fail'});stroke-width:8;stroke-linecap:round;stroke-dasharray:283;stroke-dashoffset:${Math.round(283 - (passRate / 100) * 283)};transition:stroke-dashoffset 1s ease;}
  .ring-text{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;}
  .ring-pct{font-size:22px;font-weight:800;color:var(--${overallStatus === 'pass' ? 'pass' : 'fail'});}
  .ring-lbl{font-family:var(--mono);font-size:9px;color:var(--muted);letter-spacing:.06em;}

  /* ── Summary cards ── */
  .summary{display:grid;grid-template-columns:repeat(5,1fr);gap:10px;margin-bottom:40px;animation:fadeUp .6s .1s ease both;}
  @media(max-width:700px){.summary{grid-template-columns:repeat(3,1fr);}}
  @media(max-width:440px){.summary{grid-template-columns:repeat(2,1fr);}}
  .card{background:var(--surface);border:1px solid var(--border);border-radius:10px;padding:18px 16px;position:relative;overflow:hidden;}
  .card::before{content:'';position:absolute;top:0;left:0;right:0;height:2px;}
  .card.total::before{background:var(--accent)}
  .card.passed::before{background:var(--pass)}
  .card.failed::before{background:var(--fail)}
  .card.duration::before{background:var(--warn)}
  .card.rate::before{background:linear-gradient(90deg,var(--pass),var(--accent))}
  .card-label{font-family:var(--mono);font-size:10px;letter-spacing:.1em;text-transform:uppercase;color:var(--muted);margin-bottom:8px;}
  .card-value{font-size:32px;font-weight:800;letter-spacing:-.04em;line-height:1;}
  .card.total .card-value{color:var(--accent)}
  .card.passed .card-value{color:var(--pass)}
  .card.failed .card-value{color:var(--fail)}
  .card.duration .card-value{color:var(--warn);font-size:22px;}
  .card.rate .card-value{font-size:28px;background:linear-gradient(135deg,var(--pass),var(--accent));-webkit-background-clip:text;-webkit-text-fill-color:transparent;}
  .card-sub{font-size:10px;color:var(--muted);margin-top:4px;font-family:var(--mono);}

  /* ── Suite blocks ── */
  .suite{background:var(--surface);border:1px solid var(--border);border-radius:14px;margin-bottom:24px;overflow:hidden;animation:fadeUp .5s ease both;}
  .suite-header{padding:20px 24px;display:flex;align-items:center;justify-content:space-between;cursor:pointer;border-bottom:1px solid var(--border);gap:16px;}
  .suite-header:hover{background:#ffffff05;}
  .suite-left{display:flex;align-items:center;gap:14px;}
  .suite-icon{width:36px;height:36px;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:16px;flex-shrink:0;}
  .suite-icon.positive{background:var(--pass-dim);border:1px solid var(--pass);}
  .suite-icon.negative{background:var(--fail-dim);border:1px solid var(--fail);}
  .suite-title{font-size:15px;font-weight:700;}
  .suite-meta{font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:3px;}
  .suite-right{display:flex;align-items:center;gap:12px;flex-shrink:0;}
  .suite-pill{font-family:var(--mono);font-size:11px;font-weight:600;padding:4px 12px;border-radius:20px;}
  .suite-pill.pass{background:var(--pass-dim);color:var(--pass);border:1px solid var(--pass);}
  .suite-pill.fail{background:var(--fail-dim);color:var(--fail);border:1px solid var(--fail);}
  .suite-chevron{color:var(--muted);font-size:12px;transition:transform .3s;}
  .suite-body{padding:16px 20px 20px;}

  /* ── Steps ── */
  .steps{display:flex;flex-direction:column;gap:8px;}
  .step{background:#0d1018;border:1px solid var(--border);border-radius:8px;padding:14px 16px;display:grid;grid-template-columns:26px 1fr auto;align-items:start;gap:14px;animation:fadeUp .4s ease both;}
  .step.pass{border-left:3px solid var(--pass);}
  .step.fail{border-left:3px solid var(--fail);}
  .step-num{font-family:var(--mono);font-size:10px;color:var(--muted);padding-top:2px;text-align:right;}
  .step-title{font-size:13px;font-weight:700;margin-bottom:4px;}
  .step-desc{font-family:var(--mono);font-size:11px;color:var(--muted);line-height:1.6;}
  .step-expect,.step-actual{font-family:var(--mono);font-size:11px;margin-top:4px;}
  .step-expect{color:var(--muted)}.step-actual.pass{color:var(--pass)}.step-actual.fail{color:var(--fail)}
  .label{opacity:.55;margin-right:4px;}
  .step-url{font-family:var(--mono);font-size:10px;color:var(--accent);margin-top:5px;word-break:break-all;}
  .step-status{display:flex;flex-direction:column;align-items:flex-end;gap:5px;}
  .status-pill{font-family:var(--mono);font-size:9px;font-weight:600;letter-spacing:.08em;text-transform:uppercase;padding:2px 8px;border-radius:20px;white-space:nowrap;}
  .pass .status-pill{background:var(--pass-dim);color:var(--pass);border:1px solid var(--pass);}
  .fail .status-pill{background:var(--fail-dim);color:var(--fail);border:1px solid var(--fail);}
  .step-time{font-family:var(--mono);font-size:10px;color:var(--muted);}

  /* ── TC sub-labels ── */
  .tc-label{font-family:var(--mono);font-size:10px;letter-spacing:.12em;text-transform:uppercase;padding:8px 0 10px;color:var(--muted);display:flex;align-items:center;gap:8px;}
  .tc-label::after{content:'';flex:1;height:1px;background:var(--border);}
  .tc-label.tc1{color:var(--warn)}.tc-label.tc2{color:var(--accent)}

  /* ── Environment ── */
  .section-title{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--muted);font-family:var(--mono);margin:32px 0 14px;display:flex;align-items:center;gap:10px;}
  .section-title::after{content:'';flex:1;height:1px;background:var(--border);}
  .env-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:10px;margin-bottom:40px;}
  @media(max-width:500px){.env-grid{grid-template-columns:1fr;}}
  .env-row{background:var(--surface);border:1px solid var(--border);border-radius:8px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;gap:12px;}
  .env-key{font-family:var(--mono);font-size:11px;color:var(--muted);}
  .env-val{font-family:var(--mono);font-size:12px;color:var(--text);font-weight:500;text-align:right;}

  /* ── Footer ── */
  footer{text-align:center;font-family:var(--mono);font-size:11px;color:var(--muted);margin-top:40px;line-height:2;}
  footer strong{color:var(--pass);}

  @keyframes fadeUp{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}
</style>
</head>
<body>
<div class="wrapper">

  <!-- Header -->
  <header>
    <div class="badge ${overallStatus}">Combined Test Report</div>
    <h1>Job Tracker <span>Full Test Suite</span></h1>
    <div class="meta">
      <span>📅 ${dateStr}</span>
      <span>🌐 https://dtmu1974.github.io/job-tracker-v3/</span>
      <span>🤖 Playwright + GitHub Actions</span>
    </div>
  </header>

  <!-- Overall Verdict -->
  <div class="verdict">
    <div class="verdict-left">
      <div class="verdict-label">Overall Result</div>
      <div class="verdict-status">${overallStatus === 'pass' ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}</div>
      <div class="verdict-sub">${totalPassed} of ${totalSteps} steps passed across ${positiveResults.steps.length} positive + ${negativeResults.steps.length} negative steps · ${totalDuration}s total</div>
    </div>
    <div class="verdict-ring">
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle class="ring-bg" cx="50" cy="50" r="45"/>
        <circle class="ring-fg" cx="50" cy="50" r="45"/>
      </svg>
      <div class="ring-text">
        <div class="ring-pct">${passRate}%</div>
        <div class="ring-lbl">PASS RATE</div>
      </div>
    </div>
  </div>

  <!-- Summary Cards -->
  <div class="summary">
    <div class="card total"><div class="card-label">Total Steps</div><div class="card-value">${totalSteps}</div><div class="card-sub">across 2 suites</div></div>
    <div class="card passed"><div class="card-label">Passed</div><div class="card-value">${totalPassed}</div><div class="card-sub">steps succeeded</div></div>
    <div class="card failed"><div class="card-label">Failed</div><div class="card-value">${totalFailed}</div><div class="card-sub">${totalFailed === 0 ? 'no failures' : 'check logs'}</div></div>
    <div class="card duration"><div class="card-label">Duration</div><div class="card-value">${totalDuration}s</div><div class="card-sub">total runtime</div></div>
    <div class="card rate"><div class="card-label">Pass Rate</div><div class="card-value">${passRate}%</div><div class="card-sub">overall quality</div></div>
  </div>

  <!-- Positive Test Suite -->
  <div class="suite" style="animation-delay:0.2s">
    <div class="suite-header" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none';this.querySelector('.suite-chevron').style.transform=this.querySelector('.suite-chevron').style.transform==='rotate(180deg)'?'':'rotate(180deg)'">
      <div class="suite-left">
        <div class="suite-icon positive">✅</div>
        <div>
          <div class="suite-title">Positive Test Suite — Login &amp; Profile</div>
          <div class="suite-meta">${positiveResults.steps.length} steps · ${positiveResults.duration.toFixed(1)}s · user: ddo / ddo</div>
        </div>
      </div>
      <div class="suite-right">
        <span class="suite-pill ${positiveResults.steps.filter(r=>r.status==='fail').length===0?'pass':'fail'}">
          ${positiveResults.steps.filter(r=>r.status==='pass').length}/${positiveResults.steps.length} PASSED
        </span>
        <span class="suite-chevron">▼</span>
      </div>
    </div>
    <div class="suite-body">
      <div class="steps">${renderSteps(positiveResults.steps)}</div>
    </div>
  </div>

  <!-- Negative Test Suite -->
  <div class="suite" style="animation-delay:0.3s">
    <div class="suite-header" onclick="this.nextElementSibling.style.display=this.nextElementSibling.style.display==='none'?'block':'none';this.querySelector('.suite-chevron').style.transform=this.querySelector('.suite-chevron').style.transform==='rotate(180deg)'?'':'rotate(180deg)'">
      <div class="suite-left">
        <div class="suite-icon negative">🚫</div>
        <div>
          <div class="suite-title">Negative Test Suite — Invalid Login Attempts</div>
          <div class="suite-meta">${negativeResults.steps.length} steps · ${negativeResults.duration.toFixed(1)}s · TC1: ddo/password · TC2: ddo1/blank</div>
        </div>
      </div>
      <div class="suite-right">
        <span class="suite-pill ${negativeResults.steps.filter(r=>r.status==='fail').length===0?'pass':'fail'}">
          ${negativeResults.steps.filter(r=>r.status==='pass').length}/${negativeResults.steps.length} PASSED
        </span>
        <span class="suite-chevron">▼</span>
      </div>
    </div>
    <div class="suite-body">
      <div class="tc-label tc1">TC1 — Valid Username + Wrong Password (ddo / password)</div>
      <div class="steps">${renderSteps(negativeResults.tc1Steps)}</div>
      <div class="tc-label tc2" style="margin-top:16px">TC2 — Wrong Username + Blank Password (ddo1 / blank)</div>
      <div class="steps">${renderSteps(negativeResults.tc2Steps)}</div>
    </div>
  </div>

  <!-- Environment -->
  <div class="section-title">Environment</div>
  <div class="env-grid">
    <div class="env-row"><span class="env-key">Browser</span><span class="env-val">Chromium (Playwright)</span></div>
    <div class="env-row"><span class="env-key">Execution Mode</span><span class="env-val">Headless (CI)</span></div>
    <div class="env-row"><span class="env-key">Automation Engine</span><span class="env-val">Playwright + GitHub Actions</span></div>
    <div class="env-row"><span class="env-key">Target URL</span><span class="env-val">dtmu1974.github.io</span></div>
    <div class="env-row"><span class="env-key">Positive Suite User</span><span class="env-val">ddo / ddo ✓</span></div>
    <div class="env-row"><span class="env-key">Negative Suite Users</span><span class="env-val">ddo/password · ddo1/blank</span></div>
    <div class="env-row"><span class="env-key">Run Date</span><span class="env-val">${dateStr}</span></div>
    <div class="env-row"><span class="env-key">Overall Result</span><span class="env-val" style="color:var(--${overallStatus === 'pass' ? 'pass' : 'fail'});font-weight:700">${overallStatus === 'pass' ? '✅ ALL PASSED' : '❌ SOME FAILED'}</span></div>
  </div>

  <footer>
    Generated by <strong>GitHub Actions</strong> · Job Tracker Full Test Suite<br>
    ${totalPassed}/${totalSteps} steps passed · ${passRate}% pass rate · ${totalDuration}s · ${dateStr}
  </footer>
</div>
</body>
</html>`;

fs.writeFileSync('job_tracker_combined_report.html', html);
console.log(`📊 Combined report saved: job_tracker_combined_report.html (${totalPassed}/${totalSteps} passed, ${passRate}%, ${totalDuration}s)`);
