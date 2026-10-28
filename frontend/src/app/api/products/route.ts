import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { products, tenants } from '@/lib/schema';
import { redis } from '@/lib/redis';
import { eq } from 'drizzle-orm';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { resolvePartImage } from '@/lib/part-images';

export const dynamic = 'force-dynamic';

const apiKey = process.env.GEMINI_API_KEY || '';
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;

const BRAND_SEED_CATALOG = [
  // Riyadh OEM Parts Co. (t-riyadh-oem)
  {
    brandName: 'Toyota',
    sellerPrefer: 'Riyadh OEM Parts Co.',
    tenantSubdomain: 'riyadh-oem',
    name: 'Toyota Camry Genuine Ceramic Brake Pads Kit (04465-33471)',
    price: '385.00',
    category: 'Brakes & Suspension',
    description: 'Genuine Toyota front ceramic brake pad set with anti-squeal shims for Camry and Avalon (2018–2025).',
    compatibility: ['Toyota', 'Camry', 'Avalon', 'Lexus ES350'],
    image: 'https://images.unsplash.com/photo-1590362891991-f700445d3153?q=80&w=800&auto=format&fit=crop',
    rating: '4.95',
    featured: true,
    weight: '2.20',
    length: '20.00',
    width: '15.00',
    height: '8.00'
  },
  {
    brandName: 'Lexus',
    sellerPrefer: 'Riyadh OEM Parts Co.',
    tenantSubdomain: 'riyadh-oem',
    name: 'Lexus ES350 / RX350 Genuine Front Brake Rotor Disc (43512-33140)',
    price: '640.00',
    category: 'Brakes & Suspension',
    description: 'Ventilated high-thermal dissipation genuine rotor engineered for smooth stopping on ES and RX series.',
    compatibility: ['Lexus', 'ES350', 'RX350', 'LX570'],
    image: 'https://images.unsplash.com/photo-1590362891991-f700445d3153?q=80&w=800&auto=format&fit=crop',
    rating: '4.90',
    featured: true,
    weight: '7.40',
    length: '34.00',
    width: '34.00',
    height: '8.00'
  },
  {
    brandName: 'Kia',
    sellerPrefer: 'Riyadh OEM Parts Co.',
    tenantSubdomain: 'riyadh-oem',
    name: 'Kia K5 / Sportage Mobis Genuine Timing Chain & Tensioner Kit',
    price: '780.00',
    category: 'Engine Parts',
    description: 'OEM Hyundai/Kia Mobis full timing chain kit with hydraulic tensioner and guide rails.',
    compatibility: ['Kia', 'K5', 'Sportage', 'Sorento', 'Hyundai Sonata'],
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop',
    rating: '4.88',
    featured: true,
    weight: '2.10',
    length: '28.00',
    width: '22.00',
    height: '10.00'
  },
  {
    brandName: 'BMW',
    sellerPrefer: 'Riyadh OEM Parts Co.',
    tenantSubdomain: 'riyadh-oem',
    name: 'BMW M-Performance Brembo 4-Piston Caliper & Rotor Kit',
    price: '3850.00',
    category: 'Brakes & Suspension',
    description: 'Official BMW M Performance brake system upgrade kit with red calipers and slotted rotors.',
    compatibility: ['BMW', '3 Series', '5 Series', 'M3', 'M340i'],
    image: 'https://images.unsplash.com/photo-1590362891991-f700445d3153?q=80&w=800&auto=format&fit=crop',
    rating: '5.00',
    featured: true,
    weight: '14.50',
    length: '45.00',
    width: '45.00',
    height: '25.00'
  },
  {
    brandName: 'Audi',
    sellerPrefer: 'Riyadh OEM Parts Co.',
    tenantSubdomain: 'riyadh-oem',
    name: 'Audi A6 / Q7 Dynamic Matrix LED Headlamp Left (4K0-941-035)',
    price: '4200.00',
    category: 'Exterior & Body',
    description: 'Original OEM Audi Matrix LED headlight assembly with sequential turn signals.',
    compatibility: ['Audi', 'A6', 'A7', 'Q7', 'Q8'],
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
    rating: '4.92',
    featured: true,
    weight: '4.50',
    length: '60.00',
    width: '35.00',
    height: '30.00'
  },
  {
    brandName: 'Hyundai',
    sellerPrefer: 'Riyadh OEM Parts Co.',
    tenantSubdomain: 'riyadh-oem',
    name: 'Hyundai Elantra / Tucson Genuine High-Flow Air Filter Element',
    price: '75.00',
    category: 'Engine Parts',
    description: 'Mobis genuine engine air intake filter for optimal fuel efficiency and engine protection.',
    compatibility: ['Hyundai', 'Elantra', 'Tucson', 'Kia Sportage'],
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop',
    rating: '4.90',
    featured: false,
    weight: '0.45',
    length: '26.00',
    width: '18.00',
    height: '5.00'
  },
  {
    brandName: 'Toyota',
    sellerPrefer: 'Riyadh OEM Parts Co.',
    tenantSubdomain: 'riyadh-oem',
    name: 'Toyota Land Cruiser 300 / Prado High-Pressure Fuel Pump (23100-24010)',
    price: '1450.00',
    category: 'Engine Parts',
    description: 'Genuine Denso/Toyota Japan high-pressure direct fuel pump assembly for Land Cruiser V6 twin turbo.',
    compatibility: ['Toyota', 'Land Cruiser', 'Prado', 'Lexus LX600'],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
    rating: '4.96',
    featured: true,
    weight: '2.80',
    length: '22.00',
    width: '18.00',
    height: '15.00'
  },
  {
    brandName: 'Toyota',
    sellerPrefer: 'Riyadh OEM Parts Co.',
    tenantSubdomain: 'riyadh-oem',
    name: 'Toyota Corolla / Yaris Genuine Engine Water Pump Assembly (16100-29206)',
    price: '295.00',
    category: 'Engine Parts',
    description: 'Original Toyota Aisin cooling system water pump with gasket seal for 1.5L and 2.0L engines.',
    compatibility: ['Toyota', 'Corolla', 'Yaris', 'Raize'],
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop',
    rating: '4.91',
    featured: false,
    weight: '1.40',
    length: '18.00',
    width: '16.00',
    height: '14.00'
  },
  {
    brandName: 'Toyota',
    sellerPrefer: 'Riyadh OEM Parts Co.',
    tenantSubdomain: 'riyadh-oem',
    name: 'Denso Toyota Genuine Iridium TT Spark Plugs Set of 4 (SK20R11)',
    price: '160.00',
    category: 'Electrical & Sensors',
    description: 'High-ignitability twin-tip iridium spark plugs for maximum acceleration and fuel economy.',
    compatibility: ['Toyota', 'Camry', 'Corolla', 'RAV4', 'Avalon'],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
    rating: '4.94',
    featured: false,
    weight: '0.35',
    length: '12.00',
    width: '10.00',
    height: '4.00'
  },
  {
    brandName: 'Mercedes',
    sellerPrefer: 'Riyadh OEM Parts Co.',
    tenantSubdomain: 'riyadh-oem',
    name: 'Mercedes-Benz E-Class W213 Air Suspension Compressor (0993200104)',
    price: '2850.00',
    category: 'Brakes & Suspension',
    description: 'Genuine AMK/Mercedes airmatic suspension pump compressor for smooth ride height control.',
    compatibility: ['Mercedes', 'E-Class', 'CLS', 'S-Class'],
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop',
    rating: '4.98',
    featured: true,
    weight: '4.20',
    length: '30.00',
    width: '22.00',
    height: '20.00'
  },

  // Wadi Uhud Nissan Genuine Parts (t-wadi-uhud)
  {
    brandName: 'Nissan',
    sellerPrefer: 'Wadi Uhud Nissan Genuine Parts',
    tenantSubdomain: 'wadi-uhud',
    name: 'Nissan Patrol Y62 V8 Genuine Engine Oil Pump Assembly',
    price: '920.00',
    category: 'Engine Parts',
    description: 'Original Nissan Japan high-pressure oil pump for Patrol Safari and Y62 5.6L V8 engines.',
    compatibility: ['Nissan', 'Patrol', 'Armada', 'Titan'],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
    rating: '4.98',
    featured: true,
    weight: '3.80',
    length: '28.00',
    width: '24.00',
    height: '16.00'
  },
  {
    brandName: 'Nissan',
    sellerPrefer: 'Wadi Uhud Nissan Genuine Parts',
    tenantSubdomain: 'wadi-uhud',
    name: 'Nissan Patrol Y62 Front Ceramic Brake Pads Set OEM (D1060-1LB0A)',
    price: '420.00',
    category: 'Brakes & Suspension',
    description: 'Heavy-duty ceramic front brake pads for Nissan Patrol Y62 with anti-dust compound.',
    compatibility: ['Nissan', 'Patrol', 'Armada', 'Infiniti QX80'],
    image: 'https://images.unsplash.com/photo-1590362891991-f700445d3153?q=80&w=800&auto=format&fit=crop',
    rating: '4.93',
    featured: true,
    weight: '2.60',
    length: '22.00',
    width: '16.00',
    height: '9.00'
  },
  {
    brandName: 'Nissan',
    sellerPrefer: 'Wadi Uhud Nissan Genuine Parts',
    tenantSubdomain: 'wadi-uhud',
    name: 'Nissan Altima / Maxima OEM Engine Alternator 130A (23100-3TA1B)',
    price: '1180.00',
    category: 'Electrical & Sensors',
    description: 'Genuine Valeo/Nissan 130-Amp high-efficiency alternator for stable electrical current.',
    compatibility: ['Nissan', 'Altima', 'Maxima', 'Murano'],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
    rating: '4.89',
    featured: false,
    weight: '6.20',
    length: '26.00',
    width: '24.00',
    height: '22.00'
  },
  {
    brandName: 'Nissan',
    sellerPrefer: 'Wadi Uhud Nissan Genuine Parts',
    tenantSubdomain: 'wadi-uhud',
    name: 'Nissan Patrol Y62 Rear Hydraulic Shock Absorbers Pair (56210-1LA8A)',
    price: '750.00',
    category: 'Brakes & Suspension',
    description: 'Hitachi/Nissan genuine rear shock absorber struts engineered for rugged desert terrain.',
    compatibility: ['Nissan', 'Patrol', 'Safari', 'Infiniti QX80'],
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop',
    rating: '4.92',
    featured: true,
    weight: '5.80',
    length: '52.00',
    width: '18.00',
    height: '18.00'
  },
  {
    brandName: 'Nissan',
    sellerPrefer: 'Wadi Uhud Nissan Genuine Parts',
    tenantSubdomain: 'wadi-uhud',
    name: 'Infiniti QX80 / QX60 Genuine Engine Starter Motor (23300-1CA0B)',
    price: '1290.00',
    category: 'Electrical & Sensors',
    description: 'Original Mitsuba/Nissan high-torque starter motor assembly for quick reliable ignition.',
    compatibility: ['Nissan', 'Patrol', 'Infiniti QX80', 'Infiniti QX60'],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
    rating: '4.95',
    featured: false,
    weight: '4.10',
    length: '25.00',
    width: '18.00',
    height: '16.00'
  },
  {
    brandName: 'Nissan',
    sellerPrefer: 'Wadi Uhud Nissan Genuine Parts',
    tenantSubdomain: 'wadi-uhud',
    name: 'Nissan Genuine Laser Platinum Spark Plugs 6-Pack (DILKAR758G)',
    price: '280.00',
    category: 'Electrical & Sensors',
    description: 'NGK/Nissan laser platinum spark plugs for V6 and V8 engines (Patrol, Maxima, Pathfinder).',
    compatibility: ['Nissan', 'Patrol', 'Maxima', 'Pathfinder'],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
    rating: '4.90',
    featured: false,
    weight: '0.50',
    length: '14.00',
    width: '12.00',
    height: '4.00'
  },

  // Babkeer Auto Mazda Agency (t-babkeer-mazda)
  {
    brandName: 'Mazda',
    sellerPrefer: 'Babkeer Auto Mazda Agency',
    tenantSubdomain: 'babkeer-mazda',
    name: 'Mazda SkyActiv-G Laser Iridium Spark Plugs Set of 4 (PE5R-18-110)',
    price: '210.00',
    category: 'Electrical & Sensors',
    description: 'Genuine OEM Mazda SkyActiv high-performance spark plugs engineered for longevity.',
    compatibility: ['Mazda', 'Mazda 3', 'Mazda 6', 'CX-5', 'CX-9'],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
    rating: '4.94',
    featured: true,
    weight: '0.35',
    length: '12.00',
    width: '10.00',
    height: '3.00'
  },
  {
    brandName: 'Mazda',
    sellerPrefer: 'Babkeer Auto Mazda Agency',
    tenantSubdomain: 'babkeer-mazda',
    name: 'Mazda CX-9 / CX-5 Front Ventilated Brake Discs Pair (K011-33-251A)',
    price: '680.00',
    category: 'Brakes & Suspension',
    description: 'Genuine high-carbon heat-treated front brake rotor pair for Mazda SUV line.',
    compatibility: ['Mazda', 'CX-9', 'CX-5', 'CX-30'],
    image: 'https://images.unsplash.com/photo-1590362891991-f700445d3153?q=80&w=800&auto=format&fit=crop',
    rating: '4.92',
    featured: true,
    weight: '14.00',
    length: '32.00',
    width: '32.00',
    height: '12.00'
  },
  {
    brandName: 'Mazda',
    sellerPrefer: 'Babkeer Auto Mazda Agency',
    tenantSubdomain: 'babkeer-mazda',
    name: 'Mazda 6 / CX-5 Genuine SkyActiv Drive Belt Tensioner (PY01-15-980)',
    price: '340.00',
    category: 'Engine Parts',
    description: 'OEM hydraulic serpentine drive belt tensioner assembly with pulley for smooth operation.',
    compatibility: ['Mazda', 'Mazda 6', 'CX-5', 'Mazda 3'],
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop',
    rating: '4.88',
    featured: false,
    weight: '1.20',
    length: '16.00',
    width: '14.00',
    height: '10.00'
  },
  {
    brandName: 'Mazda',
    sellerPrefer: 'Babkeer Auto Mazda Agency',
    tenantSubdomain: 'babkeer-mazda',
    name: 'Mazda CX-9 Genuine LED Taillight Outer Assembly Left (TK78-51-160C)',
    price: '980.00',
    category: 'Exterior & Body',
    description: 'Original Koito/Mazda crystal LED tail lamp cluster with integrated turn signals.',
    compatibility: ['Mazda', 'CX-9'],
    image: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
    rating: '4.96',
    featured: false,
    weight: '2.50',
    length: '48.00',
    width: '28.00',
    height: '22.00'
  },
  {
    brandName: 'Mazda',
    sellerPrefer: 'Babkeer Auto Mazda Agency',
    tenantSubdomain: 'babkeer-mazda',
    name: 'Mazda SkyActiv Automatic Transmission Fluid Filter Kit (FZ01-21-500)',
    price: '195.00',
    category: 'Transmission',
    description: 'Original Mazda 6-speed automatic transmission filter with pan gasket seal.',
    compatibility: ['Mazda', 'Mazda 3', 'Mazda 6', 'CX-5', 'CX-9'],
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop',
    rating: '4.87',
    featured: false,
    weight: '0.65',
    length: '20.00',
    width: '18.00',
    height: '6.00'
  },

  // El-Shafie Auto Electrical & AC Components (t-el-shafie)
  {
    brandName: 'Toyota',
    sellerPrefer: 'El-Shafie Auto Electrical & AC Components',
    tenantSubdomain: 'el-shafie',
    name: 'Denso OEM AC Compressor for Land Cruiser & Prado (88320-60700)',
    price: '1650.00',
    category: 'Engine Parts',
    description: 'Original Denso 10S20C heavy-duty automotive air conditioning compressor with clutch.',
    compatibility: ['Toyota', 'Land Cruiser', 'Prado', 'Lexus GX460'],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
    rating: '4.97',
    featured: true,
    weight: '7.80',
    length: '28.00',
    width: '22.00',
    height: '20.00'
  },
  {
    brandName: 'Toyota',
    sellerPrefer: 'El-Shafie Auto Electrical & AC Components',
    tenantSubdomain: 'el-shafie',
    name: 'Genuine Toyota Camry / RAV4 Radiator Cooling Fan Assembly (16363-25010)',
    price: '520.00',
    category: 'Electrical & Sensors',
    description: 'Complete dual electric radiator fan assembly with brushless motor and shroud.',
    compatibility: ['Toyota', 'Camry', 'RAV4', 'Avalon'],
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop',
    rating: '4.90',
    featured: false,
    weight: '3.40',
    length: '50.00',
    width: '45.00',
    height: '15.00'
  },
  {
    brandName: 'Ford',
    sellerPrefer: 'El-Shafie Auto Electrical & AC Components',
    tenantSubdomain: 'el-shafie',
    name: 'Bosch S5 High-Output 12V 80Ah AGM Automotive Battery (S5-A11)',
    price: '620.00',
    category: 'Electrical & Sensors',
    description: 'German-engineered AGM maintenance-free battery for modern start-stop vehicles.',
    compatibility: ['Ford', 'Chevrolet', 'BMW', 'Audi', 'Mercedes'],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
    rating: '4.93',
    featured: true,
    weight: '21.00',
    length: '31.00',
    width: '17.50',
    height: '19.00'
  },
  {
    brandName: 'Toyota',
    sellerPrefer: 'El-Shafie Auto Electrical & AC Components',
    tenantSubdomain: 'el-shafie',
    name: 'Toyota Prado / Fortuner Heavy-Duty Starter Motor (28100-0C080)',
    price: '890.00',
    category: 'Electrical & Sensors',
    description: 'Genuine Denso 2.0kW reduction starter motor for Toyota 2.7L and 4.0L engines.',
    compatibility: ['Toyota', 'Prado', 'Fortuner', 'Hilux'],
    image: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
    rating: '4.91',
    featured: false,
    weight: '4.30',
    length: '24.00',
    width: '18.00',
    height: '15.00'
  },

  // Hamzah Sadiq Japanese Suspension & Shocks (t-hamzah-sadiq)
  {
    brandName: 'Toyota',
    sellerPrefer: 'Hamzah Sadiq Japanese Suspension & Shocks',
    tenantSubdomain: 'hamzah-sadiq',
    name: 'KYB Gas-A-Just Heavy-Duty Front Shock Absorbers Pair (551130)',
    price: '850.00',
    category: 'Brakes & Suspension',
    description: 'Monotube high-pressure gas shocks for Land Cruiser 200 and Lexus LX570 stability.',
    compatibility: ['Toyota', 'Land Cruiser', 'Lexus LX570'],
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop',
    rating: '4.95',
    featured: true,
    weight: '6.40',
    length: '55.00',
    width: '16.00',
    height: '16.00'
  },
  {
    brandName: 'Toyota',
    sellerPrefer: 'Hamzah Sadiq Japanese Suspension & Shocks',
    tenantSubdomain: 'hamzah-sadiq',
    name: '555 Japan Lower Ball Joints Pair for Toyota Hilux & Fortuner (SB-3882)',
    price: '260.00',
    category: 'Brakes & Suspension',
    description: 'Precision forged alloy lower ball joints made in Japan for heavy-duty load capacity.',
    compatibility: ['Toyota', 'Hilux', 'Fortuner', 'Prado'],
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop',
    rating: '4.90',
    featured: false,
    weight: '1.80',
    length: '18.00',
    width: '14.00',
    height: '8.00'
  },
  {
    brandName: 'Honda',
    sellerPrefer: 'Hamzah Sadiq Japanese Suspension & Shocks',
    tenantSubdomain: 'hamzah-sadiq',
    name: 'Honda Accord / Civic OEM Front Ceramic Brake Pads (45022-T2G-A01)',
    price: '340.00',
    category: 'Brakes & Suspension',
    description: 'Genuine Nissin/Honda ceramic brake pads with minimal dust and quiet braking.',
    compatibility: ['Honda', 'Accord', 'Civic', 'CR-V'],
    image: 'https://images.unsplash.com/photo-1590362891991-f700445d3153?q=80&w=800&auto=format&fit=crop',
    rating: '4.92',
    featured: false,
    weight: '2.10',
    length: '20.00',
    width: '14.00',
    height: '8.00'
  },
  {
    brandName: 'Toyota',
    sellerPrefer: 'Hamzah Sadiq Japanese Suspension & Shocks',
    tenantSubdomain: 'hamzah-sadiq',
    name: 'KYB Excel-G Rear Shock Absorbers Pair for Camry / Avalon (341386)',
    price: '490.00',
    category: 'Brakes & Suspension',
    description: 'Twin-tube gas struts engineered to restore original factory ride control and handling.',
    compatibility: ['Toyota', 'Camry', 'Avalon', 'Lexus ES350'],
    image: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop',
    rating: '4.91',
    featured: false,
    weight: '5.20',
    length: '50.00',
    width: '15.00',
    height: '15.00'
  }
];

