"use client";

import { useEffect, useState } from "react";
import { Phone, Mail, Sparkles } from "lucide-react";
import Link from "next/link";
import Weather from "./Weather";
import { getPublicSystemSettings } from "@/services/adminSystemSettingsService";

export default function LuxuryTopBar() {
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getPublicSystemSettings();
        setSettings(data);
      } catch (error) {
        console.error("Lỗi khi tải cài đặt hệ thống:", error);
      }
    };
    fetchSettings();
  }, []);

  return (
    <div className="fixed top-0 z-50 h-[var(--topbar-height)] w-full bg-[#0a2d4d] px-4 text-xs text-white/90 sm:px-6 lg:px-8">
      <div className="container mx-auto flex h-full items-center justify-between gap-4">
        <div className="flex items-center gap-1.5">
          <Sparkles className="h-4 w-4 text-amber-400" />
          <span>{settings?.tenHeThong || "Chuyen Tour Du Lich Noi Dia Cao Cap"}</span>
        </div>
        <div className="hidden items-center gap-6 md:flex">
          {settings?.batThoiTiet !== false && <Weather />}
          <div className="flex items-center gap-1.5">
            <Phone className="h-3 w-3" />
            <span>Hotline: {settings?.hotline || "1900 1234"}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <Mail className="h-3 w-3" />
            <span>Email: {settings?.emailLienHe || "contact@viettour.com"}</span>
          </div>
          <Link href="/#flash-sale" className="transition-opacity hover:opacity-90">
            <div className="rounded-full bg-red-600 px-3 py-1 font-bold animate-pulse">
              Flash Sale 20%
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
