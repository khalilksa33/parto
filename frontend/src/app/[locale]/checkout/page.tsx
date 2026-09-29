'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useCart } from '@/components/CartProvider';
import { useRouter, useParams } from 'next/navigation';

export default function CheckoutPage() {
  const { items, subtotal, clearCart, isCartOpen, setIsCartOpen } = useCart();
  const router = useRouter();
  const params = useParams();
  const locale = params?.locale || 'en';

  const [shippingRates, setShippingRates] = useState<any>(null);
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
    if (items.length === 0 && !isProcessing) {
      router.push(`/${locale}`);
    }
  }, [items, isCartOpen, router, locale, isProcessing, setIsCartOpen]);

  useEffect(() => {
    if (items.length === 0) return;

    const fetchRates = async () => {
      setIsCalculating(true);
      try {
        const res = await fetch('/api/shipping/rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addressTo: {
              name: `${formData.firstName} ${formData.lastName}`,
              street1: formData.address || 'King Fahd Road',
              city: formData.city,
              state: 'RIY',
              zip: formData.zip || '12211',
              country: 'SA'
            },
            cartItems: items.map(i => ({ productId: i.product.id, quantity: i.quantity, tenantId: i.product.tenantId }))
          })
        });
        
        if (res.ok) {
          const data = await res.json();
          setShippingRates(data);
        }
      } catch (err) {
        console.error('Failed to calculate shipping', err);
      } finally {
        setIsCalculating(false);
      }
    };

    const timer = setTimeout(fetchRates, 800);
    return () => clearTimeout(timer);
  }, [items, formData.city, formData.zip]);

  const totalShipping = useMemo(() => {
    if (!shippingRates?.multiOrigin) return 0;
    return shippingRates.shipments.reduce((sum: number, ship: any) => {
      const cheapest = ship.rates.sort((a:any, b:any) => parseFloat(a.amount) - parseFloat(b.amount))[0];
      return sum + (cheapest ? parseFloat(cheapest.amount) : 15.00);
    }, 0);
  }, [shippingRates]);

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
                  </select>
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-sm font-semibold text-slate-700">District / Zip</label>
                  <input type="text" className="px-4 py-2.5 rounded-lg border border-slate-300 focus:ring-2 focus:ring-indigo-500 outline-none" value={formData.zip} onChange={e => setFormData({...formData, zip: e.target.value})} />
                </div>
              </div>
            </section>

            <section className="bg-white p-6 md:p-8 rounded-2xl border border-slate-200 shadow-sm">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <span className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center text-sm">2</span>
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
              {Object.entries(itemsBySeller).map(([tenantId, tenantItems]) => (
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
                  
                  {shippingRates?.multiOrigin && (
                    <div className="mt-1 flex items-center justify-between text-xs text-indigo-600 bg-indigo-50 p-2 rounded">
                      <span>Logistics (Shippo)</span>
                      <span className="font-bold">
                        SAR {
                          (() => {
                            const ship = shippingRates.shipments.find((s:any) => s.tenantId === tenantId);
                            if (ship && ship.rates.length > 0) {
                              const cheapest = ship.rates.sort((a:any, b:any) => parseFloat(a.amount) - parseFloat(b.amount))[0];
                              return cheapest.amount;
                            }
                            return '15.00';
                          })()
                        }
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="border-t border-slate-200 pt-4 flex flex-col gap-3 mb-6">
              <div className="flex justify-between text-sm text-slate-600">
                <span>Subtotal</span>
                <span className="font-semibold text-slate-800">SAR {subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm text-slate-600">
                <span>Total Shipping</span>
                <span className="font-semibold text-slate-800">
                  {isCalculating ? <span className="animate-pulse">Calculating...</span> : `SAR ${totalShipping.toFixed(2)}`}
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
              disabled={isProcessing || isCalculating}
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
