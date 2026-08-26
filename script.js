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
  document.querySelectorAll('.cards, .steps').forEach((group) => {
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
      card.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg) translateY(-4px)`;
    });
    card.addEventListener('pointerleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s ease';
      setTimeout(() => (card.style.transition = ''), 400);
    });
  });

  /* ---------- Magnetic buttons ---------- */
  document.querySelectorAll('.magnetic').forEach((btn) => {
    btn.addEventListener('pointermove', (e) => {
      const r = btn.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      btn.style.transform = `translate(${x * 0.18}px, ${y * 0.3}px)`;
    });
    btn.addEventListener('pointerleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform 0.35s ease';
      setTimeout(() => (btn.style.transition = ''), 350);
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

async function submitEntry(data) {
  data.submittedAt = new Date().toISOString();
  data._subject = 'Re-Charge: ' + (data.type || 'submission'); // Formspree email subject
  try {
    if (!FEEDBACK_ENDPOINT) throw new Error('no endpoint configured');
    const res = await fetch(FEEDBACK_ENDPOINT, {
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

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());
  delete data.website;
  data.type = 'feedback';
  if (!isSpam(form)) await submitEntry(data);

  form.hidden = true;
  thanks.hidden = false;
  // positive sentiment → nudge toward the strongest signal: a free pre-order
  if (/^(Great idea|Interesting)/.test(data.idea || '')) {
    document.getElementById('feedbackNudge').hidden = false;
  }
  if (window.gsap && !reduceMotion) {
    gsap.from(thanks, { opacity: 0, scale: 0.92, duration: 0.5, ease: 'back.out(1.6)' });
  }
  thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

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
    slideinForm.hidden = true;
    document.getElementById('slideinDone').hidden = false;
    setTimeout(() => {
      slidein.classList.remove('is-open');
      setTimeout(() => (slidein.hidden = true), 300);
    }, 2500);
  });
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
      area: partnerForm.area.value.trim(),
      email: partnerForm.email.value.trim(),
    });
  }
  partnerForm.hidden = true;
  partnerDone.hidden = false;
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

  notifyForm.querySelector('.notify__row').hidden = true;
  notifyDone.hidden = false;
  if (window.gsap && !reduceMotion) {
    gsap.from(notifyDone, { opacity: 0, y: 10, duration: 0.5, ease: 'power2.out' });
  }
});
