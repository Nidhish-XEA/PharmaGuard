export default function Footer() {
  return (
    <footer className="relative z-10 mt-24 border-t border-[#dfe8e2] py-10">
      <div className="section-shell flex flex-col items-center justify-between gap-4 text-center text-sm text-[#6a7d98] md:flex-row md:text-left">
        <div>
          <p className="text-base font-semibold text-[#1a3257]">PharmaGuard</p>
          <p className="mt-1">Precision Medicine Infrastructure</p>
        </div>

        <div className="flex gap-6">
          <a href="#" className="transition hover:text-[#1a3257]">GitHub</a>
          <a href="#" className="transition hover:text-[#1a3257]">Documentation</a>
        </div>
      </div>
    </footer>
  );
}
