import { BOOKING_URL, services, nav } from "./content.js";
import { getClient } from "./supabase.js";
import {
  fetchServiceCatalog,
  fetchFeaturedTestimonials,
  fetchPublishedTestimonials,
  fetchFeaturedProvider,
  fetchActiveAnnouncement,
  fetchFeaturedPromotion,
  fetchGalleryItems,
  storageUrl,
  fetchBlogPosts,
  fetchBlogPostBySlug,
  fetchRelatedPosts,
  fetchPublicSettings,
  fetchPageContent,
} from "./content-api.js";
import { initAnimations } from "./animations.js";
const header = document.querySelector("#site-header"),
  footer = document.querySelector("#site-footer");
if (document.querySelector(".service-detail"))
  document.body.classList.add("service-detail-page");
const footerIcon = (kind) => {
  const paths = {
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    pin: '<path d="M20 10c0 5-8 11-8 11S4 15 4 10a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="2.5"/>',
    phone:
      '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.79 19.79 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.69 2.8a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.33 1.84.56 2.8.69A2 2 0 0 1 22 16.92Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    instagram:
      '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".7" fill="currentColor" stroke="none"/>',
  };
  return `<span class="footer-link-icon footer-link-icon-${kind}" aria-hidden="true"><svg viewBox="0 0 24 24">${paths[kind] || paths.arrow}</svg></span>`;
};
let publicSettings = null;
if (header)
  header.innerHTML = `<div class="announcement" data-site-announcement>BY APPOINTMENT ONLY <span>·</span> MOBILE CONCIERGE ACROSS GREATER HOUSTON</div><header class="site-header"><nav class="nav" aria-label="Main navigation"><div class="nav-links">${nav
    .slice(0, 3)
    .map(
      ([n, u]) =>
        `<a href="${n === "Services" ? "#services-menu" : u}"${n === "Services" ? ' class="services-trigger" aria-expanded="false" aria-controls="services-menu"' : ""}>${n}${n === "Services" ? ' <span aria-hidden="true">⌄</span>' : ""}</a>`,
    )
    .join(
      "",
    )}</div><a class="brand" href="/" aria-label="ENIVÈ home"><img src="/assets/images/brand/enive-logo.jpeg" alt="ENIVÈ Wellness & Aesthetics" width="64" height="64" onerror="this.hidden=true;this.nextElementSibling.hidden=false"><span class="brand-fallback" hidden>ENIVÈ<small>WELLNESS · AESTHETICS</small></span></a><div class="nav-right"><div class="nav-links">${nav
    .slice(3)
    .map(([n, u]) => `<a href="${u}">${n}</a>`)
    .join(
      "",
    )}</div><a class="book-link" data-book href="${BOOKING_URL}" target="_blank" rel="noopener">Book a consultation →</a><button class="menu-btn" aria-expanded="false" aria-controls="mobile-menu" aria-label="Open menu"><span></span><span></span><span></span></button></div></nav><div class="services-mega-menu" id="services-menu" hidden><nav aria-label="Service pages">${services.map((service) => `<a href="/pages/services/${service.slug}.html"><span>${service.name}</span><i aria-hidden="true">→</i></a>`).join("")}</nav></div></header><div class="mobile-menu" id="mobile-menu" hidden><div class="mobile-menu-top"><a class="mobile-menu-brand" href="/" aria-label="ENIVÈ home"><img src="/assets/images/brand/enive-logo.jpeg" alt="" width="44" height="44"></a><div><span>ENIVÈ</span><small>Wellness & Aesthetics</small></div><button class="mobile-menu-close" type="button" data-menu-close aria-label="Close menu"><span></span><span></span></button></div><div class="mobile-menu-intro"><p class="eyebrow">The ENIVÈ experience</p><p>Care, <em>beautifully considered.</em></p></div><nav class="mobile-menu-links" aria-label="Mobile navigation">${nav
    .filter(([n]) => n !== "Services")
    .map(
      ([n, u], i) =>
        `<a href="${u}"><small>0${i + 1}</small><strong>${n}</strong>${footerIcon("arrow")}</a>`,
    )
    .join(
      "",
    )}</nav><details class="mobile-services-group"><summary><span class="mobile-services-index">07</span><span>Explore services</span><i aria-hidden="true">+</i></summary><div>${services.map((service) => `<a href="/pages/services/${service.slug}.html">${service.name}${footerIcon("arrow")}</a>`).join("")}</div></details><a class="mobile-book" data-book href="${BOOKING_URL}" target="_blank" rel="noopener"><span>Begin your consultation<small>Personalized, provider-led guidance</small></span>${footerIcon("arrow")}</a><p class="mobile-menu-note"><span>Provider-led care</span><span>Sugar Land · Greater Houston</span></p></div><button class="mobile-menu-backdrop" type="button" aria-label="Close menu" tabindex="-1"></button><a class="mobile-quick-book" data-book href="${BOOKING_URL}" target="_blank" rel="noopener"><span>Book consultation</span><span aria-hidden="true">→</span></a>`;
if (footer)
  footer.innerHTML = `<footer class="site-footer footer-compact"><div class="footer-glow" aria-hidden="true"></div><section class="footer-compact-head" aria-labelledby="footer-heading"><div><p class="footer-kicker">Your care, beautifully considered</p><h2 id="footer-heading">Begin with confidence.<br><em>Leave feeling like you.</em></h2><p class="footer-intro">A calm, personal approach to aesthetics and wellness—guided by expertise, shaped around you.</p></div><a class="footer-book" data-book href="${BOOKING_URL}" target="_blank" rel="noopener"><span>Start your consultation</span><i aria-hidden="true">→</i></a></section><div class="footer-top"><div class="footer-about"><p class="footer-kicker">The ENIVÈ standard</p><p>Clinical expertise.<br><em>Boutique attention.</em></p><div class="footer-status"><i></i><span>Accepting appointments</span></div></div><nav class="footer-col" aria-label="Footer navigation"><h3>Explore</h3>${nav.map(([n, u], i) => `<a${i > 2 && i < 6 ? ' class="footer-secondary-link"' : ""} href="${u}">${n}${footerIcon("arrow")}</a>`).join("")}</nav><div class="footer-col"><h3>Visit</h3><p data-business-address>202 Industrial Boulevard<br>Suite 302<br>Sugar Land, TX 77478</p><a data-business-directions href="https://maps.google.com/?q=202+Industrial+Boulevard+Suite+302+Sugar+Land+TX+77478" target="_blank" rel="noopener">Get directions ${footerIcon("pin")}</a></div><div class="footer-col"><h3>Connect</h3><a data-business-phone href="tel:+18327798731">(832) 779-8731 ${footerIcon("phone")}</a><a data-business-email href="mailto:hello@enivewellness.com">Email our team ${footerIcon("mail")}</a><a href="https://instagram.com/enivewellness" target="_blank" rel="noopener">Instagram ${footerIcon("instagram")}</a></div></div><div class="footer-bottom"><span>© ${new Date().getFullYear()} ENIVÈ Wellness & Aesthetics</span><nav aria-label="Legal"><a href="/pages/legal/privacy-policy.html">Privacy</a><a href="/pages/legal/terms-and-conditions.html">Terms</a><a href="/pages/legal/cancellation-no-show-policy.html">Cancellations</a><a href="/pages/legal/refund-policy.html">Refunds</a><a href="/pages/legal/hipaa-privacy-notice.html">HIPAA</a><a href="/pages/legal/medical-disclaimer.html">Medical disclaimer</a></nav></div></footer>`;
footer
  ?.querySelector(".footer-about")
  ?.insertAdjacentHTML(
    "afterbegin",
    '<span class="brand-stamp brand-stamp-footer" aria-hidden="true"><img src="/assets/images/brand/enive-logo.jpeg" alt="" width="84" height="84" loading="lazy" onerror="this.remove();this.parentElement.classList.add(\'brand-stamp-fallback\')"></span>',
  );
document.querySelectorAll("[data-book]").forEach((a) => {
  a.href = BOOKING_URL;
  a.target = "_blank";
  a.rel = "noopener";
});
const normalizePath = (path) => (path || "/").replace(/\/$/, "") || "/";
const currentPath = normalizePath(location.pathname);
document
  .querySelectorAll(".nav-links a,.mobile-menu-links a")
  .forEach((link) => {
    if (link.getAttribute("href")?.startsWith("#")) return;
    if (
      normalizePath(new URL(link.href, location.origin).pathname) ===
      currentPath
    )
      link.setAttribute("aria-current", "page");
  });
const siteHeader = document.querySelector(".site-header");
if (siteHeader) {
  let headerTicking = false;
  let headerIsCompact = scrollY > 72;
  const updateHeader = () => {
    if (!headerIsCompact && scrollY > 72) headerIsCompact = true;
    else if (headerIsCompact && scrollY < 10) headerIsCompact = false;
    siteHeader.classList.toggle("is-scrolled", headerIsCompact);
    header?.classList.toggle("is-scrolled", headerIsCompact);
    headerTicking = false;
  };
  addEventListener(
    "scroll",
    () => {
      if (!headerTicking) {
        requestAnimationFrame(updateHeader);
        headerTicking = true;
      }
    },
    { passive: true },
  );
  updateHeader();
}
const servicesTrigger = document.querySelector(".services-trigger"),
  servicesMenu = document.querySelector("#services-menu");
function setServicesMenu(open) {
  if (!servicesMenu || !servicesTrigger) return;
  servicesMenu.hidden = !open;
  servicesMenu.classList.toggle("open", open);
  servicesTrigger.setAttribute("aria-expanded", String(open));
  siteHeader?.classList.toggle("services-menu-open", open);
}
servicesTrigger?.addEventListener("click", (event) => {
  event.preventDefault();
  setServicesMenu(servicesMenu.hidden);
});
servicesTrigger?.addEventListener("mouseenter", () => setServicesMenu(true));
servicesMenu?.addEventListener("mouseleave", () => setServicesMenu(false));
document.addEventListener("click", (event) => {
  if (
    servicesMenu &&
    !servicesMenu.hidden &&
    !event.target.closest(".services-trigger,#services-menu")
  )
    setServicesMenu(false);
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && servicesMenu && !servicesMenu.hidden) {
    setServicesMenu(false);
    servicesTrigger?.focus();
  }
});
function openServicesDirectory() {
  if (matchMedia("(max-width: 1000px)").matches) {
    setMenu(true);
    const mobileServices = document.querySelector(".mobile-services-group");
    if (mobileServices) mobileServices.open = true;
  } else {
    setServicesMenu(true);
  }
}
document.addEventListener("click", (event) => {
  const opener = event.target.closest(
    '[data-open-services],a[href="#services-menu"]',
  );
  if (!opener || opener.classList.contains("services-trigger")) return;
  event.preventDefault();
  scrollTo({ top: 0, behavior: "smooth" });
  openServicesDirectory();
});
const mb = document.querySelector(".menu-btn"),
  mobileMenu = document.querySelector("#mobile-menu"),
  mobileMenuBackdrop = document.querySelector(".mobile-menu-backdrop"),
  mobileMenuClose = document.querySelector("[data-menu-close]");
let menuHideTimer,
  menuOpenedAt = 0,
  menuOpenedScrollY = 0;
function setMenu(open) {
  if (!mobileMenu || !mb) return;
  clearTimeout(menuHideTimer);
  if (open) {
    menuOpenedAt = performance.now();
    menuOpenedScrollY = scrollY;
    mobileMenu.hidden = false;
    requestAnimationFrame(() => mobileMenu.classList.add("open"));
  } else {
    mobileMenu.classList.remove("open");
    menuHideTimer = setTimeout(() => {
      mobileMenu.hidden = true;
    }, 280);
  }
  document.body.classList.toggle("menu-open", open);
  document
    .querySelector(".mobile-quick-book")
    ?.setAttribute("aria-hidden", String(open));
  mb.setAttribute("aria-expanded", String(open));
  mb.setAttribute("aria-label", open ? "Close menu" : "Open menu");
}
mb?.addEventListener("click", () =>
  setMenu(mb.getAttribute("aria-expanded") !== "true"),
);
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && mobileMenu && !mobileMenu.hidden) {
    setMenu(false);
    mb.focus();
  }
});
mobileMenu?.addEventListener("click", (e) => {
  if (e.target.closest("a")) setMenu(false);
});
mobileMenuBackdrop?.addEventListener("click", () => setMenu(false));
mobileMenuClose?.addEventListener("click", () => {
  setMenu(false);
  mb?.focus();
});

// Keep navigation easy to reach without leaving a full-screen panel in the way.
// A deliberate scroll gesture dismisses the panel and returns to the compact header.
let menuTouchStartY = null;
mobileMenu?.addEventListener(
  "touchstart",
  (event) => {
    menuTouchStartY = event.touches[0]?.clientY ?? null;
  },
  { passive: true },
);
mobileMenu?.addEventListener(
  "touchmove",
  (event) => {
    const currentY = event.touches[0]?.clientY;
    if (menuTouchStartY === null || currentY === undefined) return;
    const movement = currentY - menuTouchStartY;
    const drawerNeedsScroll =
      mobileMenu.scrollHeight > mobileMenu.clientHeight + 4;
    const shouldDismiss = drawerNeedsScroll
      ? movement > 48 && mobileMenu.scrollTop <= 0
      : Math.abs(movement) > 24;
    if (shouldDismiss) {
      setMenu(false);
      menuTouchStartY = null;
    }
  },
  { passive: true },
);
mobileMenu?.addEventListener("touchend", () => {
  menuTouchStartY = null;
});
mobileMenu?.addEventListener("touchcancel", () => {
  menuTouchStartY = null;
});
mobileMenu?.addEventListener("wheel", () => setMenu(false), {
  passive: true,
  once: false,
});
addEventListener(
  "scroll",
  () => {
    const openLongEnough = performance.now() - menuOpenedAt > 500;
    const isNewScroll = Math.abs(scrollY - menuOpenedScrollY) > 4;
    if (
      mb?.getAttribute("aria-expanded") === "true" &&
      openLongEnough &&
      isNewScroll
    )
      setMenu(false);
  },
  { passive: true },
);
addEventListener("resize", () => {
  if (
    innerWidth > 1000 &&
    mb?.getAttribute("aria-expanded") === "true"
  )
    setMenu(false);
});
if (new URLSearchParams(location.search).get("services") === "open") {
  openServicesDirectory();
  history.replaceState({}, "", location.pathname);
}
document.addEventListener(
  "toggle",
  (e) => {
    if (
      !(e.target instanceof HTMLDetailsElement) ||
      !e.target.open ||
      !e.target.closest(".faq")
    )
      return;
    e.target.parentElement
      ?.querySelectorAll("details[open]")
      .forEach((item) => {
        if (item !== e.target) item.open = false;
      });
  },
  true,
);
const quickBook = document.querySelector(".mobile-quick-book"),
  heroBook = document.querySelector(".hero-premium [data-book]");
if (quickBook) {
  const showQuickBook = (show) =>
    document.body.classList.toggle("quick-book-visible", show);
  if (heroBook)
    new IntersectionObserver(
      ([entry]) => showQuickBook(!entry.isIntersecting),
      { threshold: 0.1 },
    ).observe(heroBook);
  else {
    const updateQuickBook = () => showQuickBook(scrollY > 320);
    addEventListener("scroll", updateQuickBook, { passive: true });
    updateQuickBook();
  }
  if (footer)
    new IntersectionObserver(
      ([entry]) =>
        document.body.classList.toggle("footer-in-view", entry.isIntersecting),
      { threshold: 0.04 },
    ).observe(footer);
}
const serviceUrl = (s) => `/pages/services/${s.slug}.html`;
const serviceLabel = (s) =>
  ({
    consultations: "Planning & guidance",
    injectables: "Aesthetic refinement",
    "medical-aesthetics": "Skin health",
    "laser-hair-removal": "Smooth skin",
    "iv-hydration": "Hydration & recovery",
    "medical-weight-loss": "Metabolic wellness",
    "peptide-therapy": "Personalized wellness",
    "concierge-wellness": "Care at your location",
  })[s.slug] || "Personalized care";
const serviceGroup = (s) =>
  ({
    consultations: "guidance",
    injectables: "aesthetics",
    "medical-aesthetics": "aesthetics",
    "laser-hair-removal": "aesthetics",
    "iv-hydration": "wellness",
    "medical-weight-loss": "wellness",
    "peptide-therapy": "wellness",
    "concierge-wellness": "concierge",
  })[s.slug] || "wellness";
function normalizeCategory(c) {
  const fallback = services.find((s) => s.slug === c.slug),
    products = c.services || [],
    benefits = [
      ...new Set(
        products.flatMap((p) => (Array.isArray(p.benefits) ? p.benefits : [])),
      ),
    ].slice(0, 4),
    faqs = products
      .flatMap((p) => (Array.isArray(p.faq) ? p.faq : []))
      .filter((x) => x?.question && x?.answer)
      .slice(0, 6);
  return {
    id: c.id,
    slug: c.slug,
    name: c.name || fallback?.name || "",
    short: c.description || fallback?.short || "",
    intro: c.description || fallback?.intro || "",
    benefits: benefits.length ? benefits : fallback?.benefits || [],
    items: products.length
      ? products.map((p) => [
          p.name,
          p.price_label || "Consultation",
          p.image_path || "",
          p.short_description || p.description || "",
        ])
      : fallback?.items || [],
    image_path:
      c.hero_image_path || products.find((p) => p.image_path)?.image_path || "",
    faqs,
    seo_title: c.seo_title,
    seo_description: c.seo_description,
  };
}
const serviceImage = (s) =>
  s.image_path ? storageUrl("service-images", s.image_path) : "";
const card = (s, i) => {
  const image = serviceImage(s);
  return `<a class="service-card${image ? " has-image" : ""}" data-number="${String(i + 1).padStart(2, "0")}" href="${serviceUrl(s)}">${image ? `<div class="service-card-image"><img src="${image}" alt="" width="480" height="320" loading="lazy"></div>` : ""}<div class="service-icon">${escapeHtml(s.name.charAt(0))}</div><h3>${escapeHtml(s.name)}</h3><p>${escapeHtml(s.short)}</p><span class="text-link">Explore treatment ↗</span></a>`;
};
const serviceRow = (s, i) => {
  const image = serviceImage(s);
  return `<a class="service-row${image ? " has-image" : ""}" data-care="${serviceGroup(s)}" href="${serviceUrl(s)}">${image ? `<div class="service-row-image"><img src="${image}" alt="" width="640" height="360" loading="lazy"></div>` : ""}<div class="service-row-top"><span class="service-number">${String(i + 1).padStart(2, "0")}</span><span class="service-category">${escapeHtml(serviceLabel(s))}</span><span class="service-row-arrow" aria-hidden="true">→</span></div><div class="service-row-copy"><h2>${escapeHtml(s.name)}</h2><p>${escapeHtml(s.short)}</p>${
    s.benefits?.length
      ? `<ul>${s.benefits
          .slice(0, 3)
          .map((b) => `<li>${escapeHtml(b)}</li>`)
          .join("")}</ul>`
      : ""
  }</div><span class="service-row-action">Discover this service <i aria-hidden="true">→</i></span></a>`;
};
const grid = document.querySelector("#service-grid");
if (grid) grid.innerHTML = services.slice(1, 5).map(card).join("");
const all = document.querySelector("#all-services");
if (all) {
  all.innerHTML = services.map(serviceRow).join("");
  initServiceFilters(all);
}
function initServiceFilters(list) {
  const directory = list.closest(".services-directory");
  if (!directory || directory.querySelector(".care-filter")) return;
  const filter = document.createElement("div");
  filter.className = "care-filter";
  filter.setAttribute("aria-label", "Filter services by care type");
  filter.innerHTML = `<p><span>Find your care</span><strong data-filter-count>${list.children.length} pathways</strong></p><div role="group" aria-label="Care type"><button type="button" data-filter="all" aria-pressed="true">All care</button><button type="button" data-filter="aesthetics" aria-pressed="false">Aesthetics</button><button type="button" data-filter="wellness" aria-pressed="false">Wellness</button><button type="button" data-filter="concierge" aria-pressed="false">Concierge</button></div>`;
  list.before(filter);
  let active = "all";
  const apply = () => {
    let visible = 0;
    list.querySelectorAll(".service-row").forEach((row) => {
      const show = active === "all" || row.dataset.care === active;
      row.hidden = !show;
      if (show) visible++;
    });
    filter.querySelector("[data-filter-count]").textContent =
      `${visible} pathway${visible === 1 ? "" : "s"}`;
  };
  filter.addEventListener("click", (e) => {
    const button = e.target.closest("[data-filter]");
    if (!button) return;
    active = button.dataset.filter;
    filter
      .querySelectorAll("button")
      .forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
    apply();
  });
  new MutationObserver(apply).observe(list, { childList: true });
  apply();
}
initAnimations();
async function renderService() {
  const root = document.querySelector(".service-detail");
  if (!root) return;
  const slug =
    root.dataset.service ||
    new URLSearchParams(location.search).get("category") ||
    services[0].slug;
  let available = services;
  const catalog = await fetchServiceCatalog();
  if (catalog?.length) available = catalog.map(normalizeCategory);
  const s =
      available.find((x) => x.slug === slug) ||
      services.find((x) => x.slug === slug) ||
      services[0],
    related = available.filter((x) => x.slug !== s.slug).slice(0, 3),
    serviceIndex = Math.max(
      available.findIndex((x) => x.slug === s.slug) + 1,
      1,
    ),
    heroImage = serviceImage(s),
    defaultFaqs = [
      {
        question: "How do I know which option is right for me?",
        answer:
          "Your provider will review your goals, relevant health information and preferences before recommending an individualized plan.",
      },
      {
        question: "What should I expect before treatment?",
        answer:
          "Preparation varies by service. You will receive service-specific instructions after booking.",
      },
      {
        question: "Is there downtime?",
        answer:
          "Downtime varies by treatment and individual response. Your provider will explain expected recovery during your consultation.",
      },
    ],
    faqs = s.faqs?.length ? s.faqs : defaultFaqs;
  document.title = s.seo_title || `${s.name} | ENIVÈ Wellness & Aesthetics`;
  if (s.seo_description) setMeta("description", s.seo_description);
  root.innerHTML = `<header class="detail-hero detail-hero-premium"><a class="detail-back" href="/services.html"><span aria-hidden="true">←</span> All services</a><div class="detail-hero-main"><div class="detail-hero-copy"><p class="eyebrow">${escapeHtml(serviceLabel(s))} · ${String(serviceIndex).padStart(2, "0")}</p><h1>${escapeHtml(s.name)}</h1><p class="lede">${escapeHtml(s.short)}</p><div class="detail-hero-actions"><a class="btn" href="${BOOKING_URL}" target="_blank" rel="noopener">Book a consultation</a><a class="text-link" href="#treatment-menu">View treatment menu <span aria-hidden="true">↓</span></a></div></div><div class="detail-hero-mark${heroImage ? " has-image" : ""}">${heroImage ? `<img src="${heroImage}" alt="${escapeHtml(s.name)}" width="640" height="800">` : `<span aria-hidden="true">${escapeHtml(s.name.charAt(0))}</span><small>ENIVÈ · PERSONALIZED CARE</small>`}</div></div><div class="detail-hero-facts"><span>Medical provider-led</span><i></i><span>Individualized planning</span><i></i><span>Sugar Land, Texas</span></div></header><section class="section detail-body detail-body-premium"><aside class="detail-aside"><p class="eyebrow">The ENIVÈ approach</p><h2>Considered care,<br><em>chosen for you.</em></h2><p>Recommendations are based on your goals, preferences, relevant health information and provider assessment.</p><a class="text-link" href="/pages/about.html">Our philosophy <span aria-hidden="true">↗</span></a></aside><div class="detail-content"><section class="detail-intro-block"><p class="detail-intro">${escapeHtml(s.intro)}</p><div class="detail-section-title"><p class="eyebrow">What this care may support</p><h2>Potential benefits</h2></div><div class="benefit-list">${s.benefits.map((b, i) => `<div class="benefit"><span class="service-number">${String(i + 1).padStart(2, "0")}</span><h3>${escapeHtml(b)}</h3></div>`).join("")}</div></section><section class="treatment-menu" id="treatment-menu"><div class="detail-section-title"><div><p class="eyebrow">Options & pricing</p><h2>Treatment menu</h2></div><p>Final recommendations and pricing are confirmed after appropriate provider assessment.</p></div><div class="price-table-wrap"><table class="price-table" aria-label="${escapeHtml(s.name)} treatment prices"><tbody>${s.items.map(([n, p, image, description], i) => `<tr><td>${image ? `<img class="treatment-thumb" src="${storageUrl("service-images", image)}" alt="" width="64" height="64" loading="lazy">` : ""}<span>${String(i + 1).padStart(2, "0")}</span><div>${escapeHtml(n)}${description ? `<small>${escapeHtml(description)}</small>` : ""}</div></td><td>${escapeHtml(p)}</td></tr>`).join("")}</tbody></table></div><p class="pricing-note"><span aria-hidden="true">◇</span> Pricing may vary by individualized treatment plan. Consultation requirements apply where noted.</p></section><section class="service-faq"><div class="detail-section-title"><p class="eyebrow">Good to know</p><h2>Frequently asked</h2></div><div class="faq">${faqs.map((item) => `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`).join("")}</div></section></div></section><section class="section sand related-services"><div class="section-head"><div><p class="eyebrow">Continue exploring</p><h2>You may also like</h2></div><a class="text-link" href="/services.html">View all services <span aria-hidden="true">↗</span></a></div><div class="service-grid related-grid">${related.map(card).join("")}</div></section><section class="cta service-detail-cta"><p class="eyebrow">Begin with a conversation</p><h2>Your plan starts<br><em>with you.</em></h2><p>Come with questions. Leave with clarity.</p><a class="btn light" href="${BOOKING_URL}" target="_blank" rel="noopener">Book a consultation</a></section>`;
}

async function renderServiceExperience() {
  const root = document.querySelector(".service-detail");
  if (!root) return;

  const slug = root.dataset.service || "consultations";
  let available = services;
  const catalog = await fetchServiceCatalog();
  if (catalog?.length) available = catalog.map(normalizeCategory);

  const service =
    available.find((item) => item.slug === slug) ||
    services.find((item) => item.slug === slug) ||
    services[0];
  const serviceIndex = Math.max(
    available.findIndex((item) => item.slug === service.slug) + 1,
    1,
  );
  const fallbackImages = {
    "laser-hair-removal":
      "/assets/images/services/laser-hair-removal-hero.webp",
    injectables: "/assets/images/services/injectables-hero.webp",
    "medical-aesthetics": "/assets/images/services/injectables-hero.webp",
    "iv-hydration": "/assets/images/services/iv-hydration-hero.webp",
    "medical-weight-loss":
      "/assets/images/services/medical-weight-loss-hero.webp",
    "peptide-therapy": "/assets/images/services/peptide-therapy-hero.webp",
    "concierge-wellness": "/assets/images/services/wellness-hero.webp",
    consultations: "/assets/images/services/consultations-hero.webp",
  };
  const heroImage =
    serviceImage(service) ||
    fallbackImages[service.slug] ||
    "/assets/images/enive-hero.webp";
  const factsByService = {
    "laser-hair-removal": [
      ["Treatment time", "15–45 minutes"],
      ["Comfort", "Cooling-supported"],
      ["Plan", "Personalized treatment series"],
      ["Results", "Progressive reduction"],
    ],
    injectables: [
      ["Treatment time", "Typically under an hour"],
      ["Comfort", "Planned around you"],
      ["Plan", "Personalized dosing"],
      ["Results", "Treatment-dependent"],
    ],
    "medical-aesthetics": [
      ["Treatment time", "Treatment-dependent"],
      ["Preparation", "Personalized for your skin"],
      ["Plan", "Skin-specific"],
      ["Results", "Goals reviewed together"],
    ],
    "iv-hydration": [
      ["Treatment time", "Varies by infusion"],
      ["Experience", "Relaxed and monitored"],
      ["Plan", "Needs-based selection"],
      ["Results", "Individual response varies"],
    ],
    "medical-weight-loss": [
      ["Visit length", "Plan-dependent"],
      ["Support", "Ongoing guidance"],
      ["Plan", "Clinically individualized"],
      ["Progress", "Reviewed over time"],
    ],
    "peptide-therapy": [
      ["Visit length", "Consultation-based"],
      ["Support", "Provider-guided"],
      ["Plan", "Clinically individualized"],
      ["Progress", "Reviewed over time"],
    ],
    "concierge-wellness": [
      ["Location", "Your space"],
      ["Availability", "By appointment"],
      ["Plan", "Customized to the occasion"],
      ["Service area", "Greater Houston"],
    ],
    consultations: [
      ["Visit type", "One-to-one"],
      ["Approach", "No-pressure guidance"],
      ["Plan", "Personalized options"],
      ["Next step", "Clear recommendations"],
    ],
  };
  const facts = factsByService[service.slug] || [
    ["Treatment time", "Varies by service"],
    ["Comfort", "Planned around you"],
    ["Plan", "Personalized"],
    ["Results", "Reviewed at consultation"],
  ];
  const defaultFaqs = [
    {
      question: "How do I know which option is right for me?",
      answer:
        "Your provider will review your goals, relevant health information and preferences before recommending an individualized plan.",
    },
    {
      question: "What should I expect before treatment?",
      answer:
        "Preparation varies by service. You will receive service-specific instructions after booking.",
    },
    {
      question: "Is there downtime?",
      answer:
        "Downtime varies by treatment and individual response. Your provider will explain the expected experience during your consultation.",
    },
  ];
  const faqs = service.faqs?.length ? service.faqs : defaultFaqs;
  const serviceReviews = (await fetchPublishedTestimonials()) || [];
  const treatments = service.items?.length
    ? service.items
    : [[service.name, "Consultation", "", service.short]];

  document.title =
    service.seo_title || `${service.name} | ENIVÈ Wellness & Aesthetics`;
  if (service.seo_description) setMeta("description", service.seo_description);

  root.innerHTML = `
    <header class="detail-hero service-experience-hero">
      <a class="service-experience-back" href="#services-menu" data-open-services><span aria-hidden="true">←</span> All services</a>
      <div class="service-experience-copy">
        <p class="eyebrow">${escapeHtml(serviceLabel(service))} · ${String(serviceIndex).padStart(2, "0")}</p>
        <h1>${escapeHtml(service.name)}</h1>
        <h2>Care shaped around <em>you.</em></h2>
        <p>${escapeHtml(service.intro || service.short)}</p>
      </div>
      <figure class="service-experience-image">
        <img src="${heroImage}" alt="${escapeHtml(service.name)} at ENIVÈ" width="900" height="1100" fetchpriority="high" decoding="async" onerror="this.onerror=null;this.src='/assets/images/enive-hero.webp'">
        <figcaption>ENIVÈ · Wellness &amp; Aesthetics</figcaption>
      </figure>
      <section class="service-summary-panel" aria-label="${escapeHtml(service.name)} summary">
        <div class="service-summary-details">
          <p class="service-panel-label">Summary</p>
          <div class="service-summary-list">
            ${facts
              .map(
                ([label, value], index) => `
                  <div><span>${String(index + 1).padStart(2, "0")}</span><p><small>${escapeHtml(label)}</small><strong>${escapeHtml(value)}</strong></p></div>
                `,
              )
              .join("")}
          </div>
        </div>
        <div class="service-summary-booking">
          <p class="service-panel-label">Booking</p>
          <span class="brand-stamp brand-stamp-service" aria-hidden="true"><img src="/assets/images/brand/enive-logo.jpeg" alt="" width="80" height="80" loading="lazy"></span>
          <a class="btn service-summary-button" href="${BOOKING_URL}" target="_blank" rel="noopener">Get started</a>
          <span>Provider-led · Personalized care</span>
        </div>
      </section>
    </header>

    <section class="service-how">
      <p class="eyebrow">The treatment</p>
      <h2>How does it work?</h2>
      <p>${escapeHtml(service.intro || service.short)}</p>
      <small>Every recommendation follows an appropriate consultation and individual provider assessment.</small>
    </section>

    <section class="service-benefits-editorial">
      <p class="eyebrow">Why clients choose this care</p>
      <h2>Benefits of ${escapeHtml(service.name)}</h2>
      <div class="service-benefit-row">
        ${service.benefits
          .slice(0, 5)
          .map(
            (benefit, index) => `
              <article><span>${String(index + 1).padStart(2, "0")}</span><h3>${escapeHtml(benefit)}</h3><p>Thoughtfully considered within your personalized treatment plan.</p></article>
            `,
          )
          .join("")}
      </div>
    </section>

    <section class="service-experiences" id="treatment-menu">
      <div class="service-experience-list">
        <p class="eyebrow">Options for you</p>
        <h2>${escapeHtml(service.name)}<br><em>experiences.</em></h2>
        <div role="list">
          ${treatments
            .map(
              ([name], index) => `
                <button type="button" data-treatment-index="${index}" aria-pressed="${index === 0}" aria-expanded="${index === 0}" aria-controls="mobile-treatment-${index}">
                  <span>${escapeHtml(name)}</span><i aria-hidden="true">→</i>
                </button>
                <div class="mobile-treatment-disclosure" id="mobile-treatment-${index}"${index === 0 ? "" : " hidden"}>
                  <span>Investment</span><strong>${escapeHtml(treatments[index][1])}</strong>
                </div>
              `,
            )
            .join("")}
        </div>
        <a class="btn mobile-treatment-book" href="${BOOKING_URL}" target="_blank" rel="noopener">Book a consultation</a>
      </div>
      <article class="service-experience-detail" aria-live="polite">
        <p class="eyebrow">Treatment 01</p>
        <h3 data-treatment-name>${escapeHtml(treatments[0][0])}</h3>
        <p data-treatment-description>${escapeHtml(treatments[0][3] || service.short)}</p>
        <div><span>Investment</span><strong data-treatment-price>${escapeHtml(treatments[0][1])}</strong></div>
        <a class="btn" href="${BOOKING_URL}" target="_blank" rel="noopener">Book a consultation</a>
      </article>
    </section>

    ${
      serviceReviews.length
        ? `<section class="service-reviews-editorial">
      <div class="service-reviews-heading">
        <p class="eyebrow">Client experiences</p>
        <h2>Real words.<br><em>Thoughtful care.</em></h2>
        <a class="text-link" href="/pages/testimonials.html">View all stories <span aria-hidden="true">↗</span></a>
      </div>
      <div class="service-review-grid">
        ${serviceReviews
          .slice(0, 3)
          .map(
            (review, index) => `<blockquote>
              <span class="service-review-number">${String(index + 1).padStart(2, "0")}</span>
              <div class="stars" aria-label="${review.rating || 5} out of 5 stars">${"★".repeat(review.rating || 5)}</div>
              <p>“${escapeHtml(review.quote)}”</p>
              <cite>— ${escapeHtml(review.client_name || "ENIVÈ Client")}</cite>
            </blockquote>`,
          )
          .join("")}
      </div>
    </section>`
        : ""
    }

    <section class="service-faq-editorial">
      <div><p class="eyebrow">Good to know</p><h2>Frequently<br><em>asked.</em></h2></div>
      <div class="faq">
        ${faqs
          .map(
            (item) =>
              `<details><summary>${escapeHtml(item.question)}</summary><p>${escapeHtml(item.answer)}</p></details>`,
          )
          .join("")}
      </div>
    </section>

    <section class="cta service-detail-cta">
      <p class="eyebrow">Begin with a conversation</p>
      <h2>Your plan starts<br><em>with you.</em></h2>
      <p>Come with questions. Leave with clarity.</p>
      <a class="btn light" href="${BOOKING_URL}" target="_blank" rel="noopener">Book a consultation</a>
    </section>
  `;

  root
    .querySelector(".service-experience-list")
    ?.addEventListener("click", (event) => {
      const button = event.target.closest("[data-treatment-index]");
      if (!button) return;
      const index = Number(button.dataset.treatmentIndex);
      const [name, price, , description] = treatments[index];
      root
        .querySelectorAll("[data-treatment-index]")
        .forEach((item) => {
          const selected = item === button;
          item.setAttribute("aria-pressed", String(selected));
          item.setAttribute("aria-expanded", String(selected));
          const disclosure = root.querySelector(
            `#${item.getAttribute("aria-controls")}`,
          );
          if (disclosure) disclosure.hidden = !selected;
        });
      root.querySelector(".service-experience-detail .eyebrow").textContent =
        `Treatment ${String(index + 1).padStart(2, "0")}`;
      root.querySelector("[data-treatment-name]").textContent = name;
      root.querySelector("[data-treatment-description]").textContent =
        description || service.short;
      root.querySelector("[data-treatment-price]").textContent = price;
    });
}
async function renderPage() {
  const root = document.querySelector(".dynamic-page");
  if (!root) return;
  const view =
      root.dataset.page ||
      new URLSearchParams(location.search).get("view") ||
      "about",
    data = pages[view] || pages.about,
    managedSlugs = {
      about: "about",
      privacy: "privacy-policy",
      terms: "terms-and-conditions",
      cancellation: "cancellation-no-show-policy",
      refund: "refund-policy",
      hipaa: "hipaa-privacy-notice",
      disclaimer: "medical-disclaimer",
    };
  document.title = `${data.title} | ENIVÈ`;
  root.innerHTML = data.html;
  if (managedSlugs[view]) {
    const managed = await fetchPageContent(managedSlugs[view]);
    if (managed) {
      document.title = managed.seo_title || `${managed.title} | ENIVÈ`;
      if (managed.seo_description)
        setMeta("description", managed.seo_description);
      root.innerHTML =
        view === "about"
          ? aboutExperience(managed)
          : `<header class="page-hero"><p class="eyebrow">${escapeHtml(managed.eyebrow || "ENIVÈ")}</p><h1>${escapeHtml(managed.title)}</h1>${managed.intro ? `<p>${escapeHtml(managed.intro)}</p>` : ""}</header><article class="section content-shell managed-page-body">${formatBody(managed.body)}</article>`;
    }
  }
  enhanceEditorialPage(root, view);
  if (publicSettings) applyPublicSettings();
  const form = root.querySelector("#contact-form");
  form?.addEventListener("submit", async (e) => {
    e.preventDefault();
    const status = form.querySelector("[role=status]");
    if (form.elements.company?.value) {
      status.textContent = "Thank you. We’ll be in touch soon.";
      form.reset();
      return;
    }
    const btn = form.querySelector("button");
    btn.disabled = true;
    const client = await getClient();
    if (!client) {
      status.textContent =
        "Thank you. The form is ready to connect once Supabase environment settings are added.";
      btn.disabled = false;
      return;
    }
    const { company, ...values } = Object.fromEntries(new FormData(form));
    const { error } = await client.from("contact_submissions").insert(values);
    status.textContent = error
      ? "We could not send your message. Please call or email us."
      : "Thank you. We’ll be in touch soon.";
    if (!error) form.reset();
    btn.disabled = false;
  });
}

