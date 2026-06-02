import React from 'react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------ */
/*  Types                                                              */
/* ------------------------------------------------------------------ */

export type BadgeVariant =
  | 'default'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'destructive'
  | 'outline';

export type BadgeSize = 'default' | 'sm';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: BadgeVariant;
  size?: BadgeSize;
}

/* ------------------------------------------------------------------ */
/*  Style maps                                                         */
/* ------------------------------------------------------------------ */

const variantStyles: Record<BadgeVariant, string> = {
  default:
    'bg-primary/15 text-primary border-primary/20',
  secondary:
    'bg-secondary text-secondary-foreground border-border',
  success:
    'bg-emerald-500/15 text-emerald-400 border-emerald-500/20',
  warning:
    'bg-amber-500/15 text-amber-400 border-amber-500/20',
  destructive:
    'bg-destructive/15 text-red-400 border-destructive/20',
  outline:
    'bg-transparent text-foreground border-border',
};

const sizeStyles: Record<BadgeSize, string> = {
  default: 'px-2.5 py-0.5 text-xs',
  sm: 'px-2 py-px text-[10px]',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function Badge({
  className,
  variant = 'default',
  size = 'default',
  ...props
}: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full border font-medium leading-normal',
        'transition-colors duration-200',
        variantStyles[variant],
        sizeStyles[size],
        className,
      )}
      {...props}
    />
  );
}

export { Badge };
