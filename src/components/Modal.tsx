import { useEffect, type ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
}

/** Базовое модальное окно-свиток с анимацией разворачивания и закрытием по ESC. */
export default function Modal({ open, onClose, children }: ModalProps) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          onClick={onClose}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
        >
          <motion.div
            className="modal"
            onClick={(e) => e.stopPropagation()}
            initial={{ scaleY: 0.1, opacity: 0 }}
            animate={{ scaleY: 1, opacity: 1 }}
            exit={{ scaleY: 0.1, opacity: 0 }}
            transition={{ duration: 0.35, ease: 'easeOut' }}
            style={{ transformOrigin: 'top center' }}
          >
            <button className="modal-close" onClick={onClose} aria-label="Закрыть">
              ✕
            </button>
            <div className="modal-inner">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
