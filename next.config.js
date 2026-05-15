/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    // SECURITY: Restrict image hosts to known sources
    // Removed wildcard to prevent abuse and resource exhaustion
    remotePatterns: [
      // Google OAuth profile pictures
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
      },
      // Uploadthing CDN
      {
        protocol: "https",
        hostname: "uploadthing.com",
      },
      {
        protocol: "https",
        hostname: "*.uploadthing.com",
      },
      // Add other trusted image sources here as needed
      // Examples:
      // {
      //   protocol: "https",
      //   hostname: "images.example.com",
      // },
    ],
  },
  experimental: {
    optimizePackageImports: ["@chakra-ui/react"],
  },
};

export default nextConfig;
