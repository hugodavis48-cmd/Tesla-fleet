import React, { useState, useRef } from 'react';
import {
  Award,
  Plus,
  Edit3,
  Trash2,
  Upload,
  CheckCircle2,
  Eye,
  EyeOff,
  Lock,
  ArrowUp,
  ArrowDown,
  Save,
  RotateCcw,
  FileCheck2,
  Search,
  RefreshCw,
  Image as ImageIcon,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  BusinessCertificate,
  CertificateCategory,
  CertificateVerificationStatus,
} from '../types';
import {
  CertificateProtectedFrame,
  CertificateInspectModal,
} from './CertificateSecureViewer';

const CATEGORY_OPTIONS: CertificateCategory[] = [
  'Business Operating License',
  'EV Dealership & Service Authority',
  'Fleet Investment & Custody',
  'Environmental & HV Safety',
];

const STATUS_OPTIONS: CertificateVerificationStatus[] = [
  'Active & Verified',
  'Renewed',
  'Pending Audit',
  'Archived',
];

const PRESET_TEMPLATES = [
  {
    label: 'Corporate Formation Seal',
    url: '/cert-business-operating.jpg',
  },
  {
    label: 'Master EV Automotive License',
    url: '/cert-ev-license.jpg',
  },
];

type CertificateFormState = Omit<BusinessCertificate, 'id' | 'updatedAt'>;

const buildEmptyForm = (nextOrder: number): CertificateFormState => ({
  title: '',
  certificateNumber: '',
  category: 'Business Operating License',
  issuingAuthority: '',
  legalEntityName: 'Apex Tesla Hub LLC',
  jurisdiction: 'State of California, United States',
  issuedDate: new Date().toISOString().split('T')[0],
  expiryDate: '2029-12-31',
  status: 'Active & Verified',
  summary: '',
  imageUrl: '/cert-business-operating.jpg',
  watermarkCode: 'VIEW ONLY · OFFICIAL VERIFICATION',
  isPublished: true,
  displayOnAbout: true,
  order: nextOrder,
});

