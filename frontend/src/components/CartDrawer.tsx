'use client';

import React, { useState, useEffect } from 'react';
import { useCart } from './CartProvider';
import { useRouter } from 'next/navigation';

export default function CartDrawer({ locale }: { locale: string }) {
  const { items, isCartOpen, setIsCartOpen, removeFromCart, updateQuantity, subtotal, totalItems } = useCart();
  const [shippingRates, setShippingRates] = useState<any>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const router = useRouter();

  // Calculate multi-origin shipping when cart opens or items change (debounced)
  useEffect(() => {
    if (!isCartOpen || items.length === 0) return;

    const fetchRates = async () => {
      setIsCalculating(true);
      try {
        const res = await fetch('/api/shipping/rates', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            addressTo: {
              name: 'Guest Customer',
              street1: 'King Fahd Road',
              city: 'Riyadh',
              state: 'RIY',
              zip: '12211',
              country: 'SA'
            },
            cartItems: items.map(i => ({ productId: i.product.id, quantity: i.quantity }))
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

    const timer = setTimeout(fetchRates, 1000);
    return () => clearTimeout(timer);
  }, [items, isCartOpen]);

  if (!isCartOpen) return null;

  // Group items visually by seller
  const itemsBySeller = items.reduce((acc, item) => {
    const tId = item.product.tenantId;
    if (!acc[tId]) acc[tId] = [];
    acc[tId].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm z-[100] transition-opacity" 
        onClick={() => setIsCartOpen(false)} 
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl z-[101] flex flex-col animate-in slide-in-from-right duration-300">
        <div className="p-6 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <h2 className="text-xl font-black text-slate-800 flex items-center gap-2">
            <span>🛒</span> Shopping Cart
            <span className="bg-indigo-100 text-indigo-700 text-xs px-2 py-1 rounded-full">{totalItems}</span>
          </h2>
          <button 
            onClick={() => setIsCartOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-200 text-slate-500 transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-slate-50">
          {items.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 gap-4">
              <span className="text-6xl">🛍️</span>
              <p>Your cart is empty.</p>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold"
              >
                Continue Shopping
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-6">
              {Object.entries(itemsBySeller).map(([tenantId, tenantItems]) => (
                <div key={tenantId} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm">
                  <div className="bg-slate-100 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-600 flex items-center justify-between">
                    <span>Sold by Seller ID: <span className="font-mono text-indigo-600">{tenantId.substring(0, 8)}...</span></span>
                  </div>
                  <div className="p-4 flex flex-col gap-4">
                    {tenantItems.map((item) => (
                      <div key={item.product.id} className="flex gap-4 items-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-2xl border border-slate-200">
                          {item.product.image?.startsWith('http') ? (
                            <img src={item.product.image} alt={item.product.name} className="w-full h-full object-cover rounded-lg" />
                          ) : item.product.image}
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-slate-800 text-sm line-clamp-1">{item.product.name}</h4>
                          <div className="text-indigo-600 font-bold text-sm mt-1">SAR {item.product.price}</div>
                        </div>
                        <div className="flex items-center gap-2">
                          <button onClick={() => updateQuantity(item.product.id, item.quantity - 1)} className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded hover:bg-slate-200 font-bold text-slate-600">-</button>
                          <span className="w-4 text-center text-sm font-semibold">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.product.id, item.quantity + 1)} className="w-7 h-7 flex items-center justify-center bg-slate-100 rounded hover:bg-slate-200 font-bold text-slate-600">+</button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Checkout Summary */}
        {items.length > 0 && (
          <div className="p-6 bg-white border-t border-slate-200 shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
            <div className="flex flex-col gap-3 mb-6 text-sm text-slate-600">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-bold text-slate-800">SAR {subtotal.toFixed(2)}</span>
              </div>
              
              <div className="flex justify-between items-start">
                <span>Shipping (Multi-Origin)</span>
                {isCalculating ? (
                  <span className="animate-pulse text-indigo-500 text-xs">Calculating routes...</span>
                ) : shippingRates?.multiOrigin ? (
                  <div className="text-right">
                    {shippingRates.shipments.map((ship: any, idx: number) => {
                      const cheapest = ship.rates.sort((a:any, b:any) => parseFloat(a.amount) - parseFloat(b.amount))[0];
                      return (
                        <div key={idx} className="text-xs mb-1">
                          From {ship.sellerName}: <span className="font-bold text-slate-800">SAR {cheapest ? cheapest.amount : '15.00'}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <span className="font-bold text-slate-800">Pending</span>
                )}
              </div>
            </div>
            
            <button 
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98]"
              onClick={() => {
                setIsCartOpen(false);
                router.push(`/${locale}/checkout`);
              }}
            >
              PROCEED TO SECURE CHECKOUT
            </button>
            <p className="text-center text-xs text-slate-400 mt-3 flex items-center justify-center gap-1">
              <span>🔒</span> Payments are secure and encrypted
            </p>
          </div>
        )}
      </div>
    </>
  );
}
