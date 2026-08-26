// Re-Charge — interactions & scroll animations

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

  // Hero entrance
  const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
  intro
    .from('#heroTitle .line > span', { yPercent: 110, duration: 0.9, stagger: 0.12 }, 0.1)
    .fromTo('.hero-fade',
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.7, stagger: 0.12 }, 0.4)
    .from('#heroVisual', { opacity: 0, scale: 0.85, duration: 1.1, ease: 'power2.out' }, 0.3)
    .from('.hero__flow .flow__step, .hero__flow .flow__arrow', {
      opacity: 0, y: 24, duration: 0.5, stagger: 0.08,
    }, 0.8);

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
// Submissions are stored in localStorage for now. To collect real responses,
// point FEEDBACK_ENDPOINT at a Formspree/Google Apps Script/API endpoint.
const FEEDBACK_ENDPOINT = ''; // e.g. 'https://formspree.io/f/xxxxxxx'

async function submitEntry(data) {
  data.submittedAt = new Date().toISOString();
  try {
    if (FEEDBACK_ENDPOINT) {
      await fetch(FEEDBACK_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify(data),
      });
    } else {
      const stored = JSON.parse(localStorage.getItem('recharge-feedback') || '[]');
      stored.push(data);
      localStorage.setItem('recharge-feedback', JSON.stringify(stored));
    }
  } catch (err) {
    console.error('Submission failed:', err);
  }
}

const form = document.getElementById('feedbackForm');
const thanks = document.getElementById('feedbackThanks');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());
  data.type = 'feedback';
  await submitEntry(data);

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

  await submitEntry({ type: 'interest', email });

  notifyForm.querySelector('.notify__row').hidden = true;
  notifyDone.hidden = false;
  if (window.gsap && !reduceMotion) {
    gsap.from(notifyDone, { opacity: 0, y: 10, duration: 0.5, ease: 'power2.out' });
  }
});
