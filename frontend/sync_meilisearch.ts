import { db } from './src/lib/db';
import { products } from './src/lib/schema';
import { MeiliSearch } from 'meilisearch';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

// In Kubernetes, MEILISEARCH_HOST will likely be http://meilisearch-service:7700
// But for local running we default to localhost:7700 if port-forwarding
const MEILI_HOST = process.env.MEILISEARCH_HOST || 'http://127.0.0.1:7700';
const MEILI_KEY = process.env.MEILI_MASTER_KEY || 'parto-secret-master-key-change-in-prod';

const client = new MeiliSearch({
  host: MEILI_HOST,
  apiKey: MEILI_KEY,
});

async function syncProducts() {
  console.log('Fetching products from Postgres...');
  const allProducts = await db.select().from(products);
  
  if (allProducts.length === 0) {
    console.log('No products found in the database. Exiting.');
    process.exit(0);
  }

  console.log(Found  products. Indexing into Meilisearch...);

  // We add 'products' index
  const index = client.index('products');

  // We can add documents directly
  // Convert Decimals to string/number if necessary (Meilisearch handles JSON nicely)
  const response = await index.addDocuments(allProducts, { primaryKey: 'id' });
  
  console.log('Indexing started. Task details:', response);

  // Set filterable attributes (e.g. if we want to filter by category or price later)
  await index.updateFilterableAttributes(['category', 'tenantId']);
  
  // Set searchable attributes (fields we search in)
  await index.updateSearchableAttributes(['name', 'description', 'category']);

  console.log('Sync script finished successfully.');
  process.exit(0);
}

syncProducts().catch(err => {
  console.error('Error syncing products:', err);
  process.exit(1);
});
