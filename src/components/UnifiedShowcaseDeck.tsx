import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'motion/react';
import { useApp } from '../context/AppContext';
import {
  Zap,
  Car,
  Palette,
  Wrench,
  TrendingUp,
  ShoppingBag,
  ChevronLeft,
  ChevronRight,
  ArrowRight,
  Maximize2,
  Pause,
  Play,
  ShieldCheck,
  BatteryCharging,
  Compass,
} from 'lucide-react';
import { ImageLightbox, LightboxImageItem } from './ImageLightbox';
import { ProductItem } from '../types';

interface UnifiedShowcaseDeckProps {
  onNavigate: (tab: string) => void;
  onOpenDeposit: () => void;
  onOpenCart?: () => void;
}

type ShowcaseCategoryId = 'stocks' | 'vehicles' | 'wraps' | 'services' | 'rentals' | 'products';

interface ShowcaseCardItem {
  id: string;
  category: ShowcaseCategoryId;
  kicker: string;
  title: string;
  description: string;
  image?: string;
  fallbackImage?: string;
  primaryMetricLabel: string;
  primaryMetricValue: string;
  secondaryMetricLabel: string;
  secondaryMetricValue: string;
  accentTextClass: string;
  ctaLabel: string;
  icon?: React.ComponentType<{ className?: string }>;
  onAction: () => void;
  lightboxItem?: LightboxImageItem;
}

const WRAP_STUDIO_ITEMS = [
  {
    id: 'wrap-stealth-black',
    title: '3M Satin Stealth Black',
    priceUsd: 3800,
    desc: 'Aerospace-grade cast vinyl with hydrophobic ceramic finish and 5-year anti-fade warranty.',
    img: '/promo-plaid.jpg',
    kicker: 'Signature Satin · 5-Yr Warranty',
  },
  {
    id: 'wrap-titanium-chrome',
    title: 'Liquid Titanium Chrome',
    priceUsd: 4200,
    desc: 'High-reflectivity metallic gloss cast wrap engineered for Cybertruck exoskeleton and Model S.',
    img: '/promo-cyberbeast.jpg',
    kicker: 'Cyber Armor · Metallic Cast',
  },
  {
    id: 'wrap-miami-cyan',
    title: 'Electric Miami Cyan & PPF',
    priceUsd: 4600,
    desc: 'Vibrant custom motorsport livery paired with self-healing front fascia paint protection film.',
    img: '/promo-robotaxi.jpg',
    kicker: 'Self-Healing · Full Front PPF',
  },
  {
    id: 'wrap-british-green',
    title: 'Satin British Racing Green',
    priceUsd: 3950,
    desc: 'Deep emerald satin metallic film with edge-wrapped door jambs and hydrophobic ceramic seal.',
    img: '/promo-plaid.jpg',
    kicker: 'Bespoke Touring · Ceramic Topcoat',
  },
];

const SERVICE_BAY_ITEMS = [
  {
    id: 'svc-hv-battery',
    title: 'HV Battery Health & Cell Profiling',
    priceUsd: 350,
    duration: '90 Mins',
    desc: '40-point high-voltage telemetry scan, cooling manifold flush, and cell impedance diagnostics.',
    icon: BatteryCharging,
    kicker: 'Bay Diagnostics · High Voltage',
  },
  {
    id: 'svc-drive-unit',
    title: 'Drive Unit & Inverter Calibration',
    priceUsd: 580,
    duration: '2.5 Hours',
    desc: 'Dual and tri-motor pyrofuse inspection, stator bearing alignment, and inverter firmware flash.',
    icon: Wrench,
    kicker: 'Powertrain Lab · Plaid & AWD',
  },
  {
    id: 'svc-mobile-ranger',
    title: 'Mobile Ranger On-Demand Dispatch',
    priceUsd: 200,
    duration: 'Same-Day',
    desc: 'Apex certified technician deployed directly to your home or office with HV diagnostic tooling.',
    icon: Car,
    kicker: 'Field Service · Doorstep Unit',
  },
  {
    id: 'svc-track-alignment',
    title: 'Laser Track Suspension & Brake Flush',
    priceUsd: 420,
    duration: '2 Hours',
    desc: 'Four-wheel camber calibration, air-suspension ride height balancing, and high-temp DOT 4 flush.',
    icon: Compass,
    kicker: 'Chassis Setup · Track Spec',
  },
];