function aboutExperience(content = {}) {
  const hasManagedContent = Boolean(
    content.title || content.intro || content.body,
  );
  const eyebrow = content.eyebrow ? escapeHtml(content.eyebrow) : "About ENIVÈ";
  const title = content.title
    ? escapeHtml(content.title)
    : "Modern care,<br><em>made personal.</em>";
  const intro = content.intro
    ? escapeHtml(content.intro)
    : "A provider-led practice where modern aesthetics and personalized wellness come together with clarity, intention and care.";
  const story = hasManagedContent
    ? formatBody(content.body || content.intro || "")
    : `<p class="lede">ENIVÈ Wellness &amp; Aesthetics was created for people who want thoughtful guidance—not pressure, trends or one-size-fits-all care.</p><p>We bring aesthetics, skin and laser, IV hydration, weight management and wellness together in one considered experience. Every recommendation begins with your goals and is shaped through appropriate provider assessment.</p>`;

  return `
    <header class="about-hero">
      <div class="about-hero-copy">
        <p class="eyebrow">${eyebrow}</p>
        <h1>${title}</h1>
        <p>${intro}</p>
        <a class="text-link" href="#about-story">Discover our approach <span aria-hidden="true">↓</span></a>
      </div>
      <figure class="about-hero-image">
        <img src="/assets/images/services/consultations-hero.webp" alt="A calm, welcoming wellness consultation at ENIVÈ" width="1200" height="960" fetchpriority="high" decoding="async">
        <figcaption><span>ENIVÈ</span><small>Wellness · Aesthetics</small></figcaption>
      </figure>
      <div class="about-hero-note" aria-label="Practice qualities">
        <span>Provider-led</span><i></i><span>Personalized</span><i></i><span>Houston-based</span>
      </div>
    </header>
    <section class="about-story-editorial" id="about-story">
      <div class="about-story-heading">
        <p class="eyebrow">The ENIVÈ point of view</p>
        <h2>Care should feel<br><em>clear and considered.</em></h2>
      </div>
      <div class="about-story-copy">${story}</div>
    </section>
    <section class="about-principles" aria-labelledby="principles-title">
      <div class="about-principles-heading">
        <p class="eyebrow">What guides us</p>
        <h2 id="principles-title">A thoughtful standard,<br><em>at every step.</em></h2>
      </div>
      <div class="about-principles-grid">
        <article><span>01</span><h3>We listen first.</h3><p>Your goals, preferences and questions shape the conversation from the beginning.</p></article>
        <article><span>02</span><h3>We make care clear.</h3><p>You receive honest guidance, understandable options and space to choose confidently.</p></article>
        <article><span>03</span><h3>We consider the whole.</h3><p>Aesthetics and wellness are approached together, with recommendations tailored to you.</p></article>
      </div>
    </section>
    <section class="about-closing">
      <span class="brand-stamp brand-stamp-closing" aria-hidden="true"><img src="/assets/images/brand/enive-logo.jpeg" alt="" width="88" height="88" loading="lazy"></span>
      <p class="eyebrow">ENIVÈ Wellness &amp; Aesthetics</p>
      <h2>Feel supported.<br><em>Feel like yourself.</em></h2>
      <a class="text-link" href="#services-menu" data-open-services>Explore services <span aria-hidden="true">↗</span></a>
    </section>`;
}

