'use client';

import React, { useState, useEffect, Suspense, useCallback } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { resolvePartImage, getFallbackPartSvg } from '@/lib/part-images';

const VEHICLE_BRANDS = [
  'Toyota',
  'Lexus',
  'Kia',
  'BMW',
  'Audi',
  'Nissan',
  'Honda',
  'Hyundai',
  'Ford',
  'Chevrolet',
  'Mazda',
  'Mercedes'
];

const PART_CATEGORIES = [
  'Engine Parts',
  'Brakes & Suspension',
  'Exhaust Systems',
  'Exterior & Body',
  'Interior Accessories'
];

function PortalContentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useParams()?.locale || 'en';

  const initialTenantParam = searchParams?.get('tenantId') || searchParams?.get('tenant_id') || '';
  const [tenantId, setTenantId] = useState(initialTenantParam);
  const [isLoggedIn, setIsLoggedIn] = useState(!!initialTenantParam);
  const [loginMode, setLoginMode] = useState<'credentials' | 'tenantId'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  // Navigation Tabs
  const [activeTab, setActiveTab] = useState<'inventory' | 'orders' | 'rfq'>('inventory');
  const [inventorySourceTab, setInventorySourceTab] = useState<'local' | 'speero'>('local');

  // Store & Data states
  const [tenants, setTenants] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [storeProducts, setStoreProducts] = useState<any[]>([]);
  const [loadingOrders, setLoadingOrders] = useState(false);
  const [loadingProducts, setLoadingProducts] = useState(false);

  // Local Shop Stock Management states
  const [showAddLocalModal, setShowAddLocalModal] = useState(false);
  const [localBrandFilter, setLocalBrandFilter] = useState('all');
  const [localSearchQuery, setLocalSearchQuery] = useState('');
  const [isSubmittingPart, setIsSubmittingPart] = useState(false);
  const [isEnrichingAi, setIsEnrichingAi] = useState(false);
  const [editingPriceId, setEditingPriceId] = useState<string | null>(null);
  const [editingPriceVal, setEditingPriceVal] = useState<string>('');
  const [newPartForm, setNewPartForm] = useState({
    name: '',
    brandName: 'Toyota',
    oemPartNumber: '',
    category: 'Engine Parts',
    price: '',
    weight: '2.0',
    length: '25',
    width: '20',
    height: '12',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop',
    compatibility: '',
    description: '',
    featured: true
  });

  // Speero API Stock states
  const [speeroItems, setSpeeroItems] = useState<any[]>([]);
  const [loadingSpeero, setLoadingSpeero] = useState(false);
  const [speeroBrandFilter, setSpeeroBrandFilter] = useState('all');
  const [speeroConditionFilter, setSpeeroConditionFilter] = useState('all');
  const [speeroQuery, setSpeeroQuery] = useState('');
  const [speeroApiKey, setSpeeroApiKey] = useState('');
  const [speeroMarkup, setSpeeroMarkup] = useState<number>(0);
  const [useWholesaleBase, setUseWholesaleBase] = useState<boolean>(false);
  const [importingSku, setImportingSku] = useState<string | null>(null);
  const [bulkSyncingSpeero, setBulkSyncingSpeero] = useState(false);
  const [inventoryToast, setInventoryToast] = useState<string | null>(null);

  // RFQ (Tashleeh / Speero Part Requests) states
  const [partRequests, setPartRequests] = useState<any[]>([]);
  const [myQuotes, setMyQuotes] = useState<any[]>([]);
  const [loadingRfq, setLoadingRfq] = useState(false);
  const [quoteInputs, setQuoteInputs] = useState<Record<string, { price: string; condition: string; notes: string }>>({});

  const showToast = (msg: string) => {
    setInventoryToast(msg);
    setTimeout(() => setInventoryToast(null), 4000);
  };

  // Sync URL ?tenantId= or ?tenant_id= changes
  useEffect(() => {
    const urlTenantId = searchParams?.get('tenantId') || searchParams?.get('tenant_id');
    if (urlTenantId && urlTenantId !== tenantId) {
      setTenantId(urlTenantId);
      setIsLoggedIn(true);
    }
  }, [searchParams, tenantId]);

  // Fetch all tenants so we can show store names and a quick-switcher
  useEffect(() => {
    fetch('/api/tenants')
      .then(res => (res.ok ? res.json() : []))
      .then(data => {
        const list = Array.isArray(data) ? data : data.tenants || [];
        setTenants(list);
      })
      .catch(err => console.error('Failed to load tenants', err));
  }, []);

  // Auto-check if user already has an active vendor session cookie
  useEffect(() => {
    if (!searchParams?.get('tenantId') && !searchParams?.get('tenant_id')) {
      fetch('/api/auth/me')
        .then(res => (res.ok ? res.json() : null))
        .then(data => {
          if (data?.authenticated && data?.user?.tenantId) {
            setTenantId(data.user.tenantId);
            setIsLoggedIn(true);
            router.replace(`/${locale}/portal?tenantId=${data.user.tenantId}`);
          }
        })
        .catch(() => {});
    }
  }, [locale, router, searchParams]);

  const fetchStoreProducts = useCallback(async (targetTenantId = tenantId) => {
    if (!targetTenantId) return;
    setLoadingProducts(true);
    try {
      const res = await fetch(`/api/products?tenantId=${targetTenantId}`);
      if (res.ok) {
        const data = await res.json();
        const list = Array.isArray(data) ? data : data.products || [];
        setStoreProducts(list);
      }
    } catch (err) {
      console.error('Failed to fetch store inventory:', err);
    } finally {
      setLoadingProducts(false);
    }
  }, [tenantId]);

  const fetchOrders = useCallback(async (targetTenantId = tenantId) => {
    if (!targetTenantId) return;
    setLoadingOrders(true);
    try {
      const res = await fetch(`/api/orders?tenantId=${targetTenantId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : data.orders || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingOrders(false);
    }
  }, [tenantId]);

  const fetchSpeeroCatalog = useCallback(async () => {
    setLoadingSpeero(true);
    try {
      const params = new URLSearchParams();
      if (speeroBrandFilter !== 'all') params.set('brand', speeroBrandFilter);
      if (speeroConditionFilter !== 'all') params.set('condition', speeroConditionFilter);
      if (speeroQuery.trim()) params.set('query', speeroQuery.trim());

      const headers: Record<string, string> = {};
      if (speeroApiKey.trim()) {
        headers['X-Speero-Api-Key'] = speeroApiKey.trim();
      }

      const res = await fetch(`/api/speero/stock?${params.toString()}`, { headers });
      if (res.ok) {
        const data = await res.json();
        setSpeeroItems(data.items || []);
      }
    } catch (err) {
      console.error('Failed to load Speero stock:', err);
    } finally {
      setLoadingSpeero(false);
    }
  }, [speeroBrandFilter, speeroConditionFilter, speeroQuery, speeroApiKey]);

  const fetchPartRequests = useCallback(async (targetTenantId = tenantId) => {
    if (!targetTenantId) return;
    setLoadingRfq(true);
    try {
      const res = await fetch('/api/tashleeh/request', {
        headers: { 'X-Tenant-ID': targetTenantId }
      });
      if (res.ok) {
        const data = await res.json();
        setPartRequests(data.requests || []);
        setMyQuotes(data.myQuotes || []);
      }
    } catch (err) {
      console.error('Failed to load RFQ part requests:', err);
    } finally {
      setLoadingRfq(false);
    }
  }, [tenantId]);

  useEffect(() => {
    if (isLoggedIn && tenantId) {
      fetchStoreProducts(tenantId);
      fetchOrders(tenantId);
      fetchPartRequests(tenantId);
    }
  }, [isLoggedIn, tenantId, fetchStoreProducts, fetchOrders, fetchPartRequests]);

  useEffect(() => {
    if (isLoggedIn && inventorySourceTab === 'speero') {
      fetchSpeeroCatalog();
    }
  }, [isLoggedIn, inventorySourceTab, fetchSpeeroCatalog]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    if (loginMode === 'credentials') {
      setAuthLoading(true);
      try {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim(), password })
        });
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.error || 'Invalid credentials');
        }
        let resolvedTenantId = data.user?.tenantId;
        if (!resolvedTenantId) {
          const meRes = await fetch('/api/auth/me');
          if (meRes.ok) {
            const meData = await meRes.json();
            resolvedTenantId = meData.user?.tenantId;
          }
        }
        if (!resolvedTenantId) {
          throw new Error('This account does not have an assigned store Tenant ID.');
        }
        setTenantId(resolvedTenantId);
        setIsLoggedIn(true);
        router.push(`/${locale}/portal?tenantId=${resolvedTenantId}`);
      } catch (err: any) {
        setLoginError(err.message || 'Login failed');
      } finally {
        setAuthLoading(false);
      }
    } else {
      if (tenantId.trim()) {
        setIsLoggedIn(true);
        router.push(`/${locale}/portal?tenantId=${tenantId.trim()}`);
      }
    }
  };

  const handleQuickSelectStore = (selectedId: string) => {
    if (!selectedId) return;
    setTenantId(selectedId);
    setIsLoggedIn(true);
    router.push(`/${locale}/portal?tenantId=${selectedId}`);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setTenantId('');
    setOrders([]);
    setStoreProducts([]);
    router.push(`/${locale}/portal`);
  };

  // AI Auto-Enrich for Local Stock Form
  const handleAiEnrich = async () => {
    if (!newPartForm.name.trim()) return;
    setIsEnrichingAi(true);
    try {
      const res = await fetch('/api/ai/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productName: newPartForm.name, action: 'enrich' })
      });
      if (res.ok) {
        const data = await res.json();
        setNewPartForm(prev => ({
          ...prev,
          name: data.name || prev.name,
          category: PART_CATEGORIES.includes(data.category) ? data.category : prev.category,
          description: data.description || prev.description,
          compatibility: Array.isArray(data.compatibility)
            ? data.compatibility.join(', ')
            : prev.compatibility
        }));
        showToast('✨ Part details enriched with AI!');
      }
    } catch (err) {
      console.error('AI enrich failed:', err);
    } finally {
      setIsEnrichingAi(false);
    }
  };

  // Add Local Shop Stock Part
  const handleAddLocalPart = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tenantId) return;
    setIsSubmittingPart(true);
    try {
      const compatibilityArray = newPartForm.compatibility
        .split(',')
        .map(s => s.trim())
        .filter(Boolean);

      if (newPartForm.brandName && !compatibilityArray.includes(newPartForm.brandName)) {
        compatibilityArray.unshift(newPartForm.brandName);
      }

      const res = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({
          tenantId,
          name: newPartForm.name,
          brandName: newPartForm.brandName,
          oemPartNumber: newPartForm.oemPartNumber,
          category: newPartForm.category,
          price: parseFloat(newPartForm.price || '0').toFixed(2),
          weight: parseFloat(newPartForm.weight || '1.5').toFixed(2),
          length: parseFloat(newPartForm.length || '20').toFixed(2),
          width: parseFloat(newPartForm.width || '15').toFixed(2),
          height: parseFloat(newPartForm.height || '10').toFixed(2),
          image: newPartForm.image || '⚙️',
          compatibility: compatibilityArray,
          description: newPartForm.description,
          featured: newPartForm.featured
        })
      });

      if (res.ok) {
        showToast(`✅ Added "${newPartForm.name}" to your store stock!`);
        setNewPartForm({
          name: '',
          brandName: 'Toyota',
          oemPartNumber: '',
          category: 'Engine Parts',
          price: '',
          weight: '2.0',
          length: '25',
          width: '20',
          height: '12',
          image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop',
          compatibility: '',
          description: '',
          featured: true
        });
        setShowAddLocalModal(false);
        fetchStoreProducts(tenantId);
      } else {
        const err = await res.json();
        alert(`Failed to add stock item: ${err.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error adding part:', err);
    } finally {
      setIsSubmittingPart(false);
    }
  };

  // Update Stock Status or Price
  const handleUpdateProduct = async (productId: string, updates: Record<string, any>) => {
    try {
      const res = await fetch(`/api/products?id=${productId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        showToast('✅ Inventory updated!');
        setEditingPriceId(null);
        fetchStoreProducts(tenantId);
      }
    } catch (err) {
      console.error('Failed to update product:', err);
    }
  };

  // Delete Stock Item
  const handleDeleteProduct = async (productId: string, productName: string) => {
    try {
      const res = await fetch(`/api/products?id=${productId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        showToast(`🗑️ Removed "${productName}" from store inventory.`);
        setStoreProducts(prev => prev.filter(p => p.id !== productId));
      }
    } catch (err) {
      console.error('Failed to delete product:', err);
    }
  };

  // Import Single Speero Item to Store Stock
  const handleImportSpeeroItem = async (item: any) => {
    if (!tenantId) return;
    setImportingSku(item.speeroSku);
    try {
      const res = await fetch('/api/speero/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({
          tenantId,
          speeroSku: item.speeroSku,
          markupPercent: speeroMarkup,
          useWholesaleBase
        })
      });
      const data = await res.json();
      if (res.ok) {
        if (data.importedCount > 0) {
          showToast(`⚡ Imported "${item.name}" from Speero API to your store!`);
          fetchStoreProducts(tenantId);
        } else {
          showToast(`ℹ️ "${item.name}" is already in your store inventory.`);
        }
      }
    } catch (err) {
      console.error('Failed to import Speero item:', err);
    } finally {
      setImportingSku(null);
    }
  };

  // Bulk Sync All Filtered Speero Stock
  const handleBulkSyncSpeero = async () => {
    if (!tenantId || speeroItems.length === 0) return;
    setBulkSyncingSpeero(true);
    try {
      const res = await fetch('/api/speero/stock', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({
          tenantId,
          speeroSkus: speeroItems.map(i => i.speeroSku),
          markupPercent: speeroMarkup,
          useWholesaleBase
        })
      });
      const data = await res.json();
      if (res.ok) {
        showToast(
          `⚡ Speero Bulk Sync Complete: ${data.importedCount} new parts added (${data.skippedDuplicates} existing skipped).`
        );
        fetchStoreProducts(tenantId);
      }
    } catch (err) {
      console.error('Bulk Speero sync failed:', err);
    } finally {
      setBulkSyncingSpeero(false);
    }
  };

  // Submit Quote for Customer Part Request (RFQ)
  const handleSubmitQuote = async (requestId: string) => {
    const input = quoteInputs[requestId];
    if (!input?.price || !tenantId) return;
    try {
      const res = await fetch('/api/tashleeh/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Tenant-ID': tenantId
        },
        body: JSON.stringify({
          requestId,
          price: input.price,
          condition: input.condition || 'New OEM',
          notes: input.notes || ''
        })
      });
      if (res.ok) {
        showToast('✅ Quote submitted to customer!');
        fetchPartRequests(tenantId);
      } else {
        const err = await res.json();
        alert(err.error || 'Failed to submit quote');
      }
    } catch (err) {
      console.error('Error submitting quote:', err);
    }
  };

  const activeTenant = tenants.find(t => t.id === tenantId);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-200">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-indigo-900 mb-2">Vendor & Seller Portal</h1>
            <p className="text-slate-500 text-sm">
              Sign in to manage your Local Shop Inventory, sync Speero API Parts Stock, and fulfill orders.
            </p>
          </div>

          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => {
                setLoginMode('credentials');
                setLoginError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMode === 'credentials' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => {
                setLoginMode('tenantId');
                setLoginError('');
              }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                loginMode === 'tenantId' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Secret Tenant ID
            </button>
          </div>

          {loginError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs font-medium">
              {loginError}
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {loginMode === 'credentials' ? (
              <>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Vendor Email
                  </label>
                  <input
                    type="email"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="e.g. riyadh@parto.com or luxury@parto.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                    Password
                  </label>
                  <input
                    type="password"
                    required
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="••••••••"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                  />
                </div>
              </>
            ) : (
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                  Tenant ID
                </label>
                <input
                  type="text"
                  required
                  className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm"
                  placeholder="e.g. f59fcad2-5b97-4df7-823b-8e614e3ca675"
                  value={tenantId}
                  onChange={e => setTenantId(e.target.value)}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={authLoading}
              className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg mt-2"
            >
              {authLoading ? 'Signing in...' : 'Access Seller Dashboard'}
            </button>
          </form>

          {tenants.filter(t => t.status === 'active').length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Quick Access Active Demo Stores
              </label>
              <div className="flex flex-col gap-2">
                {tenants
                  .filter(t => t.status === 'active')
                  .map(t => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => handleQuickSelectStore(t.id)}
                      className="w-full text-left px-3.5 py-2.5 rounded-xl border border-slate-200 hover:border-indigo-400 hover:bg-indigo-50/50 transition-all flex items-center justify-between text-xs"
                    >
                      <span className="font-bold text-slate-800">{t.name}</span>
                      <span className="font-mono text-[10px] text-slate-400">{t.id.substring(0, 8)}... →</span>
                    </button>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Calculate KPIs
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || '0'), 0);
  const totalOrders = orders.length;
  const speeroSyncedCount = storeProducts.filter(
    p => (p.description || '').includes('Speero SKU:')
  ).length;

  const filteredLocalProducts = storeProducts.filter(p => {
    if (localBrandFilter !== 'all') {
      const b = localBrandFilter.toLowerCase();
      const matchBrand =
        (p.brandName && p.brandName.toLowerCase() === b) ||
        (p.name && p.name.toLowerCase().includes(b)) ||
        (p.description && p.description.toLowerCase().includes(b));
      if (!matchBrand) return false;
    }
    if (localSearchQuery.trim()) {
      const q = localSearchQuery.toLowerCase();
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (p.brandName || '').toLowerCase().includes(q) ||
        (p.tecdocArticleId || '').toLowerCase().includes(q)
      );
    }
    return true;
  });

  const existingProductNames = new Set(storeProducts.map(p => (p.name || '').toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      {/* Toast Notification */}
      {inventoryToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3.5 rounded-2xl shadow-2xl border border-indigo-500/40 text-sm font-bold flex items-center gap-3 animate-in fade-in slide-in-from-bottom-4">
          <span>{inventoryToast}</span>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="text-xl font-black text-indigo-900 flex items-center gap-3">
            <span className="bg-indigo-100 text-indigo-700 w-9 h-9 rounded-xl flex items-center justify-center">
              🏪
            </span>
            <div>
              <span>{activeTenant ? activeTenant.name : 'Seller Dashboard'}</span>
              {activeTenant && (
                <span className="ml-2 text-xs font-semibold text-slate-400 hidden sm:inline">
                  Seller & Inventory Portal
                </span>
              )}
            </div>
          </div>

          <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
            {tenants.filter(t => t.status === 'active').length > 1 && (
              <select
                value={tenantId}
                onChange={e => handleQuickSelectStore(e.target.value)}
                className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                title="Switch active seller store"
              >
                {tenants
                  .filter(t => t.status === 'active')
                  .map(t => (
                    <option key={t.id} value={t.id}>
                      Store: {t.name}
                    </option>
                  ))}
              </select>
            )}
            <span className="font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200 hidden md:inline text-xs">
              ID: {tenantId.substring(0, 8)}...
            </span>
            <button
              onClick={() => router.push(`/${locale}`)}
              className="px-3 py-1.5 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 text-xs font-bold transition-colors"
            >
              View Storefront →
            </button>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 text-xs font-bold">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1.5">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Active Parts in Stock
            </span>
            <span className="text-3xl font-black text-indigo-600">{storeProducts.length}</span>
            <span className="text-[11px] text-slate-400">
              {storeProducts.filter(p => p.status !== 'out_of_stock').length} In Stock •{' '}
              {speeroSyncedCount} via Speero API
            </span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1.5">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Speero API Network
            </span>
            <span className="text-2xl font-black text-emerald-600 flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              Connected
            </span>
            <span className="text-[11px] text-slate-400">KSA Warehouses: Riyadh, Jeddah, Dammam</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1.5">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Total Sales Revenue
            </span>
            <span className="text-3xl font-black text-slate-800">SAR {totalRevenue.toFixed(2)}</span>
            <span className="text-[11px] text-slate-400">Across {totalOrders} store orders</span>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-1.5">
            <span className="text-slate-500 text-xs font-bold uppercase tracking-wider">
              Orders & Pending COD
            </span>
            <span className="text-3xl font-black text-amber-500">
              {orders.filter(o => o.status === 'pending_cod').length}{' '}
              <span className="text-sm font-bold text-slate-400">/ {totalOrders} total</span>
            </span>
            <span className="text-[11px] text-slate-400">Multi-origin shipping enabled</span>
          </div>
        </div>

        {/* Main Portal Navigation Tabs */}
        <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-4">
          <button
            type="button"
            onClick={() => setActiveTab('inventory')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'inventory'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>📦</span> Inventory & Stock Management
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'inventory' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {storeProducts.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('orders')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>🧾</span> Store Orders & Payouts
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                activeTab === 'orders' ? 'bg-indigo-500 text-white' : 'bg-slate-100 text-slate-600'
              }`}
            >
              {orders.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('rfq')}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === 'rfq'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/20'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
            }`}
          >
            <span>🔍</span> Customer Part Requests (RFQ)
            {partRequests.length > 0 && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500 text-white">
                {partRequests.length}
              </span>
            )}
          </button>
        </div>

        {/* ==================== TAB 1: INVENTORY & STOCK MANAGEMENT ==================== */}
        {activeTab === 'inventory' && (
          <div className="flex flex-col gap-6">
            {/* Dual Source Selector: Local Shop Stock vs Speero API Parts Stock */}
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-black text-slate-900">Parts Stock & Catalog Sources</h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Manage your local shop stock directly or import/sync verified OEM & Tashleeh stock from the Speero API network.
                </p>
              </div>

              <div className="flex rounded-xl bg-slate-100 p-1.5 gap-1.5">
                <button
                  type="button"
                  onClick={() => setInventorySourceTab('local')}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    inventorySourceTab === 'local'
                      ? 'bg-white text-indigo-900 shadow-sm border border-slate-200/80'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🏪</span> Local Seller / Shop Stock ({storeProducts.length})
                </button>
                <button
                  type="button"
                  onClick={() => setInventorySourceTab('speero')}
                  className={`px-4 py-2.5 rounded-lg text-xs font-bold transition-all flex items-center gap-2 ${
                    inventorySourceTab === 'speero'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-emerald-700 hover:bg-emerald-50'
                  }`}
                >
                  <span>⚡</span> Speero API Parts Stock
                </button>
              </div>
            </div>

            {/* ---------- SUB-TAB A: LOCAL SELLER / SHOP STOCK ---------- */}
            {inventorySourceTab === 'local' && (
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/70">
                  <div>
                    <h3 className="text-base font-bold text-slate-800 flex items-center gap-2">
                      <span>🏪</span> {activeTenant?.name || 'Store'} — Active Inventory
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Add your shop&apos;s own spare parts stock, update prices, adjust weight for shipping calculation, or toggle availability.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <input
                      type="text"
                      placeholder="Search part name, OEM #, brand..."
                      value={localSearchQuery}
                      onChange={e => setLocalSearchQuery(e.target.value)}
                      className="bg-white border border-slate-300 rounded-xl px-3.5 py-2 text-xs text-slate-800 outline-none focus:ring-2 focus:ring-indigo-500 w-56"
                    />
                    <select
                      value={localBrandFilter}
                      onChange={e => setLocalBrandFilter(e.target.value)}
                      className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="all">All Car Brands</option>
                      {VEHICLE_BRANDS.map(b => (
                        <option key={b} value={b}>
                          {b}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowAddLocalModal(prev => !prev)}
                      className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all shadow-sm flex items-center gap-1.5"
                    >
                      <span>{showAddLocalModal ? '✕' : '＋'}</span>
                      {showAddLocalModal ? 'Close Form' : 'Add Local Part Stock'}
                    </button>
                    <button
                      type="button"
                      onClick={() => setInventorySourceTab('speero')}
                      className="bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-bold px-3.5 py-2 rounded-xl text-xs transition-all flex items-center gap-1.5"
                    >
                      <span>⚡</span> Import from Speero API
                    </button>
                  </div>
                </div>

                {/* Add New Local Stock Form */}
                {showAddLocalModal && (
                  <div className="p-6 bg-indigo-50/40 border-b border-indigo-100">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="font-bold text-indigo-950 text-sm flex items-center gap-2">
                        <span>➕</span> Add New Local Shop Part to Inventory
                      </h4>
                      <button
                        type="button"
                        onClick={handleAiEnrich}
                        disabled={isEnrichingAi || !newPartForm.name.trim()}
                        className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 disabled:opacity-50 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-sm"
                      >
                        <span>✨</span> {isEnrichingAi ? 'AI Enriching...' : 'AI Auto-Enrich Details'}
                      </button>
                    </div>

                    <form onSubmit={handleAddLocalPart} className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Part Name & Title *
                        </label>
                        <input
                          type="text"
                          required
                          placeholder="e.g. Lexus ES350 OEM Front Ceramic Brake Pads Set"
                          value={newPartForm.name}
                          onChange={e => setNewPartForm({ ...newPartForm, name: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Vehicle Brand *
                        </label>
                        <select
                          value={newPartForm.brandName}
                          onChange={e => setNewPartForm({ ...newPartForm, brandName: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {VEHICLE_BRANDS.map(b => (
                            <option key={b} value={b}>
                              {b}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Part Category *
                        </label>
                        <select
                          value={newPartForm.category}
                          onChange={e => setNewPartForm({ ...newPartForm, category: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {PART_CATEGORIES.map(c => (
                            <option key={c} value={c}>
                              {c}
                            </option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          OEM / Part Number
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. 04465-33471"
                          value={newPartForm.oemPartNumber}
                          onChange={e => setNewPartForm({ ...newPartForm, oemPartNumber: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm font-mono outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Selling Price (SAR) *
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="e.g. 385.00"
                          value={newPartForm.price}
                          onChange={e => setNewPartForm({ ...newPartForm, price: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Shipping Weight (kg) *
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          required
                          value={newPartForm.weight}
                          onChange={e => setNewPartForm({ ...newPartForm, weight: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Compatible Models (comma-separated)
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Camry 2018-2024, ES350"
                          value={newPartForm.compatibility}
                          onChange={e => setNewPartForm({ ...newPartForm, compatibility: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Product Image URL or Emoji
                        </label>
                        <input
                          type="text"
                          placeholder="https://... or ⚙️"
                          value={newPartForm.image}
                          onChange={e => setNewPartForm({ ...newPartForm, image: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Description & Condition Notes
                        </label>
                        <input
                          type="text"
                          placeholder="Genuine OEM part in original box, ready for same-day dispatch..."
                          value={newPartForm.description}
                          onChange={e => setNewPartForm({ ...newPartForm, description: e.target.value })}
                          className="w-full bg-white border border-slate-300 rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>

                      <div className="flex items-end justify-between gap-3">
                        <label className="flex items-center gap-2 text-xs font-bold text-slate-700 cursor-pointer py-2.5">
                          <input
                            type="checkbox"
                            checked={newPartForm.featured}
                            onChange={e => setNewPartForm({ ...newPartForm, featured: e.target.checked })}
                            className="w-4 h-4 text-indigo-600 rounded"
                          />
                          Featured on Home Page
                        </label>

                        <button
                          type="submit"
                          disabled={isSubmittingPart}
                          className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white font-bold px-6 py-2.5 rounded-xl text-xs shadow-md transition-all"
                        >
                          {isSubmittingPart ? 'Saving...' : 'Publish to Store Stock'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Store Inventory Table */}
                {loadingProducts ? (
                  <div className="p-12 text-center text-slate-500 text-sm animate-pulse">
                    Loading store inventory...
                  </div>
                ) : filteredLocalProducts.length === 0 ? (
                  <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
                    <span className="text-4xl">📦</span>
                    <p className="font-semibold text-slate-700">No matching parts in your local inventory.</p>
                    <div className="flex gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddLocalModal(true)}
                        className="px-4 py-2 bg-indigo-600 text-white text-xs font-bold rounded-xl"
                      >
                        + Add Local Shop Part
                      </button>
                      <button
                        type="button"
                        onClick={() => setInventorySourceTab('speero')}
                        className="px-4 py-2 bg-emerald-600 text-white text-xs font-bold rounded-xl"
                      >
                        ⚡ Import from Speero API
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                          <th className="px-6 py-3.5 font-bold">Part Details</th>
                          <th className="px-4 py-3.5 font-bold">Brand & Category</th>
                          <th className="px-4 py-3.5 font-bold">Source</th>
                          <th className="px-4 py-3.5 font-bold">Weight</th>
                          <th className="px-4 py-3.5 font-bold">Stock Status</th>
                          <th className="px-4 py-3.5 font-bold">Price (SAR)</th>
                          <th className="px-6 py-3.5 font-bold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredLocalProducts.map(prod => {
                          const isSpeero = (prod.description || '').includes('Speero SKU:');
                          const isOut = prod.status === 'out_of_stock';
                          return (
                            <tr key={prod.id} className="hover:bg-slate-50/80 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-12 h-12 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0 text-xl">
                                    <img
                                      src={resolvePartImage(prod.image, prod.category, prod.name)}
                                      alt={prod.name}
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = getFallbackPartSvg(prod.category, prod.name);
                                      }}
                                      className="w-full h-full object-cover"
                                    />
                                  </div>
                                  <div>
                                    <div className="font-bold text-slate-800 line-clamp-1 max-w-md">
                                      {prod.name}
                                    </div>
                                    <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                                      {prod.tecdocArticleId && (
                                        <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded text-slate-600">
                                          OEM: {prod.tecdocArticleId}
                                        </span>
                                      )}
                                      {prod.featured && (
                                        <span className="text-indigo-600 font-semibold">★ Featured</span>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </td>

                              <td className="px-4 py-4">
                                {prod.brandName && (
                                  <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-xs mb-1">
                                    {prod.brandName}
                                  </span>
                                )}
                                <div className="text-xs text-slate-500">{prod.category}</div>
                              </td>

                              <td className="px-4 py-4">
                                {isSpeero ? (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                    ⚡ Speero API
                                  </span>
                                ) : (
                                  <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700">
                                    🏪 Local Shop
                                  </span>
                                )}
                              </td>

                              <td className="px-4 py-4 text-xs font-semibold text-slate-600">
                                {Number(prod.weight || 1.5).toFixed(2)} kg
                              </td>

                              <td className="px-4 py-4">
                                <button
                                  type="button"
                                  onClick={() =>
                                    handleUpdateProduct(prod.id, {
                                      status: isOut ? 'active' : 'out_of_stock'
                                    })
                                  }
                                  className={`px-2.5 py-1 rounded-full text-xs font-bold transition-colors ${
                                    isOut
                                      ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                      : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                                  }`}
                                  title="Click to toggle stock availability"
                                >
                                  {isOut ? 'Out of Stock' : '✓ In Stock'}
                                </button>
                              </td>

                              <td className="px-4 py-4">
                                {editingPriceId === prod.id ? (
                                  <div className="flex items-center gap-1.5">
                                    <input
                                      type="number"
                                      step="0.01"
                                      value={editingPriceVal}
                                      onChange={e => setEditingPriceVal(e.target.value)}
                                      className="w-24 border border-indigo-400 rounded-lg px-2 py-1 text-xs font-bold outline-none"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        handleUpdateProduct(prod.id, { price: editingPriceVal })
                                      }
                                      className="px-2 py-1 bg-indigo-600 text-white rounded text-xs font-bold"
                                    >
                                      Save
                                    </button>
                                  </div>
                                ) : (
                                  <div
                                    onClick={() => {
                                      setEditingPriceId(prod.id);
                                      setEditingPriceVal(String(prod.price));
                                    }}
                                    className="font-black text-slate-800 cursor-pointer hover:text-indigo-600 flex items-center gap-1"
                                    title="Click to edit price"
                                  >
                                    <span>SAR {Number(prod.price).toFixed(2)}</span>
                                    <span className="text-[10px] text-slate-400">✎</span>
                                  </div>
                                )}
                              </td>

                              <td className="px-6 py-4 text-right">
                                <button
                                  type="button"
                                  onClick={() => handleDeleteProduct(prod.id, prod.name)}
                                  className="text-xs font-bold text-red-500 hover:text-red-700 px-2.5 py-1 rounded-lg hover:bg-red-50 transition-colors"
                                >
                                  Remove
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ---------- SUB-TAB B: SPEERO API PARTS STOCK ---------- */}
            {inventorySourceTab === 'speero' && (
              <div className="flex flex-col gap-6">
                {/* Speero API Configuration & Pricing Markup Bar */}
                <div className="bg-gradient-to-r from-emerald-950 to-slate-900 text-white p-6 rounded-2xl border border-emerald-500/30 shadow-lg flex flex-col gap-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2.5">
                        <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 text-[11px] font-bold uppercase tracking-wider">
                          ⚡ Speero KSA API Integration
                        </span>
                        <span className="text-xs text-emerald-300 font-semibold">
                          • Live Warehouse Stock Feed
                        </span>
                      </div>
                      <h3 className="text-xl font-black mt-2">
                        Import & Sync Parts Stock from Speero API
                      </h3>
                      <p className="text-xs text-slate-300 mt-1 max-w-2xl">
                        Browse verified OEM, Aftermarket, and Grade-A Tashleeh stock from Speero&apos;s Saudi distributor network and import directly into{' '}
                        <strong>{activeTenant?.name || 'your store'}</strong> with automatic retail markup.
                      </p>
                    </div>

                    <button
                      type="button"
                      onClick={handleBulkSyncSpeero}
                      disabled={bulkSyncingSpeero || speeroItems.length === 0}
                      className="bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black px-5 py-3 rounded-xl text-xs transition-all shadow-lg flex items-center justify-center gap-2 shrink-0"
                    >
                      <span>⚡</span>
                      {bulkSyncingSpeero
                        ? 'Syncing Speero Stock...'
                        : `Sync All ${speeroItems.length} Matching Speero Parts to Store`}
                    </button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-4 border-t border-white/10 text-xs">
                    <div>
                      <label className="block text-[11px] font-bold text-emerald-200 mb-1">
                        Speero Partner API Key (Optional)
                      </label>
                      <input
                        type="password"
                        placeholder="Using Parto-Speero Network Key..."
                        value={speeroApiKey}
                        onChange={e => setSpeeroApiKey(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-emerald-200 mb-1">
                        Filter by Vehicle Brand
                      </label>
                      <select
                        value={speeroBrandFilter}
                        onChange={e => setSpeeroBrandFilter(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                      >
                        <option value="all">All 12 Vehicle Brands</option>
                        {VEHICLE_BRANDS.map(b => (
                          <option key={b} value={b}>
                            {b}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-emerald-200 mb-1">
                        Price Base & Retail Markup
                      </label>
                      <div className="flex gap-2">
                        <select
                          value={useWholesaleBase ? 'wholesale' : 'retail'}
                          onChange={e => setUseWholesaleBase(e.target.value === 'wholesale')}
                          className="flex-1 bg-slate-900/90 border border-slate-700 rounded-xl px-2.5 py-2 text-white outline-none"
                        >
                          <option value="retail">Suggested Retail</option>
                          <option value="wholesale">Speero Wholesale</option>
                        </select>
                        <select
                          value={speeroMarkup}
                          onChange={e => setSpeeroMarkup(Number(e.target.value))}
                          className="w-24 bg-slate-900/90 border border-slate-700 rounded-xl px-2 py-2 text-emerald-300 font-bold outline-none"
                        >
                          <option value={0}>+0%</option>
                          <option value={10}>+10%</option>
                          <option value={15}>+15%</option>
                          <option value={20}>+20%</option>
                          <option value={25}>+25%</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-emerald-200 mb-1">
                        Search OEM # / Part / Model
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. 04465-33471, Brembo, Camry..."
                        value={speeroQuery}
                        onChange={e => setSpeeroQuery(e.target.value)}
                        className="w-full bg-slate-900/90 border border-slate-700 rounded-xl px-3 py-2 text-white outline-none focus:border-emerald-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Speero Catalog Table */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                  <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
                    <span className="text-sm font-bold text-slate-800">
                      Available Speero Distributor Stock ({speeroItems.length} parts)
                    </span>
                    <div className="flex items-center gap-2">
                      {['all', 'New OEM', 'Aftermarket', 'Tashleeh'].map(cond => (
                        <button
                          key={cond}
                          type="button"
                          onClick={() => setSpeeroConditionFilter(cond)}
                          className={`px-3 py-1 rounded-full text-xs font-bold transition-colors ${
                            speeroConditionFilter === cond
                              ? 'bg-emerald-600 text-white'
                              : 'bg-slate-200/70 text-slate-600 hover:bg-slate-200'
                          }`}
                        >
                          {cond === 'all' ? 'All Conditions' : cond}
                        </button>
                      ))}
                    </div>
                  </div>

                  {loadingSpeero ? (
                    <div className="p-12 text-center text-slate-500 text-sm animate-pulse">
                      Querying Speero KSA warehouse inventory...
                    </div>
                  ) : (
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="bg-slate-50 text-slate-500 text-[11px] uppercase tracking-wider border-b border-slate-200">
                            <th className="px-6 py-3.5 font-bold">Speero SKU / Part</th>
                            <th className="px-4 py-3.5 font-bold">Brand & Condition</th>
                            <th className="px-4 py-3.5 font-bold">KSA Warehouse</th>
                            <th className="px-4 py-3.5 font-bold">Wholesale</th>
                            <th className="px-4 py-3.5 font-bold">Your Store Price</th>
                            <th className="px-6 py-3.5 font-bold text-right">Import Action</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 text-sm">
                          {speeroItems.map(item => {
                            const alreadyInStore = existingProductNames.has(item.name.toLowerCase());
                            const basePrice = useWholesaleBase
                              ? item.wholesalePrice
                              : item.suggestedRetailPrice;
                            const calculatedListingPrice = (
                              basePrice *
                              (1 + speeroMarkup / 100)
                            ).toFixed(2);

                            return (
                              <tr key={item.speeroSku} className="hover:bg-slate-50 transition-colors">
                                <td className="px-6 py-4">
                                  <div className="flex items-center gap-3">
                                    <img
                                      src={resolvePartImage(item.image, item.category, item.name)}
                                      alt={item.name}
                                      onError={(e) => {
                                        e.currentTarget.onerror = null;
                                        e.currentTarget.src = getFallbackPartSvg(item.category, item.name);
                                      }}
                                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 shrink-0"
                                    />
                                    <div>
                                      <div className="flex items-center gap-2">
                                        <span className="font-mono text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200">
                                          {item.speeroSku}
                                        </span>
                                        <span className="font-mono text-[11px] text-slate-400">
                                          OEM: {item.oemPartNumber}
                                        </span>
                                      </div>
                                      <div className="font-bold text-slate-800 mt-1 line-clamp-1">
                                        {item.name}
                                      </div>
                                      <div className="text-[11px] text-slate-400">
                                        Fits: {item.compatibility?.join(', ')} • Weight: {item.weight} kg
                                      </div>
                                    </div>
                                  </div>
                                </td>

                                <td className="px-4 py-4">
                                  <span className="inline-block px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 font-bold text-xs mb-1">
                                    {item.brandName}
                                  </span>
                                  <div className="text-xs text-slate-600 font-medium">
                                    {item.condition}
                                  </div>
                                </td>

                                <td className="px-4 py-4">
                                  <div className="font-bold text-slate-700 text-xs">
                                    📍 {item.warehouseCity}
                                  </div>
                                  <div className="text-xs text-emerald-600 font-semibold">
                                    {item.stockQty} units available
                                  </div>
                                </td>

                                <td className="px-4 py-4 text-xs text-slate-500">
                                  <div>SAR {item.wholesalePrice.toFixed(2)}</div>
                                  <div className="text-[10px] text-slate-400">
                                    MSRP: SAR {item.suggestedRetailPrice.toFixed(2)}
                                  </div>
                                </td>

                                <td className="px-4 py-4">
                                  <span className="font-black text-indigo-700">
                                    SAR {calculatedListingPrice}
                                  </span>
                                </td>

                                <td className="px-6 py-4 text-right">
                                  {alreadyInStore ? (
                                    <span className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold">
                                      ✓ In Your Store
                                    </span>
                                  ) : (
                                    <button
                                      type="button"
                                      disabled={importingSku === item.speeroSku}
                                      onClick={() => handleImportSpeeroItem(item)}
                                      className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white text-xs font-bold transition-all shadow-sm"
                                    >
                                      {importingSku === item.speeroSku
                                        ? 'Importing...'
                                        : '+ Add to Store Stock'}
                                    </button>
                                  )}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 2: STORE ORDERS & PAYOUTS ==================== */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <h2 className="text-lg font-bold text-slate-800">
                Recent Orders {activeTenant ? `— ${activeTenant.name}` : ''}
              </h2>
              <button
                onClick={() => fetchOrders(tenantId)}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                ↻ Refresh
              </button>
            </div>

            {loadingOrders ? (
              <div className="p-12 text-center text-slate-500 font-medium animate-pulse">
                Loading orders...
              </div>
            ) : orders.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
                <span className="text-4xl">📦</span>
                <p>
                  No orders have been routed to <strong>{activeTenant?.name || 'this store'}</strong> yet.
                </p>
                <p className="text-xs text-slate-400">
                  Use the store switcher in the top-right bar to view another seller&apos;s orders.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider border-b border-slate-200">
                      <th className="px-6 py-4 font-bold">Order ID</th>
                      <th className="px-6 py-4 font-bold">Customer Details</th>
                      <th className="px-6 py-4 font-bold">Items</th>
                      <th className="px-6 py-4 font-bold">Status</th>
                      <th className="px-6 py-4 font-bold text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {orders.map(order => (
                      <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="font-mono font-bold text-indigo-700">{order.orderNumber}</div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-700">
                            {order.metadata?.shippingAddress?.name ||
                              `${order.metadata?.shippingAddress?.firstName || ''} ${
                                order.metadata?.shippingAddress?.lastName || ''
                              }`.trim() ||
                              'Guest'}
                          </div>
                          <div className="text-xs text-slate-500">
                            {order.metadata?.shippingAddress?.city || 'Riyadh'}
                            {order.metadata?.shippingAddress?.phone
                              ? ` • ${order.metadata.shippingAddress.phone}`
                              : ''}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <ul className="text-xs text-slate-600 flex flex-col gap-1">
                            {order.metadata?.items?.map((item: any, idx: number) => (
                              <li key={idx} className="flex gap-2">
                                <span className="font-bold text-slate-800">{item.quantity}x</span>
                                <span
                                  className="truncate max-w-[220px]"
                                  title={item.product?.name}
                                >
                                  {item.product?.name}
                                </span>
                              </li>
                            ))}
                          </ul>
                        </td>
                        <td className="px-6 py-4">
                          {order.status === 'paid' ? (
                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">
                              Paid
                            </span>
                          ) : order.status === 'pending_cod' ? (
                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold uppercase">
                              COD Pending
                            </span>
                          ) : (
                            <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold uppercase">
                              {order.status}
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="font-bold text-slate-800">SAR {order.totalAmount}</div>
                          <div className="text-[10px] text-slate-400 mt-1">
                            {order.metadata?.paymentMethod?.toUpperCase()}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* ==================== TAB 3: CUSTOMER PART REQUESTS (SPEERO / TASHLEEH RFQ) ==================== */}
        {activeTab === 'rfq' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  Customer Part Requests (Tashleeh & Speero RFQ Broadcasts)
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Quote directly on incoming part requests from drivers across Saudi Arabia.
                </p>
              </div>
              <button
                onClick={() => fetchPartRequests(tenantId)}
                className="text-sm font-semibold text-indigo-600 hover:text-indigo-800"
              >
                ↻ Refresh Requests
              </button>
            </div>

            {loadingRfq ? (
              <div className="p-12 text-center text-slate-500 animate-pulse">
                Loading incoming part requests...
              </div>
            ) : partRequests.length === 0 ? (
              <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-2">
                <span className="text-4xl">🔍</span>
                <p className="font-semibold text-slate-700">No pending customer part requests right now.</p>
                <p className="text-xs text-slate-400">
                  When customers request a specific OEM or used part via Tashleeh/RFQ, it will appear here for instant quoting.
                </p>
              </div>
            ) : (
              <div className="p-6 flex flex-col gap-4">
                {partRequests.map(req => {
                  const existingQuote = myQuotes.find(q => q.requestId === req.id);
                  const currentInput = quoteInputs[req.id] || {
                    price: '',
                    condition: 'New OEM',
                    notes: ''
                  };

                  return (
                    <div
                      key={req.id}
                      className="p-5 rounded-2xl border border-slate-200 bg-slate-50/60 flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-xs font-bold">
                            {req.vehicleYear} {req.vehicleMake} {req.vehicleModel}
                          </span>
                          <span className="text-xs text-slate-400">
                            Requested by {req.customerName} ({req.customerPhone})
                          </span>
                        </div>
                        <h4 className="text-base font-black text-slate-900 mt-1.5">
                          Part Needed: {req.partName}
                        </h4>
                      </div>

                      {existingQuote ? (
                        <div className="px-4 py-2.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold">
                          ✓ Quoted SAR {existingQuote.price} ({existingQuote.condition}) — Status:{' '}
                          {existingQuote.status.toUpperCase()}
                        </div>
                      ) : (
                        <div className="flex flex-wrap items-center gap-2">
                          <input
                            type="number"
                            placeholder="Price (SAR)"
                            value={currentInput.price}
                            onChange={e =>
                              setQuoteInputs(prev => ({
                                ...prev,
                                [req.id]: { ...currentInput, price: e.target.value }
                              }))
                            }
                            className="w-28 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                          <select
                            value={currentInput.condition}
                            onChange={e =>
                              setQuoteInputs(prev => ({
                                ...prev,
                                [req.id]: { ...currentInput, condition: e.target.value }
                              }))
                            }
                            className="bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none"
                          >
                            <option value="New OEM">New OEM</option>
                            <option value="Aftermarket">Aftermarket</option>
                            <option value="Used - Like New">Used - Like New</option>
                            <option value="Used - Good">Used - Good</option>
                          </select>
                          <input
                            type="text"
                            placeholder="Warranty / delivery note..."
                            value={currentInput.notes}
                            onChange={e =>
                              setQuoteInputs(prev => ({
                                ...prev,
                                [req.id]: { ...currentInput, notes: e.target.value }
                              }))
                            }
                            className="w-44 bg-white border border-slate-300 rounded-xl px-3 py-2 text-xs outline-none"
                          />
                          <button
                            type="button"
                            onClick={() => handleSubmitQuote(req.id)}
                            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-4 py-2 rounded-xl text-xs transition-all"
                          >
                            Send Quote
                          </button>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function PortalPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-slate-50 flex items-center justify-center">
          Loading Seller Portal...
        </div>
      }
    >
      <PortalContentInner />
    </Suspense>
  );
}
