import React, { useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  Star,
  ThumbsUp,
  ShieldCheck,
  MessageSquarePlus,
  Lock,
  CheckCircle2,
  MapPin,
  Filter,
  Send,
  Trash2,
} from 'lucide-react';

interface SelectableTarget {
  id: string;
  name: string;
}

interface ReviewComponentProps {
  targetType: 'vehicle' | 'product' | 'all';
  targetId?: string;
  targetName?: string;
  selectableTargets?: SelectableTarget[];
  onOpenAuth?: () => void;
  compact?: boolean;
}

export const ReviewComponent: React.FC<ReviewComponentProps> = ({
  targetType,
  targetId,
  targetName,
  selectableTargets = [],
  onOpenAuth,
  compact = false,
}) => {
  const { reviews, addReview, markReviewHelpful, deleteReview, currentUser, userRole } = useApp();

  const [starFilter, setStarFilter] = useState<'all' | 5 | 4>('all');
  const [sortBy, setSortBy] = useState<'newest' | 'helpful' | 'rating'>('newest');
  const [showWriteForm, setShowWriteForm] = useState(false);
  const [helpfulClickedIds, setHelpfulClickedIds] = useState<string[]>([]);

  // Form states
  const [selectedTargetId, setSelectedTargetId] = useState<string>(
    targetId || selectableTargets[0]?.id || ''
  );
  const [rating, setRating] = useState<1 | 2 | 3 | 4 | 5>(5);
  const [hoverRating, setHoverRating] = useState<number>(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [visibleCount, setVisibleCount] = useState<number>(compact ? 4 : 9);

  const scopedReviews = useMemo(() => {
    return reviews.filter((r) => {
      if (targetId && r.targetId !== targetId) return false;
      if (!targetId && targetType !== 'all' && r.targetType !== targetType) return false;
      return true;
    });
  }, [reviews, targetId, targetType]);

  const filteredReviews = useMemo(() => {
    const base = scopedReviews.filter((r) => {
      if (starFilter === 5 && r.rating !== 5) return false;
      if (starFilter === 4 && r.rating !== 4) return false;
      return true;
    });

    return [...base].sort((a, b) => {
      if (sortBy === 'helpful') return b.helpfulCount - a.helpfulCount;
      if (sortBy === 'rating') return b.rating - a.rating;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  }, [scopedReviews, starFilter, sortBy]);

  const stats = useMemo(() => {
    const total = scopedReviews.length;
    if (total === 0) {
      return { avg: 4.9, total: 0, fiveStarPct: 88, fourStarPct: 12 };
    }
    const sum = scopedReviews.reduce((acc, r) => acc + r.rating, 0);
    const fiveCount = scopedReviews.filter((r) => r.rating === 5).length;
    const fourCount = scopedReviews.filter((r) => r.rating === 4).length;
    return {
      avg: Number((sum / total).toFixed(2)),
      total,
      fiveStarPct: Math.round((fiveCount / total) * 100),
      fourStarPct: Math.round((fourCount / total) * 100),
    };
  }, [scopedReviews]);

  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      if (onOpenAuth) onOpenAuth();
      return;
    }
    const resolvedId = targetId || selectedTargetId || selectableTargets[0]?.id || 'general-item';
    const resolvedName =
      targetName ||
      selectableTargets.find((t) => t.id === resolvedId)?.name ||
      'Apex Tesla Hub Verified Item';

    if (!title.trim() || comment.trim().length < 10) return;

    const ok = addReview({
      targetType: targetType === 'all' ? 'product' : targetType,
      targetId: resolvedId,
      targetName: resolvedName,
      rating,
      title,
      comment,
    });

    if (ok) {
      setTitle('');
      setComment('');
      setRating(5);
      setShowWriteForm(false);
    }
  };

  const handleHelpful = (id: string) => {
    if (helpfulClickedIds.includes(id)) return;
    setHelpfulClickedIds((prev) => [...prev, id]);
    markReviewHelpful(id);
  };

  const renderStars = (count: number, sizeClass = 'w-4 h-4') => (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <Star
          key={star}
          className={`${sizeClass} ${
            star <= count ? 'fill-amber-400 text-amber-400' : 'text-zinc-700'
          }`}
        />
      ))}
    </div>
  );

  return (
    <section className={compact ? 'space-y-4' : 'space-y-6 pt-8 border-t border-zinc-800/80'}>
      {/* Summary Header */}
      <div
        className={`rounded-3xl border border-zinc-800 bg-zinc-950/90 ${
          compact ? 'p-4 sm:p-5' : 'p-6 sm:p-8'
        } shadow-xl`}
      >
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          {/* Aggregate Rating Score */}
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            <div className="flex items-center gap-4">
              <div className="px-4 py-3 rounded-2xl bg-zinc-900 border border-zinc-800 text-center min-w-[96px]">
                <div className="font-heading font-black text-3xl text-white">
                  {stats.avg.toFixed(1)}
                </div>
                <div className="flex justify-center mt-1">{renderStars(Math.round(stats.avg), 'w-3.5 h-3.5')}</div>
                <span className="text-[10px] font-mono text-zinc-400 block mt-1">
                  {stats.total} {stats.total === 1 ? 'Review' : 'Reviews'}
                </span>
              </div>

              <div className="space-y-1.5 min-w-[160px] flex-1">
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-zinc-300 w-7">5 ★</span>
                  <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 rounded-full"
                      style={{ width: `${stats.fiveStarPct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-zinc-400 w-9 text-right">
                    {stats.fiveStarPct}%
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <span className="font-mono text-zinc-300 w-7">4 ★</span>
                  <div className="flex-1 h-2 rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 rounded-full"
                      style={{ width: `${stats.fourStarPct}%` }}
                    />
                  </div>
                  <span className="font-mono text-[11px] text-zinc-400 w-9 text-right">
                    {stats.fourStarPct}%
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center gap-1.5 text-emerald-400 text-xs font-bold uppercase tracking-wider">
                <ShieldCheck className="w-4 h-4" />
                <span>Verified Owner & Buyer Feedback</span>
              </div>
              <h3 className={`font-heading font-black text-white ${compact ? 'text-base' : 'text-xl sm:text-2xl'}`}>
                {targetName ? `Reviews for ${targetName}` : 'Customer Ratings & Verified Reviews'}
              </h3>
              <p className="text-xs text-zinc-400 max-w-md">
                Authentic 4–5 star experiences from confirmed Tesla vehicle owners and Apex hardware store buyers.
              </p>
            </div>
          </div>

          {/* Write Review CTA */}
          <div className="flex flex-wrap items-center gap-2.5 shrink-0">
            {currentUser ? (
              <button
                type="button"
                onClick={() => setShowWriteForm((prev) => !prev)}
                className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 text-white text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-950/40 transition cursor-pointer"
              >
                <MessageSquarePlus className="w-4 h-4" />
                <span>{showWriteForm ? 'Close Review Form' : 'Write a Verified Review'}</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => onOpenAuth && onOpenAuth()}
                className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 text-xs font-bold flex items-center gap-2 transition cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Sign In to Rate & Review</span>
              </button>
            )}
          </div>
        </div>

        {/* Authenticated Review Submission Form */}
        {showWriteForm && currentUser && (
          <form
            onSubmit={handleSubmitReview}
            className="mt-6 pt-6 border-t border-zinc-800 space-y-4 animate-in fade-in"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <img
                  src={currentUser.avatar}
                  alt={currentUser.name}
                  className="w-9 h-9 rounded-xl object-cover border border-zinc-700"
                />
                <div>
                  <span className="text-xs font-bold text-white block">{currentUser.name}</span>
                  <span className="text-[10px] font-mono text-emerald-400">
                    Posting as Authenticated {currentUser.tier}
                  </span>
                </div>
              </div>

              {/* Interactive Star Picker */}
              <div className="flex items-center gap-2 bg-zinc-900 border border-zinc-800 px-3 py-2 rounded-xl">
                <span className="text-[11px] font-mono text-zinc-400 mr-1">Your Rating:</span>
                {[1, 2, 3, 4, 5].map((starVal) => {
                  const active = (hoverRating || rating) >= starVal;
                  return (
                    <button
                      key={starVal}
                      type="button"
                      onMouseEnter={() => setHoverRating(starVal)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(starVal as 1 | 2 | 3 | 4 | 5)}
                      className="p-0.5 transition-transform hover:scale-110 cursor-pointer"
                      aria-label={`Rate ${starVal} stars`}
                    >
                      <Star
                        className={`w-5 h-5 ${
                          active ? 'fill-amber-400 text-amber-400' : 'text-zinc-600'
                        }`}
                      />
                    </button>
                  );
                })}
                <span className="text-xs font-mono font-bold text-amber-400 ml-1">
                  {hoverRating || rating}.0 / 5
                </span>
              </div>
            </div>

            {!targetId && selectableTargets.length > 0 && (
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Select Model / Product Reviewed
                </label>
                <select
                  value={selectedTargetId}
                  onChange={(e) => setSelectedTargetId(e.target.value)}
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-red-500"
                >
                  {selectableTargets.map((item) => (
                    <option key={item.id} value={item.id} className="bg-zinc-900">
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="grid grid-cols-1 gap-3">
              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Review Headline
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your ownership or product experience..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-[11px] font-mono text-zinc-400 mb-1">
                  Detailed Review (min. 10 characters)
                </label>
                <textarea
                  rows={3}
                  required
                  minLength={10}
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Share range performance, build quality, enclosed delivery turnaround, or fitment notes..."
                  className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowWriteForm(false)}
                className="px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!title.trim() || comment.trim().length < 10}
                className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Publish Verified Review</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Filter & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <Filter className="w-3.5 h-3.5 text-zinc-500 mr-1" />
          {[
            { id: 'all', label: `All (${scopedReviews.length})` },
            { id: 5, label: `5 Stars (${scopedReviews.filter((r) => r.rating === 5).length})` },
            { id: 4, label: `4 Stars (${scopedReviews.filter((r) => r.rating === 4).length})` },
          ].map((btn) => (
            <button
              key={String(btn.id)}
              type="button"
              onClick={() => setStarFilter(btn.id as 'all' | 5 | 4)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                starFilter === btn.id
                  ? 'bg-red-600 text-white shadow'
                  : 'bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              {btn.label}
            </button>
          ))}
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'newest' | 'helpful' | 'rating')}
          className="bg-zinc-900 border border-zinc-800 rounded-xl px-3 py-1.5 text-xs text-zinc-200 focus:outline-none focus:border-red-500 cursor-pointer"
        >
          <option value="newest">Sort: Most Recent</option>
          <option value="helpful">Sort: Most Helpful</option>
          <option value="rating">Sort: Highest Rating</option>
        </select>
      </div>

      {/* Reviews Grid */}
      {filteredReviews.length === 0 ? (
        <div className="p-8 rounded-3xl border border-zinc-800 bg-zinc-950/60 text-center space-y-2">
          <Star className="w-8 h-8 text-zinc-600 mx-auto" />
          <p className="text-sm font-bold text-white">No reviews yet for this filter</p>
          <p className="text-xs text-zinc-400">Be the first verified owner to share your rating.</p>
        </div>
      ) : (
        <>
          <div className={`grid gap-4 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'}`}>
            {filteredReviews.slice(0, visibleCount).map((rev) => {
              const isHelpfulClicked = helpfulClickedIds.includes(rev.id);
              return (
                <article
                  key={rev.id}
                  className="p-5 rounded-3xl border border-zinc-800/90 bg-zinc-950 flex flex-col justify-between space-y-4 hover:border-zinc-700 transition"
                >
                  <div className="space-y-3">
                    {/* Top Row */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <img
                          src={rev.userAvatar}
                          alt={rev.userName}
                          className="w-9 h-9 rounded-xl object-cover border border-zinc-800 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-white truncate">{rev.userName}</span>
                            {rev.verifiedPurchase && (
                              <span title="Verified Buyer" className="inline-flex shrink-0">
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              </span>
                            )}
                          </div>
                          {rev.userLocation && (
                            <span className="text-[10px] text-zinc-500 flex items-center gap-0.5 truncate">
                              <MapPin className="w-2.5 h-2.5 shrink-0" />
                              {rev.userLocation}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        {renderStars(rev.rating, 'w-3.5 h-3.5')}
                        <span className="text-[10px] font-mono text-zinc-500 block mt-0.5">{rev.createdAt}</span>
                      </div>
                    </div>

                    {/* Reviewed Target Name */}
                    {!targetId && (
                      <div className="px-2.5 py-1 rounded-lg bg-zinc-900 border border-zinc-800 text-[11px] font-mono text-zinc-300 truncate">
                        {rev.targetName}
                      </div>
                    )}

                    {/* Review Body */}
                    <div className="space-y-1">
                      <h4 className="font-heading font-bold text-sm text-white leading-snug">
                        {rev.title}
                      </h4>
                      <p className="text-xs text-zinc-400 leading-relaxed">{rev.comment}</p>
                    </div>
                  </div>

                  {/* Footer Actions */}
                  <div className="pt-3 border-t border-zinc-900 flex items-center justify-between text-[11px]">
                    <button
                      type="button"
                      onClick={() => handleHelpful(rev.id)}
                      className={`px-2.5 py-1 rounded-lg border flex items-center gap-1.5 transition cursor-pointer ${
                        isHelpfulClicked
                          ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'
                      }`}
                    >
                      <ThumbsUp className="w-3 h-3" />
                      <span>Helpful ({rev.helpfulCount})</span>
                    </button>

                    {(userRole === 'admin' || currentUser?.id === rev.userId) && (
                      <button
                        type="button"
                        onClick={() => deleteReview(rev.id)}
                        className="p-1.5 rounded-lg text-zinc-500 hover:text-rose-400 hover:bg-zinc-900 transition cursor-pointer"
                        title="Delete review"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </article>
              );
            })}
          </div>

          {filteredReviews.length > visibleCount && (
            <div className="text-center pt-2">
              <button
                type="button"
                onClick={() => setVisibleCount((prev) => prev + 6)}
                className="px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-white transition cursor-pointer"
              >
                Load More Verified Reviews ({filteredReviews.length - visibleCount} remaining)
              </button>
            </div>
          )}
        </>
      )}
    </section>
  );
};
