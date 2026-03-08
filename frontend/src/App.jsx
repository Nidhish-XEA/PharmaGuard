import { motion } from "framer-motion";
import Hero from "./components/Hero";
import Features from "./components/Features";
import HowItWorks from "./components/HowItWorks";
import AnalyzerDemo from "./components/AnalyzerDemo";
import TechStack from "./components/TechStack";
import Footer from "./components/Footer";

const fadeIn = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.55, ease: "easeOut" } },
};

export default function App() {
  return (
    <div className="relative overflow-hidden bg-bg text-text">
      <div className="pointer-events-none absolute inset-0 bg-mesh" />

      <Hero />

      <main className="relative z-10 space-y-24 pb-24">
        {[Features, HowItWorks, AnalyzerDemo, TechStack].map((Section, idx) => (
          <motion.section
            key={idx}
            className="section-shell"
            variants={fadeIn}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, amount: 0.2 }}
          >
            <Section />
          </motion.section>
        ))}

        <motion.section
          className="section-shell"
          variants={fadeIn}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, amount: 0.2 }}
        >
          <div className="card p-8 md:p-12">
            <p className="label">About</p>
            <h2 className="mt-3 text-3xl font-semibold md:text-4xl">About PharmaGuard</h2>
            <p className="mt-5 max-w-3xl text-base leading-relaxed text-[#41556f] md:text-lg">
              PharmaGuard is an AI-powered pharmacogenomic engine that analyzes genomic variants
              and predicts how patients respond to medications, enabling safer prescribing and
              personalized treatment.
            </p>
          </div>
        </motion.section>
      </main>

      <Footer />
    </div>
  );
}
