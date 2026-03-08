import {
  ArrowRight,
  Dna,
  FlaskConical,
  House,
  Info,
  LogIn,
  MessageCircle,
} from "lucide-react";

const navItems = [
  { icon: House, label: "Home" },
  { icon: Info, label: "How It Works" },
  { icon: Dna, label: "Genetic Compatibility Checker" },
  { icon: MessageCircle, label: "Community" },
  { icon: FlaskConical, label: "Pill Scanner" },
];

export default function Hero() {
  return (
    <header className="hero-shell relative z-10 overflow-hidden border-r border-[#e7ece9]">
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.52]"
        style={{
          backgroundImage: "url('/hero-bg.png')",
          backgroundRepeat: "no-repeat",
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(90deg,rgba(246,248,247,0.88)_0%,rgba(246,248,247,0.74)_44%,rgba(246,248,247,0.3)_100%)]" />
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[58%] bg-[radial-gradient(circle_at_15%_40%,rgba(255,255,255,0.75),rgba(246,248,247,0.35)_60%,transparent_82%)]" />

      <div className="section-shell relative pt-7">
        <nav className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full border border-[#dbe5de] text-[#6e8a63]">
              <Dna size={18} />
            </div>
            <div className="leading-none">
              <p className="text-[33px] font-medium tracking-[-0.03em] text-[#9ab08f]">pharma</p>
              <p className="-mt-1 text-[32px] font-semibold tracking-[-0.02em] text-[#111f34]">Guard</p>
            </div>
          </div>

          <div className="hidden items-center gap-7 xl:flex">
            {navItems.map(({ icon: Icon, label }) => (
              <a
                key={label}
                href="#"
                className="flex items-center gap-2 text-[15px] text-[#425571] transition hover:text-[#1e2e48]"
              >
                <Icon size={15} />
                <span>{label}</span>
              </a>
            ))}
          </div>

          <button className="inline-flex items-center gap-2 rounded-full bg-[#9db28f] px-7 py-2.5 text-sm font-semibold text-white transition hover:bg-[#8da57f]">
            <LogIn size={14} />
            Login
          </button>
        </nav>
      </div>

      <div className="section-shell relative grid min-h-[82vh] grid-cols-1 items-center gap-12 py-16 lg:grid-cols-2 lg:gap-0">
        <div className="absolute left-1/2 top-[7%] hidden h-[86%] w-px bg-[#e7ebea] lg:block" />

        <div className="relative z-10 max-w-xl">
          <p className="mb-8 flex items-center gap-3 text-xs uppercase tracking-[0.30em] text-[#8d9bb0]">
            <span className="inline-block h-px w-10 bg-[#c5ceda]" />
            Pharmacogenomics · Drug Safety
          </p>

          <h1 className="text-[58px] font-semibold leading-[1.03] tracking-[-0.03em] text-[#10264c] md:text-[76px]">
            Predict <span className="font-medium text-[#9ab08f]">precise</span>
            <br />
            Medication
            <br />
            Decisions
          </h1>

          <p className="mt-8 max-w-lg text-[20px] leading-relaxed text-[#667892]">
            Upload your VCF file and instantly assess drug safety, dosage adjustments, and toxicity
            risks using <span className="font-semibold text-[#263c61]">CPIC-aligned pharmacogenomic analysis</span>
            , tailored to your unique genetic profile.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-6">
            <button className="inline-flex items-center gap-3 rounded-full bg-[#5f8558] px-8 py-4 text-lg font-semibold text-white shadow-glow transition hover:bg-[#56784f]">
              Explore PharmaGuard
              <ArrowRight size={18} />
            </button>
            <a
              href="#"
              className="border-b border-[#c2ccd9] pb-1 text-[18px] text-[#7487a1] transition hover:text-[#1f2f4b]"
            >
              How it works
            </a>
          </div>

          <div className="mt-14 opacity-80">
            <img src="/tablet.png" alt="Tablets" className="h-[152px] w-[620px] object-contain object-left" />
          </div>
        </div>

        <div className="hidden lg:block" />
      </div>
    </header>
  );
}

