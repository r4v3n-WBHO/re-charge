# Re-Charge Brand Guide

## Essence

Re-Charge turns one of the fastest-growing waste streams into useful power.
Everything the brand does should feel: **sustainable, innovative, honest,
experimental, tech-forward** — a clever startup asking a question in public,
never a faceless recycling corporation and never a vape company.

## Logo

**The mark — "Circular Energy":** a battery with a lightning bolt at its
core, held inside a circular loop with two arrowheads — the battery and bolt
show power, the arrows show recovery and second life. The whole brand story
in one glyph. (Chosen from the August 2026 concept board, option 1.)

| File | Use |
|---|---|
| `assets/logo-mark.svg` | Mark only (gradient) — avatars, app icons, watermarks |
| `assets/logo-lockup.svg` | Mark + wordmark + tagline, for light backgrounds |
| `assets/logo-lockup-dark.svg` | Same lockup for dark backgrounds |
| `favicon.svg` | White mark on gradient rounded square (browser tab / small sizes) |

Rules:
- The hyphen in RE-CHARGE is always the accent green — it's the "spark" in the
  wordmark (`.logo-hyphen` in CSS).
- Don't rotate, recolour outside the palette, or separate the bolt from the loop.
- Clear space: at least the height of the bolt on all sides.
- SVG wordmarks use Space Grotesk via webfont — **convert text to outlines
  before print/merch use.**

## Colour

| Token | Hex | Role |
|---|---|---|
| Eco Green | `#0e9f7a` | Primary accent, actions, the brand colour |
| Deep Green | `#0b8465` | Accent text on light backgrounds |
| Mint Spark | `#2df0b2` | Highlights, glows, accents on dark |
| Forest Ink | `#0e2a25` | Dark sections, near-black |
| Leaf Tint | `#eff7f4` | Tinted section backgrounds |
| Paper | `#fbfdfc` | Page background (green-tinted white) |
| Ink | `#14201c` | Body text |

Gradient: `linear-gradient(135deg, #0e9f7a, #12c493)` for buttons/mark fills.

## Typography

- **Space Grotesk** (600–700) — headings, wordmark, buttons, numbers
- **Inter** (400–600) — body text, forms

## Tagline & slogan bank

**Primary tagline (always with the logo):**
> Power. Reclaimed.

**Campaign lines (context-specific, use sparingly):**
- *Don't bin it. Re-Charge it.* — collection/rewards messaging
- *Waste in. Power out.* — product messaging
- *Built from what you threw away.* — Re-Charge One messaging
- *Backing is a vote.* — validation/backing messaging. The demand mechanic is
  named **Back the Build** (free, no payment, no obligation — "tell us you'd
  buy one; if enough people back it, we build it"); avoid "pre-order" in
  user-facing copy, it implies a conventional paid order.
- *Don't bin your vape. Drop it here.* — printed on collection bins
- *Recover. Reuse. Re-Charge.* — bin/loop messaging, pairs with the marquee chant
- *Built for a second life.* — product & bin messaging

## Rewards economics (design principles, decided Aug 2026)

- A returner with many vapes is a **supplier, not an exploiter** — each device
  delivers the raw material. Welcome volume; route big hauls through a bulk
  channel at a negotiated rate instead of per-device points.
- Guardrails: per-person **daily earn caps**, **redemption capped per order**
  (points discount a product, never below marginal cash cost — no accidental
  free products), **12-month expiry**, and points issued only against
  **validated deposits** (append-only ledger when the backend exists).
- The deliberate exception: if unit economics prove out, "bring us ~80 dead
  vapes, walk away with a power bank built from them" can be enabled
  intentionally as a flagship marketing story — a decision, not a loophole.

## Collection bin (concept spec, Aug 2026 board)

Re-Charge Green wheelie bin, ~30 L HDPE, 560×310×290 mm, lockable lid
(hasp + padlock), narrow 120×25 mm disposal slot (prevents hand access),
sloped internal insert, fire-safe reduced-oxygen design, UV/weather
resistant, 120 mm wheels. Front print: mark + wordmark + "DON'T BIN YOUR
VAPE. DROP IT HERE." + QR to the scan page + domain.

## Voice

- **Never blame the vaper.** The antagonist is always the *single-use design*,
  never the person. A vaper who returns a device is the hero of the story.
  Frame everything around the technology: an excellent rechargeable cell,
  discarded not because it's broken but because the product around it is
  finished. No guilt, no judgment, no commentary on whether people should
  vape — that's a debate for other people.
- **Honest first.** We're a concept and we say so. Estimated prices are
  "estimated", renders are "conceptual", safety claims are commitments, not
  boasts. Never greenwash.
- **Direct and warm**, not corporate. "Your dead vape" beats "end-of-life
  vaping devices."
- **Questions over claims.** The brand asks ("What if…?", "Would you…?")
  because validation is the product right now.
- Emoji: sparingly, one per section max, only in friendly UI moments (♻️ ⚡ 🎁).

## Recurring motifs

- The circular loop (rewards diagram, mark, marquee chant: COLLECT ✦ RECOVER ✦ TEST ✦ RE-CHARGE)
- Speckled recycled plastic (3D shells, future packaging/merch texture)
- The scan ring sweeping the battery (hero 3D) — "testing" made visible
- Battery charge bars as a progress metaphor (product, rewards tiers)
