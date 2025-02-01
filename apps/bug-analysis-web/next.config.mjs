// @ts-check

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Transpile our internal monorepo packages on-the-fly
  transpilePackages: ['~api'],
};
export default config;
