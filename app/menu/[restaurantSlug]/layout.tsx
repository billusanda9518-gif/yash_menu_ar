export default function MenuLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-[#fafaf8] text-[#1a1a1a]">
      {children}
    </div>
  );
}
