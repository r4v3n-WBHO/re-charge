// Re-Charge — site interactions

// ---------- Mobile nav toggle ----------
const navToggle = document.querySelector('.nav__toggle');
const navLinks = document.querySelector('.nav__links');

navToggle.addEventListener('click', () => {
  const open = navLinks.classList.toggle('is-open');
  navToggle.setAttribute('aria-expanded', String(open));
});

navLinks.addEventListener('click', (e) => {
  if (e.target.tagName === 'A') {
    navLinks.classList.remove('is-open');
    navToggle.setAttribute('aria-expanded', 'false');
  }
});

// ---------- Scroll reveal ----------
const revealEls = document.querySelectorAll('.reveal');

if ('IntersectionObserver' in window) {
  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.12 }
  );
  revealEls.forEach((el) => observer.observe(el));
} else {
  revealEls.forEach((el) => el.classList.add('is-visible'));
}

// ---------- Feedback form ----------
// Submissions are stored in localStorage for now. To collect real responses,
// point FEEDBACK_ENDPOINT at a Formspree/Google Apps Script/API endpoint.
const FEEDBACK_ENDPOINT = ''; // e.g. 'https://formspree.io/f/xxxxxxx'

const form = document.getElementById('feedbackForm');
const thanks = document.getElementById('feedbackThanks');

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const data = Object.fromEntries(new FormData(form).entries());
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
    console.error('Feedback submission failed:', err);
  }

  form.hidden = true;
  thanks.hidden = false;
  thanks.scrollIntoView({ behavior: 'smooth', block: 'center' });
});
