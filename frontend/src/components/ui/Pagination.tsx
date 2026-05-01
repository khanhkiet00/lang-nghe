'use client';

import { motion } from 'framer-motion';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function Pagination({ currentPage, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  const pages = [];
  const maxVisiblePages = 5;
  
  let startPage = Math.max(1, currentPage - Math.floor(maxVisiblePages / 2));
  let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

  if (endPage - startPage + 1 < maxVisiblePages) {
    startPage = Math.max(1, endPage - maxVisiblePages + 1);
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  return (
    <div className="flex items-center justify-center gap-2 mt-12 py-8">
      <button
        onClick={() => onPageChange(1)}
        disabled={currentPage === 1}
        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-black/5 text-on-surface-variant/40 hover:text-[#c84b31] disabled:opacity-30 transition-all hover:bg-[#c84b31]/5"
      >
        <span className="material-symbols-outlined text-xl">first_page</span>
      </button>

      <button
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-black/5 text-on-surface-variant/40 hover:text-[#c84b31] disabled:opacity-30 transition-all hover:bg-[#c84b31]/5"
      >
        <span className="material-symbols-outlined text-xl">chevron_left</span>
      </button>

      <div className="flex items-center gap-2 px-4">
        {pages.map((p) => (
          <button
            key={p}
            onClick={() => onPageChange(p)}
            className={`h-10 w-10 rounded-xl text-xs font-black transition-all ${
              currentPage === p
                ? 'bg-[#c84b31] text-white shadow-lg shadow-[#c84b31]/20'
                : 'bg-white border border-black/5 text-on-surface-variant hover:text-[#c84b31] hover:bg-[#c84b31]/5'
            }`}
          >
            {p}
          </button>
        ))}
        {endPage < totalPages && (
          <>
            <span className="text-zinc-300">...</span>
            <button
               onClick={() => onPageChange(totalPages)}
               className="h-10 w-10 rounded-xl bg-white border border-black/5 text-xs font-black text-on-surface-variant hover:text-[#c84b31] hover:bg-[#c84b31]/5 transition-all"
            >
              {totalPages}
            </button>
          </>
        )}
      </div>

      <button
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-black/5 text-on-surface-variant/40 hover:text-[#c84b31] disabled:opacity-30 transition-all hover:bg-[#c84b31]/5"
      >
        <span className="material-symbols-outlined text-xl">chevron_right</span>
      </button>

      <button
        onClick={() => onPageChange(totalPages)}
        disabled={currentPage === totalPages}
        className="h-10 w-10 flex items-center justify-center rounded-xl bg-white border border-black/5 text-on-surface-variant/40 hover:text-[#c84b31] disabled:opacity-30 transition-all hover:bg-[#c84b31]/5"
      >
        <span className="material-symbols-outlined text-xl">last_page</span>
      </button>
    </div>
  );
}
