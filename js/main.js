/* ============================================================
   Пульс — лендинг сервиса аналитики для маркетплейсов
   Ванильный JS: тарифы, счётчики, слайдер, формы, меню.
   ============================================================ */

'use strict';

/* ---------- Мобильное меню ---------- */

const burger = document.getElementById('burger');
const nav = document.getElementById('nav');

function toggleMenu(open) {
  nav.classList.toggle('is-open', open);
  burger.classList.toggle('is-open', open);
  burger.setAttribute('aria-expanded', String(open));
}

burger.addEventListener('click', () => toggleMenu(!nav.classList.contains('is-open')));
nav.addEventListener('click', (e) => { if (e.target.closest('a')) toggleMenu(false); });

/* ---------- Тень хедера при скролле ---------- */

const header = document.getElementById('header');
const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 10);
window.addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* ---------- Формы: демо по e-mail ---------- */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function bindEmailForm(formId, inputId, noteId) {
  const form = document.getElementById(formId);
  const input = document.getElementById(inputId);
  const note = document.getElementById(noteId);

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const email = input.value.trim();
    if (!EMAIL_RE.test(email)) {
      input.classList.add('is-invalid');
      note.textContent = 'Проверьте адрес — кажется, в нём опечатка';
      note.classList.remove('form-success');
      return;
    }
    input.classList.remove('is-invalid');
    // Демо-проект: заявка никуда не отправляется, только имитация успеха
    input.value = '';
    note.textContent = 'Готово! Демо-доступ отправлен на вашу почту ✅';
    note.classList.add('form-success');
    showToast('Заявка отправлена — проверьте почту');
  });

  input.addEventListener('input', () => {
    input.classList.remove('is-invalid');
    note.classList.remove('form-success');
    note.textContent = '14 дней бесплатно · без карты · настройка за 10 минут';
  });
}

bindEmailForm('demo-form', 'demo-email', 'demo-note');
bindEmailForm('cta-form', 'cta-email', 'cta-note');

/* ---------- Переключатель периода тарифов ---------- */

const periodBtns = document.querySelectorAll('.pricing__period');

periodBtns.forEach((btn) => {
  btn.addEventListener('click', () => {
    periodBtns.forEach((b) => b.classList.remove('is-active'));
    btn.classList.add('is-active');
    const period = btn.dataset.period; // 'month' | 'year'

    document.querySelectorAll('.plan__amount').forEach((el) => {
      const value = Number(el.dataset[period]);
      animateNumber(el, value, 400);
    });
  });
});

/* Плавное перелистывание числа (для смены цен) */
function animateNumber(el, target, duration) {
  const start = Number(el.textContent.replace(/\s/g, '')) || 0;
  const startTime = performance.now();

  function frame(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    el.textContent = formatNumber(Math.round(start + (target - start) * eased));
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function formatNumber(n) {
  return new Intl.NumberFormat('ru-RU').format(n);
}

/* ---------- Счётчики в блоке цифр ---------- */

function animateCounter(el) {
  const target = Number(el.dataset.count);
  const decimals = Number(el.dataset.decimals ?? 0);
  const suffix = el.dataset.suffix ?? '';
  const duration = 1400;
  const startTime = performance.now();

  function frame(now) {
    const t = Math.min((now - startTime) / duration, 1);
    const eased = 1 - Math.pow(1 - t, 3);
    const value = target * eased;
    el.textContent = formatCounter(value, decimals) + suffix;
    if (t < 1) requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
}

function formatCounter(value, decimals) {
  if (decimals > 0) return value.toFixed(decimals).replace('.', ',');
  return formatNumber(Math.round(value));
}

const countersObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        countersObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);
document.querySelectorAll('.metric__value').forEach((el) => countersObserver.observe(el));

/* ---------- Появление блоков при скролле ---------- */

const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-visible');
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.15 }
);
document.querySelectorAll('.reveal').forEach((el) => revealObserver.observe(el));

/* ---------- Слайдер отзывов ---------- */

const track = document.getElementById('rev-track');
const slides = track.children.length;
let current = 0;

function goTo(i) {
  current = (i + slides) % slides;
  track.style.transform = `translateX(-${current * 100}%)`;
  document.querySelectorAll('#rev-dots .slider__dot').forEach((d, j) =>
    d.classList.toggle('is-active', j === current)
  );
}

(function initSlider() {
  const dots = document.getElementById('rev-dots');
  for (let i = 0; i < slides; i++) {
    const dot = document.createElement('button');
    dot.className = 'slider__dot';
    dot.setAttribute('aria-label', `Отзыв ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dots.appendChild(dot);
  }
  goTo(0);
  document.getElementById('rev-prev').addEventListener('click', () => goTo(current - 1));
  document.getElementById('rev-next').addEventListener('click', () => goTo(current + 1));
})();

/* ---------- Тосты ---------- */

const toastEl = document.getElementById('toast');
let toastTimer;

function showToast(text) {
  clearTimeout(toastTimer);
  toastEl.textContent = text;
  toastEl.classList.add('is-visible');
  toastTimer = setTimeout(() => toastEl.classList.remove('is-visible'), 2600);
}
