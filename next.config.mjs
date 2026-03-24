/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ["chromadb"],
  turbopack: {
    root: process.cwd(),
  },
}

export default nextConfig