export const AdminCertificatesManager: React.FC = () => {
  const {
    businessCertificates,
    createBusinessCertificate,
    updateBusinessCertificate,
    deleteBusinessCertificate,
    reorderBusinessCertificate,
    resetBusinessCertificates,
    saveBusinessCertificatesNow,
    showToast,
  } = useApp();

  const sortedCertificates = [...businessCertificates].sort((a, b) => a.order - b.order);

  const [editingId, setEditingId] = useState<string | null>(
    sortedCertificates[0]?.id || null
  );
  const [form, setForm] = useState<CertificateFormState>(() =>
    sortedCertificates[0]
      ? {
          title: sortedCertificates[0].title,
          certificateNumber: sortedCertificates[0].certificateNumber,
          category: sortedCertificates[0].category,
          issuingAuthority: sortedCertificates[0].issuingAuthority,
          legalEntityName: sortedCertificates[0].legalEntityName,
          jurisdiction: sortedCertificates[0].jurisdiction,
          issuedDate: sortedCertificates[0].issuedDate,
          expiryDate: sortedCertificates[0].expiryDate,
          status: sortedCertificates[0].status,
          summary: sortedCertificates[0].summary,
          imageUrl: sortedCertificates[0].imageUrl,
          watermarkCode: sortedCertificates[0].watermarkCode,
          isPublished: sortedCertificates[0].isPublished,
          displayOnAbout: sortedCertificates[0].displayOnAbout,
          order: sortedCertificates[0].order,
        }
      : buildEmptyForm(sortedCertificates.length + 1)
  );

  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadingRowId, setUploadingRowId] = useState<string | null>(null);
  const [isSavingAll, setIsSavingAll] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [confirmReset, setConfirmReset] = useState(false);
  const [inspectCert, setInspectCert] = useState<BusinessCertificate | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const selectForEdit = (cert: BusinessCertificate) => {
    setEditingId(cert.id);
    setForm({
      title: cert.title,
      certificateNumber: cert.certificateNumber,
      category: cert.category,
      issuingAuthority: cert.issuingAuthority,
      legalEntityName: cert.legalEntityName,
      jurisdiction: cert.jurisdiction,
      issuedDate: cert.issuedDate,
      expiryDate: cert.expiryDate,
      status: cert.status,
      summary: cert.summary,
      imageUrl: cert.imageUrl,
      watermarkCode: cert.watermarkCode,
      isPublished: cert.isPublished,
      displayOnAbout: cert.displayOnAbout,
      order: cert.order,
    });
  };

  const startNewCertificate = () => {
    setEditingId(null);
    setForm(buildEmptyForm(sortedCertificates.length + 1));
  };

  const fileToDataUrl = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(new Error('Failed to read image file.'));
      reader.readAsDataURL(file);
    });

  const uploadCertificateFile = async (file: File): Promise<string> => {
    if (!file.type.match(/^image\/(jpeg|jpg|png|webp)$/i)) {
      throw new Error('Please upload a JPG, PNG, or WEBP certificate image.');
    }
    if (file.size > 8 * 1024 * 1024) {
      throw new Error('Certificate image file must be under 8 MB.');
    }

    const dataUrl = await fileToDataUrl(file);
    try {
      const res = await fetch('/api/media/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: `cert_${file.name}`,
          dataUrl,
        }),
      });
      if (res.ok) {
        const json = await res.json();
        if (json?.url) return json.url as string;
      }
    } catch {
      // fallback to embedded dataUrl below
    }
    return dataUrl;
  };

  const handleEditorImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setIsUploadingImage(true);
    try {
      const url = await uploadCertificateFile(file);
      setForm((prev) => ({ ...prev, imageUrl: url }));
      showToast('Certificate image uploaded cleanly! Click Save to persist changes.', 'success');
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || 'Could not upload certificate image.', 'error');
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleRowReplaceImage = async (
    e: React.ChangeEvent<HTMLInputElement>,
    cert: BusinessCertificate
  ) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploadingRowId(cert.id);
    try {
      const url = await uploadCertificateFile(file);
      updateBusinessCertificate(cert.id, { imageUrl: url });
      if (editingId === cert.id) {
        setForm((prev) => ({ ...prev, imageUrl: url }));
      }
    } catch (err: unknown) {
      const error = err as Error;
      showToast(error.message || 'Image replacement failed.', 'error');
    } finally {
      setUploadingRowId(null);
    }
  };

  const handleSaveForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title.trim() || !form.certificateNumber.trim() || !form.issuingAuthority.trim()) {
      showToast('Title, registration number, and issuing authority are required.', 'error');
      return;
    }

    const cleanForm: CertificateFormState = {
      ...form,
      title: form.title.trim(),
      certificateNumber: form.certificateNumber.trim().toUpperCase(),
      issuingAuthority: form.issuingAuthority.trim(),
      legalEntityName: form.legalEntityName.trim() || 'Apex Tesla Hub LLC',
      jurisdiction: form.jurisdiction.trim() || 'United States',
      summary:
        form.summary.trim() ||
        'Verified corporate operating authorization maintained in protected view-only registry.',
      watermarkCode:
        form.watermarkCode.trim() || `VIEW ONLY · ${form.certificateNumber.trim().toUpperCase()}`,
    };

    if (editingId) {
      updateBusinessCertificate(editingId, cleanForm);
    } else {
      const created = createBusinessCertificate(cleanForm);
      setEditingId(created.id);
    }
  };

  const handlePersistAllNow = async () => {
    setIsSavingAll(true);
    const ok = await saveBusinessCertificatesNow();
    setIsSavingAll(false);
    showToast(
      ok
        ? `All ${businessCertificates.length} certificates saved and synchronized to server registry.`
        : 'Saved locally in browser state.',
      ok ? 'success' : 'info'
    );
  };

  const previewRecord: BusinessCertificate = {
    id: editingId || 'preview-draft',
    ...form,
    title: form.title || 'Untitled Certificate Document',
    certificateNumber: form.certificateNumber || 'PENDING-ID',
    updatedAt: new Date().toISOString().split('T')[0],
  };

  const visibleList = sortedCertificates.filter((cert) => {
    if (!searchTerm.trim()) return true;
    const q = searchTerm.trim().toLowerCase();
    return (
      cert.title.toLowerCase().includes(q) ||
      cert.certificateNumber.toLowerCase().includes(q) ||
      cert.issuingAuthority.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-6">
      {/* Header Toolbar */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold">
            <Award className="w-4 h-4 shrink-0" />
            <span>Business Licenses &amp; Regulatory Credentials Studio</span>
          </div>
          <h3 className="font-heading font-bold text-2xl text-white">
            Certificates &amp; Operating License Manager
          </h3>
          <p className="text-xs text-zinc-400">
            Upload, edit, reorder, and publish official business &amp; operating license images. Published certificates display on About &amp; Certificates pages in non-downloadable view-only mode.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <button
            type="button"
            onClick={startNewCertificate}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-white transition whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>New Certificate</span>
          </button>

          <button
            type="button"
            onClick={handlePersistAllNow}
            disabled={isSavingAll}
            className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white transition whitespace-nowrap cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4 shrink-0" />
            <span>{isSavingAll ? 'Saving...' : 'Save Registry'}</span>
          </button>

          {confirmReset ? (
            <div className="inline-flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => {
                  resetBusinessCertificates();
                  setConfirmReset(false);
                }}
                className="px-3 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-bold text-white whitespace-nowrap cursor-pointer"
              >
                Confirm Reset
              </button>
              <button
                type="button"
                onClick={() => setConfirmReset(false)}
                className="px-3 py-2 rounded-xl bg-zinc-800 text-xs font-semibold text-zinc-300 whitespace-nowrap cursor-pointer"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => setConfirmReset(true)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-300 transition whitespace-nowrap cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 shrink-0" />
              <span>Restore Defaults</span>
            </button>
          )}
        </div>
      </div>

      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
          <span className="text-[11px] font-mono text-zinc-500 block">Total Certificates</span>
          <span className="font-heading font-black text-2xl font-mono tabular-nums text-white">
            {businessCertificates.length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
          <span className="text-[11px] font-mono text-zinc-500 block">Live on Certificates Page</span>
          <span className="font-heading font-black text-2xl font-mono tabular-nums text-emerald-400">
            {businessCertificates.filter((c) => c.isPublished).length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
          <span className="text-[11px] font-mono text-zinc-500 block">Featured on About Page</span>
          <span className="font-heading font-black text-2xl font-mono tabular-nums text-cyan-400">
            {businessCertificates.filter((c) => c.isPublished && c.displayOnAbout).length}
          </span>
        </div>
        <div className="p-4 rounded-2xl bg-zinc-950 border border-zinc-800">
          <span className="text-[11px] font-mono text-zinc-500 block">Protection Enforcement</span>
          <span className="font-heading font-bold text-base text-amber-400 flex items-center gap-1.5 mt-1">
            <Lock className="w-4 h-4 shrink-0" />
            <span>View-Only Enforced</span>
          </span>
        </div>
      </div>

      {/* Create / Edit Studio + Live Protected Preview */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
        {/* Left 7 Cols: Structured Editor Form */}
        <form
          onSubmit={handleSaveForm}
          className="xl:col-span-7 p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5"
        >
          <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
            <div>
              <h4 className="font-heading font-bold text-lg text-white">
                {editingId ? 'Edit Existing Certificate' : 'Upload & Publish New Certificate'}
              </h4>
              <p className="text-xs text-zinc-400">
                Upload a scanned license image (JPG/PNG/WEBP) or adjust corporate registration details
              </p>
            </div>
            {editingId && (
              <span className="text-[11px] font-mono text-amber-400">Editing #{editingId}</span>
            )}
          </div>

          {/* Image Upload & Template Picker */}
          <div className="space-y-3 p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <label className="text-xs font-semibold text-white flex items-center gap-1.5">
                <ImageIcon className="w-4 h-4 text-emerald-400" />
                <span>Certificate Document Image</span>
              </label>

              <div className="flex flex-wrap items-center gap-1.5">
                {PRESET_TEMPLATES.map((tpl) => (
                  <button
                    key={tpl.url}
                    type="button"
                    onClick={() => setForm((prev) => ({ ...prev, imageUrl: tpl.url }))}
                    className={`px-2.5 py-1 rounded-lg text-[11px] font-medium border transition cursor-pointer ${
                      form.imageUrl === tpl.url
                        ? 'bg-emerald-950/60 border-emerald-500/50 text-emerald-300'
                        : 'bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {tpl.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/jpg,image/png,image/webp"
                onChange={handleEditorImageUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploadingImage}
                className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs transition whitespace-nowrap shrink-0 cursor-pointer disabled:opacity-50"
              >
                {isUploadingImage ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin shrink-0" />
                    <span>Uploading...</span>
                  </>
                ) : (
                  <>
                    <Upload className="w-3.5 h-3.5 shrink-0" />
                    <span>Upload Image File</span>
                  </>
                )}
              </button>

              <input
                type="text"
                value={form.imageUrl}
                onChange={(e) => setForm((prev) => ({ ...prev, imageUrl: e.target.value }))}
                placeholder="/uploads/certificate.jpg or https://..."
                aria-label="Certificate Image URL"
                className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-xs font-mono text-zinc-200 placeholder-zinc-600 focus:outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="sm:col-span-2">
              <label className="text-zinc-400 block mb-1.5 font-medium">Certificate Document Title</label>
              <input
                type="text"
                required
                value={form.title}
                onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
                placeholder="e.g. Certificate of Formation & Operating Authority"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1.5 font-medium">Registration / License Number</label>
              <input
                type="text"
                required
                value={form.certificateNumber}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, certificateNumber: e.target.value.toUpperCase() }))
                }
                placeholder="e.g. CAL-23-0987654"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1.5 font-medium">License Category</label>
              <select
                value={form.category}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, category: e.target.value as CertificateCategory }))
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/60"
              >
                {CATEGORY_OPTIONS.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-zinc-400 block mb-1.5 font-medium">Registered Legal Entity</label>
              <input
                type="text"
                value={form.legalEntityName}
                onChange={(e) => setForm((prev) => ({ ...prev, legalEntityName: e.target.value }))}
                placeholder="Apex Tesla Hub LLC"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1.5 font-medium">Verification Status</label>
              <select
                value={form.status}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    status: e.target.value as CertificateVerificationStatus,
                  }))
                }
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/60"
              >
                {STATUS_OPTIONS.map((st) => (
                  <option key={st} value={st}>
                    {st}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-zinc-400 block mb-1.5 font-medium">Issuing Authority</label>
              <input
                type="text"
                required
                value={form.issuingAuthority}
                onChange={(e) => setForm((prev) => ({ ...prev, issuingAuthority: e.target.value }))}
                placeholder="Secretary of State / DMV Regulation Division"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1.5 font-medium">Operating Jurisdiction</label>
              <input
                type="text"
                value={form.jurisdiction}
                onChange={(e) => setForm((prev) => ({ ...prev, jurisdiction: e.target.value }))}
                placeholder="State of California, United States"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1.5 font-medium">Issue Date</label>
              <input
                type="date"
                value={form.issuedDate}
                onChange={(e) => setForm((prev) => ({ ...prev, issuedDate: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div>
              <label className="text-zinc-400 block mb-1.5 font-medium">Expiry / Renewal Date</label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={(e) => setForm((prev) => ({ ...prev, expiryDate: e.target.value }))}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white font-mono focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-zinc-400 block mb-1.5 font-medium">View-Only Security Watermark Stamp</label>
              <input
                type="text"
                value={form.watermarkCode}
                onChange={(e) => setForm((prev) => ({ ...prev, watermarkCode: e.target.value }))}
                placeholder="VIEW ONLY · REG-NO · ENTITY NAME"
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-amber-300 font-mono focus:outline-none focus:border-emerald-500/60"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-zinc-400 block mb-1.5 font-medium">Authorized Operational Scope Summary</label>
              <textarea
                rows={3}
                value={form.summary}
                onChange={(e) => setForm((prev) => ({ ...prev, summary: e.target.value }))}
                placeholder="Describe commercial operating authorizations, service capabilities, and compliance scope..."
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-3.5 py-2.5 text-white focus:outline-none focus:border-emerald-500/60"
              />
            </div>
          </div>

          {/* Placement Visibility Toggles */}
          <div className="flex flex-wrap items-center gap-6 pt-2 border-t border-zinc-800 text-xs">
            <label className="inline-flex items-center gap-2 text-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={form.isPublished}
                onChange={(e) => setForm((prev) => ({ ...prev, isPublished: e.target.checked }))}
                className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
              />
              <span>Publish on Certificates Page</span>
            </label>

            <label className="inline-flex items-center gap-2 text-zinc-200 cursor-pointer">
              <input
                type="checkbox"
                checked={form.displayOnAbout}
                onChange={(e) => setForm((prev) => ({ ...prev, displayOnAbout: e.target.checked }))}
                className="rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500"
              />
              <span>Display on About Page</span>
            </label>
          </div>

          <div className="flex flex-wrap items-center justify-end gap-3 pt-2">
            {editingId && (
              <button
                type="button"
                onClick={startNewCertificate}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 cursor-pointer"
              >
                Create New Instead
              </button>
            )}
            <button
              type="submit"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 shrink-0" />
              <span>{editingId ? 'Save Certificate Changes' : 'Create & Save Certificate'}</span>
            </button>
          </div>
        </form>

        {/* Right 5 Cols: Live Protected View-Only Preview */}
        <div className="xl:col-span-5 p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <div>
              <h4 className="font-heading font-bold text-base text-white">Live Protected Preview</h4>
              <p className="text-[11px] text-zinc-400">Exactly as visitors see it (downloads disabled)</p>
            </div>
            <button
              type="button"
              onClick={() => setInspectCert(previewRecord)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 cursor-pointer"
            >
              <Eye className="w-3.5 h-3.5 text-emerald-400" />
              <span>Zoom Inspect</span>
            </button>
          </div>

          <CertificateProtectedFrame
            certificate={previewRecord}
            onInspect={() => setInspectCert(previewRecord)}
          />

          <div className="space-y-1.5 pt-2 text-xs">
            <div className="flex items-center justify-between gap-2 text-zinc-400">
              <span>{previewRecord.category}</span>
              <span className="font-mono text-emerald-400 font-semibold">{previewRecord.status}</span>
            </div>
            <p className="font-heading font-bold text-base text-white">{previewRecord.title}</p>
            <p className="text-zinc-400 font-mono text-[11px]">
              {previewRecord.certificateNumber} · {previewRecord.issuingAuthority || 'Issuing Authority'}
            </p>
          </div>
        </div>
      </div>

      {/* Existing Certificates Management Directory */}
      <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-800 pb-4">
          <div>
            <h4 className="font-heading font-bold text-lg text-white">
              Managed Certificates Directory ({sortedCertificates.length})
            </h4>
            <p className="text-xs text-zinc-400">
              Quickly replace images, reorder display sequence, or toggle About &amp; Certificates page visibility
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Filter by title or license no..."
              aria-label="Filter managed certificates"
              className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
            />
          </div>
        </div>

        <div className="divide-y divide-zinc-800/80">
          {visibleList.map((cert, idx) => {
            const isSelected = editingId === cert.id;
            const replaceInputId = `replace-cert-img-${cert.id}`;

            return (
              <div
                key={cert.id}
                className={`py-4 px-3 rounded-2xl flex flex-col lg:flex-row lg:items-center justify-between gap-4 transition-colors ${
                  isSelected ? 'bg-zinc-900/80' : 'hover:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-start sm:items-center gap-4 min-w-0 flex-1">
                  <img
                    src={cert.imageUrl}
                    alt={cert.title}
                    referrerPolicy="no-referrer"
                    className="w-24 h-18 rounded-xl object-cover border border-zinc-700 shrink-0 bg-zinc-900"
                  />

                  <div className="min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="font-mono font-bold text-zinc-400">
                        #{String(cert.order).padStart(2, '0')}
                      </span>
                      <span className="font-heading font-bold text-sm text-white truncate">
                        {cert.title}
                      </span>
                      <span className="text-[11px] font-mono text-emerald-400 font-semibold">
                        {cert.status}
                      </span>
                    </div>

                    <div className="text-[11px] text-zinc-400 font-mono flex flex-wrap items-center gap-x-3 gap-y-0.5">
                      <span>{cert.certificateNumber}</span>
                      <span>·</span>
                      <span>{cert.category}</span>
                      <span>·</span>
                      <span>
                        {cert.issuedDate} → {cert.expiryDate}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 pt-0.5 text-[11px]">
                      <span className={cert.isPublished ? 'text-emerald-400' : 'text-zinc-500'}>
                        {cert.isPublished ? 'Certificates Page: Live' : 'Certificates Page: Hidden'}
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className={cert.displayOnAbout ? 'text-cyan-400' : 'text-zinc-500'}>
                        {cert.displayOnAbout ? 'About Page: Featured' : 'About Page: Hidden'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Action Controls */}
                <div className="flex flex-wrap items-center gap-1.5 shrink-0">
                  <button
                    type="button"
                    onClick={() => reorderBusinessCertificate(cert.id, 'up')}
                    disabled={idx === 0}
                    title="Move Up"
                    aria-label={`Move ${cert.title} up`}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => reorderBusinessCertificate(cert.id, 'down')}
                    disabled={idx === visibleList.length - 1}
                    title="Move Down"
                    aria-label={`Move ${cert.title} down`}
                    className="p-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 disabled:opacity-35 cursor-pointer"
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                  </button>

                  <input
                    id={replaceInputId}
                    type="file"
                    accept="image/jpeg,image/jpg,image/png,image/webp"
                    onChange={(e) => handleRowReplaceImage(e, cert)}
                    className="hidden"
                  />
                  <label
                    htmlFor={replaceInputId}
                    className="inline-flex items-center gap-1.5 px-3 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-zinc-200 cursor-pointer whitespace-nowrap"
                  >
                    <Upload className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span>{uploadingRowId === cert.id ? 'Uploading...' : 'Replace Image'}</span>
                  </label>

                  <button
                    type="button"
                    onClick={() =>
                      updateBusinessCertificate(cert.id, { isPublished: !cert.isPublished })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 cursor-pointer whitespace-nowrap"
                  >
                    {cert.isPublished ? (
                      <Eye className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <EyeOff className="w-3.5 h-3.5 text-zinc-500" />
                    )}
                    <span>{cert.isPublished ? 'Published' : 'Draft'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      updateBusinessCertificate(cert.id, { displayOnAbout: !cert.displayOnAbout })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-2 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-medium text-zinc-300 cursor-pointer whitespace-nowrap"
                  >
                    <FileCheck2
                      className={`w-3.5 h-3.5 ${cert.displayOnAbout ? 'text-cyan-400' : 'text-zinc-500'}`}
                    />
                    <span>About</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => selectForEdit(cert)}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-950 text-xs font-bold cursor-pointer whitespace-nowrap"
                  >
                    <Edit3 className="w-3.5 h-3.5 shrink-0" />
                    <span>Edit</span>
                  </button>

                  {confirmDeleteId === cert.id ? (
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => {
                          deleteBusinessCertificate(cert.id);
                          if (editingId === cert.id) startNewCertificate();
                          setConfirmDeleteId(null);
                        }}
                        className="px-2.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold cursor-pointer"
                      >
                        Confirm
                      </button>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteId(null)}
                        className="px-2.5 py-2 rounded-lg bg-zinc-800 text-zinc-300 text-xs font-semibold cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteId(cert.id)}
                      aria-label={`Delete ${cert.title}`}
                      className="p-2 rounded-lg bg-zinc-900 hover:bg-rose-950/60 border border-zinc-800 hover:border-rose-500/40 text-zinc-400 hover:text-rose-400 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Zoom Lightbox for Preview */}
      <CertificateInspectModal
        certificate={inspectCert}
        onClose={() => setInspectCert(null)}
        onProtectedNotice={(msg) => showToast(msg, 'info')}
      />
    </div>
  );
};
