import { ClipboardCheck, ScanLine, UploadCloud } from "lucide-react";

const steps = [
  { icon: UploadCloud, label: "Upload Genetic Data" },
  { icon: ScanLine, label: "AI Analyzes Variants" },
  { icon: ClipboardCheck, label: "Receive Clinical Drug Recommendations" },
];

export default function HowItWorks() {
  return (
    <div>
      <p className="label text-center">Workflow</p>
      <h2 className="mt-3 text-center text-3xl font-semibold text-[#132a4b] md:text-4xl">How It Works</h2>

      <div className="mt-10 grid gap-4 md:grid-cols-3">
        {steps.map(({ icon: Icon, label }, idx) => (
          <div key={label} className="card p-6 text-center">
            <p className="label">Step {idx + 1}</p>
            <div className="mx-auto mt-3 flex h-12 w-12 items-center justify-center rounded-full bg-[#e8efe4] text-[#6b8861]">
              <Icon size={20} />
            </div>
            <p className="mt-4 text-sm text-[#4d607a] md:text-base">{label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
