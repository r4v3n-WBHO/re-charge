// Single place to wire the site to real backends.
window.RECHARGE_CONFIG = {
  // All form submissions on every page POST JSON here (Formspree).
  FEEDBACK_ENDPOINT: 'https://formspree.io/f/mzepnojr',

  // Re-Charge Rewards ledger (backend/rewards-apps-script.gs deployed as a
  // Google Apps Script web app; URL ends in /exec). Leave empty to keep
  // scan.html in demo mode — set it and the scan page goes live.
  REWARDS_ENDPOINT: '',
};
