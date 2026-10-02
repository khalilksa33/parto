import React from 'react';

export default function Footer() {
  return (
    <footer className="bg-slate-50 border-t border-slate-200 mt-auto pb-20 sm:pb-0">
      <div className="w-full px-4 sm:px-8 lg:px-12 xl:px-16 py-10 flex flex-col sm:flex-row items-center justify-between gap-6">
        <div className="flex flex-col items-center sm:items-start gap-3">
          <div className="flex items-center gap-3">
            <img src="/logo.png?v=3" alt="Parto Auto Spare Parts" className="h-8 w-auto grayscale opacity-80" />
            <span className="text-sm text-slate-500 font-medium">© 2026 Parto. All rights reserved.</span>
          </div>
          <div className="flex gap-4 text-xs text-slate-400 mt-2">
            <a href="#" className="hover:text-indigo-500 transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-indigo-500 transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-indigo-500 transition-colors">Support</a>
          </div>
        </div>

        {/* Payment Options */}
        <div className="flex flex-col items-center sm:items-end gap-3 mt-4 sm:mt-0">
          <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Secure Checkout</span>
          <div className="flex items-center gap-2 flex-wrap justify-center">
            {/* Apple Pay */}
            <div className="h-8 px-3 bg-black rounded flex items-center justify-center">
              <span className="text-white font-semibold text-xs tracking-tight"> Pay</span>
            </div>
            {/* Visa */}
            <div className="h-8 px-3 bg-white border border-slate-200 rounded flex items-center justify-center">
              <span className="text-[#1434CB] font-bold text-sm italic tracking-tighter">VISA</span>
            </div>
            {/* Mastercard */}
            <div className="h-8 px-3 bg-white border border-slate-200 rounded flex items-center justify-center">
              <div className="flex">
                <div className="w-4 h-4 rounded-full bg-[#EB001B] opacity-90 z-10"></div>
                <div className="w-4 h-4 rounded-full bg-[#F79E1B] opacity-90 -ml-2"></div>
              </div>
            </div>
            {/* Mada */}
            <div className="h-8 px-3 bg-white border border-slate-200 rounded flex items-center justify-center">
              <span className="text-emerald-500 font-bold text-xs">mada</span>
            </div>
            {/* STC Pay */}
            <div className="h-8 px-3 bg-purple-600 rounded flex items-center justify-center">
              <span className="text-white font-bold text-xs tracking-tight">stc pay</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
