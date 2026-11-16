import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  collection,
  query,
  where,
  limit,
  getDocFromServer,
  serverTimestamp,
} from 'firebase/firestore';
import {
  getStorage,
  ref,
  uploadBytes,
  getDownloadURL,
  listAll,
  getMetadata,
  deleteObject,
} from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  AutoCryptoGateway,
  EngagementActivityRecord,
  MarketingBanner,
  MediaAssetRecord,
  NewsletterSubscriber,
  PageSeoMeta,
  ProductItem,
  SeoMetadataConfig,
  User,
} from '../types';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

function createFirestoreInstance() {
  try {
    if (typeof window !== 'undefined') {
      return initializeFirestore(
        app,
        {
          experimentalForceLongPolling: true,
          ignoreUndefinedProperties: true,
        },
        firebaseConfig.firestoreDatabaseId
      );
    }
    return initializeFirestore(
      app,
      {
        ignoreUndefinedProperties: true,
      },
      firebaseConfig.firestoreDatabaseId
    );
  } catch {
    return getFirestore(app, firebaseConfig.firestoreDatabaseId);
  }
}

export const db = createFirestoreInstance();
export const auth = getAuth(app);
export const storage = getStorage(app);
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      // Retry once after a short delay in case the initial iframe/proxy WebChannel handshake raced
      await new Promise((resolve) => setTimeout(resolve, 1200));
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
        return;
      } catch (retryError) {
        if (retryError instanceof Error && retryError.message.includes('the client is offline')) {
          console.error('Please check your Firebase configuration.');
        }
      }
    }
  }
}

if (typeof window !== 'undefined') {
  void testConnection();
}

export const PUBLIC_ADMIN_SETTING_SECTIONS = [
  'site_settings',
  'currencies',
  'feature_toggles',
  'withdrawal_settings',
  'shipping_settings',
  'refund_policy',
  'navigation_menus',
  'site_pages',
  'faqs',
  'sitemap_entries',
  'rss_items',
  'promo_banners',
  'promo_videos',
  'products',
  'tesla_cars',
  'investment_pools',
  'stock_plans',
  'tsla_quote',
  'coupons',
  'wheel_rewards',
  'scratch_tiers',
  'manual_deposits',
  'deposit_gateways',
  'business_certificates',
  'blog_posts',
  'blog_comments',
  'engagement_reward_config',
  'social_links',
  'spin_cost',
  'streak_config',
  'spin_system_config',
  'cron_jobs_config',
] as const;

export const PROTECTED_ADMIN_SETTING_SECTIONS = [
  'smtp_config',
  'auto_gateways',
  'won_prizes',
  'engagement_rewards',
] as const;

export function sanitizeGatewaysForPublic(gateways: AutoCryptoGateway[]): AutoCryptoGateway[] {
  return gateways.map((gw) => ({
    ...gw,
    webhookSecret: '',
  }));
}

export async function connectFirebaseGoogleAdminSession(): Promise<{
  success: boolean;
  email?: string | null;
  uid?: string;
  error?: string;
}> {
  try {
    const credential = await signInWithPopup(auth, googleProvider);
    return {
      success: true,
      email: credential.user.email,
      uid: credential.user.uid,
    };
  } catch (err) {
    return {
      success: false,
      error: err instanceof Error ? err.message : 'Google sign-in popup cancelled or failed.',
    };
  }
}

export async function saveSeoGlobalToFirestore(
  seo: SeoMetadataConfig
): Promise<{ synced: boolean; reason?: string }> {
  if (!auth.currentUser) {
    return { synced: false, reason: 'auth_required' };
  }
  const path = 'site_config/seo';
  try {
    await setDoc(doc(db, 'site_config', 'seo'), {
      siteTitle: (seo.siteTitle || seo.metaTitle || 'Apex Tesla Hub').slice(0, 200),
      metaDescription: (seo.metaDescription || '').slice(0, 600),
      keywords: (seo.keywords || '').slice(0, 600),
      ogTitle: (seo.ogTitle || seo.siteTitle || '').slice(0, 200),
      ogDescription: (seo.ogDescription || seo.metaDescription || '').slice(0, 600),
      ogImageUrl: (seo.ogImageUrl || '/logo.jpg').slice(0, 1500),
      twitterCard: seo.twitterCard === 'summary' ? 'summary' : 'summary_large_image',
      canonicalUrl: (seo.canonicalUrl || 'https://apex-tesla.io/').slice(0, 300),
      logoUrl: (seo.logoUrl || '/logo.jpg').slice(0, 1500),
      faviconUrl: (seo.faviconUrl || '/favicon.jpg').slice(0, 1500),
      robotsDirective: (seo.robotsDirective || 'index, follow').slice(0, 100),
      schemaOrgEnabled: Boolean(seo.schemaOrgEnabled),
      updatedByUid: auth.currentUser.uid,
      updatedAt: serverTimestamp(),
    });
    return { synced: true };
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, path);
    } catch (wrapped) {
      return { synced: false, reason: wrapped instanceof Error ? wrapped.message : String(wrapped) };
    }
  }
}

