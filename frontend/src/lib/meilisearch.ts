import { MeiliSearch } from 'meilisearch';

const MEILI_HOST = process.env.NEXT_PUBLIC_MEILI_HOST || 'http://127.0.0.1:7700';
const MEILI_SEARCH_KEY = process.env.NEXT_PUBLIC_MEILI_SEARCH_KEY || 'parto-secret-master-key-change-in-prod';

export const meiliClient = new MeiliSearch({
  host: MEILI_HOST,
  apiKey: MEILI_SEARCH_KEY,
});

export const productsIndex = meiliClient.index('products');
