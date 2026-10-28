'use client';

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';

export default function WorkshopPage() {
  const router = useRouter();
  const params = useParams();
  const locale = (params?.locale as 'en' | 'ar') || 'en';
  const isRtl = locale === 'ar';

  const [formData, setFormData] = useState({
    customerName: '',
    customerPhone: '',
    serviceType: 'Mobile Workshop',
    preferredCity: 'Riyadh',
    preferredDate: '',
    vehicleDetails: '',
    notes: '',
  });

  const [status, setStatus] = useState<'idle' | 'submitting' | 'confirmed' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const [bookingId, setBookingId] = useState<string | null>(null);

  const prefillService = (service: string) => {
    setFormData(prev => ({ ...prev, serviceType: service }));
    const formElem = document.getElementById('bookingForm');
    if (formElem) {
      formElem.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMessage('');

    try {
      const res = await fetch('/api/dispatch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: formData.customerName,
          customerPhone: formData.customerPhone,
          serviceType: formData.serviceType,
          pickupLocation: `${formData.preferredCity} - ${formData.serviceType}`,
          dropoffLocation: formData.preferredCity,
          vehicleDetails: `${formData.vehicleDetails} | Date: ${formData.preferredDate || 'Earliest'} | Notes: ${formData.notes || 'None'}`,
        }),
      });

      if (!res.ok) {
        throw new Error(isRtl ? 'تعذر إرسال طلب الحجز، يرجى المحاولة لاحقاً' : 'Failed to book service appointment');
      }

      const data = await res.json();
      setBookingId(data.dispatch?.id || `WS-${Date.now().toString().slice(-6)}`);
      setStatus('confirmed');
    } catch (err: any) {
      setErrorMessage(err.message || 'Error processing request');
      setStatus('error');
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white ${isRtl ? 'text-right' : 'text-left'}`} dir={isRtl ? 'rtl' : 'ltr'}>
      {/* Top Header */}
      <header className="relative z-10 border-b border-slate-900/80 backdrop-blur-md bg-slate-950/80">
        <div className="max-w-[1760px] w-full mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => router.push(`/${locale}`)}>
            <img src="/logo.png?v=3" alt="PARTO" className="h-8 w-auto rounded" />
            <span className="font-extrabold text-white text-lg">PARTO <span className="text-indigo-400 text-xs px-2 py-0.5 rounded-full bg-indigo-950/80 border border-indigo-800">Auto Care</span></span>
          </div>
          <button 
            type="button"
            onClick={() => router.push(`/${locale}`)} 
            className="text-xs font-semibold text-slate-400 hover:text-white px-3 py-1.5 rounded-lg border border-slate-800 hover:border-slate-700 transition-colors"
          >
            ← {isRtl ? 'العودة للمتجر' : 'Back to Store'}
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 w-full max-w-[1760px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12 py-10 flex flex-col gap-10">
        
        {/* Hero Banner */}
        <div className="text-center max-w-3xl mx-auto flex flex-col items-center gap-3">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <span>🔧</span>
            <span>{isRtl ? 'صيانة معتمدة وضمان ذهبي' : 'Certified Auto Repair & Mobile Mechanics'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-black text-white tracking-tight">
            {isRtl ? 'حجز ورشة صيانة أو ميكانيكي متنقل' : 'Book a Workshop or Mobile Mechanic'}
          </h1>
          <p className="text-slate-400 text-sm sm:text-base leading-relaxed">
            {isRtl 
              ? 'سواء كنت بحاجة لورشة متنقلة تصلك لموقعك، أو حجز موعد في أفضل الورش الصناعية المعتمدة لفحص المحرك والميزان الإلكتروني.' 
              : 'Book on-site mobile mechanics or schedule precision repairs at certified workshops with computer OBD-II diagnostics.'}
          </p>
        </div>

        {/* 4 Specialized Service Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          
          {/* Card 1: Mobile Jumpstart & Battery */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col items-center text-center gap-3 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
            <div className="text-4xl p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">🔋</div>
            <h3 className="font-bold text-white text-lg">
              {isRtl ? 'ورشة متنقلة واشتراك' : 'Mobile Battery & Jumpstart'}
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed flex-1">
              {isRtl ? 'تصلك الورشة لموقعك لفحص البطارية واستبدالها وإصلاح الإطارات على الفور.' : 'On-site mobile mechanics for quick jumpstarts, battery replacements, and tire fixes.'}
            </p>
            <button
              type="button"
              onClick={() => prefillService('Mobile Workshop')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            >
              {isRtl ? 'طلب خدمة متنقلة' : 'Request Mobile'}
            </button>
          </div>

          {/* Card 2: Wheel Alignment */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col items-center text-center gap-3 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
            <div className="text-4xl p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">📐</div>
            <h3 className="font-bold text-white text-lg">
              {isRtl ? 'ميزان إلكتروني وضبط أذرعة' : 'Digital Wheel Alignment'}
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed flex-1">
              {isRtl ? 'ضبط زوايا العجلات والمساعدات بالليزر لمنع مسحية الكفرات وثبات المركبة.' : 'Laser wheel alignment & suspension inspection for highway stability.'}
            </p>
            <button
              type="button"
              onClick={() => prefillService('Digital Alignment')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            >
              {isRtl ? 'حجز موعد ميزان' : 'Book Alignment'}
            </button>
          </div>

          {/* Card 3: Computer Diagnostics */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col items-center text-center gap-3 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
            <div className="text-4xl p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">💻</div>
            <h3 className="font-bold text-white text-lg">
              {isRtl ? 'فحص كمبيوتر وبرمجة' : 'Computer Scan & Diagnostics'}
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed flex-1">
              {isRtl ? 'فحص شامل لكافة الحساسات ولمبة المحرك (Check Engine) وقراءة الأعطال.' : 'Comprehensive OBD-II scan to diagnose engine and transmission check lights.'}
            </p>
            <button
              type="button"
              onClick={() => prefillService('Computer Diagnostics')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            >
              {isRtl ? 'فحص شامل' : 'Diagnostic Scan'}
            </button>
          </div>

          {/* Card 4: AC & Climate */}
          <div className="bg-slate-900/60 border border-slate-800 hover:border-indigo-500/50 rounded-2xl p-6 flex flex-col items-center text-center gap-3 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
            <div className="text-4xl p-3 rounded-2xl bg-indigo-500/10 border border-indigo-500/20">❄️</div>
            <h3 className="font-bold text-white text-lg">
              {isRtl ? 'صيانة التكييف والفريون' : 'AC & Climate Control'}
            </h3>
            <p className="text-slate-400 text-xs leading-relaxed flex-1">
              {isRtl ? 'تعبئة فريون أصلي، فحص تسريب الكمبروسر، وتنظيف دورة التبريد.' : 'AC refrigerant recharge, compressor leak checks, and evaporator cleaning.'}
            </p>
            <button
              type="button"
              onClick={() => prefillService('AC Repair')}
              className="w-full py-2.5 px-4 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white transition-colors cursor-pointer"
            >
              {isRtl ? 'فحص المكيف' : 'Check AC'}
            </button>
          </div>

        </div>

        {/* Booking Form or Confirmation Card */}
        <div id="bookingForm" className="max-w-3xl w-full mx-auto">
          {status === 'confirmed' ? (
            <div className="bg-slate-900/60 border border-emerald-500/30 p-8 rounded-3xl shadow-2xl flex flex-col items-center text-center gap-4">
              <div className="text-6xl">🎉</div>
              <h2 className="text-2xl font-black text-white">
                {isRtl ? 'تم استلام طلب الحجز بنجاح!' : 'Service Booking Confirmed!'}
              </h2>
              <p className="text-slate-400 text-sm max-w-md">
                {isRtl 
                  ? 'تم إرسال طلبك إلى شبكة الورش والميكانيكيين المعتمدين. سيتم التواصل معك عبر رقم الجوال لتأكيد الموعد.' 
                  : 'Your request has been broadcasted to certified workshops. A technician will contact your mobile to confirm scheduling.'}
              </p>
              
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 w-full flex flex-col gap-2 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>{isRtl ? 'رقم الحجز المرجعي:' : 'Reference Booking ID:'}</span>
                  <span className="font-mono font-bold text-indigo-400">{bookingId}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>{isRtl ? 'الخدمة المطلوبة:' : 'Requested Service:'}</span>
                  <span className="font-bold text-white">{formData.serviceType}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>{isRtl ? 'المدينة:' : 'City:'}</span>
                  <span className="font-bold text-white">{formData.preferredCity}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => {
                  setStatus('idle');
                  setFormData({
                    customerName: '',
                    customerPhone: '',
                    serviceType: 'Mobile Workshop',
                    preferredCity: 'Riyadh',
                    preferredDate: '',
                    vehicleDetails: '',
                    notes: '',
                  });
                }}
                className="mt-2 py-3 px-8 rounded-xl font-bold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
              >
                {isRtl ? 'حجز خدمة أخرى' : 'Book Another Service'}
              </button>
            </div>
          ) : (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl">
              <h2 className="text-2xl font-black text-white mb-2 flex items-center gap-2">
                <span>📅</span>
                <span>{isRtl ? 'حجز موعد صيانة أو ميكانيكي' : 'Service Appointment Booking'}</span>
              </h2>
              <p className="text-xs sm:text-sm text-slate-400 mb-6">
                {isRtl ? 'أدخل بياناتك وسنقوم بربطك بأفضل ورشة معتمدة متخصصة بنوع سيارتك.' : 'Enter your details to connect with certified workshops specialized in your vehicle brand.'}
              </p>

              {status === 'error' && (
                <div className="text-rose-400 mb-4 text-xs p-3 bg-rose-950/30 border border-rose-500/20 rounded-lg">
                  {errorMessage}
                </div>
              )}

              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400">
                      {isRtl ? 'الاسم الكامل *' : 'Full Name *'}
                    </label>
                    <input
                      required
                      type="text"
                      placeholder={isRtl ? 'مثال: محمد الشهري' : 'e.g. Mohammed Al-Shehri'}
                      value={formData.customerName}
                      onChange={e => setFormData({ ...formData, customerName: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400">
                      {isRtl ? 'رقم الجوال *' : 'Mobile Number *'}
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="05xxxxxxxx"
                      value={formData.customerPhone}
                      onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400">
                      {isRtl ? 'نوع الخدمة المطلوبة *' : 'Service Type *'}
                    </label>
                    <select
                      value={formData.serviceType}
                      onChange={e => setFormData({ ...formData, serviceType: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="Mobile Workshop">{isRtl ? 'ورشة متنقلة لموقعي (Mobile Workshop)' : 'Mobile Workshop to Location'}</option>
                      <option value="Digital Alignment">{isRtl ? 'ميزان إلكتروني وضبط زوايا (Wheel Alignment)' : 'Digital Alignment'}</option>
                      <option value="Computer Diagnostics">{isRtl ? 'فحص كمبيوتر وبرمجة (OBD Scan)' : 'Computer Diagnostics'}</option>
                      <option value="AC Repair">{isRtl ? 'صيانة مكيف وفريون (AC Service)' : 'AC & Climate Service'}</option>
                      <option value="General Mechanical">{isRtl ? 'صيانة ميكانيكية عامة (General Mechanic)' : 'General Mechanic'}</option>
                    </select>
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400">
                      {isRtl ? 'المدينة *' : 'City *'}
                    </label>
                    <select
                      value={formData.preferredCity}
                      onChange={e => setFormData({ ...formData, preferredCity: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    >
                      <option value="Riyadh">الرياض (Riyadh)</option>
                      <option value="Jeddah">جدة (Jeddah)</option>
                      <option value="Dammam">الدمام (Dammam)</option>
                      <option value="Khobar">الخبر (Khobar)</option>
                      <option value="Mecca">مكة المكرمة (Makkah)</option>
                      <option value="Medina">المدينة المنورة (Madinah)</option>
                      <option value="Qassim">القصيم (Qassim)</option>
                      <option value="Tabuk">تبوك (Tabuk)</option>
                      <option value="Abha">أبها وعسير (Abha)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400">
                      {isRtl ? 'الموعد المفضل' : 'Preferred Date'}
                    </label>
                    <input
                      type="date"
                      value={formData.preferredDate}
                      onChange={e => setFormData({ ...formData, preferredDate: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>

                  <div className="flex flex-col gap-1.5">
                    <label className="text-xs font-semibold text-slate-400">
                      {isRtl ? 'بيانات السيارة (الموديل والسنة)' : 'Vehicle Model & Year'}
                    </label>
                    <input
                      type="text"
                      placeholder={isRtl ? 'مثال: تويوتا كامري 2021' : 'e.g. 2021 Toyota Camry'}
                      value={formData.vehicleDetails}
                      onChange={e => setFormData({ ...formData, vehicleDetails: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors"
                    />
                  </div>
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-slate-400">
                    {isRtl ? 'وصف المشكلة أو العطل (اختياري)' : 'Issue / Symptoms Description (Optional)'}
                  </label>
                  <textarea
                    rows={3}
                    placeholder={isRtl ? 'اكتب الأعراض التي تلاحظها (مثال: صوت طقطقة في المساعدات، لمبة التشييك والعة، ضعف تبريد المكيف)...' : 'Describe any noise, vibration, check engine codes, or AC issues...'}
                    value={formData.notes}
                    onChange={e => setFormData({ ...formData, notes: e.target.value })}
                    className="bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={status === 'submitting'}
                  className="mt-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold py-3.5 rounded-xl disabled:opacity-50 transition-colors cursor-pointer text-sm shadow-lg shadow-indigo-600/30"
                >
                  {status === 'submitting' 
                    ? (isRtl ? 'جاري إرسال الحجز...' : 'Booking Appointment...') 
                    : (isRtl ? 'تأكيد حجز الموعد' : 'Confirm Service Booking')}
                </button>
              </form>
            </div>
          )}
        </div>

      </main>
    </div>
  );
}
