'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';

function PortalContentInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const locale = useParams()?.locale || 'en';
  
  const [tenantId, setTenantId] = useState(searchParams?.get('tenantId') || '');
  const [isLoggedIn, setIsLoggedIn] = useState(!!searchParams?.get('tenantId'));
  
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn && tenantId) {
      fetchOrders();
    }
  }, [isLoggedIn, tenantId]);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/orders?tenantId=${tenantId}`);
      if (res.ok) {
        const data = await res.json();
        setOrders(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (tenantId.trim()) {
      setIsLoggedIn(true);
      router.push(`/${locale}/portal?tenantId=${tenantId}`);
    }
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setTenantId('');
    setOrders([]);
    router.push(`/${locale}/portal`);
  };

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white p-10 rounded-3xl shadow-xl max-w-md w-full border border-slate-200">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-black text-indigo-900 mb-2">Vendor Portal</h1>
            <p className="text-slate-500 text-sm">Enter your assigned Tenant ID to view your live orders and payouts.</p>
          </div>
          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Tenant ID</label>
              <input 
                type="text" 
                required 
                className="w-full bg-slate-50 border border-slate-300 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                placeholder="e.g. 550e8400-e29b-41d4-a716-446655440000"
                value={tenantId}
                onChange={e => setTenantId(e.target.value)}
              />
            </div>
            <button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl transition-all shadow-md hover:shadow-lg mt-2">
              Access Dashboard
            </button>
          </form>
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
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="text-xl font-black text-indigo-900 flex items-center gap-3">
            <span className="bg-indigo-100 text-indigo-700 w-8 h-8 rounded-lg flex items-center justify-center">🏪</span>
            Vendor Dashboard
          </div>
          <div className="flex items-center gap-4 text-sm font-semibold text-slate-600">
            <span className="font-mono bg-slate-100 px-2 py-1 rounded border border-slate-200">ID: {tenantId.substring(0,8)}...</span>
            <button onClick={handleLogout} className="text-red-500 hover:text-red-700">Logout</button>
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
            <h2 className="text-lg font-bold text-slate-800">Recent Orders</h2>
            <button onClick={fetchOrders} className="text-sm font-semibold text-indigo-600 hover:text-indigo-800">↻ Refresh</button>
          </div>
          
          {loading ? (
            <div className="p-12 text-center text-slate-500 font-medium animate-pulse">Loading orders...</div>
          ) : orders.length === 0 ? (
            <div className="p-12 text-center text-slate-500 flex flex-col items-center gap-3">
              <span className="text-4xl">📦</span>
              <p>No orders have been routed to your store yet.</p>
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
                        <div className="font-semibold text-slate-700">{order.metadata?.shippingAddress?.name || 'Guest'}</div>
                        <div className="text-xs text-slate-500">{order.metadata?.shippingAddress?.city}, {order.metadata?.shippingAddress?.country}</div>
                      </td>
                      <td className="px-6 py-4">
                        <ul className="text-xs text-slate-600 flex flex-col gap-1">
                          {order.metadata?.items?.map((item:any, idx:number) => (
                            <li key={idx} className="flex gap-2">
                              <span className="font-bold text-slate-800">{item.quantity}x</span>
                              <span className="truncate max-w-[150px]" title={item.product?.name}>{item.product?.name}</span>
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
