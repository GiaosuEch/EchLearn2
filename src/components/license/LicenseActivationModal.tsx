import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { KeyRound, CheckCircle2, AlertCircle, ClipboardPaste, X, ShieldCheck, Sparkles } from 'lucide-react';
import { EchBuriAnimated, type EchBuriAnimationState } from '../mascot/EchBuriAnimated';
import {
  formatLicenseInput,
  validateLicenseKeyLocally,
  type LicenseValidationResult,
} from '../../lib/licenseCrypto';
import {
  redeemLicenseKey,
  getActiveLocalLicense,
  type StoredLicenseInfo,
} from '../../services/licenseVerificationService';
import { useAuthStore } from '../../stores/authStore';

export interface LicenseActivationModalProps {
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onActivated?: (plan: string) => void;
}

export const LicenseActivationModal: React.FC<LicenseActivationModalProps> = ({
  isOpen,
  onClose,
  onActivated,
}) => {
  const [inputValue, setInputValue] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [localFeedback, setLocalFeedback] = useState<LicenseValidationResult | null>(null);
  const [serverMessage, setServerMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [mascotState, setMascotState] = useState<EchBuriAnimationState>('welcome');
  const [currentLicense, setCurrentLicense] = useState<StoredLicenseInfo | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (isOpen) {
      setCurrentLicense(getActiveLocalLicense());
      setInputValue('');
      setServerMessage(null);
      setLocalFeedback(null);
      setMascotState('welcome');
      setTimeout(() => inputRef.current?.focus(), 150);
    }
  }, [isOpen]);

  const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatLicenseInput(raw);
    setInputValue(formatted);
    setServerMessage(null);

    if (formatted.length >= 20) {
      const check = await validateLicenseKeyLocally(formatted);
      setLocalFeedback(check);
      if (check.valid) {
        setMascotState('cheering');
      } else {
        setMascotState('thinking');
      }
    } else {
      setLocalFeedback(null);
      setMascotState('idle');
    }
  };

  const handlePaste = async () => {
    try {
      if (navigator.clipboard?.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          const formatted = formatLicenseInput(text);
          setInputValue(formatted);
          const check = await validateLicenseKeyLocally(formatted);
          setLocalFeedback(check);
          if (check.valid) setMascotState('cheering');
        }
      }
    } catch {
      // Clipboard access not allowed
    }
  };

  const handleRedeem = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputValue.trim()) return;

    setIsValidating(true);
    setMascotState('loading');
    setServerMessage(null);

    try {
      const result = await redeemLicenseKey(
        inputValue,
        user?.id || 'learner-vip-session',
        user?.email
      );

      if (result.success) {
        setMascotState('success');
        setServerMessage({ text: result.message, type: 'success' });
        setCurrentLicense(getActiveLocalLicense());
        if (onActivated && result.plan) {
          onActivated(result.plan);
        }
      } else {
        setMascotState('incorrect');
        setServerMessage({ text: result.message, type: 'error' });
      }
    } catch {
      setMascotState('incorrect');
      setServerMessage({
        text: 'Có lỗi phát sinh trong quá trình kích hoạt. Vui lòng kiểm tra lại mã hoặc kết nối mạng.',
        type: 'error',
      });
    } finally {
      setIsValidating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6" role="dialog" aria-modal="true">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-xs"
        />

        {/* Modal Window */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: 'easeOut' }}
          className="relative w-full max-w-lg rounded-2xl border border-[var(--ech-border)] bg-[var(--ech-surface)] p-6 text-[var(--ech-text)] shadow-xl sm:p-8"
        >
          {/* Header with Mascot & Close */}
          <div className="flex items-start justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="shrink-0">
                <EchBuriAnimated size={64} state={mascotState} />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400">
                  <ShieldCheck size={13} />
                  Kích hoạt Bản Quyền
                </span>
                <h2 className="mt-1 text-lg font-bold sm:text-xl">
                  Nhập License Key VIP
                </h2>
              </div>
            </div>

            <button
              onClick={onClose}
              className="rounded-lg p-1.5 text-[var(--ech-text-muted)] hover:bg-[var(--ech-surface-2)] hover:text-[var(--ech-text)] transition"
              aria-label="Đóng cửa sổ"
            >
              <X size={20} />
            </button>
          </div>

          {/* Current Active License Status */}
          {currentLicense && (
            <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-50/50 dark:bg-emerald-950/20 p-3.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                  <CheckCircle2 size={14} className="text-emerald-600" />
                  Đang hoạt động: Gói {currentLicense.plan.toUpperCase()}
                </span>
                <span className="text-[var(--ech-text-muted)]">
                  Đã liên kết thiết bị
                </span>
              </div>
              <p className="mt-1 font-mono text-[11px] text-[var(--ech-text-muted)] truncate">
                Mã: {currentLicense.key}
              </p>
            </div>
          )}

          {/* Key Input Form */}
          <form onSubmit={handleRedeem} className="mt-5 space-y-4">
            <div>
              <div className="flex items-center justify-between">
                <label htmlFor="license-key-input" className="block text-xs font-semibold uppercase tracking-wider text-[var(--ech-text-muted)]">
                  Mã bản quyền (Serial Key)
                </label>
                <button
                  type="button"
                  onClick={handlePaste}
                  className="inline-flex items-center gap-1 text-xs text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 font-medium transition cursor-pointer"
                >
                  <ClipboardPaste size={13} />
                  <span>Dán từ clipboard</span>
                </button>
              </div>

              <div className="relative mt-1.5">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--ech-text-muted)]">
                  <KeyRound size={16} />
                </div>
                <input
                  id="license-key-input"
                  ref={inputRef}
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder="ECHLEARN-XXXXXXXXXXXX-XXXXXXXX"
                  maxLength={36}
                  autoComplete="off"
                  spellCheck={false}
                  className="w-full rounded-xl border border-[var(--ech-border)] bg-[var(--ech-surface-2)] pl-10 pr-28 py-2.5 font-mono text-xs uppercase tracking-wider text-[var(--ech-text)] placeholder:text-[var(--ech-text-muted)] focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />

                {/* Local HMAC status badge */}
                {localFeedback && (
                  <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                    {localFeedback.valid ? (
                      <span className="flex items-center gap-1 rounded-md bg-emerald-500/15 px-2 py-0.5 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
                        <Sparkles size={12} /> {localFeedback.targetPlan?.toUpperCase()}
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 rounded-md bg-rose-500/15 px-2 py-0.5 text-[11px] font-semibold text-rose-600 dark:text-rose-400">
                        Chưa khớp
                      </span>
                    )}
                  </div>
                )}
              </div>
              <p className="mt-1.5 text-[11px] text-[var(--ech-text-muted)]">
                Mã bản quyền gồm 3 cụm (ví dụ: ECHLEARN-9F3A1C77D2E4-8C41F9AA) do ban quản trị hoặc đối tác cấp.
              </p>
            </div>

            {/* Server Message Feedback */}
            {serverMessage && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-3 text-xs font-medium flex items-start gap-2 ${
                  serverMessage.type === 'success'
                    ? 'border border-emerald-500/30 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-800 dark:text-emerald-300'
                    : 'border border-rose-500/30 bg-rose-50 dark:bg-rose-950/30 text-rose-800 dark:text-rose-300'
                }`}
              >
                {serverMessage.type === 'success' ? (
                  <CheckCircle2 size={16} className="shrink-0 text-emerald-600 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="shrink-0 text-rose-600 mt-0.5" />
                )}
                <span>{serverMessage.text}</span>
              </motion.div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2.5 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 rounded-xl border border-[var(--ech-border)] bg-[var(--ech-surface)] py-2.5 text-xs font-semibold text-[var(--ech-text)] hover:bg-[var(--ech-surface-2)] transition cursor-pointer"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={isValidating || !inputValue.trim()}
                className="flex-[2] rounded-xl bg-emerald-600 hover:bg-emerald-500 py-2.5 text-xs font-bold text-white shadow-sm transition active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
              >
                {isValidating ? 'Đang xác thực...' : 'Kích Hoạt Ngay'}
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
