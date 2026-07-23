/**
 * Root layout — wraps every page in the application.
 * This is a Server Component (no "use client") and runs on every route.
 *
 * Responsibilities:
 * - Sets up Google Fonts (Geist Sans & Mono) via CSS variables
 * - Configures page metadata (title, description) for SEO
 * - Provides the HTML shell with Tailwind CSS base classes
 *
 * This layout does NOT include any auth logic — that's handled by proxy.ts
 * and the (protected) layout group.
 */

import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WiFi Rewards",
  description: "Redeem WiFi bundles with your SB credits",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
