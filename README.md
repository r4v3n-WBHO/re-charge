# Re-Charge — Power. Reclaimed.

Early-stage concept website for **Re-Charge**: exploring whether the lithium-ion
batteries inside discarded disposable vapes can be safely recovered, tested and
given a second life instead of becoming e-waste.

The site's primary goal is **validation** — explaining the idea quickly and
collecting public feedback. It deliberately does not present Re-Charge as an
established company or claim any product is for sale.

## Stack

Plain static site — no build step, no dependencies.

- `index.html` — single-page layout (hero, problem, concept, product, why, feedback, CTA, footer)
- `styles.css` — all styling; light theme with green/teal accent, fully responsive
- `script.js` — mobile nav, scroll-reveal animations, feedback form handling

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
