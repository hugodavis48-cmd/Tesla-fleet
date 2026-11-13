import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Eye,
  X,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Award,
  Building2,
  Calendar,
  MapPin,
  FileCheck2,
  CheckCircle2,
} from 'lucide-react';
import { BusinessCertificate } from '../types';

interface CertificateProtectedFrameProps {
  certificate: BusinessCertificate;
  className?: string;
  aspectClass?: string;
  onInspect?: () => void;
  showInspectOverlay?: boolean;
}

export const CertificateProtectedFrame: React.FC<CertificateProtectedFrameProps> = ({
  certificate,
  className = '',
  aspectClass = 'aspect-[4/3]',
  onInspect,
  showInspectOverlay = true,
}) => {
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setImgFailed(false);
  }, [certificate.imageUrl]);

  const preventSave = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  return (
    <div
      onContextMenu={preventSave}
      onDragStart={preventSave}
      className={`group relative overflow-hidden rounded-2xl bg-zinc-900 border border-zinc-800 select-none print:hidden ${aspectClass} ${className}`}
      style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
    >
      {!imgFailed && certificate.imageUrl ? (
        <img
          src={certificate.imageUrl}
          alt={`${certificate.title} — View-Only Official Certificate`}
          draggable={false}
          referrerPolicy="no-referrer"
          onContextMenu={preventSave}
          onDragStart={preventSave}
          onError={() => setImgFailed(true)}
          className="w-full h-full object-cover pointer-events-none select-none transition-transform duration-500 group-hover:scale-[1.02]"
          style={{ WebkitUserSelect: 'none', userSelect: 'none' }}
        />
      ) : (
        <div className="w-full h-full flex flex-col items-center justify-center p-6 text-center bg-gradient-to-br from-zinc-900 via-zinc-950 to-black space-y-2.5">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award className="w-6 h-6" />
          </div>
          <p className="font-heading font-bold text-sm text-white max-w-xs">{certificate.title}</p>
          <p className="text-[11px] font-mono text-zinc-400">{certificate.certificateNumber}</p>
        </div>
      )}

      {/* Subtle Anti-Save Scrim + Diagonal View-Only Watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-black/25"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 flex items-center justify-center overflow-hidden opacity-25"
      >
        <div className="-rotate-12 whitespace-nowrap text-[10px] sm:text-xs font-mono font-bold tracking-[0.22em] text-amber-200/80 uppercase px-4 py-1 border border-amber-300/30 bg-black/30 rounded">
          {certificate.watermarkCode || `VIEW ONLY · ${certificate.certificateNumber}`}
        </div>
      </div>

      {/* Transparent Protective Interaction Shield (blocks right-click image save & direct drag) */}
      <div
        onContextMenu={preventSave}
        onDragStart={preventSave}
        onClick={onInspect}
        role={onInspect ? 'button' : undefined}
        tabIndex={onInspect ? 0 : undefined}
        onKeyDown={
          onInspect
            ? (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  onInspect();
                }
              }
            : undefined
        }
        aria-label={onInspect ? `Inspect ${certificate.title} in view-only mode` : undefined}
        className={`absolute inset-0 z-10 ${onInspect ? 'cursor-pointer' : 'cursor-default'}`}
      />

      {/* Bottom View-Only Protection Strip */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 z-20 p-3 sm:p-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-200 bg-black/70 backdrop-blur-sm border border-zinc-700/70 px-2.5 py-1 rounded-lg">
          <Lock className="w-3 h-3 text-amber-400 shrink-0" />
          <span className="truncate">View-Only Protected</span>
        </div>
        {showInspectOverlay && onInspect && (
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-white bg-zinc-900/90 border border-zinc-700 px-3 py-1 rounded-lg shadow-lg">
            <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
            <span className="whitespace-nowrap">Inspect</span>
          </div>
        )}
      </div>
    </div>
  );
};

interface CertificateInspectModalProps {
  certificate: BusinessCertificate | null;
  onClose: () => void;
  onProtectedNotice?: (message: string) => void;
}

