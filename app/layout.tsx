import type { Metadata, Viewport } from "next";
import { Inter, Noto_Sans_Gujarati } from "next/font/google";
import "./globals.css";
import { BottomNav } from "@/components/BottomNav";
import { PwaRegister } from "@/components/PwaInstall";
import { AuthProvider } from "@/components/AuthProvider";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const guj = Noto_Sans_Gujarati({ subsets: ["gujarati"], weight: ["400", "600", "700"], variable: "--font-gujarati" });

export const metadata: Metadata = {
  title: "Krishna Residency Maintenance Manage System",
  description: "Krishna Residency society operations",
  manifest: "/manifest.webmanifest",
  appleWebApp: { capable: true, title: "KR Society", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/icon-192.png", sizes: "192x192" },
      { url: "/icon-512.png", sizes: "512x512" },
    ],
    apple: "/apple-touch-icon.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#0f2744",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  viewportFit: "cover",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="gu">
      <body className={`${inter.variable} ${guj.variable} font-sans min-h-screen pb-28 overflow-x-hidden`}>
        <AuthProvider>
          <PwaRegister />
          {children}
          <BottomNav />
        </AuthProvider>
      </body>
    </html>
  );
}
