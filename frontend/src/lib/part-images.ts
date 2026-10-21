const BROKEN_UNSPLASH_IDS = [
  'photo-1600705593881-229202517565',
  'photo-1586266153920-563b7df089e1',
  'photo-1596706798031-bb035c935d2d',
  'photo-1616428789525-41e975f8f53a',
];

export const VERIFIED_PART_PHOTOS = {
  brakes: 'https://images.unsplash.com/photo-1590362891991-f700445d3153?q=80&w=800&auto=format&fit=crop',
  suspension: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?q=80&w=800&auto=format&fit=crop',
  engine: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?q=80&w=800&auto=format&fit=crop',
  enginePerformance: 'https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?q=80&w=800&auto=format&fit=crop',
  exhaust: 'https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?q=80&w=800&auto=format&fit=crop',
  exterior: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=800&auto=format&fit=crop',
  interior: 'https://images.unsplash.com/photo-1549399542-7e3f8b79c341?q=80&w=800&auto=format&fit=crop',
};

export interface FallbackPartItem {
  id: string;
  brandName: string;
  name: string;
  price: number;
  category: string;
  description: string;
  compatibility: string[];
  image: string;
  rating: number;
  featured: boolean;
  weight: number;
  length?: number;
  width?: number;
  height?: number;
  oemPartNumber?: string;
}