const FALLBACK_PRODUCTS: ProductItem[] = [
  {
    id: 'prod-yoke',
    name: 'Forged Carbon Yoke Steering Wheel',
    category: 'Interior & Yoke',
    priceUsd: 890,
    image: '/promo-plaid.jpg',
    description: 'Direct plug-and-play retrofit with heating element and perforated Nappa leather grips.',
    inStock: true,
  },
  {
    id: 'prod-spoiler',
    name: 'Track Edition Carbon Fiber Spoiler',
    category: 'Aero & Carbon',
    priceUsd: 650,
    image: '/promo-cyberbeast.jpg',
    description: 'Pre-preg autoclave carbon providing 140 lbs downforce at 100 mph with precision 3M mounting.',
    inStock: true,
  },
  {
    id: 'prod-wall',
    name: 'Apex Megawatt High-Output Wall Charger',
    category: 'Charging & Tech',
    priceUsd: 520,
    image: '/promo-robotaxi.jpg',
    description: '48A Level 2 charging station with 24-foot cable and Wi-Fi telematics sync.',
    inStock: true,
  },
];

export const UnifiedShowcaseDeck: React.FC<UnifiedShowcaseDeckProps> = ({
  onNavigate,
  onOpenCart,
}) => {
  const {
    tslaQuote,
    featuredStockPlans,
    teslaCarListings,
    rentalFleetList,
    productsList,
    addToCart,
    showToast,
    currentUser,
    formatCurrency,
  } = useApp();

  const shouldReduceMotion = useReducedMotion();
  const [activeCategoryIdx, setActiveCategoryIdx] = useState<number>(0);
  const [itemPageIdx, setItemPageIdx] = useState<number>(0);
  const [slideDirection, setSlideDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [cardsPerView, setCardsPerView] = useState<number>(3);
  const [lightboxViewer, setLightboxViewer] = useState<{
    images: LightboxImageItem[];
    index: number;
  } | null>(null);

  useEffect(() => {
    const syncViewportCols = () => {
      if (typeof window === 'undefined') return;
      if (window.innerWidth < 768) setCardsPerView(1);
      else if (window.innerWidth < 1024) setCardsPerView(2);
      else setCardsPerView(3);
    };
    syncViewportCols();
    window.addEventListener('resize', syncViewportCols);
    return () => window.removeEventListener('resize', syncViewportCols);
  }, []);

  const categories = useMemo(
    () => [
      {
        id: 'stocks' as ShowcaseCategoryId,
        label: 'Tesla Stocks & Fast ROI',
        icon: TrendingUp,
        tab: 'stocks',
        highlight: 'Min $500',
        eyebrow: `NASDAQ: TSLA · $${tslaQuote.price.toFixed(2)} (${tslaQuote.changePercent >= 0 ? '+' : ''}${tslaQuote.changePercent}%)`,
        heading: 'Tesla Live Stock Telemetry & Fast ROI Plans',
        actionLabel: 'Open Full TSLA Hub',
      },
      {
        id: 'vehicles' as ShowcaseCategoryId,
        label: 'Tesla Vehicle Inventory',
        icon: Car,
        tab: 'vehicles',
        highlight: 'Enclosed Delivery',
        eyebrow: 'Direct Tesla Sales · Verified VINs',
        heading: 'Nationwide Enclosed Vehicle Delivery',
        actionLabel: 'View All Vehicles',
      },
      {
        id: 'wraps' as ShowcaseCategoryId,
        label: 'Custom Wrap Studio',
        icon: Palette,
        tab: 'wraps',
        highlight: '5-Yr Warranty',
        eyebrow: 'Aesthetic Customization · Cleanroom Bay',
        heading: 'Bespoke Vinyl Wraps & PPF Armor',
        actionLabel: 'Open Wrap Studio',
      },
      {
        id: 'services' as ShowcaseCategoryId,
        label: 'Service & Ranger Bays',
        icon: Wrench,
        tab: 'services',
        highlight: 'Diagnostic Scan',
        eyebrow: 'Certified Maintenance · Mobile Dispatch',
        heading: 'Apex Technology Bays & Mobile Ranger',
        actionLabel: 'Book Service Bay',
      },
      {
        id: 'rentals' as ShowcaseCategoryId,
        label: 'Performance Fleet Rentals',
        icon: Zap,
        tab: 'rentals',
        highlight: 'Cyberbeast & Plaid',
        eyebrow: 'Exotic EV Fleet · Unlimited Supercharging',
        heading: 'Daily & Weekly Performance Rentals',
        actionLabel: 'View Full Fleet',
      },
      {
        id: 'products' as ShowcaseCategoryId,
        label: 'Accessories & Upgrades',
        icon: ShoppingBag,
        tab: 'shop',
        highlight: 'Tesla Certified',
        eyebrow: 'Factory & Carbon Hardware · In Stock',
        heading: 'Tesla Carbon Aero & Cabin Upgrades',
        actionLabel: 'Open Parts Store',
      },
    ],
    [tslaQuote.price, tslaQuote.changePercent]
  );

  const activeCategory = categories[activeCategoryIdx];

  const handleProductAddToCart = useCallback(
    (item: ProductItem) => {
      if (!currentUser) {
        showToast('Please sign in or register to purchase Tesla upgrades.', 'error');
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('apex:require-auth'));
        }
        return;
      }
      addToCart(item);
      if (onOpenCart) onOpenCart();
    },
    [currentUser, showToast, addToCart, onOpenCart]
  );

  const itemsByCategory = useMemo<Record<ShowcaseCategoryId, ShowcaseCardItem[]>>(() => {
    const stockCards: ShowcaseCardItem[] = featuredStockPlans.map((plan) => ({
      id: plan.id,
      category: 'stocks',
      kicker: `${plan.badge} · ${plan.ticker}`,
      title: plan.title,
      description: plan.description,
      primaryMetricLabel: 'Target APY',
      primaryMetricValue: `${plan.apy}%`,
      secondaryMetricLabel: `${plan.durationDays} Days · Min`,
      secondaryMetricValue: `$${plan.minInvestmentUsd.toLocaleString()}`,
      accentTextClass: 'text-emerald-400',
      ctaLabel: 'Invest Now',
      icon: TrendingUp,
      onAction: () => onNavigate('stocks'),
    }));

    const vehicleCards: ShowcaseCardItem[] = teslaCarListings.map((car) => ({
      id: car.id,
      category: 'vehicles',
      kicker: `${car.year} ${car.model} · ${car.rangeMiles} mi range`,
      title: car.trim,
      description: `${car.horsepower.toLocaleString()} HP · 0–60 mph in ${car.zeroToSixty} · ${car.deliveryEstimate}`,
      image: car.image,
      fallbackImage: '/promo-plaid.jpg',
      primaryMetricLabel: 'Direct Price',
      primaryMetricValue: formatCurrency(car.salePriceUsd),
      secondaryMetricLabel: 'Delivery',
      secondaryMetricValue: car.deliveryEstimate.split('(')[0].trim(),
      accentTextClass: 'text-cyan-400',
      ctaLabel: 'Purchase / Reserve',
      onAction: () => onNavigate('vehicles'),
      lightboxItem: {
        url: car.image,
        title: `${car.year} Tesla ${car.model} ${car.trim}`,
        subtitle: `${formatCurrency(car.salePriceUsd)} · ${car.rangeMiles} mi range · 0–60 in ${car.zeroToSixty}`,
        badge: car.model,
      },
    }));

    const wrapCards: ShowcaseCardItem[] = WRAP_STUDIO_ITEMS.map((wrap) => ({
      id: wrap.id,
      category: 'wraps',
      kicker: wrap.kicker,
      title: wrap.title,
      description: wrap.desc,
      image: wrap.img,
      fallbackImage: '/promo-cyberbeast.jpg',
      primaryMetricLabel: 'Full Wrap Package',
      primaryMetricValue: formatCurrency(wrap.priceUsd),
      secondaryMetricLabel: 'Protection',
      secondaryMetricValue: 'Ceramic Included',
      accentTextClass: 'text-amber-400',
      ctaLabel: 'Configure Color',
      onAction: () => onNavigate('wraps'),
      lightboxItem: {
        url: wrap.img,
        title: wrap.title,
        subtitle: `${formatCurrency(wrap.priceUsd)} · Ceramic Topcoat Included`,
        badge: 'Wrap Studio',
      },
    }));

    const serviceCards: ShowcaseCardItem[] = SERVICE_BAY_ITEMS.map((svc) => ({
      id: svc.id,
      category: 'services',
      kicker: svc.kicker,
      title: svc.title,
      description: svc.desc,
      primaryMetricLabel: 'Service Rate',
      primaryMetricValue: formatCurrency(svc.priceUsd),
      secondaryMetricLabel: 'Estimated Turnaround',
      secondaryMetricValue: svc.duration,
      accentTextClass: 'text-red-400',
      ctaLabel: 'Schedule Slot',
      icon: svc.icon,
      onAction: () => onNavigate('services'),
    }));

    const rentalCards: ShowcaseCardItem[] = rentalFleetList.map((car) => ({
      id: car.id,
      category: 'rentals',
      kicker: `${car.horsepower} HP · ${car.zeroToSixty} 0–60`,
      title: `${car.model} ${car.trim}`,
      description: `${car.location} · ${car.rangeMiles} mi range · Unlimited Supercharging included.`,
      image: car.image,
      fallbackImage: '/promo-robotaxi.jpg',
      primaryMetricLabel: 'Daily Rate',
      primaryMetricValue: formatCurrency(car.dailyRateUsd),
      secondaryMetricLabel: 'Charging',
      secondaryMetricValue: 'Unlimited V4',
      accentTextClass: 'text-emerald-400',
      ctaLabel: 'Book Rental',
      onAction: () => onNavigate('rentals'),
      lightboxItem: {
        url: car.image,
        title: `${car.model} ${car.trim}`,
        subtitle: `${formatCurrency(car.dailyRateUsd)} / day · ${car.horsepower} HP · ${car.rangeMiles} mi range`,
        badge: car.model,
      },
    }));

    const productSource = productsList.length > 0 ? productsList : FALLBACK_PRODUCTS;
    const productCards: ShowcaseCardItem[] = productSource.map((prod) => ({
      id: prod.id,
      category: 'products',
      kicker: `${prod.category} · ${prod.inStock ? 'In Stock' : 'Backorder'}`,
      title: prod.name,
      description: prod.description,
      image: prod.image,
      fallbackImage: '/promo-plaid.jpg',
      primaryMetricLabel: 'Hardware Price',
      primaryMetricValue: formatCurrency(prod.priceUsd),
      secondaryMetricLabel: 'Dispatch',
      secondaryMetricValue: prod.inStock ? 'Fremont Ready' : 'Pre-Order',
      accentTextClass: 'text-red-400',
      ctaLabel: 'Add To Cart',
      onAction: () => handleProductAddToCart(prod),
      lightboxItem: {
        url: prod.image,
        title: prod.name,
        subtitle: `${formatCurrency(prod.priceUsd)} · ${prod.category}`,
        badge: prod.category,
      },
    }));

    return {
      stocks: stockCards,
      vehicles: vehicleCards,
      wraps: wrapCards,
      services: serviceCards,
      rentals: rentalCards,
      products: productCards,
    };
  }, [
    featuredStockPlans,
    teslaCarListings,
    rentalFleetList,
    productsList,
    formatCurrency,
    onNavigate,
    handleProductAddToCart,
  ]);

  const currentItems = itemsByCategory[activeCategory.id] || [];
  const totalPages = Math.max(1, Math.ceil(currentItems.length / cardsPerView));
  const safePageIdx = itemPageIdx % totalPages;

  const visibleItems = useMemo(() => {
    if (currentItems.length <= cardsPerView) return currentItems;
    const start = safePageIdx * cardsPerView;
    const slice = currentItems.slice(start, start + cardsPerView);
    if (slice.length < cardsPerView) {
      return [...slice, ...currentItems.slice(0, cardsPerView - slice.length)];
    }
    return slice;
  }, [currentItems, safePageIdx, cardsPerView]);

  const goNextSlide = useCallback(() => {
    setSlideDirection(1);
    if (safePageIdx + 1 < totalPages) {
      setItemPageIdx((prev) => prev + 1);
    } else {
      setItemPageIdx(0);
      setActiveCategoryIdx((prev) => (prev + 1) % categories.length);
    }
  }, [safePageIdx, totalPages, categories.length]);

  const goPrevSlide = useCallback(() => {
    setSlideDirection(-1);
    if (safePageIdx > 0) {
      setItemPageIdx((prev) => prev - 1);
    } else {
      const prevCat = (activeCategoryIdx - 1 + categories.length) % categories.length;
      const prevItemsCount = (itemsByCategory[categories[prevCat].id] || []).length;
      const prevPages = Math.max(1, Math.ceil(prevItemsCount / cardsPerView));
      setActiveCategoryIdx(prevCat);
      setItemPageIdx(prevPages - 1);
    }
  }, [safePageIdx, activeCategoryIdx, categories, itemsByCategory, cardsPerView]);

  const selectCategory = (idx: number) => {
    if (idx === activeCategoryIdx) return;
    setSlideDirection(idx > activeCategoryIdx ? 1 : -1);
    setActiveCategoryIdx(idx);
    setItemPageIdx(0);
  };

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      goNextSlide();
    }, 6500);
    return () => clearInterval(timer);
  }, [isPaused, goNextSlide]);

  const lightboxGroup = useMemo(
    () => currentItems.map((i) => i.lightboxItem).filter(Boolean) as LightboxImageItem[],
    [currentItems]
  );

  const slideKey = `${activeCategory.id}-${safePageIdx}`;

  return (
    <section
      id="showcase-deck"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-6 select-none"
    >
      {/* Header and Slider Controls */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-zinc-800 pb-5">
        <div className="space-y-1.5">
          <span className="text-xs font-medium text-red-400 block">
            Interactive Catalog &amp; Service Slider
          </span>
          <h2 className="font-heading font-black text-2xl sm:text-4xl text-white tracking-tight">
            APEX SHOWCASE &amp; SERVICES
          </h2>
          <p className="text-zinc-400 text-xs sm:text-sm max-w-xl">
            Slide seamlessly through live TSLA yield plans, direct-delivery vehicles, bespoke 3M wraps, service bays, fleet rentals, and hardware upgrades.
          </p>
        </div>

        {/* Slide Counter, Autoplay Toggle, and Prev/Next Arrows */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="text-xs font-mono text-zinc-400 tabular-nums px-2.5 py-1.5 rounded-lg bg-zinc-950 border border-zinc-800">
            <span className="text-white font-bold">
              {String(activeCategoryIdx + 1).padStart(2, '0')}
            </span>
            <span className="text-zinc-600 mx-1">/</span>
            <span>{String(categories.length).padStart(2, '0')}</span>
            {totalPages > 1 && (
              <span className="text-zinc-500 ml-2">
                · Page {safePageIdx + 1}/{totalPages}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => setIsPaused((p) => !p)}
            aria-label={isPaused ? 'Resume showcase slider' : 'Pause showcase slider'}
            className="p-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition cursor-pointer"
          >
            {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          </button>

          <div className="flex items-center gap-1 bg-zinc-900 p-1 rounded-xl border border-zinc-800">
            <button
              type="button"
              onClick={goPrevSlide}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Previous Showcase Slide"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={goNextSlide}
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer"
              aria-label="Next Showcase Slide"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Category Switcher Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.map((cat, idx) => {
          const Icon = cat.icon;
          const isActive = activeCategoryIdx === idx;
          return (
            <button
              key={cat.id}
              type="button"
              onClick={() => selectCategory(idx)}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all duration-200 flex items-center gap-2 border cursor-pointer ${
                isActive
                  ? 'bg-red-600 text-white border-red-500 shadow-lg shadow-red-950/50'
                  : 'bg-zinc-900/80 border-zinc-800 text-zinc-400 hover:text-white hover:border-zinc-700'
              }`}
            >
              <Icon className="w-3.5 h-3.5 shrink-0" />
              <span>{cat.label}</span>
            </button>
          );
        })}
      </div>

      {/* Animated Slider Stage */}
      <div className="relative overflow-hidden rounded-3xl border border-zinc-800 bg-zinc-950 p-6 sm:p-8">
        {/* Progress Accent Bar */}
        <div className="absolute top-0 inset-x-0 h-0.5 bg-zinc-900 overflow-hidden">
          <motion.div
            key={`${slideKey}-${isPaused ? 'paused' : 'playing'}`}
            initial={{ scaleX: 0 }}
            animate={{ scaleX: isPaused ? 0.35 : 1 }}
            transition={{
              duration: isPaused || shouldReduceMotion ? 0.25 : 6.5,
              ease: 'linear',
            }}
            style={{ transformOrigin: 'left' }}
            className="h-full bg-gradient-to-r from-red-600 via-rose-500 to-amber-500"
          />
        </div>

        {/* Category Stage Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div className="space-y-1">
            <span className="text-xs font-mono text-zinc-400 block">
              {activeCategory.eyebrow} · {activeCategory.highlight}
            </span>
            <h3 className="font-heading font-black text-xl sm:text-2xl text-white tracking-tight">
              {activeCategory.heading}
            </h3>
          </div>

          <button
            type="button"
            onClick={() => onNavigate(activeCategory.tab)}
            className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-semibold text-white flex items-center gap-1.5 transition whitespace-nowrap shrink-0 cursor-pointer self-start sm:self-auto"
          >
            <span>{activeCategory.actionLabel}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Animated Slide Track */}
        <AnimatePresence mode="wait" custom={slideDirection}>
          <motion.div
            key={slideKey}
            custom={slideDirection}
            initial={
              shouldReduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    x: slideDirection > 0 ? 48 : -48,
                    scale: 0.985,
                    filter: 'blur(4px)',
                  }
            }
            animate={
              shouldReduceMotion
                ? { opacity: 1 }
                : {
                    opacity: 1,
                    x: 0,
                    scale: 1,
                    filter: 'blur(0px)',
                  }
            }
            exit={
              shouldReduceMotion
                ? { opacity: 0 }
                : {
                    opacity: 0,
                    x: slideDirection > 0 ? -48 : 48,
                    scale: 0.985,
                    filter: 'blur(4px)',
                  }
            }
            transition={{
              duration: 0.32,
              ease: [0.16, 1, 0.3, 1],
            }}
            drag={shouldReduceMotion ? false : 'x'}
            dragConstraints={{ left: 0, right: 0 }}
            dragElastic={0.12}
            onDragEnd={(_event, info) => {
              if (info.offset.x < -60) goNextSlide();
              else if (info.offset.x > 60) goPrevSlide();
            }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {visibleItems.map((item, cardIdx) => {
              const Icon = item.icon;
              const lightboxIndex = item.lightboxItem
                ? lightboxGroup.findIndex((lb) => lb.title === item.lightboxItem?.title)
                : -1;

              return (
                <motion.article
                  key={item.id}
                  initial={shouldReduceMotion ? false : { opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  whileHover={
                    shouldReduceMotion
                      ? undefined
                      : {
                          y: -4,
                          scale: 1.018,
                          transition: { duration: 0.18, delay: 0, ease: [0.16, 1, 0.3, 1] },
                        }
                  }
                  transition={{
                    duration: 0.28,
                    delay: shouldReduceMotion ? 0 : cardIdx * 0.05,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="relative rounded-2xl border border-zinc-800/90 bg-zinc-900/60 overflow-hidden flex flex-col justify-between transition-[border-color,box-shadow,background-color] duration-200 hover:bg-zinc-900/85 hover:border-red-500/75 hover:shadow-[0_0_28px_-6px_rgba(239,68,68,0.38),inset_0_0_0_1px_rgba(239,68,68,0.2)] group"
                >
                  {item.image ? (
                    <div className="relative h-44 w-full bg-zinc-950 overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          if (item.fallbackImage && e.currentTarget.src !== window.location.origin + item.fallbackImage) {
                            e.currentTarget.src = item.fallbackImage;
                          }
                        }}
                        onClick={() => {
                          if (item.lightboxItem && lightboxGroup.length > 0) {
                            setLightboxViewer({
                              index: lightboxIndex >= 0 ? lightboxIndex : 0,
                              images: lightboxGroup,
                            });
                          }
                        }}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-zoom-in"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent pointer-events-none" />
                      {item.lightboxItem && (
                        <button
                          type="button"
                          onClick={() =>
                            setLightboxViewer({
                              index: lightboxIndex >= 0 ? lightboxIndex : 0,
                              images: lightboxGroup,
                            })
                          }
                          className="absolute top-3 right-3 p-2 rounded-lg bg-black/70 hover:bg-red-600 border border-white/15 text-white opacity-90 sm:opacity-0 sm:group-hover:opacity-100 transition cursor-pointer"
                          aria-label={`Inspect ${item.title} photo`}
                        >
                          <Maximize2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="px-5 pt-5 flex items-center justify-between">
                      <div className="p-2.5 rounded-xl bg-zinc-950 border border-zinc-800 text-red-400">
                        {Icon ? <Icon className="w-5 h-5" /> : <ShieldCheck className="w-5 h-5" />}
                      </div>
                      <span className="text-[11px] font-mono text-zinc-500 tabular-nums">
                        {String(cardIdx + 1).padStart(2, '0')}
                      </span>
                    </div>
                  )}

                  <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                    <div className="space-y-1.5">
                      <span className="text-[11px] font-mono text-zinc-400 block truncate">
                        {item.kicker}
                      </span>
                      <h4 className="font-heading font-bold text-base text-white group-hover:text-red-400 transition-colors">
                        {item.title}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed line-clamp-2">
                        {item.description}
                      </p>
                    </div>

                    <div className="space-y-3">
                      <div className="pt-3 border-t border-zinc-800/90 flex items-end justify-between gap-2">
                        <div>
                          <span className="text-[11px] text-zinc-500 block">
                            {item.primaryMetricLabel}
                          </span>
                          <span className="font-mono font-bold text-lg text-white tabular-nums">
                            {item.primaryMetricValue}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[11px] text-zinc-500 block">
                            {item.secondaryMetricLabel}
                          </span>
                          <span className={`text-xs font-semibold tabular-nums ${item.accentTextClass}`}>
                            {item.secondaryMetricValue}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={item.onAction}
                        className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-heading font-semibold text-xs transition flex items-center justify-center gap-1.5 whitespace-nowrap cursor-pointer"
                      >
                        <span>{item.ctaLabel}</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </motion.article>
              );
            })}
          </motion.div>
        </AnimatePresence>

        {/* Bottom Slider Pagination & Quick Category Indicators */}
        <div className="mt-6 pt-4 border-t border-zinc-900 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            {totalPages > 1 ? (
              Array.from({ length: totalPages }).map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setSlideDirection(idx > safePageIdx ? 1 : -1);
                    setItemPageIdx(idx);
                  }}
                  aria-label={`Show ${activeCategory.label} page ${idx + 1}`}
                  className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    safePageIdx === idx ? 'w-7 bg-red-500' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                  }`}
                />
              ))
            ) : (
              categories.map((c, idx) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => selectCategory(idx)}
                  aria-label={`Jump to ${c.label}`}
                  className={`h-1.5 rounded-full transition-all duration-200 cursor-pointer ${
                    activeCategoryIdx === idx ? 'w-7 bg-red-500' : 'w-2 bg-zinc-700 hover:bg-zinc-500'
                  }`}
                />
              ))
            )}
          </div>

          <span className="text-[11px] text-zinc-500">
            Showing {visibleItems.length} of {currentItems.length} {activeCategory.label.toLowerCase()} · Drag or use arrows to slide
          </span>
        </div>
      </div>

      <ImageLightbox
        isOpen={lightboxViewer !== null}
        onClose={() => setLightboxViewer(null)}
        images={lightboxViewer?.images || []}
        initialIndex={lightboxViewer?.index ?? 0}
      />
    </section>
  );
};
