import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { MediaAssetRecord, PageSeoMeta } from '../types';
import {
  uploadBrandingMediaFile,
  listFirebaseBrandingAssets,
  deleteBrandingMediaAsset,
} from '../lib/firebase';
import { ImageLightbox, LightboxImageItem } from './ImageLightbox';
import {
  Globe,
  Upload,
  Search,
  Rss,
  HelpCircle,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
  Map,
  Edit3,
  Eye,
  EyeOff,
  FolderOpen,
  Cloud,
  RefreshCw,
  Image as ImageIcon,
  Maximize2,
  Replace,
  Sparkles,
  Lock,
} from 'lucide-react';

const BUILTIN_SEO_PAGE_LIST: Array<{ key: string; label: string }> = [
  { key: 'home', label: 'Home Portal' },
  { key: 'vehicles', label: 'Tesla Vehicle Showroom' },
  { key: 'stocks', label: 'TSLA Stocks & Fast-ROI' },
  { key: 'investment', label: 'Fleet Staking & Yield' },
  { key: 'services', label: 'Service & Mobile Ranger' },
  { key: 'wraps', label: 'Custom Wrap Studio' },
  { key: 'rentals', label: 'Exotic Rental Fleet' },
  { key: 'promotions', label: 'Spin & Scratch Promotions' },
  { key: 'shop', label: 'Hardware & Parts Store' },
  { key: 'banners', label: 'Promo Banners & Videos' },
  { key: 'coupons', label: 'Coupons & Vouchers' },
  { key: 'referrals', label: 'Affiliate & Referrals' },
  { key: 'about', label: 'About Apex Hub' },
  { key: 'faq', label: 'Platform FAQ' },
  { key: 'contact', label: 'Contact & Concierge' },
  { key: 'sitemap', label: 'HTML & XML Sitemap' },
  { key: 'rss', label: 'RSS News & XML Feed' },
];

const formatBytes = (bytes: number): string => {
  if (!bytes || bytes <= 0) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
};

