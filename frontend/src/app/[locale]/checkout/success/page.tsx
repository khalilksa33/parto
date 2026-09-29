'use client';

import React from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  
  const locale = params?.locale || 'en';
  const orderIdsParam = searchParams?.get('orderIds');
  const orderIds = orderIdsParam ? orderIdsParam.split(',') : [];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-10 rounded-3xl border border-slate-200 shadow-xl max-w-lg w-full text-center">
        <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-4xl mx-auto mb-6">
          ✓
        </div>
        <h1 className="text-3xl font-black text-slate-900 mb-2">Order Confirmed!</h1>
        <p className="text-slate-600 mb-8">
          Thank you for shopping on Parto. Your order has been securely processed and sent to the respective sellers.
        </p>

        <div className="bg-slate-50 rounded-xl p-4 border border-slate-200 mb-8 text-left">
          <h3 className="font-bold text-slate-800 text-sm mb-3 uppercase tracking-wider">Your Tracking Numbers</h3>
          <div className="flex flex-col gap-2">
            {orderIds.map((id, idx) => (
              <div key={idx} className="flex justify-between items-center bg-white px-4 py-2 rounded-lg border border-slate-100 shadow-sm">
                <span className="text-sm font-semibold text-slate-600">Shipment {idx + 1}</span>
                <span className="font-mono font-bold text-indigo-700">{id}</span>
              </div>
            ))}
          </div>
        </div>

        <button 
          onClick={() => router.push(`/${locale}`)}
          className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl transition-colors w-full"
        >
          Continue Shopping
        </button>
      </div>
    </div>
  );
}
