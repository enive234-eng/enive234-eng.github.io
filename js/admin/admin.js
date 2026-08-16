import { getAdminContext } from './auth.js';
import { resources, statuses, referenceSources } from './resources.js';
import { validateImage, uploadImage, removeImage, publicUrl, slugify } from './uploads.js';

const sections = ['Dashboard', 'Pages', 'Service Categories', 'Services', 'Gallery', 'Before & After', 'Testimonials', 'Blog', 'Promotions', 'Announcements', 'Provider', 'Inbox', 'Business Information', 'Site Settings'];
const sectionMeta={Dashboard:['Overview','◌'],Pages:['Website copy','Aa'],'Service Categories':['Service organization','◇'],Services:['Treatments & pricing','＋'],Gallery:['Visual journal','▧'],'Before & After':['Consented results','◫'],Testimonials:['Client reviews','“'],Blog:['Education & articles','¶'],Promotions:['Featured offers','％'],Announcements:['Site-wide messages','!'],Provider:['Profile & biography','◎'],Inbox:['Client inquiries','@'],'Business Information':['Contact & booking','⌂'],'Site Settings':['Headings & SEO','⚙']};
const app = document.querySelector('#admin-app');
let client, admin, active = 'Dashboard', records = [], references = {}, pendingImages = {}, galleryDesign = {};

async function init() {
  app.innerHTML = '<main class="login-card"><p>Verifying secure access…</p></main>';
  const context = await getAdminContext();
  if (!context) return;
  ({ client, admin } = context);
  await show('Dashboard');
}

function shell(content) {
  const meta=sectionMeta[active]||['Website content','·'];
  app.innerHTML = `<div class="admin-layout"><aside class="sidebar"><div class="sidebar-brand"><a class="admin-brand" href="/">ENIVÈ</a><span>Content studio</span></div><nav aria-label="Admin sections">${sections.map(s => `<button data-section="${s}" class="${s === active ? 'active' : ''}"><i aria-hidden="true">${sectionMeta[s]?.[1]||'·'}</i><span>${s}<small>${sectionMeta[s]?.[0]||''}</small></span></button>`).join('')}</nav><p class="sidebar-help">Changes are saved to your secure content library. Only published items appear publicly.</p></aside><main class="admin-main"><div class="admin-top"><div><p class="kicker">${meta[0]} · ${esc(admin.display_name)}</p><h1>${active}</h1></div><div class="admin-actions"><a href="/" target="_blank" rel="noopener">Preview website <span>↗</span></a><button id="logout">Sign out</button></div></div><div id="notice" role="status" aria-live="polite"></div>${content}</main></div>`;
  app.querySelectorAll('[data-section]').forEach(b => b.onclick = () => show(b.dataset.section));
  app.querySelector('#logout').onclick = async () => { await client.auth.signOut(); location.replace('/admin/login.html'); };
}

async function show(section) {
  active = section;
  shell('<section class="panel loading">Loading content…</section>');
  if (section === 'Dashboard') return dashboard();
  if (section === 'Business Information' || section === 'Site Settings') return settings(section);
  if (section === 'Gallery') return galleryManager('gallery');
  if (section === 'Before & After') return galleryManager('before_after');
  if (section === 'Inbox') return inbox();
  return manager(section);
}

async function dashboard() {
  const tables = ['services', 'testimonials', 'gallery_items', 'blog_posts'];
  const counts = await Promise.all(tables.map(t => client.from(t).select('*', { count: 'exact', head: true })));
  const unread = await client.from('contact_submissions').select('*', { count: 'exact', head: true }).eq('is_read', false);
  const values = counts.map(x => x.count ?? 0);
  shell(`<section class="dashboard-welcome"><div><p class="kicker">Your website, in your hands</p><h2>Welcome back, ${esc(admin.display_name)}.</h2><p>Add, edit and publish content here—no code required. Drafts stay private until you are ready.</p></div><button class="primary" data-jump="Gallery">Add gallery image</button></section><div class="stats">${[['Services', values[0], 'Services'], ['Testimonials', values[1], 'Testimonials'], ['Gallery items', values[2], 'Gallery'], ['Blog posts', values[3], 'Blog'], ['New messages', unread.count ?? 0, 'Inbox']].map(([n, v, jump],i) => `<button class="stat" data-jump="${jump}"><span>${n}</span><strong>${v}</strong><i>${String(i+1).padStart(2,'0')} · Manage →</i></button>`).join('')}</div><div class="dashboard-grid"><section class="panel quick-panel"><div class="panel-head"><div><p class="kicker">Quick actions</p><h2>What would you like to update?</h2></div></div><div class="quick-actions"><button data-jump="Testimonials"><i>“</i><span><strong>Add a client story</strong><small>Publish a review or feature it on the homepage</small></span><b>→</b></button><button data-jump="Gallery"><i>▧</i><span><strong>Curate the gallery</strong><small>Upload, reorder and feature imagery</small></span><b>→</b></button><button data-jump="Business Information"><i>⌂</i><span><strong>Update business details</strong><small>Phone, address, email and booking link</small></span><b>→</b></button></div></section><aside class="panel publishing-guide"><p class="kicker">Publishing guide</p><h2>You always control what goes live.</h2><ol><li><span>01</span><div><strong>Save as draft</strong><small>Work privately and return anytime.</small></div></li><li><span>02</span><div><strong>Review your content</strong><small>Check wording, images and permissions.</small></div></li><li><span>03</span><div><strong>Choose Published</strong><small>Your update becomes visible on the website.</small></div></li></ol></aside></div>`);
  app.querySelectorAll('[data-jump]').forEach(b => b.onclick = () => show(b.dataset.jump));
}

