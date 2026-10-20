'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useCart, CartItem } from '@/components/CartProvider';
import { useRouter, useParams } from 'next/navigation';

function buildLocalShippingRates(items: CartItem[], destinationCity: string) {
  const grouped: Record<string, CartItem[]> = {};
  for (const item of items) {
    const tId = item.product.tenantId || 'default-seller';
    if (!grouped[tId]) grouped[tId] = [];
    grouped[tId].push(item);
  }

  const originCity = 'Riyadh';
  const isSameCity = (destinationCity || 'Riyadh').trim().toLowerCase() === originCity.toLowerCase();

  const shipments = Object.entries(grouped).map(([tId, tenantItems]) => {
    let totalWeight = 0;
    let maxLength = 0;
    let maxWidth = 0;
    let totalHeight = 0;

    for (const item of tenantItems) {
      totalWeight += (Number(item.product.weight) || 1.5) * item.quantity;
      maxLength = Math.max(maxLength, Number(item.product.length) || 20);
      maxWidth = Math.max(maxWidth, Number(item.product.width) || 15);
      totalHeight += (Number(item.product.height) || 10) * item.quantity;
    }

    const volumetricWeight = (maxLength * maxWidth * totalHeight) / 5000;
    const billableWeight = Math.max(0.5, totalWeight, volumetricWeight);
    const extraKg = Math.max(0, billableWeight - 1);

    const splAmount = ((isSameCity ? 15 : 20) + extraKg * (isSameCity ? 1.0 : 1.75)).toFixed(2);
    const smsaAmount = ((isSameCity ? 18 : 25) + extraKg * (isSameCity ? 1.5 : 2.5)).toFixed(2);
    const aramexAmount = ((isSameCity ? 21 : 28) + extraKg * (isSameCity ? 1.75 : 2.75)).toFixed(2);
    const dhlAmount = ((isSameCity ? 35 : 45) + extraKg * (isSameCity ? 2.5 : 4.0)).toFixed(2);

    return {
      tenantId: tId,
      sellerName: `Seller #${tId.substring(0, 6)}`,
      originCity,
      destinationCity: destinationCity || 'Riyadh',
      totalWeight: Number(totalWeight.toFixed(2)),
      rates: [
        {
          id: 'spl-economy',
          provider: 'SPL (Saudi Post)',
          servicelevel: { name: isSameCity ? 'City Parcel' : 'Economy Domestic' },
          estimatedDays: isSameCity ? '2-3 Days' : '3-5 Days',
          amount: splAmount,
          currency: 'SAR'
        },
        {
          id: 'smsa-standard',
          provider: 'SMSA Express',
          servicelevel: { name: isSameCity ? 'Same-City Express' : 'Standard KSA' },
          estimatedDays: isSameCity ? '1-2 Days' : '2-3 Days',
          amount: smsaAmount,
          currency: 'SAR'
        },
        {
          id: 'aramex-domestic',
          provider: 'Aramex',
          servicelevel: { name: 'Domestic Parcel' },
          estimatedDays: isSameCity ? '1-2 Days' : '2-4 Days',
          amount: aramexAmount,
          currency: 'SAR'
        },
        {
          id: 'dhl-express',
          provider: 'DHL Express',
          servicelevel: { name: 'Priority Next Day' },
          estimatedDays: '1 Business Day',
          amount: dhlAmount,
          currency: 'SAR'
        }
      ]
    };
  });

  return { multiOrigin: true, shipments };
}

