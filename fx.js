// Re-Charge shared effects: nav charge indicator + celebration confetti
(function () {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- nav battery: starts full and drains as you read — like a
     disposable vape. Hitting 0% is the brand moment: time to Re-Charge. ---- */
  const fill = document.querySelector('.nav__charge-fill');
  if (fill) {
    const meter = document.querySelector('.nav__meter');
    const label = document.querySelector('.nav__charge-label');
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, window.scrollY / max) : 1;
      const left = Math.round((1 - p) * 100);
      fill.style.width = ((1 - p) * 100).toFixed(1) + '%';
      const drained = left < 1;
      meter.classList.toggle('is-full', drained);
      label.textContent = drained ? '♻️ 0%' : left + '%';
      meter.title = drained
        ? "Drained — just like a 'dead' vape. Tap to Re-Charge ↑"
        : 'Battery drains as you read: ' + left + '% left';
    };
    window.addEventListener('scroll', update, { passive: true });
    window.addEventListener('resize', update);
    update();
    // the meter doubles as back-to-top
    meter.style.cursor = 'pointer';
    meter.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }));
  }

  /* ---- cookieless conversion events (GoatCounter) ---- */
  window.trackEvent = function (name) {
    try {
      if (window.goatcounter && window.goatcounter.count) {
        window.goatcounter.count({ path: name, title: name, event: true });
      }
    } catch (e) { /* analytics must never break the site */ }
  };

  /* ---- 3D watchdog: if no scene initialises, mark canvases as unavailable.
     A late-arriving scene (slow CDN) clears the flag again. ---- */
  setTimeout(() => {
    if (document.querySelector('canvas') &&
        !document.body.classList.contains('webgl-on')) {
      document.body.classList.add('webgl-off');
      const recheck = setInterval(() => {
        if (document.body.classList.contains('webgl-on')) {
          document.body.classList.remove('webgl-off');
          clearInterval(recheck);
        }
      }, 1000);
      setTimeout(() => clearInterval(recheck), 30000);
    }
  }, 8000);

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