export async function savePageSeoToFirestore(
  pageSeo: PageSeoMeta
): Promise<{ synced: boolean; reason?: string }> {
  if (!auth.currentUser) {
    return { synced: false, reason: 'auth_required' };
  }
  const safeKey = pageSeo.pageKey.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64) || 'home';
  const path = `page_seo/${safeKey}`;
  try {
    const payload: Record<string, unknown> = {
      pageKey: safeKey,
      pageLabel: (pageSeo.pageLabel || safeKey).slice(0, 120),
      metaTitle: (pageSeo.metaTitle || 'Apex Tesla Hub').slice(0, 200),
      metaDescription: (pageSeo.metaDescription || '').slice(0, 600),
      keywords: (pageSeo.keywords || '').slice(0, 600),
      updatedByUid: auth.currentUser.uid,
      updatedAt: serverTimestamp(),
    };
    if (pageSeo.ogTitle) payload.ogTitle = pageSeo.ogTitle.slice(0, 200);
    if (pageSeo.ogImageUrl) payload.ogImageUrl = pageSeo.ogImageUrl.slice(0, 1500);
    await setDoc(doc(db, 'page_seo', safeKey), payload);
    return { synced: true };
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, path);
    } catch (wrapped) {
      return { synced: false, reason: wrapped instanceof Error ? wrapped.message : String(wrapped) };
    }
  }
}

export async function saveAdminSectionToFirestore(
  sectionId: string,
  data: unknown
): Promise<{ synced: boolean; reason?: string }> {
  if (!auth.currentUser) {
    return { synced: false, reason: 'auth_required' };
  }
  const safeId = sectionId.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64);
  const path = `admin_settings/${safeId}`;
  const serialized = JSON.stringify(data);
  if (serialized.length > 445000) {
    return { synced: false, reason: `Section ${safeId} exceeds Firestore safe slice size.` };
  }
  try {
    await setDoc(doc(db, 'admin_settings', safeId), {
      sectionId: safeId,
      payloadJson: serialized,
      updatedByUid: auth.currentUser.uid,
      updatedAt: serverTimestamp(),
    });
    return { synced: true };
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, path);
    } catch (wrapped) {
      return { synced: false, reason: wrapped instanceof Error ? wrapped.message : String(wrapped) };
    }
  }
}

export async function loadGlobalSeoFromFirestore(): Promise<{
  globalSeo?: Partial<SeoMetadataConfig>;
  pageMeta?: Record<string, PageSeoMeta>;
}> {
  const result: {
    globalSeo?: Partial<SeoMetadataConfig>;
    pageMeta?: Record<string, PageSeoMeta>;
  } = {};

  try {
    const seoSnap = await getDoc(doc(db, 'site_config', 'seo'));
    if (seoSnap.exists()) {
      const d = seoSnap.data();
      result.globalSeo = {
        siteTitle: d.siteTitle,
        metaTitle: d.siteTitle,
        metaDescription: d.metaDescription,
        keywords: d.keywords,
        ogTitle: d.ogTitle,
        ogDescription: d.ogDescription,
        ogImageUrl: d.ogImageUrl,
        twitterCard: d.twitterCard,
        canonicalUrl: d.canonicalUrl,
        logoUrl: d.logoUrl,
        faviconUrl: d.faviconUrl,
        robotsDirective: d.robotsDirective,
        schemaOrgEnabled: d.schemaOrgEnabled,
      };
    }
  } catch {
    // Non-blocking fallback when rules/project aren't configured for public read
  }

  try {
    const pageSnaps = await getDocs(collection(db, 'page_seo'));
    if (!pageSnaps.empty) {
      const map: Record<string, PageSeoMeta> = {};
      pageSnaps.forEach((docSnap) => {
        const d = docSnap.data();
        if (d.pageKey) {
          map[d.pageKey] = {
            pageKey: d.pageKey,
            pageLabel: d.pageLabel || d.pageKey,
            metaTitle: d.metaTitle || '',
            metaDescription: d.metaDescription || '',
            keywords: d.keywords || '',
            ogTitle: d.ogTitle,
            ogImageUrl: d.ogImageUrl,
          };
        }
      });
      result.pageMeta = map;
    }
  } catch {
    // Non-blocking fallback when rules/project aren't configured for public read
  }

  return result;
}

export async function loadAdminSectionsFromFirestore(
  includeProtected = false
): Promise<Record<string, unknown>> {
  const loaded: Record<string, unknown> = {};
  const ids = includeProtected
    ? [...PUBLIC_ADMIN_SETTING_SECTIONS, ...PROTECTED_ADMIN_SETTING_SECTIONS]
    : [...PUBLIC_ADMIN_SETTING_SECTIONS];

  await Promise.all(
    ids.map(async (sectionId) => {
      try {
        const snap = await getDoc(doc(db, 'admin_settings', sectionId));
        if (snap.exists()) {
          const d = snap.data();
          if (typeof d.payloadJson === 'string') {
            loaded[sectionId] = JSON.parse(d.payloadJson);
          }
        }
      } catch {
        // Graceful non-fatal hydration skip when Firestore permissions are unavailable
      }
    })
  );
  return loaded;
}