export const FALLBACK_BRAND_PARTS: FallbackPartItem[] = [
  {
    id: 'brand-toyota-brake-pads',
    brandName: 'Toyota',
    oemPartNumber: '04465-33471',
    name: 'Toyota Camry OEM Ceramic Brake Pads Kit (04465-33471)',
    price: 385,
    category: 'Brakes & Suspension',
    description: 'Genuine Toyota front ceramic brake pad set with anti-squeal shims for Camry and Avalon (2018–2024).',
    compatibility: ['Toyota', 'Camry', 'Avalon', 'ES350'],
    image: VERIFIED_PART_PHOTOS.brakes,
    rating: 4.9,
    featured: true,
    weight: 2.2,
    length: 20,
    width: 15,
    height: 8
  },
  {
    id: 'brand-lexus-brake-rotor',
    brandName: 'Lexus',
    oemPartNumber: '43512-33140',
    name: 'Lexus ES350 / RX350 Genuine Front Brake Rotor Disc (43512-33140)',
    price: 640,
    category: 'Brakes & Suspension',
    description: 'Genuine Lexus ventilated front brake disc rotor engineered for smooth braking and high thermal capacity on ES350 and RX350 models.',
    compatibility: ['Lexus', 'ES350', 'RX350', 'LX570'],
    image: VERIFIED_PART_PHOTOS.brakes,
    rating: 4.9,
    featured: true,
    weight: 7.4,
    length: 34,
    width: 34,
    height: 8
  },
  {
    id: 'brand-kia-timing-kit',
    brandName: 'Kia',
    oemPartNumber: '24321-2G111',
    name: 'Kia K5 / Sportage Genuine Timing Chain & Tensioner Kit (24321-2G111)',
    price: 780,
    category: 'Engine Parts',
    description: 'OEM Hyundai/Kia Mobis timing chain kit with hydraulic tensioner and guides for Kia K5, Optima, and Sportage.',
    compatibility: ['Kia', 'K5', 'Sportage', 'Sorento'],
    image: VERIFIED_PART_PHOTOS.engine,
    rating: 4.9,
    featured: true,
    weight: 2.1,
    length: 28,
    width: 22,
    height: 10
  },
  {
    id: 'brand-kia-brake-pads',
    brandName: 'Kia',
    oemPartNumber: '58101-S9A00',
    name: 'Kia Telluride / Sorento Ceramic Front Brake Pads Set (58101-S9A00)',
    price: 340,
    category: 'Brakes & Suspension',
    description: 'Genuine Mobis low-dust ceramic brake pad set for Kia Telluride and Sorento.',
    compatibility: ['Kia', 'Telluride', 'Sorento'],
    image: VERIFIED_PART_PHOTOS.brakes,
    rating: 4.8,
    featured: false,
    weight: 1.9,
    length: 20,
    width: 14,
    height: 8
  },
  {
    id: 'brand-bmw-brembo-kit',
    brandName: 'BMW',
    oemPartNumber: '34-11-6-880-685',
    name: 'BMW M3 / 5 Series (G30) M-Performance Brembo Brake Caliper & Pad Kit',
    price: 3850,
    category: 'Brakes & Suspension',
    description: 'Genuine BMW M-Performance 4-piston front brake caliper and pad kit for BMW 3 Series, 5 Series, and M models.',
    compatibility: ['BMW', '3 Series', '5 Series', 'M3', 'X5'],
    image: VERIFIED_PART_PHOTOS.brakes,
    rating: 5.0,
    featured: true,
    weight: 9.5,
    length: 42,
    width: 32,
    height: 18
  },
  {
    id: 'brand-bmw-b58-chargepipe',
    brandName: 'BMW',
    oemPartNumber: '11-65-7-649-275',
    name: 'BMW B58 TwinPower Turbo Charge Pipe & Intercooler Assembly',
    price: 2150,
    category: 'Engine Parts',
    description: 'High-flow aluminum charge pipe and intercooler upgrade for BMW B58 3.0L turbocharged engines.',
    compatibility: ['BMW', 'M340i', '540i', 'X5'],
    image: VERIFIED_PART_PHOTOS.enginePerformance,
    rating: 4.9,
    featured: true,
    weight: 5.8,
    length: 55,
    width: 28,
    height: 22
  },
  {
    id: 'brand-audi-matrix-led',
    brandName: 'Audi',
    oemPartNumber: '4K0-941-035',
    name: 'Audi A6 / Q7 Matrix LED Headlamp Assembly Left (4K0-941-035)',
    price: 4200,
    category: 'Exterior & Body',
    description: 'Genuine Audi OEM HD Matrix LED headlight assembly with dynamic turn signal for Audi A6 and Q7.',
    compatibility: ['Audi', 'A6', 'Q7', 'Q8', 'A8'],
    image: VERIFIED_PART_PHOTOS.exterior,
    rating: 5.0,
    featured: true,
    weight: 5.2,
    length: 62,
    width: 34,
    height: 28
  },
  {
    id: 'brand-audi-rs-exhaust',
    brandName: 'Audi',
    oemPartNumber: '8W0-253-181',
    name: 'Audi RS / S-Line Sport Exhaust Downpipe & Resonator Kit (TFSI)',
    price: 3600,
    category: 'Exhaust Systems',
    description: 'Stainless steel performance exhaust system for Audi A4, A6, S5, and RS models.',
    compatibility: ['Audi', 'A4', 'A6', 'S5', 'RS5'],
    image: VERIFIED_PART_PHOTOS.exhaust,
    rating: 4.9,
    featured: false,
    weight: 8.4,
    length: 80,
    width: 30,
    height: 24
  },
  {
    id: 'brand-nissan-patrol-radiator',
    brandName: 'Nissan',
    oemPartNumber: '21460-1LA0A',
    name: 'Nissan Patrol Y62 V8 OEM Radiator & Cooling Fan Assembly (21460-1LA0A)',
    price: 1650,
    category: 'Engine Parts',
    description: 'Heavy-duty genuine Nissan radiator engineered for desert climate cooling on Patrol Y62.',
    compatibility: ['Nissan', 'Patrol', 'Altima', 'Maxima'],
    image: VERIFIED_PART_PHOTOS.engine,
    rating: 4.9,
    featured: true,
    weight: 7.8,
    length: 75,
    width: 55,
    height: 16
  },
  {
    id: 'brand-honda-vtec-injector',
    brandName: 'Honda',
    oemPartNumber: '16010-6A0-A01',
    name: 'Honda Accord 1.5T / 2.0T Genuine VTEC Fuel Injector Set (16010-6A0-A01)',
    price: 1120,
    category: 'Engine Parts',
    description: 'Original Honda direct injection fuel injector set of 4 for Accord and CR-V.',
    compatibility: ['Honda', 'Accord', 'CR-V', 'Civic'],
    image: VERIFIED_PART_PHOTOS.enginePerformance,
    rating: 4.8,
    featured: false,
    weight: 0.95,
    length: 22,
    width: 16,
    height: 8
  },
  {
    id: 'brand-hyundai-ac-compressor',
    brandName: 'Hyundai',
    oemPartNumber: '97701-L1000',
    name: 'Hyundai Sonata / Elantra Genuine AC Compressor Unit (97701-L1000)',
    price: 1480,
    category: 'Engine Parts',
    description: 'Genuine Hanon/Mobis high-output air conditioning compressor for Hyundai Sonata and Tucson.',
    compatibility: ['Hyundai', 'Sonata', 'Elantra', 'Tucson'],
    image: VERIFIED_PART_PHOTOS.engine,
    rating: 4.9,
    featured: true,
    weight: 6.2,
    length: 30,
    width: 25,
    height: 24
  },
  {
    id: 'brand-ford-motorcraft-alt',
    brandName: 'Ford',
    oemPartNumber: 'GL-8728-RM',
    name: 'Ford F-150 / Taurus Motorcraft Heavy-Duty Alternator (GL-8728-RM)',
    price: 1290,
    category: 'Engine Parts',
    description: 'Original Ford Motorcraft 220A alternator for F-150, Expedition, and Taurus.',
    compatibility: ['Ford', 'F-150', 'Expedition', 'Taurus', 'Mustang'],
    image: VERIFIED_PART_PHOTOS.enginePerformance,
    rating: 4.8,
    featured: false,
    weight: 6.8,
    length: 26,
    width: 22,
    height: 22
  },
  {
    id: 'brand-chevrolet-magneride',
    brandName: 'Chevrolet',
    oemPartNumber: '84977478',
    name: 'Chevrolet Tahoe / Silverado ACDelco Magnetic Ride Shock Absorber (84977478)',
    price: 1890,
    category: 'Brakes & Suspension',
    description: 'Genuine GM ACDelco MagneRide front suspension strut for Chevrolet Tahoe and Suburban.',
    compatibility: ['Chevrolet', 'Tahoe', 'Suburban', 'Silverado'],
    image: VERIFIED_PART_PHOTOS.suspension,
    rating: 4.9,
    featured: true,
    weight: 8.1,
    length: 68,
    width: 20,
    height: 20
  },
  {
    id: 'brand-mazda-skyactiv-coil',
    brandName: 'Mazda',
    oemPartNumber: 'PE20-18-100A',
    name: 'Mazda CX-9 / Mazda6 SkyActiv-G Ignition Coil & Spark Plug Kit (PE20-18-100A)',
    price: 690,
    category: 'Engine Parts',
    description: 'Genuine Mazda OEM SkyActiv ignition coil pack and iridium spark plug service kit.',
    compatibility: ['Mazda', 'CX-9', 'Mazda6', 'CX-5'],
    image: VERIFIED_PART_PHOTOS.enginePerformance,
    rating: 4.8,
    featured: false,
    weight: 1.4,
    length: 24,
    width: 18,
    height: 8
  },
  {
    id: 'brand-mercedes-airmatic-strut',
    brandName: 'Mercedes',
    oemPartNumber: 'A222-320-47-13',
    name: 'Mercedes-Benz S-Class / E-Class (W223/W213) Airmatic Air Suspension Strut',
    price: 4650,
    category: 'Brakes & Suspension',
    description: 'Original Mercedes-Benz Bilstein Airmatic front air suspension damper assembly.',
    compatibility: ['Mercedes', 'S-Class', 'E-Class', 'GLE', 'G-Class'],
    image: VERIFIED_PART_PHOTOS.suspension,
    rating: 5.0,
    featured: true,
    weight: 9.2,
    length: 72,
    width: 22,
    height: 22
  }
];

