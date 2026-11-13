import React, { useEffect, useState, useCallback } from 'react';
import {
  X,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
} from 'lucide-react';

export interface LightboxImageItem {
  url: string;
  title?: string;
  subtitle?: string;
  badge?: string;
}

interface ImageLightboxProps {
  isOpen: boolean;
  onClose: () => void;
  images: LightboxImageItem[];
  initialIndex?: number;
}

export const ImageLightbox: React.FC<ImageLightboxProps> = ({
  isOpen,
  onClose,
  images,
  initialIndex = 0,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);
  const [zoomScale, setZoomScale] = useState(1);

  useEffect(() => {
    if (isOpen) {
      setCurrentIndex(Math.max(0, Math.min(initialIndex, Math.max(0, images.length - 1))));
      setZoomScale(1);
    }
  }, [isOpen, initialIndex, images.length]);

  const hasMultiple = images.length > 1;

  const handlePrev = useCallback(() => {
    if (!hasMultiple) return;
    setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    setZoomScale(1);
  }, [hasMultiple, images.length]);

  const handleNext = useCallback(() => {
    if (!hasMultiple) return;
    setCurrentIndex((prev) => (prev + 1) % images.length);
    setZoomScale(1);
  }, [hasMultiple, images.length]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowLeft') handlePrev();
      if (e.key === 'ArrowRight') handleNext();
      if (e.key === '+' || e.key === '=') setZoomScale((z) => Math.min(2.5, Number((z + 0.35).toFixed(2))));
      if (e.key === '-') setZoomScale((z) => Math.max(1, Number((z - 0.35).toFixed(2))));
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose, handlePrev, handleNext]);

  if (!isOpen || images.length === 0) return null;

  const activeItem = images[currentIndex] || images[0];

  return (
    <div
      className="fixed inset-0 z-[120] flex flex-col bg-black/95 backdrop-blur-xl animate-in fade-in duration-200 select-none"
      role="dialog"
      aria-modal="true"
      aria-label={activeItem.title || 'Image lightbox viewer'}
      onClick={onClose}
    >
      {/* Top Toolbar */}
      <div
        className="flex items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 border-b border-zinc-800/80 bg-zinc-950/80 shrink-0"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            {activeItem.badge && (
              <span className="px-2 py-0.5 rounded bg-red-600/20 border border-red-500/40 text-red-400 text-[10px] font-mono font-bold uppercase shrink-0">
                {activeItem.badge}
              </span>
            )}
            <h3 className="font-heading font-bold text-sm sm:text-base text-white truncate">
              {activeItem.title || 'Media Preview'}
            </h3>
            {hasMultiple && (
              <span className="text-[11px] font-mono text-zinc-400 shrink-0">
                {currentIndex + 1} / {images.length}
              </span>
            )}
          </div>
          {activeItem.subtitle && (
            <p className="text-[11px] sm:text-xs text-zinc-400 truncate mt-0.5">{activeItem.subtitle}</p>
          )}
        </div>

        {/* Zoom & Close Controls */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setZoomScale((z) => Math.max(1, Number((z - 0.35).toFixed(2))))}
            disabled={zoomScale <= 1}
            aria-label="Zoom out"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white disabled:opacity-40 cursor-pointer transition"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-[11px] font-mono text-zinc-300 w-10 text-center hidden sm:inline-block">
            {Math.round(zoomScale * 100)}%
          </span>
          <button
            type="button"
            onClick={() => setZoomScale((z) => (z >= 2 ? 1 : Number((z + 0.5).toFixed(2))))}
            aria-label="Zoom in"
            className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer transition"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          {zoomScale > 1 && (
            <button
              type="button"
              onClick={() => setZoomScale(1)}
              aria-label="Reset zoom"
              className="min-w-[40px] min-h-[40px] flex items-center justify-center rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white cursor-pointer transition"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          )}
          <button
            type="button"
            onClick={onClose}
            aria-label="Close lightbox"
            className="min-w-[44px] min-h-[44px] flex items-center justify-center rounded-xl bg-red-600/90 hover:bg-red-500 text-white cursor-pointer transition ml-1"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Main Viewport Stage */}
      <div className="relative flex-1 min-h-0 flex items-center justify-center p-3 sm:p-8 overflow-auto">
        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handlePrev();
            }}
            aria-label="Previous image"
            className="absolute left-2 sm:left-6 top-1/2 -translate-y-1/2 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl bg-black/75 hover:bg-zinc-900 border border-zinc-700 text-white shadow-2xl cursor-pointer transition"
          >
            <ChevronLeft className="w-6 h-6" />
          </button>
        )}

        <div
          className="relative max-w-full max-h-full flex items-center justify-center transition-transform duration-200 ease-out"
          style={{ transform: `scale(${zoomScale})`, transformOrigin: 'center center' }}
          onClick={(e) => {
            e.stopPropagation();
            setZoomScale((z) => (z > 1 ? 1 : 1.75));
          }}
        >
          <img
            src={activeItem.url}
            alt={activeItem.title || 'Expanded preview'}
            className="max-h-[72vh] sm:max-h-[76vh] max-w-[92vw] sm:max-w-[84vw] w-auto h-auto object-contain rounded-2xl border border-zinc-800 shadow-2xl bg-zinc-950 cursor-zoom-in"
          />
          {zoomScale === 1 && (
            <span className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-black/70 border border-zinc-700 text-[10px] font-mono text-zinc-300 absolute bottom-3 right-3 pointer-events-none">
              <Maximize2 className="w-3 h-3 text-red-400" />
              Click image to zoom
            </span>
          )}
        </div>

        {hasMultiple && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              handleNext();
            }}
            aria-label="Next image"
            className="absolute right-2 sm:right-6 top-1/2 -translate-y-1/2 z-20 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-2xl bg-black/75 hover:bg-zinc-900 border border-zinc-700 text-white shadow-2xl cursor-pointer transition"
          >
            <ChevronRight className="w-6 h-6" />
          </button>
        )}
      </div>

      {/* Thumbnail Strip */}
      {hasMultiple && (
        <div
          className="px-4 py-3 border-t border-zinc-800/80 bg-zinc-950/90 flex items-center gap-2 overflow-x-auto justify-start sm:justify-center shrink-0"
          onClick={(e) => e.stopPropagation()}
        >
          {images.map((item, idx) => {
            const active = idx === currentIndex;
            return (
              <button
                key={`${item.url}-${idx}`}
                type="button"
                onClick={() => {
                  setCurrentIndex(idx);
                  setZoomScale(1);
                }}
                aria-label={`View ${item.title || `image ${idx + 1}`}`}
                className={`relative w-14 h-10 sm:w-16 sm:h-11 rounded-lg overflow-hidden border-2 shrink-0 transition cursor-pointer ${
                  active ? 'border-red-500 scale-105 shadow-lg' : 'border-zinc-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img src={item.url} alt={item.title || ''} className="w-full h-full object-cover" />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