export default function CheckoutPage() {
  const { items, subtotal, clearCart, isCartOpen, setIsCartOpen, isHydrated } = useCart();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';

  const [shippingRates, setShippingRates] = useState<any>(null);
  const [selectedRates, setSelectedRates] = useState<Record<string, string>>({});
  const [isCalculating, setIsCalculating] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    address: '',
    city: 'Riyadh',
    district: '',
    zip: ''
  });

  const [paymentMethod, setPaymentMethod] = useState<'card' | 'applepay' | 'cod'>('card');

  // Group items visually by seller
  const itemsBySeller = useMemo(() => {
    return items.reduce((acc, item) => {
      const tId = item.product.tenantId;
      if (!acc[tId]) acc[tId] = [];
      acc[tId].push(item);
      return acc;
    }, {} as Record<string, typeof items>);
  }, [items]);

  useEffect(() => {
    if (isCartOpen) setIsCartOpen(false);
    if (isHydrated && items.length === 0 && !isProcessing) {
      router.push(`/${locale}`);
    }
  }, [items, isCartOpen, isHydrated, router, locale, isProcessing, setIsCartOpen]);

  const calculateShippingRates = useCallback(async () => {
    if (items.length === 0) return;

    setIsCalculating(true);
    try {
      const res = await fetch('/api/shipping/rates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          addressTo: {
            name: `${formData.firstName} ${formData.lastName}`.trim() || 'Customer',
            street1: formData.address || 'King Fahd Road',
            city: formData.city || 'Riyadh',
            state: 'RIY',
            zip: formData.zip || '12211',
            country: 'SA'
          },
          cartItems: items.map(i => ({
            productId: i.product.id,
            quantity: i.quantity,
            tenantId: i.product.tenantId,
            product: i.product
          }))
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.multiOrigin && Array.isArray(data.shipments) && data.shipments.length > 0) {
          setShippingRates(data);
          setSelectedRates(prev => {
            const next = { ...prev };
            for (const ship of data.shipments) {
              if (!next[ship.tenantId] && ship.rates?.length > 0) {
                const cheapest = [...ship.rates].sort(
                  (a: any, b: any) => parseFloat(a.amount) - parseFloat(b.amount)
                )[0];
                next[ship.tenantId] = cheapest.id || cheapest.provider;
              }
            }
            return next;
          });
          return;
        }
      }

      // Fallback to deterministic KSA shipping calculation if API fails or returns empty
      const fallback = buildLocalShippingRates(items, formData.city);
      setShippingRates(fallback);
      setSelectedRates(prev => {
        const next = { ...prev };
        for (const ship of fallback.shipments) {
          if (!next[ship.tenantId] && ship.rates?.length > 0) {
            next[ship.tenantId] = ship.rates[1]?.id || ship.rates[0].id;
          }
        }
        return next;
      });
    } catch (err) {
      console.error('Failed to fetch shipping rates, using built-in KSA calculator:', err);
      const fallback = buildLocalShippingRates(items, formData.city);
      setShippingRates(fallback);
      setSelectedRates(prev => {
        const next = { ...prev };
        for (const ship of fallback.shipments) {
          if (!next[ship.tenantId] && ship.rates?.length > 0) {
            next[ship.tenantId] = ship.rates[1]?.id || ship.rates[0].id;
          }
        }
        return next;
      });
    } finally {
      setIsCalculating(false);
    }
  }, [items, formData.city, formData.zip, formData.address, formData.firstName, formData.lastName]);

  useEffect(() => {
    if (items.length === 0) return;
    // Provide instant initial rates so checkout never shows 0 / unavailable
    if (!shippingRates) {
      const initial = buildLocalShippingRates(items, formData.city);
      setShippingRates(initial);
    }
    const timer = setTimeout(calculateShippingRates, 300);
    return () => clearTimeout(timer);
  }, [items, formData.city, formData.zip]);

  const getSelectedRateForSeller = useCallback((tenantId: string) => {
    if (!shippingRates?.multiOrigin || !Array.isArray(shippingRates.shipments)) return null;
    const ship = shippingRates.shipments.find((s: any) => s.tenantId === tenantId);
    if (!ship || !Array.isArray(ship.rates) || ship.rates.length === 0) return null;

    const chosenId = selectedRates[tenantId];
    if (chosenId) {
      const match = ship.rates.find((r: any) => (r.id || r.provider) === chosenId);
      if (match) return match;
    }

    const sorted = [...ship.rates].sort((a: any, b: any) => parseFloat(a.amount) - parseFloat(b.amount));
    return sorted[0];
  }, [shippingRates, selectedRates]);

  const totalShipping = useMemo(() => {
    if (!shippingRates?.multiOrigin || !Array.isArray(shippingRates.shipments)) return 0;
    return shippingRates.shipments.reduce((sum: number, ship: any) => {
      const rate = getSelectedRateForSeller(ship.tenantId);
      return sum + (rate ? parseFloat(rate.amount) : 18.00);
    }, 0);
  }, [shippingRates, getSelectedRateForSeller]);

  const grandTotal = subtotal + totalShipping;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    try {
      const res = await fetch('/api/checkout/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer: formData,
          cartItems: items,
          shippingRates,
          selectedRates,
          paymentMethod,
          totalAmount: grandTotal
        })
      });

      if (res.ok) {
        const result = await res.json();
        clearCart();
        router.push(`/${locale}/checkout/success?orderIds=${result.orderIds.join(',')}`);
      } else {
        const errData = await res.json();
        alert(`Checkout failed: ${errData.error}`);
        setIsProcessing(false);
      }
    } catch (err) {
      alert('Network error occurred during checkout');
      setIsProcessing(false);
    }
  };

  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-600 font-semibold">
        Loading checkout...
      </div>
    );
  }

  if (items.length === 0 && !isProcessing) return null;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-24">
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div 
            className="text-2xl font-black tracking-tight text-indigo-900 cursor-pointer flex items-center gap-2"
            onClick={() => router.push(`/${locale}`)}
          >
            PARTO <span className="text-sm font-semibold bg-slate-100 text-slate-500 px-2 py-1 rounded-md hidden sm:block">Secure Checkout</span>
          </div>
          <div className="flex items-center gap-2 text-sm font-semibold text-slate-500">
            <span>🛒</span> {items.reduce((s, i) => s + i.quantity, 0)} Items
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 flex flex-col lg:flex-row gap-10">
        
        <div className="flex-1 flex flex-col gap-8">
          <form id="checkout-form" onSubmit={handleCheckout} className="flex flex-col gap-8">
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">1</span>
                Shipping Address
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">First Name</label>
                  <input required type="text" className="px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.firstName} onChange={e => setFormData({...formData, firstName: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Last Name</label>
                  <input required type="text" className="px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.lastName} onChange={e => setFormData({...formData, lastName: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Phone (Saudi)</label>
                  <input required type="tel" placeholder="+966 5X XXX XXXX" className="px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Email Address</label>
                  <input required type="email" className="px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                
                <div className="md:col-span-2 flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">Street Address</label>
                  <input required type="text" className="px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">City</label>
                  <select className="px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none bg-white" value={formData.city} onChange={e => setFormData({...formData, city: e.target.value})}>
                    <option value="Riyadh">Riyadh</option>
                    <option value="Jeddah">Jeddah</option>
                    <option value="Dammam">Dammam</option>
                    <option value="Mecca">Mecca</option>
                    <option value="Medina">Medina</option>
                    <option value="Khobar">Khobar</option>
                    <option value="Abha">Abha</option>
                    <option value="Tabuk">Tabuk</option>
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">District / Postal Code</label>
                  <input type="text" placeholder="e.g. Al Olaya / 12211" className="px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                </div>
              </div>
            </section>

            {/* Section 2: Shipping Calculation & Carrier Selection */}
            <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                  <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">2</span>
                  Shipping Calculation & Carrier
                </h2>
                <button
                  type="button"
                  onClick={calculateShippingRates}
                  disabled={isCalculating}
                  className="text-xs font-bold px-3.5 py-2 rounded-lg bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border border-indigo-200 transition-colors flex items-center gap-1.5 disabled:opacity-60"
                >
                  <span>{isCalculating ? '⏳' : '🔄'}</span>
                  {isCalculating ? 'Calculating Rates...' : 'Recalculate Shipping'}
                </button>
              </div>

              {shippingRates?.multiOrigin && Array.isArray(shippingRates.shipments) ? (
                <div className="flex flex-col gap-6">
                  {shippingRates.shipments.map((ship: any) => {
                    const selectedRate = getSelectedRateForSeller(ship.tenantId);
                    const selectedKey = selectedRate ? (selectedRate.id || selectedRate.provider) : '';
                    return (
                      <div key={ship.tenantId} className="border border-slate-200 rounded-xl p-4 bg-slate-50/60">
                        <div className="flex flex-wrap items-center justify-between gap-2 pb-3 mb-3 border-b border-slate-200 text-xs">
                          <div className="flex items-center gap-2 font-bold text-slate-700">
                            <span>📦 {ship.sellerName || `Seller #${ship.tenantId.substring(0, 6)}`}</span>
                            <span className="text-slate-400">•</span>
                            <span className="text-indigo-600">{ship.originCity || 'Riyadh'} → {formData.city}</span>
                          </div>
                          {ship.totalWeight && (
                            <span className="px-2 py-0.5 bg-white border border-slate-200 rounded text-slate-600 font-semibold">
                              Parcel Weight: {ship.totalWeight} kg
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {(ship.rates || []).map((rate: any, rIdx: number) => {
                            const rateKey = rate.id || rate.provider || String(rIdx);
                            const isSelected = selectedKey === rateKey;
                            return (
                              <label
                                key={rateKey}
                                className={`flex items-center justify-between p-3.5 rounded-xl border-2 cursor-pointer transition-all ${
                                  isSelected
                                    ? 'border-indigo-600 bg-indigo-50/80 shadow-sm'
                                    : 'border-slate-200 bg-white hover:border-indigo-300'
                                }`}
                              >
                                <div className="flex items-center gap-3">
                                  <input
                                    type="radio"
                                    name={`carrier-${ship.tenantId}`}
                                    checked={isSelected}
                                    onChange={() =>
                                      setSelectedRates(prev => ({
                                        ...prev,
                                        [ship.tenantId]: rateKey
                                      }))
                                    }
                                    className="w-4 h-4 text-indigo-600 focus:ring-indigo-500"
                                  />
                                  <div>
                                    <div className="text-sm font-bold text-slate-800">{rate.provider}</div>
                                    <div className="text-xs text-slate-500">
                                      {rate.servicelevel?.name || 'Standard'}
                                      {rate.estimatedDays ? ` • ${rate.estimatedDays}` : ''}
                                    </div>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm font-black text-indigo-700">SAR {parseFloat(rate.amount).toFixed(2)}</div>
                                </div>
                              </label>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm text-slate-600">
                  Calculating shipping routes for {formData.city}...
                </div>
              )}
            </section>

            <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">3</span>
                Payment Method
              </h2>
              
              <div className="flex flex-col gap-4">
                <label className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'card' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}>
                  <input type="radio" name="payment" value="card" checked={paymentMethod === 'card'} onChange={() => setPaymentMethod('card')} className="w-5 h-5 text-indigo-600 focus:ring-indigo-500" />
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">Credit / Debit Card (Mada, Visa, Mastercard)</div>
                    <div className="text-xs text-slate-500">Secure encrypted payment via local gateway</div>
                  </div>
                  <div className="flex gap-1 text-2xl">💳</div>
                </label>
                
                <label className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'applepay' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}>
                  <input type="radio" name="payment" value="applepay" checked={paymentMethod === 'applepay'} onChange={() => setPaymentMethod('applepay')} className="w-5 h-5 text-indigo-600 focus:ring-indigo-500" />
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">Apple Pay</div>
                    <div className="text-xs text-slate-500">Fast and secure checkout</div>
                  </div>
                  <div className="flex gap-1 text-2xl"></div>
                </label>

                <label className={`relative flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${paymentMethod === 'cod' ? 'border-indigo-600 bg-indigo-50' : 'border-slate-200 hover:border-indigo-300'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="w-5 h-5 text-indigo-600 focus:ring-indigo-500" />
                  <div className="flex-1">
                    <div className="font-bold text-slate-800">Cash on Delivery (COD)</div>
                    <div className="text-xs text-slate-500">Pay directly to the courier upon delivery (+SAR 10 fee)</div>
                  </div>
                  <div className="flex gap-1 text-2xl">💵</div>
                </label>
              </div>

              {paymentMethod === 'card' && (
                <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 flex flex-col gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-600">Card Number</label>
                    <input type="text" placeholder="0000 0000 0000 0000" className="px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono" />
                  </div>
                  <div className="flex gap-4">
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600">Expiry</label>
                      <input type="text" placeholder="MM/YY" className="px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono" />
                    </div>
                    <div className="flex-1 flex flex-col gap-1.5">
                      <label className="text-xs font-semibold text-slate-600">CVC</label>
                      <input type="text" placeholder="123" className="px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none font-mono" />
                    </div>
                  </div>
                </div>
              )}
            </section>
          </form>
        </div>

        <div className="w-full lg:w-[400px]">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xl shadow-slate-200/50 sticky top-24">
            <h2 className="text-xl font-bold mb-6">Order Summary</h2>
            
            <div className="flex flex-col gap-4 mb-6">
              {Object.entries(itemsBySeller).map(([tenantId, tenantItems]) => {
                const chosenRate = getSelectedRateForSeller(tenantId);
                return (
                  <div key={tenantId} className="flex flex-col gap-3 pb-4 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="text-xs font-bold text-slate-500 uppercase flex items-center justify-between">
                      <span>Seller Origin</span>
                      <span className="font-mono bg-slate-100 px-2 rounded">#{tenantId.substring(0,6)}</span>
                    </div>
                    {tenantItems.map((item) => (
                      <div key={item.product.id} className="flex justify-between text-sm">
                        <div className="flex gap-3">
                          <span className="font-bold text-slate-700">{item.quantity}x</span>
                          <span className="text-slate-600 line-clamp-1">{item.product.name}</span>
                        </div>
                        <span className="font-semibold text-slate-800 shrink-0">SAR {(item.product.price * item.quantity).toFixed(2)}</span>
                      </div>
                    ))}
                    
                    <div className="mt-1 flex items-center justify-between text-xs text-indigo-700 bg-indigo-50 p-2.5 rounded-lg border border-indigo-100">
                      <span>
                        🚚 {chosenRate ? `${chosenRate.provider} (${formData.city})` : `Shipping (${formData.city})`}
                      </span>
                      <span className="font-bold">
                        SAR {chosenRate ? parseFloat(chosenRate.amount).toFixed(2) : '18.00'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="border-t border-slate-200 pt-4 flex flex-col gap-3 mb-6">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">SAR {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Total Shipping ({formData.city})</span>
                <span className="font-semibold text-slate-800">
                  {isCalculating ? <span className="animate-pulse text-indigo-600">Calculating...</span> : `SAR ${totalShipping.toFixed(2)}`}
                </span>
              </div>
              {paymentMethod === 'cod' && (
                <div className="flex justify-between text-sm text-amber-600">
                  <span>COD Fee</span>
                  <span className="font-semibold">SAR 10.00</span>
                </div>
              )}
            </div>

            <div className="border-t border-slate-200 pt-4 mb-8">
              <div className="flex justify-between items-center">
                <span className="font-bold text-slate-800">Total</span>
                <span className="text-2xl font-black text-indigo-600">
                  SAR {(grandTotal + (paymentMethod === 'cod' ? 10 : 0)).toFixed(2)}
                </span>
              </div>
              <div className="text-[10px] text-slate-400 text-right mt-1">VAT Included</div>
            </div>

            <button 
              type="submit"
              form="checkout-form"
              disabled={isProcessing}
              className="w-full bg-slate-900 hover:bg-black text-white font-bold py-4 rounded-xl shadow-lg transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isProcessing ? (
                <><span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span> Processing...</>
              ) : (
                <>PLACE ORDER <span className="text-lg">🔐</span></>
              )}
            </button>
            <p className="text-center text-xs text-slate-500 mt-4">
              By placing your order, you agree to Parto's Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>

      </main>
    </div>
  );
}
