import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { products } from './src/lib/schema';
import { productsIndex } from './src/lib/meilisearch';

async function sync() {
  console.log('Connecting to Postgres database...');
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });
  const db = drizzle(pool);

  console.log('Fetching products from Postgres...');
  const allProducts = await db.select().from(products);
  
  console.log(`Found ${allProducts.length} products. Pushing to Meilisearch...`);

  // Meilisearch requires an array of documents to index.
  const meiliDocs = allProducts.map(p => ({
    id: p.id,
    name: p.name,
    category: p.category,
    price: p.price,
    tenant_id: p.tenantId,
    // Add additional fields as needed for filtering or displaying
  }));

  try {
    const task = await productsIndex.addDocuments(meiliDocs);
    console.log('Documents queued for indexing in Meilisearch!');
    console.log(`Task info:`, task);
  } catch (err) {
    console.error('Failed to sync to Meilisearch:', err);
  }

  await pool.end();
}

sync().then(() => console.log('Sync complete!')).catch(console.error);
