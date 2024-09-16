/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    apiUrl:
      process.env.NODE_ENV === "development"
        ? "http://localhost:3002" // development api
        : "https://api.mainnet.araafal.com", // production api
  },
  images: {
    domains: [
      "numadlabs-coordinals-test.s3.eu-central-1.amazonaws.com",
      "images.unsplash.com",
    ],
  },
};

export default nextConfig;
