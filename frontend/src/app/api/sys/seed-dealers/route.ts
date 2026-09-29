import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { tenants } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const ksaDealers = [
  {
    name: 'Abdul Latif Jameel Motors',
    subdomain: 'alj',
    businessType: 'Authorized Distributor',
    ownerName: 'ALJ Group',
    phone: '+966 9200 24000',
    email: 'contact@alj.com',
    category: 'Toyota & Lexus',
    logo: '🇯🇵',
    bannerGradient: 'from-red-900 to-slate-900',
    status: 'inactive'
  },
  {
    name: 'Aljomaih Automotive Company',
    subdomain: 'aljomaih',
    businessType: 'Authorized Distributor',
    ownerName: 'AAC',
    phone: '+966 800 752 5252',
    email: 'info@aljomaihauto.com',
    category: 'GM, Chevrolet, GMC',
    logo: '🇺🇸',
    bannerGradient: 'from-blue-900 to-slate-900',
    status: 'inactive'
  },
  {
    name: 'Wallan Trading Company',
    subdomain: 'wallan',
    businessType: 'Authorized Distributor',
    ownerName: 'Wallan Group',
    phone: '+966 9200 09884',
    email: 'info@wallan.com',
    category: 'Hyundai & Genesis',
    logo: '🇰🇷',
    bannerGradient: 'from-cyan-900 to-slate-900',
    status: 'inactive'
  },
  {
    name: 'Mohamed Yousuf Naghi Motors',
    subdomain: 'mynm',
    businessType: 'Authorized Distributor',
    ownerName: 'MYNM Group',
    phone: '+966 800 124 9898',
    email: 'info@mynaghi.com',
    category: 'BMW, Ford, Hyundai',
    logo: '🇩🇪',
    bannerGradient: 'from-slate-800 to-slate-950',
    status: 'inactive'
  },
  {
    name: 'Samaco Automotive',
    subdomain: 'samaco',
    businessType: 'Authorized Distributor',
    ownerName: 'Samaco',
    phone: '+966 800 118 0099',
    email: 'info@samaco.com.sa',
    category: 'Audi, VW, Porsche',
    logo: '🏎️',
    bannerGradient: 'from-stone-900 to-slate-900',
    status: 'inactive'
  },
  {
    name: 'Abdullah Hashim Company',
    subdomain: 'ahc',
    businessType: 'Authorized Distributor',
    ownerName: 'AHC',
    phone: '+966 9200 02208',
    email: 'contact@honda-saudiarabia.com',
    category: 'Honda',
    logo: '⛩️',
    bannerGradient: 'from-red-800 to-slate-950',
    status: 'inactive'
  },
  {
    name: 'Universal Motors Agencies (UMA)',
    subdomain: 'uma',
    businessType: 'Authorized Distributor',
    ownerName: 'UMA',
    phone: '+966 800 244 2244',
    email: 'contact@uma.com.sa',
    category: 'Chevrolet & GMC',
    logo: '🛡️',
    bannerGradient: 'from-yellow-900 to-slate-900',
    status: 'inactive'
  },
  {
    name: 'Haji Husein Alireza & Co. (HHA)',
    subdomain: 'hha',
    businessType: 'Authorized Distributor',
    ownerName: 'HHA',
    phone: '+966 800 244 0140',
    email: 'info@hha.com.sa',
    category: 'Mazda, Aston Martin, Geely',
    logo: '🦅',
    bannerGradient: 'from-zinc-900 to-slate-900',
    status: 'inactive'
  }
];

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    if (url.searchParams.get('token') !== 'secret-seed-token-123') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const inserted = [];

    for (const dealer of ksaDealers) {
      // Check if exists
      const existing = await db.select().from(tenants).where(eq(tenants.subdomain, dealer.subdomain)).limit(1);
      
      if (existing.length === 0) {
        await db.insert(tenants).values({
          name: dealer.name,
          subdomain: dealer.subdomain,
          businessType: dealer.businessType,
          ownerName: dealer.ownerName,
          phone: dealer.phone,
          email: dealer.email,
          status: dealer.status,
          settings: {
            logo: dealer.logo,
            bannerGradient: dealer.bannerGradient,
            category: dealer.category
          }
        });
        inserted.push(dealer.name);
      }
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully added ${inserted.length} major KSA dealers.`,
      addedDealers: inserted
    });
  } catch (error: any) {
    console.error('Seeding error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