function sanitizeProductsList(list: any[]) {
  return list.map(p => ({
    ...p,
    image: resolvePartImage(p.image, p.category, p.name)
  }));
}

async function invalidateProductCaches(tenantId?: string | null) {
  try {
    if (tenantId) {
      await redis.del(`products:tenant:${tenantId}`);
      await redis.del(`products:v2:tenant:${tenantId}`);
      await redis.del(`products:v3:tenant:${tenantId}`);
    }
    await redis.del(`products:all`);
    await redis.del(`products:v2:all`);
    await redis.del(`products:v3:all`);
  } catch (e) {}
}

async function ensureBrandCatalogSeeded(existingProducts: any[]) {
  try {
    const existingText = existingProducts
      .map(p => `${p.brandName || ''} ${p.name || ''}`.toLowerCase())
      .join(' | ');

    const missingSeeds = BRAND_SEED_CATALOG.filter(
      seed => !existingText.includes(seed.name.toLowerCase())
    );

    if (missingSeeds.length === 0) return existingProducts;

    const allTenants = await db.select().from(tenants);
    if (allTenants.length === 0) return existingProducts;

    const defaultTenant = allTenants[0];
    const rowsToInsert = missingSeeds.map(seed => {
      const matchedTenant =
        allTenants.find(t => t.name === seed.sellerPrefer || (seed.tenantSubdomain && t.subdomain === seed.tenantSubdomain)) || defaultTenant;
      return {
        tenantId: matchedTenant.id,
        name: seed.name,
        price: seed.price,
        category: seed.category,
        description: seed.description,
        compatibility: seed.compatibility,
        brandName: seed.brandName,
        image: seed.image,
        rating: seed.rating,
        featured: seed.featured,
        weight: seed.weight,
        length: seed.length,
        width: seed.width,
        height: seed.height,
        status: 'active'
      };
    });

    const inserted = await db.insert(products).values(rowsToInsert).returning();
    return [...existingProducts, ...inserted];
  } catch (seedErr) {
    console.warn('Auto-seed brand catalog skipped:', seedErr);
    return existingProducts;
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const tenantId = searchParams.get('tenantId');
  const productId = searchParams.get('id');

  try {
    if (productId) {
      const found = await db.select().from(products).where(eq(products.id, productId)).limit(1);
      if (found.length > 0) {
        const sanitized = sanitizeProductsList(found)[0];
        return NextResponse.json({ product: sanitized });
      }
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    if (!tenantId) {
      const cacheKey = `products:v3:all`;
      try {
        const cached = await redis.get(cacheKey);
        if (cached) {
          const parsed = JSON.parse(cached);
          const list = Array.isArray(parsed) ? parsed : (parsed.products || []);
          if (list.length >= 29) {
            return NextResponse.json({ products: sanitizeProductsList(list) });
          }
        }
      } catch (e) {}

      let allProducts = await db.select().from(products);
      allProducts = await ensureBrandCatalogSeeded(allProducts);
      const sanitizedAll = sanitizeProductsList(allProducts);

      try {
        await redis.setex(cacheKey, 300, JSON.stringify({ products: sanitizedAll }));
      } catch (e) {}

      return NextResponse.json({ products: sanitizedAll });
    }

    const allCurrent = await db.select().from(products);
    if (allCurrent.length < 29) {
      await ensureBrandCatalogSeeded(allCurrent);
    }

    const cacheKey = `products:v3:tenant:${tenantId}`;
    try {
      const cached = await redis.get(cacheKey);
      if (cached) {
        const parsed = JSON.parse(cached);
        const list = Array.isArray(parsed) ? parsed : (parsed.products || []);
        return NextResponse.json({ products: sanitizeProductsList(list) });
      }
    } catch (e) {}

    const tenantProducts = await db.select().from(products).where(eq(products.tenantId, tenantId as string));
    const sanitizedTenant = sanitizeProductsList(tenantProducts);

    try {
      await redis.setex(cacheKey, 300, JSON.stringify({ products: sanitizedTenant }));
    } catch (e) {}

    return NextResponse.json({ products: sanitizedTenant });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const tenantId = request.headers.get('X-Tenant-ID') || body.tenantId;

    if (!tenantId) {
      return NextResponse.json({ error: 'Tenant ID is required' }, { status: 400 });
    }

    let productStatus = body.status || 'active';
    let modReason = null;

    // AI COMPLIANCE GUARD
    if (genAI) {
      const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const prompt = `
        You are a compliance moderator for a Saudi auto parts marketplace.
        Evaluate this product submission for safety, legality, and platform compliance.
        Product Name: "${body.name}"
        Description: "${body.description || 'N/A'}"
        
        Rules:
        - No illegal modifications (e.g., 100% dark window tints, license plate hiders)
        - No weapons, drugs, or non-automotive items
        - No obvious spam or abusive language
        
        If the product is STRICTLY prohibited or unsafe, output a JSON object:
        {"compliant": false, "reason": "Specific reason why it is blocked"}
        
        If it is acceptable (even if vague or poorly described), output:
        {"compliant": true}
        
        Output ONLY the JSON object.
      `;

      try {
        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        
        if (jsonMatch) {
          const compliance = JSON.parse(jsonMatch[0]);
          if (!compliance.compliant) {
             productStatus = 'pending_review';
             modReason = compliance.reason;
          }
        }
      } catch (aiError) {
        console.error("AI Compliance Check Failed (Proceeding anyway):", aiError);
      }
    }

    const newProduct = await db.insert(products).values({
      tenantId: tenantId,
      name: body.name,
      price: String(body.price || '0.00'),
      category: body.category || 'Engine Parts',
      image: resolvePartImage(body.image, body.category, body.name),
      description: body.description || null,
      compatibility: body.compatibility || null,
      brandName: body.brandName || null,
      tecdocArticleId: body.tecdocArticleId || body.oemPartNumber || null,
      weight: String(body.weight || '1.50'),
      length: String(body.length || '20.00'),
      width: String(body.width || '15.00'),
      height: String(body.height || '10.00'),
      status: productStatus,
      moderationReason: modReason,
      featured: Boolean(body.featured)
    }).returning();
    
    await invalidateProductCaches(tenantId);

    return NextResponse.json({ product: newProduct[0] }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    const body = await request.json();
    const productId = id || body.id;

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const updateValues: any = { updatedAt: new Date() };
    if (body.name !== undefined) updateValues.name = body.name;
    if (body.price !== undefined) updateValues.price = String(body.price);
    if (body.category !== undefined) updateValues.category = body.category;
    if (body.brandName !== undefined) updateValues.brandName = body.brandName;
    if (body.description !== undefined) updateValues.description = body.description;
    if (body.status !== undefined) updateValues.status = body.status;
    if (body.featured !== undefined) updateValues.featured = Boolean(body.featured);
    if (body.weight !== undefined) updateValues.weight = String(body.weight);
    if (body.image !== undefined) updateValues.image = body.image;

    const updated = await db
      .update(products)
      .set(updateValues)
      .where(eq(products.id, productId))
      .returning();

    if (updated.length === 0) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await invalidateProductCaches(updated[0].tenantId);

    return NextResponse.json({ product: updated[0] });
  } catch (error: any) {
    console.error('Error updating product:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    const deleted = await db
      .delete(products)
      .where(eq(products.id, id))
      .returning();

    if (deleted.length > 0) {
      await invalidateProductCaches(deleted[0].tenantId);
    } else {
      await invalidateProductCaches();
    }

    return NextResponse.json({ success: true, deletedId: id });
  } catch (error: any) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
