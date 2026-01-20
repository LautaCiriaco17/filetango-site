// Filetango - main.js

// --- Mobile menu ---
(() => {
  const hamburger = document.getElementById('hamburger');
  const menu = document.getElementById('menu');
  if (!hamburger || !menu) return;

  hamburger.addEventListener('click', () => {
    const isOpen = menu.classList.toggle('open');
    hamburger.setAttribute('aria-expanded', String(isOpen));
  });

  // Cerrar menú al clickear un link (mobile)
  menu.querySelectorAll('a').forEach((a) => {
    a.addEventListener('click', () => {
      menu.classList.remove('open');
      hamburger.setAttribute('aria-expanded', 'false');
    });
  });
})();

// --- Hero slider (simple crossfade) ---
(() => {
  const slider = document.getElementById('heroSlider');
  if (!slider) return;

  const imgs = Array.from(slider.querySelectorAll('img'));
  if (imgs.length <= 1) return;

  let i = 0;
  imgs.forEach((img, idx) => (img.style.opacity = idx === 0 ? '1' : '0'));

  setInterval(() => {
    const prev = i;
    i = (i + 1) % imgs.length;
    imgs[prev].style.opacity = '0';
    imgs[i].style.opacity = '1';
  }, 4500);
})();

// --- Footer year ---
(() => {
  const y = document.getElementById('year');
  if (y) y.textContent = String(new Date().getFullYear());
})();

// --- Instagram gallery (Netlify Function / Graph API) ---
async function loadInstagramFeed() {
  const grid = document.getElementById('igGrid');
  if (!grid) return;

  // Endpoint recomendado si lo hosteás en Netlify:
  // /.netlify/functions/instagram
  // Si lo hosteás en otro lado, podés cambiarlo a /api/instagram
  const endpoint = '/.netlify/functions/instagram';

  try {
    grid.innerHTML = '<p class="muted">Cargando galería…</p>';

    const res = await fetch(endpoint, { headers: { 'Accept': 'application/json' } });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);

    const data = await res.json();
    const items = Array.isArray(data?.items) ? data.items : [];

    if (!items.length) {
      grid.innerHTML = '<p class="muted">Todavía no está conectada la galería automática. Mientras tanto, mirá el Instagram 👇</p>';
      return;
    }

    grid.innerHTML = items
      .filter((it) => it.media_url && it.permalink)
      .slice(0, 12)
      .map((it) => {
        const caption = (it.caption || '').replace(/\s+/g, ' ').trim();
        const safeCaption = caption.length ? caption : 'Ver en Instagram';
        return `
          <a class="ig-card" href="${it.permalink}" target="_blank" rel="noopener" aria-label="${escapeHtml(safeCaption)}">
            <img src="${it.media_url}" alt="${escapeHtml(safeCaption)}" loading="lazy" />
          </a>
        `;
      })
      .join('');
  } catch (err) {
    // Si falla el endpoint (todavía no configurado), no rompemos nada.
    grid.innerHTML = '<p class="muted">Galería automática pendiente de conexión. Podés ver los trabajos en Instagram 👇</p>';
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}
async function loadInstagramGallery() {
  const r = await fetch("/.netlify/functions/instagram");
  const json = await r.json();

  if (!r.ok) {
    console.error("Error IG:", json);
    return;
  }

  const items = (json.data || [])
    .filter(x => x.media_type === "IMAGE" || x.media_type === "CAROUSEL_ALBUM" || x.media_type === "VIDEO");

  const container = document.querySelector("#ig-gallery"); // el div donde va
  container.innerHTML = "";

  for (const it of items.slice(0, 12)) {
    const imgSrc = it.media_type === "VIDEO" ? it.thumbnail_url : it.media_url;

    const a = document.createElement("a");
    a.href = it.permalink;
    a.target = "_blank";
    a.rel = "noopener";

    const img = document.createElement("img");
    img.src = imgSrc;
    img.alt = it.caption ? it.caption.slice(0, 80) : "Instagram post";
    img.loading = "lazy";

    a.appendChild(img);
    container.appendChild(a);
  }
}

loadInstagramGallery();

(function(){
  const slider = document.getElementById("heroSlider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll(".hero-slide"));
  if (slides.length <= 1) return;

  let i = 0;
  setInterval(() => {
    slides[i].classList.remove("is-active");
    i = (i + 1) % slides.length;
    slides[i].classList.add("is-active");
  }, 3500);
})();
(function initHeroSlider() {
  const slider = document.getElementById("heroSlider");
  if (!slider) return;

  const slides = Array.from(slider.querySelectorAll("img"));
  if (slides.length <= 1) {
    if (slides[0]) slides[0].classList.add("is-active");
    return;
  }

  // Si el usuario prefiere menos movimiento: dejá la primera fija.
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduceMotion) {
    slides.forEach((img, i) => img.classList.toggle("is-active", i === 0));
    return;
  }

  let index = 0;
  let timer = null;
  const INTERVAL = 5200; // tiempo entre slides
  const FADE_MS = 900;   // coincide con el CSS

  function show(i) {
    slides.forEach((img, idx) => {
      img.classList.toggle("is-active", idx === i);
      img.setAttribute("aria-hidden", idx === i ? "false" : "true");
    });
  }

  function next() {
    index = (index + 1) % slides.length;
    show(index);
  }

  function start() {
    stop();
    timer = setInterval(next, INTERVAL);
  }

  function stop() {
    if (timer) clearInterval(timer);
    timer = null;
  }

  // init
  show(index);
  start();

  // Pausa cuando pasás el mouse (más “premium”)
  slider.addEventListener("mouseenter", stop);
  slider.addEventListener("mouseleave", start);

  // Si la pestaña no está activa, no gastes recursos
  document.addEventListener("visibilitychange", () => {
    if (document.hidden) stop();
    else start();
  });

slides.forEach(img => {
  const src = img.getAttribute("src");
  const pre = new Image();
  pre.src = src;
});

document.addEventListener('DOMContentLoaded', loadInstagramFeed);
})();