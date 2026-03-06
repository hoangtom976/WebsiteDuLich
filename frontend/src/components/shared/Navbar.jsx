"use client";

import Link from "next/link";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { Mountain } from "lucide-react";
import UserNav from "./UserNav";

export default function PremiumHeader() {
  const [isScrolled, setIsScrolled] = useState(false);
  const pathname = usePathname();
  const isHomePage = pathname === "/";

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header
      className={`fixed z-40 w-full transition-all duration-300 ${isHomePage ? "top-[var(--topbar-height)]" : "top-0"
        } ${isScrolled || !isHomePage ? "bg-white/90 shadow-md backdrop-blur-lg" : "bg-transparent"} select-none`}
    >
      <div className="container mx-auto flex h-[var(--header-height)] items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2">
          <Mountain className="h-6 w-6 text-blue-600" />
          <span className="text-xl font-bold text-gray-800 transition-colors">
            Viet Tour
          </span>
        </Link>

        <nav className="hidden items-center gap-8 font-medium text-gray-700 transition-colors md:flex">
          <Link href="/" className="transition-colors hover:text-amber-400">
            Trang chủ
          </Link>
          <Link href="/tours" className="transition-colors hover:text-amber-400">
            Tours
          </Link>
          <Link
            href="/khuyen-mai"
            className="transition-colors hover:text-amber-400"
          >
            Khuyến mãi
          </Link>
          <Link href="/blog" className="transition-colors hover:text-amber-400">
            Blog du lịch
          </Link>
          <Link href="/lien-he" className="transition-colors hover:text-amber-400">
            Liên hệ
          </Link>
          <UserNav />
        </nav>

        <div className="flex items-center gap-4">
          <div className="md:hidden">
            <UserNav />
          </div>
        </div>
      </div>
    </header>
  );
}
