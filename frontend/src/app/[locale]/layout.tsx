import React from 'react';
import { Metadata, Viewport } from 'next';
import { Inter, Outfit } from 'next/font/google';
import '../global.css';
import AIChatWidget from '@/components/AIChatWidget';
import { NotificationProvider } from '@/components/NotificationProvider';
import { CartProvider } from '@/components/CartProvider';
import CartDrawer from '@/components/CartDrawer';
import MobileBottomNav from '@/components/MobileBottomNav';

export async function generateStaticParams() {
  return [{ locale: 'en' }];
}

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const outfit = Outfit({
  subsets: ['latin'],
  variable: '--font-display',
});

// Mock/Simple function to determine layout direction based on locale
// In a full implementation, this maps key locales to RTL scripts (e.g., ar, he, fa)
function getDirection(locale: string): 'rtl' | 'ltr' {
  const rtlLocales = ['ar', 'he', 'fa', 'ur'];
  return rtlLocales.includes(locale.toLowerCase()) ? 'rtl' : 'ltr';
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1.0,
  maximumScale: 1.0,
  userScalable: false,
  themeColor: '#ffffff',
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const resolvedParams = await params;
  const dir = getDirection(resolvedParams.locale);
  const isAr = resolvedParams.locale === 'ar';
  return {
    title: {
      template: isAr ? '%s | بارتو السعودية' : '%s | Parto KSA Auto Marketplace',
      default: isAr 
        ? 'منصة بارتو السعودية - سوق قطع غيار السيارات والخدمات المتكاملة' 
        : 'Parto KSA - Saudi Arabia\'s #1 Automotive Services & Parts Hub',
    },
    description: isAr 
      ? 'بارتو هي المنصة السعودية الأولى لخدمات السيارات وقطع الغيار. ابحث عن تشليح، قطع غيار جديدة، سطحات، ورش متنقلة، ميزان إلكتروني، وخدمات صيانة في الرياض، جدة، الدمام وكافة أنحاء المملكة.'
      : 'Parto is Saudi Arabia\'s premier automotive multi-tenant platform. Find Tashleeh used parts, new auto parts, flatbed towing (Satha), mobile workshops, digital alignment, and mechanics across Riyadh, Jeddah, Dammam, and all of Saudi Arabia.',
    other: {
      dir: dir,
    },
    appleWebApp: {
      capable: true,
      statusBarStyle: 'default',
      title: 'Parto',
    },
    formatDetection: {
      telephone: false,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const resolvedParams = await params;
  const dir = getDirection(resolvedParams.locale);

  return (
    <html lang={resolvedParams.locale} dir={dir} className={`${inter.variable} ${outfit.variable} scroll-smooth`}>
      <body className="min-h-screen bg-white text-slate-900 antialiased selection:bg-blue-600 selection:text-white transition-colors duration-300">
        <NotificationProvider>
          <CartProvider>
            <main className="flex min-h-screen flex-col items-stretch justify-start">
              {children}
            </main>
            <CartDrawer locale={resolvedParams.locale} />
            <MobileBottomNav locale={resolvedParams.locale} />
            <AIChatWidget />
          </CartProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}