async function loadReferences(config) {
  const needed = config.fields.filter(f => f[2] === 'reference').map(f => f[4].source);
  for (const key of [...new Set(needed)]) {
    if (references[key]) continue;
    const src = referenceSources[key];
    const { data } = await client.from(src.table).select(src.select).order(src.order);
    references[key] = data || [];
  }
}

async function manager(name) {
  if(name==='Testimonials')return testimonialManager();
  const config = resources[name];
  if (!config) { shell('<div class="notice">This content area is not configured.</div>'); return; }
  await loadReferences(config);
  const { data, error } = await client.from(config.table).select(config.select).order(config.order, { ascending: config.ascending ?? true });
  if (error) { shell(`<div class="notice">Could not load content: ${esc(error.message)}</div>`); return; }
  records = data || [];
  const categoryBar = name === 'Blog' ? await blogCategoryBar() : '';
  renderManager(name, config, categoryBar);
  if (name === 'Blog') wireBlogCategoryBar();
}

async function testimonialManager(){
  const config=resources.Testimonials;
  const{data,error}=await client.from(config.table).select(config.select).order(config.order);
  if(error){shell(`<div class="notice">Could not load testimonials: ${esc(error.message)}</div>`);return}
  records=data||[];
  const published=records.filter(r=>r.status==='published').length,featured=records.filter(r=>r.status==='published'&&r.is_featured).length;
  shell(`<section class="manager-intro"><div><p class="kicker">Client-approved stories</p><h2>Build trust through real experiences.</h2><p>Published reviews appear on the Testimonials page. Turn on <strong>Feature on homepage</strong> for the select stories you also want on your home page.</p></div><div class="manager-summary"><span><strong>${published}</strong> Published</span><span><strong>${featured}</strong> On homepage</span></div></section><section class="panel"><div class="panel-head"><div><h2>All testimonials</h2><p>${records.length} client stor${records.length===1?'y':'ies'}</p></div><button class="primary" id="add-record">Add testimonial</button></div>${records.length?`<div class="testimonial-manager-grid">${records.map((r,i)=>`<article class="testimonial-manager-card"><div class="testimonial-card-top"><span>${String(i+1).padStart(2,'0')}</span><div class="admin-stars" aria-label="${r.rating||5} stars">${'★'.repeat(r.rating||5)}${'☆'.repeat(Math.max(0,5-(r.rating||5)))}</div></div><blockquote>“${esc(r.quote)}”</blockquote><div class="testimonial-card-meta"><div><strong>${esc(r.client_name||'ENIVÈ Client')}</strong><small>${date(r.updated_at)}</small></div><div class="testimonial-flags"><span class="status status-${r.status}">${esc(r.status||'draft')}</span>${r.is_featured?'<span class="featured-flag">Homepage</span>':''}</div></div><div class="row-actions"><button data-edit="${r.id}">Edit story</button><button class="danger" data-delete="${r.id}">Delete</button></div></article>`).join('')}</div>`:'<div class="empty"><span class="empty-mark">“</span><h3>No client stories yet</h3><p>Add an approved testimonial, save it as a draft, then publish when ready.</p></div>'}</section><dialog id="editor"></dialog>`);
  app.querySelector('#add-record').onclick=()=>openEditor('Testimonials',config,{});
  app.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openEditor('Testimonials',config,records.find(r=>r.id===b.dataset.edit)));
  app.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>removeRecord('Testimonials',config,b.dataset.delete));
}

