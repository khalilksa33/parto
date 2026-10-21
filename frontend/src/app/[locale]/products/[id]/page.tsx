'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter, useParams } from 'next/navigation';
import NotificationBell from '@/components/NotificationBell';
import { useCart } from '@/components/CartProvider';
import Footer from '@/components/Footer';
import {
  FALLBACK_BRAND_PARTS,
  resolvePartImage,
  getFallbackPartSvg,
  extractOemNumber,
} from '@/lib/part-images';

interface ProductDetail {
  id: string;
  name: string;
  price: number;
  category: string;
  tenantId: string;
  image: string;
  rating: number;
  featured: boolean;
  brandName?: string;
  tecdocArticleId?: string;
  description?: string;
  compatibility?: string[];
  weight: number;
  length: number;
  width: number;
  height: number;
  status?: string;
}

interface TenantInfo {
  id: string;
  name: string;
  logo: string;
  category: string;
  rating: number;
}

const KSA_CITIES = ['Riyadh', 'Jeddah', 'Dammam', 'Khobar', 'Mecca', 'Medina', 'Tabuk', 'Abha'];

export default function SingleProductPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as string) || 'en';
  const rawId = decodeURIComponent((params?.id as string) || '');
  const isAr = locale === 'ar';

  const { totalItems: cartCount, setIsCartOpen, addToCart } = useCart();

  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [allProducts, setAllProducts] = useState<ProductDetail[]>([]);
  const [tenants, setTenants] = useState<TenantInfo[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [selectedCity, setSelectedCity] = useState<string>('Riyadh');
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);
  const [addedFeedback, setAddedFeedback] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;

    const loadData = async () => {
      setLoading(true);
      try {
        const [productsRes, tenantsRes] = await Promise.all([
          fetch('/api/products'),
          fetch('/api/tenants'),
        ]);

        let tenantList: TenantInfo[] = [];
        if (tenantsRes.ok) {
          const tData = await tenantsRes.json();
          tenantList = Array.isArray(tData) ? tData : tData.tenants || [];
          if (isMounted) setTenants(tenantList);
        }

        const defaultSellerId = tenantList[0]?.id || 'default-seller';
        let mappedList: ProductDetail[] = [];

        if (productsRes.ok) {
          const pData = await productsRes.json();
          const rawList = Array.isArray(pData) ? pData : pData.products || [];
          mappedList = rawList.map((p: any) => ({
            id: String(p.id),
            name: p.name,
            price: Number(p.price),
            category: p.category || 'Engine Parts',
            tenantId: p.tenant_id || p.tenantId || defaultSellerId,
            image: resolvePartImage(p.image, p.category, p.name),
            rating: Number(p.rating || 4.9),
            featured: Boolean(p.featured),
            brandName: p.brand_name || p.brandName || undefined,
            tecdocArticleId: p.tecdoc_article_id || p.tecdocArticleId || undefined,
            description: p.description || '',
            compatibility: Array.isArray(p.compatibility) ? p.compatibility : undefined,
            weight: Number(p.weight || 2.0),
            length: Number(p.length || 25),
            width: Number(p.width || 20),
            height: Number(p.height || 12),
            status: p.status || 'active',
          }));
        }

        const existingNames = new Set(mappedList.map((p) => p.name.toLowerCase()));
        for (const fb of FALLBACK_BRAND_PARTS) {
          if (!existingNames.has(fb.name.toLowerCase())) {
            mappedList.push({
              id: fb.id,
              name: fb.name,
              price: fb.price,
              category: fb.category,
              tenantId: defaultSellerId,
              image: resolvePartImage(fb.image, fb.category, fb.name),
              rating: fb.rating,
              featured: fb.featured,
              brandName: fb.brandName,
              tecdocArticleId: fb.oemPartNumber,
              description: fb.description,
              compatibility: fb.compatibility,
              weight: fb.weight,
              length: fb.length || 25,
              width: fb.width || 20,
              height: fb.height || 12,
              status: 'active',
            });
          }
        }

        if (isMounted) {
          setAllProducts(mappedList);
          // Match by exact ID, fallback brand ID, or matching name
          let matched = mappedList.find(
            (p) =>
              p.id === rawId ||
              (p.tecdocArticleId && p.tecdocArticleId.toLowerCase() === rawId.toLowerCase()) ||
              extractOemNumber(p.name, p.tecdocArticleId).toLowerCase() === rawId.toLowerCase()
          );
          if (!matched) {
            const fbMatch = FALLBACK_BRAND_PARTS.find(
              (f) =>
                f.id === rawId ||
                (f.oemPartNumber && f.oemPartNumber.toLowerCase() === rawId.toLowerCase())
            );
            if (fbMatch) {
              matched =
                mappedList.find((p) => p.name.toLowerCase() === fbMatch.name.toLowerCase()) || {
                  id: fbMatch.id,
                  name: fbMatch.name,
                  price: fbMatch.price,
                  category: fbMatch.category,
                  tenantId: defaultSellerId,
                  image: resolvePartImage(fbMatch.image, fbMatch.category, fbMatch.name),
                  rating: fbMatch.rating,
                  featured: fbMatch.featured,
                  brandName: fbMatch.brandName,
                  tecdocArticleId: fbMatch.oemPartNumber,
                  description: fbMatch.description,
                  compatibility: fbMatch.compatibility,
                  weight: fbMatch.weight,
                  length: fbMatch.length || 25,
                  width: fbMatch.width || 20,
                  height: fbMatch.height || 12,
                  status: 'active',
                };
            }
          }
          if (!matched && rawId) {
            try {
              const singleRes = await fetch(`/api/products?id=${encodeURIComponent(rawId)}`);
              if (singleRes.ok) {
                const p = await singleRes.json();
                if (p && p.id) {
                  matched = {
                    id: String(p.id),
                    name: p.name,
                    price: Number(p.price),
                    category: p.category || 'Engine Parts',
                    tenantId: p.tenant_id || p.tenantId || defaultSellerId,
                    image: resolvePartImage(p.image, p.category, p.name),
                    rating: Number(p.rating || 4.9),
                    featured: Boolean(p.featured),
                    brandName: p.brand_name || p.brandName || undefined,
                    tecdocArticleId: p.tecdoc_article_id || p.tecdocArticleId || undefined,
                    description: p.description || '',
                    compatibility: Array.isArray(p.compatibility) ? p.compatibility : undefined,
                    weight: Number(p.weight || 2.0),
                    length: Number(p.length || 25),
                    width: Number(p.width || 20),
                    height: Number(p.height || 12),
                    status: p.status || 'active',
                  };
                }
              }
            } catch {
              // ignore fallback error
            }
          }
          setProduct(matched || null);
          setActiveImageIndex(0);
        }
      } catch (err) {
        console.error('Error loading product details:', err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [rawId]);

  const seller = useMemo(() => {
    if (!product) return null;
    return tenants.find((t) => t.id === product.tenantId) || tenants[0] || null;
  }, [product, tenants]);

  const galleryImages = useMemo(() => {
    if (!product) return [];
    const primary = resolvePartImage(product.image, product.category, product.name);
    const svgDiagram = getFallbackPartSvg(product.category, product.name);
    return primary === svgDiagram ? [primary] : [primary, svgDiagram];
  }, [product]);

  const shippingEstimate = useMemo(() => {
    const unitWeight = product?.weight || 2.0;
    const totalWeight = unitWeight * quantity;
    const extraKg = Math.max(0, totalWeight - 1);
    const isSameCity = selectedCity.toLowerCase() === 'riyadh';
    const smsa = ((isSameCity ? 18 : 25) + extraKg * (isSameCity ? 1.5 : 2.5)).toFixed(2);
    const aramex = ((isSameCity ? 21 : 28) + extraKg * (isSameCity ? 1.75 : 2.75)).toFixed(2);
    return {
      totalWeight: totalWeight.toFixed(2),
      smsa,
      aramex,
      etaDays: isSameCity ? '1–2 Business Days' : '2–3 Business Days',
    };
  }, [product, quantity, selectedCity]);

  const relatedProducts = useMemo(() => {
    if (!product) return [];
    const others = allProducts.filter((p) => p.id !== product.id && p.name !== product.name);
    const sameBrand = others.filter(
      (p) =>
        product.brandName &&
        p.brandName &&
        p.brandName.toLowerCase() === product.brandName.toLowerCase()
    );
    const sameCategory = others.filter(
      (p) =>
        p.category.toLowerCase() === product.category.toLowerCase() &&
        !sameBrand.some((b) => b.id === p.id)
    );
    return [...sameBrand, ...sameCategory, ...others].slice(0, 4);
  }, [product, allProducts]);

  const handleAddToCart = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    setAddedFeedback(true);
    setTimeout(() => setAddedFeedback(false), 2000);
  };

  const handleBuyNow = () => {
    if (!product) return;
    for (let i = 0; i < quantity; i++) {
      addToCart(product);
    }
    router.push(`/${locale}/checkout`);
  };

  const oemNumber = product ? extractOemNumber(product.name, product.tecdocArticleId) : '';
  const isOutOfStock = product?.status === 'out_of_stock';

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-slate-50 text-slate-900 font-sans antialiased">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-slate-200 shadow-sm">
        <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <button
              type="button"
              onClick={() => router.push(`/${locale}`)}
              className="flex items-center gap-2 cursor-pointer"
            >
              <img src="/logo.png?v=3" alt="Parto Auto Spare Parts" className="h-10 w-auto rounded" />
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${locale}`)}
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-indigo-600 bg-slate-100 hover:bg-indigo-50 px-3.5 py-2 rounded-full transition-colors"
            >
              <span>←</span>
              <span>{isAr ? 'العودة إلى الكتالوج' : 'Back to Catalog'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push(`/${locale}/towing`)}
              className="hidden lg:flex items-center justify-center px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            >
              {isAr ? 'طلب سطحة' : 'Tow Truck'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${locale}/workshop`)}
              className="hidden lg:flex items-center justify-center px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            >
              {isAr ? 'ورشة متنقلة' : 'Mobile Mechanic'}
            </button>
            <button
              type="button"
              onClick={() => router.push(`/${locale}/portal`)}
              className="hidden md:flex items-center justify-center px-3.5 py-2 text-sm font-semibold text-slate-700 hover:text-indigo-600 hover:bg-indigo-50 rounded-full transition-all"
            >
              {isAr ? 'لوحة البائع' : 'Vendor Portal'}
            </button>

            <button
              type="button"
              onClick={() => {
                const newLocale = isAr ? 'en' : 'ar';
                const currentPath = window.location.pathname;
                router.push(currentPath.replace(`/${locale}`, `/${newLocale}`));
              }}
              className="flex items-center justify-center px-3.5 py-1.5 text-xs font-bold text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-full transition-all"
            >
              {isAr ? 'EN' : 'عربي'}
            </button>

            <NotificationBell />

            <button
              type="button"
              onClick={() => setIsCartOpen(true)}
              className="relative cursor-pointer p-2 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="Open shopping cart"
            >
              <span className="text-xl">🛒</span>
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-indigo-600 text-white font-bold text-xs w-5 h-5 rounded-full flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-8 py-8 flex flex-col gap-10">
        {loading ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 flex flex-col items-center justify-center gap-4 min-h-[420px]">
            <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
            <p className="text-sm font-semibold text-slate-600">
              {isAr ? 'جاري تحميل تفاصيل القطعة...' : 'Loading part specifications & fitment...'}
            </p>
          </div>
        ) : !product ? (
          <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center flex flex-col items-center gap-4">
            <span className="text-5xl">🔍</span>
            <h1 className="text-2xl font-black text-slate-900">
              {isAr ? 'القطعة غير موجودة' : 'Part Not Found'}
            </h1>
            <p className="text-sm text-slate-600 max-w-md">
              {isAr
                ? 'لم نتمكن من العثور على قطعة الغيار المطلوبة. قد تكون قد أزيلت أو تم تحديث رابطها.'
                : 'We could not find the requested spare part. It may have been removed or its catalog link was updated.'}
            </p>
            <button
              type="button"
              onClick={() => router.push(`/${locale}`)}
              className="mt-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl text-sm transition-colors"
            >
              {isAr ? 'تصفح جميع قطع الغيار' : 'Browse All Spare Parts'}
            </button>
          </div>
        ) : (
          <>
            {/* Breadcrumb Bar */}
            <nav className="flex flex-wrap items-center gap-2 text-xs font-semibold text-slate-500">
              <button
                type="button"
                onClick={() => router.push(`/${locale}`)}
                className="hover:text-indigo-600 transition-colors"
              >
                {isAr ? 'الرئيسية' : 'Marketplace'}
              </button>
              <span>/</span>
              <span className="text-slate-700">{product.category}</span>
              {product.brandName && (
                <>
                  <span>/</span>
                  <span className="text-indigo-600 font-bold">{product.brandName}</span>
                </>
              )}
              <span>/</span>
              <span className="text-slate-900 font-bold truncate max-w-xs sm:max-w-md">
                {product.name}
              </span>
            </nav>

            {/* Primary Product Detail Card */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6 sm:p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Left Column: Image Gallery */}
              <div className="lg:col-span-5 flex flex-col gap-4">
                <div className="relative aspect-square w-full rounded-2xl bg-slate-900 border border-slate-200 overflow-hidden flex items-center justify-center shadow-inner">
                  <img
                    src={galleryImages[activeImageIndex] || galleryImages[0]}
                    alt={product.name}
                    onError={(e) => {
                      e.currentTarget.onerror = null;
                      e.currentTarget.src = getFallbackPartSvg(product.category, product.name);
                    }}
                    className="w-full h-full object-cover"
                  />
                  {product.brandName && (
                    <span className="absolute top-4 left-4 bg-slate-900/90 text-white border border-white/15 text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow">
                      🚘 {product.brandName}
                    </span>
                  )}
                  {product.featured && (
                    <span className="absolute top-4 right-4 bg-indigo-600 text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg shadow">
                      ★ Featured OEM
                    </span>
                  )}
                </div>

                {/* Gallery Switcher (Photo vs Technical Diagram) */}
                {galleryImages.length > 1 && (
                  <div className="flex items-center gap-3">
                    {galleryImages.map((imgSrc, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => setActiveImageIndex(idx)}
                        className={`relative w-20 h-20 rounded-xl overflow-hidden border-2 transition-all ${
                          activeImageIndex === idx
                            ? 'border-indigo-600 ring-2 ring-indigo-500/30 scale-105'
                            : 'border-slate-200 opacity-75 hover:opacity-100 hover:border-slate-400'
                        }`}
                      >
                        <img
                          src={imgSrc}
                          alt={`${product.name} view ${idx + 1}`}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getFallbackPartSvg(product.category, product.name);
                          }}
                          className="w-full h-full object-cover"
                        />
                        <span className="absolute bottom-0 inset-x-0 bg-slate-900/80 text-white text-[9px] font-bold text-center py-0.5">
                          {idx === 0 ? 'Photo' : 'Spec SVG'}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {/* Guarantee Badges */}
                <div className="grid grid-cols-3 gap-2.5 pt-2">
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <div className="text-lg">🛡️</div>
                    <div className="text-[11px] font-bold text-slate-800 mt-1">Genuine Fit</div>
                    <div className="text-[10px] text-slate-500">VIN Verified</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <div className="text-lg">🚚</div>
                    <div className="text-[11px] font-bold text-slate-800 mt-1">KSA Express</div>
                    <div className="text-[10px] text-slate-500">SMSA & Aramex</div>
                  </div>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-center">
                    <div className="text-lg">↩️</div>
                    <div className="text-[11px] font-bold text-slate-800 mt-1">14-Day Return</div>
                    <div className="text-[10px] text-slate-500">Easy Exchange</div>
                  </div>
                </div>
              </div>

              {/* Right Column: Specifications, Fitment, Pricing & Actions */}
              <div className="lg:col-span-7 flex flex-col justify-between gap-6">
                <div className="flex flex-col gap-4">
                  {/* Top Badges Row */}
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-3 py-1 rounded-full text-xs font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {product.category}
                    </span>
                    <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-slate-100 text-slate-800 border border-slate-200">
                      OEM #: {oemNumber}
                    </span>
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        isOutOfStock
                          ? 'bg-red-50 text-red-700 border border-red-200'
                          : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      }`}
                    >
                      {isOutOfStock
                        ? isAr
                          ? 'غير متوفر حالياً'
                          : 'Out of Stock'
                        : isAr
                        ? '✓ متوفر في المستودع - شحن فوري'
                        : '✓ In Stock — Ready to Ship'}
                    </span>
                  </div>

                  {/* Product Title */}
                  <h1 className="text-2xl sm:text-3xl font-black text-slate-900 leading-snug">
                    {product.name}
                  </h1>

                  {/* Rating & Seller Line */}
                  <div className="flex flex-wrap items-center gap-4 text-sm">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <span>★★★★★</span>
                      <span className="text-slate-800 ml-1">{product.rating.toFixed(1)}</span>
                      <span className="text-slate-500 font-normal text-xs">(Verified KSA Buyers)</span>
                    </div>
                    {seller && (
                      <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 bg-slate-100 px-3 py-1 rounded-full">
                        <span>{seller.logo || '🏪'}</span>
                        <span>Sold by:</span>
                        <span className="text-indigo-700 font-bold">{seller.name}</span>
                      </div>
                    )}
                  </div>

                  {/* Price Box */}
                  <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-slate-500 block">
                        {isAr ? 'سعر القطعة' : 'Unit Price'}
                      </span>
                      <div className="text-3xl sm:text-4xl font-black text-slate-900 mt-1 flex items-baseline gap-1.5">
                        <span className="font-riyal text-3xl font-normal">﷼</span>
                        <span>{product.price.toFixed(2)}</span>
                        <span className="text-xs font-semibold text-slate-500 ml-1">SAR</span>
                      </div>
                      <span className="text-[11px] text-slate-500">
                        {isAr
                          ? 'الضريبة والشحن تُحسب عند إتمام الطلب'
                          : '15% VAT & live carrier shipping calculated at checkout'}
                      </span>
                    </div>

                    {/* Quantity Selector */}
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-bold text-slate-600">
                        {isAr ? 'الكمية:' : 'Qty:'}
                      </span>
                      <div className="flex items-center border border-slate-300 rounded-xl bg-white overflow-hidden">
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                          className="w-10 h-10 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          −
                        </button>
                        <span className="w-10 text-center font-bold text-slate-900 text-sm">
                          {quantity}
                        </span>
                        <button
                          type="button"
                          onClick={() => setQuantity((q) => q + 1)}
                          className="w-10 h-10 flex items-center justify-center font-bold text-slate-700 hover:bg-slate-100 transition-colors"
                        >
                          +
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={handleAddToCart}
                      className={`flex-1 py-4 px-6 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg cursor-pointer ${
                        addedFeedback
                          ? 'bg-emerald-600 text-white shadow-emerald-500/20'
                          : 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-500/25 active:scale-[0.99]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      <span>{addedFeedback ? '✓' : '🛒'}</span>
                      <span>
                        {addedFeedback
                          ? isAr
                            ? 'تمت الإضافة إلى السلة!'
                            : 'Added to Cart!'
                          : isAr
                          ? 'أضف إلى السلة'
                          : `Add to Cart — SAR ${(product.price * quantity).toFixed(2)}`}
                      </span>
                    </button>

                    <button
                      type="button"
                      disabled={isOutOfStock}
                      onClick={handleBuyNow}
                      className="sm:w-48 py-4 px-6 rounded-xl font-bold text-sm bg-slate-900 hover:bg-slate-800 text-white transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-[0.99] disabled:opacity-50"
                    >
                      <span>⚡</span>
                      <span>{isAr ? 'اشتر الآن' : 'Buy Now'}</span>
                    </button>
                  </div>

                  {/* Description & Technical Specs */}
                  <div className="border-t border-slate-200 pt-5 flex flex-col gap-4">
                    <div>
                      <h2 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-1.5">
                        {isAr ? 'وصف القطعة والمواصفات' : 'Part Description & Overview'}
                      </h2>
                      <p className="text-sm text-slate-600 leading-relaxed">
                        {product.description ||
                          `Genuine quality ${product.brandName || 'OEM'} ${product.name} engineered for reliable performance and exact factory fitment in Saudi Arabian driving conditions.`}
                      </p>
                    </div>

                    {/* Compatible Vehicles */}
                    {product.compatibility && product.compatibility.length > 0 && (
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2">
                          {isAr ? 'السيارات والموديلات المتوافقة' : 'Compatible Vehicles & Fitment'}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          {product.compatibility.map((model, idx) => (
                            <span
                              key={idx}
                              className="px-3 py-1 rounded-lg bg-indigo-50 text-indigo-800 border border-indigo-200 text-xs font-bold"
                            >
                              ✓ {model}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Technical Specs Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-1">
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <span className="text-[11px] text-slate-500 block">Vehicle Brand</span>
                        <span className="text-sm font-bold text-slate-900">
                          {product.brandName || product.compatibility?.[0] || 'Multi-Brand OEM'}
                        </span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <span className="text-[11px] text-slate-500 block">OEM Part Number</span>
                        <span className="text-sm font-mono font-bold text-slate-900">{oemNumber}</span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <span className="text-[11px] text-slate-500 block">Unit Weight</span>
                        <span className="text-sm font-bold text-slate-900">
                          {product.weight.toFixed(2)} kg
                        </span>
                      </div>
                      <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
                        <span className="text-[11px] text-slate-500 block">Dimensions</span>
                        <span className="text-sm font-bold text-slate-900">
                          {product.length}×{product.width}×{product.height} cm
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Live KSA Shipping Calculator Preview */}
                <div className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-4 flex flex-col gap-3">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-lg">🚚</span>
                      <span className="text-xs font-bold text-slate-900">
                        {isAr ? 'حاسبة الشحن الفوري داخل المملكة' : 'Instant KSA Shipping Estimate'}
                      </span>
                      <span className="text-[11px] text-slate-500">
                        ({shippingEstimate.totalWeight} kg total)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-slate-600 font-semibold">Destination:</span>
                      <select
                        value={selectedCity}
                        onChange={(e) => setSelectedCity(e.target.value)}
                        className="bg-white border border-slate-300 rounded-lg px-2.5 py-1 text-xs font-bold text-slate-800 outline-none focus:border-indigo-500"
                      >
                        {KSA_CITIES.map((city) => (
                          <option key={city} value={city}>
                            {city}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                    <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">SMSA Express</span>
                        <span className="text-[11px] text-slate-500">{shippingEstimate.etaDays}</span>
                      </div>
                      <span className="font-black text-indigo-700 text-sm">
                        SAR {shippingEstimate.smsa}
                      </span>
                    </div>
                    <div className="bg-white border border-slate-200 rounded-xl px-3.5 py-2.5 flex items-center justify-between">
                      <div>
                        <span className="font-bold text-slate-900 block">Aramex Domestic</span>
                        <span className="text-[11px] text-slate-500">{shippingEstimate.etaDays}</span>
                      </div>
                      <span className="font-black text-indigo-700 text-sm">
                        SAR {shippingEstimate.aramex}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Related / Compatible Spare Parts Section */}
            {relatedProducts.length > 0 && (
              <section className="flex flex-col gap-5">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-black text-slate-900">
                    {isAr ? 'قطع غيار مشابهة ومتوافقة' : 'Related & Compatible Spare Parts'}
                  </h2>
                  <button
                    type="button"
                    onClick={() => router.push(`/${locale}`)}
                    className="text-xs font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                  >
                    {isAr ? 'عرض كل القطع ←' : 'View Full Catalog →'}
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {relatedProducts.map((rel) => (
                    <div
                      key={rel.id}
                      onClick={() => router.push(`/${locale}/products/${encodeURIComponent(rel.id)}`)}
                      className="group bg-white border border-slate-200 rounded-2xl overflow-hidden hover:border-indigo-500 transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-xl cursor-pointer"
                    >
                      <div className="relative bg-slate-900 aspect-square overflow-hidden">
                        <img
                          src={resolvePartImage(rel.image, rel.category, rel.name)}
                          alt={rel.name}
                          onError={(e) => {
                            e.currentTarget.onerror = null;
                            e.currentTarget.src = getFallbackPartSvg(rel.category, rel.name);
                          }}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                        {rel.brandName && (
                          <span className="absolute top-3 left-3 bg-slate-900/90 text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded">
                            {rel.brandName}
                          </span>
                        )}
                      </div>

                      <div className="p-4 flex flex-col gap-2 flex-1 justify-between">
                        <div>
                          <span className="text-xs font-semibold text-slate-500 block mb-1">
                            {rel.category}
                          </span>
                          <h3 className="font-bold text-slate-900 text-sm group-hover:text-indigo-600 transition-colors line-clamp-2">
                            {rel.name}
                          </h3>
                        </div>

                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-100">
                          <span className="text-lg font-black text-slate-900">
                            <span className="font-riyal font-normal mr-1">﷼</span>
                            {rel.price}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              addToCart(rel);
                            }}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors"
                          >
                            Add to Cart
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </main>

      <Footer />
    </div>
  );
}
