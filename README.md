# Re-Charge — Power. Reclaimed.

Early-stage concept website for **Re-Charge**: exploring whether the lithium-ion
batteries inside discarded disposable vapes can be safely recovered, tested and
given a second life instead of becoming e-waste.

The site's primary goal is **validation** — explaining the idea quickly and
collecting public feedback. It deliberately does not present Re-Charge as an
established company or claim any product is for sale.

## Stack

Static site, no build step. Three.js and GSAP are loaded from the jsDelivr CDN;
if the CDN is unreachable the site degrades gracefully (content stays visible,
3D canvases stay empty).

- `index.html` — single-page layout + inline Three.js module (3D battery hero,
  draggable Re-Charge One power bank mockup)
- `store.html` — car-style configurator: pick a recycled-bottle enclosure
  colour (live 3D recolour) and capacity (shows the reclaimed cells inside via
  an x-ray view), then "Back the Build" — a free demand vote, no payment
  taken (user-facing copy avoids "pre-order"). Submissions are still
  tagged `type: 'preorder'` with the chosen config and a required
  reclaimed-cells acknowledgment. Includes the "Safety, honestly" commitments
  section.
- `scan.html` — Re-Charge Rewards scan page. Two modes, switched by
  `REWARDS_ENDPOINT` in `config.js`:
  - **Demo** (endpoint empty): browser-only points wallet, clearly labelled.
  - **Live** (endpoint set): real server-side ledger via
    `backend/rewards-apps-script.gs` (Google Apps Script + Sheet). Email +
    6-digit-code login, points saved per email, deposits credited when a
    bin QR (`scan.html?bin=RC-0001`) is scanned — capped at 1/bin/day and
    3/day per user. Generate printable bin QRs with
    `scripts\new-bin-qr.ps1 -BinId RC-0001`; register bins in the Sheet's
    Bins tab. Setup steps are in the header of the .gs file.
- `styles.css` — light theme, green/teal accent, ambient grid/blob background,
  marquee, fully responsive, `prefers-reduced-motion` support
- `script.js` — GSAP ScrollTrigger reveals, scrubbed concept timeline, card
  tilt, magnetic buttons, mobile nav, feedback form handling

## Run locally

Just open `index.html` in a browser, or serve it:

```
npx serve .
```

## Feedback form

Right now submissions are saved to the visitor's own `localStorage` (no backend).
To collect real responses, set `FEEDBACK_ENDPOINT` at the top of `script.js` to a
[Formspree](https://formspree.io) form URL (free tier works) or any endpoint that
accepts a JSON POST.

## Deploy

Works as-is on GitHub Pages: push to GitHub, then Settings → Pages → deploy from
the `main` branch root.

## TODO

- [x] Forms wired to Formspree (`config.js` — form mzepnojr, 50/month free).
      On network failure, submissions fall back to the visitor's localStorage.
- [ ] **Switch to the self-owned Google Apps Script backend** (no third
      party, no monthly cap worth worrying about): follow the setup steps in
      `backend/apps-script.gs` (~5 min in script.google.com), then paste the
      /exec URL into `config.js`. The site auto-detects script.google.com
      endpoints and sends CORS-safe requests.
- [x] Analytics: GoatCounter (cookieless) on all pages —
      https://revan-lombard.goatcounter.com
- [x] Channel attribution: share links with `?src=reddit` (or any label)
      record `channel` on every submission from that visit.
- [ ] Footer "Contact" currently points at the feedback form — swap for a
      real `mailto:` once a project email address exists (marked with a TODO
      comment in index.html; also store/scan footers)
- [ ] Review the founder note wording in the Why section (index.html)
- [ ] SRI hashes for CDN scripts deliberately omitted: hashes computed
      through the WBHO proxy can't be trusted to match origin bytes, and a
      wrong hash would block GSAP for all visitors. Add them from an
      unproxied machine if wanted.
- [ ] Sanity-check the indicative pre-order prices (R599/R899/R1 499),
      rewards points values (50 RP/vape; 500/1000/2000 RP tiers) and the
      bin-sponsorship price (once-off R999, bins.html#sponsor). Sponsorship
      wording deliberately says collections run "as long as the programme
      runs", NOT "lifetime" — an unconditional lifetime-service promise is
      an unbounded CPA liability; name-on-bin is lifetime, service is not
- [ ] **Bin placement policy** (protects collection economics): bins only go
      onto serviced routes inside the active service area (pilot: JHB East);
      out-of-area sponsors join an area waitlist that unlocks when enough bins
      are backed there; collections are scheduled by fill level, not calendar.
      Never promise a lone far-away bin — a full route pays for itself in
      reclaimed cells, a lone distant bin never does.
- [ ] **Sponsor monthly impact reports** when bins are live: per-bin deposit
      counts come straight from the rewards Sheet's Deposits tab (filter by
      binId + month). Automate later with an Apps Script time trigger that
      emails each sponsor their bin's count on the 1st.
- [ ] **Legal review before anything is sold or any live rewards programme
      runs** — reclaimed-battery liability disclaimers cannot waive strict
      product liability under the Consumer Protection Act (s61); promotional
      competitions/giveaways must comply with CPA s36; battery products need
      safety certification (e.g. IEC 62133) and product-liability insurance
- [x] Rewards backend: `backend/rewards-apps-script.gs` (Apps Script + Sheet
      ledger, email-code login, daily deposit caps). Deploy it and set
      `REWARDS_ENDPOINT` in `config.js` to go live. Pilot trust model is
      "trust the scan with daily caps" — upgrade path when rewards get
      valuable: unique per-deposit codes or staff validation (anti-fraud)
- [ ] **Bin locations map** (when real bins exist): Leaflet + OpenStreetMap
      (free, no API key, no tracking — fits the privacy stance; Google Maps
      would need an API key + billing account). Pins from a simple JSON file
      at first (name, venue type, lat/lng, hours), later from the backend.
      Partner-form "area" answers are the seed data for where the first pins
      go. Each bin's QR should carry ?src=bin-<id> so scans attribute per bin.
- [ ] Replace `hello@example.com` contact link in the footer
- [ ] Add analytics (Plausible/GoatCounter snippet placeholder is in `<head>`)
- [ ] Swap the placeholder domain `https://re-charge.example` for the real one
      at deploy — it appears in: canonical links + `og:url` (all pages),
      `sitemap.xml`, `robots.txt`, and the JSON-LD in `index.html`. Also make
      `og:image` absolute (social platforms require absolute image URLs)
- [ ] Real domain
- [x] Logo + favicon + brand guide (see `BRAND.md`, `assets/`)