export async function uploadBrandingMediaFile(
  file: File,
  role: 'logo' | 'favicon' | 'og_image' | 'general',
  replaceAsset?: MediaAssetRecord
): Promise<{
  asset: MediaAssetRecord;
  storageProvider: 'firebase_storage' | 'local_upload';
  warning?: string;
}> {
  const cleanName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 64);
  const assetId = `${role}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 6)}`.replace(
    /[^a-zA-Z0-9_-]/g,
    '_'
  );
  const targetPath =
    replaceAsset && replaceAsset.source === 'firebase_storage' && replaceAsset.storagePath.startsWith('branding/')
      ? replaceAsset.storagePath
      : `branding/${role}/${Date.now()}_${cleanName}`;

  let firebaseErrorReason: string | undefined;

  try {
    const storageRef = ref(storage, targetPath);
    const snap = await uploadBytes(storageRef, file, {
      contentType: file.type || 'image/png',
      customMetadata: {
        role,
        originalName: file.name,
      },
    });
    const downloadUrl = await getDownloadURL(snap.ref);
    const asset: MediaAssetRecord = {
      id: replaceAsset?.id || assetId,
      role,
      name: file.name,
      storagePath: snap.ref.fullPath,
      downloadUrl,
      contentType: file.type || 'image/png',
      sizeBytes: file.size,
      uploadedAt: new Date().toISOString(),
      uploadedByEmail: auth.currentUser?.email || undefined,
      source: 'firebase_storage',
    };

    if (auth.currentUser) {
      try {
        await setDoc(doc(db, 'media_assets', asset.id), {
          id: asset.id,
          role: asset.role,
          name: asset.name.slice(0, 200),
          storagePath: asset.storagePath.slice(0, 500),
          downloadUrl: asset.downloadUrl.slice(0, 1500),
          contentType: asset.contentType.slice(0, 80),
          sizeBytes: asset.sizeBytes,
          uploadedAt: asset.uploadedAt.slice(0, 64),
          source: 'firebase_storage',
          uploadedByUid: auth.currentUser.uid,
        });
      } catch (fsErr) {
        try {
          handleFirestoreError(fsErr, OperationType.WRITE, `media_assets/${asset.id}`);
        } catch (wrapped) {
          firebaseErrorReason = wrapped instanceof Error ? wrapped.message : String(wrapped);
        }
      }
    }

    return { asset, storageProvider: 'firebase_storage', warning: firebaseErrorReason };
  } catch (storageErr) {
    firebaseErrorReason =
      storageErr instanceof Error ? storageErr.message : 'Firebase Storage unavailable or unauthorized';
  }

  // Fallback to local server upload so admin UI remains functional if Firebase Storage rules require sign-in
  const dataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result || ''));
    reader.onerror = () => reject(new Error('Failed to read image file'));
    reader.readAsDataURL(file);
  });

  const tok = typeof window !== 'undefined' ? localStorage.getItem('apex_session_token') : null;
  const res = await fetch('/api/media/upload', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(tok ? { Authorization: `Bearer ${tok}` } : {}),
    },
    body: JSON.stringify({
      filename: `${role}-${cleanName}`,
      dataUrl,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.url) {
    throw new Error(data.error || firebaseErrorReason || 'Media upload failed.');
  }

  const fallbackAsset: MediaAssetRecord = {
    id: replaceAsset?.id || assetId,
    role,
    name: file.name,
    storagePath: data.url,
    downloadUrl: data.url,
    contentType: file.type || data.mimeType || 'image/png',
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
    source: 'local_upload',
  };

  return {
    asset: fallbackAsset,
    storageProvider: 'local_upload',
    warning: firebaseErrorReason,
  };
}

export async function listFirebaseBrandingAssets(): Promise<MediaAssetRecord[]> {
  const byPath = new Map<string, MediaAssetRecord>();

  // 1. Read Firestore media_assets metadata registry
  try {
    const snap = await getDocs(collection(db, 'media_assets'));
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      if (d.downloadUrl && d.storagePath) {
        byPath.set(d.storagePath, {
          id: d.id || docSnap.id,
          role: d.role || 'general',
          name: d.name || docSnap.id,
          storagePath: d.storagePath,
          downloadUrl: d.downloadUrl,
          contentType: d.contentType || 'image/png',
          sizeBytes: Number(d.sizeBytes || 0),
          uploadedAt: d.uploadedAt || new Date().toISOString(),
          source: d.source || 'firebase_storage',
        });
      }
    });
  } catch {
    // Graceful skip if rules/offline
  }

  // 2. Scan Firebase Storage folders directly (`branding/logo`, `branding/favicon`, `branding/og_image`, `branding/general`)
  const folders: Array<{ role: MediaAssetRecord['role']; dir: string }> = [
    { role: 'logo', dir: 'branding/logo' },
    { role: 'favicon', dir: 'branding/favicon' },
    { role: 'og_image', dir: 'branding/og_image' },
    { role: 'general', dir: 'branding/general' },
  ];

  await Promise.all(
    folders.map(async ({ role, dir }) => {
      try {
        const res = await listAll(ref(storage, dir));
        await Promise.all(
          res.items.map(async (itemRef) => {
            try {
              const [url, meta] = await Promise.all([
                getDownloadURL(itemRef),
                getMetadata(itemRef),
              ]);
              if (!byPath.has(itemRef.fullPath)) {
                byPath.set(itemRef.fullPath, {
                  id: `st_${itemRef.name.replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64)}`,
                  role: (meta.customMetadata?.role as MediaAssetRecord['role']) || role,
                  name: meta.customMetadata?.originalName || itemRef.name,
                  storagePath: itemRef.fullPath,
                  downloadUrl: url,
                  contentType: meta.contentType || 'image/png',
                  sizeBytes: meta.size || 0,
                  uploadedAt: meta.updated || meta.timeCreated || new Date().toISOString(),
                  source: 'firebase_storage',
                });
              }
            } catch {
              // ignore individual item read error
            }
          })
        );
      } catch {
        // Storage folder empty or unauthorized
      }
    })
  );

  return Array.from(byPath.values()).sort(
    (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
  );
}

