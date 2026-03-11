"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDashboardStatistics } from "@/services/statisticService";
import {
  Users,
  MapPinned,
  Map,
  TicketPercent,
  BookOpenText,
  Plane,
  CalendarDays,
  Wallet,
  Bot,
  ShieldCheck,
  ArrowRight,
  RefreshCcw,
} from "lucide-react";

const EMPTY_STATS = {
  tongTour: 0,
  tourDangHoatDong: 0,
  tongDanhMuc: 0,
  tongDiaDiem: 0,
  tongLichKhoiHanh: 0,
  tongDonDatTour: 0,
  tongBaiViet: 0,
  tongVoucher: 0,
  voucherDangHoatDong: 0,
  tongNguoiDung: 0,
  nguoiDungDangHoatDong: 0,
};

function extractApiError(error, fallback) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (status === 403) return "Bạn không có quyền xem thống kê dashboard.";
  return fallback;
}

function StatCard({ title, value, subtitle, icon: Icon, loading }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-slate-500" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-slate-900">{loading ? "..." : value}</p>
        <p className="mt-1 text-xs text-slate-500">{subtitle}</p>
      </CardContent>
    </Card>
  );
}

function ModuleCard({ title, desc, href, icon: Icon }) {
  return (
    <Card className="group border-slate-200 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md">
      <CardHeader className="pb-2">
        <div className="mb-2 flex items-center gap-2 text-slate-700">
          <Icon className="h-4 w-4" />
          <CardTitle className="text-base">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <p className="min-h-12 text-sm text-slate-600">{desc}</p>
        <Button asChild variant="ghost" className="mt-2 h-8 px-0 text-slate-800">
          <Link href={href}>
            Truy cập <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const [stats, setStats] = useState(EMPTY_STATS);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadDashboardStats = useCallback(async (showSuccess = false) => {
    setLoading(true);
    setError("");
    try {
      const data = await getDashboardStatistics();
      setStats(data);
      if (showSuccess) setMessage("Đã cập nhật dữ liệu dashboard.");
    } catch (err) {
      setError(extractApiError(err, "Không thể tải dữ liệu dashboard."));
      setMessage("");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadDashboardStats();
  }, [loadDashboardStats]);

  const moduleCards = [
    {
      title: "Quản lý Tour",
      desc: "Tạo, cập nhật, ẩn/hiện tour, quản lý hình ảnh và lịch trình.",
      href: "/dashboard/tours",
      icon: Plane,
    },
    {
      title: "Quản lý Lịch khởi hành",
      desc: "Thiết lập ngày khởi hành, tổng số chỗ và theo dõi còn trống.",
      href: "/dashboard/schedules",
      icon: CalendarDays,
    },
    {
      title: "Quản lý Lịch trình tour",
      desc: "Quản lý timeline theo ngày của tour: tạo, sửa, xóa nội dung chi tiết.",
      href: "/dashboard/itineraries",
      icon: Map,
    },
    {
      title: "Quản lý Đơn đặt",
      desc: "Duyệt đơn, cập nhật trạng thái thanh toán và xuất danh sách khách.",
      href: "/dashboard/bookings",
      icon: Wallet,
    },
    {
      title: "Quản lý Blog",
      desc: "Tạo và quản lý bài viết, nội dung truyền thông và SEO.",
      href: "/dashboard/blog",
      icon: BookOpenText,
    },
    {
      title: "Voucher và Marketing",
      desc: "Tạo mã giảm giá, kiểm soát thời hạn và trạng thái voucher.",
      href: "/dashboard/vouchers",
      icon: TicketPercent,
    },
    {
      title: "Người dùng và Quyền",
      desc: "Phân quyền USER/STAFF/ADMIN, khóa/mở khóa tài khoản.",
      href: "/dashboard/users",
      icon: Users,
    },

    {
      title: "Chatbot AI",
      desc: "Theo dõi phiên chat, tối ưu prompt và dữ liệu RAG.",
      href: "/dashboard/chatbot",
      icon: Bot,
    },
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
            <p className="mt-1 text-sm text-slate-600">
              Tổng quan hệ thống Website du lịch và các module quản trị.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={() => loadDashboardStats(true)} disabled={loading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {loading ? "Đang tải..." : "Làm mới dữ liệu"}
            </Button>
            <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
              <ShieldCheck className="h-4 w-4" />
              JWT + Spring Security
            </div>
          </div>
        </div>
        {message ? <p className="mt-3 text-sm text-emerald-600">{message}</p> : null}
        {error ? <p className="mt-3 text-sm text-red-600">{error}</p> : null}
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tổng số tour"
          value={stats.tongTour}
          subtitle={`${stats.tourDangHoatDong} tour đang hoạt động`}
          icon={Plane}
          loading={loading}
        />
        <StatCard
          title="Danh mục"
          value={stats.tongDanhMuc}
          subtitle={`${stats.tongDiaDiem} địa điểm du lịch`}
          icon={MapPinned}
          loading={loading}
        />
        <StatCard
          title="Voucher hoạt động"
          value={stats.voucherDangHoatDong}
          subtitle={`${stats.tongVoucher} voucher trong hệ thống`}
          icon={TicketPercent}
          loading={loading}
        />
        <StatCard
          title="Lịch khởi hành"
          value={stats.tongLichKhoiHanh}
          subtitle={`${stats.tongDonDatTour} đơn đặt tour`}
          icon={CalendarDays}
          loading={loading}
        />
      </section>

      <section>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Module quản trị</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {moduleCards.map((module) => (
                <ModuleCard key={module.title} {...module} />
              ))}
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Nội dung và truyền thông</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Hiện có <span className="font-semibold text-slate-900">{loading ? "..." : stats.tongBaiViet}</span>{" "}
              bài viết trong hệ thống blog.
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Người dùng</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Tổng người dùng: <span className="font-semibold text-slate-900">{loading ? "..." : stats.tongNguoiDung}</span>.{" "}
            Đang hoạt động: <span className="font-semibold text-slate-900">{loading ? "..." : stats.nguoiDungDangHoatDong}</span>.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
