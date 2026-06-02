import { Menu } from "lucide-react";

type HeaderProps = {
  title: string;
  description?: string;
  onMenuToggle: () => void;
  children?: React.ReactNode;
};

export function DashboardHeader({ title, description, onMenuToggle, children }: HeaderProps) {
  return (
    <header className="flex items-center justify-between border-b border-zinc-800 bg-zinc-950/80 px-4 py-4 backdrop-blur-sm sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          onClick={onMenuToggle}
          className="rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white lg:hidden"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div>
          <h1 className="text-xl font-bold text-white sm:text-2xl">{title}</h1>
          {description && (
            <p className="mt-0.5 text-sm text-zinc-400">{description}</p>
          )}
        </div>
      </div>
      {children && <div className="flex items-center gap-3">{children}</div>}
    </header>
  );
}
