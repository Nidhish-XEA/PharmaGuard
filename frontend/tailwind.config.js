/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg: "#F6F8F7",
        text: "#12284A",
        accent: "#6E8962",
        accent2: "#A3B899",
      },
      boxShadow: {
        glow: "0 14px 32px rgba(110, 137, 98, 0.24)",
        card: "0 8px 24px rgba(18, 40, 74, 0.06)",
      },
      maxWidth: {
        content: "1250px",
      },
      fontFamily: {
        sans: ["Manrope", "Sora", "Inter", "system-ui", "sans-serif"],
      },
      backgroundImage: {
        mesh:
          "radial-gradient(circle at 15% 20%, rgba(163,184,153,0.12), transparent 30%), radial-gradient(circle at 84% 18%, rgba(110,137,98,0.09), transparent 32%), radial-gradient(circle at 52% 90%, rgba(163,184,153,0.08), transparent 35%)",
      },
    },
  },
  plugins: [],
};
