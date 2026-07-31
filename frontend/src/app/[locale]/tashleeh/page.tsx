'use client';

import { useState, useEffect } from 'react';
import { useRouter, useParams, useSearchParams } from 'next/navigation';

import { Suspense } from 'react';

function TashleehPageInner() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();
  const locale = (params?.locale as 'en' | 'ar') || 'en';
  
  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    vehicleMake: searchParams.get('make') || '',
    vehicleModel: searchParams.get('model') || '',
    vehicleYear: searchParams.get('year') || '',
    partName: searchParams.get('partName') || ''
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Tracking State
  const [requestId, setRequestId] = useState<string | null>(null);
  const [requestInfo, setRequestInfo] = useState<any>(null);
  const [quotes, setQuotes] = useState<any[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await fetch('/api/tashleeh/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to submit request');
      
      setRequestId(data.request.id);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAcceptQuote = async (quoteId: string) => {
    try {
      const res = await fetch(`/api/tashleeh/quote?id=${quoteId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'accepted', requestId })
      });
      if (!res.ok) throw new Error('Failed to accept quote');
      // Re-poll immediately
      fetchRequestData();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchRequestData = async () => {
    if (!requestId) return;
    try {
      const res = await fetch(`/api/tashleeh/request?id=${requestId}`);
      const data = await res.json();
      if (res.ok) {
        setRequestInfo(data.request);
        setQuotes(data.quotes || []);
      }
    } catch (err) {
      console.error(err);
    }
  };

  // Poll for quotes every 3 seconds if request is pending/quoted
  useEffect(() => {
    if (requestId && requestInfo?.status !== 'accepted') {
      fetchRequestData();
      const interval = setInterval(fetchRequestData, 3000);
      return () => clearInterval(interval);
    }
  }, [requestId, requestInfo?.status]);

  if (requestId) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center items-center p-4">
        <div className="max-w-2xl w-full bg-slate-900/50 border border-slate-800 rounded-3xl p-8 backdrop-blur-xl">
          <button onClick={() => router.push(`/${locale}`)} className="text-slate-500 mb-6 flex items-center gap-2 hover:text-slate-300">
            <span>←</span> {locale === 'ar' ? 'عودة' : 'Back to Home'}
          </button>
          
          <h1 className="text-2xl font-black mb-2 text-white">Track Your Part Request</h1>
          <p className="text-sm text-slate-400 mb-8">We are broadcasting your request to all verified scrapyards.</p>
          
          <div className="mb-6 p-4 border border-slate-800 rounded-xl bg-slate-950 flex justify-between items-center">
            <div>
              <div className="font-bold text-white">{requestInfo?.partName}</div>
              <div className="text-xs text-slate-500">{requestInfo?.vehicleYear} {requestInfo?.vehicleMake} {requestInfo?.vehicleModel}</div>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${requestInfo?.status === 'accepted' ? 'bg-emerald-950 text-emerald-400' : 'bg-amber-950 text-amber-400 animate-pulse'}`}>
              {requestInfo?.status}
            </span>
          </div>

          <h2 className="text-lg font-bold mb-4 text-white">Incoming Quotes</h2>
          {quotes.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl text-slate-500 text-sm">
              Waiting for scrapyards to submit quotes...
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {quotes.map(quote => (
                <div key={quote.id} className={`p-5 rounded-2xl border flex flex-col gap-4 ${quote.status === 'accepted' ? 'border-emerald-500/50 bg-emerald-950/20' : quote.status === 'rejected' ? 'border-red-900/50 bg-red-950/10 opacity-50' : 'border-slate-800 bg-slate-950'}`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-white">{quote.tenantName}</h3>
                      <span className="text-xs text-slate-400">Condition: <span className="font-semibold text-slate-300">{quote.condition}</span></span>
                    </div>
                    <div className="text-2xl font-black text-emerald-400">{quote.price} SAR</div>
                  </div>
                  {quote.notes && <p className="text-xs text-slate-500 bg-slate-900 p-2 rounded-lg">Note: {quote.notes}</p>}
                  
                  {quote.status === 'pending' && requestInfo?.status !== 'accepted' && (
                    <button onClick={() => handleAcceptQuote(quote.id)} className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3 rounded-xl text-sm transition-colors shadow-lg shadow-indigo-900/50">
                      Accept This Quote
                    </button>
                  )}
                  {quote.status === 'accepted' && (
                    <div className="mt-2 text-emerald-400 font-bold text-sm bg-emerald-950/50 py-3 px-4 rounded-xl flex justify-between items-center">
                      <span>✓ Quote Accepted</span>
                      <a href={`tel:${quote.tenantPhone}`} className="bg-emerald-600 text-white px-4 py-1.5 rounded-lg">Call Vendor</a>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center font-sans">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-amber-900/10 blur-[150px]"></div>
      </div>

      <header className="relative z-10 border-b border-slate-900/80 backdrop-blur-md bg-slate-950/80">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <span className="text-2xl font-black tracking-tight cursor-pointer" onClick={() => router.push(`/${locale}`)}>NEXUS</span>
          <button onClick={() => router.push(`/${locale}`)} className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white border border-slate-800 rounded-full">
            {locale === 'ar' ? 'العودة للموقع الرئيسي' : 'Back to Home'}
          </button>
        </div>
      </header>

      <main className="relative z-10 flex-1 max-w-xl w-full mx-auto px-4 py-12">
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col gap-2 mb-8">
            <h1 className="text-3xl font-black tracking-tight text-white">{locale === 'ar' ? 'طلب قطعة تشليح' : 'Request a Used Part'}</h1>
            <p className="text-sm text-slate-400">{locale === 'ar' ? 'حدد سيارتك والقطعة المطلوبة ليتواصل معك البائعون.' : 'Submit your vehicle details and the part you need to receive quotes from scrapyards.'}</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-950/50 border border-red-900 rounded-xl text-red-200 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Make</label>
                <input required type="text" placeholder="e.g. Toyota" value={formData.vehicleMake} onChange={e => setFormData({...formData, vehicleMake: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100" />
              </div>
              <div className="flex flex-col gap-2">
                <label className="text-xs font-bold text-slate-500 uppercase">Model</label>
                <input required type="text" placeholder="e.g. Camry" value={formData.vehicleModel} onChange={e => setFormData({...formData, vehicleModel: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100" />
              </div>
            </div>
            
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Year</label>
              <input required type="text" placeholder="e.g. 2018" value={formData.vehicleYear} onChange={e => setFormData({...formData, vehicleYear: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100" />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Specific Part Name</label>
              <input required type="text" placeholder="e.g. Front Right Door, Alternator, Engine..." value={formData.partName} onChange={e => setFormData({...formData, partName: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100" />
            </div>

            <div className="border-t border-slate-800 my-2"></div>

            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Your Name</label>
              <input required type="text" value={formData.customerName} onChange={e => setFormData({...formData, customerName: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100" />
            </div>
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-slate-500 uppercase">Phone Number</label>
              <input required type="tel" value={formData.customerPhone} onChange={e => setFormData({...formData, customerPhone: e.target.value})} className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-100" />
            </div>

            <button type="submit" disabled={loading} className="mt-4 w-full bg-amber-600 hover:bg-amber-500 disabled:opacity-50 disabled:hover:bg-amber-600 text-white font-bold py-4 rounded-xl text-sm transition-all shadow-xl shadow-amber-900/20">
              {loading ? 'Broadcasting...' : 'Broadcast Request to Scrapyards'}
            </button>
          </form>
        </div>
      </main>
    </div>
  );
}

export default function TashleehPage() {
  return (
    <Suspense fallback={<div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>}>
      <TashleehPageInner />
    </Suspense>
  );
}
