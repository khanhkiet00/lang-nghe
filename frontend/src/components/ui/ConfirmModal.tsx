'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info';
}

export default function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Xác nhận',
  cancelText = 'Hủy',
  type = 'info',
}: ConfirmModalProps) {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 20 }}
          className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white p-8 shadow-2xl"
        >
          <div className="flex flex-col items-center text-center">
            <div className={`mb-6 flex h-16 w-16 items-center justify-center rounded-full ${
              type === 'danger' ? 'bg-red-50 text-red-500' : 'bg-[#c84b31]/5 text-[#c84b31]'
            }`}>
              <span className="material-symbols-outlined text-3xl">
                {type === 'danger' ? 'warning' : 'info'}
              </span>
            </div>
            
            <h3 className="mb-2 text-2xl font-black tracking-tight text-[#1a1c1c]">
              {title}
            </h3>
            <p className="mb-8 text-zinc-500 leading-relaxed">
              {message}
            </p>

            <div className="flex w-full gap-3">
              <button
                onClick={onClose}
                className="flex-1 rounded-xl bg-zinc-100 py-4 text-sm font-bold text-zinc-600 transition-all hover:bg-zinc-200 active:scale-[0.98]"
              >
                {cancelText}
              </button>
              <button
                onClick={() => {
                  onConfirm();
                  onClose();
                }}
                className={`flex-1 rounded-xl py-4 text-sm font-bold text-white shadow-lg transition-all active:scale-[0.98] ${
                  type === 'danger' 
                    ? 'bg-red-500 shadow-red-500/20 hover:bg-red-600' 
                    : 'bg-[#c84b31] shadow-[#c84b31]/20 hover:opacity-90'
                }`}
              >
                {confirmText}
              </button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
