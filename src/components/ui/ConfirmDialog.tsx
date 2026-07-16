import { motion, AnimatePresence } from 'motion/react';
import { AlertCircle, CheckCircle, Info, X } from 'lucide-react';
import type { ReactNode } from 'react';

export type ConfirmDialogType = 'danger' | 'warning' | 'info' | 'success';

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  message: string | ReactNode;
  confirmText?: string;
  cancelText?: string;
  type?: ConfirmDialogType;
  isLoading?: boolean;
}

export default function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  type = 'warning',
  isLoading = false
}: ConfirmDialogProps) {
  if (!isOpen) return null;

  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertCircle className="w-6 h-6 text-error" />,
          bg: 'bg-error/10',
          btn: 'bg-error hover:bg-error/90 text-white',
          border: 'border-error/20'
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-6 h-6 text-orange-500" />,
          bg: 'bg-orange-500/10',
          btn: 'bg-orange-500 hover:bg-orange-600 text-white',
          border: 'border-orange-500/20'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-6 h-6 text-success" />,
          bg: 'bg-success/10',
          btn: 'bg-success hover:bg-success/90 text-white',
          border: 'border-success/20'
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-6 h-6 text-primary-500" />,
          bg: 'bg-primary-500/10',
          btn: 'bg-primary-500 hover:bg-primary-600 text-white',
          border: 'border-primary-500/20'
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="relative w-full max-w-md bg-dark-900 border border-dark-700 rounded-2xl shadow-xl overflow-hidden z-10"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className={`p-3 rounded-xl ${styles.bg} ${styles.border} border`}>
                  {styles.icon}
                </div>
                <button
                  onClick={onClose}
                  className="p-2 text-dark-400 hover:text-white hover:bg-dark-800 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
              
              <h3 className="text-xl font-bold text-white mb-2">{title}</h3>
              <div className="text-dark-300 text-sm leading-relaxed mb-6">
                {message}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  disabled={isLoading}
                  className="flex-1 px-4 py-2.5 bg-dark-800 hover:bg-dark-700 text-white font-medium rounded-xl transition-colors disabled:opacity-50"
                >
                  {cancelText}
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isLoading}
                  className={`flex-1 px-4 py-2.5 font-medium rounded-xl transition-colors disabled:opacity-50 flex items-center justify-center ${styles.btn}`}
                >
                  {isLoading ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    confirmText
                  )}
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
