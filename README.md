# ENIVÈ Wellness & Aesthetics

Custom responsive website and admin CMS built with HTML, CSS, vanilla JavaScript and Supabase.

## Preview

Run `npm install`, then `npm run dev`. The public site works without Supabase in preview mode, showing bundled launch content until a project is connected.

## Connect Supabase

1. Create a project and run `supabase/schema.sql`, `supabase/indexes.sql`, then `supabase/seed.sql` in that order in its SQL editor.
   - If you already ran an earlier version of `schema.sql`, also re-run the two `contact_submissions` `update`/`delete` policy statements near the end of the file — they were added so admins can mark messages read and remove spam from the Inbox.
   - For an existing ENIVÈ database, run `supabase/cms-expansion.sql` once to add editable About/legal pages and their access policies.
2. Invite the administrator through Supabase Auth and add that user's UUID to `public.admins` using the final commented SQL statement in `schema.sql`.
3. Add the project URL and public anon key to `config.js` (copy from `config.example.js`). Never expose a service-role key in frontend code.
4. Configure `helloenive.com` and its `/admin/` redirect in Auth settings.
5. Add `https://helloenive.com/admin/reset-password.html` to the allowed Auth redirect URLs for password recovery.
6. The public content loaders use only the anon key and published rows permitted by Row Level Security. If Supabase is unavailable, the bundled launch content remains visible automatically.

Storage buckets (`provider-images`, `service-images`, `gallery-images`, `before-after-images`, `blog-images`, `promotion-images`) are created by `schema.sql` as public, read-only buckets with admin-only write access. The admin dashboard's image fields validate type (JPEG/PNG/WebP) and size before uploading directly to the matching bucket.

## Admin CMS

Sign in at `/admin/login.html`. The dashboard covers Pages, Service Categories, individual Services and pricing, Gallery, Before & After (with a required client-consent confirmation before publishing), Testimonials, Blog (with categories and image uploads), Promotions, Announcements, Provider, a contact-submission Inbox, Business Information and Site Settings. Service category images, treatment images, prices, descriptions, benefits and FAQs all publish directly to the public service pages. Every list supports draft/published/archived status, feature/hide flags where relevant, display ordering and confirm-before-delete.

## Blog

Blog articles are served from a single template (`pages/blog-post.html`) driven by `blog_posts` rows in Supabase, so no rebuild is needed to publish a new article. Article URLs are clean (`/blog/your-slug`): `vite.config.js` rewrites that pattern to the template during `npm run dev` / `npm run preview`, and `public/_redirects` (Netlify) or `vercel.json` (Vercel) does the same rewrite in production. If you deploy to a different static host, add an equivalent rewrite rule for `/blog/*`.

## Booking

Booking defaults to AestheticsPro (`https://aespro.biz/AFRY4FP`) and can be changed under Business Information in the admin. Every "Book" link opens in a new tab with `rel="noopener"`.

## Before launch

- Add the approved provider portrait and biography through the Provider admin area — the current copy is clearly marked as placeholder.
- Upload consented before-and-after and gallery media. The admin's Before & After manager will not let you publish a record until client consent is confirmed.
- Replace placeholder testimonials with verified, client-approved reviews.
- Add attorney-approved copy in the Pages admin area and publish each legal page. Until then, the bundled pages show a clearly labeled placeholder—no legal or medical language has been invented.
- The homepage hero is editorial placeholder imagery, not a depiction of the provider or an actual patient.

## Deploy

Run `npm run build` and deploy the `dist/` folder to a static host with HTTPS and the custom domain. Files placed in `public/` (robots.txt, sitemap.xml, `_redirects`, `_headers`) are copied into `dist/` automatically by Vite. `vercel.json` stays at the repository root — Vercel reads it independently of the build output.

- `public/_headers` (Netlify) sets baseline security headers and a Content-Security-Policy. Once your Supabase project URL is final, consider tightening `connect-src`/`img-src` from the `*.supabase.co` wildcard to your exact project host.
- `public/_redirects` rewrites `/blog/*` to the article template and adds a `/404.html` fallback.
- `vercel.json` provides the same rewrite and headers for Vercel deployments.
- After publishing blog posts, consider extending `public/sitemap.xml` (or generating it at build time from published `blog_posts`) so search engines can discover individual articles — the current file lists only the static pages, since blog content lives in Supabase rather than the filesystem.
