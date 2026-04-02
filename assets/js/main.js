/* global AOS, bootstrap */

/**
 * Main JS
 * - Dark/Light theme toggle (persisted in localStorage)
 * - Navbar "scrolled" state
 * - Active nav link highlighting (IntersectionObserver)
 * - Collapse nav on link click (mobile)
 * - Footer year
 */

(function () {
  const html = document.documentElement;
  const themeToggle = document.getElementById("themeToggle");
  const navbar = document.querySelector(".navbar-glass");
  const yearEl = document.getElementById("year");

  // ---------- AOS ----------
  if (window.AOS) {
    AOS.init({
      duration: 700,
      easing: "ease-out-cubic",
      once: true,
      offset: 40,
    });
  }

  // ---------- Year ----------
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());

  // ---------- Theme ----------
  const THEME_KEY = "ks_theme";

  function getPreferredTheme() {
    const stored = localStorage.getItem(THEME_KEY);
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }

  function setTheme(theme) {
    html.setAttribute("data-theme", theme);
    localStorage.setItem(THEME_KEY, theme);

    // Swap icons
    const moon = themeToggle?.querySelector('[data-icon="moon"]');
    const sun = themeToggle?.querySelector('[data-icon="sun"]');
    if (moon && sun) {
      moon.classList.toggle("d-none", theme === "dark");
      sun.classList.toggle("d-none", theme !== "dark");
    }

    // Update browser UI color (mobile)
    const meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", theme === "dark" ? "#070A14" : "#0B1220");
  }

  setTheme(getPreferredTheme());

  themeToggle?.addEventListener("click", () => {
    const current = html.getAttribute("data-theme") === "dark" ? "dark" : "light";
    setTheme(current === "dark" ? "light" : "dark");
  });

  // ---------- Navbar scrolled state ----------
  function updateNavbar() {
    if (!navbar) return;
    navbar.classList.toggle("is-scrolled", window.scrollY > 8);
  }
  updateNavbar();
  window.addEventListener("scroll", updateNavbar, { passive: true });

  // ---------- Mobile: close navbar on click ----------
  const navMenu = document.getElementById("navMenu");
  const navLinks = Array.from(document.querySelectorAll('.navbar a.nav-link[href^="#"]'));
  navLinks.forEach((link) => {
    link.addEventListener("click", () => {
      if (navMenu && navMenu.classList.contains("show") && window.bootstrap?.Collapse) {
        const collapse = bootstrap.Collapse.getOrCreateInstance(navMenu);
        collapse.hide();
      }
    });
  });

  // ---------- Active link highlight ----------
  const sectionIds = navLinks.map((a) => a.getAttribute("href")).filter(Boolean);
  const sections = sectionIds
    .map((id) => document.querySelector(id))
    .filter((el) => el && el instanceof HTMLElement);

  function setActiveSection(id) {
    navLinks.forEach((a) => {
      const isActive = a.getAttribute("href") === id;
      a.classList.toggle("active", isActive);
      a.setAttribute("aria-current", isActive ? "page" : "false");
    });
  }

  if ("IntersectionObserver" in window && sections.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio || 0) - (a.intersectionRatio || 0))[0];
        if (visible?.target?.id) setActiveSection("#" + visible.target.id);
      },
      { rootMargin: "-25% 0px -65% 0px", threshold: [0, 0.1, 0.2, 0.35, 0.5, 0.65, 0.8, 1] }
    );

    sections.forEach((sec) => observer.observe(sec));
  }
})();

