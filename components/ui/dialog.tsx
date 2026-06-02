'use client';

import React, { useCallback, useEffect, useRef } from 'react';
import { X } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------ */
/*  Dialog (root)                                                      */
/* ------------------------------------------------------------------ */

export interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  className?: string;
}

function Dialog({ open, onClose, children, className }: DialogProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  /* Sync open prop with native dialog */
  useEffect(() => {
    const el = dialogRef.current;
    if (!el) return;

    if (open && !el.open) {
      el.showModal();
    } else if (!open && el.open) {
      el.close();
    }
  }, [open]);

  /* Native close event (Escape key, etc.) */
  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  /* Backdrop click detection */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      const el = dialogRef.current;
      if (!el) return;
      // The <dialog> element itself is the backdrop area
      const rect = el.getBoundingClientRect();
      const clickedInside =
        e.clientX >= rect.left &&
        e.clientX <= rect.right &&
        e.clientY >= rect.top &&
        e.clientY <= rect.bottom;

      if (!clickedInside) {
        onClose();
      }
    },
    [onClose],
  );

  /* Close when clicking the backdrop padding around the content */
  const handleBackdropClick = useCallback(
    (e: React.MouseEvent<HTMLDialogElement>) => {
      if (e.target === dialogRef.current) {
        onClose();
      }
    },
    [onClose],
  );

  return (
    <dialog
      ref={dialogRef}
      onClose={handleClose}
      onClick={handleBackdropClick}
      className={cn(
        // Reset
        'max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-border',
        'bg-card p-0 text-card-foreground shadow-xl',
        // Backdrop
        'backdrop:bg-black/60 backdrop:backdrop-blur-sm',
        // Open animation
        'open:animate-slide-up',
        // Closed state
        'opacity-0 open:opacity-100',
        // Transitions
        'transition-opacity duration-200',
        className,
      )}
    >
      <div className="relative p-6">{children}</div>
    </dialog>
  );
}

/* ------------------------------------------------------------------ */
/*  DialogTitle                                                        */
/* ------------------------------------------------------------------ */

function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn(
        'text-lg font-semibold leading-none tracking-tight',
        className,
      )}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  DialogDescription                                                  */
/* ------------------------------------------------------------------ */

function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn('mt-2 text-sm text-muted-foreground', className)}
      {...props}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  DialogClose                                                        */
/* ------------------------------------------------------------------ */

export interface DialogCloseProps {
  onClose: () => void;
  className?: string;
}

function DialogClose({ onClose, className }: DialogCloseProps) {
  return (
    <button
      type="button"
      onClick={onClose}
      aria-label="Close dialog"
      className={cn(
        'absolute right-4 top-4 rounded-sm p-1',
        'text-muted-foreground transition-colors hover:text-foreground',
        'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
        'cursor-pointer',
        className,
      )}
    >
      <X size={18} />
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  DialogFooter                                                       */
/* ------------------------------------------------------------------ */

function DialogFooter({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end',
        className,
      )}
      {...props}
    />
  );
}

export { Dialog, DialogTitle, DialogDescription, DialogClose, DialogFooter };
