/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  publicRuntimeConfig: {
    apiUrl:
      process.env.NODE_ENV === "development"
        ? "http://127.0.0.1:3000" // development api
        : "https://api.mainnet.araafal.com", // production api
  },
  images: {
    domains: [
      "numadlabs-coordinals-test.s3.eu-central-1.amazonaws.com",
      "d1orw8h9a3ark2.cloudfront.net",
      "images.unsplash.com",
      "static-testnet.unisat.io",
      "ordinals-testnet.fractalbitcoin.io"  // Add this line
    ],
  },
  i18n: {
    locales: ["en", "it"],
    defaultLocale: "en",
  },
};

export default nextConfig;