export async function deleteBrandingMediaAsset(asset: MediaAssetRecord): Promise<{
  deletedStorage: boolean;
  deletedFirestore: boolean;
}> {
  let deletedStorage = false;
  let deletedFirestore = false;

  if (asset.source === 'firebase_storage' && asset.storagePath.startsWith('branding/')) {
    try {
      await deleteObject(ref(storage, asset.storagePath));
      deletedStorage = true;
    } catch {
      // ignore if already deleted or unauthorized
    }
  }

  if (auth.currentUser && asset.id) {
    try {
      await deleteDoc(doc(db, 'media_assets', asset.id));
      deletedFirestore = true;
    } catch (err) {
      try {
        handleFirestoreError(err, OperationType.DELETE, `media_assets/${asset.id}`);
      } catch {
        // ignore
      }
    }
  }

  return { deletedStorage, deletedFirestore };
}

function toSafeFirestoreId(rawId: string, fallbackPrefix = 'doc'): string {
  const cleaned = (rawId || `${fallbackPrefix}-${Date.now().toString(36)}`)
    .replace(/[^a-zA-Z0-9_-]/g, '_')
    .slice(0, 128);
  return cleaned || `${fallbackPrefix}_${Date.now().toString(36)}`;
}

// ---------- PRODUCT INVENTORY FIRESTORE CRUD (`/products/{productId}`) ----------

export async function loadCatalogProductsFromFirestore(): Promise<ProductItem[]> {
  try {
    const snap = await getDocs(collection(db, 'products'));
    if (snap.empty) return [];
    const items: ProductItem[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      if (d && d.name) {
        items.push({
          id: String(d.id || docSnap.id),
          name: String(d.name),
          category: (d.category as ProductItem['category']) || 'Charging & Tech',
          priceUsd: Number(d.priceUsd ?? 0),
          rating: typeof d.rating === 'number' ? d.rating : 4.9,
          reviewsCount: typeof d.reviewsCount === 'number' ? d.reviewsCount : 12,
          image: String(d.image || ''),
          description: String(d.description || ''),
          compatibility: typeof d.compatibility === 'string' ? d.compatibility : '',
          inStock: Boolean(d.inStock),
        });
      }
    });
    return items;
  } catch {
    return [];
  }
}

export async function saveProductToFirestore(
  product: ProductItem
): Promise<{ synced: boolean; reason?: string }> {
  if (!auth.currentUser) {
    return { synced: false, reason: 'auth_required' };
  }
  const safeId = toSafeFirestoreId(product.id, 'prod');
  const path = `products/${safeId}`;
  const validCategories: ProductItem['category'][] = [
    'Wraps & Film',
    'Wheels & Performance',
    'Interior & Yoke',
    'Aero & Carbon',
    'Charging & Tech',
    'Vehicle Sales',
  ];
  const safeCategory = validCategories.includes(product.category) ? product.category : 'Charging & Tech';

  try {
    await setDoc(doc(db, 'products', safeId), {
      id: safeId,
      name: (product.name || 'Tesla Hardware Item').slice(0, 180),
      category: safeCategory,
      priceUsd: Math.max(0, Math.min(10000000, Number(product.priceUsd) || 0)),
      rating: Math.max(0, Math.min(5, Number(product.rating ?? 4.9))),
      reviewsCount: Math.max(0, Math.min(1000000, Number(product.reviewsCount ?? 12))),
      image: (product.image || '').slice(0, 1500),
      description: (product.description || '').slice(0, 2000),
      compatibility: (product.compatibility || '').slice(0, 300),
      inStock: Boolean(product.inStock),
      updatedByUid: auth.currentUser.uid,
      updatedAt: serverTimestamp(),
    });
    return { synced: true };
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, path);
    } catch (wrapped) {
      return { synced: false, reason: wrapped instanceof Error ? wrapped.message : String(wrapped) };
    }
  }
}

export async function deleteProductFromFirestore(
  productId: string
): Promise<{ synced: boolean; reason?: string }> {
  if (!auth.currentUser) {
    return { synced: false, reason: 'auth_required' };
  }
  const safeId = toSafeFirestoreId(productId, 'prod');
  const path = `products/${safeId}`;
  try {
    await deleteDoc(doc(db, 'products', safeId));
    return { synced: true };
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.DELETE, path);
    } catch (wrapped) {
      return { synced: false, reason: wrapped instanceof Error ? wrapped.message : String(wrapped) };
    }
  }
}

