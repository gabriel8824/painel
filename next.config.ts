import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Fixa a raiz do workspace nesta pasta (há outro lockfile acima em ~/).
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
