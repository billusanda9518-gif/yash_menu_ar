'use client';

import { Toaster, toast } from 'sonner';

/* ------------------------------------------------------------------ */
/*  ToastProvider                                                      */
/* ------------------------------------------------------------------ */

export function ToastProvider() {
  return (
    <Toaster
      theme="dark"
      position="bottom-right"
      toastOptions={{
        className: 'border-border',
        style: {
          background: '#18181b',
          border: '1px solid #27272a',
          color: '#fafafa',
          fontSize: '14px',
        },
      }}
      closeButton
      richColors
      gap={8}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  showToast utility                                                   */
/* ------------------------------------------------------------------ */

export const showToast = {
  /** Green success toast. */
  success(message: string, description?: string) {
    toast.success(message, { description });
  },

  /** Red error toast. */
  error(message: string, description?: string) {
    toast.error(message, { description });
  },

  /** Neutral info toast. */
  info(message: string, description?: string) {
    toast.info(message, { description });
  },

  /** Yellow warning toast. */
  warning(message: string, description?: string) {
    toast.warning(message, { description });
  },

  /** Generic message toast. */
  message(message: string, description?: string) {
    toast.message(message, { description });
  },

  /** Promise-based toast — shows loading → success / error automatically. */
  promise<T>(
    promise: Promise<T>,
    opts: {
      loading: string;
      success: string | ((data: T) => string);
      error: string | ((err: unknown) => string);
    },
  ) {
    return toast.promise(promise, opts);
  },
};
