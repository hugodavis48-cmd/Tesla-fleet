import React, { useState, useMemo } from 'react';
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

  const featuredCertificates = useMemo(
    () =>
      [...businessCertificates]
        .filter((c) => c.isPublished && c.displayOnAbout)
        .sort((a, b) => a.order - b.order),
    [businessCertificates]
  );

  const handleOpenCertificatesPage = () => {
    if (onNavigateToCertificates) {
      onNavigateToCertificates();
    } else if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('apex:navigate', { detail: 'certificates' }));
    }
  };

  return (
    <div id="about" className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-12">
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-600/10 border border-red-500/30 text-red-400 text-xs font-semibold uppercase tracking-wider">
          <Award className="w-3.5 h-3.5" />
          <span>About Apex Tesla Hub</span>
        </div>
        <h2 className="font-heading font-black text-3xl sm:text-5xl text-white">
          THE APEX EV ENGINEERING PHILOSOPHY
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base leading-relaxed">
          Founded by seasoned Tesla master technicians and high-voltage performance specialists, Apex Tesla Hub merges automotive excellence with decentralized Web3 financial infrastructure.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-red-600/15 border border-red-500/30 flex items-center justify-center text-red-500">
            <Wrench className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-xl text-white">OEM Master Certified</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Our facilities house class-100 dust-free cleanrooms for bubble-free wrap installs and certified high-voltage isolation equipment for non-destructive cell diagnostics.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-cyan-600/15 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
            <Zap className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-xl text-white">24/7 Mobile Ranger Fleet</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Need emergency tire balancing, 16V low-voltage battery replacement, or software diagnostics? Our high-torque mobile service vans dispatch directly to your doorstep.
          </p>
        </div>

        <div className="p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <h3 className="font-heading font-bold text-xl text-white">Decentralized Asset Security</h3>
          <p className="text-xs text-zinc-400 leading-relaxed">
            Institutional crypto gateways supporting XRP, USDT, BNB, and BTC backed by multi-signature cold-storage hardware vaults with verifiable proof-of-reserves.
          </p>
        </div>
      </div>

      {/* Verified Business & Operating License Certificates (View-Only Protected) */}
      {featuredCertificates.length > 0 && (
        <section
          aria-labelledby="about-certificates-heading"
          className="p-6 sm:p-8 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-6"
        >
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-zinc-800 pb-5">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 text-xs font-mono text-amber-400 font-semibold">
                <Lock className="w-3.5 h-3.5 shrink-0" />
                <span>Verified Operating Credentials · View-Only Mode</span>
              </div>
              <h3
                id="about-certificates-heading"
                className="font-heading font-bold text-2xl sm:text-3xl text-white [text-wrap:balance]"
              >
                Business Registration &amp; License to Operate
              </h3>
              <p className="text-xs text-zinc-400 max-w-2xl leading-relaxed">
                Apex Tesla Hub LLC operates under active corporate registration and master EV automotive licensing. Documents below are presented exclusively for on-site inspection (downloads and file exports are disabled).
              </p>
            </div>

            <button
              type="button"
              onClick={handleOpenCertificatesPage}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 font-bold text-xs transition whitespace-nowrap shrink-0 self-start lg:self-auto cursor-pointer"
            >
              <span>View All Operating Certificates</span>
              <ArrowRight className="w-3.5 h-3.5 shrink-0" />
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {featuredCertificates.map((cert) => (
              <div
                key={cert.id}
                className="p-5 rounded-2xl bg-zinc-900/50 border border-zinc-800 flex flex-col justify-between gap-4"
              >
                <CertificateProtectedFrame
                  certificate={cert}
                  onInspect={() => setInspectCert(cert)}
                />

                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="text-zinc-400 font-medium">{cert.category}</span>
                    <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold shrink-0">
                      <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
                      <span>{cert.status}</span>
                    </span>
                  </div>

                  <h4 className="font-heading font-bold text-base sm:text-lg text-white">
                    {cert.title}
                  </h4>

                  <div className="text-xs text-zinc-400 space-y-1">
                    <div className="flex items-center gap-2 font-mono text-zinc-300">
                      <FileCheck2 className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>No. {cert.certificateNumber}</span>
                    </div>
                    <p className="truncate">{cert.issuingAuthority}</p>
                    <p className="font-mono tabular-nums text-[11px] text-zinc-500">
                      Valid {cert.issuedDate} — {cert.expiryDate}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-zinc-800 flex items-center justify-between gap-2">
                    <span className="text-[11px] font-mono text-zinc-500 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                      <span>Web View Only</span>
                    </span>

                    <button
                      type="button"
                      onClick={() => setInspectCert(cert)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-white transition whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Inspect Certificate</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
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
