-- Optional performance migration; run once after schema.sql.
create index if not exists services_category_status_sort_idx on public.services(category_id,status,sort_order);
create index if not exists service_categories_status_sort_idx on public.service_categories(status,sort_order);
create index if not exists testimonials_featured_status_sort_idx on public.testimonials(is_featured,status,sort_order);
create index if not exists gallery_status_kind_sort_idx on public.gallery_items(status,kind,sort_order);
create index if not exists blog_posts_status_published_idx on public.blog_posts(status,published_at desc);
create index if not exists contact_submissions_unread_idx on public.contact_submissions(is_read,created_at desc);
create index if not exists page_content_status_sort_idx on public.page_content(status,sort_order);
