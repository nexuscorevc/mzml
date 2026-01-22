/* =========================
   EDIT YOUR INFO HERE
   ========================= */
const PROFILE = {
  name: "Muzammil",
  email: "youremail@gmail.com",

  // Put your SHOWREEL YouTube link here (watch link is fine)
  showreelUrl: "https://www.youtube.com/watch?v=4dv3vK7LwJs",
};

const WORK = [
  { title: "Talking Head — Retention Cut", url: "https://www.youtube.com/watch?v=tsWpeyOHC7A", tags: [], thumb: "" },
  { title: "Short-form — Reels Edit", url: "https://www.youtube.com/watch?v=gWS2jhnGmhM", tags: ["short"], thumb: "" },
  { title: "Short-form — Fast Cuts", url: "https://www.youtube.com/watch?v=FWK6oN6OnTw", tags: ["short"], thumb: "" },
];

/* =========================
   HELPERS
   ========================= */
const $ = (q, root = document) => root.querySelector(q);
const $$ = (q, root = document) => [...root.querySelectorAll(q)];

function esc(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
  }[c]));
}

function normalizeUrl(raw) {
  const s = String(raw || "").trim();
  if (!s) return "";
  if (s.startsWith("http://") || s.startsWith("https://")) return s;
  return "https://" + s;
}

function isYouTube(url) {
  const u = normalizeUrl(url);
  return /youtube\.com|youtu\.be/.test(u);
}

function getYouTubeId(raw) {
  try {
    const url = normalizeUrl(raw);
    const u = new URL(url);

    const v = u.searchParams.get("v");
    if (v) return v;

    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id || null;
    }

    const parts = u.pathname.split("/").filter(Boolean);
    const s = parts.indexOf("shorts");
    if (s !== -1 && parts[s + 1]) return parts[s + 1];

    const e = parts.indexOf("embed");
    if (e !== -1 && parts[e + 1]) return parts[e + 1];

    return null;
  } catch {
    return null;
  }
}

function ytThumb(id) {
  return `https://img.youtube.com/vi/${id}/hqdefault.jpg`;
}

function ytEmbedUrl(id) {
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

/* =========================
   YEAR
   ========================= */
function setYear() {
  const y = $("#year");
  if (y) y.textContent = new Date().getFullYear();
}

/* =========================
   SHOWREEL THUMB + PLAY
   ========================= */
function initShowreel() {
  const img = $("#showreelThumb");
  const btn = $("#playShowreel");
  if (!img || !btn) return;

  const id = getYouTubeId(PROFILE.showreelUrl);
  if (!id) {
    // If link is not valid, remove thumb and do nothing
    img.remove();
    btn.disabled = true;
    return;
  }

  img.src = ytThumb(id);

  btn.addEventListener("click", () => {
    openModalWithYouTube(PROFILE.showreelUrl, { autoplay: true });
  });
}

/* =========================
   MOBILE-ONLY: MOVE STATS INTO ABOUT
   ========================= */
function initResponsiveStats() {
  const heroMount = $("#heroStatsMount");
  const aboutMount = $("#aboutStatsMount");
  const stats = $("#statsBlock");
  if (!heroMount || !aboutMount || !stats) return;

  function place() {
    const isMobile = window.matchMedia("(max-width: 768px)").matches;
    if (isMobile) {
      if (!aboutMount.contains(stats)) aboutMount.appendChild(stats);
    } else {
      if (!heroMount.contains(stats)) heroMount.appendChild(stats);
    }
  }

  place();
  window.addEventListener("resize", place, { passive: true });
}

/* =========================
   MOBILE MENU
   ========================= */
function initMobileMenu() {
  const toggle = $("#hamburger");
  const mobile = $("#mobile");
  if (!toggle || !mobile) return;

  $$(".mobile__link", mobile).forEach(a => {
    a.addEventListener("click", () => {
      toggle.checked = false;
    });
  });
}

/* =========================
   MODAL (VIDEO PLAYER)
   ========================= */
const modal = $("#modal");
const modalBg = $("#modalBg");
const modalClose = $("#modalClose");
const modalFrame = $("#modalFrame");

function closeModal() {
  if (!modal) return;
  modal.classList.remove("is-open");
  modal.setAttribute("aria-hidden", "true");
  if (modalFrame) modalFrame.innerHTML = "";
  document.body.style.overflow = "";
}

function initModal() {
  if (!modal) return;
  modalBg?.addEventListener("click", closeModal);
  modalClose?.addEventListener("click", closeModal);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && modal.classList.contains("is-open")) closeModal();
  });
}

