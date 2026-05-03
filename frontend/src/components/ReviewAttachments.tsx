'use client';

import { useState } from 'react';
import { resolveImageUrl } from '@/lib/images';

type ReviewAttachmentsProps = {
  images?: string[] | null;
};

function isVideoUrl(url: string) {
  return /\/video\/upload\//.test(url) || /\.(mp4|webm|mov)(\?|#|$)/i.test(url);
}

export function ReviewAttachments({ images }: ReviewAttachmentsProps) {
  const attachments = images?.filter(Boolean) ?? [];
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  if (attachments.length === 0) {
    return null;
  }

  const normalizedAttachments = attachments.slice(0, 6).map((url) => resolveImageUrl(url));
  const activeSrc = activeIndex !== null ? normalizedAttachments[activeIndex] : null;
  const activeIsVideo = activeSrc ? isVideoUrl(activeSrc) : false;
  const showPrevious = () =>
    setActiveIndex((current) =>
      current === null
        ? null
        : (current - 1 + normalizedAttachments.length) % normalizedAttachments.length,
    );
  const showNext = () =>
    setActiveIndex((current) =>
      current === null ? null : (current + 1) % normalizedAttachments.length,
    );

  return (
    <>
      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {normalizedAttachments.map((src, index) => {
          const isVideo = isVideoUrl(src);

          return (
            <button
              key={`${src}-${index}`}
              type="button"
              onClick={() => setActiveIndex(index)}
              className="group relative aspect-square overflow-hidden rounded-2xl bg-stone-100 ring-1 ring-black/5"
            >
              {isVideo ? (
                <>
                  <video src={src} className="h-full w-full object-cover" muted playsInline preload="metadata" />
                  <span className="material-symbols-outlined absolute left-1/2 top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-black/55 text-white">
                    play_arrow
                  </span>
                </>
              ) : (
                <img
                  src={src}
                  alt={`Ảnh đánh giá ${index + 1}`}
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              )}
            </button>
          );
        })}
      </div>

      {activeSrc && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
          <button
            type="button"
            onClick={() => setActiveIndex(null)}
            className="absolute right-5 top-5 flex h-11 w-11 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
            aria-label="Đóng xem media"
          >
            <span className="material-symbols-outlined">close</span>
          </button>

          {normalizedAttachments.length > 1 && (
            <>
              <button
                type="button"
                onClick={showPrevious}
                className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Media trước"
              >
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button
                type="button"
                onClick={showNext}
                className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                aria-label="Media sau"
              >
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </>
          )}

          <div className="max-h-[86vh] w-full max-w-5xl overflow-hidden rounded-3xl bg-black shadow-2xl">
            {activeIsVideo ? (
              <video src={activeSrc} className="max-h-[86vh] w-full bg-black object-contain" controls autoPlay />
            ) : (
              <img src={activeSrc} alt="Media đánh giá" className="max-h-[86vh] w-full object-contain" />
            )}
          </div>
        </div>
      )}
    </>
  );
}
