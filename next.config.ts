import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Oculta el botón "N" de Next.js en desarrollo.
  devIndicators: false,
  // PGlite (base local de desarrollo) usa WebAssembly: se carga desde node_modules, no se empaqueta.
  serverExternalPackages: ["@electric-sql/pglite"],
  experimental: {
    // Fotos subidas desde los paneles pasan por Server Actions.
    serverActions: { bodySizeLimit: "4mb" },
  },
};

export default nextConfig;
