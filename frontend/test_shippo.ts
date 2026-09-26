import { Shippo } from 'shippo';

const shippo = new Shippo({
  apiKeyHeader: 'shippo_test_dummy_key',
});

async function runTest() {
  try {
    const shipment = await shippo.shipments.create({
      addressFrom: {
        name: 'Parto Warehouse',
        street1: '123 Parts Ave',
        city: 'Riyadh',
        state: 'RIY',
        zip: '12211',
        country: 'SA',
      },
      addressTo: {
        name: 'John Doe',
        street1: '456 Buyer Lane',
        city: 'Dubai',
        state: 'DU',
        zip: '00000',
        country: 'AE',
      },
      parcels: [{
        length: '20',
        width: '20',
        height: '20',
        distanceUnit: 'cm',
        weight: '5',
        massUnit: 'kg',
      }],
      async: false,
    });
    
    console.log('Shipment created with rates:', shipment.rates.length);
    if (shipment.rates.length > 0) {
      console.log('Example rate:', shipment.rates[0].provider, shipment.rates[0].amount, shipment.rates[0].currency);
    }
  } catch (err: any) {
    console.log('Error (Expected if dummy key is used):', err.message);
  }
}

runTest();