function openModalWithYouTube(rawUrl, opts = { autoplay: true }) {
  const url = normalizeUrl(rawUrl);
  const id = getYouTubeId(url);

  if (!id) {
    window.open(url, "_blank", "noreferrer");
    return;
  }

  const watchUrl = `https://www.youtube.com/watch?v=${id}`;
  const embedSrc = `${ytEmbedUrl(id)}?autoplay=${opts.autoplay ? 1 : 0}&rel=0&modestbranding=1&playsinline=1`;

  // Embed + always-visible fallback button (covers “embed blocked” cases)
  modalFrame.innerHTML = `
    <div style="width:100%;height:100%;position:relative;">
      <iframe
        src="${embedSrc}"
        title="Video player"
        allow="autoplay; encrypted-media; picture-in-picture"
        allowfullscreen
        referrerpolicy="strict-origin-when-cross-origin"
        style="position:absolute;inset:0;width:100%;height:100%;border:0;"
      ></iframe>

      <a href="${watchUrl}" target="_blank" rel="noreferrer"
         style="
           position:absolute;
           left:12px;
           bottom:12px;
           padding:10px 12px;
           border-radius:12px;
           border:1px solid rgba(255,255,255,.18);
           background: rgba(0,0,0,.38);
           color: rgba(255,255,255,.92);
           font: 700 12px/1.2 'Fira Code', monospace;
           text-decoration:none;
           backdrop-filter: blur(10px);
         ">
         Open on YouTube ↗
      </a>
    </div>
  `;

  modal.classList.add("is-open");
  modal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";
}

/* =========================
   WORK GRID
   ========================= */
const grid = $("#workGrid");
let currentFilter = "all";

function getThumb(item) {
  const custom = (item.thumb || "").trim();
  if (custom) return custom;

  const url = normalizeUrl(item.url);
  if (isYouTube(url)) {
    const id = getYouTubeId(url);
    if (id) return ytThumb(id);
  }

  return "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=60";
}

function matchesFilter(item, filter) {
  if (filter === "all") return true;
  return (item.tags || []).includes(filter);
}

function matchesSearch(item, term) {
  if (!term) return true;
  return item.title.toLowerCase().includes(term);
}

function renderWork() {
  if (!grid) return;
  grid.innerHTML = "";

  const term = ($("#search")?.value || "").trim().toLowerCase();

  const list = WORK
    .filter(it => matchesFilter(it, currentFilter))
    .filter(it => matchesSearch(it, term));

  list.forEach(item => {
    const card = document.createElement("article");
    card.className = "workCard";

    card.innerHTML = `
      <div class="thumb">
        <img src="${esc(getThumb(item))}" alt="${esc(item.title)}" loading="lazy" />
      </div>
      <div class="workMeta">
        <p class="workTitle">${esc(item.title)}</p>
        <div class="workHint">click to watch</div>
      </div>
    `;

    card.addEventListener("click", () => {
      const url = normalizeUrl(item.url);
      if (isYouTube(url)) openModalWithYouTube(url, { autoplay: true });
      else window.open(url, "_blank", "noreferrer");
    });

    grid.appendChild(card);
  });
}

/* =========================
   FILTERS + SEARCH
   ========================= */
function initWorkControls() {
  const buttons = $$(".seg__btn");
  buttons.forEach(btn => {
    btn.addEventListener("click", () => {
      buttons.forEach(b => {
        b.classList.remove("is-active");
        b.setAttribute("aria-selected", "false");
      });
      btn.classList.add("is-active");
      btn.setAttribute("aria-selected", "true");
      currentFilter = btn.dataset.filter || "all";
      renderWork();
    });
  });

  $("#search")?.addEventListener("input", renderWork);
}

/* =========================
   CONTACT FORM (mailto)
   ========================= */
function initContactForm() {
  const form = $("#contactForm");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const data = new FormData(form);
    const name = data.get("name") || "";
    const brand = data.get("brand") || "";
    const email = data.get("email") || "";
    const phone = data.get("phone") || "";
    const type = data.get("type") || "";
    const deadline = data.get("deadline") || "";
    const details = data.get("details") || "";

    const subject = encodeURIComponent(`Editing Inquiry — ${name}`);
    const body = encodeURIComponent(
`Name: ${name}
Brand/Channel: ${brand}
Client Email: ${email}
Phone/WhatsApp: ${phone}
Video Type: ${type}
Deadline: ${deadline}

Details:
${details}
`
    );

    window.location.href = `mailto:${PROFILE.email}?subject=${subject}&body=${body}`;
  });
}

/* =========================
   LIVE BACKGROUND
   ========================= */
(function liveBg() {
  const bg = $("#bg");
  if (!bg) return;

  const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reduce) return;

  let tx = 0, ty = 0;
  let cx = 0, cy = 0;
  const RANGE = 16;

  let last = 0;
  function onMove(e) {
    const now = performance.now();
    if (now - last < 28) return;
    last = now;

    const x = (e.clientX / window.innerWidth) - 0.5;
    const y = (e.clientY / window.innerHeight) - 0.5;
    tx = x * RANGE;
    ty = y * RANGE;
  }

  function tick() {
    cx += (tx - cx) * 0.08;
    cy += (ty - cy) * 0.08;
    bg.style.transform = `translate3d(${cx.toFixed(2)}px, ${cy.toFixed(2)}px, 0)`;
    requestAnimationFrame(tick);
  }

  window.addEventListener("mousemove", onMove, { passive: true });
  window.addEventListener("touchmove", (e) => {
    if (!e.touches?.length) return;
    onMove(e.touches[0]);
  }, { passive: true });

  tick();
})();

/* =========================
   INIT
   ========================= */
setYear();
initMobileMenu();
initModal();
initShowreel();
initResponsiveStats();
initWorkControls();
initContactForm();
renderWork();
