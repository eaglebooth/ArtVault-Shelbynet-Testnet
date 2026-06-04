import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Providers } from "./providers";
import Navbar from "@/components/Navbar";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ArtVault — AI-Generated Content, Immutably Yours",
  description:
    "Store your AI-generated art on Aptos via ArtVault. Every asset carries cryptographic provenance — Merkle-verified on Aptos.",
  keywords: ["ArtVault", "Aptos", "AI art", "decentralized storage", "provenance"],
  openGraph: {
    title: "ArtVault",
    description: "Your AI Art, Immutably Yours",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-shelby-bg text-shelby-dark">
        <Providers>
          <Navbar />
          {children}
        </Providers>
      </body>
    </html>
  );
}
