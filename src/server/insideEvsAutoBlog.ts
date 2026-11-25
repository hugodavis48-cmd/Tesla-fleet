import { GoogleGenAI, Type } from '@google/genai';
import fs from 'fs';
import path from 'path';

export type ServerBlogCategory =
  | 'EV Engineering & Diagnostics'
  | 'Wraps & Protection'
  | 'Fleet & Staking Yield'
  | 'TSLA Markets & Crypto'
  | 'Vehicle Deliveries';

export interface ServerBlogContentImage {
  url: string;
  caption?: string;
  alt?: string;
  placement?: 'top' | 'middle' | 'bottom';
}

export interface ServerInsideEvsCandidate {
  id: string;
  title: string;
  url: string;
  category: string;
  excerpt: string;
  imageUrl: string;
  galleryImages: string[];
  author: string;
  publishedAt: string;
  bodyText: string;
}

export interface ServerAutoBlogConfig {
  enabled: boolean;
  sourceUrl: string;
  intervalMinutes: number;
  autoRewriteWithAi: boolean;
  autoPublish: boolean;
  generateArticleImages?: boolean;
  imageGenerationMode?: 'gemini_editorial_svg' | 'gemini_imagen' | 'source_media';
  maxArticlesPerSync: number;
  defaultCategory: ServerBlogCategory;
  includeContentImages: boolean;
  includeSourceAttribution: boolean;
  attributionPrefix: string;
  targetTone:
    | 'Authoritative EV Engineering'
    | 'Executive Fleet & Market Brief'
    | 'Accessible Owner Digest';
  lastSyncAt: string | null;
  lastSyncStatus: string;
  totalSyncedCount: number;
}

export interface ServerAutoBlogRunLog {
  id: string;
  timestamp: string;
  status: 'success' | 'partial' | 'error';
  fetchedCount: number;
  importedCount: number;
  aiRewrittenCount: number;
  imagesGeneratedCount?: number;
  aiError?: string;
  message: string;
  importedTitles: string[];
}

export interface ServerBlogPostRecord {
  id: string;
  slug: string;
  title: string;
  subtitle: string;
  category: ServerBlogCategory;
  status: 'published' | 'draft' | 'scheduled';
  featured: boolean;
  excerpt: string;
  content: string;
  coverImageUrl: string;
  contentImages?: ServerBlogContentImage[];
  authorName: string;
  authorRole: string;
  publishedAt: string;
  updatedAt: string;
  readTimeMinutes: number;
  seoTitle: string;
  metaDescription: string;
  focusKeywords: string;
  canonicalUrl?: string;
  schemaType?: 'BlogPosting' | 'NewsArticle' | 'TechArticle';
  sourceName?: string;
  sourceUrl?: string;
  sourceAuthor?: string;
  sourcePublishedAt?: string;
  isAutoIngested?: boolean;
  isAiRewritten?: boolean;
  rewrittenAt?: string;
  imageGeneratedWithAi?: boolean;
  imageGenerationPrompt?: string;
  pipelineStage?: 'draft_review' | 'approved_published';
  seoScore?: number;
  tags?: string[];
  viewsCount: number;
  sharesCount: number;
  likesCount: number;
  bookmarksCount: number;
  commentsCount: number;
  customReadCents?: number;
  customShareCents?: number;
}

export const DEFAULT_SERVER_AUTO_BLOG_CONFIG: ServerAutoBlogConfig = {
  enabled: true,
  sourceUrl: 'https://insideevs.com/tesla/',
  intervalMinutes: 60,
  autoRewriteWithAi: true,
  autoPublish: false,
  generateArticleImages: true,
  imageGenerationMode: 'gemini_editorial_svg',
  maxArticlesPerSync: 6,
  defaultCategory: 'Vehicle Deliveries',
  includeContentImages: true,
  includeSourceAttribution: true,
  attributionPrefix: 'Originally reported by InsideEVs',
  targetTone: 'Authoritative EV Engineering',
  lastSyncAt: null,
  lastSyncStatus: 'Ready to fetch InsideEVs articles, Gemini SEO-rewrite, generate artwork & save drafts for review.',
  totalSyncedCount: 0,
};

const BROWSER_HEADERS = {
  'User-Agent':
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.9',
};

const articleCache = new Map<string, { data: ServerInsideEvsCandidate; fetchedAt: number }>();
let feedCache: { sourceUrl: string; items: ServerInsideEvsCandidate[]; fetchedAt: number } | null = null;

