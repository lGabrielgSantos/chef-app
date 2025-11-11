import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./next-intl.config.ts'); // 👈 aponta para o seu arquivo

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withNextIntl(nextConfig);
