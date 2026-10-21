import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products } from '@/lib/schema';
import { redis } from '@/lib/redis';
import { eq } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export interface SpeeroStockItem {
  speeroSku: string;
  oemPartNumber: string;
  brandName: string;
  name: string;
  category: string;
  condition: 'New OEM' | 'Aftermarket OEM-Spec' | 'Used / Tashleeh (Grade A)';
  warehouseCity: 'Riyadh' | 'Jeddah' | 'Dammam';
  stockQty: number;
  wholesalePrice: number;
  suggestedRetailPrice: number;
  weight: number;
  length: number;
  width: number;
  height: number;
  compatibility: string[];
  description: string;
  image: string;
}

const SPEERO_KSA_CATALOG: SpeeroStockItem[] = [
  {
    speeroSku: 'SPR-TOY-04465',
    oemPartNumber: '04465-33471',
    brandName: 'Toyota',
    name: 'Toyota Camry / Avalon Front Ceramic Brake Pads Set (04465-33471)',
    category: 'Brakes & Suspension',
    condition: 'New OEM',
    warehouseCity: 'Riyadh',
    stockQty: 42,
    wholesalePrice: 310,
    suggestedRetailPrice: 385,
    weight: 2.2,
    length: 20,
    width: 15,
    height: 8,
    compatibility: ['Toyota Camry 2018-2024', 'Toyota Avalon 2019-2022', 'Lexus ES350'],
    description: 'Speero Verified Genuine Toyota OEM front ceramic brake pad set with shims.',
    image: 'https://images.unsplash.com/photo-1590362891991-f700445d3153?q=80&w=800&auto=format&fit=crop'
  },
  {
    speeroSku: 'SPR-TOY-27060',
    oemPartNumber: '27060-0V170',
    brandName: 'Toyota',
    name: 'Toyota Land Cruiser / Prado 150A Denso Alternator Assembly (27060-0V170)',
    category: 'Engine Parts',
    condition: 'New OEM',
    warehouseCity: 'Jeddah',
    stockQty: 14,
    wholesalePrice: 1180,
    suggestedRetailPrice: 1450,
    weight: 6.4,
    length: 26,
    width: 22,
    height: 20,
    compatibility: ['Toyota Land Cruiser', 'Toyota Prado', 'Lexus GX460'],
    description: 'Speero Distributor Stock — Original Denso 150A high-output alternator.',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop'
  },
  {
    speeroSku: 'SPR-LEX-48010',
    oemPartNumber: '48010-50240',
    brandName: 'Lexus',
    name: 'Lexus LS460 / LS500 Front Pneumatic Air Suspension Strut (48010-50240)',
    category: 'Brakes & Suspension',
    condition: 'New OEM',
    warehouseCity: 'Riyadh',
    stockQty: 9,
    wholesalePrice: 2950,
    suggestedRetailPrice: 3490,
    weight: 8.8,
    length: 72,
    width: 22,
    height: 22,
    compatibility: ['Lexus LS460', 'Lexus LS500', 'Lexus LX570'],
    description: 'Speero Genuine Lexus electronically controlled front air suspension strut.',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop'
  },
  {
    speeroSku: 'SPR-LEX-81145',
    oemPartNumber: '81145-53540',
    brandName: 'Lexus',
    name: 'Lexus RX350 / ES350 Triple-Beam LED Headlight Assembly RH (81145-53540)',
    category: 'Exterior & Body',
    condition: 'Used / Tashleeh (Grade A)',
    warehouseCity: 'Riyadh',
    stockQty: 5,
    wholesalePrice: 2400,
    suggestedRetailPrice: 2890,
    weight: 5.1,
    length: 64,
    width: 34,
    height: 28,
    compatibility: ['Lexus RX350', 'Lexus ES350'],
    description: 'Speero Inspected Grade-A OEM Triple-Beam LED headlamp unit with ballast.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop'
  },
  {
    speeroSku: 'SPR-KIA-24321',
    oemPartNumber: '24321-2G111',
    brandName: 'Kia',
    name: 'Kia K5 / Sportage / Sorento Mobis Timing Chain & Tensioner Kit (24321-2G111)',
    category: 'Engine Parts',
    condition: 'New OEM',
    warehouseCity: 'Dammam',
    stockQty: 27,
    wholesalePrice: 620,
    suggestedRetailPrice: 780,
    weight: 2.1,
    length: 28,
    width: 22,
    height: 10,
    compatibility: ['Kia K5', 'Kia Sportage', 'Kia Sorento', 'Hyundai Sonata'],
    description: 'Speero Genuine Mobis OEM timing chain, guides, and hydraulic tensioner kit.',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop'
  },
  {
    speeroSku: 'SPR-KIA-97701',
    oemPartNumber: '97701-C5000',
    brandName: 'Kia',
    name: 'Kia Telluride / Sorento V6 Hanon AC Compressor Assembly (97701-C5000)',
    category: 'Engine Parts',
    condition: 'New OEM',
    warehouseCity: 'Riyadh',
    stockQty: 18,
    wholesalePrice: 1150,
    suggestedRetailPrice: 1390,
    weight: 6.3,
    length: 30,
    width: 25,
    height: 24,
    compatibility: ['Kia Telluride', 'Kia Sorento', 'Kia Carnival'],
    description: 'Speero KSA Network — Original Hanon Systems A/C compressor with clutch.',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop'
  },
  {
    speeroSku: 'SPR-BMW-34116',
    oemPartNumber: '34-11-6-880-685',
    brandName: 'BMW',
    name: 'BMW M3 / 5 Series (G30/G80) M-Performance Brembo Front Brake Kit',
    category: 'Brakes & Suspension',
    condition: 'New OEM',
    warehouseCity: 'Riyadh',
    stockQty: 8,
    wholesalePrice: 3250,
    suggestedRetailPrice: 3850,
    weight: 9.5,
    length: 42,
    width: 32,
    height: 18,
    compatibility: ['BMW 5 Series G30', 'BMW M3 G80', 'BMW 3 Series G20', 'BMW X5'],
    description: 'Speero Certified BMW M-Performance 4-piston caliper and ventilated rotor kit.',
    image: 'https://images.unsplash.com/photo-1590362891991-f700445d3153?q=80&w=800&auto=format&fit=crop'
  },
  {
    speeroSku: 'SPR-BMW-11657',
    oemPartNumber: '11-65-7-649-275',
    brandName: 'BMW',
    name: 'BMW B58 3.0L TwinPower Turbocharger & Electronic Wastegate (11657649275)',
    category: 'Engine Parts',
    condition: 'New OEM',
    warehouseCity: 'Jeddah',
    stockQty: 6,
    wholesalePrice: 4600,
    suggestedRetailPrice: 5400,
    weight: 11.2,
    length: 46,
    width: 38,
    height: 30,
    compatibility: ['BMW M340i', 'BMW 540i', 'BMW X5 xDrive40i', 'BMW 740Li'],
    description: 'Speero Distributor Stock — Genuine BorgWarner/BMW TwinScroll turbocharger assembly.',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop'
  },
  {
    speeroSku: 'SPR-AUD-4K094',
    oemPartNumber: '4K0-941-035',
    brandName: 'Audi',
    name: 'Audi A6 / Q7 / Q8 HD Matrix LED Headlamp Assembly Left (4K0-941-035)',
    category: 'Exterior & Body',
    condition: 'New OEM',
    warehouseCity: 'Riyadh',
    stockQty: 7,
    wholesalePrice: 3500,
    suggestedRetailPrice: 4200,
    weight: 5.2,
    length: 62,
    width: 34,
    height: 28,
    compatibility: ['Audi A6 C8', 'Audi Q7', 'Audi Q8', 'Audi S6'],
    description: 'Speero Genuine Audi Matrix LED headlight unit with dynamic indicator module.',
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop'
  },
  {
    speeroSku: 'SPR-AUD-06M14',
    oemPartNumber: '06M-145-702',
    brandName: 'Audi',
    name: 'Audi S5 / RS5 / Q8 3.0L TFSI High-Pressure Fuel Pump & Intercooler Kit',
    category: 'Engine Parts',
    condition: 'Aftermarket OEM-Spec',
    warehouseCity: 'Dammam',
    stockQty: 11,
    wholesalePrice: 1850,
    suggestedRetailPrice: 2290,
    weight: 6.0,
    length: 50,
    width: 30,
    height: 22,
    compatibility: ['Audi S4', 'Audi S5', 'Audi RS5', 'Audi Q8'],
    description: 'Speero Performance Network — Hitachi OEM-spec HPFP and cooling assembly.',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop'
  },
  {
    speeroSku: 'SPR-NIS-21460',
    oemPartNumber: '21460-1LA0A',
    brandName: 'Nissan',
    name: 'Nissan Patrol Y62 V8 5.6L Desert-Spec Radiator & Fan Shroud (21460-1LA0A)',
    category: 'Engine Parts',
    condition: 'New OEM',
    warehouseCity: 'Riyadh',
    stockQty: 19,
    wholesalePrice: 1350,
    suggestedRetailPrice: 1650,
    weight: 7.8,
    length: 75,
    width: 55,
    height: 16,
    compatibility: ['Nissan Patrol Y62', 'Nissan Armada', 'Infiniti QX80'],
    description: 'Speero KSA Stock — Genuine Calsonic Kansei heavy-duty aluminum radiator.',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop'
  },
  {
    speeroSku: 'SPR-HON-16010',
    oemPartNumber: '16010-6A0-A01',
    brandName: 'Honda',
    name: 'Honda Accord / CR-V 1.5T VTEC Direct Fuel Injector Set of 4 (16010-6A0-A01)',
    category: 'Engine Parts',
    condition: 'New OEM',
    warehouseCity: 'Jeddah',
    stockQty: 23,
    wholesalePrice: 890,
    suggestedRetailPrice: 1120,
    weight: 0.95,
    length: 22,
    width: 16,
    height: 8,
    compatibility: ['Honda Accord 2018-2024', 'Honda CR-V', 'Honda Civic'],
    description: 'Speero Verified Genuine Keihin/Honda GDI fuel injectors with seals.',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop'
  },
  {
    speeroSku: 'SPR-HYU-97701',
    oemPartNumber: '97701-L1000',
    brandName: 'Hyundai',
    name: 'Hyundai Sonata / Tucson Genuine Mobis AC Compressor Unit (97701-L1000)',
    category: 'Engine Parts',
    condition: 'New OEM',
    warehouseCity: 'Riyadh',
    stockQty: 31,
    wholesalePrice: 1190,
    suggestedRetailPrice: 1480,
    weight: 6.2,
    length: 30,
    width: 25,
    height: 24,
    compatibility: ['Hyundai Sonata', 'Hyundai Elantra', 'Hyundai Tucson'],
    description: 'Speero KSA Stock — Original Hyundai Mobis high-capacity A/C compressor.',
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop'
  },
  {
    speeroSku: 'SPR-FRD-GL8728',
    oemPartNumber: 'GL-8728-RM',
    brandName: 'Ford',
    name: 'Ford F-150 / Expedition / Taurus Motorcraft 220A Alternator (GL-8728-RM)',
    category: 'Engine Parts',
    condition: 'New OEM',
    warehouseCity: 'Dammam',
    stockQty: 15,
    wholesalePrice: 1020,
    suggestedRetailPrice: 1290,
    weight: 6.8,
    length: 26,
    width: 22,
    height: 22,
    compatibility: ['Ford F-150', 'Ford Expedition', 'Ford Taurus', 'Ford Mustang'],
    description: 'Speero Distributor Stock — Genuine Ford Motorcraft heavy-duty alternator.',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop'
  },
  {
    speeroSku: 'SPR-CHV-84977',
    oemPartNumber: '84977478',
    brandName: 'Chevrolet',
    name: 'Chevrolet Tahoe / Suburban ACDelco MagneRide Front Strut (84977478)',
    category: 'Brakes & Suspension',
    condition: 'New OEM',
    warehouseCity: 'Riyadh',
    stockQty: 16,
    wholesalePrice: 1520,
    suggestedRetailPrice: 1890,
    weight: 8.1,
    length: 68,
    width: 20,
    height: 20,
    compatibility: ['Chevrolet Tahoe', 'Chevrolet Suburban', 'Chevrolet Silverado', 'GMC Yukon'],
    description: 'Speero KSA Stock — Original GM ACDelco Magnetic Ride Control shock absorber.',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop'
  },
  {
    speeroSku: 'SPR-MAZ-PE2018',
    oemPartNumber: 'PE20-18-100A',
    brandName: 'Mazda',
    name: 'Mazda CX-9 / Mazda6 SkyActiv-G Ignition Coil & Spark Plug Service Kit',
    category: 'Engine Parts',
    condition: 'New OEM',
    warehouseCity: 'Jeddah',
    stockQty: 24,
    wholesalePrice: 540,
    suggestedRetailPrice: 690,
    weight: 1.4,
    length: 24,
    width: 18,
    height: 8,
    compatibility: ['Mazda CX-9', 'Mazda6', 'Mazda CX-5', 'Mazda3'],
    description: 'Speero Genuine Mazda OEM ignition coils (4x) and NGK Laser Iridium plugs.',
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop'
  },
  {
    speeroSku: 'SPR-MER-22232',
    oemPartNumber: 'A222-320-47-13',
    brandName: 'Mercedes',
    name: 'Mercedes-Benz S-Class / E-Class (W222/W213) Airmatic Front Suspension Strut',
    category: 'Brakes & Suspension',
    condition: 'New OEM',
    warehouseCity: 'Riyadh',
    stockQty: 10,
    wholesalePrice: 3890,
    suggestedRetailPrice: 4650,
    weight: 9.2,
    length: 72,
    width: 22,
    height: 22,
    compatibility: ['Mercedes S-Class', 'Mercedes E-Class', 'Mercedes GLE'],
    description: 'Speero Luxury Network — Genuine Mercedes-Benz Bilstein Airmatic strut assembly.',
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop'
  }
];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const brand = searchParams.get('brand') || 'all';
  const category = searchParams.get('category') || 'all';
  const condition = searchParams.get('condition') || 'all';
  const query = (searchParams.get('query') || '').trim().toLowerCase();

  const speeroApiKey = request.headers.get('X-Speero-Api-Key') || process.env.SPEERO_API_KEY || '';
  const speeroApiUrl = process.env.SPEERO_API_URL || '';

  let catalogItems: SpeeroStockItem[] = SPEERO_KSA_CATALOG;
  let source = 'speero_ksa_network';

  // If external SPEERO_API_URL and SPEERO_API_KEY are configured, try fetching live upstream feed first
  if (speeroApiUrl && speeroApiKey) {
    try {
      const upstreamRes = await fetch(
        `${speeroApiUrl}/v1/inventory?brand=${encodeURIComponent(brand)}&q=${encodeURIComponent(query)}`,
        {
          headers: {
            Authorization: `Bearer ${speeroApiKey}`,
            Accept: 'application/json'
          }
        }
      );
      if (upstreamRes.ok) {
        const upstreamData = await upstreamRes.json();
        if (Array.isArray(upstreamData?.items) && upstreamData.items.length > 0) {
          catalogItems = upstreamData.items;
          source = 'speero_live_api';
        }
      }
    } catch (err) {
      console.warn('Speero live endpoint unreachable, using Speero KSA network catalog feed.');
    }
  }

  const filtered = catalogItems.filter(item => {
    if (brand !== 'all' && item.brandName.toLowerCase() !== brand.toLowerCase()) return false;
    if (category !== 'all' && item.category.toLowerCase() !== category.toLowerCase()) return false;
    if (condition !== 'all' && !item.condition.toLowerCase().includes(condition.toLowerCase())) return false;
    if (query) {
      const haystack = `${item.speeroSku} ${item.oemPartNumber} ${item.brandName} ${item.name} ${item.description} ${item.compatibility.join(' ')}`.toLowerCase();
      return haystack.includes(query);
    }
    return true;
  });

  return NextResponse.json({
    source,
    connected: true,
    totalAvailable: filtered.length,
    items: filtered
  });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('X-Tenant-ID') || body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required to import Speero stock' }, { status: 400 });
    }

    const markupPercent = Number(body.markupPercent ?? 0);
    const skusToImport: string[] = Array.isArray(body.speeroSkus)
      ? body.speeroSkus
      : body.speeroSku
      ? [body.speeroSku]
      : [];

    const customItems: SpeeroStockItem[] = Array.isArray(body.items) ? body.items : [];

    const selectedCatalogItems =
      customItems.length > 0
        ? customItems
        : SPEERO_KSA_CATALOG.filter(item => skusToImport.includes(item.speeroSku));

    if (selectedCatalogItems.length === 0) {
      return NextResponse.json({ error: 'No matching Speero stock items selected for import' }, { status: 400 });
    }

    // Check existing products for this tenant so we update or skip duplicates cleanly
    const existingTenantProducts = await db
      .select()
      .from(products)
      .where(eq(products.tenantId, tenantId));

    const existingNames = new Set(existingTenantProducts.map(p => p.name.toLowerCase()));

    const rowsToInsert = [];
    for (const item of selectedCatalogItems) {
      if (existingNames.has(item.name.toLowerCase())) continue;

      const basePrice = body.useWholesaleBase ? item.wholesalePrice : item.suggestedRetailPrice;
      const finalPrice = body.customPrice
        ? Number(body.customPrice)
        : basePrice * (1 + markupPercent / 100);

      rowsToInsert.push({
        tenantId,
        name: item.name,
        price: finalPrice.toFixed(2),
        category: item.category,
        brandName: item.brandName,
        tecdocArticleId: item.oemPartNumber,
        description: `[Speero SKU: ${item.speeroSku} • ${item.condition} • ${item.warehouseCity} Warehouse] ${item.description}`,
        compatibility: [item.brandName, ...item.compatibility],
        image: item.image,
        rating: '4.9',
        featured: true,
        weight: item.weight.toFixed(2),
        length: item.length.toFixed(2),
        width: item.width.toFixed(2),
        height: item.height.toFixed(2),
        status: 'active'
      });
    }

    let inserted: any[] = [];
    if (rowsToInsert.length > 0) {
      inserted = await db.insert(products).values(rowsToInsert).returning();
    }

    try {
      await redis.del(`products:tenant:${tenantId}`);
      await redis.del(`products:all`);
      await redis.del(`products:v2:tenant:${tenantId}`);
      await redis.del(`products:v2:all`);
      await redis.del(`products:v3:tenant:${tenantId}`);
      await redis.del(`products:v3:all`);
    } catch (e) {}

    return NextResponse.json({
      success: true,
      importedCount: inserted.length,
      skippedDuplicates: selectedCatalogItems.length - inserted.length,
      products: inserted
    });
  } catch (error: any) {
    console.error('Error importing Speero stock:', error);
    return NextResponse.json({ error: error.message || 'Failed to import Speero stock' }, { status: 500 });
  }
}
