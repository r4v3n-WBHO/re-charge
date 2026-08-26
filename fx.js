// Re-Charge shared effects: nav charge indicator + celebration confetti
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- nav battery: fills as you scroll, pulses when "fully Re-Charged" ---- */
  const fill = document.querySelector('.nav__charge-fill');
  if (fill) {
    const charge = document.querySelector('.nav__charge');
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 1;
      fill.style.width = (p * 100).toFixed(1) + '%';
      charge.classList.toggle('is-full', p > 0.99);
      charge.title = p > 0.99 ? 'Fully Re-Charged ⚡' : Math.round(p * 100) + '% charged';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
  }

  /* ---- bolt confetti: celebrate votes, unlocks and sign-ups ---- */
  window.burstBolts = function () {
    if (reduce) return;
    const c = document.createElement('canvas');
    c.className = 'fx-confetti';
    c.width = window.innerWidth;
    c.height = window.innerHeight;
    document.body.appendChild(c);
    const ctx = c.getContext('2d');
    const glyphs = ['⚡', '🔋', '♻️'];
    const cols = ['#0e9f7a', '#2df0b2', '#12c493'];
    const parts = Array.from({ length: 70 }, () => ({
      x: c.width / 2 + (Math.random() - 0.5) * 240,
      y: c.height * 0.45,
      vx: (Math.random() - 0.5) * 9,
      vy: -(4 + Math.random() * 9),
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.3,
      size: 9 + Math.random() * 12,
      glyph: Math.random() < 0.45 ? glyphs[(Math.random() * glyphs.length) | 0] : null,
      col: cols[(Math.random() * cols.length) | 0],
    }));
    const t0 = performance.now();
    (function tick(t) {
      ctx.clearRect(0, 0, c.width, c.height);
      const life = Math.max(0, 1 - (t - t0) / 1800);
      let alive = false;
      for (const p of parts) {
        p.vy += 0.28;
        p.x += p.vx;
        p.y += p.vy;
        p.rot += p.vr;
        if (life > 0 && p.y < c.height + 40) alive = true;
        ctx.save();
        ctx.globalAlpha = life;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        if (p.glyph) {
          ctx.font = p.size + 'px serif';
          ctx.textAlign = 'center';
          ctx.fillText(p.glyph, 0, 0);
        } else {
          ctx.fillStyle = p.col;
          ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        }
        ctx.restore();
      }
      if (alive) requestAnimationFrame(tick);
      else c.remove();
    })(t0);
  };
})();
