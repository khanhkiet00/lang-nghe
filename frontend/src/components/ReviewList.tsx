'use client';

import { useEffect, useState } from 'react';
import { ReviewAttachments } from '@/components/ReviewAttachments';
import { api } from '@/lib/api';

type ReviewItem = {
  id: string;
  comment?: string | null;
  createdAt: string;
  rating?: number;
  rating_quality?: number;
  rating_accuracy?: number;
  rating_shipping?: number;
  rating_communication?: number;
  rating_payment?: number;
  images?: string[] | null;
  likeCount?: number;
  dislikeCount?: number;
  replies?: Array<{
    id: string;
    content: string;
    createdAt: string;
    author?: {
      profile?: {
        display_name?: string | null;
      } | null;
    } | null;
  }>;
  reviewer?: {
    profile?: {
      display_name?: string | null;
    } | null;
  } | null;
};

function getReviewAverage(review: ReviewItem) {
  if (typeof review.rating === 'number') {
    return review.rating.toFixed(1).replace('.0', '');
  }

  return (
    ((review.rating_quality ?? 0) +
      (review.rating_accuracy ?? 0) +
      (review.rating_shipping ?? 0) +
      (review.rating_communication ?? 0) +
      (review.rating_payment ?? 0)) /
    5
  )
    .toFixed(1)
    .replace('.0', '');
}

