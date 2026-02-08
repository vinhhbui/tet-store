import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'tet-red': '#A04433',   // Đỏ gạch retro
        'tet-gold': '#E2B97F',  // Vàng đồng
        'tet-rust': '#B87356',  // Cam đất
      },
    },
  },
  plugins: [],
};
export default config;