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
  an x-ray view), then pre-order free — no payment taken. Submissions are
  tagged `type: 'preorder'` with the chosen config and a required
  reclaimed-cells acknowledgment. Includes the "Safety, honestly" commitments
  section.
- `scan.html` — Re-Charge Rewards scan demo: simulates the post-QR-scan
  experience at a collection box (browser-only points wallet, reward-tier
  progress). Clearly labelled demo; explains deposits are validated in the
  real system.
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

- [x] Forms wired to Formspree (`config.js` — form mzepnojr). Submissions
      arrive by email with "Re-Charge: <type>" subjects + in the Formspree
      dashboard. Free tier = 50 submissions/month; upgrade or move to
      Supabase if volume grows. On network failure, submissions fall back
      to the visitor's localStorage.
- [ ] Footer "Contact" currently points at the feedback form — swap for a
      real `mailto:` once a project email address exists (marked with a TODO
      comment in index.html; also store/scan footers)
- [ ] Review the founder note wording in the Why section (index.html)
- [ ] SRI hashes for CDN scripts deliberately omitted: hashes computed
      through the WBHO proxy can't be trusted to match origin bytes, and a
      wrong hash would block GSAP for all visitors. Add them from an
      unproxied machine if wanted.
- [ ] Sanity-check the indicative pre-order prices (R399/R599/R899) and
      rewards points values (50 RP/vape; 500/1000/2000 RP tiers)
- [ ] **Legal review before anything is sold or any live rewards programme
      runs** — reclaimed-battery liability disclaimers cannot waive strict
      product liability under the Consumer Protection Act (s61); promotional
      competitions/giveaways must comply with CPA s36; battery products need
      safety certification (e.g. IEC 62133) and product-liability insurance
- [ ] Rewards backend when real: unique per-deposit QR codes or shop-staff
      validation (anti-fraud), accounts + point balances (Supabase would fit)
- [ ] Replace `hello@example.com` contact link in the footer
- [ ] Add analytics (Plausible/GoatCounter snippet placeholder is in `<head>`)
- [ ] Swap the placeholder domain `https://re-charge.example` for the real one
      at deploy — it appears in: canonical links + `og:url` (all pages),
      `sitemap.xml`, `robots.txt`, and the JSON-LD in `index.html`. Also make
      `og:image` absolute (social platforms require absolute image URLs)
- [ ] Real domain
- [x] Logo + favicon + brand guide (see `BRAND.md`, `assets/`)
