import { NextResponse } from 'next/server';
import { db } from '../../../../../lib/db';
import { vin_cache } from '../../../../../lib/schema';
import { eq } from 'drizzle-orm';
import { getCarIdByVin } from '../../../../../lib/tecdoc_service';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const vin = searchParams.get('vin');

  if (!vin || vin.length < 5) {
    return NextResponse.json({ error: 'Valid VIN is required' }, { status: 400 });
  }

  const normalizedVin = vin.toUpperCase();

  try {
    // 1. Check cache first
    const cached = await db.select().from(vin_cache).where(eq(vin_cache.vin, normalizedVin)).limit(1);
    
    if (cached && cached.length > 0) {
      // If we didn't fetch tecdocCarId previously, we can backfill it here, but for now just return cache.
      return NextResponse.json({
        source: 'cache',
        data: cached[0]
      });
    }

    // 2. Fetch from NHTSA API (DecodeVinExtended for Engine details)
    const nhtsaUrl = `https://vpic.nhtsa.dot.gov/api/vehicles/DecodeVinExtended/${normalizedVin}?format=json`;
    const response = await fetch(nhtsaUrl);
    
    if (!response.ok) {
      throw new Error(`NHTSA API error: ${response.status}`);
    }

    const data = await response.json();
    
    if (!data.Results) {
      throw new Error('Invalid response from NHTSA API');
    }

    // Extract basic details
    const getVal = (variableName: string) => data.Results.find((r: any) => r.Variable === variableName)?.Value;
    
    const make = getVal('Make');
    const model = getVal('Model');
    const year = getVal('Model Year');

    // Extract Engine details
    const engineDetails = {
      cylinders: getVal('Engine Number of Cylinders'),
      horsepower: getVal('Engine Brake (hp) From'),
      engineModel: getVal('Engine Model'),
      displacement: getVal('Displacement (L)'),
      fuelType: getVal('Fuel Type - Primary'),
    };

    // Attempt to resolve TecDoc Car ID in the background
    const tecdocCarId = await getCarIdByVin(normalizedVin);

    const recordToInsert = {
      vin: normalizedVin,
      make: make && make !== 'null' ? make : null,
      model: model && model !== 'null' ? model : null,
      year: year && year !== 'null' ? year : null,
      engineDetails,
      rawData: data.Results,
      tecdocCarId: tecdocCarId
    };

    // 3. Save to cache
    await db.insert(vin_cache).values(recordToInsert).onConflictDoNothing();

    return NextResponse.json({
      source: 'api',
      data: recordToInsert
    });
  } catch (error: any) {
    console.error('VIN Decode Error:', error);
    return NextResponse.json({ error: 'Failed to decode VIN' }, { status: 500 });
  }
}
