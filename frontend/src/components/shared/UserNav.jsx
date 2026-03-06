"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import {
  ChevronDown,
  Heart,
  History,
  LayoutDashboard,
  LogOut,
  Settings,
  ShieldCheck,
  User,
  CircleUserRound,
  MessageCircleMore,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  clearAuthToken,
  getAuthState,
  getProfileFullName,
  setProfileFullName,
} from "@/lib/auth-client";
import { getCurrentUserProfile } from "@/services/userService";

function menuByRole(auth) {
  if (auth.isAdmin) {
    return [
      { href: "/dashboard", label: "Trang quản trị", icon: LayoutDashboard, highlight: true },
      { href: "/ho-so", label: "Thông tin cá nhân", icon: User },
      { href: "/dashboard/users", label: "Quản lý người dùng", icon: ShieldCheck },
      { href: "/dashboard/settings", label: "Cài đặt hệ thống", icon: Settings },
      { href: "/dashboard/chatbot", label: "Quản lý Chatbot AI", icon: MessageCircleMore },
    ];
  }

  if (auth.isStaff) {
    return [
      { href: "/dashboard", label: "Trang quản trị", icon: LayoutDashboard, highlight: true },
      { href: "/ho-so", label: "Thông tin cá nhân", icon: User },
      { href: "/dashboard/bookings", label: "Lịch sử đơn hàng", icon: History },
      { href: "/dashboard/reviews", label: "Phản hồi đánh giá", icon: ShieldCheck },
    ];
  }

  return [
    { href: "/ho-so", label: "Thông tin cá nhân", icon: User },
    { href: "/lich-su-dat-tour", label: "Lịch sử đơn hàng", icon: History },
    { href: "/yeu-thich", label: "Danh sách yêu thích", icon: Heart },
  ];
}

function accountRank(auth) {
  if (auth.isAdmin) return { label: "Quản trị viên", cls: "bg-rose-500 text-white" };
  if (auth.isStaff) return { label: "Nhân viên", cls: "bg-sky-500 text-white" };
  return { label: "Khách hàng", cls: "bg-amber-500 text-white" };
}

export default function UserNav() {
  const router = useRouter();
  usePathname();
  const auth = getAuthState();
  const [fullName, setFullName] = useState(() => {
    if (typeof window !== "undefined") return getProfileFullName();
    return "";
  });
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!auth.isLoggedIn) return;

    let cancelled = false;
    const loadUserProfile = async () => {
      try {
        const profile = await getCurrentUserProfile();
        if (!cancelled) {
          const name = (profile?.ho_ten || profile?.hoTen || "").trim();
          if (name) setProfileFullName(name);
          setFullName(name || "");
        }
      } catch {
        if (!cancelled) setFullName("");
      }
    };

    loadUserProfile();
    return () => {
      cancelled = true;
    };
  }, [auth.isLoggedIn]);

  const displayName =
    auth.isLoggedIn
      ? fullName || getProfileFullName() || auth.payload?.hoTen || "Người dùng"
      : "Người dùng";

  const handleLogout = () => {
    clearAuthToken();
    setFullName("");
    router.push("/");
    router.refresh();
  };

  const clearTextSelection = () => {
    if (typeof window === "undefined") return;
    const selection = window.getSelection?.();
    if (selection && selection.rangeCount > 0) {
      selection.removeAllRanges();
    }
  };

  if (!isMounted || !auth.isLoggedIn) {
    return (
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" asChild>
          <Link href="/dang-nhap">Đăng nhập</Link>
        </Button>
        <Button size="sm" asChild>
          <Link href="/dang-ky">Đăng ký</Link>
        </Button>
      </div>
    );
  }

  const rank = accountRank(auth);
  const menuItems = menuByRole(auth);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          draggable={false}
          onDragStart={(e) => e.preventDefault()}
          onMouseDown={clearTextSelection}
          onClick={clearTextSelection}
          onDoubleClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            clearTextSelection();
          }}
          className="inline-flex select-none items-center gap-2 rounded-2xl border border-white/35 bg-white/10 px-2 py-1.5 text-sm font-semibold text-gray-800 backdrop-blur-sm outline-none transition hover:border-white/60 hover:bg-white/20"
        >
          <CircleUserRound className="h-6 w-6" />
          <span className="max-w-[160px] truncate">{displayName}</span>
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${rank.cls}`}>
            {rank.label}
          </span>
          <ChevronDown className="h-4 w-4" />
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="end"
        className="w-80 rounded-2xl border border-slate-200 bg-white p-0 shadow-2xl"
      >
        <DropdownMenuLabel className="rounded-t-2xl bg-slate-50 px-4 py-3 font-normal">
          <p className="text-xs text-slate-500">Đang đăng nhập</p>
          <div className="mt-1 flex items-center gap-2">
            <p className="truncate text-lg font-bold text-slate-900">{displayName}</p>
          </div>
        </DropdownMenuLabel>

        <div className="p-2">
          {menuItems.map((item) => (
            <DropdownMenuItem key={item.href} asChild className={item.highlight ? "text-sky-700" : ""}>
              <Link href={item.href} className="flex w-full items-center gap-3 px-2 py-2">
                <item.icon className="h-4 w-4" />
                <span className="font-medium">{item.label}</span>
              </Link>
            </DropdownMenuItem>
          ))}
        </div>

        <DropdownMenuSeparator className="my-0" />
        <div className="p-2">
          <DropdownMenuItem
            onClick={handleLogout}
            className="text-red-600 focus:bg-red-50 focus:text-red-600"
          >
            <LogOut className="mr-2 h-4 w-4" />
            Đăng xuất
          </DropdownMenuItem>
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
