'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';

// API configuration
const API_URL = '';

interface Product {
  id: string;
  name: string;
  price: number;
  category: string;
  tenantId: string;
  image: string;
  rating: number;
  featured: boolean;
}

interface Tenant {
  id: string;
  name: string;
  logo: string;
  category: string;
  rating: number;
  bannerGradient: string;
}

interface Order {
  id: string;
  tenant_id: string;
  order_number: string;
  customer_id: string;
  total_amount: number;
  currency: string;
  status: string;
  created_at: string;
}

export default function MarketplacePage() {
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';

  const [selectedTenantId, setSelectedTenantId] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [cartCount, setCartCount] = useState<number>(0);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  // Dynamic database-driven states
  const [tenants, setTenants] = useState<Tenant[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loadingInitial, setLoadingInitial] = useState<boolean>(true);
  const [initialError, setInitialError] = useState<string | null>(null);

  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);
  const [ordersError, setOrdersError] = useState<string | null>(null);

  const categories = ['all', 'Engine Parts', 'Brakes & Suspension', 'Exhaust Systems', 'Exterior & Body', 'Interior Accessories'];

  // Filtered Products now simply returns products since Meilisearch filters server-side
  const filteredProducts = products;

  const activeTenantInfo = useMemo(() => {
    return tenants.find(t => t.id === selectedTenantId);
  }, [tenants, selectedTenantId]);

  // Translate seller names
  const translateTenantName = (name: string, loc: any) => {
    if (loc !== 'ar') return name;
    const map: Record<string, string> = {
      'Luxury Parts Co': 'شركة قطع الغيار الفاخرة',
      'Performance Motors': 'أداء المحركات',
      'Riyadh OEM Parts': 'قطع غيار الرياض الأصلية'
    };
    return map[name] || name;
  };

  // 1. Fetch tenants ONLY ONCE on mount
  useEffect(() => {
    const fetchTenants = async () => {
      try {
        const tenantsRes = await fetch(`${API_URL}/api/tenants`);
        if (tenantsRes.ok) {
          const tenantsData = await tenantsRes.json();
          setTenants(Array.isArray(tenantsData) ? tenantsData : (tenantsData.tenants || []));
        }
      } catch (err) {
        console.error('Failed to load tenants', err);
      }
    };
    fetchTenants();
  }, []);

  // 2. Fetch products from Meilisearch with debounce and subtle loading state
  const [isSearching, setIsSearching] = useState(false);
  
  useEffect(() => {
    const fetchProducts = async () => {
      setIsSearching(true);
      if (products.length === 0) setLoadingInitial(true); // Only hard load on first visit
      setInitialError(null);
      
      try {
        let filterStr = [];
        if (selectedTenantId !== 'all') filterStr.push(`tenantId = '${selectedTenantId}'`);
        if (selectedCategory !== 'all') filterStr.push(`category = '${selectedCategory}'`);

        const { productsIndex } = await import('../../../lib/meilisearch');
        const searchRes = await productsIndex.search(searchQuery || '', {
          filter: filterStr,
          limit: 100
        });

        const mapped = searchRes.hits.map((p: any) => ({
          id: p.id,
          name: p.name,
          price: Number(p.price),
          category: p.category,
          tenantId: p.tenant_id || p.tenantId,
          image: p.image || '📦',
          rating: Number(p.rating),
          featured: Boolean(p.featured)
        }));
        
        setProducts(mapped as Product[]);
      } catch (err: any) {
        setInitialError(err.message || 'Failed to initialize catalog search');
      } finally {
        setLoadingInitial(false);
        setIsSearching(false);
      }
    };

    // Debounce the search by 150ms to prevent spamming Meilisearch on every keystroke
    const timer = setTimeout(() => {
      fetchProducts();
    }, 150);

    return () => clearTimeout(timer);
  }, [searchQuery, selectedCategory, selectedTenantId]);

  // Fetch live orders whenever active tenant changes
  useEffect(() => {
    if (selectedTenantId === 'all') {
      setOrders([]);
      setOrdersError(null);
      return;
    }

    const fetchOrders = async () => {
      setOrdersLoading(true);
      setOrdersError(null);
      try {
        const response = await fetch(`${API_URL}/api/orders`, {
          headers: {
            'X-Tenant-ID': selectedTenantId,
          },
        });
        if (!response.ok) {
          throw new Error(`Failed to fetch orders (${response.status} ${response.statusText})`);
        }
        const data = await response.json();
        setOrders(data.orders || []);
      } catch (err: any) {
        setOrdersError(err.message || 'Failed to connect to backend service');
      } finally {
        setOrdersLoading(false);
      }
    };

    fetchOrders();
  }, [selectedTenantId]);

  // Hero Slider State
  const [currentSlide, setCurrentSlide] = useState(0);
  const heroSlides = useMemo(() => [
    {
      image: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=2000&auto=format&fit=crop',
      titleEn: 'Your Unified Saudi Auto Services Platform',
      titleAr: 'كل ما تحتاجه لسيارتك في مكان واحد',
      descEn: 'Discover local vetted shops for new spare parts, flatbed towing (Satha), and mobile workshops across KSA.',
      descAr: 'اكتشف قطع الغيار الجديدة، خدمات السطحات الفورية، والورش المتنقلة في كافة أنحاء المملكة.'
    },
    {
      image: 'https://images.unsplash.com/photo-1605553517947-f4955a8f27ce?q=80&w=2000&auto=format&fit=crop',
      titleEn: '24/7 Flatbed Towing (Satha)',
      titleAr: 'سطحات نقل هيدروليك وعادية 24/7',
      descEn: 'Fast, secure towing service for broken or damaged vehicles within major Saudi cities or intercity transport.',
      descAr: 'نقل آمن وسريع للسيارات المصدومة أو المتعطلة داخل مدن السعودية أو بين المدن بلمسة زر.'
    },
    {
      image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=2000&auto=format&fit=crop',
      titleEn: 'Expert Mobile Mechanics & Workshops',
      titleAr: 'ميكانيكا متنقلة وورش محترفة',
      descEn: 'Get professional on-the-spot repairs, comprehensive diagnostics, and routine maintenance anytime, anywhere.',
      descAr: 'احصل على إصلاحات احترافية وتشخيص كامل للسيارة في أي وقت ومكان يناسبك.'
    },
    {
      image: 'https://images.unsplash.com/photo-1590362891991-f700445d3153?q=80&w=2000&auto=format&fit=crop',
      titleEn: 'Premium New Spare Parts',
      titleAr: 'قطع غيار جديدة وممتازة',
      descEn: 'Source the exact OEM or aftermarket parts you need directly from trusted vendors across the kingdom.',
      descAr: 'ابحث عن قطع الغيار الأصلية أو التجارية مباشرة من أفضل الموردين المعتمدين.'
    }
  ], []);

  useEffect(() => {
    if (selectedTenantId !== 'all') return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % heroSlides.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [selectedTenantId, heroSlides.length]);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-white text-slate-900 font-sans antialiased overflow-x-hidden">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/90 border-b border-slate-200 transition-all duration-300 shadow-sm">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img src="/logo.png?v=3" alt="Parto Auto Spare Parts" className="h-10 w-auto rounded" />
          </div>

          {/* Search bar */}
          <div className="flex-1 max-w-md hidden md:block relative">
            <input
              type="text"
              placeholder="Search products, brands, categories..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-100 border border-slate-300 rounded-full px-4 py-2 text-sm text-slate-800 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors pr-10"
            />
            {isSearching && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
              </div>
            )}
            {!isSearching && searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                ✕
              </button>
            )}
          </div>

          <div className="flex items-center gap-1 md:gap-2">
            {/* Consumer Links */}
            {/* 
            <button
              onClick={() => router.push(`/${locale}/tashleeh`)}
              className="hidden lg:flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            >
              {locale === 'ar' ? 'قطع غيار تشليح' : 'Tashleeh Parts'}
            </button>
            */}
            <button
              onClick={() => router.push(`/${locale}/towing`)}
              className="hidden lg:flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            >
              {locale === 'ar' ? 'طلب سطحة' : 'Tow Truck'}
            </button>
            <button
              onClick={() => router.push(`/${locale}/workshop`)}
              className="hidden lg:flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            >
              {locale === 'ar' ? 'ورشة متنقلة' : 'Mobile Mechanic'}
            </button>

            <div className="hidden lg:block w-px h-6 bg-slate-200 mx-2"></div>

            {/* Vendor Links */}
            <button
              onClick={() => router.push(`/${locale}/register`)}
              className="hidden md:flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            >
              {locale === 'ar' ? 'سجل كبائع' : 'Become a Vendor'}
            </button>
            <button
              onClick={() => router.push(`/${locale}/portal`)}
              className="hidden md:flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            >
              {locale === 'ar' ? 'لوحة البائع' : 'Vendor Portal'}
            </button>
            <button
              onClick={() => router.push(`/${locale}/admin`)}
              className="hidden md:flex items-center justify-center px-4 py-2 text-sm font-semibold text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            >
              {locale === 'ar' ? 'لوحة المسؤول' : 'Admin'}
            </button>

            {/* Language Switcher */}
            <button
              onClick={() => {
                const newLocale = locale === 'ar' ? 'en' : 'ar';
                const currentPath = window.location.pathname;
                const newPath = currentPath.replace(`/${locale}`, `/${newLocale}`);
                router.push(newPath);
              }}
              className="flex items-center justify-center px-4 py-2 text-sm font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-all ml-2"
            >
              {locale === 'ar' ? 'EN' : 'عربي'}
            </button>

            {/* Notification Bell */}
            <NotificationBell />

            {/* Cart Icon */}
            <div className="relative cursor-pointer p-2 rounded-full hover:bg-slate-100 transition-colors" onClick={() => setCartCount(0)}>
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center animate-pulse">
                  {cartCount}
                </span>
              )}
            </div>

            {/* User Profile Mock */}
            <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-500 to-pink-500 font-bold text-sm text-white cursor-pointer ml-1 hover:opacity-90 transition-opacity shadow-sm">
              JD
            </div>
          </div>
        </div>
      </header>

      {/* Dynamic Tenant Banner / Hero Slider Section (FULL WIDTH) */}
      <section className={`relative w-full overflow-hidden transition-all duration-500 flex flex-col justify-center min-h-[50vh] md:min-h-[60vh] ${activeTenantInfo ? 'bg-gradient-to-r ' + activeTenantInfo.bannerGradient : 'bg-slate-950'}`}>
        {!activeTenantInfo && (
          <>
            {heroSlides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${index === currentSlide ? 'opacity-100' : 'opacity-0'}`}
              >
                <div className="absolute inset-0 bg-slate-950/60 z-10"></div>
                <img src={slide.image} alt="Hero Background" className="absolute inset-0 w-full h-full object-cover object-center" />
              </div>
            ))}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-900/40 to-transparent z-10 opacity-90"></div>
          </>
        )}
        
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-white/10 via-transparent to-transparent opacity-60 z-10 pointer-events-none"></div>
        
        <div className="relative z-20 w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 flex flex-col gap-4">
          {activeTenantInfo ? (
            <>
              <div className="flex items-center gap-4">
                <span className="text-5xl md:text-6xl p-3 bg-slate-950/60 backdrop-blur-md rounded-2xl border border-white/10 shadow-inner">
                  {activeTenantInfo.logo}
                </span>
                <div>
                  <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase">Featured Tenant</span>
                  <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight">{activeTenantInfo.name}</h1>
                </div>
              </div>
              <p className="text-lg md:text-xl text-indigo-100/90 font-medium max-w-2xl mt-2">
                Discover exclusive, premium curation from our premier vendor in {activeTenantInfo.category}.
              </p>
              <div className="flex items-center gap-2 mt-4">
                <span className="text-amber-400 text-xl">★</span>
                <span className="text-base font-semibold text-white">{activeTenantInfo.rating} Tenant Rating</span>
              </div>
            </>
          ) : (
            <div className="transition-all duration-700 ease-out transform translate-y-0 opacity-100 min-h-[180px] md:min-h-[200px]">
              <span className="inline-block self-start mb-4 px-4 py-1.5 text-xs font-bold tracking-wider text-indigo-200 bg-indigo-900/60 backdrop-blur-sm border border-indigo-500/50 rounded-full shadow-lg">
                {locale === 'ar' ? 'سوق الخدمات وقطع غيار السيارات الأول بالمملكة' : 'SAUDI ARABIA\'S PREMIER AUTOMOTIVE HUB'}
              </span>
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black tracking-tight text-white drop-shadow-lg leading-tight">
                {locale === 'ar' ? heroSlides[currentSlide].titleAr : heroSlides[currentSlide].titleEn}
              </h1>
              <p className="text-lg md:text-xl lg:text-2xl text-slate-200 mt-6 max-w-2xl drop-shadow-md font-medium leading-relaxed">
                {locale === 'ar' ? heroSlides[currentSlide].descAr : heroSlides[currentSlide].descEn}
              </p>
              
              {/* Slider Indicators */}
              <div className="flex gap-3 mt-10">
                {heroSlides.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setCurrentSlide(i)}
                    className={`h-2 rounded-full transition-all duration-500 ${i === currentSlide ? 'w-10 bg-indigo-500 shadow-[0_0_10px_rgba(99,102,241,0.8)]' : 'w-2 bg-white/40 hover:bg-white/70'}`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Main Container */}
      <main className="flex-1 w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 flex flex-col gap-10">

        {/* Shop By Tenant Selector */}
        <section className="flex flex-col gap-3">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>🏪</span> Shop By Tenant
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
            <button
              onClick={() => setSelectedTenantId('all')}
              className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                selectedTenantId === 'all'
                  ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10'
                  : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
              }`}
            >
              <span className="text-2xl">🌍</span>
              <span className="font-semibold text-sm">All Shops</span>
            </button>
            {tenants.map((tenant) => (
              <button
                key={tenant.id}
                onClick={() => setSelectedTenantId(tenant.id)}
                className={`p-4 rounded-2xl border flex flex-col items-center justify-center gap-2 transition-all duration-300 ${
                  selectedTenantId === tenant.id
                    ? 'bg-indigo-950/40 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/10'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                }`}
              >
                <span className="text-2xl">{tenant.logo}</span>
                <span className="font-semibold text-sm text-center truncate w-full">{translateTenantName(tenant.name, locale)}</span>
              </button>
            ))}
          </div>
        </section>

        {/* Filters and Controls */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          {/* Categories Tab */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-full text-xs font-semibold capitalize whitespace-nowrap transition-colors duration-200 ${
                  selectedCategory === category
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-900 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`}
              >
                {category === 'all' ? 'All Categories' : category}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-4">
            <span className="text-sm text-slate-400">
              Showing <span className="font-semibold text-white">{filteredProducts.length}</span> products
            </span>
          </div>
        </div>

        {/* Product Grid */}
        {filteredProducts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {filteredProducts.map((product) => {
              const tenant = tenants.find(t => t.id === product.tenantId);
              return (
                <div
                  key={product.id}
                  className="group relative bg-slate-900/50 border border-slate-800/80 rounded-2xl overflow-hidden hover:border-indigo-500/50 transition-all duration-300 flex flex-col justify-between hover:shadow-xl hover:shadow-indigo-500/5"
                >
                  <div className="relative bg-slate-950 aspect-square flex items-center justify-center text-6xl group-hover:scale-105 transition-transform duration-300 select-none overflow-hidden">
                    {product.image && product.image.startsWith('http') ? (
                      <img src={product.image} alt={product.name} className="absolute inset-0 w-full h-full object-cover" />
                    ) : (
                      product.image
                    )}
                    {product.featured && (
                      <span className="absolute top-3 right-3 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded">
                        Featured
                      </span>
                    )}
                  </div>

                  <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs text-slate-500 mb-1">
                        <span>{product.category}</span>
                        <span className="font-medium text-slate-400 flex items-center gap-0.5">
                          {tenant?.logo} {tenant ? translateTenantName(tenant.name, locale) : ''}
                        </span>
                      </div>
                      <h3 className="font-bold text-white text-base group-hover:text-indigo-400 transition-colors duration-200">
                        {product.name}
                      </h3>
                    </div>

                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xl font-extrabold text-white">
                        {locale === 'ar' ? (
                          <>{product.price} <span className="font-riyal text-2xl font-normal leading-none tracking-tight">﷼</span></>
                        ) : (
                          <><span className="font-riyal text-2xl font-normal leading-none tracking-tight">﷼</span> {product.price}</>
                        )}
                      </span>
                      <button
                        onClick={() => setCartCount(c => c + 1)}
                        className="bg-indigo-650 hover:bg-indigo-600 active:scale-95 text-white px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-20 text-center gap-3">
            <span className="text-5xl">🔍</span>
            <h3 className="text-xl font-semibold text-white">No products found</h3>
            <p className="text-slate-400 text-sm max-w-xs">
              Try modifying your search query or selecting a different category.
            </p>
          </div>
        )}

        {/* Vendor Strategy Banner */}
        <section className="mt-8 bg-gradient-to-r from-indigo-900 to-slate-900 rounded-3xl p-8 md:p-12 border border-indigo-500/30 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 pointer-events-none"></div>
          <div className="relative z-10 flex-1">
            <span className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full mb-4 border border-indigo-500/30">
              {locale === 'ar' ? 'انضم كبائع' : 'SELL ON PARTO'}
            </span>
            <h2 className="text-3xl font-black text-white mb-3">
              {locale === 'ar' ? 'عمولة 3% فقط على كل مبيعة' : 'Grow Your Business with Just a 3% Fee'}
            </h2>
            <p className="text-indigo-100/80 text-sm md:text-base max-w-2xl leading-relaxed">
              {locale === 'ar' 
                ? 'استراتيجيتنا واضحة: نهدف لدعم نمو التاجر المحلي عبر تقليل تكاليف التشغيل وتوفير وصول غير محدود لعملاء المملكة. انضم الآن وابدأ البيع بعمولة هي الأقل في السوق (3%).' 
                : 'Our platform strategy is designed for your success. Reach millions of customers across KSA with the lowest commission in the automotive industry—just a flat 3% per successful sale.'}
            </p>
          </div>
          <div className="relative z-10">
            <button
              onClick={() => router.push(`/${locale}/register`)}
              className="bg-white text-indigo-900 px-8 py-4 rounded-xl font-bold hover:bg-indigo-50 transition-all shadow-xl shadow-indigo-500/20 active:scale-95 whitespace-nowrap"
            >
              {locale === 'ar' ? 'سجل متجرك الآن' : 'Register Your Shop'}
            </button>
          </div>
        </section>

        {/* Saudi Arabia Regional Auto Directory SEO Section */}
        <section className="mt-12 border-t border-slate-900 pt-12 flex flex-col gap-6">
          <div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              {locale === 'ar' ? 'سوق صيانة السيارات وقطع الغيار المعتمد في السعودية' : 'Vetted Auto Maintenance & Spare Parts in Saudi Arabia'}
            </h2>
            <p className="text-sm text-slate-400 mt-2 leading-relaxed">
              {locale === 'ar'
                ? 'نحن نربط قائدي السيارات بأفضل مقدمي الخدمات المحترفين في الرياض، جدة، مكة المكرمة، المدينة المنورة، الدمام، والخبر. تصفح الخدمات بكل أمان وسهولة من قطع الغيار الأصلية إلى الميكانيكا والتشليح المتنقل.'
                : 'Connecting drivers with premium, certified service providers in Riyadh, Jeddah, Dammam, Mecca, Medina, Khobar, and across KSA. Find genuine OEM parts, aftermarket modifications, and top-tier mechanics.'}
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* 
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col gap-2">
              <span className="text-3xl">🚗</span>
              <h3 className="text-base font-bold text-white">
                {locale === 'ar' ? 'قطع غيار وتشليح (Tashleeh)' : 'Tashleeh & Used Spare Parts'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {locale === 'ar'
                  ? 'ابحث عن قطع الغيار المستعملة والنادرة مباشرة من تشليح الحائر بالرياض، تشليح بريمان بجدة، وكافة مراكز التشليح المعتمدة في المملكة.'
                  : 'Locate genuine used auto parts directly from Riyadh (Al-Hair), Jeddah (Briman), and Dammam tashleeh yards with verified availability.'}
              </p>
            </div>
            */}
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col gap-2">
              <span className="text-3xl">🛻</span>
              <h3 className="text-base font-bold text-white">
                {locale === 'ar' ? 'سطحات نقل هيدروليك وعادية' : 'Saudi Flatbed Towing (Satha)'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {locale === 'ar'
                  ? 'نقل آمن للسيارات المصدومة أو المتعطلة داخل مدن السعودية أو بين المدن بلمسة زر واحدة وعلى مدار الساعة.'
                  : 'Fast, secure towing service for broken or damaged vehicles within major Saudi cities or long-distance intercity transport 24/7.'}
              </p>
            </div>
            <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-2xl flex flex-col gap-2">
              <span className="text-3xl">🔋</span>
              <h3 className="text-base font-bold text-white">
                {locale === 'ar' ? 'الورشة المتنقلة وصيانة الطرق' : 'KSA Mobile Auto Workshops'}
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                {locale === 'ar'
                  ? 'خدمات الميكانيكا والكهرباء المتنقلة عند المنزل، تغيير زيت السيارة، شحن وتغيير بطاريات السيارات، وبنشر متنقل سريع.'
                  : 'Doorstep battery jumpstart, replacement, tire patching, oil changes, and comprehensive diagnostics by mobile mechanics near you.'}
              </p>
            </div>
          </div>
        </section>

        {/* Database Verification / Isolation Log Section */}
        <section className="mt-12 bg-slate-900/30 border border-slate-800 rounded-3xl p-6 sm:p-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <span>🔒</span> Database Isolation Logs (PostgreSQL RLS)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Verifies database tenant boundaries. Setting <code>app.current_tenant_id</code> restricts query scope automatically.
              </p>
            </div>
            {selectedTenantId !== 'all' && (
              <span className="text-xs font-mono bg-indigo-950 text-indigo-300 px-3 py-1 rounded-full border border-indigo-500/30">
                Tenant Context: {selectedTenantId}
              </span>
            )}
          </div>

          {selectedTenantId === 'all' ? (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2 text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-900 border-dashed">
              <span className="text-3xl">👥</span>
              <p className="text-sm font-medium">Select a specific tenant above to query live orders from the database.</p>
              <p className="text-xs text-slate-500">Only Apex Tech Labs and Luxe Attire contain database records in the seeded state.</p>
            </div>
          ) : ordersLoading ? (
            <div className="flex items-center justify-center py-12 gap-3 text-slate-400">
              <span className="animate-spin text-2xl">⏳</span>
              <span className="text-sm">Querying isolated records...</span>
            </div>
          ) : ordersError ? (
            <div className="bg-rose-950/40 border border-rose-500/30 text-rose-300 rounded-2xl p-6 flex flex-col gap-2">
              <span className="font-bold text-sm">Connection/Authorization Failure</span>
              <p className="text-xs">{ordersError}</p>
              <p className="text-[10px] text-slate-500 mt-2">
                Note: Verify that the backend stack is running locally (port 8080) or on Cloud Run and that CORS allows requests from this origin.
              </p>
            </div>
          ) : orders.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
                    <th className="pb-3 pl-4">Order ID</th>
                    <th className="pb-3">Order Number</th>
                    <th className="pb-3">Customer ID</th>
                    <th className="pb-3">Total Amount</th>
                    <th className="pb-3">Status</th>
                    <th className="pb-3 pr-4">Created At</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 font-mono">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-4 pl-4 text-slate-500 truncate max-w-[120px]" title={order.id}>
                        {order.id}
                      </td>
                      <td className="py-4 font-bold text-indigo-400">{order.order_number}</td>
                      <td className="py-4 text-slate-500 truncate max-w-[120px]" title={order.customer_id}>
                        {order.customer_id}
                      </td>
                      <td className="py-4 font-semibold text-white">
                        {order.total_amount} {order.currency}
                      </td>
                      <td className="py-4">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          order.status === 'completed' 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-amber-950 text-amber-400 border border-amber-500/20'
                        }`}>
                          {order.status}
                        </span>
                      </td>
                      <td className="py-4 pr-4 text-slate-400">
                        {new Date(order.created_at).toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-10 text-center gap-2 text-slate-400 bg-slate-950/40 rounded-2xl border border-slate-900 border-dashed">
              <span className="text-3xl">📭</span>
              <p className="text-sm font-medium">No live orders found in the database context for this tenant.</p>
              <p className="text-xs text-slate-500">Row-Level Security queries returned 0 results cleanly.</p>
            </div>
          )}
        </section>
        {/* ZATCA & VAT Compliance Section */}
        <section className="mt-12 bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row items-center gap-6 md:gap-10">
          <div className="flex-shrink-0 bg-white p-4 rounded-xl border border-slate-200">
            {/* ZATCA placeholder logo style */}
            <div className="font-bold text-center text-emerald-800 text-lg leading-tight">
              <span className="block text-sm text-emerald-600">هيئة الزكاة والضريبة والجمارك</span>
              ZATCA
            </div>
          </div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-white mb-2 flex items-center gap-2">
              <span className="text-emerald-500">✓</span> {locale === 'ar' ? 'منصة متوافقة مع الفوترة الإلكترونية (فاتورة)' : 'ZATCA E-Invoicing (FATOORAH) Compliant'}
            </h3>
            <p className="text-sm text-slate-400 leading-relaxed mb-3">
              {locale === 'ar' 
                ? 'بارتو هي منصة سعودية معتمدة تدعم متطلبات المرحلة الثانية (الربط والتكامل) من الفوترة الإلكترونية من هيئة الزكاة والضريبة والجمارك. نقوم بإصدار الفواتير الضريبية المبسطة B2C والفواتير الضريبية B2B بشكل فوري برمز استجابة سريع (QR Code) مشفر، بالإضافة لاحتساب ضريبة القيمة المضافة (VAT) بنسبة 15% تلقائياً لجميع مبيعات قطع الغيار.'
                : 'Parto is a fully compliant Saudi platform adhering to ZATCA Phase 2 (Integration) E-Invoicing requirements. We automatically generate and report B2C Simplified Tax Invoices and B2B Tax Invoices with encrypted QR codes. The 15% VAT is strictly automatically calculated and documented for all auto part sales.'}
            </p>
            <div className="flex flex-wrap gap-2 text-xs font-semibold">
              <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 rounded-full">15% VAT Ready</span>
              <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 rounded-full">Phase 2 Integration</span>
              <span className="px-3 py-1 bg-emerald-900/30 text-emerald-400 border border-emerald-500/20 rounded-full">Cryptographic QR Code</span>
            </div>
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-slate-50 border-t border-slate-200 mt-20">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-12 flex flex-col sm:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3">
            <img src="/logo.png?v=3" alt="Parto Auto Spare Parts" className="h-8 w-auto grayscale opacity-80" />
            <span className="text-sm text-slate-500">© 2026 Parto Auto Spare Parts. All rights reserved.</span>
          </div>
          <div className="flex gap-6 text-sm text-slate-400">
            <a href="#" className="hover:text-indigo-400 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-indigo-400 transition-colors">Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

