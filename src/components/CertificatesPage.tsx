import React, { useState, useMemo } from 'react';
import {
  ShieldCheck,
  Search,
  Lock,
  Eye,
  FileCheck2,
  Building2,
  MapPin,
  Calendar,
  ArrowLeft,
  CheckCircle2,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BusinessCertificate, CertificateCategory } from '../types';
import {
  CertificateProtectedFrame,
  CertificateInspectModal,
} from './CertificateSecureViewer';

interface CertificatesPageProps {
  onNavigate?: (tab: string) => void;
}

const CERTIFICATE_CATEGORIES: Array<'All' | CertificateCategory> = [
  'All',
  'Business Operating License',
  'EV Dealership & Service Authority',
  'Fleet Investment & Custody',
  'Environmental & HV Safety',
];

export const CertificatesPage: React.FC<CertificatesPageProps> = ({ onNavigate }) => {
  const { businessCertificates, showToast } = useApp();
  const [selectedCategory, setSelectedCategory] = useState<'All' | CertificateCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectCert, setInspectCert] = useState<BusinessCertificate | null>(null);

  const publishedCertificates = useMemo(
    () =>
      [...businessCertificates]
        .filter((c) => c.isPublished)
        .sort((a, b) => a.order - b.order),
    [businessCertificates]
  );

  const filteredCertificates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return publishedCertificates.filter((cert) => {
      if (selectedCategory !== 'All' && cert.category !== selectedCategory) return false;
      if (q) {
        return (
          cert.title.toLowerCase().includes(q) ||
          cert.certificateNumber.toLowerCase().includes(q) ||
          cert.issuingAuthority.toLowerCase().includes(q) ||
          cert.legalEntityName.toLowerCase().includes(q) ||
          cert.jurisdiction.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [publishedCertificates, selectedCategory, searchQuery]);

  const activeCount = publishedCertificates.filter(
    (c) => c.status === 'Active & Verified' || c.status === 'Renewed'
  ).length;
  const distinctJurisdictions = new Set(publishedCertificates.map((c) => c.jurisdiction)).size;

  return (
    <div
      id="certificates"
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10"
      onContextMenu={(e) => {
        if ((e.target as HTMLElement)?.closest('[data-cert-protected="true"]')) {
          e.preventDefault();
        }
      }}
    >
      {/* Page Header */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 border-b border-zinc-800 pb-8">
        <div className="space-y-3 max-w-3xl">
          <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold">
            <ShieldCheck className="w-4 h-4 shrink-0" />
            <span>Official Corporate Compliance & Regulatory Registry</span>
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight [text-wrap:balance]">
            Business &amp; Operating License Certificates
          </h1>
          <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
            Verify Apex Tesla Hub LLC corporate formation standing, EV automotive dealership licensing, and commercial fleet service authorizations directly on this portal. All certificates are locked to protected on-site view mode.
          </p>
        </div>

        {onNavigate && (
          <button
            type="button"
            onClick={() => onNavigate('about')}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-xs font-semibold text-zinc-200 transition whitespace-nowrap shrink-0 self-start lg:self-auto cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Back to About Apex Hub</span>
          </button>
        )}
      </div>

      {/* Institutional Verification Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-mono text-zinc-500 block">Published Credentials</span>
          <div className="font-heading font-black text-2xl sm:text-3xl font-mono tabular-nums text-white">
            {publishedCertificates.length}
          </div>
          <span className="text-[11px] text-emerald-400 block font-mono tabular-nums">
            {activeCount} Active &amp; Verified
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-mono text-zinc-500 block">Jurisdictions Covered</span>
          <div className="font-heading font-black text-2xl sm:text-3xl font-mono tabular-nums text-white">
            {distinctJurisdictions}
          </div>
          <span className="text-[11px] text-zinc-400 block">Interstate &amp; Commercial</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-mono text-zinc-500 block">Document Access Mode</span>
          <div className="font-heading font-bold text-lg sm:text-xl text-amber-400 flex items-center gap-1.5">
            <Lock className="w-4 h-4 shrink-0" />
            <span>View-Only</span>
          </div>
          <span className="text-[11px] text-zinc-400 block">Download &amp; export disabled</span>
        </div>

        <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-800 space-y-1">
          <span className="text-[11px] font-mono text-zinc-500 block">Registry Standing</span>
          <div className="font-heading font-bold text-lg sm:text-xl text-emerald-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>In Good Standing</span>
          </div>
          <span className="text-[11px] text-zinc-400 block font-mono tabular-nums">
            Audited {publishedCertificates[0]?.updatedAt || '2026-11-12'}
          </span>
        </div>
      </div>

      {/* Category Filter Tabs + Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 flex-wrap" role="tablist" aria-label="Certificate categories">
          {CERTIFICATE_CATEGORIES.map((category) => {
            const isSelected = selectedCategory === category;
            return (
              <button
                key={category}
                type="button"
                role="tab"
                aria-selected={isSelected}
                onClick={() => setSelectedCategory(category)}
                className={`px-3.5 py-2 rounded-xl text-xs font-semibold transition whitespace-nowrap shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-zinc-100 text-zinc-950'
                    : 'bg-zinc-950 text-zinc-400 hover:text-white border border-zinc-800'
                }`}
              >
                {category}
              </button>
            );
          })}
        </div>

        <div className="relative w-full lg:w-80 shrink-0">
          <Search className="w-4 h-4 text-zinc-500 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search registration ID or authority..."
            aria-label="Search operating certificates"
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500/60"
          />
        </div>
      </div>

      {/* Certificate Showcase Dossiers */}
      {filteredCertificates.length === 0 ? (
        <div className="p-12 rounded-3xl bg-zinc-950 border border-zinc-800 text-center space-y-3">
          <FileCheck2 className="w-10 h-10 text-zinc-600 mx-auto" />
          <div className="space-y-1">
            <p className="text-sm font-bold text-white">No certificates match your filter</p>
            <p className="text-xs text-zinc-500">
              Reset your search query or switch category tabs to view all active operating licenses.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              setSelectedCategory('All');
              setSearchQuery('');
            }}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-white whitespace-nowrap cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Show All Certificates</span>
          </button>
        </div>
      ) : (
        <div className="space-y-8">
          {filteredCertificates.map((cert, index) => (
            <article
              key={cert.id}
              data-cert-protected="true"
              className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
            >
              {/* Protected Certificate Document Viewport */}
              <div className="lg:col-span-6">
                <CertificateProtectedFrame
                  certificate={cert}
                  onInspect={() => setInspectCert(cert)}
                />
              </div>

              {/* Verified Registry Metadata */}
              <div className="lg:col-span-6 space-y-5">
                <div className="space-y-2 border-b border-zinc-800 pb-4">
                  <div className="flex items-center gap-2 text-xs text-zinc-400">
                    <span className="font-mono font-semibold text-amber-400">
                      {String(index + 1).padStart(2, '0')}. {cert.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{cert.status}</span>
                    </span>
                  </div>
                  <h2 className="font-heading font-bold text-2xl text-white [text-wrap:balance]">
                    {cert.title}
                  </h2>
                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {cert.summary}
                  </p>
                </div>

                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-0.5">
                    <dt className="text-zinc-500 flex items-center gap-1.5">
                      <FileCheck2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Certificate / License No.</span>
                    </dt>
                    <dd className="font-mono font-bold text-white">{cert.certificateNumber}</dd>
                  </div>

                  <div className="space-y-0.5">
                    <dt className="text-zinc-500 flex items-center gap-1.5">
                      <Building2 className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Registered Legal Entity</span>
                    </dt>
                    <dd className="font-semibold text-zinc-200">{cert.legalEntityName}</dd>
                  </div>

                  <div className="space-y-0.5">
                    <dt className="text-zinc-500 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Issuing Authority</span>
                    </dt>
                    <dd className="font-medium text-zinc-200">{cert.issuingAuthority}</dd>
                  </div>

                  <div className="space-y-0.5">
                    <dt className="text-zinc-500 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Jurisdiction</span>
                    </dt>
                    <dd className="font-medium text-zinc-200">{cert.jurisdiction}</dd>
                  </div>

                  <div className="space-y-0.5 sm:col-span-2">
                    <dt className="text-zinc-500 flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                      <span>Validity Period</span>
                    </dt>
                    <dd className="font-mono tabular-nums text-zinc-200">
                      Issued {cert.issuedDate} · Valid through {cert.expiryDate}
                    </dd>
                  </div>
                </dl>

                <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-zinc-800/80">
                  <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-400">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Protected View-Only · Non-Downloadable</span>
                  </div>

                  <button
                    type="button"
                    onClick={() => setInspectCert(cert)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs transition whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 shrink-0" />
                    <span>Inspect Document</span>
                  </button>
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Zoomable View-Only Lightbox */}
      <CertificateInspectModal
        certificate={inspectCert}
        onClose={() => setInspectCert(null)}
        onProtectedNotice={(msg) => showToast(msg, 'info')}
      />
    </div>
  );
};