function providerExperience(profile = {}, photoPath = "") {
  const name = profile.name ? escapeHtml(profile.name) : "Aisha Tadese-Taiwo";
  const credentials = profile.credentials
    ? escapeHtml(profile.credentials)
    : "DMSc, PA-C";
  const role = profile.title
    ? escapeHtml(profile.title)
    : "Founder &amp; Medical Provider";
  const biography = profile.biography
    ? escapeHtml(profile.biography)
    : "Aisha founded ENIVÈ to bring medical expertise and a genuinely personal approach together in one considered experience. Her work is grounded in listening carefully, offering clear guidance and building individualized plans that respect each client’s goals.";
  const philosophy = profile.philosophy
    ? escapeHtml(profile.philosophy)
    : "Personalized, evidence-informed care should help you feel supported, confident and fully yourself.";
  const photo = photoPath || "/assets/images/enive-hero.webp";
  const firstName = profile.name
    ? escapeHtml(profile.name.split(/\s+/)[0])
    : "Aisha";

  return `
    <header class="provider-signature-hero">
      <figure class="provider-signature-photo">
        <img src="${photo}" alt="${name}, ${credentials}, at ENIVÈ Wellness &amp; Aesthetics" width="1536" height="1024" fetchpriority="high">
        <figcaption><span>Founder</span><i></i><span>Medical provider</span></figcaption>
      </figure>
      <div class="provider-signature-intro">
        <p class="eyebrow">Meet your provider</p>
        <p class="provider-role">${role}</p>
        <h1>${name}</h1>
        <p class="provider-credentials">${credentials}</p>
        <p class="provider-intro-line">Medical expertise with a personal point of view.</p>
        <a class="text-link" href="#provider-biography">Explore her approach <span aria-hidden="true">↓</span></a>
      </div>
      <div class="provider-signature-mark" aria-hidden="true"><span>É</span><small>Care, considered</small></div>
    </header>
    <section class="provider-biography" id="provider-biography">
      <div class="provider-biography-heading">
        <p class="eyebrow">The person behind the practice</p>
        <h2>Expert care.<br><em>Human connection.</em></h2>
      </div>
      <div class="provider-biography-copy">
        <blockquote>${philosophy}</blockquote>
        <p class="lede">${biography}</p>
        <p>At ENIVÈ, the relationship comes before the recommendation. Every visit is designed to give you room to ask questions, understand your options and make decisions without pressure.</p>
        <a class="btn" href="${BOOKING_URL}" target="_blank" rel="noopener">Begin your consultation</a>
      </div>
    </section>
    <section class="provider-closing">
      <div><span class="brand-stamp brand-stamp-closing" aria-hidden="true"><img src="/assets/images/brand/enive-logo.jpeg" alt="" width="88" height="88" loading="lazy"></span><p class="eyebrow">A personal place to begin</p><h2>Come with questions.<br><em>Leave with clarity.</em></h2></div>
      <div><p>Your consultation is a calm, one-to-one conversation about your goals and the options available to you.</p><a class="btn light" href="${BOOKING_URL}" target="_blank" rel="noopener">Begin your consultation</a></div>
    </section>`;
}

