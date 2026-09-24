import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      // Reportes de atenciones pueden traer decenas de miles de filas.
      bodySizeLimit: "30mb",
    },
    // El proxy clona y bufferea el body (default 10MB); los CSV reales superan eso.
    proxyClientMaxBodySize: "30mb",
  },
};

export default nextConfig;
