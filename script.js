// Re-Charge — interactions & scroll animations

// Every form on this site is handled in JS; block native submission globally
// (capture phase) so personal data can never end up in the URL.
document.addEventListener('submit', (e) => e.preventDefault(), true);

const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ---------- Mobile nav toggle ---------- */
const nav = document.querySelector('.nav');
const navToggle = document.querySelector('.nav__toggle');
const navLinks = document.querySelector('.nav__links');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(open));
});

navLinks.addEventListener('click', (e) => {
  if (e.target.closest('a')) {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

/* ---------- Scrollspy: highlight the nav link for the section in view ---------- */
const spyLinks = [...document.querySelectorAll('.nav__links a[href^="#"]:not(.btn)')];
if (spyLinks.length) {
  const byId = new Map(spyLinks.map((a) => [a.getAttribute('href').slice(1), a]));
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      spyLinks.forEach((a) => a.classList.remove('is-active'));
      byId.get(entry.target.id)?.classList.add('is-active');
    });
  }, { rootMargin: '-35% 0px -55% 0px' });
  byId.forEach((_, id) => {
    const section = document.getElementById(id);
    if (section) spy.observe(section);
  });
}

/* ---------- Nav background on scroll ---------- */
const onScroll = () => nav.classList.toggle('is-scrolled', window.scrollY > 24);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- GSAP animations ---------- */
if (window.gsap && !reduceMotion) {
  document.documentElement.classList.add('js-anim');
  gsap.registerPlugin(ScrollTrigger);

  // Hero entrance (kept short — CTAs must be usable fast)
  const intro = gsap.timeline({
    defaults: { ease: 'power3.out' },
    onComplete: () => { window.__introDone = true; },
  });
  intro
    .from('#heroTitle .line > span', { yPercent: 110, duration: 0.7, stagger: 0.08 }, 0.05)
    .fromTo('.hero-fade',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.5, stagger: 0.08 }, 0.25)
    .from('#heroVisual', { opacity: 0, scale: 0.88, duration: 0.8, ease: 'power2.out' }, 0.2)
    .from('.hero__flow .flow__step, .hero__flow .flow__arrow', {
      opacity: 0, y: 20, duration: 0.4, stagger: 0.05,
    }, 0.5);

  // Section reveals
  document.querySelectorAll('.reveal').forEach((el) => {
    gsap.to(el, {
      opacity: 1, y: 0, duration: 0.8, ease: 'power3.out',
      scrollTrigger: { trigger: el, start: 'top 82%' },
    });
    gsap.set(el, { y: 32 });
  });

  // Staggered items (cards, steps)
  document.querySelectorAll('.cards, .steps, .roadmap').forEach((group) => {
    const items = group.querySelectorAll('.reveal-item');
    gsap.set(items, { y: 44 });
    gsap.to(items, {
      opacity: 1, y: 0, duration: 0.7, ease: 'power3.out', stagger: 0.14,
      scrollTrigger: { trigger: group, start: 'top 80%' },
    });
  });

  // Concept timeline progress line (scrubbed by scroll)
  const progress = document.getElementById('stepsProgress');
  if (progress) {
    gsap.to(progress, {
      width: '100%', ease: 'none',
      scrollTrigger: {
        trigger: '#stepsTimeline',
        start: 'top 75%',
        end: 'bottom 45%',
        scrub: 0.6,
      },
    });
  }

  // Roadmap: the travelled stretch of road draws in up to "You are here"
  const roadTravel = document.getElementById('roadTravel');
  if (roadTravel) {
    const len = roadTravel.getTotalLength();
    roadTravel.style.strokeDasharray = len;
    roadTravel.style.strokeDashoffset = len;
    gsap.to(roadTravel, {
      strokeDashoffset: 0, ease: 'none',
      scrollTrigger: { trigger: '#roadmap', start: 'top 80%', end: 'top 40%', scrub: 0.5 },
    });
  }

  // Gentle parallax on ambient blobs
  gsap.to('.bg__blob--1', {
    yPercent: 30, ease: 'none',
    scrollTrigger: { trigger: 'body', start: 'top top', end: 'max', scrub: 1.2 },
  });
} else {
  // No GSAP (CDN blocked) or reduced motion: content stays visible via CSS defaults
  document.documentElement.classList.remove('js-anim');
  window.__introDone = true;
}

