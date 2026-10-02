import React from 'react';
import { Home, Search, ShoppingCart, User } from 'lucide-react';

export default function MobileBottomNav({ locale }: { locale: string }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 flex items-center justify-around bg-white border-t border-slate-200 pb-safe sm:hidden shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
      <a href={`/${locale}`} className="flex flex-col items-center p-3 text-slate-500 hover:text-indigo-600 active:text-indigo-700 transition-colors">
        <Home className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">Home</span>
      </a>
      <a href={`/${locale}/search`} className="flex flex-col items-center p-3 text-slate-500 hover:text-indigo-600 active:text-indigo-700 transition-colors">
        <Search className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">Search</span>
      </a>
      <button className="flex flex-col items-center p-3 text-slate-500 hover:text-indigo-600 active:text-indigo-700 transition-colors">
        <ShoppingCart className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">Cart</span>
      </button>
      <a href={`/${locale}/profile`} className="flex flex-col items-center p-3 text-slate-500 hover:text-indigo-600 active:text-indigo-700 transition-colors">
        <User className="w-6 h-6 mb-1" />
        <span className="text-[10px] font-medium">Profile</span>
      </a>
    </div>
  );
}
