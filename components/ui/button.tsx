'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

/* ------------------------------------------------------------------ */
/*  Variant / size style maps                                         */
/* ------------------------------------------------------------------ */

const variantStyles = {
  default:
    'bg-primary text-primary-foreground shadow-sm hover:bg-orange-600 active:bg-orange-700',
  secondary:
    'bg-secondary text-secondary-foreground shadow-sm hover:bg-zinc-700 active:bg-zinc-600',
  ghost:
    'text-foreground hover:bg-secondary active:bg-zinc-700',
  destructive:
    'bg-destructive text-white shadow-sm hover:bg-red-600 active:bg-red-700',
  outline:
    'border border-border bg-transparent text-foreground hover:bg-secondary active:bg-zinc-700',
  link:
    'text-primary underline-offset-4 hover:underline p-0 h-auto',
} as const;

const sizeStyles = {
  default: 'h-10 px-4 py-2 text-sm',
  sm: 'h-8 px-3 text-xs',
  lg: 'h-12 px-6 text-base',
  icon: 'h-10 w-10 p-0',
} as const;

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type ButtonVariant = keyof typeof variantStyles;
export type ButtonSize = keyof typeof sizeStyles;

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  /** When true, merges props onto the single child element instead of rendering a <button>. */
  asChild?: boolean;
}

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'default',
      size = 'default',
      loading = false,
      disabled,
      asChild = false,
      children,
      ...props
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    const classes = cn(
      // Base
      'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md font-medium',
      'transition-all duration-200 ease-out',
      'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring',
      'disabled:pointer-events-none disabled:opacity-50',
      'cursor-pointer',
      // Variant + size
      variantStyles[variant],
      sizeStyles[size],
      className,
    );

    const inner = (
      <>
        {loading && (
          <Loader2
            className="animate-spin"
            size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16}
          />
        )}
        {children}
      </>
    );

    /* ---- asChild: clone props onto the single child element ---- */
    if (asChild && React.isValidElement(children)) {
      return React.cloneElement(children as React.ReactElement<any>, {
        className: cn(
          classes,
          (children as React.ReactElement<any>).props.className,
        ),
        ref,
        disabled: isDisabled,
        'aria-disabled': isDisabled || undefined,
        ...props,
      });
    }

    return (
      <button
        ref={ref}
        className={classes}
        disabled={isDisabled}
        aria-disabled={isDisabled || undefined}
        {...props}
      >
        {inner}
      </button>
    );
  },
);

Button.displayName = 'Button';

export { Button };