export function decodeHtmlEntities(input: string): string {
  if (!input) return '';
  const named: Record<string, string> = {
    amp: '&',
    lt: '<',
    gt: '>',
    quot: '"',
    apos: "'",
    '#39': "'",
    '#x27': "'",
    nbsp: ' ',
    rsquo: '’',
    lsquo: '‘',
    rdquo: '”',
    ldquo: '“',
    mdash: '—',
    ndash: '–',
    hellip: '…',
    deg: '°',
  };
  return input
    .replace(/<!\[CDATA\[(.*?)\]\]>/gs, '$1')
    .replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)))
    .replace(/&#(\d+);/g, (_, num) => String.fromCharCode(parseInt(num, 10)))
    .replace(/&([a-zA-Z0-9#]+);/g, (full, key) => named[key] ?? full)
    .replace(/\s+/g, ' ')
    .trim();
}

export function isAllowedInsideEvsUrl(rawUrl: string): boolean {
  try {
    const parsed = new URL(rawUrl);
    return (
      parsed.protocol === 'https:' &&
      (parsed.hostname === 'insideevs.com' || parsed.hostname === 'www.insideevs.com')
    );
  } catch {
    return false;
  }
}

export function normalizeUrlKey(rawUrl?: string): string {
  if (!rawUrl) return '';
  try {
    const parsed = new URL(rawUrl.trim());
    return `${parsed.hostname.replace(/^www\./, '').toLowerCase()}${parsed.pathname.replace(/\/+$/, '').toLowerCase()}`;
  } catch {
    return rawUrl.trim().replace(/\/+$/, '').toLowerCase();
  }
}

export function slugifyText(text: string): string {
  return (text || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .trim()
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .slice(0, 72);
}

function pickLocalFallbackImageByTopic(text: string): string {
  const lower = (text || '').toLowerCase();
  if (lower.includes('cybercab') || lower.includes('robotaxi') || lower.includes('autonomous') || lower.includes('fsd')) {
    return '/promo-robotaxi.jpg';
  }
  if (lower.includes('cybertruck') || lower.includes('cyberbeast')) {
    return '/promo-cyberbeast.jpg';
  }
  if (lower.includes('supercharger') || lower.includes('charging') || lower.includes('megapack') || lower.includes('battery')) {
    return '/img-supercharger-node.jpg';
  }
  if (lower.includes('plaid') || lower.includes('model s') || lower.includes('roadster')) {
    return '/promo-plaid.jpg';
  }
  if (lower.includes('model 3') || lower.includes('model y')) {
    return '/img-model3-pearl.jpg';
  }
  if (lower.includes('wrap') || lower.includes('paint') || lower.includes('ppf')) {
    return '/cert-wrap-cleanroom.jpg';
  }
  return '/cert-hv-safety.jpg';
}

function inferBlogCategory(text: string, fallback: ServerBlogCategory = 'Vehicle Deliveries'): ServerBlogCategory {
  const lower = (text || '').toLowerCase();
  if (lower.includes('stock') || lower.includes('tsla') || lower.includes('shareholder') || lower.includes('quarter') || lower.includes('earnings') || lower.includes('crypto')) {
    return 'TSLA Markets & Crypto';
  }
  if (lower.includes('robotaxi') || lower.includes('cybercab') || lower.includes('supercharger') || lower.includes('megapack') || lower.includes('energy') || lower.includes('fleet')) {
    return 'Fleet & Staking Yield';
  }
  if (lower.includes('wrap') || lower.includes('ppf') || lower.includes('paint') || lower.includes('wheel') || lower.includes('steering') || lower.includes('yoke') || lower.includes('interior')) {
    return 'Wraps & Protection';
  }
  if (lower.includes('battery') || lower.includes('4680') || lower.includes('recall') || lower.includes('fsd') || lower.includes('hardware') || lower.includes('motor') || lower.includes('software') || lower.includes('inspection') || lower.includes('diagnostic')) {
    return 'EV Engineering & Diagnostics';
  }
  if (lower.includes('delivery') || lower.includes('deliveries') || lower.includes('sales') || lower.includes('launch') || lower.includes('price') || lower.includes('cybertruck') || lower.includes('model y') || lower.includes('model 3') || lower.includes('roadster')) {
    return 'Vehicle Deliveries';
  }
  return fallback;
}

function extractMetaTag(html: string, nameOrProp: string): string {
  const escaped = nameOrProp.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const pattern1 = new RegExp(
    `<meta[^>]+(?:property|name)=["']${escaped}["'][^>]+content=["']([^"']*)["']`,
    'i'
  );
  const m1 = html.match(pattern1);
  if (m1?.[1]) return decodeHtmlEntities(m1[1]);

  const pattern2 = new RegExp(
    `<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${escaped}["']`,
    'i'
  );
  const m2 = html.match(pattern2);
  return m2?.[1] ? decodeHtmlEntities(m2[1]) : '';
}

function deduplicateMotor1Images(rawUrls: string[]): string[] {
  const seenKeys = new Map<string, { url: string; priority: number }>();
  for (const raw of rawUrls) {
    const clean = raw.trim().replace(/&amp;/g, '&');
    if (!clean.startsWith('https://')) continue;
    if (/favicon|logo|icon|avatar|placeholder|sprite|adsystem|badge|author/i.test(clean)) continue;
    const mglMatch = clean.match(/\/images\/mgl\/([^/]+)\/([^/]+)\/([^?#]+)/i);
    if (mglMatch) {
      const id = mglMatch[1];
      const variant = mglMatch[2];
      const file = mglMatch[3];
      const existing = seenKeys.get(id);
      const priority =
        variant === 's3' && file.endsWith('.jpg')
          ? 4
          : variant === 's1' && file.endsWith('.jpg')
          ? 3
          : /^s\d+$/i.test(variant)
          ? 2
          : 1;
      const canonicalVariant = variant === 's1' || variant === 's3' ? variant : 's3';
      const canonicalFile = file.replace(/\.webp$/i, '.jpg');
      const resolvedUrl =
        priority >= 2
          ? `https://cdn.motor1.com/images/mgl/${id}/${canonicalVariant}/${file}`
          : `https://cdn.motor1.com/images/mgl/${id}/s3/${canonicalFile}`;
      if (!existing || priority > existing.priority) {
        seenKeys.set(id, { url: resolvedUrl, priority });
      }
    } else if (/\.(jpe?g|png|webp)(\?.*)?$/i.test(clean)) {
      const noQuery = clean.split('?')[0];
      if (!seenKeys.has(noQuery)) {
        seenKeys.set(noQuery, { url: clean, priority: 2 });
      }
    }
  }
  return Array.from(seenKeys.values())
    .map((entry) => entry.url)
    .slice(0, 6);
}

export async function extractInsideEvsArticle(articleUrl: string, forceRefresh = false): Promise<ServerInsideEvsCandidate | null> {
  if (!isAllowedInsideEvsUrl(articleUrl)) {
    throw new Error('Only official insideevs.com HTTPS URLs are permitted.');
  }

  const key = normalizeUrlKey(articleUrl);
  const cached = articleCache.get(key);
  if (!forceRefresh && cached && Date.now() - cached.fetchedAt < 10 * 60 * 1000) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 9000);
  try {
    const res = await fetch(articleUrl, { headers: BROWSER_HEADERS, signal: controller.signal });
    if (!res.ok) return null;
    const html = await res.text();

    let ldHeadline = '';
    let ldDesc = '';
    let ldAuthor = '';
    let ldPublished = '';
    let ldImages: string[] = [];

    const ldMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>(.*?)<\/script>/gis)];
    for (const m of ldMatches) {
      try {
        const parsed = JSON.parse(m[1]);
        const nodes = Array.isArray(parsed) ? parsed : [parsed];
        for (const node of nodes) {
          if (node && (node['@type'] === 'NewsArticle' || node['@type'] === 'Article' || node['@type'] === 'Review')) {
            ldHeadline = decodeHtmlEntities(String(node.headline || node.name || ''));
            ldDesc = decodeHtmlEntities(String(node.description || ''));
            if (typeof node.author === 'string') ldAuthor = decodeHtmlEntities(node.author);
            else if (node.author?.name) ldAuthor = decodeHtmlEntities(String(node.author.name));
            else if (Array.isArray(node.author) && node.author[0]?.name) ldAuthor = decodeHtmlEntities(String(node.author[0].name));
            if (node.datePublished) ldPublished = String(node.datePublished);
            if (typeof node.image === 'string') ldImages.push(node.image);
            else if (Array.isArray(node.image)) {
              for (const im of node.image) {
                if (typeof im === 'string') ldImages.push(im);
                else if (im?.url) ldImages.push(String(im.url));
              }
            } else if (node.image?.url) {
              ldImages.push(String(node.image.url));
            }
          }
        }
      } catch {
        // Ignore malformed LD block
      }
    }

    const ogTitle = extractMetaTag(html, 'og:title').replace(/\s*\|\s*InsideEVs$/i, '');
    const ogDesc = extractMetaTag(html, 'og:description') || extractMetaTag(html, 'description');
    const ogImage = extractMetaTag(html, 'og:image');
    const pubMeta = extractMetaTag(html, 'article:published_time');

    const title = ldHeadline || ogTitle;
    if (!title || title.toLowerCase().includes('404 page not found')) {
      return null;
    }

    const cdnImgs = [
      ...html.matchAll(/https:\/\/cdn\.motor1\.com\/images\/mgl\/[a-zA-Z0-9_-]+\/[^"'\s)<>]+/g),
    ].map((m) => m[0]);
    const galleryImages = deduplicateMotor1Images([ogImage, ...ldImages, ...cdnImgs].filter(Boolean));

    // Extract clean article body paragraphs
    const rawParas = [...html.matchAll(/<p[^>]*>(.*?)<\/p>/gis)]
      .map((m) => decodeHtmlEntities(m[1].replace(/<[^>]+>/g, ' ')))
      .filter(
        (t) =>
          t.length >= 48 &&
          !/add insideevs|cookie|privacy policy|all rights reserved|sign up for|newsletter|more from insideevs|top stories/i.test(t)
      );

    const uniqueParas: string[] = [];
    const seenPara = new Set<string>();
    for (const p of rawParas) {
      const k = p.slice(0, 60).toLowerCase();
      if (!seenPara.has(k)) {
        seenPara.add(k);
        uniqueParas.push(p);
      }
      if (uniqueParas.length >= 14) break;
    }

    const rawDate = (ldPublished || pubMeta || new Date().toISOString()).slice(0, 10);
    const idMatch = articleUrl.match(/\/(?:news|reviews|features)\/(\d+)\//);
    const id = idMatch?.[1] ? `insideevs-${idMatch[1]}` : `insideevs-${slugifyText(title).slice(0, 24)}`;

    const candidate: ServerInsideEvsCandidate = {
      id,
      title,
      url: articleUrl,
      category: inferBlogCategory(`${title} ${ogDesc || ldDesc}`),
      excerpt: ldDesc || ogDesc || uniqueParas[0]?.slice(0, 180) || title,
      imageUrl: galleryImages[0] || pickLocalFallbackImageByTopic(title),
      galleryImages: galleryImages.length > 0 ? galleryImages : [pickLocalFallbackImageByTopic(title)],
      author: ldAuthor || 'InsideEVs Editorial',
      publishedAt: /^\d{4}-\d{2}-\d{2}$/.test(rawDate) ? rawDate : new Date().toISOString().split('T')[0],
      bodyText: uniqueParas.join('\n\n') || ldDesc || ogDesc || title,
    };

    articleCache.set(key, { data: candidate, fetchedAt: Date.now() });
    return candidate;
  } catch {
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function fetchInsideEvsTeslaFeed(
  sourceUrl = 'https://insideevs.com/tesla/',
  limit = 20,
  forceRefresh = false
): Promise<{
  candidates: ServerInsideEvsCandidate[];
  fetchedAt: string;
  sourceUrl: string;
  cached: boolean;
}> {
  const safeSource = isAllowedInsideEvsUrl(sourceUrl) ? sourceUrl : 'https://insideevs.com/tesla/';
  const safeLimit = Math.min(25, Math.max(1, Number(limit) || 20));

  if (
    !forceRefresh &&
    feedCache &&
    feedCache.sourceUrl === safeSource &&
    Date.now() - feedCache.fetchedAt < 3 * 60 * 1000 &&
    feedCache.items.length >= safeLimit
  ) {
    return {
      candidates: feedCache.items.slice(0, safeLimit),
      fetchedAt: new Date(feedCache.fetchedAt).toISOString(),
      sourceUrl: safeSource,
      cached: true,
    };
  }

  const discoveredUrls: string[] = [];
  const seenUrlKeys = new Set<string>();

  const pushUrl = (rawHref: string) => {
    const full = rawHref.startsWith('http')
      ? rawHref
      : `https://insideevs.com${rawHref.startsWith('/') ? '' : '/'}${rawHref}`;
    const clean = full.split('#')[0].split('?')[0];
    if (!isAllowedInsideEvsUrl(clean)) return;
    if (!/\/(?:news|reviews|features)\/\d{5,}\/[a-zA-Z0-9_-]+\/?$/i.test(clean)) return;
    const normalized = normalizeUrlKey(clean);
    if (!seenUrlKeys.has(normalized)) {
      seenUrlKeys.add(normalized);
      discoveredUrls.push(clean);
    }
  };

  const scanHtmlPage = async (pageUrl: string, requireTeslaSlugMatch = false) => {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 9000);
      const res = await fetch(pageUrl, { headers: BROWSER_HEADERS, signal: controller.signal });
      clearTimeout(timer);
      if (!res.ok) return;
      const html = await res.text();
      const hrefMatches = [
        ...html.matchAll(
          /href=["']((?:https:\/\/insideevs\.com)?\/(?:news|reviews|features)\/\d{5,}\/[a-zA-Z0-9_-]+\/?)["']/gi
        ),
      ];
      for (const m of hrefMatches) {
        if (
          requireTeslaSlugMatch &&
          !/tesla|cybertruck|cybercab|robotaxi|supercharger|model-?[s3xy]|roadster|fsd|megapack/i.test(m[1])
        ) {
          continue;
        }
        pushUrl(m[1]);
        if (discoveredUrls.length >= safeLimit + 8) break;
      }
    } catch (err) {
      console.warn(`InsideEVs HTML fetch warning (${pageUrl}):`, err instanceof Error ? err.message : err);
    }
  };

  // Primary page + Tesla section feeds to easily collect 20+ genuine Tesla EV articles
  const teslaSectionPages = [
    safeSource,
    'https://insideevs.com/tesla/news/',
    'https://insideevs.com/tesla/reviews/',
    'https://insideevs.com/tesla/cybertruck/',
    'https://insideevs.com/tesla/model-y/',
    'https://insideevs.com/tesla/model-3/',
  ];
  const uniqueSectionPages = Array.from(new Set(teslaSectionPages));

  for (const sectionUrl of uniqueSectionPages) {
    if (discoveredUrls.length >= safeLimit + 6) break;
    await scanHtmlPage(sectionUrl, !sectionUrl.includes('/tesla/'));
  }

  // Supplement with InsideEVs main RSS filtered for Tesla articles if fewer than requested were found
  if (discoveredUrls.length < safeLimit + 2) {
    try {
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 8000);
      const rssRes = await fetch('https://insideevs.com/rss/news/all/', {
        headers: BROWSER_HEADERS,
        signal: controller.signal,
      });
      clearTimeout(timer);
      if (rssRes.ok) {
        const xml = await rssRes.text();
        const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/gi)];
        for (const itemMatch of items) {
          const block = itemMatch[1];
          const title = decodeHtmlEntities(block.match(/<title>([\s\S]*?)<\/title>/i)?.[1] || '');
          const desc = decodeHtmlEntities(block.match(/<description>([\s\S]*?)<\/description>/i)?.[1] || '');
          const link = decodeHtmlEntities(block.match(/<link>([\s\S]*?)<\/link>/i)?.[1] || '');
          if (
            /tesla|cybertruck|cybercab|robotaxi|supercharger|model\s?[s3xy]|roadster|fsd|megapack/i.test(
              `${title} ${desc} ${link}`
            )
          ) {
            pushUrl(link);
          }
        }
      }
    } catch (err) {
      console.warn('InsideEVs RSS supplement warning:', err instanceof Error ? err.message : err);
    }
  }

  const targetUrls = discoveredUrls.slice(0, safeLimit + 4);
  const candidates: ServerInsideEvsCandidate[] = [];
  const chunkSize = 5;

  for (let i = 0; i < targetUrls.length && candidates.length < safeLimit; i += chunkSize) {
    const chunk = targetUrls.slice(i, i + chunkSize);
    const extracted = await Promise.allSettled(
      chunk.map((url) => extractInsideEvsArticle(url, forceRefresh))
    );
    for (const r of extracted) {
      if (r.status === 'fulfilled' && r.value) {
        candidates.push(r.value);
        if (candidates.length >= safeLimit) break;
      }
    }
  }

  if (candidates.length > 0) {
    feedCache = {
      sourceUrl: safeSource,
      items: candidates,
      fetchedAt: Date.now(),
    };
  }

  return {
    candidates: candidates.length > 0 ? candidates.slice(0, safeLimit) : feedCache?.items.slice(0, safeLimit) || [],
    fetchedAt: new Date().toISOString(),
    sourceUrl: safeSource,
    cached: false,
  };
}

function buildContentImages(
  title: string,
  category: ServerBlogCategory,
  galleryImages: string[],
  coverImageUrl: string,
  includeContentImages: boolean,
  captions: string[] = []
): ServerBlogContentImage[] {
  if (!includeContentImages) return [];

  const distinctSource = galleryImages.filter((u) => u && u !== coverImageUrl);
  const topicVisual = pickLocalFallbackImageByTopic(`${title} ${category}`);
  const secondaryVisual =
    category === 'Fleet & Staking Yield'
      ? '/img-supercharger-node.jpg'
      : category === 'EV Engineering & Diagnostics'
      ? '/cert-hv-safety.jpg'
      : category === 'Wraps & Protection'
      ? '/cert-wrap-cleanroom.jpg'
      : '/promo-plaid.jpg';

  const result: ServerBlogContentImage[] = [];

  const firstInlineUrl = distinctSource[0] || (topicVisual !== coverImageUrl ? topicVisual : secondaryVisual);
  if (firstInlineUrl) {
    result.push({
      url: firstInlineUrl,
      alt: `${title} — technical showcase visual`,
      caption: captions[0] || `Visual telemetry & specification brief: ${title.slice(0, 70)}`,
      placement: 'middle',
    });
  }

  const secondInlineUrl = distinctSource[1] || (secondaryVisual !== firstInlineUrl && secondaryVisual !== coverImageUrl ? secondaryVisual : '');
  if (secondInlineUrl) {
    result.push({
      url: secondInlineUrl,
      alt: `${title} — fleet & ownership analysis`,
      caption: captions[1] || `Apex Tesla Hub operational insight for ${category} members`,
      placement: 'bottom',
    });
  }

  return result;
}

export function computeServerSeoScore(post: {
  title: string;
  seoTitle: string;
  metaDescription: string;
  focusKeywords: string;
  content: string;
  coverImageUrl: string;
}): number {
  let score = 0;
  const titleLen = (post.seoTitle || post.title || '').trim().length;
  if (titleLen >= 30 && titleLen <= 72) score += 25;
  const metaLen = (post.metaDescription || '').trim().length;
  if (metaLen >= 100 && metaLen <= 168) score += 25;
  const kws = (post.focusKeywords || '')
    .split(',')
    .map((k) => k.trim().toLowerCase())
    .filter(Boolean);
  const combined = `${post.seoTitle} ${post.title} ${post.content}`.toLowerCase();
  if (kws.length > 0 && kws.some((k) => combined.includes(k))) score += 20;
  const words = (post.content || '').trim().split(/\s+/).filter(Boolean).length;
  if (words >= 120) score += 20;
  if ((post.coverImageUrl || '').trim()) score += 10;
  return score;
}

const GENERATED_BLOG_DIR = path.join(process.cwd(), 'public', 'generated-blog');

function ensureGeneratedBlogDir() {
  if (!fs.existsSync(GENERATED_BLOG_DIR)) {
    fs.mkdirSync(GENERATED_BLOG_DIR, { recursive: true });
  }
}

function sanitizeGeneratedSvg(rawSvg: string): string | null {
  const match = rawSvg.match(/<svg[\s\S]*?<\/svg>/i);
  if (!match) return null;
  let svg = match[0]
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/\son[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '')
    .replace(/javascript:/gi, '')
    .replace(/<foreignObject[\s\S]*?<\/foreignObject>/gi, '');
  if (!/viewBox=/i.test(svg)) {
    svg = svg.replace(/<svg\b/i, '<svg viewBox="0 0 1200 675"');
  }
  if (!/xmlns=/i.test(svg)) {
    svg = svg.replace(/<svg\b/i, '<svg xmlns="http://www.w3.org/2000/svg"');
  }
  return svg;
}

export async function generateBlogArticleImage(params: {
  ai: GoogleGenAI | null;
  title: string;
  excerpt?: string;
  category?: string;
  slug: string;
  imageMode?: 'gemini_editorial_svg' | 'gemini_imagen' | 'source_media';
}): Promise<{
  imageUrl?: string;
  imagePrompt?: string;
  aiPowered: boolean;
  error?: string;
}> {
  const { ai, title, excerpt = '', category = 'Tesla EV News', slug, imageMode = 'gemini_editorial_svg' } = params;
  const safeSlug = (slugifyText(slug || title) || `brief-${Date.now().toString(36)}`).slice(0, 60);
  const visualPrompt = `Editorial 16:9 futuristic Tesla EV cover visual for "${title}". Category: ${category}. Summary: ${excerpt.slice(0, 140)}. Sleek obsidian aesthetic with Tesla Crimson (#E82127) and electric cyan telemetry highlights, architectural automotive silhouette, clean technical diagram lines.`;

  if (imageMode === 'source_media') {
    return { aiPowered: false, imagePrompt: visualPrompt };
  }

  if (!ai) {
    return {
      aiPowered: false,
      imagePrompt: visualPrompt,
      error: 'Gemini API key (GEMINI_API_KEY) is not configured in Settings > Secrets.',
    };
  }

  ensureGeneratedBlogDir();

  if (imageMode === 'gemini_imagen') {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: {
          parts: [
            {
              text: `${visualPrompt} Photorealistic ultra-sharp automotive editorial photography, dramatic studio rim lighting, no embedded watermarks.`,
            },
          ],
        },
        config: {
          imageConfig: {
            aspectRatio: '16:9',
          },
        },
      });
      for (const part of response.candidates?.[0]?.content?.parts ?? []) {
        if (part.inlineData?.data) {
          const mime = part.inlineData.mimeType || 'image/png';
          const ext = mime.includes('jpeg') || mime.includes('jpg') ? 'jpg' : mime.includes('webp') ? 'webp' : 'png';
          const fileName = `${safeSlug}-${Date.now().toString(36).slice(-4)}.${ext}`;
          fs.writeFileSync(path.join(GENERATED_BLOG_DIR, fileName), Buffer.from(part.inlineData.data, 'base64'));
          return {
            imageUrl: `/generated-blog/${fileName}`,
            imagePrompt: visualPrompt,
            aiPowered: true,
          };
        }
      }
      return {
        aiPowered: false,
        imagePrompt: visualPrompt,
        error: 'Gemini image model did not return an inline image payload.',
      };
    } catch (err: any) {
      return {
        aiPowered: false,
        imagePrompt: visualPrompt,
        error: err?.message || 'Gemini image model generation failed (verify billing-enabled key in Settings > Secrets).',
      };
    }
  }

  // Default: Gemini 4 Hydrogen SVG Editorial Cover Artwork (supported on standard/free Gemini keys)
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-4-hydrogen',
      contents: `Design a crisp, magazine-grade 16:9 vector hero illustration (<svg viewBox="0 0 1200 675">) for an EV news briefing.
Article Title: ${title}
Category: ${category}
Context: ${excerpt.slice(0, 220)}

Requirements:
- Return ONLY raw valid <svg viewBox="0 0 1200 675" xmlns="http://www.w3.org/2000/svg">...</svg> code (no markdown fences).
- Deep obsidian automotive gradient background (#09090b to #111827) with subtle perspective engineering grid lines.
- Include stylized geometric vector EV vehicle/battery/Supercharger/radar-lidar shapes directly relevant to "${title}".
- Use Tesla Crimson (#e82127), electric cyan (#38bdf8), and emerald (#10b981) luminous accents via <defs><linearGradient> and soft glow filters.
- Include clean minimal technical HUD badges (e.g., category label, aerodynamic vector arcs, kW/mile telemetry lines), keeping text crisp and well within margins.
- Strictly zero <script> tags, zero external href images, zero event handlers.`,
      config: {
        systemInstruction:
          'You are an automotive technical illustrator generating clean, high-contrast 16:9 SVG editorial hero illustrations for Apex Tesla Hub.',
      },
    });

    const sanitized = sanitizeGeneratedSvg(response.text || '');
    if (!sanitized) {
      return {
        aiPowered: false,
        imagePrompt: visualPrompt,
        error: 'Gemini returned an invalid SVG payload while generating article artwork.',
      };
    }

    const fileName = `${safeSlug}-${Date.now().toString(36).slice(-4)}.svg`;
    fs.writeFileSync(path.join(GENERATED_BLOG_DIR, fileName), sanitized, 'utf8');
    return {
      imageUrl: `/generated-blog/${fileName}`,
      imagePrompt: visualPrompt,
      aiPowered: true,
    };
  } catch (err: any) {
    return {
      aiPowered: false,
      imagePrompt: visualPrompt,
      error: err?.message || 'Gemini editorial artwork generation failed.',
    };
  }
}

