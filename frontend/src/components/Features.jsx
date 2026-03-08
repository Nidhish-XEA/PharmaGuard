import { motion } from "framer-motion";
import { BrainCircuit, Dna, Pill, Stethoscope } from "lucide-react";

const features = [
  {
    icon: Dna,
    title: "Genomic Variant Analysis",
    description: "AI parses genetic variants from VCF files.",
  },
  {
    icon: Pill,
    title: "Drug Response Prediction",
    description: "Predict pharmacogenomic risks using clinical guidelines.",
  },
  {
    icon: Stethoscope,
    title: "Clinical Decision Support",
    description: "Actionable recommendations for physicians.",
  },
  {
    icon: BrainCircuit,
    title: "AI Explanation Engine",
    description: "Transparent explanations with scientific references.",
  },
];

export default function Features() {
  return (
    <div>
      <p className="label text-center">Capabilities</p>
      <h2 className="mt-3 text-center text-3xl font-semibold text-[#132a4b] md:text-4xl">Features</h2>

      <div className="mt-10 grid gap-5 md:grid-cols-2">
        {features.map(({ icon: Icon, title, description }) => (
          <motion.article
            key={title}
            whileHover={{ y: -4 }}
            className="card p-6"
          >
            <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8efe4] text-[#6b8861]">
              <Icon size={18} />
            </div>
            <h3 className="text-xl font-semibold text-[#173156]">{title}</h3>
            <p className="mt-2 text-sm leading-relaxed text-[#5b6d86]">{description}</p>
          </motion.article>
        ))}
      </div>
    </div>
  );
}
