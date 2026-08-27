/**
 * Re-Charge Rewards backend — Google Apps Script
 * Server-side points ledger for the scan page (scan.html). Free, runs in
 * YOUR Google account; a Google Sheet is the database and admin dashboard.
 *
 * Pilot trust model: scanning a real bin's QR (scan.html?bin=RC-0001) and
 * pressing "I dropped a vape" credits points — capped per user per bin per
 * day, so it can't be farmed hard. Tighten later with per-deposit codes.
 *
 * ── SETUP (once, ~10 minutes) ────────────────────────────────
 * 1. Create a Google Sheet, copy its ID (the long string in the URL)
 *    into SHEET_ID below.
 * 2. Go to https://script.google.com → New project → paste this file,
 *    save as "Re-Charge Rewards".
 * 3. Run the `setup` function once from the editor (authorize when asked)
 *    — it creates the tabs and seeds bin RC-0001. Edit the Bins tab to
 *    match your real bins.
 * 4. Deploy → New deployment → type "Web app"
 *      - Execute as: Me
 *      - Who has access: Anyone
 *    → copy the Web app URL (ends in /exec).
 * 5. Paste that URL into config.js as REWARDS_ENDPOINT. The scan page
 *    switches from demo to live automatically.
 *
 * To update later: edit → Deploy → Manage deployments → pencil →
 * Version: New version → Deploy (URL stays the same).
 *
 * Quotas (consumer Gmail): ~100 emails/day = ~100 login codes/day.
 */

var SHEET_ID = ''; // ← REQUIRED: your Google Sheet ID

var POINTS_PER_DEPOSIT = 50;
var DAILY_LIMIT_PER_BIN = 1;   // deposits per user per bin per day
var DAILY_LIMIT_TOTAL   = 3;   // deposits per user per day across all bins
var OTP_TTL_MS    = 10 * 60 * 1000; // login codes valid 10 minutes
var OTP_RESEND_MS = 60 * 1000;      // min gap between codes per email
var OTP_MAX_ATTEMPTS = 5;

/* ── HTTP entry points ─────────────────────────────────────── */

function doGet() {
  return jsonOut({ ok: true, service: 're-charge-rewards' });
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    var action = String(data.action || '');
    if (action === 'request-otp') return requestOtp(data);
    if (action === 'verify-otp')  return verifyOtp(data);
    if (action === 'status')      return status(data);
    if (action === 'deposit')     return deposit(data);
    return jsonOut({ ok: false, error: 'unknown-action' });
  } catch (err) {
    return jsonOut({ ok: false, error: 'bad-request' });
  }
}

/* ── actions ───────────────────────────────────────────────── */

function requestOtp(data) {
  var email = normEmail(data.email);
  if (!email) return jsonOut({ ok: false, error: 'invalid-email' });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh = tab('OTPs');
    var row = findRow(sh, 1, email);
    var now = Date.now();
    if (row && now - Number(sh.getRange(row, 5).getValue()) < OTP_RESEND_MS) {
      return jsonOut({ ok: false, error: 'too-soon' });
    }
    var code = ('' + (100000 + Math.floor(Math.random() * 900000)));
    var values = [email, hash(code + email), now + OTP_TTL_MS, 0, now];
    if (row) sh.getRange(row, 1, 1, 5).setValues([values]);
    else sh.appendRow(values);

    MailApp.sendEmail({
      to: email,
      subject: code + ' is your Re-Charge login code',
      body:
        'Your Re-Charge Rewards login code is: ' + code + '\n\n' +
        'It expires in 10 minutes. If you did not request this, ignore this email.\n\n' +
        '— Re-Charge · re-charge.co.za',
    });
    return jsonOut({ ok: true });
  } finally {
    lock.releaseLock();
  }
}

function verifyOtp(data) {
  var email = normEmail(data.email);
  var code = String(data.code || '').trim();
  if (!email || !/^\d{6}$/.test(code)) return jsonOut({ ok: false, error: 'invalid-code' });

  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var sh = tab('OTPs');
    var row = findRow(sh, 1, email);
    if (!row) return jsonOut({ ok: false, error: 'invalid-code' });

    var vals = sh.getRange(row, 1, 1, 5).getValues()[0];
    var attempts = Number(vals[3]) + 1;
    sh.getRange(row, 4).setValue(attempts);
    if (attempts > OTP_MAX_ATTEMPTS) return jsonOut({ ok: false, error: 'too-many-attempts' });
    if (Date.now() > Number(vals[2])) return jsonOut({ ok: false, error: 'expired' });
    if (hash(code + email) !== vals[1]) return jsonOut({ ok: false, error: 'invalid-code' });

    sh.deleteRow(row); // code is single-use

    var users = tab('Users');
    var urow = findRow(users, 1, email);
    var token = Utilities.getUuid();
    if (urow) {
      users.getRange(urow, 3).setValue(token);
      users.getRange(urow, 5).setValue(new Date());
    } else {
      users.appendRow([email, 0, token, new Date(), new Date()]);
    }
    return jsonOut({ ok: true, token: token, email: email });
  } finally {
    lock.releaseLock();
  }
}

