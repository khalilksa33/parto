// src/lib/tecdoc_service.ts

const TECDOC_API_URL = 'https://webservice.tecalliance.services/pegasus-3-0/services/rest';
const TECDOC_PROVIDER_ID = process.env.TECDOC_PROVIDER_ID || '20011'; // Generic/Test provider ID, must be replaced
const TECDOC_API_KEY = process.env.TECDOC_API_KEY || ''; // Generic API doesn't always need key for basic search, but required for prod

interface TecDocRequest {
  [key: string]: any;
}

export async function callTecDoc(endpoint: string, params: TecDocRequest = {}) {
  const requestBody = {
    ...params,
    provider: TECDOC_PROVIDER_ID,
    lang: 'en',
    country: 'SA', // Saudi Arabia
  };

  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (TECDOC_API_KEY) {
    headers['X-API-Key'] = TECDOC_API_KEY;
  }

  const response = await fetch(`${TECDOC_API_URL}/${endpoint}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    throw new Error(`TecDoc API Error: ${response.statusText}`);
  }

  return response.json();
}

/**
 * Attempts to resolve a VIN to a TecDoc carId.
 * Note: TecDoc's getVehiclesByVIN often requires specific commercial licenses.
 * Alternatively, we might need to map Make/Model string to carId manually.
 */
export async function getCarIdByVin(vin: string): Promise<string | null> {
  try {
    const data = await callTecDoc('getVehiclesByVIN', {
      vin: vin,
    });
    
    if (data.data && data.data.array && data.data.array.length > 0) {
      // Return the first matched vehicle ID (carId)
      return data.data.array[0].carId.toString();
    }
    return null;
  } catch (error) {
    console.error('Failed to get CarID from TecDoc:', error);
    return null;
  }
}

/**
 * Fetches parts (articles) for a given carId
 */
export async function getPartsForCarId(carId: string, page = 1, perPage = 50) {
  try {
    // getArticles provides article details. We use a generic node or fetch all.
    const data = await callTecDoc('getArticles', {
      linkageTargetId: carId,
      linkageTargetType: 'P', // Passenger car
      perPage,
      page,
      includeAll: true,
      includeImages: true
    });
    
    if (data.articles) {
      return data.articles;
    }
    return [];
  } catch (error) {
    console.error('Failed to fetch parts from TecDoc:', error);
    return [];
  }
}
