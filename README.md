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

- [ ] Wire the feedback form to a real endpoint (Formspree / Google Sheet)
- [ ] Replace `hello@example.com` contact link in the footer
- [ ] Add analytics if needed (e.g. Plausible/GoatCounter for a lightweight option)
- [ ] Real domain + favicon/logo assets