function status(data) {
  var user = userByToken(data.token);
  if (!user) return jsonOut({ ok: false, error: 'not-logged-in' });

  var out = { ok: true, email: user.email, points: user.points };
  var binId = normBin(data.bin);
  if (binId) {
    var bin = binById(binId);
    if (bin) {
      out.bin = bin;
      out.depositedToday = depositsToday(user.email, binId) >= DAILY_LIMIT_PER_BIN;
    } else {
      out.bin = null;
    }
  }
  return jsonOut(out);
}

function deposit(data) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var user = userByToken(data.token);
    if (!user) return jsonOut({ ok: false, error: 'not-logged-in' });

    var binId = normBin(data.bin);
    var bin = binById(binId);
    if (!bin) return jsonOut({ ok: false, error: 'unknown-bin' });

    if (depositsToday(user.email, binId) >= DAILY_LIMIT_PER_BIN)
      return jsonOut({ ok: false, error: 'bin-daily-limit', points: user.points });
    if (depositsToday(user.email, null) >= DAILY_LIMIT_TOTAL)
      return jsonOut({ ok: false, error: 'daily-limit', points: user.points });

    tab('Deposits').appendRow([new Date(), user.email, binId, POINTS_PER_DEPOSIT]);
    var users = tab('Users');
    var newPoints = user.points + POINTS_PER_DEPOSIT;
    users.getRange(user.row, 2).setValue(newPoints);
    users.getRange(user.row, 5).setValue(new Date());
    return jsonOut({ ok: true, points: newPoints, awarded: POINTS_PER_DEPOSIT });
  } finally {
    lock.releaseLock();
  }
}

/* ── helpers ───────────────────────────────────────────────── */

function userByToken(token) {
  token = String(token || '');
  if (!/^[0-9a-f-]{36}$/.test(token)) return null;
  var sh = tab('Users');
  var row = findRow(sh, 3, token);
  if (!row) return null;
  var vals = sh.getRange(row, 1, 1, 5).getValues()[0];
  return { row: row, email: vals[0], points: Number(vals[1]) || 0 };
}

function binById(binId) {
  if (!binId) return null;
  var sh = tab('Bins');
  var row = findRow(sh, 1, binId);
  if (!row) return null;
  var vals = sh.getRange(row, 1, 1, 4).getValues()[0];
  if (String(vals[3]).toLowerCase() === 'false') return null; // inactive
  return { id: vals[0], name: vals[1], location: vals[2] };
}

function depositsToday(email, binId) {
  var sh = tab('Deposits');
  var last = sh.getLastRow();
  if (last < 2) return 0;
  var rows = sh.getRange(2, 1, last - 1, 3).getValues();
  var today = new Date().toDateString();
  var n = 0;
  for (var i = 0; i < rows.length; i++) {
    if (String(rows[i][1]) !== email) continue;
    if (binId && String(rows[i][2]) !== binId) continue;
    if (new Date(rows[i][0]).toDateString() === today) n++;
  }
  return n;
}

var TABS = {
  Users:    ['email', 'points', 'token', 'created', 'lastSeen'],
  OTPs:     ['email', 'codeHash', 'expires', 'attempts', 'lastSentAt'],
  Deposits: ['timestamp', 'email', 'binId', 'awarded'],
  Bins:     ['binId', 'name', 'location', 'active'],
};

function tab(name) {
  var ss = SpreadsheetApp.openById(SHEET_ID);
  var sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(TABS[name]);
  }
  return sh;
}

// exact-match search in one column; returns row number or 0
function findRow(sh, col, value) {
  var last = sh.getLastRow();
  if (last < 2) return 0;
  var vals = sh.getRange(2, col, last - 1, 1).getValues();
  for (var i = 0; i < vals.length; i++) {
    if (String(vals[i][0]) === String(value)) return i + 2;
  }
  return 0;
}

function normEmail(v) {
  v = String(v || '').trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v) ? v : '';
}

function normBin(v) {
  v = String(v || '').trim().toUpperCase();
  return /^RC-\d{4}$/.test(v) ? v : '';
}

function hash(s) {
  return Utilities.base64Encode(
    Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, s, Utilities.Charset.UTF_8)
  );
}

function jsonOut(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/* ── run once from the editor after setting SHEET_ID ───────── */

function setup() {
  Object.keys(TABS).forEach(tab);
  var bins = tab('Bins');
  if (bins.getLastRow() < 2) {
    bins.appendRow(['RC-0001', 'Pilot Bin', 'Johannesburg', 'true']);
  }
}
