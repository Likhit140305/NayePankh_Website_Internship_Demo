// ── Theme Toggle ─────────────────────────────────────────────────────────
const themeBtn = document.getElementById('themeBtn');
if (themeBtn) {
  let dark = false;
  themeBtn.addEventListener('click', () => {
    dark = !dark;
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : '');
    themeBtn.textContent = dark ? 'Light' : 'Dark';
  });
}

// ── Scroll Animations ────────────────────────────────────────────────────
const observer = new IntersectionObserver((entries) => {
  entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
}, { threshold: 0.15 });

document.querySelectorAll('.fade-up').forEach(el => observer.observe(el));

// ── Smooth anchor navigation ─────────────────────────────────────────────
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});
