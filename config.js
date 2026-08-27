// Single place to wire the site to real backends.
window.RECHARGE_CONFIG = {
  // All form submissions on every page POST JSON here (Formspree).
  FEEDBACK_ENDPOINT: 'https://formspree.io/f/mzepnojr',

  // Re-Charge Rewards ledger (backend/rewards-apps-script.gs deployed as a
  // Google Apps Script web app; URL ends in /exec). Leave empty to keep
  // scan.html in demo mode — set it and the scan page goes live.
  REWARDS_ENDPOINT: '',

  // Social proof shown in the homepage hero. Update by hand from the
  // Formspree inbox; the strip stays hidden until builds reaches 10 so
  // small numbers never undermine the pitch.
  PUBLIC_COUNTS: { builds: 0, bins: 0 },
};
