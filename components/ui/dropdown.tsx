'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';

/* ------------------------------------------------------------------ */
/*  Helpers                                                            */
/* ------------------------------------------------------------------ */

function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

/* ------------------------------------------------------------------ */
/*  Context                                                            */
/* ------------------------------------------------------------------ */

interface DropdownContextValue {
  open: boolean;
  toggle: () => void;
  close: () => void;
}

const DropdownContext = createContext<DropdownContextValue>({
  open: false,
  toggle: () => {},
  close: () => {},
});

/* ------------------------------------------------------------------ */
/*  Dropdown (root)                                                    */
/* ------------------------------------------------------------------ */

export interface DropdownProps {
  children: React.ReactNode;
  className?: string;
}

function Dropdown({ children, className }: DropdownProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  const toggle = useCallback(() => setOpen((v) => !v), []);
  const close = useCallback(() => setOpen(false), []);

  /* Close on outside click */
  useEffect(() => {
    if (!open) return;

    function handleClick(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        close();
      }
    }

    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open, close]);

  /* Close on Escape */
  useEffect(() => {
    if (!open) return;

    function handleKey(e: KeyboardEvent) {
      if (e.key === 'Escape') close();
    }

    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, [open, close]);

  return (
    <DropdownContext.Provider value={{ open, toggle, close }}>
      <div ref={containerRef} className={cn('relative inline-block', className)}>
        {children}
      </div>
    </DropdownContext.Provider>
  );
}

/* ------------------------------------------------------------------ */
/*  DropdownTrigger                                                    */
/* ------------------------------------------------------------------ */

export type DropdownTriggerProps = React.ButtonHTMLAttributes<HTMLButtonElement>;

function DropdownTrigger({
  children,
  className,
  ...props
}: DropdownTriggerProps) {
  const { toggle, open } = useContext(DropdownContext);

  return (
    <button
      type="button"
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={toggle}
      className={cn('cursor-pointer', className)}
      {...props}
    >
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  DropdownMenu (the popover panel)                                   */
/* ------------------------------------------------------------------ */

export interface DropdownMenuProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Horizontal alignment relative to trigger. */
  align?: 'left' | 'right';
}

function DropdownMenu({
  children,
  className,
  align = 'left',
  ...props
}: DropdownMenuProps) {
  const { open } = useContext(DropdownContext);

  if (!open) return null;

  return (
    <div
      role="menu"
      className={cn(
        'absolute z-50 mt-2 min-w-[180px] overflow-hidden rounded-md border border-border',
        'bg-card p-1 shadow-lg shadow-black/20',
        'animate-fade-in',
        align === 'right' ? 'right-0' : 'left-0',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DropdownItem                                                       */
/* ------------------------------------------------------------------ */

export interface DropdownItemProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  /** Optional leading icon. */
  icon?: React.ReactNode;
  /** Destructive items are styled red. */
  destructive?: boolean;
}

function DropdownItem({
  children,
  icon,
  className,
  destructive = false,
  onClick,
  ...props
}: DropdownItemProps) {
  const { close } = useContext(DropdownContext);

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(e);
    close();
  };

  return (
    <button
      role="menuitem"
      type="button"
      onClick={handleClick}
      className={cn(
        'flex w-full items-center gap-2 rounded-sm px-2 py-1.5 text-sm',
        'cursor-pointer transition-colors duration-150',
        'focus-visible:outline-none focus-visible:bg-secondary',
        destructive
          ? 'text-red-400 hover:bg-red-500/10'
          : 'text-foreground hover:bg-secondary',
        className,
      )}
      {...props}
    >
      {icon && (
        <span className="flex h-4 w-4 shrink-0 items-center justify-center text-muted-foreground">
          {icon}
        </span>
      )}
      {children}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  DropdownSeparator                                                  */
/* ------------------------------------------------------------------ */

function DropdownSeparator({ className }: { className?: string }) {
  return (
    <div
      role="separator"
      className={cn('-mx-1 my-1 h-px bg-border', className)}
    />
  );
}

/* ------------------------------------------------------------------ */
/*  DropdownLabel                                                      */
/* ------------------------------------------------------------------ */

function DropdownLabel({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        'px-2 py-1.5 text-xs font-semibold text-muted-foreground',
        className,
      )}
      {...props}
    />
  );
}

export {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  DropdownSeparator,
  DropdownLabel,
};
