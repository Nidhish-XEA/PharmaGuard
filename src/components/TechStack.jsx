const badges = [
  "AI + Pharmacogenomics",
  "FastAPI Backend",
  "React Frontend",
  "Clinical Guideline Integration (CPIC / PharmGKB)",
];

export default function TechStack() {
  return (
    <div>
      <p className="label text-center">Stack</p>
      <h2 className="mt-3 text-center text-3xl font-semibold text-[#132a4b] md:text-4xl">Technology</h2>

      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        {badges.map((badge) => (
          <span
            key={badge}
            className="rounded-full border border-[#d8e3db] bg-white px-5 py-2 text-sm text-[#556a86]"
          >
            {badge}
          </span>
        ))}
      </div>
    </div>
  );
}