export function ReviewList({
  reviews,
  reviewCount,
  title = 'Đánh giá từ cộng đồng',
  emptyMessage = 'Chưa có đánh giá sau giao dịch.',
  initialVisibleCount = 2,
  showAttachments = true,
  reviewKind = 'product',
}: {
  reviews: ReviewItem[];
  reviewCount: number;
  title?: string;
  emptyMessage?: string;
  initialVisibleCount?: number;
  showAttachments?: boolean;
  reviewKind?: 'artisan' | 'product';
}) {
  const [localReviews, setLocalReviews] = useState(reviews);
  const [visibleCount, setVisibleCount] = useState(initialVisibleCount);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [submittingReplyId, setSubmittingReplyId] = useState<string | null>(null);
  const visibleReviews = localReviews.slice(0, visibleCount);
  const canShowMore = visibleCount < localReviews.length;
  const reactionBasePath = reviewKind === 'artisan' ? 'reviews' : 'product-reviews';

  useEffect(() => {
    setLocalReviews(reviews);
  }, [reviews]);

  const updateReview = (reviewId: string, updater: (review: ReviewItem) => ReviewItem) => {
    setLocalReviews((current) =>
      current.map((review) => (review.id === reviewId ? updater(review) : review)),
    );
  };

  const handleReaction = async (reviewId: string, value: 'like' | 'dislike') => {
    const res = await api.post(`/${reactionBasePath}/${reviewId}/reaction`, { value });
    if (!res.ok) return;
    const json = await res.json();

    updateReview(reviewId, (review) => ({
      ...review,
      likeCount: json.data?.likeCount ?? review.likeCount ?? 0,
      dislikeCount: json.data?.dislikeCount ?? review.dislikeCount ?? 0,
    }));
  };

  const handleReply = async (reviewId: string) => {
    const content = replyDrafts[reviewId]?.trim();
    if (!content) return;

    setSubmittingReplyId(reviewId);
    try {
      const res = await api.post(`/${reactionBasePath}/${reviewId}/replies`, { content });
      if (!res.ok) return;
      const json = await res.json();
      updateReview(reviewId, (review) => ({
        ...review,
        replies: [...(review.replies || []), json.data],
      }));
      setReplyDrafts((current) => ({ ...current, [reviewId]: '' }));
    } finally {
      setSubmittingReplyId(null);
    }
  };

  return (
    <div className="space-y-12">
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <h2 className="text-4xl font-extrabold tracking-tighter">{title}</h2>
        <span className="font-bold text-[#A6331B]">{reviewCount} đánh giá</span>
      </div>
      {localReviews.length > 0 ? (
        <>
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
            {visibleReviews.map((review) => (
              <article key={review.id} className="rounded-2xl bg-white p-10 shadow-[0_20px_40px_-12px_rgba(26,28,28,0.08)]">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-bold">{review.reviewer?.profile?.display_name || 'Người mua đã xác thực'}</p>
                    <p className="text-xs font-bold uppercase tracking-widest text-[#58413C]">
                      {new Date(review.createdAt).toLocaleDateString('vi-VN')}
                    </p>
                  </div>
                  <div className="font-black text-yellow-500">★ {getReviewAverage(review)}</div>
                </div>
                <p className="mt-6 italic leading-relaxed text-[#58413C]">
                  {review.comment || 'Người đánh giá chưa để lại bình luận.'}
                </p>
                {showAttachments && <ReviewAttachments images={review.images} />}

                <div className="mt-6 flex flex-wrap items-center gap-3 border-t border-zinc-100 pt-4">
                  <button
                    onClick={() => handleReaction(review.id, 'like')}
                    className="flex items-center gap-1.5 rounded-full bg-zinc-50 px-3 py-1.5 text-xs font-bold text-[#4A5D23] transition-colors hover:bg-[#4A5D23]/10"
                  >
                    <span className="material-symbols-outlined text-base">thumb_up</span>
                    Hữu ích ({review.likeCount || 0})
                  </button>
                  <button
                    onClick={() => handleReaction(review.id, 'dislike')}
                    className="flex items-center gap-1.5 rounded-full bg-zinc-50 px-3 py-1.5 text-xs font-bold text-zinc-500 transition-colors hover:bg-zinc-100"
                  >
                    <span className="material-symbols-outlined text-base">thumb_down</span>
                    Không hữu ích ({review.dislikeCount || 0})
                  </button>
                </div>

                {(review.replies?.length || 0) > 0 && (
                  <div className="mt-5 space-y-3 rounded-2xl bg-zinc-50 p-4">
                    {review.replies?.map((reply) => (
                      <div key={reply.id} className="text-sm">
                        <div className="font-black text-[#1A1C1C]">
                          {reply.author?.profile?.display_name || 'Người dùng'}
                        </div>
                        <p className="mt-1 leading-relaxed text-[#58413C]">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}

                <div className="mt-4 flex gap-2">
                  <input
                    value={replyDrafts[review.id] || ''}
                    onChange={(event) =>
                      setReplyDrafts((current) => ({
                        ...current,
                        [review.id]: event.target.value,
                      }))
                    }
                    placeholder="Trả lời đánh giá này..."
                    className="min-w-0 flex-1 rounded-xl border border-zinc-200 bg-white px-4 py-2 text-sm font-medium outline-none transition-colors focus:border-[#A6331B]"
                  />
                  <button
                    onClick={() => handleReply(review.id)}
                    disabled={submittingReplyId === review.id}
                    className="rounded-xl bg-[#1A1C1C] px-4 py-2 text-xs font-black uppercase tracking-widest text-white transition-colors hover:bg-[#A6331B] disabled:opacity-60"
                  >
                    Gửi
                  </button>
                </div>
              </article>
            ))}
          </div>

          {localReviews.length > initialVisibleCount && (
            <div className="flex justify-center">
              <button
                onClick={() => setVisibleCount(canShowMore ? visibleCount + 4 : initialVisibleCount)}
                className="rounded-full bg-[#1A1C1C] px-7 py-3 text-sm font-black uppercase tracking-widest text-white transition-all hover:bg-[#A6331B]"
              >
                {canShowMore ? 'Xem thêm đánh giá' : 'Thu gọn'}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="rounded-2xl bg-white p-10 text-center text-sm font-bold text-[#58413C]">
          {emptyMessage}
        </div>
      )}
    </div>
  );
}
