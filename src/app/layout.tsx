import "./globals.css";

import { Inter } from "next/font/google";
import type { Metadata } from "next";
import type { Viewport } from 'next'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}


const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Your imagination at your pocket - AriDraw",
  description: "Unleash your inner artist with AriDraw Creative Canvas a modern, responsive digital painting and drawing app. Experiment with multiple brush types, vibrant color palettes, and custom backgrounds. Save, revisit, and share your creative history with ease.",
  manifest: '/manifest.json',
  themeColor: '#000000',
  icons: {
    icon: '/icons/icon-192x192.png',
    apple: '/icons/icon-192x192.png',
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
