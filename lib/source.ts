import { loader } from 'fumadocs-core/source';
import { createClient } from 'microcms-js-sdk';
import { client, Doc, Category } from './microcms';

// microCMS からデータを取得
const docs = await client.getList<Doc>({ endpoint: 'docs', queries: { limit: 100 } });
const categories = await client.getList<Category>({ endpoint: 'categories' });

const virtualFiles: any[] = [];

// カテゴリをメタデータ（フォルダ名）として登録
categories.contents.forEach((cat) => {
  virtualFiles.push({
    type: 'meta',
    path: `${cat.slug}/meta.json`,
    data: {
      title: cat.name,
    },
  });
});

// 記事をページとして登録
docs.contents.forEach((doc) => {
  const path = doc.category 
    ? `${doc.category.slug}/${doc.slug}.mdx` 
    : `${doc.slug}.mdx`;
  
  virtualFiles.push({
    type: 'page',
    path,
    data: {
      title: doc.title,
      description: doc.description,
      body: doc.content,
    },
  });
});

export const source = loader({
  baseUrl: '/docs',
  source: {
    files: virtualFiles,
  },
});