// ---------- PROMOTIONAL BANNERS FIRESTORE CRUD (`/marketing_banners/{bannerId}`) ----------

export async function loadMarketingBannersFromFirestore(): Promise<MarketingBanner[]> {
  try {
    const snap = await getDocs(collection(db, 'marketing_banners'));
    if (snap.empty) return [];
    const list: MarketingBanner[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      if (d && d.title && d.headline) {
        list.push({
          id: String(d.id || docSnap.id),
          title: String(d.title),
          size: (d.size as MarketingBanner['size']) || 'leaderboard',
          dimensions: String(d.dimensions || '1456×180 HD'),
          customWidth: typeof d.customWidth === 'number' ? d.customWidth : undefined,
          customHeight: typeof d.customHeight === 'number' ? d.customHeight : undefined,
          imageMode: d.imageMode === 'multi' ? 'multi' : 'single',
          transitionEffect:
            d.transitionEffect === 'slide' || d.transitionEffect === 'zoom' ? d.transitionEffect : 'fade',
          headline: String(d.headline),
          subheadline: String(d.subheadline || ''),
          ctaText: String(d.ctaText || 'Explore'),
          badgeText: String(d.badgeText || ''),
          themeGradient: String(d.themeGradient || 'from-zinc-950 via-red-950/80 to-zinc-950'),
          accentColor: String(d.accentColor || '#ef4444'),
          targetTab: String(d.targetTab || 'vehicles'),
          imageUrl: String(d.imageUrl || ''),
          slideImages: Array.isArray(d.slideImages) ? d.slideImages.map(String) : undefined,
          slideIntervalSec: typeof d.slideIntervalSec === 'number' ? d.slideIntervalSec : 4,
          isActive: Boolean(d.isActive),
          isAiGenerated: Boolean(d.isAiGenerated),
          is3dHd: Boolean(d.is3dHd),
          style3dPreset: (d.style3dPreset as MarketingBanner['style3dPreset']) || 'cyber_perspective',
          resolutionQuality: d.resolutionQuality === 'HD 1080p' ? 'HD 1080p' : '4K UHD',
          carRenderModel: String(d.carRenderModel || ''),
          clicksCount: Number(d.clicksCount ?? 0),
          createdAt: String(d.createdAt || new Date().toISOString().split('T')[0]),
        });
      }
    });
    return list;
  } catch {
    return [];
  }
}

export async function saveMarketingBannerToFirestore(
  banner: MarketingBanner
): Promise<{ synced: boolean; reason?: string }> {
  if (!auth.currentUser) {
    return { synced: false, reason: 'auth_required' };
  }
  const safeId = toSafeFirestoreId(banner.id, 'banner');
  const path = `marketing_banners/${safeId}`;
  const payload: Record<string, unknown> = {
    id: safeId,
    title: (banner.title || 'Promotional Banner').slice(0, 180),
    size: banner.size || 'leaderboard',
    dimensions: (banner.dimensions || '1456×180 HD').slice(0, 64),
    headline: (banner.headline || 'Apex Tesla Hub').slice(0, 240),
    subheadline: (banner.subheadline || '').slice(0, 500),
    ctaText: (banner.ctaText || 'Explore').slice(0, 80),
    badgeText: (banner.badgeText || '').slice(0, 80),
    themeGradient: (banner.themeGradient || 'from-zinc-950 via-red-950/80 to-zinc-950').slice(0, 200),
    accentColor: (banner.accentColor || '#ef4444').slice(0, 40),
    targetTab: (banner.targetTab || 'vehicles').slice(0, 64),
    imageUrl: (banner.imageUrl || '').slice(0, 1500),
    isActive: Boolean(banner.isActive),
    isAiGenerated: Boolean(banner.isAiGenerated),
    is3dHd: banner.is3dHd ?? true,
    style3dPreset: banner.style3dPreset || 'cyber_perspective',
    resolutionQuality: banner.resolutionQuality === 'HD 1080p' ? 'HD 1080p' : '4K UHD',
    carRenderModel: (banner.carRenderModel || 'Cybertruck Cyberbeast').slice(0, 120),
    clicksCount: Math.max(0, Number(banner.clicksCount ?? 0)),
    createdAt: (banner.createdAt || new Date().toISOString().split('T')[0]).slice(0, 64),
    updatedByUid: auth.currentUser.uid,
    updatedAt: serverTimestamp(),
  };

  if (typeof banner.customWidth === 'number') {
    payload.customWidth = Math.max(50, Math.min(8000, banner.customWidth));
  }
  if (typeof banner.customHeight === 'number') {
    payload.customHeight = Math.max(50, Math.min(8000, banner.customHeight));
  }
  if (banner.imageMode === 'single' || banner.imageMode === 'multi') {
    payload.imageMode = banner.imageMode;
  }
  if (banner.transitionEffect === 'fade' || banner.transitionEffect === 'slide' || banner.transitionEffect === 'zoom') {
    payload.transitionEffect = banner.transitionEffect;
  }
  if (Array.isArray(banner.slideImages)) {
    payload.slideImages = banner.slideImages.slice(0, 10).map((s) => String(s).slice(0, 1500));
  }
  if (typeof banner.slideIntervalSec === 'number') {
    payload.slideIntervalSec = Math.max(1, Math.min(120, banner.slideIntervalSec));
  }

  try {
    await setDoc(doc(db, 'marketing_banners', safeId), payload);
    return { synced: true };
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, path);
    } catch (wrapped) {
      return { synced: false, reason: wrapped instanceof Error ? wrapped.message : String(wrapped) };
    }
  }
}

