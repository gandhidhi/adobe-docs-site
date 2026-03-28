import { createClient } from 'microcms-js-sdk';

if (!process.env.MICROCMS_SERVICE_DOMAIN) {
  throw new Error('MICROCMS_SERVICE_DOMAIN is required');
}

if (!process.env.API_KEY) {
  throw new Error('API_KEY is required');
}

export const client = createClient({
  serviceDomain: process.env.MICROCMS_SERVICE_DOMAIN,
  apiKey: process.env.API_KEY,
});

export type Category = {
  id: string;
  name: string;
  slug: string;
  order?: number;
};

export type Doc = {
  id: string;
  title: string;
  slug: string;
  content: string;
  description?: string;
  category?: Category;
  order?: number;
};

export async function getCategories() {
  const data = await client.getList<Category>({
    endpoint: 'categories',
    queries: { orders: 'order' },
  });
  return data.contents;
}

export async function getDocs() {
  const data = await client.getList<Doc>({
    endpoint: 'docs',
    queries: { orders: 'order', limit: 100 },
  });
  return data.contents;
}
