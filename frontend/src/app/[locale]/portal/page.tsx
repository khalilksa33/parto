'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';

function PortalContentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useParams()?.locale || 'en';
  
  const [tenantId, setTenantId] = useState(searchParams?.get('tenantId') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!searchParams?.get('tenantId'));
  const [loginMode, setLoginMode] = useState<'credentials' | 'tenantId'>('credentials');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [authLoading, setAuthLoading] = useState(false);

  const [tenants, setTenants] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Sync URL ?tenantId= changes
  useEffect(() => {
    const urlTenantId = searchParams?.get('tenantId');
    if (urlTenantId && urlTenantId !== tenantId) {
      setTenantId(urlTenantId);
      setIsLoggedIn(true);
    }
  }, [searchParams]);

  // Fetch all tenants so we can show store names and a quick-switcher
  useEffect(() => {
    fetch('/api/tenants')
      .then(res => res.ok ? res.json() : [])
      .then(data => {
        const list = Array.isArray(data) ? data : (data.tenants || []);
        setTenants(list);
      })
      .catch(err => console.error('Failed to load tenants', err));
  }, []);

  // Auto-check if user already has an active vendor session cookie
  useEffect(() => {
    if (!searchParams?.get('tenantId')) {
      fetch('/api/auth/me')
        .then(res => res.ok ? res.json() : null)
        .then(data => {
          if (data?.authenticated && data?.user?.tenantId) {
            setTenantId(data.user.tenantId);
            setIsLoggedIn(true);
            router.replace(`/${locale}/portal?tenantId=${data.user.tenantId}`);
          }
        })
        .catch(() => {});
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn && tenantId) {
      fetchOrders(tenantId);
    }
  }, [isLoggedIn, tenantId]);

  const fetchOrders = async (targetTenantId = tenantId) => {
    if (!targetTenantId) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?tenantId=${targetTenantId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(Array.isArray(data) ? data : (data.orders || []));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

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
        // Resolve tenantId from user object or /api/auth/me
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
    router.push(`/${locale}/portal`);
  };

  const activeTenant = tenants.find(t => t.id === tenantId);

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-8 sm:p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-200">
          <div className="text-center mb-6">
            <h1 className="text-2xl font-black text-indigo-900 mb-2">Vendor Portal</h1>
            <p className="text-slate-500 text-sm">Sign in with your vendor account or Tenant ID to view live orders and payouts.</p>
          </div>

          {/* Login Mode Toggle */}
          <div className="flex rounded-xl bg-slate-100 p-1 mb-6">
            <button
              type="button"
              onClick={() => { setLoginMode('credentials'); setLoginError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginMode === 'credentials' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
            >
              Email & Password
            </button>
            <button
              type="button"
              onClick={() => { setLoginMode('tenantId'); setLoginError(''); }}
              className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${loginMode === 'tenantId' ? 'bg-white text-indigo-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
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
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Vendor Email</label>
                  <input 
                    type="email" 
                    required 
                    className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 text-slate-900 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                    placeholder="e.g. luxury@parto.com or riyadh@parto.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Password</label>
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
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Tenant ID</label>
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
              {authLoading ? 'Signing in...' : 'Access Dashboard'}
            </button>
          </form>

          {/* Quick Demo Store Switcher */}
          {tenants.filter(t => t.status === 'active').length > 0 && (
            <div className="mt-6 pt-6 border-t border-slate-200">
              <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 text-center">
                Quick Access Active Demo Stores
              </label>
              <div className="flex flex-col gap-2">
                {tenants.filter(t => t.status === 'active').map(t => (
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

  // Calculate totals
  const totalRevenue = orders.reduce((sum, order) => sum + parseFloat(order.totalAmount || '0'), 0);
  const totalOrders = orders.length;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          <div className="text-xl font-black text-indigo-900 flex items-center gap-3">
            <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-lg flex items-center justify-center">🏪</span>
            <div>
              <span>{activeTenant ? activeTenant.name : 'Vendor Dashboard'}</span>
              {activeTenant && <span className="ml-2 text-xs font-semibold text-slate-400 hidden sm:inline">Vendor Dashboard</span>}
            </div>
          </div>
          <div className="flex items-center gap-3 text-sm font-semibold text-slate-600">
            {tenants.filter(t => t.status === 'active').length > 1 && (
              <select
                value={tenantId}
                onChange={(e) => handleQuickSelectStore(e.target.value)}
                className="bg-slate-100 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500 cursor-pointer"
                title="Switch active seller store"
              >
                {tenants.filter(t => t.status === 'active').map(t => (
                  <option key={t.id} value={t.id}>
                    Store: {t.name}
                  </option>
                ))}
              </select>
            )}
            <span className="font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200 hidden md:inline text-xs">
              ID: {tenantId.substring(0,8)}...
            </span>
            <button onClick={() => router.push(`/${locale}`)} className="text-slate-500 hover:text-slate-800 text-xs">
              Marketplace
            </button>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700 text-xs font-bold">
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Sales Revenue</span>
            <span className="text-3xl font-black text-slate-800">SAR {totalRevenue.toFixed(2)}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Total Orders</span>
            <span className="text-3xl font-black text-slate-800">{totalOrders}</span>
          </div>
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-2">
            <span className="text-slate-500 text-sm font-bold uppercase tracking-wider">Pending COD</span>
            <span className="text-3xl font-black text-amber-500">
              {orders.filter(o => o.status === 'pending_cod').length}
            </span>
          </div>
        </div>

        {/* Orders Table */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 py-5 border-b border-slate-200 flex items-center justify-between bg-slate-50">
            <h2 className="text-lg font-bold text-slate-800">
              Recent Orders {activeTenant ? `— ${activeTenant.name}` : ''}
            </h2>
            <button onClick={() => fetchOrders(tenantId)} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">↻ Refresh</button>
          </div>
          
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
              <span className="text-4xl">📦</span>
              <p>No orders have been routed to <strong>{activeTenant?.name || 'this store'}</strong> yet.</p>
              <p className="text-xs text-slate-400">If you ordered an item from another seller (e.g., Luxury Parts Co or Riyadh OEM Parts), use the store switcher in the top-right bar to view that store's orders.</p>
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
                        <div className="text-[10px] text-slate-400 mt-1">{new Date(order.createdAt).toLocaleDateString()}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="font-semibold text-slate-700">
                          {order.metadata?.shippingAddress?.name || 
                           `${order.metadata?.shippingAddress?.firstName || ''} ${order.metadata?.shippingAddress?.lastName || ''}`.trim() || 
                           'Guest'}
                        </div>
                        <div className="text-xs text-slate-500">
                          {order.metadata?.shippingAddress?.city || 'Riyadh'}{order.metadata?.shippingAddress?.phone ? ` • ${order.metadata.shippingAddress.phone}` : ''}
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <ul className="text-xs text-slate-600 flex flex-col gap-1">
                          {order.metadata?.items?.map((item:any, idx:number) => (
                            <li key={idx} className="flex gap-2">
                              <span className="font-bold text-slate-800">{item.quantity}x</span>
                              <span className="truncate max-w-[220px]" title={item.product?.name}>{item.product?.name}</span>
                            </li>
                          ))}
                        </ul>
                      </td>
                      <td className="px-6 py-4">
                        {order.status === 'paid' ? (
                          <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-bold uppercase">Paid</span>
                        ) : order.status === 'pending_cod' ? (
                          <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded text-xs font-bold uppercase">COD Pending</span>
                        ) : (
                          <span className="px-2 py-1 bg-slate-100 text-slate-700 rounded text-xs font-bold uppercase">{order.status}</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="font-bold text-slate-800">SAR {order.totalAmount}</div>
                        <div className="text-[10px] text-slate-400 mt-1">{order.metadata?.paymentMethod?.toUpperCase()}</div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

export default function PortalPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-50 flex items-center justify-center">Loading...</div>}>
      <PortalContentInner />
    </Suspense>
  );
}