export async function rewriteArticleWithGeminiAndSeo(params: {
  ai: GoogleGenAI | null;
  source: {
    title: string;
    excerpt?: string;
    bodyText?: string;
    url?: string;
    author?: string;
    publishedAt?: string;
    imageUrl?: string;
    galleryImages?: string[];
  };
  options?: {
    tone?: ServerAutoBlogConfig['targetTone'];
    category?: ServerBlogCategory;
    autoPublish?: boolean;
    includeContentImages?: boolean;
    includeSourceAttribution?: boolean;
    attributionPrefix?: string;
    existingSlugs?: string[];
    generateArticleImages?: boolean;
    imageGenerationMode?: 'gemini_editorial_svg' | 'gemini_imagen' | 'source_media';
  };
}): Promise<{
  post: ServerBlogPostRecord;
  aiPowered: boolean;
  aiError?: string;
  imageGeneratedWithAi: boolean;
  imageError?: string;
}> {
  const { ai, source, options = {} } = params;
  const tone = options.tone || 'Authoritative EV Engineering';
  const includeContentImages = options.includeContentImages !== false;
  const includeSourceAttribution = options.includeSourceAttribution !== false;
  const attributionPrefix = options.attributionPrefix || 'Originally reported by InsideEVs';
  const sourceUrl = source.url?.trim() || '';
  const today = new Date().toISOString().split('T')[0];

  const sourceCoverImageUrl =
    source.imageUrl?.trim() ||
    source.galleryImages?.[0] ||
    pickLocalFallbackImageByTopic(source.title);

  let parsed: {
    title: string;
    subtitle: string;
    slug: string;
    category: ServerBlogCategory;
    excerpt: string;
    content: string;
    seoTitle: string;
    metaDescription: string;
    focusKeywords: string;
    schemaType: 'NewsArticle' | 'TechArticle' | 'BlogPosting';
    tags: string[];
    imageCaptions: string[];
  } | null = null;
  let aiPowered = false;
  let aiError: string | undefined;

  if (!ai) {
    aiError = 'Gemini API key (GEMINI_API_KEY) is not configured in Settings > Secrets.';
  } else {
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-4-hydrogen',
        contents: `Rewrite the following Tesla EV news report into an original, authoritative, deeply engaging SEO-optimized editorial briefing for Apex Tesla Hub.

Source Publication: ${sourceUrl ? 'InsideEVs' : 'Apex Editorial'}
Original Headline: ${source.title}
Original Summary: ${source.excerpt || ''}
Original Author: ${source.author || 'Editorial Desk'}
Original Publish Date: ${source.publishedAt || today}
Original Source URL: ${sourceUrl || 'N/A'}
Requested Editorial Tone: ${tone}
Target Category Preference: ${options.category || 'Auto-detect best match'}

Source Reporting Content:
${(source.bodyText || source.excerpt || source.title).slice(0, 5500)}

Editorial & SEO Requirements:
1. Write 100% original prose (do NOT copy sentences verbatim from source). Keep all facts, numbers, dates, and model details accurate.
2. Produce a sharp, high-CTR headline (45-68 characters) and compelling subtitle.
3. seoTitle MUST be between 48 and 64 characters for Google SERP optimization.
4. metaDescription MUST be between 130 and 158 characters, naturally including the primary focus keyword.
5. content MUST be 400-650 words in clean Markdown using 3-4 "## " section headings, analytical "- " bullet takeaways explaining what this means for Tesla owners, fleet operators, and investors, plus bold lead-ins inside bullets.
6. If Source URL is provided, cite the original reporting naturally and include an explicit Markdown hyperlink at the bottom of the article in this exact format: [Read original coverage on InsideEVs](${sourceUrl}).
7. Category MUST be strictly one of: "EV Engineering & Diagnostics", "Wraps & Protection", "Fleet & Staking Yield", "TSLA Markets & Crypto", "Vehicle Deliveries".
8. Provide 2 descriptive editorial image captions for accompanying Tesla visuals.`,
        config: {
          systemInstruction:
            'You are the Chief EV Editor and Technical SEO Architect at Apex Tesla Hub. Output strictly valid JSON matching the provided schema.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              subtitle: { type: Type.STRING },
              slug: { type: Type.STRING },
              category: { type: Type.STRING },
              excerpt: { type: Type.STRING },
              content: { type: Type.STRING },
              seoTitle: { type: Type.STRING },
              metaDescription: { type: Type.STRING },
              focusKeywords: { type: Type.STRING },
              schemaType: { type: Type.STRING },
              tags: { type: Type.ARRAY, items: { type: Type.STRING } },
              imageCaptions: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: [
              'title',
              'subtitle',
              'slug',
              'category',
              'excerpt',
              'content',
              'seoTitle',
              'metaDescription',
              'focusKeywords',
              'schemaType',
              'tags',
              'imageCaptions',
            ],
          },
        },
      });

      if (response.text) {
        const rawParsed = JSON.parse(response.text);
        const validCategories: ServerBlogCategory[] = [
          'EV Engineering & Diagnostics',
          'Wraps & Protection',
          'Fleet & Staking Yield',
          'TSLA Markets & Crypto',
          'Vehicle Deliveries',
        ];
        const chosenCategory = validCategories.includes(rawParsed.category)
          ? (rawParsed.category as ServerBlogCategory)
          : inferBlogCategory(`${source.title} ${source.excerpt || ''}`, options.category || 'Vehicle Deliveries');

        const validSchema = ['NewsArticle', 'TechArticle', 'BlogPosting'].includes(rawParsed.schemaType)
          ? (rawParsed.schemaType as 'NewsArticle' | 'TechArticle' | 'BlogPosting')
          : 'NewsArticle';

        parsed = {
          title: String(rawParsed.title || source.title).trim(),
          subtitle: String(rawParsed.subtitle || source.excerpt || '').trim(),
          slug: slugifyText(String(rawParsed.slug || rawParsed.title || source.title)),
          category: chosenCategory,
          excerpt: String(rawParsed.excerpt || source.excerpt || '').trim().slice(0, 220),
          content: String(rawParsed.content || '').trim(),
          seoTitle: String(rawParsed.seoTitle || `${rawParsed.title || source.title} | Apex Tesla Hub`).slice(0, 68),
          metaDescription: String(rawParsed.metaDescription || rawParsed.excerpt || source.excerpt || '').slice(0, 162),
          focusKeywords: String(rawParsed.focusKeywords || 'Tesla EV, InsideEVs update, Apex Tesla Hub'),
          schemaType: validSchema,
          tags: Array.isArray(rawParsed.tags) ? rawParsed.tags.slice(0, 6).map(String) : ['Tesla', 'EV News'],
          imageCaptions: Array.isArray(rawParsed.imageCaptions) ? rawParsed.imageCaptions.map(String) : [],
        };
        aiPowered = true;
      }
    } catch (err) {
      aiError = err instanceof Error ? err.message : String(err);
      console.warn('Gemini article rewrite fallback activated:', aiError);
    }
  }

  // Deterministic editorial synthesis only when Gemini API key is pending or upstream fails
  if (!parsed) {
    const trimWordBoundary = (txt: string, maxLen: number) => {
      const clean = txt.replace(/\s+/g, ' ').trim();
      if (clean.length <= maxLen) return clean;
      const cut = clean.slice(0, maxLen);
      const lastSpace = cut.lastIndexOf(' ');
      return (lastSpace > Math.floor(maxLen * 0.55) ? cut.slice(0, lastSpace) : cut).replace(/[,:;.\-–—]+$/, '').trim();
    };

    const extractTopics = (txt: string): string[] => {
      const candidates = [
        'Cybercab',
        'Cybertruck',
        'Robotaxi',
        'Model Y',
        'Model 3',
        'Model S',
        'Model X',
        'Supercharger',
        'FSD',
        'Autopilot',
        '4680',
        'Megapack',
        'TSLA',
        'Roadster',
        'Charging',
        'Battery',
      ];
      const found = candidates.filter((kw) => new RegExp(`\\b${kw.replace(/\s+/g, '\\s+')}\\b`, 'i').test(txt));
      return found.length > 0 ? found : ['Tesla EV', 'Electric Fleet'];
    };

    const cleanSourceTitle = (source.title || 'Tesla EV Development Update').trim();
    const resolvedCategory = inferBlogCategory(
      `${cleanSourceTitle} ${source.excerpt || ''} ${source.bodyText || ''}`,
      options.category || 'Vehicle Deliveries'
    );
    const paras = (source.bodyText || source.excerpt || cleanSourceTitle)
      .split(/\n+/)
      .map((p) => p.trim())
      .filter((p) => p.length > 25);

    const topics = extractTopics(`${cleanSourceTitle} ${source.excerpt || ''}`);
    const primaryTopic = topics[0] || 'Tesla EV';
    const leadSummary = source.excerpt || paras[0] || cleanSourceTitle;
    const detailPara1 = paras[1] || paras[0] || leadSummary;
    const detailPara2 =
      paras[2] ||
      `Telemetry across ${primaryTopic} deployments highlights accelerated software-defined architecture and lower total cost of ownership across North American and European corridors.`;
    const detailPara3 =
      paras[3] ||
      `Apex Tesla Hub engineering specialists advise fleet operators and prospective owners to evaluate thermal battery conditioning, protective film coverage, and autonomous readiness alongside manufacturer rollouts.`;

    const categoryAngleBullets: Record<ServerBlogCategory, string[]> = {
      'Fleet & Staking Yield': [
        `**Autonomous & Supercharger Node Economics**: ${primaryTopic} fleet expansion directly supports utilization rates for commercial mobility and V4 charging staking pools.`,
        `**Utilization & Telematics Readiness**: Operators tracking real-time dispatch Telemetry gain stronger daily yield resilience as urban geofences widen.`,
        `**Capital Allocation Signal**: Scaled deployment lowers per-mile operating costs and strengthens multi-year autonomous fleet cashflow projections.`,
      ],
      'EV Engineering & Diagnostics': [
        `**High-Voltage & Thermal Diagnostics**: Proactive cell impedance testing and thermal coolant validation safeguard ${primaryTopic} warranty integrity and rapid DC fast-charging.`,
        `**OTA Firmware & Safety Architecture**: Continuous neural telemetry updates refine energy recovery curves, brake-by-wire calibration, and structural reliability.`,
        `**Service Center Preparedness**: Certified technicians at Apex service bays stock calibrated diagnostic harnesses for immediate inspection and preventive maintenance.`,
      ],
      'Wraps & Protection': [
        `**Exoskeleton & Clearcoat Defense**: Pairing new ${primaryTopic} deliveries with 10-mil self-healing PPF protects OEM paintwork and stainless surfaces against highway pitting.`,
        `**Aerodynamic Efficiency & Resale Value**: Cleanroom vinyl applications preserve factory luster while keeping coefficient of drag untouched for maximum highway range.`,
        `**Hardware Integration**: Precision ultrasonic/camera sensor cutouts guarantee zero interference with Vision-based Autopilot and FSD suites.`,
      ],
      'TSLA Markets & Crypto': [
        `**TSLA Equity & Delivery Sensitivity**: Quarterly ${primaryTopic} sentiment and regional registration telemetry remain primary catalysts for institutional valuation multiples.`,
        `**Digital Settlement Flexibility**: Cross-border buyers and investors increasingly pair treasury equity exposure with BTC, USDT, and admin-verified wire settlement rails.`,
        `**Margin Trajectory**: Manufacturing vertical integration and software attach rates continue to separate high-margin EV ecosystems from legacy automakers.`,
      ],
      'Vehicle Deliveries': [
        `**Delivery Allocation & Regional Availability**: Prospective ${primaryTopic} buyers benefit from tracking localized inventory drops, incentive windows, and enclosed nationwide carrier dispatch.`,
        `**Specification Verification**: Reviewing wheel aerodynamics, LFP vs. NCA pack chemistry, and FSD Supervised hardware ensures optimal range for daily driving cycles.`,
        `**Turnkey Inspection Standard**: Every Apex-fulfilled Tesla undergoes a pre-delivery multi-point calibration audit backed by our 7-Day Money-Back Guarantee.`,
      ],
    };

    const toneIntro =
      tone === 'Executive Fleet & Market Brief'
        ? `An executive market and operational briefing analyzing how this ${primaryTopic} development reshapes fleet utilization, asset valuation, and capital deployment.`
        : tone === 'Accessible Owner Digest'
        ? `A clear, practical breakdown for Tesla drivers and prospective owners detailing what this ${primaryTopic} news means for daily driving, charging, and ownership value.`
        : `An engineering-focused technical synthesis examining powertrain implications, firmware readiness, and ecosystem impact surrounding ${primaryTopic}.`;

    const synthesizedBody = [
      `## Executive Brief: ${cleanSourceTitle}`,
      toneIntro,
      leadSummary,
      detailPara1,
      `## Technical & Ownership Analysis`,
      detailPara2,
      detailPara3,
      `## Key Takeaways for Tesla Owners & Investors`,
      ...(categoryAngleBullets[resolvedCategory] || categoryAngleBullets['Vehicle Deliveries']),
      ...(sourceUrl && includeSourceAttribution
        ? [
            `## Original Source Attribution`,
            `${attributionPrefix}${source.author ? ` by ${source.author}` : ''}${
              source.publishedAt ? ` (${source.publishedAt})` : ''
            }. [Read original coverage on InsideEVs](${sourceUrl}).`,
          ]
        : []),
    ].join('\n\n');

    const titleBaseRaw = trimWordBoundary(cleanSourceTitle, 49);
    const titleBase =
      titleBaseRaw.length < cleanSourceTitle.length
        ? titleBaseRaw.replace(/\s+(?:in|on|of|to|for|with|and|or|the|a|an|is|are|at|by|from|as)$/i, '').trim()
        : titleBaseRaw;
    const fallbackSeoTitle =
      titleBase.length >= 28 ? `${titleBase} | Apex Hub` : `${titleBase} — Tesla EV Brief | Apex Hub`;
    const metaRaw = `${trimWordBoundary(leadSummary, 102)}. Full ${primaryTopic} SEO brief & technical takeaways on Apex Tesla Hub.`;
    const fallbackMeta = trimWordBoundary(metaRaw, 156);
    const keywordList = Array.from(
      new Set([
        'Tesla',
        ...topics,
        resolvedCategory.split(' ')[0],
        'InsideEVs Tesla news',
        'Apex Tesla Hub',
      ])
    ).slice(0, 6);

    parsed = {
      title: cleanSourceTitle,
      subtitle: trimWordBoundary(leadSummary, 138),
      slug: slugifyText(cleanSourceTitle),
      category: resolvedCategory,
      excerpt: trimWordBoundary(leadSummary, 188),
      content: synthesizedBody,
      seoTitle: trimWordBoundary(fallbackSeoTitle, 64),
      metaDescription:
        fallbackMeta.length < 105
          ? trimWordBoundary(`${fallbackMeta} Explore verified Tesla specs, fleet insights & service bays.`, 158)
          : fallbackMeta,
      focusKeywords: keywordList.join(', '),
      schemaType: 'NewsArticle',
      tags: Array.from(new Set(['Tesla', ...topics.slice(0, 3), 'InsideEVs'])).slice(0, 5),
      imageCaptions: [
        `${trimWordBoundary(cleanSourceTitle, 64)} — hardware & telemetry view`,
        `${primaryTopic} ownership & fleet impact brief — Apex Tesla Hub`,
      ],
    };
  }

  // Ensure source backlink exists inside Markdown body if attribution is enabled
  let finalContent = parsed.content;
  if (includeSourceAttribution && sourceUrl && !finalContent.includes(sourceUrl)) {
    finalContent = `${finalContent.trim()}\n\n## Verified Reporting Attribution\n\n${attributionPrefix}${
      source.author ? ` by ${source.author}` : ''
    }${source.publishedAt ? ` on ${source.publishedAt}` : ''}. [Read original reporting on InsideEVs](${sourceUrl}).`;
  }

  // Guarantee unique slug
  const existingSet = new Set(options.existingSlugs || []);
  let finalSlug = parsed.slug || slugifyText(parsed.title) || `tesla-brief-${Date.now().toString(36)}`;
  if (existingSet.has(finalSlug)) {
    finalSlug = `${finalSlug.slice(0, 62)}-${Date.now().toString(36).slice(-4)}`;
  }

  // Optionally generate bespoke Gemini cover artwork for this article
  let finalCoverImageUrl = sourceCoverImageUrl;
  let imageGeneratedWithAi = false;
  let imageGenerationPrompt: string | undefined;
  let imageError: string | undefined;

  if (options.generateArticleImages && options.imageGenerationMode !== 'source_media') {
    const imgRes = await generateBlogArticleImage({
      ai,
      title: parsed.title,
      excerpt: parsed.excerpt,
      category: parsed.category,
      slug: finalSlug,
      imageMode: options.imageGenerationMode || 'gemini_editorial_svg',
    });
    imageGenerationPrompt = imgRes.imagePrompt;
    if (imgRes.aiPowered && imgRes.imageUrl) {
      finalCoverImageUrl = imgRes.imageUrl;
      imageGeneratedWithAi = true;
    } else if (imgRes.error) {
      imageError = imgRes.error;
    }
  }

  const galleryWithSourceCover = Array.from(
    new Set([sourceCoverImageUrl, ...(source.galleryImages || [])].filter(Boolean))
  );

  const contentImages = buildContentImages(
    parsed.title,
    parsed.category,
    galleryWithSourceCover,
    finalCoverImageUrl,
    includeContentImages,
    parsed.imageCaptions
  );

  const words = finalContent.split(/\s+/).filter(Boolean).length;
  const readTimeMinutes = Math.max(2, Math.ceil(words / 185));
  const nowIso = new Date().toISOString();
  const isPublished = options.autoPublish === true;

  const post: ServerBlogPostRecord = {
    id: `blog-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
    slug: finalSlug,
    title: parsed.title,
    subtitle: parsed.subtitle,
    category: parsed.category,
    status: isPublished ? 'published' : 'draft',
    featured: false,
    excerpt: parsed.excerpt,
    content: finalContent,
    coverImageUrl: finalCoverImageUrl,
    contentImages,
    authorName: aiPowered ? 'Apex Gemini AI Editorial Desk' : 'Apex Editorial Wire Desk',
    authorRole: sourceUrl ? 'EV Intelligence · InsideEVs Wire' : 'EV Engineering & SEO Desk',
    publishedAt: source.publishedAt || today,
    updatedAt: today,
    readTimeMinutes,
    seoTitle: parsed.seoTitle,
    metaDescription: parsed.metaDescription,
    focusKeywords: parsed.focusKeywords,
    canonicalUrl: `https://apex-tesla.io/?tab=blog&post=${finalSlug}`,
    schemaType: parsed.schemaType,
    sourceName: sourceUrl ? 'InsideEVs' : undefined,
    sourceUrl: sourceUrl || undefined,
    sourceAuthor: source.author || undefined,
    sourcePublishedAt: source.publishedAt || undefined,
    isAutoIngested: Boolean(sourceUrl),
    isAiRewritten: aiPowered,
    rewrittenAt: aiPowered ? nowIso : undefined,
    imageGeneratedWithAi,
    imageGenerationPrompt,
    pipelineStage: isPublished ? 'approved_published' : 'draft_review',
    tags: parsed.tags,
    viewsCount: 1,
    sharesCount: 0,
    likesCount: 0,
    bookmarksCount: 0,
    commentsCount: 0,
  };

  post.seoScore = computeServerSeoScore(post);

  return {
    post,
    aiPowered,
    aiError,
    imageGeneratedWithAi,
    imageError,
  };
}
