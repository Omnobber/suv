/* =============================================
   BELIMAA — Shared JavaScript
   API helpers, Cart, Toast, Utils
   ============================================= */

/* ---- API Base ---- */
const API_BASE = 'tables';
let resolvedApiBase = '';
let apiBasePromise = null;
const TABLE = {
  products: 'belimaa_products',
  orders: 'belimaa_orders',
  enquiries: 'belimaa_enquiries',
  settings: 'belimaa_settings',
  coupons: 'belimaa_coupons',
  staff: 'belimaa_staff',
  activity: 'belimaa_admin_activity'
};

const DEFAULT_SITE_SETTINGS = {
  brand_blue_text: 'Beli',
  brand_green_text: 'maa',
  slogan: 'स्वप्नात् सत्यं।',
  footer_description: 'Premium cultural, spiritual and decorative handcrafted products. Temple mandirs, festival decor, embroidery and more - made with love in India.',
  nav_color_start: '#0b1f4d',
  nav_color_mid: '#12357a',
  nav_color_end: '#1b4f9c',
  brand_blue_color: '#4057c8',
  brand_green_color: '#4aa548',
  home_collections_badge: 'Browse by Category',
  home_collections_title: 'Shop Our Collections',
  products_banner_title: 'All Products',
  products_banner_subtitle: 'Explore our complete collection of premium handcrafted products',
  temple_card_image: 'images/products/light-wood-table-mandir.jpg',
  festival_card_image: 'images/products/painted-rangoli-disc.jpg',
  home_decor_card_image: 'images/products/tree-wall-panel.jpg',
  embroidery_card_image: 'images/products/floral-relief-panel.jpg',
  metal_embroidery_card_image: 'images/products/stainless-name-plate-a.jpg',
  temple_section_title: 'Sacred Temple Mandirs',
  temple_section_subtitle: 'Handcrafted wooden and MDF mandirs for your sacred space. CNC laser precision meets traditional craftsmanship.',
  festival_section_title: 'Festival Decor & Gifts',
  festival_section_subtitle: 'Celebrate every festival with premium handcrafted decor. Diwali diyas, Navratri sets, rangoli mats and more.',
  home_decor_section_title: 'Elevate Your Space',
  home_decor_section_subtitle: 'Premium wall art, laser-cut panels, mandala hangings and decorative pieces to beautify every room.',
  embroidery_section_title: 'Artisan Embroidery',
  embroidery_section_subtitle: 'Traditional Indian hand-embroidered cushion covers, pillow cases and decor pieces with Zari and Suzani work.',
  metal_embroidery_section_title: 'Luxury Zardozi Art',
  metal_embroidery_section_subtitle: 'Rare and exquisite Zardozi metal embroidery - royal tapestries, wall panels and collectible art pieces with metallic threadwork.'
};