function renderManager(name, config, extraHtml = '') {
  shell(`${extraHtml}<section class="panel"><div class="panel-head"><div><h2>Manage ${name}</h2><p>${records.length} record${records.length === 1 ? '' : 's'}</p></div><button class="primary" id="add-record">Add new</button></div>${records.length ? `<div class="table-wrap"><table class="content-table"><thead><tr><th>Title</th><th>Status</th><th>Updated</th><th><span class="sr-only">Actions</span></th></tr></thead><tbody>${records.map(r => `<tr><td>${esc(String(r[config.titleField] || 'Untitled')).slice(0, 90)}</td><td><span class="status status-${r.status}">${esc(r.status || 'draft')}</span></td><td>${date(r.updated_at || r.created_at)}</td><td class="row-actions"><button data-edit="${r.id}">Edit</button><button class="danger" data-delete="${r.id}">Delete</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="empty"><h3>No content yet</h3><p>Add the first record when you are ready.</p></div>'}</section><dialog id="editor"></dialog>`);
  app.querySelector('#add-record').onclick = () => openEditor(name, config, {});
  app.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openEditor(name, config, records.find(r => r.id === b.dataset.edit)));
  app.querySelectorAll('[data-delete]').forEach(b => b.onclick = () => removeRecord(name, config, b.dataset.delete));
}

async function blogCategoryBar() {
  const { data } = await client.from('blog_categories').select('id,name').order('name');
  const categories = data || [];
  return `<section class="panel category-bar"><h2>Blog categories</h2><div class="chip-row">${categories.map(c => `<span class="chip">${esc(c.name)}<button type="button" data-remove-category="${c.id}" aria-label="Delete category ${esc(c.name)}">×</button></span>`).join('') || '<span class="muted">No categories yet.</span>'}</div><form id="add-category" class="inline-form"><label class="sr-only" for="new-category">New category name</label><input id="new-category" name="name" placeholder="New category name" required><button class="primary" type="submit">Add category</button></form></section>`;
}

function wireBlogCategoryBar() {
  const form = app.querySelector('#add-category');
  if (form) form.onsubmit = async e => {
    e.preventDefault();
    const name = form.elements.name.value.trim();
    if (!name) return;
    const { error } = await client.from('blog_categories').insert({ name, slug: slugify(name) });
    if (error) { notice(error.message, true); return; }
    delete references.blogCategories;
    await manager('Blog');
    notice('Category added.');
  };
  app.querySelectorAll('[data-remove-category]').forEach(b => b.onclick = async () => {
    if (!confirm('Delete this category? Posts using it will need a new category.')) return;
    const { error } = await client.from('blog_categories').delete().eq('id', b.dataset.removeCategory);
    if (error) { notice(error.message, true); return; }
    delete references.blogCategories;
    await manager('Blog');
    notice('Category deleted.');
  });
}

function openEditor(name, config, record) {
  const dialog = app.querySelector('#editor'), editing = Boolean(record.id);
  pendingImages = {};
  const guidance=name==='Testimonials'?'<div class="editor-guidance"><strong>Publishing tip</strong><span>Published shows on the Testimonials page. “Feature on homepage” adds it to the home page too.</span></div>':'';
  dialog.innerHTML = `<form class="editor-form" id="record-form"><div class="editor-head"><div><p class="kicker">${editing ? 'Edit' : 'New'} ${name}</p><h2>${editing ? esc(String(record[config.titleField] || 'Record')) : `Add ${name}`}</h2></div><button class="icon-button" type="button" data-close aria-label="Close">×</button></div>${guidance}<div class="form-grid">${config.fields.map(f => field(f, record)).join('')}</div><div class="editor-actions"><button type="button" data-close>Cancel</button><button class="primary" type="submit">Save changes</button></div><p role="status" aria-live="polite"></p></form>`;
  dialog.showModal();
  dialog.querySelectorAll('[data-close]').forEach(b => b.onclick = () => dialog.close());
  wireImageFields(dialog);
  dialog.querySelector('#record-form').onsubmit = e => saveRecord(e, name, config, record.id);
  dialog.querySelector('input,select,textarea')?.focus();
}

function field([key, label, type, required, extra], record) {
  const value = record[key] ?? '';
  if (type === 'reference') {
    const list = references[extra.source] || [];
    return `<label>${label}<select name="${key}" ${required ? 'required' : ''}><option value="">${required ? 'Choose an option' : 'None'}</option>${list.map(c => `<option value="${c.id}" ${value === c.id ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}</select></label>`;
  }
  if (type === 'image') return imageField(key, label, value, extra);
  if (type === 'list') return `<label class="wide">${label}<textarea name="${key}" ${required ? 'required' : ''}>${esc(Array.isArray(value) ? value.join('\n') : value)}</textarea><small>Enter one item per line.</small></label>`;
  if (type === 'faq') return `<label class="wide">${label}<textarea name="${key}" ${required ? 'required' : ''}>${esc(Array.isArray(value) ? value.map(item => `${item.question || ''} | ${item.answer || ''}`).join('\n') : value)}</textarea><small>Use one line per FAQ, separating the question and answer with a vertical bar.</small></label>`;
  if (type === 'textarea') return `<label class="wide">${label}<textarea name="${key}" ${required ? 'required' : ''}>${esc(value)}</textarea></label>`;
  if (type === 'select') return `<label>${label}<select name="${key}" ${required ? 'required' : ''}>${statuses.map(s => `<option value="${s}" ${value === s ? 'selected' : ''}>${title(s)}</option>`).join('')}</select></label>`;
  if (type === 'checkbox') return `<label class="check"><input type="checkbox" name="${key}" ${value ? 'checked' : ''}> ${label}</label>`;
  const formatted = type === 'datetime-local' && value ? new Date(value).toISOString().slice(0, 16) : value;
  const limits=key==='rating'?'min="1" max="5"':key==='sort_order'?'min="0"':'';
  return `<label>${label}<input type="${type}" name="${key}" value="${esc(formatted)}" ${limits} ${required ? 'required' : ''}></label>`;
}

function imageField(key, label, path, { bucket, maxMB }) {
  const url = path ? publicUrl(client, bucket, path) : '';
  return `<div class="wide image-field" data-image-field data-key="${key}" data-bucket="${bucket}" data-max="${maxMB}" data-current="${path || ''}"><span class="image-label">${label}</span><div class="image-upload"><div class="image-preview" data-image-preview>${url ? `<img src="${url}" alt="" width="160" height="160" loading="lazy">` : '<span class="image-placeholder">No image yet</span>'}</div><div class="image-controls"><label class="file-btn">Choose image<input type="file" accept="image/jpeg,image/png,image/webp" data-image-input></label>${path ? '<button type="button" class="danger" data-image-remove>Remove image</button>' : ''}<p class="image-hint">JPEG, PNG or WebP, up to ${maxMB}MB.</p></div></div></div>`;
}

function wireImageFields(root) {
  root.querySelectorAll('[data-image-field]').forEach(wrap => {
    const key = wrap.dataset.key, bucket = wrap.dataset.bucket, maxMB = Number(wrap.dataset.max) || 5;
    const input = wrap.querySelector('[data-image-input]');
    const preview = wrap.querySelector('[data-image-preview]');
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (!file) return;
      const err = validateImage(file, maxMB);
      if (err) { notice(err, true); input.value = ''; return; }
      pendingImages[key] = { file, bucket, remove: false };
      preview.innerHTML = `<img src="${URL.createObjectURL(file)}" alt="" width="160" height="160">`;
    });
    wrap.querySelector('[data-image-remove]')?.addEventListener('click', () => {
      pendingImages[key] = { file: null, bucket, remove: true };
      preview.innerHTML = '<span class="image-placeholder">No image yet</span>';
    });
  });
}

async function resolveImages(values, config, existingRecord) {
  for (const [key, pending] of Object.entries(pendingImages)) {
    const oldPath = existingRecord?.[key] || null;
    if (pending.remove) {
      if (oldPath) await removeImage(client, pending.bucket, oldPath);
      values[key] = null;
      continue;
    }
    if (pending.file) {
      const baseName = values[config.titleField] || values.name || values.title || values.category || 'image';
      const { path, error } = await uploadImage(client, pending.bucket, pending.file, { baseName, oldPath });
      if (error) return { error };
      values[key] = path;
    }
  }
  return {};
}

async function saveRecord(event, name, config, id) {
  event.preventDefault();
  const form = event.currentTarget, status = form.querySelector('[role=status]'), button = form.querySelector('[type=submit]');
  const values = Object.fromEntries(new FormData(form));
  config.fields.filter(f => f[2] === 'checkbox').forEach(f => values[f[0]] = form.elements[f[0]].checked);
  config.fields.filter(f => f[2] === 'number').forEach(f => values[f[0]] = values[f[0]] === '' ? null : Number(values[f[0]]));
  config.fields.filter(f => f[2] === 'datetime-local').forEach(f => values[f[0]] = values[f[0]] ? new Date(values[f[0]]).toISOString() : null);
  config.fields.filter(f => f[2] === 'reference').forEach(f => { if (values[f[0]] === '') values[f[0]] = null; });
  config.fields.filter(f => f[2] === 'list').forEach(f => values[f[0]] = String(values[f[0]] || '').split(/\r?\n/).map(v => v.trim()).filter(Boolean));
  config.fields.filter(f => f[2] === 'faq').forEach(f => values[f[0]] = String(values[f[0]] || '').split(/\r?\n/).map(line => { const split = line.indexOf('|'); return split < 0 ? null : { question: line.slice(0, split).trim(), answer: line.slice(split + 1).trim() }; }).filter(item => item?.question && item?.answer));
  button.disabled = true;
  status.textContent = Object.keys(pendingImages).length ? 'Uploading image…' : 'Saving…';
  const existingRecord = id ? records.find(r => r.id === id) : null;
  const { error: imageError } = await resolveImages(values, config, existingRecord);
  if (imageError) { button.disabled = false; status.textContent = `Image upload failed: ${imageError.message}`; return; }
  status.textContent = 'Saving…';
  const query = id ? client.from(config.table).update(values).eq('id', id) : client.from(config.table).insert(values);
  const { error } = await query;
  if (error) { button.disabled = false; status.textContent = error.message; return; }
  if (name === 'Service Categories') delete references.categories;
  form.closest('dialog').close();
  await manager(name);
  notice('Saved successfully.');
}

async function removeRecord(name, config, id) {
  const record = records.find(r => r.id === id);
  if (!confirm(`Delete "${record?.[config.titleField] || 'this record'}"? This cannot be undone.`)) return;
  const imageFields = config.fields.filter(f => f[2] === 'image');
  for (const [key, , , , extra] of imageFields) {
    if (record?.[key]) await removeImage(client, extra.bucket, record[key]);
  }
  const { error } = await client.from(config.table).delete().eq('id', id);
  if (error) { notice(error.message, true); return; }
  if (name === 'Service Categories') delete references.categories;
  await manager(name);
  notice('Record deleted.');
}

const galleryConfig = {
  gallery: { table: 'gallery_items', bucket: 'gallery-images', label: 'Gallery', needsConsent: false },
  before_after: { table: 'gallery_items', bucket: 'before-after-images', label: 'Before & After', needsConsent: true },
};

async function galleryManager(kind) {
  const cfg = galleryConfig[kind];
  const { data, error } = await client.from('gallery_items').select('*').eq('kind', kind).order('sort_order');
  if (error) { shell(`<div class="notice">Could not load content: ${esc(error.message)}</div>`); return; }
  if(kind==='gallery'){
    const{data:setting}=await client.from('site_settings').select('value').eq('key','gallery_design').maybeSingle();
    galleryDesign=setting?.value||{};
  }
  records = data || [];
  renderGalleryManager(kind, cfg);
}

function renderGalleryManager(kind, cfg) {
  shell(`<section class="manager-intro"><div><p class="kicker">Visual content library</p><h2>${kind==='gallery'?'Curate a beautiful visual story.':'Show results with care and consent.'}</h2><p>${kind==='gallery'?'Featured images receive the largest placement on the public gallery page. Categories automatically become visitor filters.':'Before-and-after items can only be published after written consent is confirmed.'}</p></div><div class="manager-summary"><span><strong>${records.filter(r=>r.status==='published').length}</strong> Published</span><span><strong>${records.filter(r=>r.is_featured).length}</strong> Featured</span></div></section><section class="panel"><div class="panel-head"><div><h2>Manage ${cfg.label}</h2><p>${records.length} item${records.length === 1 ? '' : 's'}</p></div><button class="primary" id="add-record">Add ${kind==='gallery'?'image':'result'}</button></div>${records.length ? `<div class="gallery-manager-grid">${records.map(r => `<div class="gallery-manager-card"><div class="gallery-manager-thumb">${r.image_path ? `<img src="${publicUrl(client, cfg.bucket, r.image_path)}" alt="" width="320" height="320" loading="lazy">` : '<span class="image-placeholder">No image</span>'}${r.is_featured?'<span class="image-featured">Featured</span>':''}</div><div class="gallery-manager-body"><small>${esc(r.category||'Uncategorized')}</small><strong>${esc(r.title || r.category || 'Untitled')}</strong><div class="gallery-manager-flags"><span class="status status-${r.status}">${esc(r.status || 'draft')}</span>${cfg.needsConsent ? `<span class="consent-flag ${r.consent_confirmed ? 'ok' : 'warn'}">${r.consent_confirmed ? 'Consent confirmed' : 'Consent required'}</span>` : ''}</div><div class="row-actions"><button data-edit="${r.id}">Edit details</button><button class="danger" data-delete="${r.id}">Delete</button></div></div></div>`).join('')}</div>` : `<div class="empty"><span class="empty-mark">▧</span><h3>No ${cfg.label.toLowerCase()} items yet</h3><p>Add the first item when you are ready.</p></div>`}</section><dialog id="editor"></dialog>`);
  app.querySelector('#add-record').onclick = () => openGalleryEditor(kind, cfg, {});
  app.querySelectorAll('[data-edit]').forEach(b => b.onclick = () => openGalleryEditor(kind, cfg, records.find(r => r.id === b.dataset.edit)));
  app.querySelectorAll('[data-delete]').forEach(b => b.onclick = () => removeGalleryRecord(kind, cfg, b.dataset.delete));
  if(kind==='gallery')renderGalleryDesignControls(cfg);
}

function renderGalleryDesignControls(cfg){
  const defaults={studio:'/assets/images/gallery-studio-architecture.webp',ritual:'/assets/images/gallery-ritual-still-life.webp',water:'/assets/images/gallery-water-glass.webp'},labels={studio:'Studio architecture',ritual:'Wellness ritual',water:'Water & glass detail'};
  const panel=document.createElement('section');panel.className='panel gallery-design-panel';panel.innerHTML=`<div class="panel-head"><div><p class="kicker">Built-in gallery artwork</p><h2>Default image design</h2><p>These images show when no published gallery records exist. Replace any or all of them here.</p></div><button class="primary" id="edit-gallery-design">Replace images</button></div><div class="gallery-design-preview">${Object.entries(defaults).map(([slot,fallback])=>`<figure><img src="${galleryDesign[slot]?publicUrl(client,cfg.bucket,galleryDesign[slot]):fallback}" alt=""><figcaption>${labels[slot]}${galleryDesign[slot]?'<span>Custom</span>':'<span>ENIVÈ default</span>'}</figcaption></figure>`).join('')}</div>`;
  app.querySelector('.manager-intro')?.after(panel);panel.querySelector('#edit-gallery-design').onclick=()=>openGalleryDesignEditor(cfg,defaults,labels);
}

function openGalleryDesignEditor(cfg,defaults,labels){
  const dialog=app.querySelector('#editor');pendingImages={};dialog.innerHTML=`<form class="editor-form" id="gallery-design-form"><div class="editor-head"><div><p class="kicker">Gallery appearance</p><h2>Replace default images</h2></div><button class="icon-button" type="button" data-close aria-label="Close">×</button></div><div class="editor-guidance"><strong>How this works</strong><span>Choose a new image for any slot. Leave a slot unchanged to keep its current image, or remove a custom image to restore the ENIVÈ default.</span></div><div class="form-grid">${Object.keys(defaults).map(slot=>imageField(slot,labels[slot],galleryDesign[slot]||'',{bucket:cfg.bucket,maxMB:8})).join('')}</div><div class="editor-actions"><button type="button" data-close>Cancel</button><button class="primary" type="submit">Save image design</button></div><p role="status" aria-live="polite"></p></form>`;dialog.showModal();dialog.querySelectorAll('[data-close]').forEach(b=>b.onclick=()=>dialog.close());wireImageFields(dialog);dialog.querySelector('form').onsubmit=e=>saveGalleryDesign(e,cfg);dialog.querySelector('input')?.focus();
}

async function saveGalleryDesign(event,cfg){
  event.preventDefault();const form=event.currentTarget,status=form.querySelector('[role=status]'),button=form.querySelector('[type=submit]'),values={...galleryDesign};button.disabled=true;status.textContent='Uploading and saving…';
  const pseudoConfig={fields:Object.keys(values).map(key=>[key,'','image',false,{bucket:cfg.bucket}]),titleField:'name'};Object.keys(pendingImages).forEach(key=>{if(!pseudoConfig.fields.some(field=>field[0]===key))pseudoConfig.fields.push([key,'','image',false,{bucket:cfg.bucket}])});values.name='gallery-design';
  const{error:imageError}=await resolveImages(values,pseudoConfig,galleryDesign);delete values.name;if(imageError){button.disabled=false;status.textContent=`Image upload failed: ${imageError.message}`;return}
  const{error}=await client.from('site_settings').upsert({key:'gallery_design',value:values,updated_at:new Date().toISOString()});if(error){button.disabled=false;status.textContent=error.message;return}dialogClose(form);await galleryManager('gallery');notice('Default gallery images updated.');
}
function dialogClose(form){form.closest('dialog')?.close()}

function openGalleryEditor(kind, cfg, record) {
  const dialog = app.querySelector('#editor'), editing = Boolean(record.id);
  pendingImages = {};
  const imageFields = imageField('image_path', kind === 'before_after' ? 'Before image' : 'Image', record.image_path || '', { bucket: cfg.bucket, maxMB: 8 })
    + (kind === 'before_after' ? imageField('after_image_path', 'After image', record.after_image_path || '', { bucket: cfg.bucket, maxMB: 8 }) : '');
  dialog.innerHTML = `<form class="editor-form" id="record-form"><div class="editor-head"><div><p class="kicker">${editing ? 'Edit' : 'New'} ${cfg.label}</p><h2>${editing ? esc(record.title || record.category || 'Item') : `Add ${cfg.label}`}</h2></div><button class="icon-button" type="button" data-close aria-label="Close">×</button></div><div class="form-grid">
    <label>Category<input name="category" value="${esc(record.category || '')}" required placeholder="e.g. Injectables, Skin, Wellness"></label>
    <label>Title<input name="title" value="${esc(record.title || '')}"></label>
    <label class="wide">Alt text (describes the image for screen readers and SEO)<input name="alt_text" value="${esc(record.alt_text || '')}" required maxlength="200"></label>
    ${imageFields}
    ${cfg.needsConsent ? `<label class="check wide"><input type="checkbox" name="consent_confirmed" ${record.consent_confirmed ? 'checked' : ''}> I confirm the client has provided written consent for these before-and-after images to appear on the ENIVÈ website and marketing materials.</label>` : ''}
    <label class="check"><input type="checkbox" name="is_featured" ${record.is_featured ? 'checked' : ''}> Feature in gallery highlights</label>
    <label>Display order<input type="number" name="sort_order" value="${record.sort_order ?? 0}"></label>
    <label>Status<select name="status">${statuses.map(s => `<option value="${s}" ${record.status === s ? 'selected' : ''}>${title(s)}</option>`).join('')}</select></label>
  </div><div class="editor-actions"><button type="button" data-close>Cancel</button><button class="primary" type="submit">Save changes</button></div><p role="status" aria-live="polite"></p></form>`;
  dialog.showModal();
  dialog.querySelectorAll('[data-close]').forEach(b => b.onclick = () => dialog.close());
  wireImageFields(dialog);
  dialog.querySelector('#record-form').onsubmit = e => saveGalleryRecord(e, kind, cfg, record.id, record);
  dialog.querySelector('input')?.focus();
}

async function saveGalleryRecord(event, kind, cfg, id, existingRecord) {
  event.preventDefault();
  const form = event.currentTarget, status = form.querySelector('[role=status]'), button = form.querySelector('[type=submit]');
  const values = Object.fromEntries(new FormData(form));
  values.is_featured = form.elements.is_featured.checked;
  if (cfg.needsConsent) values.consent_confirmed = form.elements.consent_confirmed.checked;
  values.sort_order = values.sort_order === '' ? 0 : Number(values.sort_order);
  values.kind = kind;
  if (values.status === 'published' && cfg.needsConsent && !values.consent_confirmed) {
    status.textContent = 'Please confirm client consent before publishing before-and-after images.';
    return;
  }
  button.disabled = true;
  status.textContent = Object.keys(pendingImages).length ? 'Uploading image…' : 'Saving…';
  const pseudoConfig = { fields: [['image_path', '', 'image', false, { bucket: cfg.bucket }], ['after_image_path', '', 'image', false, { bucket: cfg.bucket }]], titleField: 'title' };
  const { error: imageError } = await resolveImages(values, pseudoConfig, existingRecord);
  if (imageError) { button.disabled = false; status.textContent = `Image upload failed: ${imageError.message}`; return; }
  if (!id && !values.image_path) { button.disabled = false; status.textContent = 'Please choose an image before saving.'; return; }
  status.textContent = 'Saving…';
  const query = id ? client.from('gallery_items').update(values).eq('id', id) : client.from('gallery_items').insert(values);
  const { error } = await query;
  if (error) { button.disabled = false; status.textContent = error.message; return; }
  form.closest('dialog').close();
  await galleryManager(kind);
  notice('Saved successfully.');
}

async function removeGalleryRecord(kind, cfg, id) {
  const record = records.find(r => r.id === id);
  if (!confirm(`Delete "${record?.title || record?.category || 'this item'}"? This cannot be undone.`)) return;
  if (record?.image_path) await removeImage(client, cfg.bucket, record.image_path);
  if (record?.after_image_path) await removeImage(client, cfg.bucket, record.after_image_path);
  const { error } = await client.from('gallery_items').delete().eq('id', id);
  if (error) { notice(error.message, true); return; }
  await galleryManager(kind);
  notice('Item deleted.');
}

async function inbox() {
  const { data, error } = await client.from('contact_submissions').select('*').order('created_at', { ascending: false });
  if (error) { shell(`<div class="notice">Could not load messages: ${esc(error.message)}</div>`); return; }
  records = data || [];
  renderInbox();
}

function renderInbox() {
  shell(`<section class="panel"><div class="panel-head"><div><h2>Contact submissions</h2><p>${records.length} message${records.length === 1 ? '' : 's'}</p></div></div>${records.length ? `<div class="inbox-list">${records.map(r => `<article class="inbox-item ${r.is_read ? '' : 'unread'}"><header><strong>${esc(r.name)}</strong><span>${date(r.created_at)}</span></header><p><a href="mailto:${esc(r.email)}">${esc(r.email)}</a>${r.phone ? ` · <a href="tel:${esc(r.phone)}">${esc(r.phone)}</a>` : ''}</p><p class="inbox-message">${esc(r.message)}</p><div class="row-actions"><button data-toggle-read="${r.id}">${r.is_read ? 'Mark unread' : 'Mark read'}</button><button class="danger" data-delete-message="${r.id}">Delete</button></div></article>`).join('')}</div>` : '<div class="empty"><h3>No messages yet</h3><p>Inquiries submitted through the contact form will appear here.</p></div>'}</section>`);
  app.querySelectorAll('[data-toggle-read]').forEach(b => b.onclick = async () => {
    const record = records.find(r => r.id === b.dataset.toggleRead);
    const { error } = await client.from('contact_submissions').update({ is_read: !record.is_read }).eq('id', record.id);
    if (error) { notice(error.message, true); return; }
    await inbox();
  });
  app.querySelectorAll('[data-delete-message]').forEach(b => b.onclick = async () => {
    if (!confirm('Delete this message? This cannot be undone.')) return;
    const { error } = await client.from('contact_submissions').delete().eq('id', b.dataset.deleteMessage);
    if (error) { notice(error.message, true); return; }
    await inbox();
    notice('Message deleted.');
  });
}

async function settings(section) {
  const key = section === 'Business Information' ? 'business' : 'site';
  const { data, error } = await client.from('site_settings').select('value').eq('key', key).maybeSingle();
  if (error) { shell(`<div class="notice">${esc(error.message)}</div>`); return; }
  const value = data?.value || {};
  shell(`<section class="panel settings-panel"><h2>${section}</h2><p>These values are used across the public website.</p><form id="settings-form" class="form-grid">${settingFields(section, value)}<div class="wide editor-actions"><button class="primary" type="submit">Save settings</button></div><p class="wide" role="status" aria-live="polite"></p></form></section>`);
  app.querySelector('#settings-form').onsubmit = async e => {
    e.preventDefault();
    const form = e.currentTarget, out = { ...value, ...Object.fromEntries(new FormData(form)) }, status = form.querySelector('[role=status]');
    status.textContent = 'Saving…';
    const { error } = await client.from('site_settings').upsert({ key, value: out, updated_at: new Date().toISOString() });
    status.textContent = error ? error.message : 'Settings saved.';
  };
}

function settingFields(section, v) {
  const fields = section === 'Business Information'
    ? [['name', 'Business name'], ['phone', 'Phone'], ['email', 'Email'], ['address', 'Address'], ['hours', 'Hours'], ['booking_url', 'Booking URL']]
    : [['seo_title', 'Default SEO title'], ['seo_description', 'Default SEO description'], ['announcement', 'Announcement banner'], ['home_eyebrow', 'Homepage eyebrow'], ['home_heading', 'Homepage main heading'], ['home_heading_accent', 'Homepage accent heading'], ['home_intro', 'Homepage introduction'], ['services_eyebrow', 'Services-page eyebrow'], ['services_heading', 'Services-page main heading'], ['services_heading_accent', 'Services-page accent heading'], ['services_intro', 'Services-page introduction'], ['footer_kicker', 'Footer eyebrow'], ['footer_heading', 'Footer main heading'], ['footer_heading_accent', 'Footer accent heading']];
  return fields.map(([k, l]) => `<label class="${k.includes('description') || k.includes('intro') ? 'wide' : ''}">${l}${k.includes('description') || k.includes('intro') ? `<textarea name="${k}">${esc(v[k] || '')}</textarea>` : `<input name="${k}" value="${esc(v[k] || '')}">`}</label>`).join('');
}

function notice(message, error = false) {
  const box = app.querySelector('#notice');
  if (!box) return;
  box.className = error ? 'notice error' : 'notice success';
  box.textContent = message;
  setTimeout(() => { box.textContent = ''; box.className = ''; }, 4000);
}
function esc(v) { return String(v ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c])); }
function date(v) { return v ? new Intl.DateTimeFormat('en-US', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(v)) : '—'; }
function title(v) { return v.charAt(0).toUpperCase() + v.slice(1); }

init();
