// ── Add this block at the END of job_tracker_negative_test.js ───────────
// Place it just BEFORE the fs.writeFileSync for the HTML report

fs.writeFileSync('negative_results.json', JSON.stringify({
  suite:    'Negative — Invalid Login Attempts',
  duration: parseFloat(totalDuration),
  passed:   results.filter(r => r.status === 'pass').length,
  failed:   results.filter(r => r.status === 'fail').length,
  steps:    results,
  tc1Steps: results.slice(0, tc2StartIdx),
  tc2Steps: results.slice(tc2StartIdx)
}, null, 2));