const galleryFallbackItems = [
  {
    title: "Confidence looks like you",
    category: "Beauty",
    image_path: "/assets/images/home-hero.webp",
    alt_text: "Three women celebrating natural beauty in neutral tones",
    is_featured: true,
    is_local: true,
  },
  {
    title: "The art of subtle refinement",
    category: "Aesthetics",
    image_path: "/assets/images/services/injectables-hero.webp",
    alt_text: "Woman with luminous skin in a refined beauty portrait",
    is_local: true,
  },
  {
    title: "Progress, personally supported",
    category: "Wellness",
    image_path: "/assets/images/services/medical-weight-loss-hero.webp",
    alt_text: "Provider-led wellness support in a refined professional setting",
    is_local: true,
  },
  {
    title: "Precision meets ease",
    category: "Skin & Laser",
    image_path: "/assets/images/services/laser-hair-removal-hero.webp",
    alt_text: "Modern skin and laser care portrait",
    is_local: true,
  },
  {
    title: "A space designed to exhale",
    category: "The Studio",
    image_path: "/assets/images/gallery-studio-architecture.webp",
    alt_text: "Serene cream consultation space with sculptural details",
    design_slot: "studio",
    is_local: true,
  },
  {
    title: "Wellness, thoughtfully restored",
    category: "Wellness",
    image_path: "/assets/images/services/iv-hydration-hero.webp",
    alt_text: "Calm wellness and hydration experience",
    is_local: true,
  },
  {
    title: "Every detail has intention",
    category: "The Ritual",
    image_path: "/assets/images/gallery-ritual-still-life.webp",
    alt_text: "Warm travertine, folded linen and a considered wellness ritual",
    design_slot: "ritual",
    is_local: true,
  },
  {
    title: "A quieter kind of luxury",
    category: "The Ritual",
    image_path: "/assets/images/gallery-water-glass.webp",
    alt_text: "Luminous water reflections across pale travertine",
    design_slot: "water",
    is_local: true,
  },
];
const galleryItemSrc = (item) =>
  item.is_local
    ? item.image_path
    : storageUrl("gallery-images", item.image_path);
