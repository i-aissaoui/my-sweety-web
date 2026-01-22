'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  imageUrl?: string;
  stock: number;
}

const translations = {
  en: {
    subtitle: "Patisserie d'Excellence",
    all: "All",
    loading: "Unveiling our collection...",
    currency: "DA",
    available: "Available",
    out_of_stock: "Out of Stock",
    empty: "Our chefs are preparing new items for this collection.",
    footer_desc: "Experience the pinnacle of artisanal sweets. Our recipes are strictly guarded and crafted with the world's finest ingredients for the ultimate sensory journey.",
    footer_bottom: "EXCELLENCE IN EVERY BITE.",
    shop_open: "Shop is Open",
    shop_closed: "Shop is Temporarily Closed",
    refresh_menu: "Refresh Menu",
    follow_us: "Follow our Journey",
    last_updated: "Last Updated",
    sweets: "Sweets",
    cakes: "Cakes",
    pastries: "Pastries",
    chocolates: "Chocolates",
    cookies: "Cookies",
    drinks: "Drinks",
    ice_cream: "Ice Cream",
    traditional: "Traditional",
    dir: 'ltr'
  },
  fr: {
    subtitle: "Pâtisserie d'Excellence",
    all: "Tout",
    loading: "Découverte de notre collection...",
    currency: "DA",
    available: "Disponible",
    out_of_stock: "Rupture de Stock",
    empty: "Nos chefs préparent de nouvelles créations pour cette collection.",
    footer_desc: "Découvrez le summum des douceurs artisanales. Nos recettes sont jalousement gardées et élaborées avec les meilleurs ingrédients pour un voyage sensoriel ultime.",
    footer_bottom: "L'EXCELLENCE DANS CHAQUE BOUCHÉE.",
    shop_open: "La boutique est ouverte",
    shop_closed: "La boutique est temporairement fermée",
    refresh_menu: "Rafraîchir le menu",
    follow_us: "Suivez notre aventure",
    last_updated: "Mis à jour le",
    sweets: "Douceurs",
    cakes: "Gâteaux",
    pastries: "Viennoiseries",
    chocolates: "Chocolats",
    cookies: "Biscuits",
    drinks: "Boissons",
    ice_cream: "Glaces",
    traditional: "Traditionnel",
    dir: 'ltr'
  },
  ar: {
    subtitle: "إتقان في صناعة الحلويات",
    all: "الكل",
    loading: "جاري الكشف عن مجموعتنا...",
    currency: "د.ج",
    available: "متوفر",
    out_of_stock: "نفذت الكمية",
    empty: "طباخونا يجهزون أصنافاً جديدة لهذه المجموعة.",
    footer_desc: "اختبر قمة الحلويات الحرفية. وصفاتنا محمية بعناية ومصنوعة من أجود المكونات العالمية لرحلة حسية لا مثيل لها.",
    footer_bottom: "التميز في كل قمة.",
    shop_open: "المتجر مفتوح الآن",
    shop_closed: "المتجر مغلق مؤقتاً",
    refresh_menu: "تحديث القائمة",
    follow_us: "تابع رحلتنا",
    last_updated: "آخر تحديث",
    sweets: "حلويات",
    cakes: "كيك",
    pastries: "معجنات",
    chocolates: "شوكولاتة",
    cookies: "كوكيز",
    drinks: "مشروبات",
    ice_cream: "مثلجات",
    traditional: "تقليدي",
    dir: 'rtl'
  }
};

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [isOpen, setIsOpen] = useState(true);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const [lang, setLang] = useState<'en' | 'fr' | 'ar'>('en');
  const [lastUpdated, setLastUpdated] = useState<string | null>(null);

  useEffect(() => {
    const savedLang = localStorage.getItem('my-sweety-lang') as any;
    if (savedLang && translations[savedLang as keyof typeof translations]) {
      setLang(savedLang);
    } else {
      const browserLang = navigator.language.split('-')[0];
      if (browserLang === 'fr') setLang('fr');
      else if (browserLang === 'ar') setLang('ar');
      else setLang('en');
    }

    fetchMenu();
  }, []);

  async function fetchMenu() {
    setLoading(true);
    try {
      const res = await fetch('/api/menu', { cache: 'no-store' });
      const data = await res.json();
      if (data.menu) setProducts(data.menu);
      if (typeof data.isOpen !== 'undefined') setIsOpen(data.isOpen);
      if (data.timestamp) setLastUpdated(new Date(data.timestamp).toLocaleString());
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    } finally {
      setLoading(false);
    }
  }

  const changeLang = (newLang: 'en' | 'fr' | 'ar') => {
    setLang(newLang);
    localStorage.setItem('my-sweety-lang', newLang);
  };

  const t = translations[lang];
  const categories = ['all', ...Array.from(new Set(products.map(p => p.category)))];

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  return (
    <div dir={t.dir} style={{ minHeight: '100vh', padding: '1rem', textAlign: t.dir === 'rtl' ? 'right' : 'left' }}>

      {/* Shop Status Banner */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        background: isOpen ? '#D4AF37' : '#5D4037',
        color: isOpen ? '#5D4037' : '#D4AF37',
        padding: '0.4rem',
        textAlign: 'center',
        fontSize: '0.75rem',
        fontWeight: 800,
        letterSpacing: '0.1em',
        textTransform: 'uppercase',
        zIndex: 200,
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        {isOpen ? t.shop_open : t.shop_closed}
      </div>

      {/* Unified Navigation Bar */}
      <div style={{
        position: 'fixed',
        top: '2.5rem',
        left: '50%',
        transform: 'translateX(-50%)',
        width: 'calc(100% - 2rem)',
        maxWidth: '1200px',
        background: 'rgba(255, 255, 255, 0.7)',
        backdropFilter: 'blur(15px)',
        border: '1px solid rgba(212, 175, 55, 0.3)',
        borderRadius: '20px',
        padding: '0.6rem 1.2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        zIndex: 100,
        boxShadow: '0 8px 32px rgba(93, 64, 55, 0.1)',
        flexDirection: t.dir === 'rtl' ? 'row-reverse' : 'row'
      }}>
        {/* Social Icons Group */}
        <div style={{ display: 'flex', gap: '1.2rem', alignItems: 'center' }}>
          <a href="https://www.tiktok.com/@mysweety020?_r=1&_t=ZS-93Hu5NOgQvx" target="_blank" rel="noopener noreferrer" style={{ color: '#5D4037', transition: 'transform 0.2s' }} className="hover:scale-110">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
          </a>
          <a href="https://www.instagram.com/my_sweety.02?igsh=Mjk1MjlnNm1hbGcy" target="_blank" rel="noopener noreferrer" style={{ color: '#5D4037', transition: 'transform 0.2s' }} className="hover:scale-110">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
          </a>
        </div>

        {/* Right Section: Languages */}
        <div style={{ display: 'flex', gap: '0.8rem', alignItems: 'center', flexDirection: t.dir === 'rtl' ? 'row-reverse' : 'row' }}>
          <div style={{ display: 'flex', gap: '0.4rem' }}>
            {(['en', 'fr', 'ar'] as const).map((l) => (
              <button
                key={l}
                onClick={() => changeLang(l)}
                style={{
                  padding: '0.4rem 0.7rem',
                  borderRadius: '8px',
                  border: '1px solid transparent',
                  background: lang === l ? '#5D4037' : 'transparent',
                  color: lang === l ? '#D4AF37' : '#5D4037',
                  fontSize: '0.7rem',
                  fontWeight: 800,
                  textTransform: 'uppercase',
                  transition: 'all 0.2s ease'
                }}
              >
                {l}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Brand Header */}
      <header style={{
        padding: '6rem 1rem 3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center'
      }} className="animate-fade-in">
        <div style={{ position: 'relative', marginBottom: '2rem' }}>
          <div style={{
            position: 'absolute',
            inset: '-10px',
            background: 'black',
            borderRadius: '50%',
            boxShadow: '0 0 30px rgba(212, 175, 55, 0.3)',
            zIndex: 0
          }} />
          <div style={{
            position: 'absolute',
            inset: '-6px',
            border: '2px solid #D4AF37',
            borderRadius: '50%',
            zIndex: 1
          }} />
          <Image
            src="/logo.png"
            alt="My Sweety"
            width={150}
            height={150}
            className="animate-float"
            style={{ borderRadius: '50%', position: 'relative', zIndex: 2 }}
          />
        </div>
        <h1 style={{
          fontFamily: "'Playfair Display', serif",
          fontSize: 'clamp(3.5rem, 12vw, 5.5rem)',
          lineHeight: 1.1,
          marginBottom: '0.75rem',
          color: '#5D4037'
        }}>
          MY <span style={{ color: '#D4AF37' }}>Sweety</span>
        </h1>
        <p style={{
          color: 'var(--text-light)',
          fontSize: '1rem',
          fontWeight: 400,
          letterSpacing: '0.4em',
          textTransform: 'uppercase',
          paddingLeft: lang === 'ar' ? '0' : '0.4em',
          paddingRight: lang === 'ar' ? '0.4em' : '0'
        }}>
          {t.subtitle}
        </p>

      </header>

      {/* Category Bar */}
      <nav style={{
        maxWidth: '900px',
        margin: '0 auto 5rem',
        display: 'flex',
        justifyContent: 'center',
        gap: '1rem',
        flexWrap: 'wrap',
        padding: '0 1rem'
      }} className="animate-fade-in">
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            style={{
              padding: '0.7rem 2.2rem',
              borderRadius: '12px',
              border: '1px solid #D4AF37',
              background: activeCategory === cat ? '#5D4037' : 'transparent',
              color: activeCategory === cat ? '#D4AF37' : '#5D4037',
              fontWeight: 600,
              fontSize: '0.85rem',
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              boxShadow: activeCategory === cat ? '0 10px 20px rgba(93, 64, 55, 0.15)' : 'none'
            }}
          >
            {cat === 'all' ? t.all : (t[cat as keyof typeof t] || cat)}
          </button>
        ))}
      </nav>

      {/* Menu Grid */}
      <main style={{ maxWidth: '1400px', margin: '0 auto', paddingBottom: '8rem' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '5rem', color: '#5D4037', opacity: 0.6 }}>{t.loading}</div>
        ) : (
          <>
            {/* Unified Grid View (Reverted per user request) */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
              gap: '4rem 2.5rem',
              padding: '1rem',
              opacity: isOpen ? 1 : 0.5,
              filter: isOpen ? 'none' : 'grayscale(0.5)'
            }}>
              {filteredProducts.map((p, idx) => (
                <ProductCard key={p.id} p={p} t={t} isOpen={isOpen} idx={idx} />
              ))}
            </div>

            {!loading && filteredProducts.length === 0 && (
              <div style={{ textAlign: 'center', padding: '6rem 2rem' }}>
                <h2 style={{ fontSize: '2rem', opacity: 0.3, color: '#5D4037' }}>{t.empty}</h2>
              </div>
            )}
          </>
        )}
      </main>

      {/* Styled Footer */}
      <footer style={{
        padding: '5rem 2rem',
        textAlign: 'center',
        background: '#1A1A1A',
        color: '#D4AF37',
        borderRadius: '40px 40px 0 0',
        margin: '0 -1rem -1rem -1rem'
      }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.5rem', marginBottom: '1rem' }}>MY Sweety</h2>
        <div style={{
          width: '50px',
          height: '2px',
          background: '#D4AF37',
          margin: '0 auto 2rem'
        }} />

        {/* Social Media Links */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '0.9rem', color: '#D4AF37', textTransform: 'uppercase', letterSpacing: '0.2em', marginBottom: '1.5rem', opacity: 0.8 }}>{t.follow_us}</h3>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
            <a href="https://www.tiktok.com/@mysweety020?_r=1&_t=ZS-93Hu5NOgQvx" target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37', transition: 'transform 0.2s' }} className="hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" /></svg>
            </a>
            <a href="https://www.instagram.com/my_sweety.02?igsh=Mjk1MjlnNm1hbGcy" target="_blank" rel="noopener noreferrer" style={{ color: '#D4AF37', transition: 'transform 0.2s' }} className="hover:scale-110">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
          </div>
        </div>

        <p style={{ opacity: 0.6, fontSize: '0.9rem', maxWidth: '600px', margin: '0 auto', lineHeight: 2 }}>
          {t.footer_desc}
        </p>

        {lastUpdated && (
          <p style={{
            fontSize: '0.7rem',
            color: '#D4AF37',
            marginTop: '2.5rem',
            letterSpacing: '0.1em',
            textTransform: 'uppercase',
            opacity: 0.7,
            fontWeight: 600
          }}>
            {t.last_updated}: {lastUpdated}
          </p>
        )}

        <p style={{ marginTop: '2rem', opacity: 0.4, fontSize: '0.8rem' }}>
          &copy; 2026 MY SWEETY. {t.footer_bottom}
        </p>
      </footer>
    </div>
  );
}

