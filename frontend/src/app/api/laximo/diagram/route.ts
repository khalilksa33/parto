import { NextResponse } from 'next/server';
import { getLaximoVehicleByVin, getLaximoCategories, getLaximoDiagram } from '@/lib/laximo_service';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const vin = url.searchParams.get('vin');
    const categoryId = url.searchParams.get('categoryId') || '1'; // Default to engine

    if (!vin) {
      return NextResponse.json({ error: 'VIN is required' }, { status: 400 });
    }

    // 1. Resolve VIN to Laximo Vehicle ID
    const vehicleInfo = await getLaximoVehicleByVin(vin);
    
    // 2. Fetch Categories (Groups)
    const categories = await getLaximoCategories(vehicleInfo.vehicleId, 'default');
    
    // 3. Fetch specific diagram for the active category
    const diagram = await getLaximoDiagram(vehicleInfo.vehicleId, categoryId);

    return NextResponse.json({
      vehicle: vehicleInfo,
      categories,
      activeDiagram: diagram
    });
  } catch (error: any) {
    console.error('Laximo API Error:', error);
    return NextResponse.json({ error: 'Failed to fetch OEM diagrams' }, { status: 500 });
  }
}
