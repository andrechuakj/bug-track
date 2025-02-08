// @ts-check

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  // Transpile our internal monorepo packages on-the-fly
  // Note next.js strict ESM resolution
  transpilePackages: ['~api', 'rc-util', 'rc-picker'],
};
export default config;