const galleryFigure = (item, index) =>
  `<figure class="gallery-photo${item.is_featured || index === 0 ? " gallery-featured" : ""}${item.is_local ? " gallery-fallback" : ""}" data-gallery-category="${escapeHtml(item.category || "Gallery")}" data-gallery-index="${index}"><button type="button" class="gallery-open" aria-label="Open ${escapeHtml(item.title || item.category || "gallery image")}"><img${item.design_slot ? ` data-gallery-design="${item.design_slot}"` : ""} src="${galleryItemSrc(item)}" alt="${escapeHtml(item.alt_text)}" width="900" height="1100"${index ? ' loading="lazy"' : ' fetchpriority="high"'}><span class="gallery-overlay"><small>${escapeHtml(item.category || "The ENIVÈ experience")}</small><strong>${escapeHtml(item.title || "A considered detail")}</strong><i aria-hidden="true">${String(index + 1).padStart(2, "0")}</i></span></button></figure>`;

const fallbackTestimonials = [
  {
    client_name: "ENIVÈ Client",
    quote: "The care felt unrushed, warm and completely tailored to me.",
    rating: 5,
    is_featured: true,
  },
  {
    client_name: "ENIVÈ Client",
    quote:
      "The provider’s expertise and honesty truly set the experience apart.",
    rating: 5,
  },
];
const testimonialStory = (testimonial, index) => {
  const quote = testimonial.quote || "A thoughtful, personal experience.";
  const rating = Math.max(1, Math.min(5, Number(testimonial.rating) || 5));
  const length = quote.length > 180 ? "long" : quote.length > 100 ? "medium" : "short";
  return `<blockquote class="story-card story-${length}${testimonial.is_featured ? " featured-story" : ""}"><div class="story-card-top"><span class="story-number">${String(index + 1).padStart(2, "0")}</span><div class="stars" aria-label="${rating} out of 5 stars">${"★".repeat(rating)}</div></div><span class="story-quote-mark" aria-hidden="true">“</span><p>“${escapeHtml(quote)}”</p><footer><cite>— ${escapeHtml(testimonial.client_name || "ENIVÈ Client")}</cite><span>Published with approval</span></footer></blockquote>`;
};

