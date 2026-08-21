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

// Social crawlers do not execute Vite's transformed HTML and need a stable,
// unhashed image URL. All page metadata points to this exact path.
function socialPreviewAsset() {
  return {
    name: "social-preview-asset",
    generateBundle() {
      this.emitFile({
        type: "asset",
        fileName: "assets/images/enive-hero.jpg",
        source: readFileSync(resolve(root, "assets/images/enive-hero.jpg")),
      });
    },
  };
}

export default defineConfig({
  plugins: [blogCleanUrls(), socialPreviewAsset()],
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
