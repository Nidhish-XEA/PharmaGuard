import { useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";

export default function GeneBackdrop() {
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 80, damping: 22 });
  const sy = useSpring(my, { stiffness: 80, damping: 22 });

  useEffect(() => {
    const onMove = (e) => {
      mx.set((e.clientX / window.innerWidth - 0.5) * 2);
      my.set((e.clientY / window.innerHeight - 0.5) * 2);
    };
    window.addEventListener("mousemove", onMove);
    return () => window.removeEventListener("mousemove", onMove);
  }, [mx, my]);

  const x = useTransform(sx, [-1, 1], [-18, 18]);
  const y = useTransform(sy, [-1, 1], [-14, 14]);

  return (
    <div className="pointer-events-none absolute inset-0 z-0 overflow-hidden">
      <motion.div className="absolute right-[-120px] top-8 opacity-60" style={{ x, y }}>
        <motion.svg
          width="520"
          height="680"
          viewBox="0 0 520 680"
          fill="none"
          animate={{ rotate: 360 }}
          transition={{ duration: 120, repeat: Infinity, ease: "linear" }}
        >
          <path
            d="M190 60C310 160 310 320 190 420C70 520 70 620 190 640"
            stroke="rgba(15,164,124,0.18)"
            strokeWidth="1.7"
          />
          <path
            d="M330 60C210 160 210 320 330 420C450 520 450 620 330 640"
            stroke="rgba(101,207,175,0.2)"
            strokeWidth="1.7"
          />
          {Array.from({ length: 12 }).map((_, i) => {
            const yy = 90 + i * 45;
            const x1 = i % 2 === 0 ? 205 : 235;
            const x2 = i % 2 === 0 ? 315 : 285;
            return (
              <g key={i}>
                <line x1={x1} y1={yy} x2={x2} y2={yy} stroke="rgba(20,88,68,0.15)" strokeWidth="1.3" />
                <circle cx={x1} cy={yy} r="2.8" fill="rgba(15,164,124,0.28)" />
                <circle cx={x2} cy={yy} r="2.8" fill="rgba(101,207,175,0.3)" />
              </g>
            );
          })}
        </motion.svg>
      </motion.div>
    </div>
  );
}