function enhanceEditorialPage(root, view) {
  if (view === "gallery") {
    root.innerHTML = `<header class="gallery-hero gallery-hero-luxe"><div class="gallery-hero-copy"><p class="eyebrow">The ENIVÈ visual journal · 01</p><h1>A visual language<br><em>of considered care.</em></h1><p>Beauty, wellness and the quiet details between them—seen through the warm, refined point of view that shapes every ENIVÈ experience.</p><div class="gallery-hero-meta"><span>Modern aesthetics</span><span>Personal wellness</span><span>Sugar Land, Texas</span></div></div><div class="gallery-hero-collage"><figure class="gallery-hero-primary"><img src="/assets/images/home-concierge.webp" alt="Four women representing inclusive beauty" width="1299" height="1211"><figcaption>Beauty belongs to everyone.</figcaption></figure><figure class="gallery-hero-secondary"><img src="/assets/images/gallery-ritual-still-life.webp" alt="Considered wellness ritual in warm neutral tones" width="1024" height="1280"></figure><span class="gallery-hero-monogram" aria-hidden="true">É<small>Visual<br>journal</small></span></div></header><div class="gallery-signature-strip" aria-label="Gallery themes"><span>Beauty without a blueprint</span><i></i><span>Care with intention</span><i></i><span>Wellness, personally considered</span></div><section class="section gallery-journal gallery-journal-luxe"><div class="gallery-intro"><div><p class="eyebrow">Inside ENIVÈ · 02</p><h2>Moments that define<br><em>the experience.</em></h2></div><p>A living collection of natural beauty, clinical artistry, thoughtful environments and the rituals that make care feel personal.</p></div><div class="gallery-filter" id="gallery-filter" aria-label="Filter gallery"></div><div class="gallery-grid gallery-bento gallery-bento-luxe" id="gallery-grid">${galleryFallbackItems.map(galleryFigure).join("")}</div></section><section class="section gallery-results gallery-results-luxe"><div class="gallery-results-head"><div><p class="eyebrow">Client-approved outcomes · 03</p><h2>Real care.<br><em>Real results.</em></h2></div><p>Every result is personal. Images are shared for education and inspiration only when written client consent has been provided.</p></div><div class="before-after-grid" id="before-after-grid"><div class="gallery-empty gallery-empty-light"><span>THE RESULTS ARCHIVE</span><h3>Shown responsibly.<br>Shared intentionally.</h3><p>Approved before-and-after imagery will appear here as the collection grows.</p></div></div></section><section class="gallery-closing"><span class="brand-stamp" aria-hidden="true"><img src="/assets/images/brand/enive-logo.jpeg" alt="" width="90" height="90" loading="lazy"></span><p class="eyebrow">Begin your own experience</p><h2>See what thoughtful care<br><em>can feel like.</em></h2><a class="btn" href="${BOOKING_URL}" target="_blank" rel="noopener">Begin your consultation</a></section><dialog class="gallery-lightbox" id="gallery-lightbox" aria-label="Gallery image preview"><button type="button" data-lightbox-close aria-label="Close image preview">×</button><div data-lightbox-content></div></dialog>`;
    const fallbackGrid = root.querySelector("#gallery-grid");
    if (fallbackGrid)
      initGalleryExperience(fallbackGrid, galleryFallbackItems);
  }
  if (view === "testimonials") {
    const featured = fallbackTestimonials[0];
    root.innerHTML = `<header class="stories-hero stories-hero-luxe"><div class="stories-hero-copy"><p class="eyebrow">The ENIVÈ client journal · 01</p><h1>Care remembered.<br><em>Confidence shared.</em></h1><p>Honest reflections from people who experienced thoughtful guidance, personalized attention and a calmer standard of care.</p><a class="text-link" href="#client-stories">Read their stories <span aria-hidden="true">↓</span></a><div class="stories-hero-values" aria-label="Our testimonial standards"><span>Client-approved</span><i></i><span>Shared respectfully</span><i></i><span>Individual experiences</span></div></div><aside class="stories-spotlight" aria-label="Featured client story"><div class="stories-spotlight-top"><span>Featured reflection</span><div class="stars" data-featured-rating aria-label="5 out of 5 stars">★★★★★</div></div><span class="stories-spotlight-mark" aria-hidden="true">“</span><blockquote><p data-featured-quote>“${escapeHtml(featured.quote)}”</p><footer><cite data-featured-client>— ${escapeHtml(featured.client_name)}</cite><span>Published with approval</span></footer></blockquote></aside><div class="stories-seal" aria-label="Published client stories"><strong data-testimonial-count>02</strong><span>Published<br>stories</span></div></header><div class="stories-signature-strip" aria-label="ENIVÈ care values"><span>Listen first</span><i></i><span>Guide with clarity</span><i></i><span>Care without pressure</span></div><section class="section stories-section stories-section-luxe" id="client-stories"><div class="stories-intro"><div><p class="eyebrow">In their words · 02</p><h2>Every experience<br><em>is personal.</em></h2></div><p>These reflections are published with client approval. Results and experiences vary, and every recommendation begins with an appropriate provider consultation.</p></div><div class="quotes stories-grid stories-grid-luxe" id="testimonial-grid" aria-live="polite">${fallbackTestimonials.map(testimonialStory).join("")}</div></section><section class="stories-close stories-close-luxe"><span class="brand-stamp" aria-hidden="true"><img src="/assets/images/brand/enive-logo.jpeg" alt="" width="88" height="88" loading="lazy"></span><p class="eyebrow">Your experience begins with a conversation</p><h2>Feel heard.<br><em>Move with clarity.</em></h2><p>Bring your goals and questions. We’ll help you understand what feels right for you.</p><a class="btn light" href="${BOOKING_URL}" target="_blank" rel="noopener">Begin your consultation</a></section>`;
  }
  if (view === "blog")
    root.innerHTML = `<header class="page-hero journal-hero"><p class="eyebrow">The ENIVÈ journal</p><h1>Read with<br><em>intention.</em></h1><p>Provider-led perspective on aesthetics, skin health and whole-person wellness—written to help you make informed choices.</p></header><section class="section journal-section"><div class="journal-intro"><div><p class="eyebrow">Ideas & guidance</p><h2>A thoughtful place<br><em>to learn.</em></h2></div><p>Explore clear, considered education before your consultation or return whenever a new question comes up.</p></div><nav class="journal-filter" id="blog-filter" aria-label="Filter journal articles" hidden></nav><div class="blog-grid journal-grid" id="blog-grid" aria-live="polite"><article class="journal-empty"><span aria-hidden="true">É</span><h3>The journal is being thoughtfully prepared.</h3><p>New provider-led articles will appear here as they are published.</p></article></div></section><section class="journal-close"><p class="eyebrow">Prefer a conversation?</p><h2>Bring us your<br><em>questions.</em></h2><a class="btn light" href="${BOOKING_URL}" target="_blank" rel="noopener">Book a consultation</a></section>`;
}
const pages = {
  about: {
    title: "About",
    html: aboutExperience(),
  },
  provider: {
    title: "Meet Your Provider",
    html: providerExperience(),
  },
  gallery: {
    title: "Gallery",
    html: `<header class="page-hero"><p class="eyebrow">The gallery</p><h1>Subtle changes.<br><em>Meaningful confidence.</em></h1><p>A considered look at the ENIVÈ experience, our environment and consented client results.</p></header><section class="section"><div class="section-head"><div><p class="eyebrow">Our practice</p><h2>The ENIVÈ experience</h2></div><p class="section-intro">A calm setting, thoughtful details and care designed around each visit.</p></div><div class="gallery-grid" id="gallery-grid">${["Injectables", "Skin & Aesthetics", "Wellness", "Laser", "Our Practice", "IV Hydration"].map((x) => `<div class="gallery-tile">${x}<br><small>Images coming soon</small></div>`).join("")}</div></section><section class="section sand"><div class="section-head"><div><p class="eyebrow">Real results</p><h2>Before &amp; after</h2></div></div><div class="before-after-grid" id="before-after-grid"><p class="muted-note">Consented before-and-after results will appear here once approved and published.</p></div><p><small>Before-and-after images are published only with the client’s written consent.</small></p></section>`,
  },
  testimonials: {
    title: "Testimonials",
    html: `<header class="page-hero"><p class="eyebrow">Client stories</p><h1>Care you can feel.<br><em>Trust you can share.</em></h1><p>Experiences shaped by listening, honesty and attention to the details that matter.</p></header><section class="section content-shell"><div class="section-head"><div><p class="eyebrow">In their words</p><h2>The experience,<br><em>remembered.</em></h2></div></div><div class="quotes"><blockquote><div class="stars">★★★★★</div><p>“The care felt unrushed, warm and completely tailored to me.”</p><cite>— ENIVÈ Client</cite></blockquote><blockquote><div class="stars">★★★★★</div><p>“Aisha’s expertise and honesty truly set the experience apart.”</p><cite>— ENIVÈ Client</cite></blockquote></div><p><small>Placeholder testimonials must be replaced with verified client-approved reviews before launch.</small></p></section>`,
  },
  blog: {
    title: "Journal",
    html: `<header class="page-hero"><p class="eyebrow">The ENIVÈ journal</p><h1>Education for your<br><em>wellness journey.</em></h1><p>Provider-led perspective to help you ask better questions and make informed choices.</p></header><section class="section"><div class="section-head"><div><p class="eyebrow">Ideas & guidance</p><h2>Read with<br><em>intention.</em></h2></div><p class="section-intro">Clear, thoughtful education about aesthetics, skin health and whole-person wellness.</p></div><div class="blog-grid" id="blog-grid">${["Your guide to a thoughtful consultation", "Hydration, energy and the role of IV therapy", "What natural-looking aesthetics really means"].map((x, i) => `<article class="blog-card"><p class="eyebrow">Education · 0${i + 1}</p><h2>${x}</h2><p>Editorial content coming soon.</p></article>`).join("")}</div></section>`,
  },
  contact: {
    title: "Contact",
    html: `<header class="page-hero"><p class="eyebrow">Visit & connect</p><h1>Let’s begin with<br><em>a conversation.</em></h1><p>Ask a question, plan a visit or begin with a complimentary consultation.</p></header><section class="section contact-grid"><div><p class="eyebrow">Sugar Land, Texas</p><h2>ENIVÈ Wellness & Aesthetics</h2><p>202 Industrial Boulevard, Suite 302<br>Sugar Land, TX 77478</p><p><strong>By Appointment Only</strong></p><p><a href="tel:+18327798731">(832) 779-8731</a><br><a href="mailto:hello@enivewellness.com">hello@enivewellness.com</a></p><p>Mobile concierge services are available throughout Greater Houston for select treatments.</p><a class="btn" href="${BOOKING_URL}" target="_blank" rel="noopener">Book appointment</a></div><form id="contact-form" class="contact-form"><div><p class="eyebrow">Send an inquiry</p><h2>How can we help?</h2></div><div class="field"><label for="name">Full name</label><input id="name" name="name" required autocomplete="name" maxlength="120"></div><div class="field"><label for="email">Email</label><input id="email" type="email" name="email" required autocomplete="email" maxlength="254"></div><div class="field"><label for="phone">Phone (optional)</label><input id="phone" type="tel" name="phone" autocomplete="tel" maxlength="30"></div><div class="field"><label for="message">Your message</label><textarea id="message" name="message" required maxlength="4000"></textarea></div><div class="field hp-field" aria-hidden="true"><label for="company">Leave this field blank</label><input id="company" name="company" tabindex="-1" autocomplete="off"></div><p><small>Please do not submit medical histories or sensitive clinical information through this form.</small></p><button class="btn" type="submit">Send inquiry</button><p role="status" aria-live="polite"></p></form></section>`,
  },
  privacy: { title: "Privacy Policy", html: legal("Privacy Policy") },
  terms: { title: "Terms & Conditions", html: legal("Terms & Conditions") },
  cancellation: {
    title: "Cancellation & No-Show Policy",
    html: legal("Cancellation & No-Show Policy"),
  },
  refund: { title: "Refund Policy", html: legal("Refund Policy") },
  hipaa: { title: "HIPAA Privacy Notice", html: legal("HIPAA Privacy Notice") },
  disclaimer: {
    title: "Medical Disclaimer",
    html: legal("Medical Disclaimer"),
  },
};
function legal(title) {
  return `<header class="page-hero"><p class="eyebrow">Legal</p><h1>${title}</h1></header><section class="section content-shell"><div class="legal-note"><strong>Content placeholder — awaiting client-approved language</strong><p>This page will contain ENIVÈ’s complete, attorney-reviewed ${title.toLowerCase()} before the site launches publicly. No legal or medical terms have been invented for this template.</p></div><p>Questions in the meantime? <a class="text-link" href="/pages/contact.html">Contact our team <span>↗</span></a></p></section>`;
}
function blogSlugFromUrl() {
  const m = /^\/blog\/([^/]+)\/?$/.exec(location.pathname);
  if (m) return decodeURIComponent(m[1]);
  return new URLSearchParams(location.search).get("slug");
}
function formatDate(v) {
  return v
    ? new Intl.DateTimeFormat("en-US", { dateStyle: "long" }).format(
        new Date(v),
      )
    : "";
}
function blogCard(p, i) {
  const img = p.featured_image_path
    ? storageUrl("blog-images", p.featured_image_path)
    : "";
  const category = p.blog_categories?.name || "Journal";
  return `<article class="blog-card journal-card${i === 0 ? " journal-featured" : ""} reveal" data-blog-category="${escapeHtml(category)}"><a href="/pages/blog-post.html?slug=${encodeURIComponent(p.slug)}">${img ? `<img src="${img}" alt="" width="720" height="480" loading="lazy">` : `<span class="journal-card-placeholder" aria-hidden="true">É</span>`}<div class="journal-card-copy"><p class="eyebrow">${escapeHtml(category)}${p.published_at ? ` · ${formatDate(p.published_at)}` : ""}</p><h2>${escapeHtml(p.title)}</h2><p>${escapeHtml(p.excerpt || "Read this provider-led perspective from the ENIVÈ journal.")}</p><span class="text-link">Read the article <i aria-hidden="true">↗</i></span></div></a></article>`;
}
function initBlogFilters(posts) {
  const filter = document.querySelector("#blog-filter"),
    grid = document.querySelector("#blog-grid");
  if (!filter || !grid) return;
  const categories = [
    ...new Set(
      posts.map((post) => post.blog_categories?.name || "Journal"),
    ),
  ];
  if (categories.length < 2) {
    filter.hidden = true;
    return;
  }
  filter.hidden = false;
  filter.innerHTML = `<button type="button" data-blog-filter="all" aria-pressed="true">All articles <span>${posts.length}</span></button>${categories.map((category) => `<button type="button" data-blog-filter="${escapeHtml(category)}" aria-pressed="false">${escapeHtml(category)} <span>${posts.filter((post) => (post.blog_categories?.name || "Journal") === category).length}</span></button>`).join("")}`;
  filter.addEventListener("click", (event) => {
    const button = event.target.closest("[data-blog-filter]");
    if (!button) return;
    filter
      .querySelectorAll("button")
      .forEach((item) =>
        item.setAttribute("aria-pressed", String(item === button)),
      );
    grid.querySelectorAll("[data-blog-category]").forEach((card) => {
      card.hidden =
        button.dataset.blogFilter !== "all" &&
        card.dataset.blogCategory !== button.dataset.blogFilter;
    });
  });
}
async function renderBlogPost() {
  const root = document.querySelector(".blog-post");
  if (!root) return;
  const slug = blogSlugFromUrl();
  if (!slug) {
    root.innerHTML = `<section class="section content-shell"><h1>Article not found</h1><p>This article could not be located.</p><a class="text-link" href="/pages/blog.html">Back to the journal <span>↗</span></a></section>`;
    return;
  }
  root.innerHTML =
    '<section class="section content-shell"><p>Loading article…</p></section>';
  const post = await fetchBlogPostBySlug(slug);
  if (!post) {
    root.innerHTML = `<section class="section content-shell"><h1>Article not found</h1><p>This article may have been unpublished or moved.</p><a class="text-link" href="/pages/blog.html">Back to the journal <span>↗</span></a></section>`;
    return;
  }
  const seoTitle = post.seo_title || `${post.title} | ENIVÈ Journal`;
  document.title = seoTitle;
  const desc = post.seo_description || post.excerpt || "";
  setMeta("description", desc);
  setCanonical(`https://helloenive.com/blog/${post.slug}`);
  setMeta("og:title", seoTitle, true);
  setMeta("og:description", desc, true);
  setMeta("og:type", "article", true);
  const img = post.featured_image_path
    ? storageUrl("blog-images", post.featured_image_path)
    : "";
  if (img) setMeta("og:image", img, true);
  const related = await fetchRelatedPosts(post.category_id, post.id);
  root.innerHTML = `<header class="page-hero blog-post-hero"><p class="eyebrow">${escapeHtml(post.blog_categories?.name || "Journal")}${post.published_at ? ` · ${formatDate(post.published_at)}` : ""}</p><h1>${escapeHtml(post.title)}</h1>${post.providers?.name ? `<p>By ${escapeHtml(post.providers.name)}</p>` : ""}</header>${img ? `<div class="blog-post-image"><img src="${img}" alt="" width="1200" height="640" loading="eager"></div>` : ""}<article class="section content-shell blog-post-body">${formatBody(post.body)}</article>${related?.length ? `<section class="section sand"><div class="section-head"><div><p class="eyebrow">Continue reading</p><h2>Related articles</h2></div></div><div class="blog-grid">${related.map(blogCard).join("")}</div></section>` : ""}<section class="cta"><p class="eyebrow">Have questions?</p><h2>Let’s talk about<br><em>your goals.</em></h2><a class="btn light" href="${BOOKING_URL}" target="_blank" rel="noopener">Book a consultation</a></section>`;
}
function formatBody(body) {
  if (!body) return "<p>Content coming soon.</p>";
  return body
    .split(/\n{2,}/)
    .map((p) => `<p>${escapeHtml(p.trim())}</p>`)
    .join("");
}
function setMeta(name, content, property) {
  const attr = property ? "property" : "name";
  let tag = document.querySelector(`meta[${attr}="${name}"]`);
  if (!tag) {
    tag = document.createElement("meta");
    tag.setAttribute(attr, name);
    document.head.appendChild(tag);
  }
  tag.setAttribute("content", content);
}
function setCanonical(href) {
  let link = document.querySelector('link[rel="canonical"]');
  if (!link) {
    link = document.createElement("link");
    link.setAttribute("rel", "canonical");
    document.head.appendChild(link);
  }
  link.setAttribute("href", href);
}
function setContent(selector, value) {
  if (!value) return;
  const el = document.querySelector(selector);
  if (el) el.textContent = value;
}
function setSplitHeading(selector, main, accent) {
  if (!main && !accent) return;
  const el = document.querySelector(selector);
  if (!el) return;
  const currentMain = [...el.childNodes]
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent)
      .join(" ")
      .trim(),
    currentAccent = el.querySelector("em")?.textContent || "";
  el.replaceChildren(
    document.createTextNode(main || currentMain),
    document.createElement("br"),
  );
  const em = document.createElement("em");
  em.textContent = accent || currentAccent;
  el.append(em);
}
function applyPublicSettings() {
  if (!publicSettings) return;
  const business = publicSettings.business || {},
    site = publicSettings.site || {};
  if (business.booking_url)
    document
      .querySelectorAll(`[data-book],a[href="${BOOKING_URL}"]`)
      .forEach((a) => (a.href = business.booking_url));
  setContent("[data-site-announcement]", site.announcement);
  setContent(".premium-home .hero-copy .eyebrow", site.home_eyebrow);
  setContent(".premium-home .hero-copy .lede", site.home_intro);
  setSplitHeading(
    ".premium-home .hero-copy h1",
    site.home_heading,
    site.home_heading_accent,
  );
  setContent(".services-hero-copy .eyebrow", site.services_eyebrow);
  setContent(".services-hero-copy .lede", site.services_intro);
  setSplitHeading(
    ".services-hero-copy h1",
    site.services_heading,
    site.services_heading_accent,
  );
  setContent(".footer-compact-head .footer-kicker", site.footer_kicker);
  setSplitHeading(
    ".footer-compact-head h2",
    site.footer_heading,
    site.footer_heading_accent,
  );
  if (business.phone)
    document.querySelectorAll('a[href^="tel:"]').forEach((a) => {
      a.href = `tel:${business.phone.replace(/[^+\d]/g, "")}`;
      if (a.hasAttribute("data-business-phone"))
        a.innerHTML = `${escapeHtml(business.phone)} ${footerIcon("phone")}`;
      else a.textContent = business.phone;
    });
  if (business.email)
    document.querySelectorAll('a[href^="mailto:"]').forEach((a) => {
      a.href = `mailto:${business.email}`;
      if (!a.hasAttribute("data-business-email"))
        a.textContent = business.email;
    });
  if (business.address) {
    document.querySelectorAll("[data-business-address]").forEach((el) => {
      el.textContent = business.address;
      el.style.whiteSpace = "pre-line";
    });
    const contactAddress = document.querySelector(".contact-grid>div>p");
    if (contactAddress) {
      contactAddress.textContent = business.address;
      contactAddress.style.whiteSpace = "pre-line";
    }
    document
      .querySelectorAll("[data-business-directions]")
      .forEach(
        (a) =>
          (a.href = `https://maps.google.com/?q=${encodeURIComponent(business.address)}`),
      );
  }
  if (business.name) setContent(".contact-grid>div>h2", business.name);
}
async function hydratePublicSettings() {
  const settings = await fetchPublicSettings();
  if (!settings) return;
  publicSettings = settings;
  applyPublicSettings();
  const pendingService = document.querySelector(".service-detail");
  if (pendingService && !pendingService.querySelector(".detail-hero")) {
    const observer = new MutationObserver(() => {
      if (pendingService.querySelector(".detail-hero")) {
        observer.disconnect();
        applyPublicSettings();
      }
    });
    observer.observe(pendingService, { childList: true });
  }
}
renderServiceExperience();
renderPage();
renderBlogPost();
hydratePublicSettings().then(() => hydratePublishedContent());

