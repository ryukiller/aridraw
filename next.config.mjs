import withPWA from 'next-pwa';

/** @type {import('next').NextConfig} */
const nextConfig = {};

export default withPWA({
    dest: 'public', // Where the service worker file will be generated
    disable: process.env.NODE_ENV === 'development', // Disable PWA features in development
    ...nextConfig,
});

