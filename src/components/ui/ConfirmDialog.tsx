import type { ReactNode } from 'react';
import { AlertCircle, CheckCircle, Info } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from './dialog';
import { Button } from './button';

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
  const getTypeStyles = () => {
    switch (type) {
      case 'danger':
        return {
          icon: <AlertCircle className="w-6 h-6 text-rose-500" />,
          bg: 'bg-rose-500/10 border-rose-500/20',
          btnVariant: 'destructive' as const,
        };
      case 'warning':
        return {
          icon: <AlertCircle className="w-6 h-6 text-amber-500" />,
          bg: 'bg-amber-500/10 border-amber-500/20',
          btnVariant: 'default' as const,
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-6 h-6 text-emerald-500" />,
          bg: 'bg-emerald-500/10 border-emerald-500/20',
          btnVariant: 'default' as const,
        };
      case 'info':
      default:
        return {
          icon: <Info className="w-6 h-6 text-blue-500" />,
          bg: 'bg-blue-500/10 border-blue-500/20',
          btnVariant: 'default' as const,
        };
    }
  };

  const styles = getTypeStyles();

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="space-y-3">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center border ${styles.bg}`}>
            {styles.icon}
          </div>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {typeof message === 'string' ? message : <div>{message}</div>}
          </DialogDescription>
        </DialogHeader>

        <DialogFooter className="gap-2 sm:gap-0 mt-4">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={isLoading}
            className="flex-1"
          >
            {cancelText}
          </Button>
          <Button
            variant={styles.btnVariant}
            onClick={onConfirm}
            disabled={isLoading}
            className="flex-1"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              confirmText
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
