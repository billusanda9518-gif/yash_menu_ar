'use client';

import React from 'react';

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Visible label rendered above the input. */
  label?: string;
  /** Error message — triggers the error variant automatically. */
  error?: string;
  /** Helper text shown below the input (hidden when error is present). */
  helperText?: string;
  /** Leading icon (ReactNode, typically a lucide-react icon). */
  icon?: React.ReactNode;
  /** Explicit variant override. Defaults to 'error' when `error` prop is set. */
  variant?: 'default' | 'error';
  /** HTML id — also used for label `htmlFor`. Auto-generated if omitted. */
  id?: string;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

let counter = 0;
function useStableId(explicitId?: string) {
  const ref = React.useRef(explicitId ?? `input-${++counter}`);
  return explicitId ?? ref.current;
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    {
      className,
      label,
      error,
      helperText,
      icon,
      variant,
      id: idProp,
      disabled,
      ...props
    },
    ref,
  ) => {
    const id = useStableId(idProp);
    const resolvedVariant = variant ?? (error ? 'error' : 'default');
    const errorId = error ? `${id}-error` : undefined;
    const helperId = helperText && !error ? `${id}-helper` : undefined;

    return (
      <div className="flex flex-col gap-1.5">
        {/* Label */}
        {label && (
          <label
            htmlFor={id}
            className={cn(
              'text-sm font-medium',
              disabled ? 'text-muted-foreground' : 'text-foreground',
            )}
          >
            {label}
          </label>
        )}

        {/* Input wrapper */}
        <div className="relative">
          {/* Leading icon */}
          {icon && (
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              {icon}
            </span>
          )}

          <input
            ref={ref}
            id={id}
            disabled={disabled}
            aria-invalid={resolvedVariant === 'error' || undefined}
            aria-describedby={
              [errorId, helperId].filter(Boolean).join(' ') || undefined
            }
            className={cn(
              // Base
              'flex h-10 w-full rounded-md border bg-transparent px-3 py-2 text-sm',
              'placeholder:text-muted-foreground',
              'transition-colors duration-200',
              'file:border-0 file:bg-transparent file:text-sm file:font-medium',
              // Focus
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-0',
              // Disabled
              'disabled:cursor-not-allowed disabled:opacity-50',
              // Variant
              resolvedVariant === 'error'
                ? 'border-destructive focus-visible:ring-destructive/40'
                : 'border-input focus-visible:ring-ring/50',
              // Icon padding
              !!icon && 'pl-10',
              className,
            )}
            {...props}
          />
        </div>

        {/* Error message */}
        {error && (
          <p id={errorId} className="text-xs text-destructive" role="alert">
            {error}
          </p>
        )}

        {/* Helper text */}
        {!error && helperText && (
          <p id={helperId} className="text-xs text-muted-foreground">
            {helperText}
          </p>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';

export { Input };