// Extracted ProductCard Component for cleaner code
function ProductCard({ p, t, isOpen, idx }: { p: Product, t: any, isOpen: boolean, idx: number }) {
  return (
    <div
      className="luxury-card animate-fade-in"
      style={{
        animationDelay: `${idx * 0.1}s`,
        display: 'flex',
        flexDirection: 'column',
        padding: '1.2rem'
      }}
    >
      {/* Product Image Container */}
      <div style={{
        position: 'relative',
        height: '320px',
        width: '100%',
        borderRadius: '20px',
        overflow: 'hidden',
        background: '#FDFDFD',
        marginBottom: '1.8rem'
      }}>
        {(p.imageUrl || (p as any).imagePath) ? (
          <img
            src={p.imageUrl || (p as any).imagePath}
            alt={p.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', filter: p.stock <= 0 ? 'grayscale(0.8)' : 'none' }}
            onError={(e) => {
              console.error(`Failed to load image for ${p.name}`);
              e.currentTarget.style.display = 'none';
              // Could show placeholder here if needed
            }}
          />
        ) : (
          <div style={{
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '4.5rem',
            background: 'linear-gradient(135deg, #F9F9F9, #F0F0F0)',
            color: '#E0E0E0'
          }}>
            🧁
          </div>
        )}
        {/* Out of Stock Label */}
        {p.stock <= 0 && (
          <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-10deg)',
            background: '#5D4037',
            color: '#D4AF37',
            padding: '0.5rem 1.5rem',
            fontSize: '1rem',
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.1em',
            boxShadow: '0 5px 15px rgba(0,0,0,0.3)',
            border: '2px solid #D4AF37',
            zIndex: 10
          }}>
            {t.out_of_stock}
          </div>
        )}

        {/* Category Badge */}
        <div style={{
          position: 'absolute',
          top: '15px',
          [t.dir === 'rtl' ? 'right' : 'left']: '15px',
          padding: '0.4rem 1.2rem',
          background: 'rgba(0,0,0,0.8)',
          color: '#D4AF37',
          borderRadius: '8px',
          fontSize: '0.7rem',
          fontWeight: 800,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          backdropFilter: 'blur(10px)',
          border: '1px solid rgba(212, 175, 55, 0.3)'
        }}>
          {p.category}
        </div>
      </div>

      {/* Product Details */}
      <div style={{ padding: '0 0.5rem 0.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
        <h3 style={{
          fontSize: '1.7rem',
          marginBottom: '1.5rem',
          fontFamily: "'Playfair Display', serif",
          color: '#5D4037',
          fontWeight: 700
        }}>
          {p.name}
        </h3>

        <div style={{
          marginTop: 'auto',
          paddingTop: '1.5rem',
          borderTop: '1px solid rgba(212, 175, 55, 0.1)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{
              fontSize: '2.2rem',
              fontWeight: 300,
              color: '#5D4037',
              lineHeight: 1,
              fontFamily: "'Outfit', sans-serif"
            }}>
              {p.price} <small style={{ fontSize: '0.8rem', fontWeight: 600, color: '#D4AF37' }}>{t.currency}</small>
            </span>
          </div>

          <div style={{
            padding: '0.5rem 1.2rem',
            background: p.stock <= 0 ? '#A1887F' : '#5D4037',
            borderRadius: '8px',
            color: '#D4AF37',
            fontSize: '0.75rem',
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.1em'
          }}>
            {p.stock <= 0 ? t.out_of_stock : (isOpen ? t.available : t.shop_closed)}
          </div>
        </div>
      </div>
    </div>
  );
}
