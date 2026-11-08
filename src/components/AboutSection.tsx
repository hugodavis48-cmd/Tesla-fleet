import React from 'react';
import { ShieldCheck, Award, Zap, Wrench, Users, CheckCircle2 } from 'lucide-react';

export const AboutSection: React.FC = () => {
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
    </div>
  );
};
