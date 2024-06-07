/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "export",
  basePath: "/nextjs-chat",
  assetPrefix: process.env.NODE_ENV === "production" ? "https://itsjh1242.github.io/nextjs-chat/" : "",
  images: {
    loader: "custom",
    loaderFile: "./lib/ImageLoader.ts",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com",
        pathname: "**",
      },
      {
        protocol: "https",
        hostname: "raw.githubusercontent.com",
        pathname: "**",
      },
    ],
  },
};

export default nextConfig;
