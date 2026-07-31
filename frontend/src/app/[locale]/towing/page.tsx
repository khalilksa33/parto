'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function TowingPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as 'en' | 'ar') || 'en';

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    pickupLocation: '',
    dropoffLocation: '',
    vehicleDetails: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'tracking' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const [dispatchId, setDispatchId] = useState<string | null>(null);
  const [dispatchInfo, setDispatchInfo] = useState<any>(null);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (status === 'tracking' && dispatchId) {
      interval = setInterval(async () => {
        try {
          const res = await fetch(`/api/dispatch?id=${dispatchId}`);
          if (res.ok) {
            const data = await res.json();
            setDispatchInfo(data);
          }
        } catch (err) {
          console.error('Polling error', err);
        }
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [status, dispatchId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        throw new Error('Failed to request tow truck');
      }

      const data = await res.json();
      setDispatchId(data.dispatch.id);
      setDispatchInfo({ dispatch: data.dispatch });
      setStatus('tracking');
    } catch (err: any) {
      setErrorMessage(err.message);
      setStatus('error');
    }
  };

  const isRtl = locale === 'ar';

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      <header className="relative z-10 border-b border-slate-900/80 backdrop-blur-md bg-slate-950/80 p-4 flex justify-between items-center">
        <span className="text-2xl font-black text-indigo-400 cursor-pointer" onClick={() => router.push(`/${locale}`)}><img src="/logo.png" alt="Parto" className="h-8 w-auto" /></span>
        <button onClick={() => router.push(`/${locale}`)} className="text-xs font-semibold text-slate-400">Back</button>
      </header>

      <main className="flex-1 w-full max-w-xl mx-auto p-4 sm:p-8 flex flex-col justify-center">
        {status === 'tracking' && dispatchInfo ? (
          <div className="bg-slate-900/40 border border-slate-800 p-8 rounded-3xl shadow-2xl flex flex-col items-center">
            <div className="text-6xl mb-6">
              {dispatchInfo.dispatch.status === 'pending' && '📡'}
              {dispatchInfo.dispatch.status === 'accepted' && '✅'}
              {dispatchInfo.dispatch.status === 'en_route' && '🛻'}
              {dispatchInfo.dispatch.status === 'arrived' && '📍'}
              {dispatchInfo.dispatch.status === 'completed' && '🎉'}
            </div>
            
            <h2 className="text-2xl font-bold text-white mb-2 text-center">
              {dispatchInfo.dispatch.status === 'pending' && 'Broadcasting Request...'}
              {dispatchInfo.dispatch.status === 'accepted' && 'Tow Truck Assigned!'}
              {dispatchInfo.dispatch.status === 'en_route' && 'Tow Truck is En Route!'}
              {dispatchInfo.dispatch.status === 'arrived' && 'Tow Truck has Arrived!'}
              {dispatchInfo.dispatch.status === 'completed' && 'Service Completed!'}
            </h2>
            
            <p className="text-slate-400 text-sm text-center mb-6">
              {dispatchInfo.dispatch.status === 'pending' && 'Waiting for a nearby tow truck to accept your dispatch.'}
              {dispatchInfo.dispatch.status !== 'pending' && dispatchInfo.dispatch.status !== 'completed' && 'Your driver is on the job. You can contact them below.'}
              {dispatchInfo.dispatch.status === 'completed' && 'Thank you for using NEXUS towing services.'}
            </p>

            {dispatchInfo.driver && dispatchInfo.driver.name && (
              <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-2 mb-6">
                <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">Driver Details</div>
                {dispatchInfo.dispatch.quote && (
                  <div className="flex justify-between items-center mb-1">
                    <span className="text-slate-400 text-sm">Price Quote:</span>
                    <span className="font-bold text-emerald-400 text-lg">{dispatchInfo.dispatch.quote}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-white">{dispatchInfo.driver.name}</span>
                  <a href={`tel:${dispatchInfo.driver.phone}`} className="bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg text-xs font-bold transition-colors">
                    Call: {dispatchInfo.driver.phone}
                  </a>
                </div>
              </div>
            )}

            {dispatchInfo.dispatch.status === 'completed' && (
              <button onClick={() => { setStatus('idle'); setFormData({customerName:'', customerPhone:'', pickupLocation:'', dropoffLocation:'', vehicleDetails:''}); setDispatchId(null); setDispatchInfo(null); }} className="w-full bg-slate-800 hover:bg-slate-700 text-white px-4 py-3 rounded-xl font-bold transition-colors">
                Request Another Tow
              </button>
            )}
          </div>
        ) : (
          <div className="bg-slate-900/40 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white mb-2">Need a Tow Truck?</h1>
            <p className="text-sm text-slate-400 mb-8">Fill out the form below and we will dispatch the nearest available towing service to your location.</p>

            {status === 'error' && <div className="text-rose-400 mb-4 text-sm p-3 bg-rose-950/30 border border-rose-500/20 rounded-lg">{errorMessage}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Your Name</label>
                  <input required type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">Phone Number</label>
                  <input required type="text" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Pickup Location</label>
                <input required type="text" placeholder="e.g., King Fahd Road, near Kingdom Tower" value={formData.pickupLocation} onChange={e => setFormData({...formData, pickupLocation: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Drop-off Location</label>
                <input required type="text" placeholder="e.g., Al-Sanaiya Auto Repair Shop" value={formData.dropoffLocation} onChange={e => setFormData({...formData, dropoffLocation: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-slate-400">Vehicle Details (Optional)</label>
                <input type="text" placeholder="e.g., 2018 Toyota Camry, White" value={formData.vehicleDetails} onChange={e => setFormData({...formData, vehicleDetails: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors" />
              </div>

              <button type="submit" disabled={status === 'submitting'} className="mt-4 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 transition-colors">
                {status === 'submitting' ? 'Broadcasting...' : 'Request Tow Truck'}
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