export const CertificateInspectModal: React.FC<CertificateInspectModalProps> = ({
  certificate,
  onClose,
  onProtectedNotice,
}) => {
  const [zoom, setZoom] = useState<1 | 1.35 | 1.75>(1);
  const [imgFailed, setImgFailed] = useState(false);

  useEffect(() => {
    setZoom(1);
    setImgFailed(false);
  }, [certificate?.id]);

  useEffect(() => {
    if (!certificate) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 's' || e.key.toLowerCase() === 'p')) {
        e.preventDefault();
        e.stopPropagation();
        onProtectedNotice?.('View-only document: Downloading and printing certificates are disabled.');
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [certificate, onClose, onProtectedNotice]);

  if (!certificate) return null;

  const preventSave = (e: React.SyntheticEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onProtectedNotice?.('Protected certificate image: Right-click save and downloads are disabled.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md print:hidden"
      onContextMenu={preventSave}
    >
      <div className="relative w-full max-w-6xl max-h-[92vh] overflow-y-auto rounded-3xl bg-zinc-950 border border-zinc-800 shadow-2xl flex flex-col">
        {/* Top Modal Header */}
        <div className="sticky top-0 z-30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-6 py-4 bg-zinc-950/95 backdrop-blur-md border-b border-zinc-800">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-xs font-mono text-amber-400">
              <Lock className="w-3.5 h-3.5 shrink-0" />
              <span>Protected View-Only Inspection · Downloads Disabled</span>
            </div>
            <h3 className="font-heading font-bold text-base sm:text-lg text-white truncate">
              {certificate.title}
            </h3>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="inline-flex items-center gap-1 p-1 rounded-xl bg-zinc-900 border border-zinc-800">
              <button
                type="button"
                onClick={() => setZoom((z) => (z === 1.75 ? 1.35 : 1))}
                disabled={zoom === 1}
                aria-label="Zoom out certificate"
                className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-2 text-xs font-mono tabular-nums text-zinc-300">
                {Math.round(zoom * 100)}%
              </span>
              <button
                type="button"
                onClick={() => setZoom((z) => (z === 1 ? 1.35 : 1.75))}
                disabled={zoom === 1.75}
                aria-label="Zoom in certificate"
                className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
              {zoom !== 1 && (
                <button
                  type="button"
                  onClick={() => setZoom(1)}
                  aria-label="Reset zoom"
                  className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 cursor-pointer"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <button
              type="button"
              onClick={onClose}
              aria-label="Close inspection viewer"
              className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Split Inspection Content: Shielded Document + Registry Verification Dossier */}
        <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left 8 Cols: Zoomable Non-Downloadable Certificate Viewport */}
          <div className="lg:col-span-8 space-y-3">
            <div
              onContextMenu={preventSave}
              onDragStart={preventSave}
              className="relative overflow-auto max-h-[68vh] rounded-2xl bg-black border border-zinc-800 select-none"
              style={{ WebkitTouchCallout: 'none', userSelect: 'none' }}
            >
              <div
                className="relative transition-transform duration-200 origin-top-left"
                style={{ width: `${zoom * 100}%` }}
              >
                {!imgFailed && certificate.imageUrl ? (
                  <img
                    src={certificate.imageUrl}
                    alt={`${certificate.title} — Protected Certificate Preview`}
                    draggable={false}
                    referrerPolicy="no-referrer"
                    onContextMenu={preventSave}
                    onDragStart={preventSave}
                    onError={() => setImgFailed(true)}
                    className="w-full h-auto block pointer-events-none select-none"
                  />
                ) : (
                  <div className="aspect-[4/3] w-full flex flex-col items-center justify-center p-10 text-center space-y-3 bg-zinc-950">
                    <Award className="w-12 h-12 text-amber-400" />
                    <p className="font-heading font-bold text-lg text-white">{certificate.title}</p>
                    <p className="text-xs font-mono text-zinc-400">{certificate.certificateNumber}</p>
                  </div>
                )}

                {/* Transparent Anti-Save Overlay + Repeated Watermark Grid */}
                <div
                  onContextMenu={preventSave}
                  onDragStart={preventSave}
                  className="absolute inset-0 z-20 flex flex-col items-center justify-center pointer-events-auto"
                >
                  <div className="-rotate-12 px-5 py-2 rounded-lg border border-amber-300/25 bg-black/25 text-amber-200/60 font-mono text-xs sm:text-sm tracking-[0.22em] uppercase pointer-events-none select-none text-center">
                    {certificate.watermarkCode || `VIEW ONLY · ${certificate.certificateNumber}`}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-2 text-[11px] text-zinc-400 font-mono">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>On-site digital verification only · File export & download blocked</span>
              </span>
              <span>Record ID: {certificate.certificateNumber}</span>
            </div>
          </div>

          {/* Right 4 Cols: Institutional Verification Dossier */}
          <div className="lg:col-span-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 p-5 space-y-5">
            <div className="space-y-2 border-b border-zinc-800 pb-4">
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>{certificate.status}</span>
              </div>
              <h4 className="font-heading font-bold text-base text-white">{certificate.category}</h4>
              <p className="text-xs text-zinc-400 leading-relaxed">{certificate.summary}</p>
            </div>

            <dl className="space-y-3.5 text-xs">
              <div className="flex items-start gap-2.5">
                <FileCheck2 className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <dt className="text-zinc-500">Registration Number</dt>
                  <dd className="font-mono font-bold text-white">{certificate.certificateNumber}</dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Building2 className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <dt className="text-zinc-500">Registered Legal Entity</dt>
                  <dd className="font-semibold text-zinc-200">{certificate.legalEntityName}</dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <dt className="text-zinc-500">Issuing Authority</dt>
                  <dd className="font-medium text-zinc-200">{certificate.issuingAuthority}</dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <dt className="text-zinc-500">Operating Jurisdiction</dt>
                  <dd className="font-medium text-zinc-200">{certificate.jurisdiction}</dd>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <Calendar className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
                <div className="min-w-0">
                  <dt className="text-zinc-500">Effective Validity Period</dt>
                  <dd className="font-mono tabular-nums text-zinc-200">
                    {certificate.issuedDate} — {certificate.expiryDate}
                  </dd>
                </div>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
};