/* ---------- 3D tilt on cards ---------- */
if (!reduceMotion && window.matchMedia('(hover: hover)').matches) {
  document.querySelectorAll('.tilt').forEach((card) => {
    card.addEventListener('pointermove', (e) => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      card.style.transform = `rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s ease';
      setTimeout(() => (card.style.transition = ''), 400);
    });
  });

}

/* ---------- Feedback form ---------- */
// Endpoint lives in config.js (window.RECHARGE_CONFIG) — one place for all pages.
// Until it's set, submissions are stored in the visitor's localStorage.
const FEEDBACK_ENDPOINT = (window.RECHARGE_CONFIG || {}).FEEDBACK_ENDPOINT || '';

// honeypot: bots fill the hidden "website" field; humans never see it
function isSpam(form) {
  return Boolean(form.website && form.website.value);
}

// share links can carry ?src=reddit etc. — recorded on every submission
const SRC_CHANNEL = new URLSearchParams(location.search).get('src') || '';

async function submitEntry(data) {
  data.submittedAt = new Date().toISOString();
  data._subject = 'Re-Charge: ' + (data.type || 'submission'); // Formspree email subject
  if (SRC_CHANNEL) data.channel = SRC_CHANNEL;
  try {
    if (!FEEDBACK_ENDPOINT) throw new Error('no endpoint configured');
    // Apps Script can't answer CORS preflight — send as a "simple request"
    // (default text/plain body, no custom headers). Formspree gets JSON.
    const isAppsScript = FEEDBACK_ENDPOINT.includes('script.google.com');
    const res = await fetch(FEEDBACK_ENDPOINT, isAppsScript
      ? { method: 'POST', body: JSON.stringify(data) }
      : {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(data),
        });
    if (!res.ok) throw new Error('HTTP ' + res.status);
  } catch (err) {
    // network/endpoint failure: keep a local copy so nothing is silently lost
    console.error('Submission failed, stored locally:', err);
    const stored = JSON.parse(localStorage.getItem('recharge-feedback') || '[]');
    stored.push(data);
    localStorage.setItem('recharge-feedback', JSON.stringify(stored));
  }
}

const form = document.getElementById('feedbackForm');
const thanks = document.getElementById('feedbackThanks');

// vape-specific questions only apply to people who vape; keep the form
// short for everyone else and clear stale answers when they're hidden
const vaperQs = document.getElementById('vaperQs');
if (vaperQs) {
  form.querySelectorAll('input[name="audience"]').forEach((r) => {
    r.addEventListener('change', () => {
      const show = r.value === 'I vape' && r.checked;
      vaperQs.hidden = !show;
      if (!show) vaperQs.querySelectorAll('input:checked').forEach((c) => { c.checked = false; });
    });
  });
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());
  delete data.website;
  data.type = 'feedback';
  if (!isSpam(form)) await submitEntry(data);

  form.hidden = true;
  thanks.hidden = false;
  window.burstBolts?.();
  window.trackEvent?.('feedback-submitted');
  // positive sentiment → nudge toward the strongest signal: a free pre-order
  if (/^(Great idea|Interesting)/.test(data.idea || '')) {
    document.getElementById('feedbackNudge').hidden = false;
  }
  if (window.gsap && !reduceMotion) {
    gsap.from(thanks, { opacity: 0, scale: 0.92, duration: 0.5, ease: 'back.out(1.6)' });
  }
  thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

/* ---------- Battery-level easter egg (Chrome/Edge; degrades invisibly) ---------- */
if (navigator.getBattery) {
  navigator.getBattery().then((b) => {
    const note = document.getElementById('batteryNote');
    if (!note || b.level == null) return;
    note.querySelector('strong').textContent = Math.round(b.level * 100) + '%';
    note.hidden = false;
  }).catch(() => {});
}

/* ---------- Share buttons ---------- */
const shareUrl = location.origin + location.pathname;
const shareText = "What if your dead vape could get a second life? Re-Charge is a concept turning vape waste into power banks — pre-orders decide if it gets built.";

const wa = document.getElementById('shareWhatsApp');
if (wa) {
  wa.href = 'https://wa.me/?text=' + encodeURIComponent(shareText + ' ' + shareUrl);
  document.getElementById('shareX').href =
    'https://x.com/intent/tweet?text=' + encodeURIComponent(shareText) + '&url=' + encodeURIComponent(shareUrl);
  document.getElementById('shareLinkedIn').href =
    'https://www.linkedin.com/sharing/share-offsite/?url=' + encodeURIComponent(shareUrl);
  wa.addEventListener('click', () => window.trackEvent?.('share-whatsapp'));
  document.getElementById('shareX').addEventListener('click', () => window.trackEvent?.('share-x'));
  document.getElementById('shareLinkedIn').addEventListener('click', () => window.trackEvent?.('share-linkedin'));

  // native share sheet where supported (mobile — WhatsApp etc.)
  if (navigator.share) {
    const nativeBtn = document.createElement('button');
    nativeBtn.type = 'button';
    nativeBtn.className = 'share__btn';
    nativeBtn.textContent = 'Share…';
    nativeBtn.addEventListener('click', () => {
      window.trackEvent?.('share-native');
      navigator.share({ title: 'Re-Charge', text: shareText, url: shareUrl }).catch(() => {});
    });
    document.querySelector('.share__row').prepend(nativeBtn);
  }

  const copyBtn = document.getElementById('copyLink');
  copyBtn.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      copyBtn.textContent = 'Copied ✓';
      setTimeout(() => (copyBtn.textContent = 'Copy Link'), 2000);
    } catch {
      copyBtn.textContent = shareUrl; // clipboard blocked: show the URL instead
    }
  });
}

/* ---------- Sticky mobile CTA ---------- */
const mobileCta = document.getElementById('mobileCta');
if (mobileCta && !localStorage.getItem('recharge-mobilecta-dismissed')) {
  const showCta = () => {
    mobileCta.hidden = window.scrollY < window.innerHeight * 0.9;
  };
  window.addEventListener('scroll', showCta, { passive: true });

  document.getElementById('mobileCtaClose').addEventListener('click', () => {
    mobileCta.hidden = true;
    localStorage.setItem('recharge-mobilecta-dismissed', '1');
    window.removeEventListener('scroll', showCta);
  });
}

/* ---------- Once-ever notify slide-in (desktop, 60% scroll) ---------- */
const slidein = document.getElementById('slidein');
if (
  slidein &&
  !localStorage.getItem('recharge-slidein-shown') &&
  window.matchMedia('(min-width: 641px)').matches
) {
  const maybeShow = () => {
    const scrollable = document.documentElement.scrollHeight - window.innerHeight;
    if (scrollable > 0 && window.scrollY / scrollable > 0.6) {
      slidein.hidden = false;
      requestAnimationFrame(() => slidein.classList.add('is-open'));
      localStorage.setItem('recharge-slidein-shown', '1'); // once ever
      window.removeEventListener('scroll', maybeShow);
    }
  };
  window.addEventListener('scroll', maybeShow, { passive: true });

  document.getElementById('slideinClose').addEventListener('click', () => {
    slidein.classList.remove('is-open');
    setTimeout(() => (slidein.hidden = true), 300);
  });

  const slideinForm = document.getElementById('slideinForm');
  slideinForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = slideinForm.email.value.trim();
    if (!email || !slideinForm.email.checkValidity()) { slideinForm.email.focus(); return; }
    if (!isSpam(slideinForm)) await submitEntry({ type: 'interest', source: 'slidein', email });
    window.trackEvent?.('notify-slidein');
    slideinForm.hidden = true;
    document.getElementById('slideinDone').hidden = false;
    setTimeout(() => {
      slidein.classList.remove('is-open');
      setTimeout(() => (slidein.hidden = true), 300);
    }, 2500);
  });
}

/* ---------- Stat count-up (problem section) ---------- */
const statCounts = document.querySelectorAll('.stat__count');
if (statCounts.length) {
  const runCount = (el) => {
    const target = parseInt(el.dataset.count, 10);
    if (reduceMotion) { el.textContent = target.toLocaleString('en-ZA'); return; }
    const start = performance.now();
    const dur = 1400;
    (function tick(now) {
      const t = Math.min(1, (now - start) / dur);
      const eased = 1 - Math.pow(1 - t, 3);
      el.textContent = Math.round(target * eased).toLocaleString('en-ZA');
      if (t < 1) requestAnimationFrame(tick);
    })(start);
  };
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        runCount(entry.target);
        statObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.6 });
  statCounts.forEach((el) => statObserver.observe(el));
}

/* ---------- Partner interest form ---------- */
const partnerForm = document.getElementById('partnerForm');
const partnerDone = document.getElementById('partnerDone');

partnerForm.addEventListener('submit', async (e) => {
  e.preventDefault();
  if (!partnerForm.business.value.trim() || !partnerForm.email.checkValidity()) {
    (partnerForm.business.value.trim() ? partnerForm.email : partnerForm.business).focus();
    return;
  }
  if (!isSpam(partnerForm)) {
    await submitEntry({
      type: 'partner',
      business: partnerForm.business.value.trim(),
      venueType: partnerForm.venueType.value,
      area: partnerForm.area.value.trim(),
      email: partnerForm.email.value.trim(),
    });
  }
  partnerForm.hidden = true;
  partnerDone.hidden = false;
  window.burstBolts?.();
  window.trackEvent?.('partner-registered');
});

/* ---------- Notify strip (email capture) ---------- */
const notifyForm = document.getElementById('notifyForm');
const notifyDone = document.getElementById('notifyDone');

notifyForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = notifyForm.email.value.trim();
  if (!email || !notifyForm.email.checkValidity()) {
    notifyForm.email.focus();
    return;
  }

  if (!isSpam(notifyForm)) await submitEntry({ type: 'interest', email });
  window.trackEvent?.('notify-signup');

  notifyForm.querySelector('.notify__row').hidden = true;
  notifyDone.hidden = false;
  if (window.gsap && !reduceMotion) {
    gsap.from(notifyDone, { opacity: 0, y: 10, duration: 0.5, ease: 'power2.out' });
  }
});

/* ---------- email capture: +100 RP signup popup ---------- */
// Shows once per visitor (20s in or 45% scrolled). Signing up records an
// 'email-signup' entry — those emails get 100 RP credited in the Rewards
// ledger at launch, and they're the launch-announcement list.
(function () {
  const KEY = 'recharge-signup';
  const state = localStorage.getItem(KEY);
  if (state === 'done' || state === 'dismissed') return;
  // shown but not answered: snooze for 3 days rather than nag every visit
  if (state && Date.now() - Number(state) < 3 * 24 * 60 * 60 * 1000) return;

  const pop = document.createElement('aside');
  pop.className = 'signup-pop';
  pop.setAttribute('aria-label', 'Get launch updates');
  pop.innerHTML = `
    <button type="button" class="signup-pop__close" aria-label="Close">✕</button>
    <div class="signup-pop__body">
      <span class="signup-pop__badge">⚡ +100 RP</span>
      <h3>Claim 100 points before launch</h3>
      <p>Leave your email and we'll credit <strong>100 Re-Charge Points</strong> to
        your Rewards balance at launch — plus first dibs when builds go live.
        No spam, unsubscribe anytime.</p>
      <form class="signup-pop__form" novalidate>
        <input type="email" name="email" placeholder="you@example.com" autocomplete="email" required />
        <button type="submit" class="btn btn--primary">Claim my RP</button>
      </form>
      <p class="signup-pop__done" hidden>🎉 You're in — 100 RP reserved. See you at launch!</p>
    </div>`;
  document.body.appendChild(pop);

  let shown = false;
  function show() {
    if (shown) return;
    shown = true;
    clearTimeout(timer);
    removeEventListener('scroll', onScroll);
    pop.classList.add('is-visible');
    localStorage.setItem(KEY, String(Date.now())); // snooze marker
    window.trackEvent?.('signup-pop-shown');
  }
  const timer = setTimeout(show, 20000);
  function onScroll() {
    if (scrollY + innerHeight > document.documentElement.scrollHeight * 0.45) show();
  }
  addEventListener('scroll', onScroll, { passive: true });

  pop.querySelector('.signup-pop__close').addEventListener('click', () => {
    localStorage.setItem(KEY, 'dismissed');
    pop.classList.remove('is-visible');
    setTimeout(() => pop.remove(), 400);
  });

  pop.querySelector('.signup-pop__form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const input = e.target.email;
    if (!input.value.trim() || !input.checkValidity()) { input.focus(); return; }
    await submitEntry({ type: 'email-signup', email: input.value.trim(), rpPromised: 100 });
    window.trackEvent?.('signup-pop-claimed');
    localStorage.setItem(KEY, 'done');
    e.target.hidden = true;
    pop.querySelector('.signup-pop__done').hidden = false;
    setTimeout(() => { pop.classList.remove('is-visible'); setTimeout(() => pop.remove(), 400); }, 3500);
  });
})();