export async function deleteMarketingBannerFromFirestore(
  bannerId: string
): Promise<{ synced: boolean; reason?: string }> {
  if (!auth.currentUser) {
    return { synced: false, reason: 'auth_required' };
  }
  const safeId = toSafeFirestoreId(bannerId, 'banner');
  const path = `marketing_banners/${safeId}`;
  try {
    await deleteDoc(doc(db, 'marketing_banners', safeId));
    return { synced: true };
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.DELETE, path);
    } catch (wrapped) {
      return { synced: false, reason: wrapped instanceof Error ? wrapped.message : String(wrapped) };
    }
  }
}

// ---------- MANAGED USERS FIRESTORE CRUD (`/managed_users/{userId}`) ----------

export async function loadManagedUsersFromFirestore(): Promise<User[]> {
  if (!auth.currentUser) return [];
  try {
    const snap = await getDocs(collection(db, 'managed_users'));
    if (snap.empty) return [];
    const users: User[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      if (d && d.email && d.name) {
        users.push({
          id: String(d.id || docSnap.id),
          name: String(d.name),
          email: String(d.email),
          role: d.role === 'admin' ? 'admin' : 'customer',
          tier:
            d.tier === 'Founders Club' ||
            d.tier === 'Plaid Member' ||
            d.tier === 'Silver Ambassador'
              ? d.tier
              : 'Standard',
          accountStatus:
            d.accountStatus === 'suspended' || d.accountStatus === 'flagged' || d.accountStatus === 'banned'
              ? d.accountStatus
              : 'active',
          kycStatus:
            d.kycStatus === 'in_review' || d.kycStatus === 'verified' || d.kycStatus === 'rejected'
              ? d.kycStatus
              : 'unverified',
          totalDepositedUsd: Number(d.totalDepositedUsd ?? 0),
          referralCount: Number(d.referralCount ?? 0),
          referralEarningsUsd: Number(d.referralEarningsUsd ?? 0),
          referralCode: String(d.referralCode || 'APEX-USER'),
          location: String(d.location || ''),
          phone: String(d.phone || ''),
          bio: String(d.bio || ''),
          preferredServiceCenter: String(d.preferredServiceCenter || 'Apex Fremont Technology Center'),
          avatar: String(d.avatar || ''),
          memberSince: String(d.memberSince || 'Today'),
          walletAddress: String(d.walletAddress || ''),
          twoFactorEnabled: Boolean(d.twoFactorEnabled),
          pinSet: false,
          referredUsers: [],
        });
      }
    });
    return users;
  } catch {
    return [];
  }
}

export async function saveManagedUserToFirestore(
  user: User
): Promise<{ synced: boolean; reason?: string }> {
  if (!auth.currentUser) {
    return { synced: false, reason: 'auth_required' };
  }
  const safeId = toSafeFirestoreId(user.id, 'usr');
  const path = `managed_users/${safeId}`;

  try {
    await setDoc(doc(db, 'managed_users', safeId), {
      id: safeId,
      name: (user.name || 'Tesla Member').slice(0, 120),
      email: (user.email || 'member@apex-tesla.io').slice(0, 200),
      role: user.role === 'admin' ? 'admin' : 'customer',
      tier:
        user.tier === 'Founders Club' ||
        user.tier === 'Plaid Member' ||
        user.tier === 'Silver Ambassador'
          ? user.tier
          : 'Standard',
      accountStatus:
        user.accountStatus === 'suspended' || user.accountStatus === 'flagged' || user.accountStatus === 'banned'
          ? user.accountStatus
          : 'active',
      kycStatus:
        user.kycStatus === 'in_review' || user.kycStatus === 'verified' || user.kycStatus === 'rejected'
          ? user.kycStatus
          : 'unverified',
      totalDepositedUsd: Math.max(0, Math.min(100000000, Number(user.totalDepositedUsd ?? 0))),
      referralCount: Math.max(0, Math.min(1000000, Number(user.referralCount ?? 0))),
      referralEarningsUsd: Math.max(0, Math.min(100000000, Number(user.referralEarningsUsd ?? 0))),
      referralCode: (user.referralCode || `APEX-${safeId.slice(0, 6).toUpperCase()}`).slice(0, 32),
      location: (user.location || '').slice(0, 120),
      phone: (user.phone || '').slice(0, 40),
      bio: (user.bio || '').slice(0, 500),
      preferredServiceCenter: (user.preferredServiceCenter || 'Apex Fremont Technology Center').slice(0, 160),
      avatar: (user.avatar || '').slice(0, 500),
      memberSince: (user.memberSince || 'Today').slice(0, 64),
      walletAddress: (user.walletAddress || '').slice(0, 128),
      twoFactorEnabled: Boolean(user.twoFactorEnabled),
      updatedByUid: auth.currentUser.uid,
      updatedAt: serverTimestamp(),
    });
    return { synced: true };
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.WRITE, path);
    } catch (wrapped) {
      return { synced: false, reason: wrapped instanceof Error ? wrapped.message : String(wrapped) };
    }
  }
}

