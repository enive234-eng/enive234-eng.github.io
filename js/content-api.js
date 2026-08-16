import{getClient,isConfigured}from'./supabase.js';

export function storageUrl(bucket,path){
 const config=window.ENIVE_CONFIG||{};
 if(!path||!config.supabaseUrl)return'';
 return`${config.supabaseUrl}/storage/v1/object/public/${bucket}/${path}`;
}

export async function fetchServiceCatalog(){
 if(!isConfigured)return null;
 const client=await getClient();
 const{data,error}=await client.from('service_categories').select('id,name,slug,description,hero_image_path,seo_title,seo_description,sort_order,services(name,slug,short_description,description,benefits,price_label,duration_minutes,image_path,faq,sort_order)').eq('status','published').eq('services.status','published').order('sort_order').order('sort_order',{referencedTable:'services'});
 if(error){console.warn('Service catalog fallback:',error.message);return null}
 return data;
}

export async function fetchFeaturedTestimonials(){
 if(!isConfigured)return null;
 const client=await getClient();
 const{data,error}=await client.from('testimonials').select('client_name,quote,rating').eq('status','published').eq('is_featured',true).order('sort_order').limit(6);
 if(error){console.warn('Testimonial fallback:',error.message);return null}
 return data;
}

export async function fetchPublishedTestimonials(){
 if(!isConfigured)return null;
 const client=await getClient();
 const{data,error}=await client.from('testimonials').select('client_name,quote,rating,is_featured').eq('status','published').order('sort_order').limit(24);
 if(error){console.warn('Published testimonials fallback:',error.message);return null}
 return data;
}

export async function fetchFeaturedProvider(){
 if(!isConfigured)return null;
 const client=await getClient();
 const{data,error}=await client.from('providers').select('name,credentials,title,biography,philosophy,image_path').eq('status','published').eq('is_featured',true).order('sort_order').limit(1).maybeSingle();
 if(error){console.warn('Provider fallback:',error.message);return null}
 return data;
}

export async function fetchActiveAnnouncement(){
 if(!isConfigured)return null;
 const client=await getClient();
 const{data,error}=await client.from('announcements').select('message,link_label,link_url,starts_at,ends_at').eq('status','published').order('created_at',{ascending:false}).limit(10);
 if(error){console.warn('Announcement fallback:',error.message);return null}
 const now=Date.now();return(data||[]).find(item=>(!item.starts_at||new Date(item.starts_at).getTime()<=now)&&(!item.ends_at||new Date(item.ends_at).getTime()>=now))||null;
}

export async function fetchFeaturedPromotion(){
 if(!isConfigured)return null;
 const client=await getClient();
 const{data,error}=await client.from('promotions').select('title,description,image_path,cta_label,cta_url,starts_at,ends_at').eq('status','published').eq('is_featured',true).order('created_at',{ascending:false}).limit(10);
 if(error){console.warn('Promotion fallback:',error.message);return null}
 const now=Date.now();return(data||[]).find(item=>(!item.starts_at||new Date(item.starts_at).getTime()<=now)&&(!item.ends_at||new Date(item.ends_at).getTime()>=now))||null;
}

export async function fetchGalleryItems(kind){
 if(!isConfigured)return null;
 const client=await getClient();
 const{data,error}=await client.from('gallery_items').select('category,title,image_path,after_image_path,alt_text,is_featured').eq('kind',kind).eq('status','published').order('sort_order').limit(24);
 if(error){console.warn('Gallery fallback:',error.message);return null}
 return data;
}

export async function fetchBlogPosts(){
 if(!isConfigured)return null;
 const client=await getClient();
 const{data,error}=await client.from('blog_posts').select('id,title,slug,excerpt,featured_image_path,published_at,created_at,blog_categories(name),providers(name)').eq('status','published').order('published_at',{ascending:false}).limit(30);
 if(error){console.warn('Blog list fallback:',error.message);return null}
 return data;
}

export async function fetchBlogPostBySlug(slug){
 if(!isConfigured)return null;
 const client=await getClient();
 const{data,error}=await client.from('blog_posts').select('id,category_id,title,slug,excerpt,body,featured_image_path,seo_title,seo_description,published_at,blog_categories(name),providers(name)').eq('status','published').eq('slug',slug).maybeSingle();
 if(error){console.warn('Blog post fallback:',error.message);return null}
 return data;
}

export async function fetchRelatedPosts(categoryId,excludeId){
 if(!isConfigured||!categoryId)return null;
 const client=await getClient();
 const{data,error}=await client.from('blog_posts').select('title,slug,excerpt,featured_image_path').eq('status','published').eq('category_id',categoryId).neq('id',excludeId).order('published_at',{ascending:false}).limit(3);
 if(error){console.warn('Related posts fallback:',error.message);return null}
 return data;
}

export async function fetchPublicSettings(){
 if(!isConfigured)return null;
 const client=await getClient();
 const{data,error}=await client.from('site_settings').select('key,value');
 if(error){console.warn('Settings fallback:',error.message);return null}
 return Object.fromEntries(data.map(row=>[row.key,row.value]));
}

export async function fetchPageContent(slug){
 if(!isConfigured||!slug)return null;
 const client=await getClient();
 const{data,error}=await client.from('page_content').select('slug,title,eyebrow,intro,body,seo_title,seo_description').eq('slug',slug).eq('status','published').maybeSingle();
 if(error){console.warn('Page content fallback:',error.message);return null}
 return data;
}
