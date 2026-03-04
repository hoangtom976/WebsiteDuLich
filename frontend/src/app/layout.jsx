"use client";

import { Inter } from "next/font/google";
import { usePathname } from "next/navigation";
import "./globals.css";
import PremiumHeader from "@/components/shared/Navbar";
import Footer from "@/components/shared/Footer";
import Chatbox from "@/components/shared/Chatbox";
import MainLayout from "@/components/shared/MainLayout";
import AuthGate from "@/components/auth/AuthGate";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const isAdminRoute = pathname?.startsWith("/dashboard");

  return (
    <html lang="vi">
      <body className={inter.className}>
        <AuthGate>
          {!isAdminRoute && <PremiumHeader />}
          <MainLayout>{children}</MainLayout>
          {!isAdminRoute && <Footer />}
          <Chatbox />
        </AuthGate>
      </body>
    </html>
  );
}
