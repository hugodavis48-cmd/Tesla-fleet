import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import {
  getFirestore,
  doc,
  getDoc,
  getDocs,
  setDoc,
  deleteDoc,
  collection,
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
import { MediaAssetRecord, PageSeoMeta, SeoMetadataConfig } from '../types';

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);

export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
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
      console.error('Please check your Firebase configuration.');
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
  'social_links',
  'spin_cost',
] as const;

export const PROTECTED_ADMIN_SETTING_SECTIONS = [
  'smtp_config',
  'auto_gateways',
  'won_prizes',
] as const;

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
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.GET, 'site_config/seo');
    } catch {
      // Non-blocking fallback when rules/project aren't configured for public read
    }
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
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, 'page_seo');
    } catch {
      // Non-blocking fallback
    }
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
      } catch (err) {
        try {
          handleFirestoreError(err, OperationType.GET, `admin_settings/${sectionId}`);
        } catch {
          // Graceful non-fatal hydration skip
        }
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

  const res = await fetch('/api/media/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
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
  } catch (err) {
    try {
      handleFirestoreError(err, OperationType.LIST, 'media_assets');
    } catch {
      // ignore if rules/offline
    }
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
