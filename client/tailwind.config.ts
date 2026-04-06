import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        luxury: {
          bg: "#060608",
          panel: "#111319",
          gold: "#C9A84C",
          electric: "#2D9CDB",
          muted: "#8A8D96"
        }
      },
      fontFamily: {
        ui: ["Geist Mono", "monospace"],
        body: ["Plus Jakarta Sans", "sans-serif"]
      },
      boxShadow: {
        glow: "0 0 24px rgba(201,168,76,.25)"
      }
    }
  }
};

export default config;

