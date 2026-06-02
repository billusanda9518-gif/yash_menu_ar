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

export type SkeletonVariant = 'text' | 'circle' | 'card' | 'image';

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Shape preset. Defaults to 'text'. */
  variant?: SkeletonVariant;
  /** CSS width value (ignored if variant provides its own). */
  width?: string | number;
  /** CSS height value (ignored if variant provides its own). */
  height?: string | number;
}

/* ------------------------------------------------------------------ */
/*  Variant presets                                                     */
/* ------------------------------------------------------------------ */

const variantClasses: Record<SkeletonVariant, string> = {
  text: 'h-4 w-full rounded-md',
  circle: 'h-10 w-10 rounded-full',
  card: 'h-32 w-full rounded-lg',
  image: 'aspect-square w-full rounded-lg',
};

/* ------------------------------------------------------------------ */
/*  Component                                                          */
/* ------------------------------------------------------------------ */

function Skeleton({
  className,
  variant = 'text',
  width,
  height,
  style,
  ...props
}: SkeletonProps) {
  return (
    <div
      aria-hidden="true"
      className={cn(
        'animate-skeleton bg-muted',
        variantClasses[variant],
        className,
      )}
      style={{
        ...(width != null ? { width: typeof width === 'number' ? `${width}px` : width } : {}),
        ...(height != null ? { height: typeof height === 'number' ? `${height}px` : height } : {}),
        ...style,
      }}
      {...props}
    />
  );
}

export { Skeleton };
