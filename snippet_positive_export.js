// ── Add this block at the END of job_tracker_automation.js ──────────────
// Place it just BEFORE the fs.writeFileSync for the HTML report

fs.writeFileSync('positive_results.json', JSON.stringify({
  suite:    'Positive — Login & Profile',
  duration: parseFloat(totalDuration),
  passed:   results.filter(r => r.status === 'pass').length,
  failed:   results.filter(r => r.status === 'fail').length,
  steps:    results
}, null, 2));
