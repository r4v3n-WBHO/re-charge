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
  tagged `type: 'preorder'` with the chosen config.
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

- [ ] Wire the feedback + notify + pre-order forms to a real endpoint
      (`FEEDBACK_ENDPOINT` in `script.js` AND in `store.html`'s module —
      Formspree free tier or a Google Apps Script → Sheet)
- [ ] Sanity-check the indicative pre-order prices (R399/R599/R899)
- [ ] Replace `hello@example.com` contact link in the footer
- [ ] Add analytics (Plausible/GoatCounter snippet placeholder is in `<head>`)
- [ ] Make `og:image`/`og:url` absolute URLs once deployed (social platforms
      require absolute image URLs)
- [ ] Real domain + favicon/logo assets