export const AdminSeoFaqManager: React.FC = () => {
  const {
    seoSettings,
    updateSeoSettings,
    updatePageSeo,
    sitePages,
    firebaseAdminEmail,
    firebaseCloudConnected,
    lastFirestoreSyncAt,
    isSyncingFirestore,
    connectAdminCloudSync,
    syncAllAdminSettingsToFirestore,
    sitemapEntries,
    createSitemapEntry,
    updateSitemapEntry,
    deleteSitemapEntry,
    rssFeedItems,
    createRssFeedItem,
    updateRssFeedItem,
    deleteRssFeedItem,
    faqsList,
    createFaqItem,
    updateFaqItem,
    deleteFaqItem,
    showToast,
  } = useApp();

  const [subTab, setSubTab] = useState<'seo_branding' | 'file_manager' | 'sitemap_rss' | 'faqs'>('seo_branding');
  const [seoForm, setSeoForm] = useState(seoSettings);

  useEffect(() => {
    setSeoForm(seoSettings);
  }, [seoSettings]);

  // All editable pages (built-in + custom CMS pages)
  const selectablePages = useMemo(() => {
    const map = new globalThis.Map<string, string>();
    BUILTIN_SEO_PAGE_LIST.forEach((p) => map.set(p.key, p.label));
    sitePages.forEach((sp) => {
      if (sp.slug && !map.has(sp.slug)) {
        map.set(sp.slug, `Custom: ${sp.title}`);
      }
    });
    return Array.from(map.entries()).map(([key, label]) => ({ key, label }));
  }, [sitePages]);

  const [selectedPageKey, setSelectedPageKey] = useState<string>('home');
  const [pageSeoForm, setPageSeoForm] = useState<PageSeoMeta>(() => {
    const existing = seoSettings.pageMeta?.home;
    return (
      existing || {
        pageKey: 'home',
        pageLabel: 'Home Portal',
        metaTitle: seoSettings.siteTitle,
        metaDescription: seoSettings.metaDescription,
        keywords: seoSettings.keywords,
        ogTitle: seoSettings.ogTitle,
        ogImageUrl: seoSettings.ogImageUrl,
      }
    );
  });

  useEffect(() => {
    const label = selectablePages.find((p) => p.key === selectedPageKey)?.label || selectedPageKey;
    const existing = seoSettings.pageMeta?.[selectedPageKey];
    setPageSeoForm(
      existing || {
        pageKey: selectedPageKey,
        pageLabel: label,
        metaTitle: `${label} | ${seoSettings.siteTitle}`,
        metaDescription: seoSettings.metaDescription,
        keywords: seoSettings.keywords,
        ogTitle: `${label} — ${seoSettings.siteTitle}`,
        ogImageUrl: seoSettings.ogImageUrl,
      }
    );
  }, [selectedPageKey, seoSettings, selectablePages]);

  // File Management State (Firebase Storage + Media Library)
  const [uploadingTarget, setUploadingTarget] = useState<'logo' | 'favicon' | 'og_image' | 'general' | null>(null);
  const [replacingAssetId, setReplacingAssetId] = useState<string | null>(null);
  const [mediaAssets, setMediaAssets] = useState<MediaAssetRecord[]>([]);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);

  // Lightbox state
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxImages, setLightboxImages] = useState<LightboxImageItem[]>([]);
  const [lightboxIndex, setLightboxIndex] = useState(0);

  const openLightbox = (items: LightboxImageItem[], startIdx = 0) => {
    setLightboxImages(items);
    setLightboxIndex(startIdx);
    setLightboxOpen(true);
  };

  const refreshMediaLibrary = useCallback(async () => {
    setIsLoadingFiles(true);
    try {
      const [fbAssets, serverRes] = await Promise.all([
        listFirebaseBrandingAssets(),
        fetch('/api/media/list')
          .then((r) => (r.ok ? r.json() : { files: [] }))
          .catch(() => ({ files: [] })),
      ]);

      const merged = new globalThis.Map<string, MediaAssetRecord>();
      fbAssets.forEach((a) => merged.set(a.downloadUrl, a));

      const serverFiles = Array.isArray(serverRes.files) ? serverRes.files : [];
      serverFiles.forEach((sf: any) => {
        if (!merged.has(sf.url)) {
          const lower = String(sf.name || '').toLowerCase();
          const guessedRole: MediaAssetRecord['role'] = lower.includes('favicon')
            ? 'favicon'
            : lower.includes('logo')
            ? 'logo'
            : lower.includes('og')
            ? 'og_image'
            : 'general';
          merged.set(sf.url, {
            id: sf.id || `srv_${Date.now()}`,
            role: guessedRole,
            name: sf.name,
            storagePath: sf.storagePath || sf.url,
            downloadUrl: sf.url,
            contentType: sf.contentType || 'image/jpeg',
            sizeBytes: Number(sf.sizeBytes || 0),
            uploadedAt: sf.uploadedAt || new Date().toISOString(),
            source: sf.source || 'local_upload',
          });
        }
      });

      setMediaAssets(
        Array.from(merged.values()).sort(
          (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
        )
      );
    } finally {
      setIsLoadingFiles(false);
    }
  }, []);

  useEffect(() => {
    void refreshMediaLibrary();
  }, [refreshMediaLibrary, firebaseCloudConnected]);

  // Sitemap form
  const [newSitemap, setNewSitemap] = useState({
    path: '/new-section',
    title: '',
    description: '',
    category: 'Platform',
    priority: 0.8,
    changeFreq: 'weekly' as 'daily' | 'weekly' | 'monthly',
  });

  // RSS form
  const [newRss, setNewRss] = useState({
    title: '',
    linkTab: 'home',
    description: '',
    category: 'Announcement',
  });

  // FAQ form
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [faqForm, setFaqForm] = useState({
    category: 'General & Account',
    question: '',
    answer: '',
    order: faqsList.length + 1,
    isPublished: true,
  });

  const handleUploadImageFile = async (
    e: React.ChangeEvent<HTMLInputElement>,
    target: 'logo' | 'favicon' | 'og_image' | 'general',
    replaceAsset?: MediaAssetRecord
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      showToast('Please select a JPG, PNG, or WEBP image file.', 'error');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      showToast('File size must be under 5 MB.', 'error');
      return;
    }

    setUploadingTarget(target);
    if (replaceAsset) setReplacingAssetId(replaceAsset.id);

    try {
      const { asset, storageProvider, warning } = await uploadBrandingMediaFile(file, target, replaceAsset);

      if (target === 'logo' || replaceAsset?.downloadUrl === seoForm.logoUrl) {
        setSeoForm((prev) => ({ ...prev, logoUrl: asset.downloadUrl }));
        updateSeoSettings({ logoUrl: asset.downloadUrl });
      }
      if (target === 'favicon' || replaceAsset?.downloadUrl === seoForm.faviconUrl) {
        setSeoForm((prev) => ({ ...prev, faviconUrl: asset.downloadUrl }));
        updateSeoSettings({ faviconUrl: asset.downloadUrl });
      }
      if (target === 'og_image' || replaceAsset?.downloadUrl === seoForm.ogImageUrl) {
        setSeoForm((prev) => ({ ...prev, ogImageUrl: asset.downloadUrl }));
        updateSeoSettings({ ogImageUrl: asset.downloadUrl });
      }

      setMediaAssets((prev) => {
        const filtered = prev.filter((item) => item.id !== asset.id && item.downloadUrl !== asset.downloadUrl);
        return [asset, ...filtered];
      });

      const providerLabel = storageProvider === 'firebase_storage' ? 'Firebase Storage' : 'Server Media Store';
      showToast(
        `${replaceAsset ? 'Replaced' : 'Uploaded'} ${file.name} via ${providerLabel} and updated app branding!`,
        'success'
      );
      if (warning && storageProvider === 'local_upload') {
        showToast('Saved to Server Media Store (Connect Google Admin for direct Firebase Storage write access).', 'info');
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Upload failed.', 'error');
    } finally {
      setUploadingTarget(null);
      setReplacingAssetId(null);
    }
  };

  const handleAssignAsset = (asset: MediaAssetRecord, role: 'logo' | 'favicon' | 'og_image') => {
    if (role === 'logo') {
      setSeoForm((prev) => ({ ...prev, logoUrl: asset.downloadUrl }));
      updateSeoSettings({ logoUrl: asset.downloadUrl });
    } else if (role === 'favicon') {
      setSeoForm((prev) => ({ ...prev, faviconUrl: asset.downloadUrl }));
      updateSeoSettings({ faviconUrl: asset.downloadUrl });
    } else {
      setSeoForm((prev) => ({ ...prev, ogImageUrl: asset.downloadUrl }));
      updateSeoSettings({ ogImageUrl: asset.downloadUrl });
    }
    showToast(`Applied ${asset.name} globally as active ${role.replace('_', ' ').toUpperCase()}!`, 'success');
  };

  const handleDeleteAsset = async (asset: MediaAssetRecord) => {
    if (asset.source === 'preset') {
      showToast('Built-in default brand asset cannot be deleted (upload a replacement instead).', 'info');
      return;
    }
    try {
      await deleteBrandingMediaAsset(asset);
      if (asset.source === 'local_upload') {
        await fetch(`/api/media/delete?filename=${encodeURIComponent(asset.name)}`, {
          method: 'DELETE',
        }).catch(() => {});
      }
      setMediaAssets((prev) => prev.filter((a) => a.id !== asset.id));
      showToast(`Deleted "${asset.name}".`, 'info');
    } catch {
      showToast('Failed to delete file.', 'error');
    }
  };

  const handleSaveGlobalSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    updateSeoSettings(seoForm);
    await syncAllAdminSettingsToFirestore(true);
  };

  const handleSaveSelectedPageSeo = async (e: React.FormEvent) => {
    e.preventDefault();
    await updatePageSeo(selectedPageKey, pageSeoForm);
  };

  const handleAddSitemap = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSitemap.title.trim() || !newSitemap.path.trim()) return;
    createSitemapEntry({
      ...newSitemap,
      isActive: true,
      lastMod: new Date().toISOString().split('T')[0],
    });
    setNewSitemap({ path: '/new-page', title: '', description: '', category: 'Platform', priority: 0.8, changeFreq: 'weekly' });
  };

  const handleAddRss = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRss.title.trim() || !newRss.description.trim()) return;
    createRssFeedItem({
      ...newRss,
      pubDate: new Date().toUTCString(),
      guid: `apex-rss-${Date.now().toString(36)}`,
      isPublished: true,
    });
    setNewRss({ title: '', linkTab: 'home', description: '', category: 'Announcement' });
  };

  const handleSaveFaq = (e: React.FormEvent) => {
    e.preventDefault();
    if (!faqForm.question.trim() || !faqForm.answer.trim()) return;
    if (editingFaqId) {
      updateFaqItem(editingFaqId, faqForm);
      setEditingFaqId(null);
    } else {
      createFaqItem(faqForm);
    }
    setFaqForm({
      category: 'General & Account',
      question: '',
      answer: '',
      order: faqsList.length + 2,
      isPublished: true,
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      {/* Firebase Cloud & Firestore Sync Status Strip */}
      <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start sm:items-center gap-3">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              firebaseCloudConnected
                ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-400'
                : 'bg-amber-500/15 border-amber-500/40 text-amber-400'
            }`}
          >
            <Cloud className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-heading font-bold text-sm text-white">
                Firestore &amp; Firebase Storage Persistence
              </span>
              <span
                className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                  firebaseCloudConnected
                    ? 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}
              >
                {firebaseCloudConnected ? `CLOUD CONNECTED (${firebaseAdminEmail})` : 'LOCAL SESSION MODE'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              All SEO per-page meta tags, logo/favicon branding, currency multipliers, toggles, and admin settings sync automatically.
              {lastFirestoreSyncAt && <span className="text-emerald-400 font-mono ml-2">Last Firestore sync: {lastFirestoreSyncAt}</span>}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {!firebaseCloudConnected && (
            <button
              type="button"
              onClick={() => void connectAdminCloudSync()}
              className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-bold text-xs flex items-center gap-1.5 cursor-pointer transition"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>Connect Google Admin</span>
            </button>
          )}
          <button
            type="button"
            onClick={() => void syncAllAdminSettingsToFirestore(false)}
            disabled={isSyncingFirestore}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50 transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 text-cyan-400 ${isSyncingFirestore ? 'animate-spin' : ''}`} />
            <span>{isSyncingFirestore ? 'Syncing Firestore...' : 'Sync All Settings to Firestore'}</span>
          </button>
        </div>
      </div>

      {/* Subtab Bar */}
      <div className="flex flex-wrap items-center gap-2 border-b border-zinc-800 pb-3">
        {[
          { id: 'seo_branding', label: 'SEO Meta & Per-Page Manager', icon: Globe },
          { id: 'file_manager', label: `Logo & Favicon File Manager (${mediaAssets.length})`, icon: FolderOpen },
          { id: 'sitemap_rss', label: `Sitemap (${sitemapEntries.length}) & RSS (${rssFeedItems.length})`, icon: Rss },
          { id: 'faqs', label: `FAQs Slider (${faqsList.length})`, icon: HelpCircle },
        ].map((tab) => {
          const Icon = tab.icon;
          const active = subTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setSubTab(tab.id as typeof subTab)}
              className={`px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition ${
                active ? 'bg-red-600 text-white shadow-lg shadow-red-950/30' : 'bg-zinc-900 text-zinc-400 hover:text-white border border-zinc-800'
              }`}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* TAB 1: GLOBAL & DYNAMIC PER-PAGE SEO MANAGEMENT */}
      {subTab === 'seo_branding' && (
        <div className="space-y-6">
          {/* Per-Page SEO Editor */}
          <form onSubmit={handleSaveSelectedPageSeo} className="p-5 sm:p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h4 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-red-400" /> Dynamic Per-Page Meta Tags Editor
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Customize meta title, description &amp; keywords individually for any page route. Applied dynamically when users navigate and persisted to Firestore.
                </p>
              </div>
              <div className="sm:w-64 shrink-0">
                <label className="text-[10px] font-mono uppercase text-zinc-400 block mb-1">Select Target Page</label>
                <select
                  value={selectedPageKey}
                  onChange={(e) => setSelectedPageKey(e.target.value)}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-700 rounded-xl text-white font-semibold"
                >
                  {selectablePages.map((p) => (
                    <option key={p.key} value={p.key}>
                      /{p.key} — {p.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
              <div className="lg:col-span-7 space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-zinc-400 block mb-1">Page Meta Title</label>
                    <input
                      type="text"
                      required
                      maxLength={180}
                      value={pageSeoForm.metaTitle}
                      onChange={(e) => setPageSeoForm({ ...pageSeoForm, metaTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                    />
                  </div>
                  <div>
                    <label className="text-zinc-400 block mb-1">OpenGraph Social Title (Optional)</label>
                    <input
                      type="text"
                      maxLength={180}
                      value={pageSeoForm.ogTitle || ''}
                      onChange={(e) => setPageSeoForm({ ...pageSeoForm, ogTitle: e.target.value })}
                      className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">
                    Page Meta Description <span className="text-zinc-500 font-mono">({pageSeoForm.metaDescription.length}/160 recommended)</span>
                  </label>
                  <textarea
                    rows={3}
                    maxLength={500}
                    value={pageSeoForm.metaDescription}
                    onChange={(e) => setPageSeoForm({ ...pageSeoForm, metaDescription: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="text-zinc-400 block mb-1">Page Keywords (comma-separated)</label>
                  <input
                    type="text"
                    maxLength={500}
                    value={pageSeoForm.keywords}
                    onChange={(e) => setPageSeoForm({ ...pageSeoForm, keywords: e.target.value })}
                    className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                  />
                </div>
              </div>

              {/* Live SERP Preview */}
              <div className="lg:col-span-5 p-4 rounded-2xl bg-zinc-900/70 border border-zinc-800 flex flex-col justify-between space-y-3">
                <div className="space-y-2">
                  <span className="text-[10px] font-mono uppercase text-emerald-400 font-bold block">
                    Live Search Engine SERP Preview (/{selectedPageKey})
                  </span>
                  <div className="p-3.5 rounded-xl bg-white text-zinc-900 space-y-1 shadow-inner">
                    <div className="flex items-center gap-2 text-[11px] text-zinc-600 truncate">
                      <img src={seoForm.faviconUrl || '/favicon.jpg'} alt="" className="w-4 h-4 rounded-sm object-cover" />
                      <span className="truncate font-mono">
                        {(seoForm.canonicalUrl || 'https://apex-tesla.io/').replace(/\/+$/, '')}/{selectedPageKey === 'home' ? '' : `?tab=${selectedPageKey}`}
                      </span>
                    </div>
                    <div className="text-sm font-bold text-[#1a0dab] leading-snug line-clamp-2">
                      {pageSeoForm.metaTitle || seoForm.siteTitle}
                    </div>
                    <div className="text-xs text-[#4d5156] leading-relaxed line-clamp-3">
                      {pageSeoForm.metaDescription || seoForm.metaDescription}
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-red-950/30"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Save /{selectedPageKey} Meta to Firestore</span>
                </button>
              </div>
            </div>

            {/* Quick Page SEO Overview Pills */}
            <div className="pt-2 border-t border-zinc-900">
              <span className="text-[10px] font-mono uppercase text-zinc-500 block mb-2">
                Quick Select Page ({selectablePages.length} Routes Indexed)
              </span>
              <div className="flex flex-wrap gap-1.5">
                {selectablePages.map((p) => {
                  const hasCustom = Boolean(seoSettings.pageMeta?.[p.key]?.metaTitle);
                  const active = selectedPageKey === p.key;
                  return (
                    <button
                      key={p.key}
                      type="button"
                      onClick={() => setSelectedPageKey(p.key)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-mono border cursor-pointer transition ${
                        active
                          ? 'bg-red-600 border-red-500 text-white font-bold'
                          : hasCustom
                          ? 'bg-zinc-900 border-emerald-500/30 text-zinc-200 hover:border-zinc-600'
                          : 'bg-zinc-900/50 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      /{p.key}
                    </button>
                  );
                })}
              </div>
            </div>
          </form>

          {/* Global Fallback SEO Form */}
          <form onSubmit={handleSaveGlobalSeo} className="p-5 sm:p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 text-xs">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Search className="w-4 h-4 text-cyan-400" /> Global Default SEO, OpenGraph &amp; Schema.org Settings
              </h4>
              <span className="text-[11px] font-mono text-emerald-400">Fallback &amp; Root Tags</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-zinc-400 block mb-1">Default Site Title (Fallback)</label>
                <input
                  type="text"
                  value={seoForm.siteTitle}
                  onChange={(e) => setSeoForm({ ...seoForm, siteTitle: e.target.value, metaTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                />
              </div>
              <div>
                <label className="text-zinc-400 block mb-1">Canonical Base URL</label>
                <input
                  type="text"
                  value={seoForm.canonicalUrl}
                  onChange={(e) => setSeoForm({ ...seoForm, canonicalUrl: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono"
                />
              </div>

              <div className="md:col-span-2">
                <label className="text-zinc-400 block mb-1">Global Meta Description</label>
                <textarea
                  rows={2}
                  value={seoForm.metaDescription}
                  onChange={(e) => setSeoForm({ ...seoForm, metaDescription: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Global Keywords (comma-separated)</label>
                <input
                  type="text"
                  value={seoForm.keywords}
                  onChange={(e) => setSeoForm({ ...seoForm, keywords: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">Robots Indexing Directive</label>
                <input
                  type="text"
                  value={seoForm.robotsDirective}
                  onChange={(e) => setSeoForm({ ...seoForm, robotsDirective: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="text-zinc-400 block mb-1">OpenGraph Social Title</label>
                <input
                  type="text"
                  value={seoForm.ogTitle}
                  onChange={(e) => setSeoForm({ ...seoForm, ogTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-900 border border-zinc-800">
                <div>
                  <span className="text-white font-bold block">Enable JSON-LD Schema.org</span>
                  <span className="text-[10px] text-zinc-400">Structured AutoDealer data for search engines</span>
                </div>
                <input
                  type="checkbox"
                  checked={seoForm.schemaOrgEnabled}
                  onChange={(e) => setSeoForm({ ...seoForm, schemaOrgEnabled: e.target.checked })}
                  className="w-4 h-4 accent-red-600 cursor-pointer"
                />
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="submit"
                className="px-6 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-950/40"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Save Global SEO &amp; Sync All Changes to Firestore</span>
              </button>
            </div>
          </form>
        </div>
      )}

      {/* TAB 2: FIREBASE STORAGE FILE MANAGER (LOGO, FAVICON & BRAND ASSETS) */}
      {subTab === 'file_manager' && (
        <div className="space-y-6 text-xs">
          {/* Active Branding Slots */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              {
                role: 'logo' as const,
                title: 'Active Site Logo (JPG / PNG)',
                subtitle: 'Shown in Navbar, Footer & Apple Touch Icon',
                url: seoForm.logoUrl,
                accent: 'text-red-400',
              },
              {
                role: 'favicon' as const,
                title: 'Active Browser Favicon (JPG / PNG)',
                subtitle: 'Shown in browser tab & Google SERP preview',
                url: seoForm.faviconUrl,
                accent: 'text-amber-400',
              },
              {
                role: 'og_image' as const,
                title: 'Social OG Share Image (JPG / PNG)',
                subtitle: 'Shown when links are shared on X/FB/WhatsApp',
                url: seoForm.ogImageUrl,
                accent: 'text-cyan-400',
              },
            ].map((slot) => (
              <div key={slot.role} className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-3 flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-bold text-white block">{slot.title}</span>
                    <span className="text-[10px] text-zinc-400">{slot.subtitle}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => openLightbox([{ url: slot.url, title: slot.title, subtitle: slot.url, badge: slot.role.toUpperCase() }], 0)}
                      className="relative w-16 h-16 rounded-xl overflow-hidden border border-zinc-700 bg-black shrink-0 group cursor-pointer"
                      title="Open in Lightbox"
                    >
                      <img src={slot.url} alt={slot.title} className="w-full h-full object-cover" />
                      <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                        <Maximize2 className="w-4 h-4 text-white" />
                      </span>
                    </button>
                    <label className="flex-1 px-3 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-center text-zinc-200 cursor-pointer flex items-center justify-center gap-1.5 transition">
                      <Upload className={`w-3.5 h-3.5 ${slot.accent}`} />
                      <span>{uploadingTarget === slot.role ? 'Uploading...' : 'Upload & Set Active'}</span>
                      <input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        onChange={(e) => void handleUploadImageFile(e, slot.role)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
                <input
                  type="text"
                  value={slot.url}
                  onChange={(e) => {
                    const val = e.target.value;
                    if (slot.role === 'logo') {
                      setSeoForm((prev) => ({ ...prev, logoUrl: val }));
                    } else if (slot.role === 'favicon') {
                      setSeoForm((prev) => ({ ...prev, faviconUrl: val }));
                    } else {
                      setSeoForm((prev) => ({ ...prev, ogImageUrl: val }));
                    }
                  }}
                  onBlur={() => updateSeoSettings(seoForm)}
                  className="w-full px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300"
                />
              </div>
            ))}
          </div>

          {/* Firebase Storage File Library Table / Grid */}
          <div className="p-5 sm:p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h4 className="font-heading font-bold text-base text-white flex items-center gap-2">
                  <ImageIcon className="w-4 h-4 text-amber-400" /> Firebase Storage File Management Library
                </h4>
                <p className="text-[11px] text-zinc-400 mt-0.5">
                  Upload, preview in Lightbox, replace existing assets, or assign any JPG/PNG asset globally as your live Logo or Favicon.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <label className="px-3.5 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer transition">
                  <Plus className="w-3.5 h-3.5" />
                  <span>{uploadingTarget === 'general' ? 'Uploading...' : 'Upload JPG/PNG File'}</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    onChange={(e) => void handleUploadImageFile(e, 'general')}
                    className="hidden"
                  />
                </label>
                <button
                  type="button"
                  onClick={() => void refreshMediaLibrary()}
                  disabled={isLoadingFiles}
                  className="px-3 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  <span>Refresh</span>
                </button>
              </div>
            </div>

            {mediaAssets.length === 0 ? (
              <div className="p-10 text-center rounded-2xl bg-zinc-900/40 border border-zinc-800 text-zinc-400 space-y-2">
                <FolderOpen className="w-10 h-10 mx-auto text-zinc-600" />
                <p className="font-semibold text-zinc-300">No branding image files found yet.</p>
                <p className="text-[11px]">Upload a JPG or PNG logo or favicon above to store it in Firebase Storage.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {mediaAssets.map((asset, idx) => {
                  const isActiveLogo = seoForm.logoUrl === asset.downloadUrl;
                  const isActiveFavicon = seoForm.faviconUrl === asset.downloadUrl;
                  const isActiveOg = seoForm.ogImageUrl === asset.downloadUrl;
                  const lightboxList: LightboxImageItem[] = mediaAssets.map((a) => ({
                    url: a.downloadUrl,
                    title: a.name,
                    subtitle: `${a.contentType} • ${formatBytes(a.sizeBytes)} • ${a.storagePath}`,
                    badge: a.source === 'firebase_storage' ? 'Firebase Storage' : a.source === 'preset' ? 'Built-in' : 'Server Media',
                  }));

                  return (
                    <div
                      key={asset.id}
                      className="rounded-2xl bg-zinc-900/60 border border-zinc-800 overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        <button
                          type="button"
                          onClick={() => openLightbox(lightboxList, idx)}
                          className="relative w-full aspect-[16/10] bg-black overflow-hidden group cursor-pointer block"
                        >
                          <img src={asset.downloadUrl} alt={asset.name} className="w-full h-full object-contain p-2" />
                          <span className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-bold transition">
                            <Maximize2 className="w-4 h-4" /> Click to View Fullscreen
                          </span>
                          <div className="absolute top-2 left-2 flex flex-wrap gap-1">
                            {isActiveLogo && (
                              <span className="px-2 py-0.5 rounded bg-red-600 text-white text-[9px] font-mono font-bold">
                                ACTIVE LOGO
                              </span>
                            )}
                            {isActiveFavicon && (
                              <span className="px-2 py-0.5 rounded bg-amber-500 text-black text-[9px] font-mono font-bold">
                                ACTIVE FAVICON
                              </span>
                            )}
                            {isActiveOg && (
                              <span className="px-2 py-0.5 rounded bg-cyan-500 text-black text-[9px] font-mono font-bold">
                                ACTIVE OG
                              </span>
                            )}
                          </div>
                          <span className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/80 border border-zinc-700 text-[9px] font-mono text-zinc-300">
                            {asset.source === 'firebase_storage' ? 'Firebase Storage' : asset.source === 'preset' ? 'Default' : 'Server'}
                          </span>
                        </button>

                        <div className="p-3.5 space-y-1">
                          <div className="font-bold text-white truncate" title={asset.name}>
                            {asset.name}
                          </div>
                          <div className="text-[10px] font-mono text-zinc-400 truncate" title={asset.storagePath}>
                            {asset.storagePath}
                          </div>
                          <div className="flex items-center justify-between text-[10px] font-mono text-zinc-500 pt-1">
                            <span>{asset.contentType}</span>
                            <span>{formatBytes(asset.sizeBytes)}</span>
                          </div>
                        </div>
                      </div>

                      <div className="p-3 pt-0 flex flex-wrap gap-1.5">
                        <button
                          type="button"
                          onClick={() => handleAssignAsset(asset, 'logo')}
                          className="flex-1 min-w-[80px] py-1.5 px-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-white cursor-pointer"
                        >
                          Use as Logo
                        </button>
                        <button
                          type="button"
                          onClick={() => handleAssignAsset(asset, 'favicon')}
                          className="flex-1 min-w-[90px] py-1.5 px-2 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-amber-300 cursor-pointer"
                        >
                          Use as Favicon
                        </button>
                        <label className="py-1.5 px-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-800 border border-zinc-700 text-[10px] font-bold text-cyan-300 flex items-center gap-1 cursor-pointer">
                          <Replace className="w-3 h-3" />
                          <span>{replacingAssetId === asset.id ? '...' : 'Replace'}</span>
                          <input
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            onChange={(e) => void handleUploadImageFile(e, asset.role, asset)}
                            className="hidden"
                          />
                        </label>
                        {asset.source !== 'preset' && (
                          <button
                            type="button"
                            onClick={() => void handleDeleteAsset(asset)}
                            title="Delete file"
                            className="p-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/60 border border-red-500/30 text-red-400 cursor-pointer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: SITEMAP & RSS FEEDS */}
      {subTab === 'sitemap_rss' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-xs">
          {/* Sitemap Manager */}
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Map className="w-4 h-4 text-cyan-400" /> Sitemap Routes ({sitemapEntries.length})
              </h4>
              <a
                href="/sitemap.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-cyan-400 hover:underline font-mono flex items-center gap-1"
              >
                <span>/sitemap.xml</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <form onSubmit={handleAddSitemap} className="grid grid-cols-2 gap-2.5 p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
              <input
                type="text"
                placeholder="Path (e.g. /fleet)"
                value={newSitemap.path}
                onChange={(e) => setNewSitemap({ ...newSitemap, path: e.target.value })}
                className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
              />
              <input
                type="text"
                placeholder="Route Title"
                value={newSitemap.title}
                onChange={(e) => setNewSitemap({ ...newSitemap, title: e.target.value })}
                className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
              />
              <input
                type="text"
                placeholder="Description"
                value={newSitemap.description}
                onChange={(e) => setNewSitemap({ ...newSitemap, description: e.target.value })}
                className="col-span-2 px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
              />
              <select
                value={newSitemap.changeFreq}
                onChange={(e) => setNewSitemap({ ...newSitemap, changeFreq: e.target.value as any })}
                className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
              >
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
              <button
                type="submit"
                className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Route
              </button>
            </form>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {sitemapEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-cyan-400 font-bold">{entry.path}</span>
                      <span className="font-semibold text-white truncate">{entry.title}</span>
                    </div>
                    <p className="text-[11px] text-zinc-400 truncate">{entry.description}</p>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateSitemapEntry(entry.id, { isActive: !entry.isActive })}
                      className={`p-1.5 rounded-lg border cursor-pointer ${
                        entry.isActive
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                      }`}
                    >
                      {entry.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteSitemapEntry(entry.id)}
                      className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* RSS Feeds Manager */}
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <h4 className="font-heading font-bold text-base text-white flex items-center gap-2">
                <Rss className="w-4 h-4 text-amber-400" /> RSS Feed Articles ({rssFeedItems.length})
              </h4>
              <a
                href="/rss.xml"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-400 hover:underline font-mono flex items-center gap-1"
              >
                <span>/rss.xml</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <form onSubmit={handleAddRss} className="space-y-2.5 p-3.5 rounded-2xl bg-zinc-900/70 border border-zinc-800">
              <input
                type="text"
                placeholder="Headline Title"
                value={newRss.title}
                onChange={(e) => setNewRss({ ...newRss, title: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Target Tab (e.g. vehicles)"
                  value={newRss.linkTab}
                  onChange={(e) => setNewRss({ ...newRss, linkTab: e.target.value })}
                  className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white font-mono"
                />
                <input
                  type="text"
                  placeholder="Category"
                  value={newRss.category}
                  onChange={(e) => setNewRss({ ...newRss, category: e.target.value })}
                  className="px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
                />
              </div>
              <textarea
                rows={2}
                placeholder="RSS feed summary description..."
                value={newRss.description}
                onChange={(e) => setNewRss({ ...newRss, description: e.target.value })}
                className="w-full px-3 py-2 bg-zinc-950 border border-zinc-800 rounded-xl text-white"
              />
              <button
                type="submit"
                className="w-full py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold flex items-center justify-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Publish RSS Item
              </button>
            </form>

            <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
              {rssFeedItems.map((item) => (
                <div
                  key={item.id}
                  className="p-3 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <div className="font-semibold text-white truncate">{item.title}</div>
                    <div className="text-[10px] font-mono text-amber-400">
                      {item.category} • /{item.linkTab}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => updateRssFeedItem(item.id, { isPublished: !item.isPublished })}
                      className={`p-1.5 rounded-lg border cursor-pointer ${
                        item.isPublished
                          ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
                          : 'bg-zinc-800 border-zinc-700 text-zinc-500'
                      }`}
                    >
                      {item.isPublished ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteRssFeedItem(item.id)}
                      className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FAQS SLIDER CMS */}
      {subTab === 'faqs' && (
        <div className="space-y-6 text-xs">
          <form onSubmit={handleSaveFaq} className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h4 className="font-heading font-bold text-base text-white">
              {editingFaqId ? 'Edit FAQ Entry' : 'Add New FAQ to Slider'}
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <input
                type="text"
                placeholder="Category (e.g. Winnings & Shipping)"
                value={faqForm.category}
                onChange={(e) => setFaqForm({ ...faqForm, category: e.target.value })}
                className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
              />
              <input
                type="number"
                placeholder="Display Order"
                value={faqForm.order}
                onChange={(e) => setFaqForm({ ...faqForm, order: Number(e.target.value) })}
                className="px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-mono"
              />
              <label className="flex items-center gap-2 px-3 py-2 bg-zinc-900 border border-zinc-800 rounded-xl text-zinc-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={faqForm.isPublished}
                  onChange={(e) => setFaqForm({ ...faqForm, isPublished: e.target.checked })}
                  className="accent-red-600"
                />
                <span>Published Live in FAQ Slider</span>
              </label>
            </div>
            <input
              type="text"
              placeholder="FAQ Question*"
              value={faqForm.question}
              onChange={(e) => setFaqForm({ ...faqForm, question: e.target.value })}
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white font-semibold"
            />
            <textarea
              rows={3}
              placeholder="Comprehensive Answer*"
              value={faqForm.answer}
              onChange={(e) => setFaqForm({ ...faqForm, answer: e.target.value })}
              className="w-full px-3 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white"
            />
            <div className="flex gap-2 justify-end">
              {editingFaqId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditingFaqId(null);
                    setFaqForm({ category: 'General & Account', question: '', answer: '', order: faqsList.length + 1, isPublished: true });
                  }}
                  className="px-4 py-2 rounded-xl bg-zinc-800 text-zinc-300 font-bold cursor-pointer"
                >
                  Cancel Edit
                </button>
              )}
              <button
                type="submit"
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{editingFaqId ? 'Save FAQ Update' : 'Add FAQ Item'}</span>
              </button>
            </div>
          </form>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {faqsList.map((f) => (
              <div key={f.id} className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800 flex flex-col justify-between gap-3">
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded bg-zinc-900 border border-zinc-700 text-[10px] font-mono text-red-400">
                      #{f.order} • {f.category}
                    </span>
                    <span className={`text-[10px] font-mono font-bold ${f.isPublished ? 'text-emerald-400' : 'text-zinc-500'}`}>
                      {f.isPublished ? 'PUBLISHED' : 'HIDDEN'}
                    </span>
                  </div>
                  <h5 className="font-bold text-white text-sm">{f.question || f.q}</h5>
                  <p className="text-zinc-400 text-xs line-clamp-3">{f.answer || f.a}</p>
                </div>
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-zinc-900">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingFaqId(f.id);
                      setFaqForm({
                        category: f.category,
                        question: f.question || f.q || '',
                        answer: f.answer || f.a || '',
                        order: f.order || 1,
                        isPublished: f.isPublished !== false,
                      });
                    }}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3 h-3" /> Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => updateFaqItem(f.id, { isPublished: !f.isPublished })}
                    className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-300 cursor-pointer"
                  >
                    {f.isPublished ? 'Hide' : 'Publish'}
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteFaqItem(f.id)}
                    className="px-3 py-1.5 rounded-lg bg-red-950/50 hover:bg-red-900/50 border border-red-500/30 text-red-400 cursor-pointer"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <ImageLightbox
        isOpen={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        initialIndex={lightboxIndex}
      />
    </div>
  );
};
