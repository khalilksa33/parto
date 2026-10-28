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
  tenantId?: string;
}

export const FALLBACK_BRAND_PARTS: FallbackPartItem[] = [
  // Riyadh OEM Parts Co. (t-riyadh-oem)
  {
    id: 'p-toyota-pads',
    tenantId: 't-riyadh-oem',
    brandName: 'Toyota',
    oemPartNumber: '04465-33471',
    name: 'Toyota Camry Genuine Ceramic Brake Pads Kit (04465-33471)',
    price: 385,
    category: 'Brakes & Suspension',
    description: 'Genuine Toyota front ceramic brake pad set with anti-squeal shims for Camry and Avalon (2018–2025).',
    compatibility: ['Toyota', 'Camry', 'Avalon', 'Lexus ES350'],
    image: VERIFIED_PART_PHOTOS.brakes,
    rating: 4.95,
    featured: true,
    weight: 2.2,
    length: 20,
    width: 15,
    height: 8
  },
  {
    id: 'p-lexus-rotor',
    tenantId: 't-riyadh-oem',
    brandName: 'Lexus',
    oemPartNumber: '43512-33140',
    name: 'Lexus ES350 / RX350 Genuine Front Brake Rotor Disc (43512-33140)',
    price: 640,
    category: 'Brakes & Suspension',
    description: 'Ventilated high-thermal dissipation genuine rotor engineered for smooth stopping on ES and RX series.',
    compatibility: ['Lexus', 'ES350', 'RX350', 'LX570'],
    image: VERIFIED_PART_PHOTOS.brakes,
    rating: 4.90,
    featured: true,
    weight: 7.4,
    length: 34,
    width: 34,
    height: 8
  },
  {
    id: 'p-kia-timing-chain',
    tenantId: 't-riyadh-oem',
    brandName: 'Kia',
    oemPartNumber: '24321-2G111',
    name: 'Kia K5 / Sportage Mobis Genuine Timing Chain & Tensioner Kit',
    price: 780,
    category: 'Engine Parts',
    description: 'OEM Hyundai/Kia Mobis full timing chain kit with hydraulic tensioner and guide rails.',
    compatibility: ['Kia', 'K5', 'Sportage', 'Sorento', 'Hyundai Sonata'],
    image: VERIFIED_PART_PHOTOS.engine,
    rating: 4.88,
    featured: true,
    weight: 2.1,
    length: 28,
    width: 22,
    height: 10
  },
  {
    id: 'p-bmw-m-brakes',
    tenantId: 't-riyadh-oem',
    brandName: 'BMW',
    oemPartNumber: '34112450161',
    name: 'BMW M-Performance Brembo 4-Piston Caliper & Rotor Kit',
    price: 3850,
    category: 'Brakes & Suspension',
    description: 'Official BMW M Performance brake system upgrade kit with red calipers and slotted rotors.',
    compatibility: ['BMW', '3 Series', '5 Series', 'M3', 'M340i'],
    image: VERIFIED_PART_PHOTOS.brakes,
    rating: 5.0,
    featured: true,
    weight: 14.5,
    length: 45,
    width: 45,
    height: 25
  },
  {
    id: 'p-audi-matrix-led',
    tenantId: 't-riyadh-oem',
    brandName: 'Audi',
    oemPartNumber: '4K0-941-035',
    name: 'Audi A6 / Q7 Dynamic Matrix LED Headlamp Left (4K0-941-035)',
    price: 4200,
    category: 'Exterior & Body',
    description: 'Original OEM Audi Matrix LED headlight assembly with sequential turn signals.',
    compatibility: ['Audi', 'A6', 'A7', 'Q7', 'Q8'],
    image: VERIFIED_PART_PHOTOS.exterior,
    rating: 4.92,
    featured: true,
    weight: 4.5,
    length: 60,
    width: 35,
    height: 30
  },
  {
    id: 'p-hyundai-air-filter',
    tenantId: 't-riyadh-oem',
    brandName: 'Hyundai',
    oemPartNumber: '28113-F2000',
    name: 'Hyundai Elantra / Tucson Genuine High-Flow Air Filter Element',
    price: 75,
    category: 'Engine Parts',
    description: 'Mobis genuine engine air intake filter for optimal fuel efficiency and engine protection.',
    compatibility: ['Hyundai', 'Elantra', 'Tucson', 'Kia Sportage'],
    image: VERIFIED_PART_PHOTOS.engine,
    rating: 4.90,
    featured: false,
    weight: 0.45,
    length: 26,
    width: 18,
    height: 5
  },
  {
    id: 'p-toyota-lc-fuelpump',
    tenantId: 't-riyadh-oem',
    brandName: 'Toyota',
    oemPartNumber: '23100-24010',
    name: 'Toyota Land Cruiser 300 / Prado High-Pressure Fuel Pump (23100-24010)',
    price: 1450,
    category: 'Engine Parts',
    description: 'Genuine Denso/Toyota Japan high-pressure direct fuel pump assembly for Land Cruiser V6 twin turbo.',
    compatibility: ['Toyota', 'Land Cruiser', 'Prado', 'Lexus LX600'],
    image: VERIFIED_PART_PHOTOS.enginePerformance,
    rating: 4.96,
    featured: true,
    weight: 2.8,
    length: 22,
    width: 18,
    height: 15
  },
  {
    id: 'p-toyota-waterpump',
    tenantId: 't-riyadh-oem',
    brandName: 'Toyota',
    oemPartNumber: '16100-29206',
    name: 'Toyota Corolla / Yaris Genuine Engine Water Pump Assembly (16100-29206)',
    price: 295,
    category: 'Engine Parts',
    description: 'Original Toyota Aisin cooling system water pump with gasket seal for 1.5L and 2.0L engines.',
    compatibility: ['Toyota', 'Corolla', 'Yaris', 'Raize'],
    image: VERIFIED_PART_PHOTOS.engine,
    rating: 4.91,
    featured: false,
    weight: 1.4,
    length: 18,
    width: 16,
    height: 14
  },
  {
    id: 'p-denso-sparkplugs',
    tenantId: 't-riyadh-oem',
    brandName: 'Toyota',
    oemPartNumber: '90919-01210',
    name: 'Denso Toyota Genuine Iridium TT Spark Plugs Set of 4 (SK20R11)',
    price: 160,
    category: 'Electrical & Sensors',
    description: 'High-ignitability twin-tip iridium spark plugs for maximum acceleration and fuel economy.',
    compatibility: ['Toyota', 'Camry', 'Corolla', 'RAV4', 'Avalon'],
    image: VERIFIED_PART_PHOTOS.enginePerformance,
    rating: 4.94,
    featured: false,
    weight: 0.35,
    length: 12,
    width: 10,
    height: 4
  },
  {
    id: 'p-mercedes-air-strut',
    tenantId: 't-riyadh-oem',
    brandName: 'Mercedes',
    oemPartNumber: '0993200104',
    name: 'Mercedes-Benz E-Class W213 Air Suspension Compressor (0993200104)',
    price: 2850,
    category: 'Brakes & Suspension',
    description: 'Genuine AMK/Mercedes airmatic suspension pump compressor for smooth ride height control.',
    compatibility: ['Mercedes', 'E-Class', 'CLS', 'S-Class'],
    image: VERIFIED_PART_PHOTOS.suspension,
    rating: 4.98,
    featured: true,
    weight: 4.2,
    length: 30,
    width: 22,
    height: 20
  },

  // Wadi Uhud Nissan Genuine Parts (t-wadi-uhud)
  {
    id: 'p-nissan-oil-pump',
    tenantId: 't-wadi-uhud',
    brandName: 'Nissan',
    oemPartNumber: '15010-1LA0A',
    name: 'Nissan Patrol Y62 V8 Genuine Engine Oil Pump Assembly',
    price: 920,
    category: 'Engine Parts',
    description: 'Original Nissan Japan high-pressure oil pump for Patrol Safari and Y62 5.6L V8 engines.',
    compatibility: ['Nissan', 'Patrol', 'Armada', 'Titan'],
    image: VERIFIED_PART_PHOTOS.enginePerformance,
    rating: 4.98,
    featured: true,
    weight: 3.8,
    length: 28,
    width: 24,
    height: 16
  },
  {
    id: 'p-nissan-patrol-pads',
    tenantId: 't-wadi-uhud',
    brandName: 'Nissan',
    oemPartNumber: 'D1060-1LB0A',
    name: 'Nissan Patrol Y62 Front Ceramic Brake Pads Set OEM (D1060-1LB0A)',
    price: 420,
    category: 'Brakes & Suspension',
    description: 'Heavy-duty ceramic front brake pads for Nissan Patrol Y62 with anti-dust compound.',
    compatibility: ['Nissan', 'Patrol', 'Armada', 'Infiniti QX80'],
    image: VERIFIED_PART_PHOTOS.brakes,
    rating: 4.93,
    featured: true,
    weight: 2.6,
    length: 22,
    width: 16,
    height: 9
  },
  {
    id: 'p-nissan-altima-alt',
    tenantId: 't-wadi-uhud',
    brandName: 'Nissan',
    oemPartNumber: '23100-3TA1B',
    name: 'Nissan Altima / Maxima OEM Engine Alternator 130A (23100-3TA1B)',
    price: 1180,
    category: 'Electrical & Sensors',
    description: 'Genuine Valeo/Nissan 130-Amp high-efficiency alternator for stable electrical current.',
    compatibility: ['Nissan', 'Altima', 'Maxima', 'Murano'],
    image: VERIFIED_PART_PHOTOS.enginePerformance,
    rating: 4.89,
    featured: false,
    weight: 6.2,
    length: 26,
    width: 24,
    height: 22
  },
  {
    id: 'p-nissan-patrol-shocks',
    tenantId: 't-wadi-uhud',
    brandName: 'Nissan',
    oemPartNumber: '56210-1LA8A',
    name: 'Nissan Patrol Y62 Rear Hydraulic Shock Absorbers Pair (56210-1LA8A)',
    price: 750,
    category: 'Brakes & Suspension',
    description: 'Hitachi/Nissan genuine rear shock absorber struts engineered for rugged desert terrain.',
    compatibility: ['Nissan', 'Patrol', 'Safari', 'Infiniti QX80'],
    image: VERIFIED_PART_PHOTOS.suspension,
    rating: 4.92,
    featured: true,
    weight: 5.8,
    length: 52,
    width: 18,
    height: 18
  },
  {
    id: 'p-infiniti-starter',
    tenantId: 't-wadi-uhud',
    brandName: 'Nissan',
    oemPartNumber: '23300-1CA0B',
    name: 'Infiniti QX80 / QX60 Genuine Engine Starter Motor (23300-1CA0B)',
    price: 1290,
    category: 'Electrical & Sensors',
    description: 'Original Mitsuba/Nissan high-torque starter motor assembly for quick reliable ignition.',
    compatibility: ['Nissan', 'Patrol', 'Infiniti QX80', 'Infiniti QX60'],
    image: VERIFIED_PART_PHOTOS.enginePerformance,
    rating: 4.95,
    featured: false,
    weight: 4.1,
    length: 25,
    width: 18,
    height: 16
  },
  {
    id: 'p-nissan-spark-plugs',
    tenantId: 't-wadi-uhud',
    brandName: 'Nissan',
    oemPartNumber: '22401-1LA1C',
    name: 'Nissan Genuine Laser Platinum Spark Plugs 6-Pack (DILKAR758G)',
    price: 280,
    category: 'Electrical & Sensors',
    description: 'NGK/Nissan laser platinum spark plugs for V6 and V8 engines (Patrol, Maxima, Pathfinder).',
    compatibility: ['Nissan', 'Patrol', 'Maxima', 'Pathfinder'],
    image: VERIFIED_PART_PHOTOS.enginePerformance,
    rating: 4.90,
    featured: false,
    weight: 0.5,
    length: 14,
    width: 12,
    height: 4
  },

  // Babkeer Auto Mazda Agency (t-babkeer-mazda)
  {
    id: 'p-mazda-spark-plugs',
    tenantId: 't-babkeer-mazda',
    brandName: 'Mazda',
    oemPartNumber: 'PE5R-18-110',
    name: 'Mazda SkyActiv-G Laser Iridium Spark Plugs Set of 4 (PE5R-18-110)',
    price: 210,
    category: 'Electrical & Sensors',
    description: 'Genuine OEM Mazda SkyActiv high-performance spark plugs engineered for longevity.',
    compatibility: ['Mazda', 'Mazda 3', 'Mazda 6', 'CX-5', 'CX-9'],
    image: VERIFIED_PART_PHOTOS.enginePerformance,
    rating: 4.94,
    featured: true,
    weight: 0.35,
    length: 12,
    width: 10,
    height: 3
  },
  {
    id: 'p-mazda-cx9-rotors',
    tenantId: 't-babkeer-mazda',
    brandName: 'Mazda',
    oemPartNumber: 'K011-33-251A',
    name: 'Mazda CX-9 / CX-5 Front Ventilated Brake Discs Pair (K011-33-251A)',
    price: 680,
    category: 'Brakes & Suspension',
    description: 'Genuine high-carbon heat-treated front brake rotor pair for Mazda SUV line.',
    compatibility: ['Mazda', 'CX-9', 'CX-5', 'CX-30'],
    image: VERIFIED_PART_PHOTOS.brakes,
    rating: 4.92,
    featured: true,
    weight: 14.0,
    length: 32,
    width: 32,
    height: 12
  },
  {
    id: 'p-mazda-belt-tensioner',
    tenantId: 't-babkeer-mazda',
    brandName: 'Mazda',
    oemPartNumber: 'PY01-15-980',
    name: 'Mazda 6 / CX-5 Genuine SkyActiv Drive Belt Tensioner (PY01-15-980)',
    price: 340,
    category: 'Engine Parts',
    description: 'OEM hydraulic serpentine drive belt tensioner assembly with pulley for smooth operation.',
    compatibility: ['Mazda', 'Mazda 6', 'CX-5', 'Mazda 3'],
    image: VERIFIED_PART_PHOTOS.engine,
    rating: 4.88,
    featured: false,
    weight: 1.2,
    length: 16,
    width: 14,
    height: 10
  },
  {
    id: 'p-mazda-cx9-taillight',
    tenantId: 't-babkeer-mazda',
    brandName: 'Mazda',
    oemPartNumber: 'TK78-51-160C',
    name: 'Mazda CX-9 Genuine LED Taillight Outer Assembly Left (TK78-51-160C)',
    price: 980,
    category: 'Exterior & Body',
    description: 'Original Koito/Mazda crystal LED tail lamp cluster with integrated turn signals.',
    compatibility: ['Mazda', 'CX-9'],
    image: VERIFIED_PART_PHOTOS.exterior,
    rating: 4.96,
    featured: false,
    weight: 2.5,
    length: 48,
    width: 28,
    height: 22
  },
  {
    id: 'p-mazda-trans-filter',
    tenantId: 't-babkeer-mazda',
    brandName: 'Mazda',
    oemPartNumber: 'FZ01-21-500',
    name: 'Mazda SkyActiv Automatic Transmission Fluid Filter Kit (FZ01-21-500)',
    price: 195,
    category: 'Transmission',
    description: 'Original Mazda 6-speed automatic transmission filter with pan gasket seal.',
    compatibility: ['Mazda', 'Mazda 3', 'Mazda 6', 'CX-5', 'CX-9'],
    image: VERIFIED_PART_PHOTOS.engine,
    rating: 4.87,
    featured: false,
    weight: 0.65,
    length: 20,
    width: 18,
    height: 6
  },

  // El-Shafie Auto Electrical & AC Components (t-el-shafie)
  {
    id: 'p-denso-lc-compressor',
    tenantId: 't-el-shafie',
    brandName: 'Toyota',
    oemPartNumber: '88320-60700',
    name: 'Denso OEM AC Compressor for Land Cruiser & Prado (88320-60700)',
    price: 1650,
    category: 'Engine Parts',
    description: 'Original Denso 10S20C heavy-duty automotive air conditioning compressor with clutch.',
    compatibility: ['Toyota', 'Land Cruiser', 'Prado', 'Lexus GX460'],
    image: VERIFIED_PART_PHOTOS.enginePerformance,
    rating: 4.97,
    featured: true,
    weight: 7.8,
    length: 28,
    width: 22,
    height: 20
  },
  {
    id: 'p-camry-cooling-fan',
    tenantId: 't-el-shafie',
    brandName: 'Toyota',
    oemPartNumber: '16363-25010',
    name: 'Genuine Toyota Camry / RAV4 Radiator Cooling Fan Assembly (16363-25010)',
    price: 520,
    category: 'Electrical & Sensors',
    description: 'Complete dual electric radiator fan assembly with brushless motor and shroud.',
    compatibility: ['Toyota', 'Camry', 'RAV4', 'Avalon'],
    image: VERIFIED_PART_PHOTOS.engine,
    rating: 4.90,
    featured: false,
    weight: 3.4,
    length: 50,
    width: 45,
    height: 15
  },
  {
    id: 'p-bosch-agm-battery',
    tenantId: 't-el-shafie',
    brandName: 'Ford',
    oemPartNumber: 'S5-A11',
    name: 'Bosch S5 High-Output 12V 80Ah AGM Automotive Battery (S5-A11)',
    price: 620,
    category: 'Electrical & Sensors',
    description: 'German-engineered AGM maintenance-free battery for modern start-stop vehicles.',
    compatibility: ['Ford', 'Chevrolet', 'BMW', 'Audi', 'Mercedes'],
    image: VERIFIED_PART_PHOTOS.enginePerformance,
    rating: 4.93,
    featured: true,
    weight: 21.0,
    length: 31,
    width: 17.5,
    height: 19
  },
  {
    id: 'p-prado-starter',
    tenantId: 't-el-shafie',
    brandName: 'Toyota',
    oemPartNumber: '28100-0C080',
    name: 'Toyota Prado / Fortuner Heavy-Duty Starter Motor (28100-0C080)',
    price: 890,
    category: 'Electrical & Sensors',
    description: 'Genuine Denso 2.0kW reduction starter motor for Toyota 2.7L and 4.0L engines.',
    compatibility: ['Toyota', 'Prado', 'Fortuner', 'Hilux'],
    image: VERIFIED_PART_PHOTOS.enginePerformance,
    rating: 4.91,
    featured: false,
    weight: 4.3,
    length: 24,
    width: 18,
    height: 15
  },

  // Hamzah Sadiq Japanese Suspension & Shocks (t-hamzah-sadiq)
  {
    id: 'p-kyb-lc200-struts',
    tenantId: 't-hamzah-sadiq',
    brandName: 'Toyota',
    oemPartNumber: '551130',
    name: 'KYB Gas-A-Just Heavy-Duty Front Shock Absorbers Pair (551130)',
    price: 850,
    category: 'Brakes & Suspension',
    description: 'Monotube high-pressure gas shocks for Land Cruiser 200 and Lexus LX570 stability.',
    compatibility: ['Toyota', 'Land Cruiser', 'Lexus LX570'],
    image: VERIFIED_PART_PHOTOS.suspension,
    rating: 4.95,
    featured: true,
    weight: 6.4,
    length: 55,
    width: 16,
    height: 16
  },
  {
    id: 'p-555-balljoints',
    tenantId: 't-hamzah-sadiq',
    brandName: 'Toyota',
    oemPartNumber: 'SB-3882',
    name: '555 Japan Lower Ball Joints Pair for Toyota Hilux & Fortuner (SB-3882)',
    price: 260,
    category: 'Brakes & Suspension',
    description: 'Precision forged alloy lower ball joints made in Japan for heavy-duty load capacity.',
    compatibility: ['Toyota', 'Hilux', 'Fortuner', 'Prado'],
    image: VERIFIED_PART_PHOTOS.suspension,
    rating: 4.90,
    featured: false,
    weight: 1.8,
    length: 18,
    width: 14,
    height: 8
  },
  {
    id: 'p-honda-accord-pads',
    tenantId: 't-hamzah-sadiq',
    brandName: 'Honda',
    oemPartNumber: '45022-T2G-A01',
    name: 'Honda Accord / Civic OEM Front Ceramic Brake Pads (45022-T2G-A01)',
    price: 340,
    category: 'Brakes & Suspension',
    description: 'Genuine Nissin/Honda ceramic brake pads with minimal dust and quiet braking.',
    compatibility: ['Honda', 'Accord', 'Civic', 'CR-V'],
    image: VERIFIED_PART_PHOTOS.brakes,
    rating: 4.92,
    featured: false,
    weight: 2.1,
    length: 20,
    width: 14,
    height: 8
  },
  {
    id: 'p-kyb-camry-shocks',
    tenantId: 't-hamzah-sadiq',
    brandName: 'Toyota',
    oemPartNumber: '341386',
    name: 'KYB Excel-G Rear Shock Absorbers Pair for Camry / Avalon (341386)',
    price: 490,
    category: 'Brakes & Suspension',
    description: 'Twin-tube gas struts engineered to restore original factory ride control and handling.',
    compatibility: ['Toyota', 'Camry', 'Avalon', 'Lexus ES350'],
    image: VERIFIED_PART_PHOTOS.suspension,
    rating: 4.91,
    featured: false,
    weight: 5.2,
    length: 50,
    width: 15,
    height: 15
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
