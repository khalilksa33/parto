const API_BASE = 'https://parto.26i.uk/api';

const sellers = [
  { name: 'Luxury Parts Co', subdomain: 'luxury', businessType: 'new_auto_spare_parts', email: 'luxury@example.com', ownerName: 'Ahmed Al-Saud', phone: '0555555551' },
  { name: 'Performance Motors', subdomain: 'performance', businessType: 'new_auto_spare_parts', email: 'performance@example.com', ownerName: 'Faisal', phone: '0555555552' },
  { name: 'Riyadh OEM Parts', subdomain: 'riyadhoem', businessType: 'new_auto_spare_parts', email: 'riyadhoem@example.com', ownerName: 'Mohammed', phone: '0555555553' }
];

const products = [
  { name: 'V8 Engine Block (Brand New)', price: 12500, category: 'Engine', image: '🏎️', featured: true },
  { name: 'Ceramic Brake Kit', price: 4500, category: 'Brakes', image: '🛑', featured: true },
  { name: 'Full Titanium Exhaust', price: 8200, category: 'Exhaust', image: '💨', featured: true }
];

async function seed() {
  console.log('Seeding Sellers...');
  for (let s of sellers) {
    try {
      const res = await fetch(API_BASE + '/tenants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(s)
      });
      const data = await res.json();
      console.log('Created Tenant:', data.name, data.id);

      for (let p of products) {
        p.tenantId = data.id;
        const pRes = await fetch(API_BASE + '/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-Tenant-ID': data.id },
          body: JSON.stringify(p)
        });
        const pData = await pRes.json();
        if (pData.product) {
          console.log('  Created Product:', pData.product.name);
        } else {
          console.log('  Failed Product:', pData);
        }
      }
    } catch (e) {
      console.error('Error seeding', s.name, e);
    }
  }
}

seed();
