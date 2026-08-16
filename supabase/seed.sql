-- Run after schema.sql. Safe to run repeatedly.
insert into public.service_categories(name,slug,description,status,sort_order) values
('Consultations','consultations','Begin with a complimentary, unhurried conversation.','published',1),
('Injectables','injectables','Refined results that preserve what makes you, you.','published',2),
('Skin & Aesthetics','medical-aesthetics','Healthy, luminous skin—with intention behind every step.','published',3),
('Laser Hair Removal','laser-hair-removal','A smoother ritual, made beautifully simple.','published',4),
('IV Hydration','iv-hydration','Targeted hydration for energy, recovery and glow.','published',5),
('Medical Weight Loss','medical-weight-loss','Sustainable support. Clinically guided.','published',6),
('Peptide Therapy','peptide-therapy','Personalized support for how you want to feel.','published',7),
('Concierge Wellness','concierge-wellness','Premium care, brought to your space.','published',8)
on conflict(slug) do update set name=excluded.name,description=excluded.description,status=excluded.status,sort_order=excluded.sort_order;

with rows(category_slug,name,slug,description,benefits,price_label,sort_order) as (values
('consultations','Complimentary Consultation','complimentary-consultation','Personalized planning with clear, honest provider guidance','["Personalized roadmap","No-pressure experience"]'::jsonb,'Complimentary',1),
('injectables','Botox','botox','Neuromodulator treatment personalized by area and goals','["Soften expression lines","Natural-looking refinement"]'::jsonb,'$12 / unit',1),
('injectables','Xeomin','xeomin','Neuromodulator treatment personalized by area and goals','["Soften expression lines","Provider-led planning"]'::jsonb,'$12 / unit',2),
('injectables','Dermal Fillers & Biostimulators','fillers-biostimulators','Lip filler, Restylane Kysse, Lyft, Volyme, Versa, Radiesse, Sculptra, Profhilo and skin boosters','["Restore balanced volume","Support collagen"]'::jsonb,'From $650 / syringe',3),
('injectables','PRP & PRF Treatments','regenerative-injectables','Regenerative injectable options selected after consultation','["Regenerative approach","Personalized plan"]'::jsonb,'Consultation',4),
('medical-aesthetics','Signature Facial','signature-facial','A personalized facial supporting healthy, luminous skin','["Restore radiance","Refine tone"]'::jsonb,'From $128',1),
('medical-aesthetics','Microneedling','microneedling','Collagen-supporting skin rejuvenation','["Improve texture","Support collagen"]'::jsonb,'$400',2),
('medical-aesthetics','RF Microneedling','rf-microneedling','Radiofrequency-assisted microneedling','["Improve texture","Support firmness"]'::jsonb,'$650',3),
('medical-aesthetics','Vampire Facial','vampire-facial','PRP microneedling treatment','["Support renewal","Improve texture"]'::jsonb,'$500',4),
('medical-aesthetics','PRP Hair Restoration','prp-hair-restoration','Provider-guided regenerative hair support','["Personalized protocol","Provider oversight"]'::jsonb,'$500',5),
('laser-hair-removal','Small Area','laser-small-area','Laser hair reduction for a small treatment area','["Long-term reduction","Less maintenance"]'::jsonb,'$75',1),
('laser-hair-removal','Medium Area','laser-medium-area','Laser hair reduction for a medium treatment area','["Long-term reduction","Customized settings"]'::jsonb,'$250',2),
('laser-hair-removal','Large Area','laser-large-area','Laser hair reduction for a large treatment area','["Long-term reduction","Smoother skin"]'::jsonb,'$350',3),
('laser-hair-removal','Bikini + Underarms','laser-bikini-underarms','Combined bikini and underarm laser treatment','["Convenient pairing","Less maintenance"]'::jsonb,'$200',4),
('laser-hair-removal','Full Body','laser-full-body','Up to five laser treatment areas','["Up to five areas","Customized plan"]'::jsonb,'$750',5),
('iv-hydration','IV Cocktails','iv-cocktails','Myers’ Cocktail, Ignite, Glow, Shield, Refuel, Detoxify, and Energy + Metabolism','["Direct hydration","Personalized add-ons"]'::jsonb,'$128',1),
('iv-hydration','Vitamin Add-Ons','iv-vitamin-add-ons','Additional vitamins and nutrients for eligible IV infusions','["Personalized support","Convenient addition"]'::jsonb,'From $20',2),
('medical-weight-loss','Tirzepatide','tirzepatide','Provider-guided medical weight management option','["Individualized plan","Provider monitoring"]'::jsonb,'Consultation required',1),
('medical-weight-loss','Retatrutide','retatrutide','Provider-guided medical weight management option','["Individualized plan","Progress support"]'::jsonb,'Consultation required',2),
('peptide-therapy','Personalized Peptide Protocols','peptide-protocols','CJC-1295 / Ipamorelin, GHK-Cu, Glow Peptide, NAD+, PT-141 and Sermorelin','["Goal-based protocol","Medical oversight"]'::jsonb,'From $350',1),
('concierge-wellness','Mobile IV Hydration','mobile-iv-hydration','Select IV hydration at an eligible Greater Houston location','["Your location","Private experience"]'::jsonb,'Custom quote',1),
('concierge-wellness','Concierge Injectables','concierge-injectables','Eligible injectable services in a private concierge setting','["Private experience","Provider-led care"]'::jsonb,'Custom quote',2),
('concierge-wellness','Private & Corporate Wellness','private-corporate-wellness','Private events, Botox parties and corporate wellness services','["Event-friendly care","Greater Houston service"]'::jsonb,'Custom quote',3))
insert into public.services(category_id,name,slug,description,benefits,price_label,status,sort_order)
select c.id,r.name,r.slug,r.description,r.benefits,r.price_label,'published',r.sort_order from rows r join public.service_categories c on c.slug=r.category_slug
on conflict(slug) do update set category_id=excluded.category_id,name=excluded.name,description=excluded.description,benefits=excluded.benefits,price_label=excluded.price_label,status=excluded.status,sort_order=excluded.sort_order;

insert into public.providers(name,credentials,title,slug,biography,philosophy,is_featured,status,sort_order) values
('Aisha Tadese-Taiwo','DMSc, PA-C','Founder & Medical Provider','aisha-tadese-taiwo','Approved full biography pending.','Personalized, evidence-based care grounded in listening, clarity and each client’s goals.',true,'draft',1)
on conflict(slug) do nothing;

insert into public.page_content(slug,title,eyebrow,status,sort_order) values
('about','About ENIVÈ','About ENIVÈ','draft',1),
('privacy-policy','Privacy Policy','Legal','draft',10),
('terms-and-conditions','Terms & Conditions','Legal','draft',11),
('cancellation-no-show-policy','Cancellation & No-Show Policy','Legal','draft',12),
('refund-policy','Refund Policy','Legal','draft',13),
('hipaa-privacy-notice','HIPAA Privacy Notice','Legal','draft',14),
('medical-disclaimer','Medical Disclaimer','Legal','draft',15)
on conflict(slug) do nothing;
