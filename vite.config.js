import { defineConfig } from "vite";
import { resolve } from "node:path";
import { readFileSync } from "node:fs";
const root = import.meta.dirname;
const serviceSlugs = [
  "consultations",
  "injectables",
  "medical-aesthetics",
  "laser-hair-removal",
  "iv-hydration",
  "medical-weight-loss",
  "peptide-therapy",
  "concierge-wellness",
];
const serviceInputs = Object.fromEntries(
  serviceSlugs.map((slug) => [
    `service-${slug}`,
    resolve(root, `pages/services/${slug}.html`),
  ]),
);
const legalSlugs = [
  "privacy-policy",
  "terms-and-conditions",
  "cancellation-no-show-policy",
  "refund-policy",
  "hipaa-privacy-notice",
  "medical-disclaimer",
];
const legalInputs = Object.fromEntries(
  legalSlugs.map((slug) => [
    `legal-${slug}`,
    resolve(root, `pages/legal/${slug}.html`),
  ]),
);

// Blog articles use clean URLs (/blog/:slug) that are rewritten to pages/blog-post.html
// by the hosting provider in production (see _redirects / vercel.json). This plugin
// reproduces that rewrite for `vite dev` and `vite preview` so the same URLs work locally.
function blogCleanUrls() {
  const rewrite = (req) => {
    const path = (req.url || "").split("?")[0];
    if (/^\/blog\/[^/]+\/?$/.test(path)) req.url = "/pages/blog-post.html";
  };
  return {
    name: "blog-clean-urls",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        rewrite(req);
        next();
      });
    },
    configurePreviewServer(server) {
      server.middlewares.use((req, res, next) => {
        rewrite(req);
        next();
      });
    },
  };
}

// JavaScript-rendered sections and social crawlers need stable, unhashed image
// URLs. Vite cannot discover asset paths that only appear inside template strings.
function runtimeAssets() {
  const stableAssets = [
    "assets/images/enive-hero.jpg",
    "assets/images/enive-hero.webp",
    "assets/images/concierge-editorial.webp",
    "assets/images/ritual-editorial.webp",
    "assets/images/gallery-ritual-still-life.webp",
    "assets/images/gallery-studio-architecture.webp",
    "assets/images/gallery-water-glass.webp",
    "assets/images/brand/enive-logo.jpeg",
    "assets/images/services/consultations-hero.webp",
    "assets/images/services/injectables-hero.webp",
    "assets/images/services/iv-hydration-hero.webp",
    "assets/images/services/laser-hair-removal-hero.webp",
    "assets/images/services/medical-weight-loss-hero.webp",
    "assets/images/services/peptide-therapy-hero.webp",
    "assets/images/services/wellness-hero.webp",
  ];

  return {
    name: "runtime-assets",
    generateBundle() {
      stableAssets.forEach((fileName) => {
        this.emitFile({
          type: "asset",
          fileName,
          source: readFileSync(resolve(root, fileName)),
        });
      });
    },
  };
}

export default defineConfig({
  plugins: [blogCleanUrls(), runtimeAssets()],
  build: {
    rollupOptions: {
      input: {
        main: resolve(root, "index.html"),
        services: resolve(root, "services.html"),
        about: resolve(root, "pages/about.html"),
        provider: resolve(root, "pages/provider.html"),
        gallery: resolve(root, "pages/gallery.html"),
        testimonials: resolve(root, "pages/testimonials.html"),
        blog: resolve(root, "pages/blog.html"),
        blogPost: resolve(root, "pages/blog-post.html"),
        contact: resolve(root, "pages/contact.html"),
        notFound: resolve(root, "404.html"),
        admin: resolve(root, "admin/index.html"),
        adminLogin: resolve(root, "admin/login.html"),
        adminReset: resolve(root, "admin/reset-password.html"),
        ...serviceInputs,
        ...legalInputs,
      },
    },
  },
});