const BELIMAA_FALLBACK_PRODUCTS = [
  { id:'temple-1', name:'Light Wood Table Mandir', category:'Temple', price:3499, original_price:4299, featured:true, active:true, image_url:'images/products/light-wood-table-mandir.jpg', description:'Compact handcrafted table mandir with Om back panel and drawer storage.', tags:['mandir','table mandir'] },
  { id:'temple-2', name:'Om Cutwork Mandir Pair', category:'Temple', price:2599, original_price:3199, active:true, image_url:'images/products/om-cutwork-mandir-pair.jpg', description:'Twin laser-cut mandirs with Om, Shubh, Labh and diya motifs.' },
  { id:'temple-3', name:'Ram Mandir Wooden Model', category:'Temple', price:2899, original_price:3599, active:true, image_url:'images/products/ram-mandir-model.jpg', description:'Detailed Ram Mandir desk model cut from layered wood with carved facade.' },
  { id:'temple-4', name:'Ayodhya Temple Display Model', category:'Temple', price:8499, original_price:9999, featured:true, active:true, image_url:'images/products/ram-mandir-model-lit-a.jpg', description:'Large illuminated temple display model with intricate pillars and shrine detailing.' },
  { id:'temple-5', name:'Heritage Mandir Light Model', category:'Temple', price:8299, original_price:9599, active:true, image_url:'images/products/ram-mandir-model-lit-b.jpg', description:'Warm-lit handcrafted temple model for devotional display corners.' },
  { id:'temple-6', name:'Premium Temple Showcase Model', category:'Temple', price:8799, original_price:10299, active:true, image_url:'images/products/ram-mandir-model-lit-c.jpg', description:'Multi-level illuminated temple showcase model with deep architectural detail.' },
  { id:'temple-7', name:'Golden Temple Inspired Model', category:'Temple', price:6999, original_price:7999, featured:true, active:true, image_url:'images/products/golden-temple-model.jpg', description:'Laser-cut wooden temple model inspired by iconic sacred architecture.' },
  { id:'temple-8', name:'Wall Mandir Panel', category:'Temple', price:1899, original_price:2399, active:true, image_url:'images/products/wall-mandir-panel.jpg', description:'Decorative wall mandir panel with Om and bell cutwork for pooja spaces.' },
  { id:'temple-9', name:'Shubh Labh Cut Panel', category:'Temple', price:1699, original_price:2199, active:true, image_url:'images/products/shubh-labh-panel.jpg', description:'Laser-cut Shubh Labh panel with diya drops for entrances and pooja décor.' },
  { id:'festival-1', name:'Mandala Rangoli Base', category:'Festival', price:799, original_price:999, active:true, image_url:'images/products/mandala-rangoli-base.jpg', description:'Round laser-cut rangoli base for festive floor styling and diya décor.' },
  { id:'festival-2', name:'Ganesha Rangoli Base', category:'Festival', price:749, original_price:949, active:true, image_url:'images/products/ganesha-rangoli-base.jpg', description:'Circular Ganesha rangoli board for Diwali and housewarming celebrations.' },
  { id:'festival-3', name:'Painted Festival Decor Disc', category:'Festival', price:1299, original_price:1599, featured:true, active:true, image_url:'images/products/painted-rangoli-disc.jpg', description:'Hand-painted festive décor disc with vibrant mandala detailing.' },
  { id:'festival-4', name:'Acrylic Diya Welcome Panel', category:'Festival', price:1499, original_price:1899, active:true, image_url:'images/products/shubh-labh-panel.jpg', description:'Festive cutwork panel suited for Diwali entrances and pooja rooms.' },
  { id:'decor-1', name:'Tree Wall Panel', category:'Home Decor', price:2399, original_price:2899, featured:true, active:true, image_url:'images/products/tree-wall-panel.jpg', description:'Large tree silhouette wall panel for statement home décor.' },
  { id:'decor-2', name:'Leaf Partition Panel', category:'Home Decor', price:3599, original_price:4299, active:true, image_url:'images/products/leaf-partition-panel.jpg', description:'Laser-cut partition panel with flowing leaf pattern for modern spaces.' },
  { id:'decor-3', name:'Floral Jali Panel', category:'Home Decor', price:2199, original_price:2699, active:true, image_url:'images/products/floral-jali-panel.jpg', description:'Decorative floral jali panel for partitions, niches and feature walls.' },
  { id:'decor-4', name:'Mandala Heritage Clock', category:'Home Decor', price:1999, original_price:2499, active:true, image_url:'images/products/mandala-clock-panel.jpg', description:'Layered mandala clock panel for artistic living room styling.' },
  { id:'decor-5', name:'Wood Number Wall Clock', category:'Home Decor', price:1599, original_price:1999, active:true, image_url:'images/products/wood-number-clock.jpg', description:'Minimal wood-look clock with cut numeral detailing.' },
  { id:'decor-6', name:'Round Tree Wall Art', category:'Home Decor', price:1499, original_price:1899, active:true, image_url:'images/products/tree-round-wall-art.jpg', description:'Round tree wall décor that fits living rooms, bedrooms and lobbies.' },
  { id:'decor-7', name:'Forest Deer Wall Art', category:'Home Decor', price:1699, original_price:2099, active:true, image_url:'images/products/forest-deer-wall-art.jpg', description:'Round deer forest cutout wall art for premium modern homes.' },
  { id:'decor-8', name:'Carved Peacock Door Panel', category:'Home Decor', price:6599, original_price:7799, featured:true, active:true, image_url:'images/products/carved-peacock-door.jpg', description:'Premium carved wooden peacock panel for entryways and feature doors.' },
  { id:'emb-1', name:'Floral Relief Art Panel', category:'Embroidery', price:2199, original_price:2699, active:true, image_url:'images/products/floral-relief-panel.jpg', description:'Artisan ornamental floral relief panel with handcrafted luxury styling.' },
  { id:'emb-2', name:'Ornate Frame Art Panel', category:'Embroidery', price:1899, original_price:2299, active:true, image_url:'images/products/ornate-frame-panel.jpg', description:'Decorative frame-style panel suited for craft-inspired home accents.' },
  { id:'metal-1', name:'LED Sign Board', category:'Metal Embroidery', price:3299, original_price:3999, active:true, image_url:'images/products/led-sign-board-a.jpg', description:'Illuminated custom sign board for storefront branding and display.' },
  { id:'metal-2', name:'Glow Acrylic Sign Board', category:'Metal Embroidery', price:3499, original_price:4199, active:true, image_url:'images/products/led-sign-board-b.jpg', description:'Premium glowing sign board with multicolor acrylic lettering.' },
  { id:'metal-3', name:'Acrylic Cut Letter Display', category:'Metal Embroidery', price:2299, original_price:2799, active:true, image_url:'images/products/acrylic-cut-letters.jpg', description:'Laser-cut acrylic branding letters for shop counters and displays.' },
  { id:'metal-4', name:'Stainless Steel Name Plate', category:'Metal Embroidery', price:1499, original_price:1899, featured:true, active:true, image_url:'images/products/stainless-name-plate-a.jpg', description:'Engraved stainless-steel name plate with professional finish.' },
  { id:'metal-5', name:'Temple Motif Name Plate', category:'Metal Embroidery', price:1599, original_price:1999, active:true, image_url:'images/products/stainless-name-plate-b.jpg', description:'Steel engraved name plate with temple-inspired marking and clean edge finish.' },
  { id:'metal-6', name:'Steel Surface Engraving Plate', category:'Metal Embroidery', price:899, original_price:1199, active:true, image_url:'images/products/stainless-engraving.jpg', description:'Precision stainless-steel engraving sample ideal for custom orders.' },
  { id:'metal-7', name:'Fine Blade Engraving', category:'Metal Embroidery', price:1399, original_price:1699, active:true, image_url:'images/products/blade-engraving.jpg', description:'Detailed metal engraving work showcasing fine precision on blade steel.' },
  { id:'metal-8', name:'Custom Steel Keychain', category:'Metal Embroidery', price:399, original_price:549, active:true, image_url:'images/products/personalized-keychain-a.jpg', description:'Polished metal keychain personalized with custom text.' },
  { id:'metal-9', name:'Couple Name Keychain', category:'Metal Embroidery', price:449, original_price:599, active:true, image_url:'images/products/personalized-keychain-b.jpg', description:'Personalized name keychain for gifting, couples and events.' },
  { id:'metal-10', name:'Logo Engraved Keychain', category:'Metal Embroidery', price:499, original_price:649, active:true, image_url:'images/products/logo-keychain.jpg', description:'Logo engraved steel keychain for corporate gifting and brand promotions.' }
];

const BELIMAA_FALLBACK_BY_CATEGORY = BELIMAA_FALLBACK_PRODUCTS.reduce((acc, product) => {
  if (!acc[product.category]) acc[product.category] = [];
  acc[product.category].push(product);
  return acc;
}, { Temple: [], Festival: [], 'Home Decor': [], Embroidery: [], 'Metal Embroidery': [] });

const BELIMAA_LOCAL_CATALOG_KEY = 'belimaa_local_catalog';

function getBelimaaFallbackProducts(category = '') {
  if (!category) return [...BELIMAA_FALLBACK_PRODUCTS];
  return [...(BELIMAA_FALLBACK_BY_CATEGORY[category] || [])];
}