export async function deleteManagedUserFromFirestore(
  userId: string
): Promise<{ synced: boolean; reason?: string }> {
  if (!auth.currentUser) {
    return { synced: false, reason: 'auth_required' };
  }
  const safeId = toSafeFirestoreId(userId, 'usr');
  const path = `managed_users/${safeId}`;
  try {
    await deleteDoc(doc(db, 'managed_users', safeId));
    return { synced: true };
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.DELETE, path);
    } catch (wrapped) {
      return { synced: false, reason: wrapped instanceof Error ? wrapped.message : String(wrapped) };
    }
  }
}

// ---------- NEWSLETTER SUBSCRIBERS FIRESTORE CRUD (`/newsletter_subscribers/{subscriberId}`) ----------

export function toNewsletterSubscriberId(email: string): string {
  const normalized = email.trim().toLowerCase();
  let hash = 2166136261;
  for (let i = 0; i < normalized.length; i += 1) {
    hash ^= normalized.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const hex = (hash >>> 0).toString(36);
  const slug = normalized.replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '').slice(0, 48);
  return `sub_${slug}_${hex}`.slice(0, 128);
}

export async function subscribeNewsletterInFirestore(input: {
  email: string;
  name?: string;
  interestCategory: NewsletterSubscriber['interestCategory'];
  source: NewsletterSubscriber['source'];
}): Promise<{ synced: boolean; subscriber: NewsletterSubscriber; reason?: string }> {
  const cleanEmail = input.email.trim().toLowerCase().slice(0, 200);
  const id = toNewsletterSubscriberId(cleanEmail);
  const subscribedAt = new Date().toISOString().replace('T', ' ').substring(0, 16);
  const subscriber: NewsletterSubscriber = {
    id,
    email: cleanEmail,
    name: (input.name || '').trim().slice(0, 120),
    interestCategory: input.interestCategory,
    status: 'active',
    source: input.source,
    subscribedAt,
  };

  const path = `newsletter_subscribers/${id}`;
  try {
    await setDoc(doc(db, 'newsletter_subscribers', id), {
      id,
      email: subscriber.email,
      name: subscriber.name || '',
      interestCategory: subscriber.interestCategory,
      status: 'active',
      source: subscriber.source,
      subscribedAt,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return { synced: true, subscriber };
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.CREATE, path);
    } catch (wrapped) {
      return {
        synced: false,
        subscriber,
        reason: wrapped instanceof Error ? wrapped.message : String(wrapped),
      };
    }
  }
}

export async function loadNewsletterSubscribersFromFirestore(): Promise<NewsletterSubscriber[]> {
  if (!auth.currentUser) return [];
  try {
    const snap = await getDocs(collection(db, 'newsletter_subscribers'));
    if (snap.empty) return [];
    const list: NewsletterSubscriber[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      if (d && d.email) {
        list.push({
          id: String(d.id || docSnap.id),
          email: String(d.email),
          name: typeof d.name === 'string' && d.name ? d.name : undefined,
          interestCategory:
            d.interestCategory === 'Service & Wraps' ||
            d.interestCategory === 'Fleet & Yield' ||
            d.interestCategory === 'Vehicle Drops & Promos'
              ? d.interestCategory
              : 'All Updates',
          status: d.status === 'unsubscribed' ? 'unsubscribed' : 'active',
          source:
            d.source === 'footer' ||
            d.source === 'admin_manual' ||
            d.source === 'registered_sync'
              ? d.source
              : 'home_banner',
          subscribedAt: String(d.subscribedAt || new Date().toISOString().split('T')[0]),
        });
      }
    });
    return list.sort((a, b) => b.subscribedAt.localeCompare(a.subscribedAt));
  } catch {
    return [];
  }
}

export async function updateNewsletterSubscriberInFirestore(
  subscriber: NewsletterSubscriber,
  updates: Partial<Pick<NewsletterSubscriber, 'name' | 'interestCategory' | 'status'>>
): Promise<{ synced: boolean; reason?: string }> {
  if (!auth.currentUser) {
    return { synced: false, reason: 'auth_required' };
  }
  const safeId = toSafeFirestoreId(subscriber.id, 'sub');
  const path = `newsletter_subscribers/${safeId}`;
  try {
    const payload: Record<string, unknown> = {
      updatedAt: serverTimestamp(),
    };
    if (updates.name !== undefined) payload.name = updates.name.slice(0, 120);
    if (updates.interestCategory !== undefined) payload.interestCategory = updates.interestCategory;
    if (updates.status !== undefined) payload.status = updates.status;

    await updateDoc(doc(db, 'newsletter_subscribers', safeId), payload);
    return { synced: true };
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.UPDATE, path);
    } catch (wrapped) {
      return { synced: false, reason: wrapped instanceof Error ? wrapped.message : String(wrapped) };
    }
  }
}

