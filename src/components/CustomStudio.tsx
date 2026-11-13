import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Palette, Check, Sparkles, Shield, Wrench, ArrowRight, Eye, ShieldCheck, Zap } from 'lucide-react';

interface CustomStudioProps {
  onNavigateToServices: () => void;
  onOpenDeposit: () => void;
}

export const CustomStudio: React.FC<CustomStudioProps> = ({ onNavigateToServices, onOpenDeposit }) => {
  const { bookService, balances, showToast, currentUser } = useApp();

  const wrapColors = [
    {
      id: 'stealth-black',
      name: 'Satin Stealth Black',
      hex: '#141416',
      accent: '#27272a',
      type: '3M 2080 Deep Cast',
      basePrice: 2450,
      image: 'https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'liquid-chrome',
      name: 'Liquid Titanium Chrome',
      hex: '#94a3b8',
      accent: '#cbd5e1',
      type: 'Avery Supreme Satin Shield',
      basePrice: 2850,
      image: 'https://images.unsplash.com/photo-1560958089-b8a1929cea89?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'miami-cyan',
      name: 'Electric Miami Cyan',
      hex: '#00d2ff',
      accent: '#06b6d4',
      type: 'Inozetek Supergloss Cast',
      basePrice: 2650,
      image: 'https://images.unsplash.com/photo-1571127236794-81c0bbfe1ce3?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'cyber-crimson',
      name: 'Cyberpunk Crimson Red',
      hex: '#e11d48',
      accent: '#be123c',
      type: 'KPMF Iridescent Red Pearl',
      basePrice: 2750,
      image: 'https://images.unsplash.com/photo-1541899481282-d53bffe3c35d?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'racing-green',
      name: 'British Racing Green',
      hex: '#064e3b',
      accent: '#047857',
      type: '3M 2080 Emerald Metallic',
      basePrice: 2550,
      image: 'https://images.unsplash.com/photo-1563720223185-11003d516935?auto=format&fit=crop&w=1200&q=80',
    },
    {
      id: 'forged-carbon',
      name: 'Forged Carbon Fiber Weave',
      hex: '#292524',
      accent: '#44403c',
      type: 'STEK DynoCarbon Self-Healing',
      basePrice: 3400,
      image: 'https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?auto=format&fit=crop&w=1200&q=80',
    },
  ];

  const [selectedWrap, setSelectedWrap] = useState(wrapColors[0]);
  const [selectedFinish, setSelectedFinish] = useState<'Satin' | 'Ultra Gloss' | 'Matte' | 'Self-Healing PPF'>('Satin');
  const [selectedModel, setSelectedModel] = useState<'Model S' | 'Model 3' | 'Model X' | 'Model Y' | 'Cybertruck' | 'Roadster'>('Model S');

  const accessoriesList = [
    { id: 'acc-spoiler', name: 'Dry Carbon Fiber Aerodynamic Track Spoiler', price: 1150, checked: true },
    { id: 'acc-yoke', name: 'Alcantara Ergonomic Yoke Steering Wheel Retrofit', price: 890, checked: true },
    { id: 'acc-wheels', name: 'Apex 21" Forged Monoblock Lightweight Rims', price: 3800, checked: false },
    { id: 'acc-brakes', name: 'High-Temp Red Ceramic Brembo Caliper Paint', price: 450, checked: true },
    { id: 'acc-tint', name: 'Smoked Ceramic Headlight & Taillight UV Film', price: 320, checked: false },
    { id: 'acc-ambient', name: 'Dynamic Multi-Zone Ambient Dashboard LED System', price: 420, checked: false },
  ];

  const [accessories, setAccessories] = useState(accessoriesList);

  const toggleAccessory = (id: string) => {
    setAccessories((prev) =>
      prev.map((acc) => (acc.id === id ? { ...acc, checked: !acc.checked } : acc))
    );
  };

  const finishMultiplier = selectedFinish === 'Self-Healing PPF' ? 1.4 : selectedFinish === 'Ultra Gloss' ? 1.1 : 1.0;
  const wrapCalculatedPrice = Math.round(selectedWrap.basePrice * finishMultiplier);
  const accessoriesTotal = accessories
    .filter((a) => a.checked)
    .reduce((sum, a) => sum + a.price, 0);
  const grandTotal = wrapCalculatedPrice + accessoriesTotal;

  const handleBookCustomization = () => {
    if (!currentUser) {
      showToast('Please sign in or register to reserve a Custom Wrap Studio bay.', 'error');
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('apex:require-auth'));
      }
      return;
    }
    bookService({
      vehicleId: `veh-custom-${Date.now()}`,
      vehicleName: `${selectedModel} (${selectedWrap.name})`,
      serviceType: 'Full Body Vinyl Wrap',
      serviceMode: 'Apex Center Bay',
      scheduledDate: '2026-11-12',
      timeSlot: '09:00 AM',
      location: 'Apex Custom Styling Center - Bay 2 Cleanroom',
      technicianNotes: `Wrap: ${selectedWrap.name} [${selectedFinish}]. Accessories: ${accessories.filter(a => a.checked).map(a => a.name).join(', ')}.`,
      totalCostUsd: grandTotal,
      paidWith: 'Apex Dashboard Vault',
    });
  };

  return (
    <div className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-10">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-600/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold uppercase tracking-wider">
          <Palette className="w-3.5 h-3.5" />
          <span>Apex Bespoke Customization Studio</span>
        </div>
        <h2 className="font-heading font-black text-3xl sm:text-5xl text-white">
          TESLA BODY WRAPS & CUSTOM FIXES
        </h2>
        <p className="text-zinc-400 text-sm sm:text-base">
          Engineer your Tesla's exterior styling with aerospace 3M & Avery Dennison vinyl cast films, ceramic self-healing PPF, and lightweight aerodynamic carbon upgrades.
        </p>
      </div>

      {/* Main Studio Interactive Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left 7 Columns: Visualizer Preview */}
        <div className="lg:col-span-7 space-y-6">
          {/* Main Visualizer Stage */}
          <div className="relative rounded-3xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-2xl p-4">
            <div className="relative aspect-[16/10] rounded-2xl overflow-hidden bg-black">
              <img
                src={selectedWrap.image}
                alt={selectedWrap.name}
                className="w-full h-full object-cover transition-all duration-500"
              />

              {/* Tint overlay based on selected color */}
              <div
                className="absolute inset-0 mix-blend-color opacity-30 pointer-events-none transition-all duration-300"
                style={{ backgroundColor: selectedWrap.hex }}
              />

              {/* Gradient Vignette */}
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-950/90 via-transparent to-transparent pointer-events-none" />

              {/* Badges on top */}
              <div className="absolute top-4 left-4 flex gap-2">
                <span className="px-3 py-1 rounded-full bg-black/75 backdrop-blur-md border border-zinc-700 text-xs font-semibold text-white">
                  {selectedModel}
                </span>
                <span className="px-3 py-1 rounded-full bg-red-600/80 backdrop-blur-md text-xs font-bold text-white uppercase">
                  {selectedFinish} Finish
                </span>
              </div>

              {/* Bottom spec overlay */}
              <div className="absolute bottom-4 inset-x-4 p-4 rounded-xl bg-black/80 backdrop-blur-md border border-zinc-800 flex items-center justify-between text-xs">
                <div>
                  <span className="text-zinc-400 block text-[10px] uppercase font-mono">Film Specification</span>
                  <span className="text-white font-bold">{selectedWrap.name}</span>
                  <span className="text-zinc-400 block text-[11px]">{selectedWrap.type}</span>
                </div>
                <div className="text-right">
                  <span className="text-zinc-400 block text-[10px] uppercase font-mono">Warranty</span>
                  <span className="text-emerald-400 font-bold">5-Year Guarantee</span>
                  <span className="text-zinc-400 block text-[11px]">Anti-peel & UV shield</span>
                </div>
              </div>
            </div>

            {/* Model Selector Pills */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-4">
              {(['Model S', 'Model 3', 'Model X', 'Model Y', 'Cybertruck', 'Roadster'] as const).map((model) => (
                <button
                  key={model}
                  onClick={() => setSelectedModel(model)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                    selectedModel === model
                      ? 'bg-red-600 text-white shadow-md shadow-red-950/40'
                      : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {model}
                </button>
              ))}
            </div>
          </div>

          {/* Color Palettes Grid */}
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-4">
            <h3 className="font-heading font-bold text-sm text-white uppercase tracking-wider">
              Select Wrap Shade & Material
            </h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {wrapColors.map((color) => {
                const isSelected = selectedWrap.id === color.id;
                return (
                  <button
                    key={color.id}
                    onClick={() => setSelectedWrap(color)}
                    className={`p-3 rounded-2xl border text-left transition flex items-center gap-3 ${
                      isSelected
                        ? 'bg-zinc-900 border-red-500 shadow-md ring-1 ring-red-500'
                        : 'bg-zinc-900/40 border-zinc-800 hover:border-zinc-700'
                    }`}
                  >
                    <div
                      className="w-8 h-8 rounded-xl shadow-inner border border-white/20 shrink-0 flex items-center justify-center"
                      style={{ backgroundColor: color.hex }}
                    >
                      {isSelected && <Check className="w-4 h-4 text-white drop-shadow" />}
                    </div>
                    <div className="min-w-0">
                      <span className="text-xs font-bold text-white block truncate">{color.name}</span>
                      <span className="text-[10px] text-zinc-400 font-mono">${color.basePrice}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Finish selection */}
            <div className="pt-2">
              <label className="text-xs text-zinc-400 uppercase font-mono font-semibold block mb-2">
                Coating & Finish Type
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(['Satin', 'Ultra Gloss', 'Matte', 'Self-Healing PPF'] as const).map((finish) => (
                  <button
                    key={finish}
                    onClick={() => setSelectedFinish(finish)}
                    className={`py-2 px-3 rounded-xl text-xs font-semibold border transition ${
                      selectedFinish === finish
                        ? 'bg-red-600/20 border-red-500 text-white'
                        : 'bg-zinc-900/60 border-zinc-800 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {finish}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right 5 Columns: Custom Accessories Fixes & Quote */}
        <div className="lg:col-span-5 space-y-6">
          <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-heading font-bold text-lg text-white">Custom Accessories Fixes</h3>
                <p className="text-xs text-zinc-400">Pair aerodynamic & performance mods with your wrap</p>
              </div>
              <Sparkles className="w-5 h-5 text-yellow-400" />
            </div>

            <div className="space-y-3">
              {accessories.map((acc) => (
                <div
                  key={acc.id}
                  onClick={() => toggleAccessory(acc.id)}
                  className={`cursor-pointer p-3.5 rounded-2xl border transition flex items-center justify-between gap-3 ${
                    acc.checked
                      ? 'bg-red-950/20 border-red-500/80 text-white'
                      : 'bg-zinc-900/40 border-zinc-800 text-zinc-400 hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-5 h-5 rounded-lg border flex items-center justify-center transition ${
                        acc.checked ? 'bg-red-600 border-red-500 text-white' : 'border-zinc-700 bg-zinc-900'
                      }`}
                    >
                      {acc.checked && <Check className="w-3.5 h-3.5" />}
                    </div>
                    <span className="text-xs font-medium text-zinc-200">{acc.name}</span>
                  </div>
                  <span className="font-mono text-xs font-bold text-red-400 shrink-0">
                    +${acc.price}
                  </span>
                </div>
              ))}
            </div>

            {/* Total Pricing Box */}
            <div className="p-4 rounded-2xl bg-zinc-900 border border-zinc-800 space-y-3">
              <div className="flex justify-between text-xs text-zinc-400">
                <span>{selectedWrap.name} ({selectedFinish}):</span>
                <span className="text-white font-mono">${wrapCalculatedPrice}</span>
              </div>
              <div className="flex justify-between text-xs text-zinc-400">
                <span>Accessories ({accessories.filter((a) => a.checked).length} items):</span>
                <span className="text-white font-mono">${accessoriesTotal}</span>
              </div>
              <div className="border-t border-zinc-800 pt-2 flex justify-between items-center">
                <span className="font-heading font-bold text-sm text-white">Total Studio Package:</span>
                <span className="font-heading font-black text-2xl text-red-400">
                  ${grandTotal.toLocaleString()} USD
                </span>
              </div>
              <p className="text-[11px] text-zinc-500">
                Pay with Crypto (USDT, BTC, XRP, BNB) or Apex USD Wallet
              </p>
            </div>

            {/* CTAs */}
            <div className="space-y-2 pt-2">
              <button
                onClick={handleBookCustomization}
                className="w-full py-4 rounded-2xl bg-gradient-to-r from-red-600 via-red-500 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-heading font-bold text-sm shadow-xl shadow-red-950/60 flex items-center justify-center gap-2 transition"
              >
                <span>Book Custom Wrap & Accessories Cleanroom</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <button
                onClick={onNavigateToServices}
                className="w-full py-3 rounded-2xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition"
              >
                <Wrench className="w-3.5 h-3.5 text-zinc-400" />
                <span>Need mechanical maintenance or battery service instead?</span>
              </button>
            </div>

            <div className="p-3 rounded-xl bg-black/60 border border-zinc-800/80 text-[11px] text-zinc-400 space-y-1">
              <div className="flex items-center gap-2 text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" />
                <span>Certified Cleanroom Application Guarantee</span>
              </div>
              <p>Every vehicle undergoes dual-stage decontamination, clay-bar prep, edge heating, and post-install ceramic inspection.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