function getBelimaaLocalCatalog() {
  try {
    const parsed = JSON.parse(localStorage.getItem(BELIMAA_LOCAL_CATALOG_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveBelimaaLocalCatalog(products = []) {
  localStorage.setItem(BELIMAA_LOCAL_CATALOG_KEY, JSON.stringify(products));
  window.dispatchEvent(new CustomEvent('belimaa-catalog-updated', { detail: products }));
}

function ensureBelimaaLocalCatalog() {
  return getBelimaaLocalCatalog();
}

function mergeBelimaaProducts(products = []) {
  const merged = new Map();
  [...(products || []), ...ensureBelimaaLocalCatalog(), ...BELIMAA_FALLBACK_PRODUCTS].forEach(product => {
    if (!product || !product.id) return;
    merged.set(product.id, product);
  });
  return Array.from(merged.values());
}

window.BELIMAA_FALLBACK_PRODUCTS = BELIMAA_FALLBACK_PRODUCTS;
window.BELIMAA_FALLBACK_BY_CATEGORY = BELIMAA_FALLBACK_BY_CATEGORY;
window.getBelimaaFallbackProducts = getBelimaaFallbackProducts;
window.mergeBelimaaProducts = mergeBelimaaProducts;
window.getBelimaaLocalCatalog = getBelimaaLocalCatalog;
window.saveBelimaaLocalCatalog = saveBelimaaLocalCatalog;
window.ensureBelimaaLocalCatalog = ensureBelimaaLocalCatalog;

function bindBelimaaCatalogSync(callback) {
  if (typeof callback !== 'function') return;
  window.addEventListener('storage', (event) => {
    if (event.key === BELIMAA_LOCAL_CATALOG_KEY) callback();
  });
  window.addEventListener('belimaa-catalog-updated', () => callback());
  window.addEventListener('focus', () => callback());
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') callback();
  });
}

window.bindBelimaaCatalogSync = bindBelimaaCatalogSync;

function getApiCandidates() {
  const candidates = [];
  const metaApiBase = document.querySelector('meta[name="belimaa-api-base"]')?.getAttribute('content');
  const storedApiBase = localStorage.getItem('belimaa_api_base');
  const isLocalHost = window.location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(window.location.hostname);
  if (metaApiBase) {
    candidates.push(String(metaApiBase).replace(/\/$/, ''));
  }
  if (storedApiBase) {
    candidates.push(String(storedApiBase).replace(/\/$/, ''));
  }
  if (isLocalHost) {
    candidates.push('http://localhost:5000/api');
    candidates.push('http://127.0.0.1:5000/api');
  }
  if (window.BELIMAA_API_BASE) {
    candidates.push(String(window.BELIMAA_API_BASE).replace(/\/$/, ''));
  }
  if (window.location.origin && window.location.origin.startsWith('http')) {
    candidates.push(window.location.origin.replace(/\/$/, '') + '/api');
  }
  candidates.push('/api');
  return [...new Set(candidates)];
}

async function resolveApiBase() {
  if (apiBasePromise) return apiBasePromise;
  apiBasePromise = (async () => {
    for (const base of getApiCandidates()) {
      try {
        const res = await fetch(`${base}/health`, { method: 'GET' });
        if (res.ok) {
          resolvedApiBase = base;
          return base;
        }
      } catch (e) {
        console.warn('API candidate failed:', base, e);
      }
    }
    resolvedApiBase = getApiCandidates()[0] || '/api';
    return resolvedApiBase;
  })();
  return apiBasePromise;
}

/* ---- API Helpers ---- */
async function apiFetch(url, options = {}) {
  try {
    const base = await resolveApiBase();
    const target = /^(?:[a-z]+:)?\/\//i.test(url) ? url : `${base}/${String(url).replace(/^\/+/, '')}`;
    const headers = { ...(options.headers || {}) };
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;
    if (!isFormData && !headers['Content-Type']) headers['Content-Type'] = 'application/json';
    const res = await fetch(target, {
      ...options,
      headers
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    if (res.status === 204) return null;
    return await res.json();
  } catch (e) {
    console.error('API Error:', e);
    throw e;
  }
}

async function getProducts(params = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', params.page);
  if (params.limit) qs.set('limit', params.limit);
  if (params.search) qs.set('search', params.search);
  if (params.sort) qs.set('sort', params.sort);
  const url = `${API_BASE}/${TABLE.products}?${qs.toString()}`;
  const data = await apiFetch(url);
  return data;
}

async function getProductById(id) {
  return apiFetch(`${API_BASE}/${TABLE.products}/${id}`);
}

async function createProduct(product) {
  return apiFetch(`${API_BASE}/${TABLE.products}`, {
    method: 'POST',
    body: JSON.stringify(product)
  });
}

async function updateProduct(id, product) {
  return apiFetch(`${API_BASE}/${TABLE.products}/${id}`, {
    method: 'PUT',
    body: JSON.stringify(product)
  });
}

async function deleteProduct(id) {
  return apiFetch(`${API_BASE}/${TABLE.products}/${id}`, { method: 'DELETE' });
}

async function createOrder(order) {
  return apiFetch(`${API_BASE}/${TABLE.orders}`, {
    method: 'POST',
    body: JSON.stringify(order)
  });
}

async function getOrders(params = {}) {
  const qs = new URLSearchParams();
  if (params.page) qs.set('page', params.page);
  if (params.limit) qs.set('limit', params.limit);
  return apiFetch(`${API_BASE}/${TABLE.orders}?${qs.toString()}`);
}

async function submitEnquiry(data) {
  return apiFetch(`${API_BASE}/${TABLE.enquiries}`, {
    method: 'POST',
    body: JSON.stringify(data)
  });
}

function normalizeSiteSettings(raw = {}) {
  const normalized = { ...DEFAULT_SITE_SETTINGS, ...(raw || {}) };
  if (normalized.brand_blue_color === '#2d93dd') normalized.brand_blue_color = DEFAULT_SITE_SETTINGS.brand_blue_color;
  if (normalized.brand_green_color === '#8bd63c') normalized.brand_green_color = DEFAULT_SITE_SETTINGS.brand_green_color;
  return normalized;
}

async function getSiteSettings() {
  try {
    const res = await apiFetch(`${API_BASE}/${TABLE.settings}?limit=1`);
    const row = (res && Array.isArray(res.data) && res.data[0]) ? res.data[0] : null;
    return normalizeSiteSettings(row || {});
  } catch (e) {
    console.warn('Falling back to default site settings:', e);
    return normalizeSiteSettings();
  }
}

async function saveSiteSettings(settings) {
  const payload = normalizeSiteSettings(settings);
  try {
    const res = await apiFetch(`${API_BASE}/${TABLE.settings}?limit=1`);
    const existing = (res && Array.isArray(res.data) && res.data[0]) ? res.data[0] : null;
    if (existing && existing.id) {
      return apiFetch(`${API_BASE}/${TABLE.settings}/${existing.id}`, {
        method: 'PUT',
        body: JSON.stringify(payload)
      });
    }
  } catch (e) {
    console.warn('Creating site settings because lookup failed:', e);
  }
  return apiFetch(`${API_BASE}/${TABLE.settings}`, {
    method: 'POST',
    body: JSON.stringify(payload)
  });
}

function setTextIfExists(selector, value) {
  document.querySelectorAll(selector).forEach(el => {
    el.textContent = value;
  });
}

function normalizeAssetPath(src) {
  if (!src || typeof src !== 'string') return src;
  const trimmed = src.trim();
  if (!trimmed) return trimmed;
  if (/^(?:[a-z]+:)?\/\//i.test(trimmed) || trimmed.startsWith('data:') || trimmed.startsWith('blob:')) {
    return trimmed;
  }
  const normalized = trimmed.replace(/\\/g, '/');
  const fileName = normalized.split('/').pop();
  if (/^[a-z]:\//i.test(normalized)) {
    return fileName ? `images/${fileName}` : '';
  }
    if (normalized.startsWith('/images/')) return normalized.slice(1);
    if (normalized.startsWith('/img/')) return `images/${normalized.slice('/img/'.length)}`;
    if (normalized.startsWith('/uploads/')) {
      return resolvedApiBase ? `${resolvedApiBase.replace(/\/api$/, '')}${normalized}` : normalized;
    }
    if (normalized.startsWith('uploads/')) {
      return resolvedApiBase ? `${resolvedApiBase.replace(/\/api$/, '')}/${normalized}` : normalized;
    }
    if (normalized.startsWith('images/')) return normalized;
    if (normalized.startsWith('img/')) return `images/${normalized.slice('img/'.length)}`;
    return normalized.replace(/^\.\//, '');
  }
function setImageIfExists(id, src) {
  const el = document.getElementById(id);
  if (el && src) el.src = normalizeAssetPath(src);
}

function setBrandMarkup(selector, blueText, greenText) {
  document.querySelectorAll(selector).forEach(el => {
    el.innerHTML = `<span class="b">${blueText}</span><span class="g">${greenText}</span>`;
  });
}

function applySiteSettings(rawSettings = {}) {
  const settings = normalizeSiteSettings(rawSettings);
  const root = document.documentElement;
  const gradient = `linear-gradient(90deg, ${settings.nav_color_start} 0%, ${settings.nav_color_mid} 55%, ${settings.nav_color_end} 100%)`;

  root.style.setProperty('--gradient-nav', gradient);
  root.style.setProperty('--brand-blue', DEFAULT_SITE_SETTINGS.brand_blue_color);
  root.style.setProperty('--brand-green', DEFAULT_SITE_SETTINGS.brand_green_color);

  setBrandMarkup('.nav-logo-brand', settings.brand_blue_text, settings.brand_green_text);
  setBrandMarkup('.footer-brand-name', settings.brand_blue_text, settings.brand_green_text);
  setTextIfExists('.nav-logo-tagline', settings.slogan);
  setTextIfExists('.footer-tagline', settings.slogan);
  setTextIfExists('.footer-desc', settings.footer_description);

  const footerTitles = document.querySelectorAll('.footer-brand-name');
  footerTitles.forEach(el => {
    el.classList.add('site-brand-applied');
  });

  const homeMap = {
    'collections-badge': settings.home_collections_badge,
    'collections-title': settings.home_collections_title,
    'products-banner-title': settings.products_banner_title,
    'products-banner-subtitle': settings.products_banner_subtitle,
    'temple-section-title': settings.temple_section_title,
    'temple-section-subtitle': settings.temple_section_subtitle,
    'festival-section-title': settings.festival_section_title,
    'festival-section-subtitle': settings.festival_section_subtitle,
    'decor-section-title': settings.home_decor_section_title,
    'decor-section-subtitle': settings.home_decor_section_subtitle,
    'embroidery-section-title': settings.embroidery_section_title,
    'embroidery-section-subtitle': settings.embroidery_section_subtitle,
    'metal-section-title': settings.metal_embroidery_section_title,
    'metal-section-subtitle': settings.metal_embroidery_section_subtitle
  };

  Object.entries(homeMap).forEach(([id, value]) => {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  });

  setImageIfExists('category-image-temple', settings.temple_card_image);
  setImageIfExists('category-image-festival', settings.festival_card_image);
  setImageIfExists('category-image-decor', settings.home_decor_card_image);
  setImageIfExists('category-image-embroidery', settings.embroidery_card_image);
  setImageIfExists('category-image-metal', settings.metal_embroidery_card_image);

  return settings;
}

async function loadAndApplySiteSettings() {
  const settings = await getSiteSettings();
  applySiteSettings(settings);
  return settings;
}

const AUTH_STORAGE_KEY = 'belimaa_auth';
let authApiBasePromise = null;
const authState = {
  mode: 'login',
  method: 'email',
  otpRequested: false,
  otpPhone: '',
  devOtp: ''
};

function getAuthApiCandidates() {
  const candidates = [];
  const isLocalHost = window.location.protocol === 'file:' || ['localhost', '127.0.0.1'].includes(window.location.hostname);
  if (isLocalHost) {
    candidates.push('http://localhost:5000/api');
    candidates.push('http://127.0.0.1:5000/api');
  }
  if (window.location.origin && window.location.origin.startsWith('http')) {
    candidates.push(window.location.origin.replace(/\/$/, '') + '/api');
  }
  candidates.push('/api');
  return [...new Set(candidates)];
}

async function resolveAuthApiBase() {
  if (authApiBasePromise) return authApiBasePromise;
  authApiBasePromise = (async () => {
    for (const base of getAuthApiCandidates()) {
      try {
        const res = await fetch(`${base}/health`, { method: 'GET' });
        if (res.ok) return base;
      } catch (e) {
        console.warn('Auth API candidate failed:', base, e);
      }
    }
    return getAuthApiCandidates()[0];
  })();
  return authApiBasePromise;
}

async function authFetch(path, options = {}) {
  const base = await resolveAuthApiBase();
  const session = Auth.getSession();
  const headers = {
    'Content-Type': 'application/json',
    ...(session?.token ? { Authorization: `Bearer ${session.token}` } : {}),
    ...(options.headers || {})
  };

  const normalizedPath = String(path || '').replace(/^\/+/, '');
  const res = await fetch(`${base}/${normalizedPath}`, {
    ...options,
    headers
  });

  let data = null;
  try {
    data = await res.json();
  } catch (e) {
    data = null;
  }

  if (!res.ok) {
    throw new Error(data?.message || `HTTP ${res.status}`);
  }

  return data;
}

const Auth = {
  getSession() {
    try {
      return JSON.parse(localStorage.getItem(AUTH_STORAGE_KEY) || 'null');
    } catch {
      return null;
    }
  },

  saveSession(session) {
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(session));
  },

  clearSession() {
    localStorage.removeItem(AUTH_STORAGE_KEY);
  },

  currentUser() {
    return this.getSession()?.user || null;
  },

  isLoggedIn() {
    return !!this.getSession()?.token;
  },

  async register(payload) {
    const data = await authFetch('auth/register', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.saveSession(data);
    return data;
  },

  async login(payload) {
    const data = await authFetch('auth/login', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.saveSession(data);
    return data;
  },

  async requestOtp(payload) {
    return authFetch('auth/request-otp', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  async verifyOtp(payload) {
    const data = await authFetch('auth/verify-otp', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    this.saveSession(data);
    return data;
  },

  async social(provider) {
    return authFetch(`/auth/oauth/${provider}`);
  },

  async me() {
    return authFetch('auth/me');
  },

  logout() {
    this.clearSession();
    updateAuthUI();
    showToast('Logged out successfully', 'success');
  },

  async sync() {
    if (!this.isLoggedIn()) {
      updateAuthUI();
      return null;
    }

    try {
      const data = await this.me();
      const session = this.getSession();
      this.saveSession({ ...session, user: data.user });
      updateAuthUI();
      return data.user;
    } catch (e) {
      this.clearSession();
      updateAuthUI();
      return null;
    }
  }
};

function injectAuthUI() {
  const navRight = document.querySelector('.nav-right');
  if (navRight && !document.getElementById('auth-actions')) {
    const authActions = document.createElement('div');
    authActions.id = 'auth-actions';
    authActions.className = 'auth-actions';
    const hamburger = navRight.querySelector('#nav-hamburger');
    navRight.insertBefore(authActions, hamburger || null);
  }

  const mobile = document.getElementById('nav-mobile');
  if (mobile && !document.getElementById('auth-mobile-actions')) {
    const mobileActions = document.createElement('div');
    mobileActions.id = 'auth-mobile-actions';
    mobileActions.className = 'auth-mobile-actions';
    mobile.appendChild(mobileActions);
  }
}

function injectAuthModal() {
  if (document.getElementById('auth-modal')) return;

  const wrapper = document.createElement('div');
  wrapper.innerHTML = `
    <div class="modal-overlay" id="auth-modal">
      <div class="modal-box auth-modal-box auth-modal-shell">
        <button class="modal-close" type="button" onclick="closeAuthModal()">×</button>
        <div class="auth-layout">
          <div class="auth-side-panel">
            <div class="auth-side-badge">Belimaa Login</div>
            <div class="auth-brand-lockup">
              <div class="auth-brand-mark">🪔</div>
              <div>
                <div class="auth-brand-name">Belimaa</div>
                <div class="auth-brand-copy">Handcrafted devotion, easier shopping.</div>
              </div>
            </div>
            <h3>Login like Flipkart, styled for Belimaa.</h3>
            <p>Access your orders, saved cart, wishlist and faster checkout with a clean split-screen login experience built in Belimaa branding.</p>
            <div class="auth-side-points">
              <div>Track orders and reorder quickly</div>
              <div>Save your cart and favorite products</div>
              <div>Phone OTP and email login in one place</div>
            </div>
          </div>
          <div class="auth-main-panel">
            <div class="auth-modal-head">
              <div class="modal-title" id="auth-modal-title">Login</div>
              <div class="auth-modal-subtitle" id="auth-modal-subtitle">Get access to your Belimaa account, orders and saved items.</div>
            </div>
            <div class="auth-tabs">
              <button class="auth-tab active" id="auth-tab-login" type="button" onclick="switchAuthMode('login')">Login</button>
              <button class="auth-tab" id="auth-tab-signup" type="button" onclick="switchAuthMode('signup')">Sign Up</button>
            </div>
            <div class="auth-methods">
              <button class="auth-method active" id="auth-method-email" type="button" onclick="switchAuthMethod('email')">Email</button>
              <button class="auth-method" id="auth-method-phone" type="button" onclick="switchAuthMethod('phone')">Phone OTP</button>
            </div>
            <div class="auth-social-grid">
              <button class="auth-social-btn google" type="button" onclick="handleSocialAuth('google')">Continue with Google</button>
              <button class="auth-social-btn facebook" type="button" onclick="handleSocialAuth('facebook')">Continue with Facebook</button>
            </div>
            <form id="auth-form" onsubmit="handleAuthSubmit(event)">
              <div class="form-group auth-name-group" id="auth-name-group" style="display:none">
                <label class="form-label">Full Name</label>
                <input type="text" class="form-control" id="auth-name" placeholder="Enter your full name">
              </div>
              <div class="form-group auth-email-group" id="auth-email-group">
                <label class="form-label">Email</label>
                <input type="email" class="form-control" id="auth-email" placeholder="Enter your email">
              </div>
              <div class="form-group auth-password-group" id="auth-password-group">
                <label class="form-label">Password</label>
                <input type="password" class="form-control" id="auth-password" placeholder="Enter your password">
              </div>
              <div class="form-group auth-phone-group" id="auth-phone-group" style="display:none">
                <label class="form-label">Phone Number</label>
                <input type="tel" class="form-control" id="auth-phone" placeholder="Enter your phone number">
              </div>
              <div class="form-group auth-otp-group" id="auth-otp-group" style="display:none">
                <label class="form-label">6-Digit OTP</label>
                <input type="text" class="form-control auth-otp-input" id="auth-otp" placeholder="Enter OTP" maxlength="6" inputmode="numeric">
              </div>
              <div class="auth-inline-note" id="auth-inline-note">Email login is active. Phone OTP is database-backed and ready for SMS gateway connection.</div>
              <button class="btn btn-primary btn-full auth-submit-btn" id="auth-submit-btn" type="submit">Login</button>
            </form>
            <div class="auth-dev-otp" id="auth-dev-otp" style="display:none"></div>
            <div class="auth-switch-copy" id="auth-switch-copy">
              New here? <button type="button" onclick="switchAuthMode('signup')">Create an account</button>
            </div>
          </div>
        </div>
      </div>
    </div>`;
  document.body.appendChild(wrapper.firstElementChild);
}

function switchAuthMode(mode) {
  authState.mode = mode;
  authState.otpRequested = false;
  authState.devOtp = '';
  renderAuthState();
}

function switchAuthMethod(method) {
  authState.method = method;
  authState.otpRequested = false;
  authState.devOtp = '';
  renderAuthState();
}

function renderAuthState() {
  const isSignup = authState.mode === 'signup';
  const isPhone = authState.method === 'phone';
  const loginTab = document.getElementById('auth-tab-login');
  const signupTab = document.getElementById('auth-tab-signup');
  const emailMethod = document.getElementById('auth-method-email');
  const phoneMethod = document.getElementById('auth-method-phone');
  const title = document.getElementById('auth-modal-title');
  const subtitle = document.getElementById('auth-modal-subtitle');
  const submit = document.getElementById('auth-submit-btn');
  const switchCopy = document.getElementById('auth-switch-copy');
  const inlineNote = document.getElementById('auth-inline-note');
  const nameGroup = document.getElementById('auth-name-group');
  const emailGroup = document.getElementById('auth-email-group');
  const passwordGroup = document.getElementById('auth-password-group');
  const phoneGroup = document.getElementById('auth-phone-group');
  const otpGroup = document.getElementById('auth-otp-group');
  const devOtp = document.getElementById('auth-dev-otp');
  const nameInput = document.getElementById('auth-name');
  const emailInput = document.getElementById('auth-email');
  const passwordInput = document.getElementById('auth-password');
  const phoneInput = document.getElementById('auth-phone');
  const otpInput = document.getElementById('auth-otp');

  if (!loginTab || !signupTab || !emailMethod || !phoneMethod || !title || !subtitle || !submit || !switchCopy || !inlineNote) return;

  loginTab.classList.toggle('active', !isSignup);
  signupTab.classList.toggle('active', isSignup);
  emailMethod.classList.toggle('active', !isPhone);
  phoneMethod.classList.toggle('active', isPhone);

  nameGroup.style.display = isSignup ? 'block' : 'none';
  emailGroup.style.display = isPhone ? 'none' : 'block';
  passwordGroup.style.display = isPhone ? 'none' : 'block';
  phoneGroup.style.display = isPhone ? 'block' : 'block';
  otpGroup.style.display = isPhone && authState.otpRequested ? 'block' : 'none';
  phoneGroup.style.display = isPhone ? 'block' : 'none';

  if (nameInput) nameInput.required = isSignup;
  if (emailInput) emailInput.required = !isPhone;
  if (passwordInput) passwordInput.required = !isPhone;
  if (phoneInput) phoneInput.required = isPhone;
  if (otpInput) otpInput.required = isPhone && authState.otpRequested;

  if (isPhone) {
    title.textContent = isSignup ? 'Signup with Phone OTP' : 'Login with Phone OTP';
    subtitle.textContent = 'Use your mobile number for a quick secure sign in, just like a modern e-commerce checkout.';
    submit.textContent = authState.otpRequested ? 'Verify OTP' : 'Request OTP';
    inlineNote.textContent = authState.otpRequested
      ? `OTP sent to ${authState.otpPhone || 'your phone'}${authState.devOtp ? ' - dev OTP shown below for local testing.' : '.'}`
      : 'We will create or verify your account against the database using your phone number.';
  } else {
    title.textContent = isSignup ? 'Create Your Belimaa Account' : 'Login';
    subtitle.textContent = 'Get access to your Belimaa account, orders and saved items.';
    submit.textContent = isSignup ? 'Create Account' : 'Login';
    inlineNote.textContent = 'Use email or phone OTP to continue. Your account is stored securely for future shopping and admin access.';
  }

  switchCopy.innerHTML = isSignup
    ? 'Already have an account? <button type="button" onclick="switchAuthMode(\'login\')">Login here</button>'
    : 'New here? <button type="button" onclick="switchAuthMode(\'signup\')">Create an account</button>';

  if (devOtp) {
    devOtp.style.display = authState.devOtp ? 'block' : 'none';
    devOtp.textContent = authState.devOtp ? `Dev OTP for testing: ${authState.devOtp}` : '';
  }

  const form = document.getElementById('auth-form');
  if (form) {
    form.dataset.mode = authState.mode;
    form.dataset.method = authState.method;
  }
}

function openAuthModal(mode = 'login', method = 'email') {
  injectAuthModal();
  authState.mode = mode;
  authState.method = method;
  authState.otpRequested = false;
  authState.devOtp = '';
  renderAuthState();
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.add('open');
}

function closeAuthModal() {
  const modal = document.getElementById('auth-modal');
  if (modal) modal.classList.remove('open');
}

async function handleSocialAuth(provider) {
  try {
    const data = await Auth.social(provider);
    showToast(data.message || `${provider} login is not configured yet.`, 'error');
  } catch (e) {
    showToast(e.message || `${provider} login is not configured yet.`, 'error');
  }
}

async function handleAuthSubmit(event) {
  event.preventDefault();
  const mode = authState.mode;
  const method = authState.method;
  const submit = document.getElementById('auth-submit-btn');

  if (submit) {
    submit.disabled = true;
    submit.textContent = method === 'phone'
      ? (authState.otpRequested ? 'Verifying...' : 'Sending OTP...')
      : (mode === 'signup' ? 'Creating...' : 'Logging in...');
  }

  try {
    if (method === 'phone') {
      const phone = document.getElementById('auth-phone')?.value.trim();
      const name = document.getElementById('auth-name')?.value.trim();

      if (!authState.otpRequested) {
        const data = await Auth.requestOtp({ phone, name });
        authState.otpRequested = true;
        authState.otpPhone = data.phone || phone;
        authState.devOtp = data.devOtp || '';
        showToast('OTP generated successfully', 'success');
        renderAuthState();
      } else {
        const otp = document.getElementById('auth-otp')?.value.trim();
        await Auth.verifyOtp({ phone, otp, name });
        updateAuthUI();
        closeAuthModal();
        document.getElementById('auth-form')?.reset();
        authState.otpRequested = false;
        authState.devOtp = '';
        showToast('Phone login successful', 'success');
      }
    } else {
      const payload = {
        email: document.getElementById('auth-email')?.value.trim(),
        password: document.getElementById('auth-password')?.value || ''
      };

      if (mode === 'signup') {
        payload.name = document.getElementById('auth-name')?.value.trim();
        await Auth.register(payload);
        showToast('Account created successfully', 'success');
      } else {
        await Auth.login(payload);
        showToast('Logged in successfully', 'success');
      }

      updateAuthUI();
      closeAuthModal();
      document.getElementById('auth-form')?.reset();
      authState.otpRequested = false;
      authState.devOtp = '';
    }
  } catch (e) {
    showToast(e.message || 'Authentication failed', 'error');
  }

  if (submit) {
    renderAuthState();
    submit.disabled = false;
  }
}

function renderAuthButtons(user) {
  if (!user) {
    return `
      <button type="button" class="nav-auth-btn nav-auth-ghost" onclick="window.location.href='login.html?mode=login&method=email'">Login</button>
      <button type="button" class="nav-auth-btn nav-auth-solid" onclick="window.location.href='login.html?mode=signup&method=email'">Sign Up</button>`;
  }

  const adminLink = user.role === 'admin' ? '<a href="admin.html" class="nav-auth-btn nav-auth-ghost">Admin</a>' : '';
  return `
    <span class="nav-user-pill">Hi, ${user.name || 'User'}</span>
    ${adminLink}
    <button type="button" class="nav-auth-btn nav-auth-solid" onclick="Auth.logout()">Logout</button>`;
}

function updateAuthUI() {
  const user = Auth.currentUser();
  const desktop = document.getElementById('auth-actions');
  const mobile = document.getElementById('auth-mobile-actions');

  if (desktop) desktop.innerHTML = renderAuthButtons(user);
    if (mobile) {
      mobile.innerHTML = user
        ? `<div class="nav-mobile-auth-copy">Signed in as ${user.name || user.email || user.phone}</div>${renderAuthButtons(user)}`
        : `${renderAuthButtons(user)}<button type="button" class="nav-auth-btn nav-auth-ghost" onclick="window.location.href='login.html?mode=login&method=phone'">Phone OTP</button>`;
    }
  }

window.openAuthModal = openAuthModal;
window.closeAuthModal = closeAuthModal;
window.switchAuthMode = switchAuthMode;
window.switchAuthMethod = switchAuthMethod;
window.handleAuthSubmit = handleAuthSubmit;
window.handleSocialAuth = handleSocialAuth;
window.Auth = Auth;
/* ---- Cart (localStorage) ---- */
const Cart = {
  key: 'belimaa_cart',
  
  get() {
    try { return JSON.parse(localStorage.getItem(this.key) || '[]'); }
    catch { return []; }
  },
  
  save(items) {
    localStorage.setItem(this.key, JSON.stringify(items));
    this.updateBadge();
    window.dispatchEvent(new CustomEvent('cart-updated', { detail: items }));
  },
  
  add(product, qty = 1) {
    const items = this.get();
    const idx = items.findIndex(i => i.id === product.id);
    if (idx >= 0) {
      items[idx].qty = (items[idx].qty || 1) + qty;
    } else {
      items.push({
        id: product.id,
        name: product.name,
        category: product.category,
        price: product.price,
        image_url: product.image_url,
        qty: qty
      });
    }
    this.save(items);
    showToast(`"${product.name}" added to cart! 🛒`, 'success');
  },
  
  remove(productId) {
    const items = this.get().filter(i => i.id !== productId);
    this.save(items);
  },
  
  update(productId, qty) {
    if (qty < 1) { this.remove(productId); return; }
    const items = this.get();
    const idx = items.findIndex(i => i.id === productId);
    if (idx >= 0) { items[idx].qty = qty; this.save(items); }
  },
  
  total() {
    return this.get().reduce((sum, i) => sum + (i.price * i.qty), 0);
  },
  
  count() {
    return this.get().reduce((sum, i) => sum + (i.qty || 1), 0);
  },
  
  clear() {
    localStorage.removeItem(this.key);
    this.updateBadge();
  },
  
  updateBadge() {
    const count = this.count();
    document.querySelectorAll('.cart-count-badge, .nav-badge').forEach(el => {
      el.textContent = count;
      el.style.display = count > 0 ? 'flex' : 'none';
    });
    const floatCount = document.querySelector('.cart-float-count');
    if (floatCount) {
      floatCount.textContent = count;
      floatCount.style.display = count > 0 ? 'flex' : 'none';
    }
  }
};

/* ---- Wishlist (localStorage) ---- */
const Wishlist = {
  key: 'belimaa_wishlist',
  
  get() {
    try { return JSON.parse(localStorage.getItem(this.key) || '[]'); }
    catch { return []; }
  },
  
  has(id) { return this.get().includes(id); },
  
  toggle(product) {
    const items = this.get();
    const idx = items.indexOf(product.id);
    if (idx >= 0) {
      items.splice(idx, 1);
      showToast('Removed from wishlist');
    } else {
      items.push(product.id);
      showToast('Added to wishlist ❤️', 'success');
    }
    localStorage.setItem(this.key, JSON.stringify(items));
    return idx < 0;
  }
};

/* ---- Toast ---- */
let toastTimer;
function showToast(message, type = '') {
  const toast = document.getElementById('toast');
  if (!toast) return;
  toast.textContent = message;
  toast.className = 'show' + (type ? ' ' + type : '');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toast.className = ''; }, 2800);
}

/* ---- Format Currency ---- */
function formatPrice(n) {
  return '₹' + Number(n).toLocaleString('en-IN');
}

/* ---- Discount Percentage ---- */
function discountPct(original, current) {
  if (!original || original <= current) return 0;
  return Math.round((1 - current / original) * 100);
}

/* ---- Truncate Text ---- */
function truncate(str, n) {
  if (!str) return '';
  return str.length > n ? str.slice(0, n - 1) + '…' : str;
}

/* ---- Build Product Card HTML ---- */
function buildProductCard(product) {
  const disc = discountPct(product.original_price, product.price);
  const inWishlist = Wishlist.has(product.id);
  return `
    <div class="product-card" data-id="${product.id}">
      <div class="product-card-img-wrap">
        <a href="product-detail.html?id=${product.id}">
          <img src="${normalizeAssetPath(product.image_url) || 'https://placehold.co/400x400/e8f4fb/2a7fba?text=Belimaa'}" 
               alt="${product.name}" loading="lazy"
               onerror="this.src='https://placehold.co/400x400/e8f4fb/2a7fba?text=Belimaa'">
        </a>
        ${product.featured ? '<span class="product-card-badge badge-featured">Featured</span>' : ''}
        ${disc >= 10 ? `<span class="product-card-badge badge-sale" style="top:auto;bottom:52px">${disc}% OFF</span>` : ''}
        <button class="product-card-wishlist ${inWishlist ? 'active' : ''}" 
                title="Wishlist" onclick="toggleWishlist(this, ${JSON.stringify(product).replace(/"/g, '&quot;')})">
          ${inWishlist ? '❤️' : '🤍'}
        </button>
        <div class="product-card-actions-hover">
          <button class="btn btn-ghost btn-sm" style="flex:1;border-radius:6px;font-size:0.78rem"
                  onclick="window.location='product-detail.html?id=${product.id}'">👁 View</button>
          <button class="product-card-add-btn" style="border-radius:6px;flex:1;font-size:0.78rem"
                  onclick="addToCart(this,${JSON.stringify(product).replace(/"/g, '&quot;')})">+ Cart</button>
        </div>
      </div>
      <div class="product-card-info">
        <div class="product-card-category">${product.category || ''}</div>
        <a href="product-detail.html?id=${product.id}" class="product-card-name">${product.name}</a>
        <div class="product-card-price">
          <span class="price-current">${formatPrice(product.price)}</span>
          ${product.original_price > product.price ? `<span class="price-original">${formatPrice(product.original_price)}</span>` : ''}
          ${disc >= 10 ? `<span class="price-discount">${disc}% off</span>` : ''}
        </div>
        <button class="product-card-add-btn" 
                onclick="addToCart(this,${JSON.stringify(product).replace(/"/g, '&quot;')})">
          🛒 Add to Cart
        </button>
      </div>
    </div>
  `;
}

/* ---- Render Products into Grid ---- */
function renderProductGrid(containerId, products) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!products || products.length === 0) {
    el.innerHTML = `<div class="empty-state" style="grid-column:1/-1">
      <div class="empty-icon">🔍</div>
      <div class="empty-title">No products found</div>
      <p class="empty-sub">Try different filters or check back later.</p>
    </div>`;
    return;
  }
  el.innerHTML = products.map(buildProductCard).join('');
}

/* ---- Render Skeleton Loading ---- */
function renderSkeleton(containerId, count = 4) {
  const el = document.getElementById(containerId);
  if (!el) return;
  el.innerHTML = Array(count).fill(`
    <div class="product-card">
      <div class="skeleton" style="height:240px;border-radius:14px 14px 0 0"></div>
      <div style="padding:14px">
        <div class="skeleton" style="height:12px;width:60%;margin-bottom:8px;border-radius:6px"></div>
        <div class="skeleton" style="height:16px;margin-bottom:8px;border-radius:6px"></div>
        <div class="skeleton" style="height:16px;width:80%;margin-bottom:14px;border-radius:6px"></div>
        <div class="skeleton" style="height:36px;border-radius:20px"></div>
      </div>
    </div>
  `).join('');
}

/* ---- Add to Cart (button handler) ---- */
function addToCart(btn, product) {
  Cart.add(product);
  if (btn) {
    const orig = btn.innerHTML;
    btn.innerHTML = '✓ Added!';
    btn.style.background = '#2a9e6a';
    setTimeout(() => {
      btn.innerHTML = orig;
      btn.style.background = '';
    }, 1400);
  }
}

/* ---- Wishlist toggle ---- */
function toggleWishlist(btn, product) {
  const active = Wishlist.toggle(product);
  btn.innerHTML = active ? '❤️' : '🤍';
  btn.classList.toggle('active', active);
}

/* ---- Navbar scroll effect ---- */
function initNavbar() {
  const nav = document.getElementById('navbar');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  }, { passive: true });
  
  // Hamburger
  const hbr = document.getElementById('nav-hamburger');
  const mobile = document.getElementById('nav-mobile');
  if (hbr && mobile) {
    hbr.addEventListener('click', () => mobile.classList.toggle('open'));
  }
}

/* ---- Init on DOMContentLoaded ---- */
document.addEventListener('DOMContentLoaded', async () => {
  loadAndApplySiteSettings();
  initNavbar();
  injectAuthUI();
  injectAuthModal();
  updateAuthUI();
  await Auth.sync();
  Cart.updateBadge();
  
  // Global search
  const searchForm = document.getElementById('nav-search-form');
  if (searchForm) {
    searchForm.addEventListener('submit', e => {
      e.preventDefault();
      const q = document.getElementById('nav-search-input')?.value?.trim();
      if (q) window.location.href = `products.html?search=${encodeURIComponent(q)}`;
    });
  }
  
  // Cart float button
  const floatCart = document.getElementById('cart-float-btn');
  if (floatCart) floatCart.addEventListener('click', () => { window.location.href = 'cart.html'; });
});

/* ---- Scroll section helpers ---- */
function scrollSection(trackId, dir) {
  const track = document.getElementById(trackId);
  if (!track) return;
  const amount = 260;
  track.scrollBy({ left: dir * amount, behavior: 'smooth' });
}

/* ---- URL Params helper ---- */
function getParam(key) {
  return new URLSearchParams(window.location.search).get(key) || '';
}

/* ---- Star rating HTML ---- */
function starsHtml(n) {
  return Array(5).fill(0).map((_, i) => i < n ? '★' : '☆').join('');
}