export async function deleteNewsletterSubscriberFromFirestore(
  subscriberId: string
): Promise<{ synced: boolean; reason?: string }> {
  if (!auth.currentUser) {
    return { synced: false, reason: 'auth_required' };
  }
  const safeId = toSafeFirestoreId(subscriberId, 'sub');
  const path = `newsletter_subscribers/${safeId}`;
  try {
    await deleteDoc(doc(db, 'newsletter_subscribers', safeId));
    return { synced: true };
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.DELETE, path);
    } catch (wrapped) {
      return { synced: false, reason: wrapped instanceof Error ? wrapped.message : String(wrapped) };
    }
  }
}

// ---------- ENGAGEMENT ACTIVITY TRACKER (`/engagement_activities/{activityId}`) ----------

export async function saveEngagementActivityToFirestore(
  activity: Omit<EngagementActivityRecord, 'userId'> & { userId?: string }
): Promise<{ synced: boolean; record?: EngagementActivityRecord; reason?: string }> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) {
    return { synced: false, reason: 'verified_auth_required' };
  }
  const safeId = toSafeFirestoreId(activity.id, 'act');
  const safeTab = (activity.pageTab || 'home').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 64) || 'home';
  const path = `engagement_activities/${safeId}`;
  const centsEarned = Math.max(0, Math.min(10000, Number(activity.centsEarned) || 0));
  const pointsEarned = Math.max(0, Math.min(100000, Number(activity.pointsEarned) || 0));

  const payload: Record<string, unknown> = {
    id: safeId,
    userId: auth.currentUser.uid,
    userTier: (activity.userTier || 'Standard').slice(0, 64),
    activityType: activity.activityType === 'social_share' ? 'social_share' : 'page_dwell',
    pageTab: safeTab,
    centsEarned,
    pointsEarned,
    createdAt: serverTimestamp(),
  };

  if (typeof activity.dwellSeconds === 'number') {
    payload.dwellSeconds = Math.max(0, Math.min(86400, Math.round(activity.dwellSeconds)));
  }
  if (activity.platform) {
    payload.platform = String(activity.platform).slice(0, 40);
  }
  if (activity.targetTitle) {
    payload.targetTitle = String(activity.targetTitle).slice(0, 200);
  }

  const normalizedRecord: EngagementActivityRecord = {
    id: safeId,
    userId: activity.userId || auth.currentUser.uid,
    userTier: String(payload.userTier),
    activityType: payload.activityType as 'page_dwell' | 'social_share',
    pageTab: safeTab,
    dwellSeconds: typeof payload.dwellSeconds === 'number' ? payload.dwellSeconds : undefined,
    platform: typeof payload.platform === 'string' ? payload.platform : undefined,
    targetTitle: typeof payload.targetTitle === 'string' ? payload.targetTitle : undefined,
    centsEarned,
    pointsEarned,
    createdAt: activity.createdAt || new Date().toISOString(),
  };

  try {
    await setDoc(doc(db, 'engagement_activities', safeId), payload);
    return { synced: true, record: normalizedRecord };
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.CREATE, path);
    } catch (wrapped) {
      return {
        synced: false,
        record: normalizedRecord,
        reason: wrapped instanceof Error ? wrapped.message : String(wrapped),
      };
    }
  }
}

export async function loadEngagementActivitiesFromFirestore(
  isAdminUser = false
): Promise<EngagementActivityRecord[]> {
  if (!auth.currentUser || !auth.currentUser.emailVerified) return [];
  const path = 'engagement_activities';
  try {
    const refCol = collection(db, path);
    const targetQuery = isAdminUser
      ? query(refCol, limit(200))
      : query(refCol, where('userId', '==', auth.currentUser.uid), limit(150));
    const snap = await getDocs(targetQuery);
    if (snap.empty) return [];
    const items: EngagementActivityRecord[] = [];
    snap.forEach((docSnap) => {
      const d = docSnap.data();
      if (!d || !d.userId) return;
      const createdAtIso =
        typeof d.createdAt?.toDate === 'function'
          ? d.createdAt.toDate().toISOString()
          : typeof d.createdAt === 'string'
          ? d.createdAt
          : new Date().toISOString();
      items.push({
        id: String(d.id || docSnap.id),
        userId: String(d.userId),
        userTier: String(d.userTier || 'Standard'),
        activityType: d.activityType === 'social_share' ? 'social_share' : 'page_dwell',
        pageTab: String(d.pageTab || 'home'),
        dwellSeconds: typeof d.dwellSeconds === 'number' ? d.dwellSeconds : undefined,
        platform: typeof d.platform === 'string' && d.platform ? d.platform : undefined,
        targetTitle: typeof d.targetTitle === 'string' && d.targetTitle ? d.targetTitle : undefined,
        centsEarned: Number(d.centsEarned ?? 0),
        pointsEarned: Number(d.pointsEarned ?? 0),
        createdAt: createdAtIso,
      });
    });
    return items.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, path);
    } catch {
      return [];
    }
  }
}



