"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  LayoutDashboard,
  Plane,
  Users,
  Ticket,
  Settings,
  Mountain,
  BookOpen,
  LogOut,
  Grid3x3,
  MapPinned,
  CalendarDays,
  Map,
  TicketPercent,
  MessageCircleMore,
  ChevronDown,
  ChevronRight,
} from "lucide-react";
import { clearAuthToken, getAuthState } from "@/lib/auth-client";

const navSections = [
  {
    key: "overview",
    label: "Tổng quan",
    icon: LayoutDashboard,
    items: [{ href: "/dashboard", label: "Bảng điều khiển" }],
  },
  {
    key: "product",
    label: "Sản phẩm",
    icon: Plane,
    items: [
      { href: "/dashboard/categories", label: "Danh mục", icon: Grid3x3 },
      { href: "/dashboard/locations", label: "Địa điểm", icon: MapPinned },
      { href: "/dashboard/tours", label: "Tours", icon: Plane },
      { href: "/dashboard/schedules", label: "Lịch khởi hành", icon: CalendarDays },
      { href: "/dashboard/itineraries", label: "Lịch trình tour", icon: Map },
    ],
  },
  {
    key: "operation",
    label: "Vận hành",
    icon: Ticket,
    items: [
      { href: "/dashboard/users", label: "Người dùng", icon: Users, adminOnly: true },
      { href: "/dashboard/bookings", label: "Đơn hàng", icon: Ticket },
      { href: "/dashboard/reviews", label: "Đánh giá", icon: MessageCircleMore },
      { href: "/dashboard/vouchers", label: "Vouchers", icon: TicketPercent },
      { href: "/dashboard/flash-sales", label: "Flash Sale", icon: TicketPercent },
    ],
  },
  {
    key: "content",
    label: "Nội dung",
    icon: BookOpen,
    items: [
      { href: "/dashboard/blog", label: "Blog", icon: BookOpen },
      { href: "/dashboard/chatbot", label: "Chatbot AI", icon: MessageCircleMore },
    ],
  },
  {
    key: "system",
    label: "Hệ thống",
    icon: Settings,
    items: [{ href: "/dashboard/settings", label: "Cài đặt", icon: Settings, adminOnly: true }],
  },
];

export default function AdminSidebar() {
  const [mounted, setMounted] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // useEffect này chỉ chạy trên Client sau khi component đã mount
  useEffect(() => {
    setMounted(true);
  }, []);

  // Chỉ lấy auth state sau khi mount để tránh hydration mismatch
  const auth = mounted ? getAuthState() : { isLoggedIn: false, roles: [], isAdmin: false, isStaff: false };
  const isStaff = auth.isStaff && !auth.isAdmin;

  const defaultOpen = useMemo(() => {
    return navSections.reduce((acc, section) => {
      acc[section.key] = section.items.some((item) =>
        item.href === "/dashboard"
          ? pathname === "/dashboard"
          : pathname?.startsWith(item.href),
      );
      return acc;
    }, {});
  }, [pathname]);

  const [openSections, setOpenSections] = useState(defaultOpen);

  const handleLogout = () => {
    clearAuthToken();
    router.push("/dang-nhap");
    router.refresh();
  };

  const toggleSection = (key) => {
    setOpenSections((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Nếu chưa mounted (render Server hoặc render Client lần đầu), trả về UI tối giản 
  // để khớp chính xác HTML giữa Server và Client (Hydration bit-for-bit match)
  if (!mounted) {
    return (
      <aside className="sticky top-0 flex h-screen w-72 flex-shrink-0 flex-col bg-[#0a2d4d] p-4 text-white">
        <div className="mb-8 flex items-center gap-3 px-4">
          <Mountain className="h-8 w-8 text-amber-400 opacity-50" />
          <span className="text-2xl font-bold opacity-50">Viet Tour</span>
        </div>
        <div className="flex-1 space-y-4 animate-pulse">
          <div className="h-10 w-full rounded bg-white/5" />
          <div className="h-10 w-full rounded bg-white/5" />
          <div className="h-10 w-full rounded bg-white/5" />
        </div>
        <div className="mt-auto text-center text-xs text-gray-400 opacity-30">
          <p>&copy; 2026 Viet Tour Admin</p>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sticky top-0 flex h-screen w-72 flex-shrink-0 flex-col overflow-y-auto bg-[#0a2d4d] p-4 text-white">
      <Link href="/" className="mb-8 flex items-center gap-3 px-4">
        <Mountain className="h-8 w-8 text-amber-400" />
        <span className="text-2xl font-bold">Viet Tour</span>
      </Link>

      <nav className="flex-1 space-y-3">
        {navSections.map((section) => {
          const Icon = section.icon;
          const isActiveGroup = section.items.some((item) =>
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname?.startsWith(item.href),
          );
          const isOpen = openSections[section.key] ?? isActiveGroup;

          return (
            <div key={section.key} className="rounded-lg bg-white/[0.03]">
              <button
                type="button"
                onClick={() => toggleSection(section.key)}
                className={`flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left transition-colors ${isActiveGroup
                  ? "bg-white/10 text-white"
                  : "text-gray-300 hover:bg-white/5 hover:text-white"
                  }`}
              >
                <Icon className="h-4 w-4" />
                <span className="flex-1 text-sm font-semibold">{section.label}</span>
                {isOpen ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>

              {isOpen && (
                <div className="space-y-1 px-2 pb-2">
                  {section.items.map((item) => {
                    const ItemIcon = item.icon;
                    const isDisabled = isStaff && item.adminOnly;
                    const isActive =
                      item.href === "/dashboard"
                        ? pathname === "/dashboard"
                        : pathname?.startsWith(item.href);

                    if (isDisabled) {
                      return (
                        <div
                          key={item.href}
                          title="Chức năng chỉ dành cho Admin"
                          className="flex cursor-not-allowed items-center gap-2 rounded-md px-3 py-2 text-sm text-gray-400 opacity-45"
                        >
                          {ItemIcon ? <ItemIcon className="h-4 w-4" /> : null}
                          <span>{item.label}</span>
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        className={`flex items-center gap-2 rounded-md px-3 py-2 text-sm transition-colors ${isActive
                          ? "bg-blue-500/20 text-white"
                          : "text-gray-300 hover:bg-white/5 hover:text-white"
                          }`}
                      >
                        {ItemIcon ? <ItemIcon className="h-4 w-4" /> : null}
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}

        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-gray-300 transition-colors hover:bg-red-500/15 hover:text-white"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Đăng xuất</span>
        </button>
      </nav>

      <div className="mt-auto text-center text-xs text-gray-400">
        <p>&copy; {new Date().getFullYear()} Viet Tour Admin</p>
      </div>
    </aside>
  );
}
