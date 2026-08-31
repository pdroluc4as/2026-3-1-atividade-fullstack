import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import Header from "@/components/layout/Header";
import MobileMenu from "@/components/layout/MobileMenu";
import Sidebar from "@/components/layout/Sidebar";
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
  title: "DIATINF X",
  description: "App com layout base e navegação global",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="pt-BR"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-screen text-slate-900">
        <div className="flex min-h-screen">
          <Sidebar />
          <div className="flex min-h-screen w-full flex-col">
            <Header />
            <main className="flex-1 pt-25 pb-25">{children}</main>
            <MobileMenu />
          </div>
        </div>
      </body>
    </html>
  );
}
