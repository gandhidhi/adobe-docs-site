import { source } from '@/lib/source';
import { DocsPage, DocsBody, DocsTitle, DocsDescription } from 'fumadocs-ui/page';
import { notFound, redirect } from 'next/navigation';
import { getTableOfContents } from 'fumadocs-core/content/toc';
import { compileMDX } from 'next-mdx-remote/rsc';
import remarkGfm from 'remark-gfm';
import * as cheerio from 'cheerio';
import { Tab, Tabs } from 'fumadocs-ui/components/tabs';
import { Callout } from 'fumadocs-ui/components/callout';

// microCMS からの相互変換を安定させるためのクリーンアップ
function parseContentToMDX(html: string): string {
  if (!html) return '';

  const $ = cheerio.load(html);

  // script タグを除去
  $('script').remove();

  // <a> タグを Markdown リンクに変換（入れ子 <a> 問題の根本対処）
  $('a').each((_, el) => {
    const href = $(el).attr('href') || '';
    const text = $(el).text() || href;
    $(el).replaceWith(`[${text}](${href})`);
  });

  let markdownLines: string[] = [];

  $('body').children().each((_, el) => {
    let content = $(el).html() || '';

    // 実体参照の復元
    content = content
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');

    content = content.replace(/<strong>(.*?)<\/strong>/g, '**$1**');
    content = content.replace(/<code>(.*?)<\/code>/g, '`$1`');

    const trimmed = content.trim();
    if (!trimmed) return;

    // 前の行がテーブルで、現在の行もテーブル（|）の場合、空行を挟まず結合
    const isTableLine = trimmed.startsWith('|');
    const isListItem = /^\d+\.\s/.test(trimmed) || /^[\-\*\+]\s/.test(trimmed);
    const lastLine = markdownLines[markdownLines.length - 1];
    const isLastTableLine = lastLine?.trim().startsWith('|');
    const isLastListItem = lastLine && (/^\d+\.\s/.test(lastLine.trim()) || /^[\-\*\+]\s/.test(lastLine.trim()));

    if ((isTableLine && isLastTableLine) || (isListItem && isLastListItem)) {
      markdownLines.push(trimmed);
    } else if (trimmed.startsWith('<Tabs') || trimmed.startsWith('<Admonition') || trimmed.startsWith('<Callout') ||
               trimmed.startsWith('</Tabs') || trimmed.startsWith('</Admonition') || trimmed.startsWith('</Callout') ||
               trimmed.startsWith('<TabItem') || trimmed.startsWith('</TabItem')) {
      markdownLines.push('\n' + trimmed + '\n');
    } else {
      markdownLines.push('\n' + trimmed);
    }
  });

  let cleanMD = markdownLines.join('\n');

  // タイトル重複回避
  cleanMD = cleanMD.replace(/^#\s+.+\n?/, '');

  return cleanMD;
}

export default async function Page(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;

  // /docs へのアクセスは最初のページへリダイレクト
  if (!params.slug || params.slug.length === 0) {
    const pages = source.getPages();
    if (pages.length > 0) {
      redirect(pages[0].url);
    }
    notFound();
  }

  const page = source.getPage(params.slug);

  if (!page) notFound();

  const data = page.data as any;
  const rawContent = data.body as string;
  
  const mdxContent = parseContentToMDX(rawContent);
  const toc = getTableOfContents(mdxContent);

  const { content: renderedContent } = await compileMDX({
    source: mdxContent,
    components: {
      Tabs,
      Tab,
      TabItem: Tab,
      Callout,
      Admonition: Callout,
    },
    options: {
      mdxOptions: {
        remarkPlugins: [remarkGfm],
      },
    },
  });

  return (
    <DocsPage toc={toc} full={data.full}>
      <DocsTitle>{data.title}</DocsTitle>
      <DocsDescription>{data.description}</DocsDescription>
      <DocsBody>
        {renderedContent}
      </DocsBody>
    </DocsPage>
  );
}

export async function generateStaticParams() {
  return source.generateParams();
}

export async function generateMetadata(props: {
  params: Promise<{ slug?: string[] }>;
}) {
  const params = await props.params;
  const page = source.getPage(params.slug);

  if (!page) notFound();

  return {
    title: page.data.title,
    description: page.data.description,
  };
}