export function getFallbackPartSvg(category?: string, name?: string): string {
  const text = `${category || ''} ${name || ''}`.toLowerCase();
  if (text.includes('strut') || text.includes('shock') || text.includes('airmatic') || text.includes('magneride')) {
    return '/parts/suspension.svg';
  }
  if (text.includes('brake') || text.includes('rotor') || text.includes('caliper') || text.includes('pad') || text.includes('suspension')) {
    return '/parts/brakes.svg';
  }
  if (text.includes('exhaust') || text.includes('muffler') || text.includes('downpipe') || text.includes('cat-back')) {
    return '/parts/exhaust.svg';
  }
  if (text.includes('headlight') || text.includes('headlamp') || text.includes('bumper') || text.includes('grille') || text.includes('exterior') || text.includes('mirror')) {
    return '/parts/exterior.svg';
  }
  if (text.includes('interior') || text.includes('steering') || text.includes('seat') || text.includes('trim') || text.includes('cabin')) {
    return '/parts/interior.svg';
  }
  return '/parts/engine.svg';
}

export function resolvePartImage(image?: string | null, category?: string, name?: string): string {
  const raw = (image || '').trim();
  const isBrokenUnsplash = BROKEN_UNSPLASH_IDS.some((id) => raw.includes(id));
  const isValidUrlOrPath = raw.startsWith('http://') || raw.startsWith('https://') || raw.startsWith('/');

  if (isValidUrlOrPath && !isBrokenUnsplash) {
    return raw;
  }

  const text = `${category || ''} ${name || ''}`.toLowerCase();

  if (text.includes('strut') || text.includes('shock') || text.includes('airmatic') || text.includes('magneride')) {
    return VERIFIED_PART_PHOTOS.suspension;
  }
  if (text.includes('brake') || text.includes('rotor') || text.includes('caliper') || text.includes('pad') || text.includes('suspension')) {
    return VERIFIED_PART_PHOTOS.brakes;
  }
  if (text.includes('exhaust') || text.includes('muffler') || text.includes('downpipe') || text.includes('cat-back')) {
    return VERIFIED_PART_PHOTOS.exhaust;
  }
  if (text.includes('headlight') || text.includes('headlamp') || text.includes('bumper') || text.includes('grille') || text.includes('exterior') || text.includes('led')) {
    return VERIFIED_PART_PHOTOS.exterior;
  }
  if (text.includes('interior') || text.includes('steering') || text.includes('seat') || text.includes('nappa') || text.includes('trim')) {
    return VERIFIED_PART_PHOTOS.interior;
  }
  if (text.includes('turbo') || text.includes('injector') || text.includes('alternator') || text.includes('spark') || text.includes('coil') || text.includes('block')) {
    return VERIFIED_PART_PHOTOS.enginePerformance;
  }

  return VERIFIED_PART_PHOTOS.engine;
}

export function isRenderableImageUrl(image?: string | null): boolean {
  if (!image) return false;
  const trimmed = image.trim();
  return trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/');
}

export function extractOemNumber(name?: string, tecdocArticleId?: string | null): string {
  if (tecdocArticleId && tecdocArticleId.trim()) return tecdocArticleId.trim();
  if (name) {
    const match = name.match(/\(([A-Z0-9-]{5,})\)/i);
    if (match?.[1]) return match[1].toUpperCase();
  }
  return 'OEM-VERIFIED';
}