function enhanceServiceDetail() {
  const root = document.querySelector(".service-detail");
  if (!root || root.querySelector(".treatment-snapshot")) return;
  const fallbackImages = {
    "laser-hair-removal": "/assets/images/enive-hero.webp",
    injectables: "/assets/images/enive-hero.webp",
    "medical-aesthetics": "/assets/images/ritual-editorial.webp",
    "iv-hydration": "/assets/images/concierge-editorial.webp",
    "medical-weight-loss": "/assets/images/concierge-editorial.webp",
    "peptide-therapy": "/assets/images/ritual-editorial.webp",
    "concierge-wellness": "/assets/images/concierge-editorial.webp",
    consultations: "/assets/images/gallery-studio-architecture.webp",
  };
  const heroMark = root.querySelector(".detail-hero-mark");
  if (heroMark && !heroMark.classList.contains("has-image")) {
    heroMark.classList.add("has-image", "editorial-fallback");
    heroMark.innerHTML = `<img src="${fallbackImages[root.dataset.service] || "/assets/images/enive-hero.webp"}" alt="A calm ENIVÈ wellness and aesthetics experience" width="640" height="800"><span class="detail-image-caption">ENIVÈ · Thoughtful care</span>`;
  }
  const facts = {
    "laser-hair-removal": [
      ["Treatment time", "15–45 minutes"],
      ["Comfort", "Cooling-supported"],
      ["Plan", "A personalized series"],
      ["Results", "Progressive reduction"],
    ],
    injectables: [
      ["Treatment time", "Typically under an hour"],
      ["Comfort", "Planned around you"],
      ["Plan", "Personalized dosing"],
      ["Results", "Treatment-dependent"],
    ],
    "medical-aesthetics": [
      ["Treatment time", "Treatment-dependent"],
      ["Comfort", "Personalized preparation"],
      ["Plan", "Skin-specific"],
      ["Results", "Goals reviewed together"],
    ],
    "iv-hydration": [
      ["Treatment time", "Varies by infusion"],
      ["Comfort", "Relaxed, monitored visit"],
      ["Plan", "Needs-based selection"],
      ["Results", "Individual response varies"],
    ],
    "medical-weight-loss": [
      ["Visit length", "Plan-dependent"],
      ["Support", "Ongoing guidance"],
      ["Plan", "Clinically individualized"],
      ["Progress", "Reviewed over time"],
    ],
    "peptide-therapy": [
      ["Visit length", "Consultation-based"],
      ["Support", "Provider-guided"],
      ["Plan", "Clinically individualized"],
      ["Progress", "Reviewed over time"],
    ],
    "concierge-wellness": [
      ["Location", "Your space"],
      ["Availability", "By appointment"],
      ["Plan", "Customized to the occasion"],
      ["Service area", "Greater Houston"],
    ],
    consultations: [
      ["Visit type", "One-to-one"],
      ["Approach", "No-pressure guidance"],
      ["Plan", "Personalized options"],
      ["Next step", "Clear recommendations"],
    ],
  };
  const items = facts[root.dataset.service] || [
    ["Treatment time", "Varies by service"],
    ["Comfort", "Planned around you"],
    ["Plan", "Personalized"],
    ["Results", "Discussed at consultation"],
  ];
  const snapshot = document.createElement("section");
  snapshot.className = "treatment-snapshot";
  snapshot.setAttribute("aria-label", "Treatment summary");
  snapshot.innerHTML = `<div class="treatment-snapshot-heading"><p class="eyebrow">Treatment summary</p><span>At a glance</span></div><div class="treatment-snapshot-grid">${items.map(([label, value]) => `<div><small>${label}</small><strong>${value}</strong></div>`).join("")}</div><a class="snapshot-book" href="${BOOKING_URL}" target="_blank" rel="noopener">Plan your visit <span aria-hidden="true">→</span></a>`;
  root.querySelector(".detail-hero")?.after(snapshot);
  const related = root.querySelector(".related-services");
  if (related) {
    const prompt = document.createElement("section");
    prompt.className = "service-consultation-prompt";
    prompt.innerHTML = `<p class="eyebrow">A personal place to begin</p><div><h2>Let’s talk about<br><em>what feels right for you.</em></h2><p>Your consultation is a chance to share your goals, ask questions and understand the options available to you.</p><a class="btn light" href="${BOOKING_URL}" target="_blank" rel="noopener">Book a complimentary consultation</a></div>`;
    related.before(prompt);
  }
}
async function hydratePublishedContent() {
  const [
    catalog,
    testimonials,
    publishedTestimonials,
    provider,
    announcement,
    promotion,
    galleryItems,
    beforeAfterItems,
    blogPosts,
  ] = await Promise.all([
    fetchServiceCatalog(),
    fetchFeaturedTestimonials(),
    fetchPublishedTestimonials(),
    fetchFeaturedProvider(),
    fetchActiveAnnouncement(),
    fetchFeaturedPromotion(),
    fetchGalleryItems("gallery"),
    fetchGalleryItems("before_after"),
    fetchBlogPosts(),
  ]);
  const galleryDesign = publicSettings?.gallery_design || {};
  Object.entries(galleryDesign).forEach(([slot, path]) => {
    const image = document.querySelector(`[data-gallery-design="${slot}"]`);
    if (image && path) {
      const customImage = storageUrl("gallery-images", path);
      image.src = customImage;
      const fallbackItem = galleryFallbackItems.find(
        (item) => item.design_slot === slot,
      );
      if (fallbackItem) fallbackItem.image_path = customImage;
    }
  });
  if (catalog?.length) {
    const normalized = catalog.map(normalizeCategory);
    const home = document.querySelector("#service-grid");
    if (home)
      home.innerHTML = normalized
        .filter((x) => x.slug !== "consultations")
        .slice(0, 4)
        .map(card)
        .join("");
    const list = document.querySelector("#all-services");
    if (list) list.innerHTML = normalized.map(serviceRow).join("");
  }
  if (testimonials?.length) {
    const quotes = document.querySelector(".home-proof .quotes");
    if (quotes) {
      quotes.innerHTML = testimonials
        .slice(0, 2)
        .map(
          (t) =>
            `<blockquote><div class="stars" aria-label="${t.rating || 5} out of 5 stars">${"★".repeat(t.rating || 5)}</div><p>“${escapeHtml(t.quote)}”</p><cite>— ${escapeHtml(t.client_name || "ENIVÈ Client")}</cite></blockquote>`,
        )
        .join("");
      quotes.closest(".home-proof")?.removeAttribute("hidden");
    }
  }
  if (publishedTestimonials?.length) {
    const quotes = document.querySelector("#testimonial-grid");
    if (quotes)
      quotes.innerHTML = publishedTestimonials
        .map(testimonialStory)
        .join("");
    const featuredStory =
      publishedTestimonials.find((testimonial) => testimonial.is_featured) ||
      publishedTestimonials[0];
    const featuredQuote = document.querySelector("[data-featured-quote]");
    const featuredClient = document.querySelector("[data-featured-client]");
    const featuredRating = document.querySelector("[data-featured-rating]");
    if (featuredQuote) featuredQuote.textContent = `“${featuredStory.quote}”`;
    if (featuredClient)
      featuredClient.textContent = `— ${featuredStory.client_name || "ENIVÈ Client"}`;
    if (featuredRating) {
      const rating = Math.max(
        1,
        Math.min(5, Number(featuredStory.rating) || 5),
      );
      featuredRating.textContent = "★".repeat(rating);
      featuredRating.setAttribute("aria-label", `${rating} out of 5 stars`);
    }
    const count = document.querySelector("[data-testimonial-count]");
    if (count)
      count.textContent = String(publishedTestimonials.length).padStart(2, "0");
  }
  if (provider) {
    const photo = provider.image_path
      ? storageUrl("provider-images", provider.image_path)
      : "";
    const card = document.querySelector(".provider-premium .provider-card");
    if (card)
      card.innerHTML = photo
        ? `<img class="provider-photo" src="${photo}" alt="${escapeHtml(provider.name)}" width="640" height="800" loading="lazy"><div class="provider-photo-caption"><p class="eyebrow">${escapeHtml(provider.title || "Medical provider")}</p><strong>${escapeHtml(provider.name)}</strong><span>${escapeHtml(provider.credentials || "")}</span></div>`
        : `<p class="monogram">${escapeHtml(
            provider.name
              .split(/\s+/)
              .map((n) => n[0])
              .slice(0, 2)
              .join(""),
          )}</p><p class="eyebrow">${escapeHtml(provider.title || "Medical provider")}</p><h2>${escapeHtml(provider.name)}</h2><p class="credentials">${escapeHtml(provider.credentials || "")}</p>`;
    const homeBio = document.querySelector(
      ".provider-premium .provider-copy>p:not(.eyebrow)",
    );
    if (homeBio && provider.biography) homeBio.textContent = provider.biography;
    const providerPage = document.querySelector(
      '.dynamic-page[data-page="provider"]',
    );
    if (providerPage)
      providerPage.innerHTML = providerExperience(provider, photo);
    if (publicSettings) applyPublicSettings();
  }
  if (announcement) {
    const banner = document.querySelector("[data-site-announcement]");
    if (banner)
      banner.innerHTML = announcement.link_url
        ? `${escapeHtml(announcement.message)} <a href="${escapeHtml(announcement.link_url)}">${escapeHtml(announcement.link_label || "Learn more")} ↗</a>`
        : escapeHtml(announcement.message);
  }
  if (promotion && document.querySelector(".premium-home")) {
    const target =
        document.querySelector(".home-faq") ||
        document.querySelector(".cta-premium"),
      image = promotion.image_path
        ? storageUrl("promotion-images", promotion.image_path)
        : "";
    if (target) {
      const section = document.createElement("section");
      section.className = "promotion-feature";
      section.innerHTML = `${image ? `<img src="${image}" alt="" width="720" height="520" loading="lazy">` : ""}<div><p class="eyebrow">Featured at ENIVÈ</p><h2>${escapeHtml(promotion.title)}</h2>${promotion.description ? `<p>${escapeHtml(promotion.description)}</p>` : ""}${promotion.cta_url ? `<a class="btn" href="${escapeHtml(promotion.cta_url)}">${escapeHtml(promotion.cta_label || "Learn more")}</a>` : ""}</div>`;
      target.before(section);
    }
  }
  if (galleryItems?.length) {
    const grid = document.querySelector("#gallery-grid");
    if (grid) {
      const ordered = [...galleryItems].sort(
        (a, b) => Number(b.is_featured) - Number(a.is_featured),
      );
      grid.innerHTML = ordered.map(galleryFigure).join("");
      initGalleryExperience(grid, ordered);
    }
  }
  if (beforeAfterItems?.length) {
    const grid = document.querySelector("#before-after-grid");
    if (grid)
      grid.innerHTML = beforeAfterItems
        .map(
          (g) =>
            `<div class="before-after-pair"><div class="ba-images"><figure><img src="${storageUrl("before-after-images", g.image_path)}" alt="Before: ${escapeHtml(g.alt_text)}" width="360" height="450" loading="lazy"><figcaption>Before</figcaption></figure><figure><img src="${storageUrl("before-after-images", g.after_image_path)}" alt="After: ${escapeHtml(g.alt_text)}" width="360" height="450" loading="lazy"><figcaption>After</figcaption></figure></div>${g.title ? `<p class="ba-caption">${escapeHtml(g.title)}</p>` : ""}</div>`,
        )
        .join("");
  }
  if (blogPosts?.length) {
    const grid = document.querySelector("#blog-grid");
    const visiblePosts = blogPosts.slice(0, 12);
    if (grid) {
      grid.innerHTML = visiblePosts.map(blogCard).join("");
      initBlogFilters(visiblePosts);
    }
  }
}
function initGalleryExperience(grid, items) {
  grid._galleryController?.abort();
  const controller = new AbortController(),
    { signal } = controller;
  grid._galleryController = controller;
  const filter = document.querySelector("#gallery-filter"),
    categories = [
      ...new Set(items.map((item) => item.category).filter(Boolean)),
    ];
  if (filter) {
    filter.innerHTML = `<button type="button" data-gallery-filter="all" aria-pressed="true">All moments <span>${items.length}</span></button>${categories.map((category) => `<button type="button" data-gallery-filter="${escapeHtml(category)}" aria-pressed="false">${escapeHtml(category)} <span>${items.filter((item) => item.category === category).length}</span></button>`).join("")}`;
    filter.addEventListener(
      "click",
      (event) => {
        const button = event.target.closest("[data-gallery-filter]");
        if (!button) return;
        filter
          .querySelectorAll("button")
          .forEach((item) =>
            item.setAttribute("aria-pressed", String(item === button)),
          );
        grid
          .querySelectorAll("[data-gallery-category]")
          .forEach(
            (item) =>
              (item.hidden =
                button.dataset.galleryFilter !== "all" &&
                item.dataset.galleryCategory !==
                  button.dataset.galleryFilter),
          );
      },
      { signal },
    );
  }
  const dialog = document.querySelector("#gallery-lightbox"),
    content = dialog?.querySelector("[data-lightbox-content]");
  grid.addEventListener(
    "click",
    (event) => {
      const item = event.target.closest("[data-gallery-index]");
      if (!item || !dialog || !content) return;
      const data = items[Number(item.dataset.galleryIndex)];
      if (!data) return;
      content.innerHTML = `<img src="${galleryItemSrc(data)}" alt="${escapeHtml(data.alt_text)}"><div><p class="eyebrow">${escapeHtml(data.category || "ENIVÈ")}</p><h2>${escapeHtml(data.title || "A considered detail")}</h2><span>ENIVÈ · Visual journal</span></div>`;
      dialog.showModal();
    },
    { signal },
  );
  dialog
    ?.querySelector("[data-lightbox-close]")
    ?.addEventListener("click", () => dialog.close(), { signal });
  dialog?.addEventListener(
    "click",
    (event) => {
      if (event.target === dialog) dialog.close();
    },
    { signal },
  );
}
function escapeHtml(value) {
  const node = document.createElement("div");
  node.textContent = value ?? "";
  return node.innerHTML;
}
