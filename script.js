/* ─────────────────────────────────────────────────────────────
   script.js  —  Atul Kumar Portfolio
   Covers: reveal animations · sticky header · mobile nav · contact form
   ───────────────────────────────────────────────────────────── */

const prefersReducedMotion = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;

/* ── Scroll-reveal ─────────────────────────────────────────── */
function setupReveal() {
  const els = Array.from(document.querySelectorAll(".reveal"));
  if (!els.length) return;

  if (prefersReducedMotion) {
    els.forEach((el) => el.classList.add("in-view"));
    return;
  }

  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add("in-view");

        if (e.target.classList.contains("timeline")) {
          e.target.classList.add("is-animated");
        }

        io.unobserve(e.target);
      }
    },
    { threshold: 0.14 }
  );

  els.forEach((el) => io.observe(el));
}

/* ── Sticky header elevation ───────────────────────────────── */
function setupStickyElevation() {
  const header = document.querySelector("[data-elevate]");
  if (!header) return;

  const onScroll = () => {
    if (window.scrollY > 6) header.classList.add("is-elevated");
    else header.classList.remove("is-elevated");
  };
  onScroll();
  window.addEventListener("scroll", onScroll, { passive: true });
}

/* ── Mobile nav ────────────────────────────────────────────── */
function setupMobileNav() {
  const btn = document.querySelector(".nav__toggle");
  const links = document.querySelector("[data-nav-links]");
  if (!btn || !links) return;

  const close = () => {
    links.classList.remove("is-open");
    btn.setAttribute("aria-expanded", "false");
  };

  btn.addEventListener("click", () => {
    const isOpen = links.classList.toggle("is-open");
    btn.setAttribute("aria-expanded", String(isOpen));
  });

  links.addEventListener("click", (e) => {
    const a = e.target.closest("a");
    if (!a) return;
    close();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") close();
  });

  document.addEventListener("click", (e) => {
    const target = e.target;
    const isInside = btn.contains(target) || links.contains(target);
    if (!isInside) close();
  });
}

/* ── Contact form — wired to Django REST API ───────────────── */

// Change this URL after you deploy Django online
const DJANGO_API = "http://127.0.0.1:8000/api/contact/";

function clearErrors() {
  ["name", "email", "message"].forEach((f) => {
    document.getElementById("err-" + f).textContent = "";
    document.getElementById(f).style.borderColor = "";
  });
  const s = document.getElementById("form-status");
  s.style.display = "none";
}

function showStatus(msg, ok) {
  const s = document.getElementById("form-status");
  s.textContent = msg;
  s.style.display = "block";
  s.style.background = ok ? "rgba(63,185,80,0.12)"  : "rgba(248,81,73,0.12)";
  s.style.border     = ok ? "1px solid #3fb950"      : "1px solid #f85149";
  s.style.color      = ok ? "#3fb950"                : "#f85149";
}

function fieldError(field, msg) {
  document.getElementById("err-" + field).textContent = msg;
  document.getElementById(field).style.borderColor = "#f85149";
}

async function sendMessage() {
  clearErrors();

  const name    = document.getElementById("name").value.trim();
  const email   = document.getElementById("email").value.trim();
  const message = document.getElementById("message").value.trim();

  // Client-side validation
  let hasErr = false;
  if (name.length < 2) {
    fieldError("name", "Please enter your name.");
    hasErr = true;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    fieldError("email", "Please enter a valid email.");
    hasErr = true;
  }
  if (message.length < 10) {
    fieldError("message", "Message must be at least 10 characters.");
    hasErr = true;
  }
  if (hasErr) return;

  const btn = document.getElementById("send-btn");
  btn.disabled = true;
  btn.textContent = "Sending…";

  try {
    const res  = await fetch(DJANGO_API, {
      method:  "POST",
      headers: { "Content-Type": "application/json" },
      body:    JSON.stringify({ name, email, message }),
    });
    const data = await res.json();

    if (res.ok && data.success) {
      showStatus("✅ " + data.message, true);
      document.getElementById("name").value    = "";
      document.getElementById("email").value   = "";
      document.getElementById("message").value = "";
    } else if (data.errors) {
      if (data.errors.name)    fieldError("name",    data.errors.name[0]);
      if (data.errors.email)   fieldError("email",   data.errors.email[0]);
      if (data.errors.message) fieldError("message", data.errors.message[0]);
    } else {
      showStatus("❌ Something went wrong. Please try again.", false);
    }
  } catch (err) {
    showStatus("❌ Cannot reach server. Make sure Django is running on port 8000.", false);
  } finally {
    btn.disabled    = false;
    btn.textContent = "Send";
  }
}

function setupContactForm() {
  const btn = document.getElementById("send-btn");
  if (!btn) return;
  btn.addEventListener("click", sendMessage);
}

/* ── Init ──────────────────────────────────────────────────── */
setupReveal();
setupStickyElevation();
setupMobileNav();
setupContactForm();