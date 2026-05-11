import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/lib/ThemeContext";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Expiry Guard — Track Food, Save Money",
  description:
    "Smart inventory tracker that helps you reduce food waste, save money, and never let anything expire unnoticed.",
  keywords: ["food tracker", "expiry date", "reduce waste", "save money", "inventory"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} antialiased`}>
      <body className="min-h-screen flex flex-col bg-background text-foreground relative overflow-x-hidden">
        <ThemeProvider>
          {/* Ambient Glows */}
          <div className="ambient-glow top-0 left-1/4 w-[500px] h-[500px] bg-emerald-500/10 -translate-y-1/2" />
          <div className="ambient-glow bottom-0 right-1/4 w-[600px] h-[600px] bg-teal-500/5 translate-y-1/4" />
          
          <div className="relative z-10 flex flex-col min-h-full">
            {children}
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
