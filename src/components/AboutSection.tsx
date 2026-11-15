import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  Award,
  Zap,
  Wrench,
  Lock,
  Eye,
  ArrowRight,
  FileCheck2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Pause,
  Play,
  Building2,
  MapPin,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { BusinessCertificate } from '../types';
import {
  CertificateProtectedFrame,
  CertificateInspectModal,
} from './CertificateSecureViewer';

interface AboutSectionProps {
  onNavigateToCertificates?: () => void;
}

export const AboutSection: React.FC<AboutSectionProps> = ({ onNavigateToCertificates }) => {
  const { businessCertificates, showToast } = useApp();
  const [inspectCert, setInspectCert] = useState<BusinessCertificate | null>(null);
  const [activeSlideIndex, setActiveSlideIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<'next' | 'prev'>('next');
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isHovered, setIsHovered] = useState(false);
  const touchStartXRef = useRef<number | null>(null);

  const featuredCertificates = useMemo(() => {
    const published = [...businessCertificates]
      .filter((c) => c.isPublished)
      .sort((a, b) => a.order - b.order);
    const featured = published.filter((c) => c.displayOnAbout);
    return featured.length > 0 ? featured : published;
  }, [businessCertificates]);

  useEffect(() => {
    if (activeSlideIndex >= featuredCertificates.length && featuredCertificates.length > 0) {
      setActiveSlideIndex(0);
    }
  }, [activeSlideIndex, featuredCertificates.length]);

  useEffect(() => {
    if (!isAutoPlaying || isHovered || Boolean(inspectCert) || featuredCertificates.length <= 1) {
      return;
    }
    const timer = window.setInterval(() => {
      setSlideDirection('next');
      setActiveSlideIndex((prev) => (prev + 1) % featuredCertificates.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [isAutoPlaying, isHovered, inspectCert, featuredCertificates.length]);

  const goToSlide = (targetIndex: number, dir?: 'next' | 'prev') => {
    if (featuredCertificates.length === 0) return;
    const normalized = (targetIndex + featuredCertificates.length) % featuredCertificates.length;
    setSlideDirection(dir || (normalized >= activeSlideIndex ? 'next' : 'prev'));
    setActiveSlideIndex(normalized);
  };

  const handleNext = () => goToSlide(activeSlideIndex + 1, 'next');
  const handlePrev = () => goToSlide(activeSlideIndex - 1, 'prev');

  const handleOpenCertificatesPage = () => {
    if (onNavigateToCertificates) {
      onNavigateToCertificates();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('apex:navigate', { detail: 'certificates' }));
    }
  };

  const activeCert = featuredCertificates[activeSlideIndex] || featuredCertificates[0];

  return (
    <div id="about" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-red-400">
          <Award className="w-3.5 h-3.5" />
          <span>About Apex Tesla Hub</span>
        </div>
        <h2 className="font-heading font-black text-3xl sm:text-5xl text-white [text-wrap:balance]">
          THE APEX EV ENGINEERING PHILOSOPHY
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Founded by seasoned Tesla master technicians and high-voltage performance specialists, Apex Tesla Hub merges automotive excellence with decentralized Web3 financial infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-xl text-white">OEM Master Certified</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Our facilities house class-100 dust-free cleanrooms for bubble-free wrap installs and certified high-voltage isolation equipment for non-destructive cell diagnostics.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-xl text-white">24/7 Mobile Ranger Fleet</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Need emergency tire balancing, 16V low-voltage battery replacement, or software diagnostics? Our high-torque mobile service vans dispatch directly to your doorstep.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-xl text-white">Decentralized Asset Security</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Institutional crypto gateways supporting XRP, USDT, BNB, and BTC backed by multi-signature cold-storage hardware vaults with verifiable proof-of-reserves.
          </p>
        </div>
      </div>

      {/* Verified Business & Operating License Certificates — Modern Spring-Bounce Slider */}
      {featuredCertificates.length > 0 && activeCert && (
        <section
          aria-labelledby="about-certificates-heading"
          aria-roledescription="carousel"
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight') handleNext();
            if (e.key === 'ArrowLeft') handlePrev();
          }}
          tabIndex={0}
          className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6 focus:outline-none focus-visible:ring-2 focus-visible:ring-amber-400/60"
        >
          {/* Section Header + Slider Navigation Bar */}
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-zinc-800 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Verified Operating Credentials · View-Only Interactive Showcase</span>
              </div>
              <h3
                id="about-certificates-heading"
                className="font-heading font-bold text-2xl sm:text-3xl text-white [text-wrap:balance]"
              >
                Business Registration &amp; License to Operate
              </h3>
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                Apex Tesla Hub LLC operates under active corporate registration and master EV automotive licensing. Swipe or switch slides to inspect official regulatory authorizations in protected on-site view mode.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 shrink-0">
              {featuredCertificates.length > 1 && (
                <div className="inline-flex items-center gap-1.5 bg-zinc-900 border border-zinc-800 rounded-xl p-1">
                  <button
                    type="button"
                    onClick={handlePrev}
                    aria-label="Previous certificate"
                    className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <span className="px-2 text-xs font-mono tabular-nums text-zinc-300 whitespace-nowrap">
                    {String(activeSlideIndex + 1).padStart(2, '0')} / {String(featuredCertificates.length).padStart(2, '0')}
                  </span>
                  <button
                    type="button"
                    onClick={handleNext}
                    aria-label="Next certificate"
                    className="p-2 rounded-lg text-zinc-300 hover:text-white hover:bg-zinc-800 transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:scale-110 active:scale-90 cursor-pointer"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsAutoPlaying((prev) => !prev)}
                    aria-label={isAutoPlaying ? 'Pause certificate auto-slide' : 'Resume certificate auto-slide'}
                    title={isAutoPlaying ? 'Pause auto-slide' : 'Auto-slide certificates'}
                    className="p-2 rounded-lg text-amber-400 hover:text-amber-300 hover:bg-zinc-800 transition-transform duration-200 ease-[cubic-bezier(0.34,1.56,0.64,1)] active:scale-90 cursor-pointer"
                  >
                    {isAutoPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  </button>
                </div>
              )}

              <button
                type="button"
                onClick={handleOpenCertificatesPage}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
              >
                <span>View All Operating Certificates</span>
                <ArrowRight className="w-3.5 h-3.5 shrink-0" />
              </button>
            </div>
          </div>

          {/* Active Certificate Slide Stage (Touch-Swipe + Spring Bounce Transition) */}
          <div
            className="overflow-hidden"
            onTouchStart={(e) => {
              touchStartXRef.current = e.touches[0]?.clientX ?? null;
            }}
            onTouchEnd={(e) => {
              const startX = touchStartXRef.current;
              const endX = e.changedTouches[0]?.clientX;
              touchStartXRef.current = null;
              if (startX == null || endX == null) return;
              const delta = endX - startX;
              if (Math.abs(delta) > 45) {
                if (delta < 0) handleNext();
                else handlePrev();
              }
            }}
          >
            <article
              key={`${activeCert.id}-${activeSlideIndex}-${slideDirection}`}
              className={`grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-stretch p-4 sm:p-6 rounded-2xl bg-zinc-900/50 border border-zinc-800 transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-1 ${
                slideDirection === 'next' ? 'animate-cert-bounce-next' : 'animate-cert-bounce-prev'
              }`}
            >
              {/* Protected Certificate Document Frame */}
              <div className="lg:col-span-7 flex flex-col">
                <CertificateProtectedFrame
                  certificate={activeCert}
                  onInspect={() => setInspectCert(activeCert)}
                  className="h-full min-h-[240px] sm:min-h-[300px]"
                />
              </div>

              {/* Credential Dossier & Inspect CTA */}
              <div className="lg:col-span-5 flex flex-col justify-between gap-5">
                <div className="space-y-3.5">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400">
                    <span className="font-mono font-semibold text-amber-400 animate-cert-badge-spring">
                      {String(activeSlideIndex + 1).padStart(2, '0')}. {activeCert.category}
                    </span>
                    <span aria-hidden="true">·</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{activeCert.status}</span>
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-xl sm:text-2xl text-white leading-snug [text-wrap:balance]">
                    {activeCert.title}
                  </h4>

                  <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
                    {activeCert.summary}
                  </p>

                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 border-t border-zinc-800/80 text-xs">
                    <div className="space-y-0.5">
                      <dt className="text-zinc-500 flex items-center gap-1.5">
                        <FileCheck2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>License / Registry No.</span>
                      </dt>
                      <dd className="font-mono font-bold text-white tabular-nums">
                        {activeCert.certificateNumber}
                      </dd>
                    </div>

                    <div className="space-y-0.5">
                      <dt className="text-zinc-500 flex items-center gap-1.5">
                        <Building2 className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>Legal Entity</span>
                      </dt>
                      <dd className="font-semibold text-zinc-200 truncate">
                        {activeCert.legalEntityName}
                      </dd>
                    </div>

                    <div className="space-y-0.5 sm:col-span-2">
                      <dt className="text-zinc-500 flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
                        <span>Issuing Authority &amp; Jurisdiction</span>
                      </dt>
                      <dd className="text-zinc-300 font-medium">
                        {activeCert.issuingAuthority} · {activeCert.jurisdiction}
                      </dd>
                    </div>

                    <div className="space-y-0.5 sm:col-span-2">
                      <dt className="text-zinc-500">Effective Validity Period</dt>
                      <dd className="font-mono tabular-nums text-[11px] text-zinc-300">
                        Issued {activeCert.issuedDate} — Expires {activeCert.expiryDate}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="pt-3 border-t border-zinc-800 flex flex-wrap items-center justify-between gap-3">
                  <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                    <span>Protected Web View Only</span>
                  </span>

                  <button
                    type="button"
                    onClick={() => setInspectCert(activeCert)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 hover:border-emerald-500/50 text-xs font-semibold text-white transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] hover:-translate-y-0.5 active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Eye className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Inspect Certificate</span>
                  </button>
                </div>
              </div>
            </article>
          </div>

          {/* Interactive Bounce Slide Switcher Rail & Dot Pagination */}
          {featuredCertificates.length > 1 && (
            <div className="space-y-3 pt-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {featuredCertificates.map((cert, idx) => {
                  const isActive = idx === activeSlideIndex;
                  return (
                    <button
                      key={cert.id}
                      type="button"
                      onClick={() => goToSlide(idx, idx > activeSlideIndex ? 'next' : 'prev')}
                      className={`text-left p-3.5 rounded-2xl border transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer flex items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-zinc-900 border-amber-500/60 -translate-y-1 shadow-lg shadow-amber-500/10'
                          : 'bg-zinc-950 border-zinc-800 hover:border-zinc-700 hover:-translate-y-0.5 text-zinc-400'
                      }`}
                    >
                      <div className="min-w-0 space-y-0.5">
                        <span className={`text-[10px] font-mono font-bold block ${isActive ? 'text-amber-400' : 'text-zinc-500'}`}>
                          {String(idx + 1).padStart(2, '0')} · {cert.certificateNumber}
                        </span>
                        <span className={`font-heading font-semibold text-xs block truncate ${isActive ? 'text-white' : 'text-zinc-300'}`}>
                          {cert.title}
                        </span>
                      </div>
                      <span
                        className={`shrink-0 w-2.5 h-2.5 rounded-full transition-transform duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] ${
                          isActive ? 'bg-amber-400 scale-125' : 'bg-zinc-700 scale-100'
                        }`}
                      />
                    </button>
                  );
                })}
              </div>

              <div className="flex items-center justify-center gap-2">
                {featuredCertificates.map((cert, idx) => {
                  const isActive = idx === activeSlideIndex;
                  return (
                    <button
                      key={`dot-${cert.id}`}
                      type="button"
                      onClick={() => goToSlide(idx, idx > activeSlideIndex ? 'next' : 'prev')}
                      aria-label={`View certificate ${idx + 1}: ${cert.title}`}
                      className={`h-2 rounded-full transition-all duration-300 ease-[cubic-bezier(0.34,1.56,0.64,1)] cursor-pointer ${
                        isActive ? 'w-8 bg-amber-400' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                      }`}
                    />
                  );
                })}
              </div>
            </div>
          )}
        </section>
      )}

      <CertificateInspectModal
        certificate={inspectCert}
        onClose={() => setInspectCert(null)}
        onProtectedNotice={(msg) => showToast(msg, 'info')}
      />
    </div>
  );
};

