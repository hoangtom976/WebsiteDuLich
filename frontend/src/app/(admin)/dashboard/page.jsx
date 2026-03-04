import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  adminBlogs,
  adminCategories,
  adminSchedules,
  adminTours,
  adminVouchers,
} from "@/lib/admin-mock";
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
  CloudSun,
  ShieldCheck,
  ArrowRight,
  Clock3,
} from "lucide-react";

function StatCard({ title, value, subtitle, icon: Icon }) {
  return (
    <Card className="border-slate-200 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-slate-600">{title}</CardTitle>
        <Icon className="h-4 w-4 text-slate-500" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
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
            Truy cap <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

export default function DashboardPage() {
  const totalTours = adminTours.length;
  const activeTours = adminTours.filter((tour) => tour.trangThai).length;
  const totalCategories = adminCategories.length;
  const totalPosts = adminBlogs.length;
  const activeVouchers = adminVouchers.filter((voucher) => voucher.trangThai).length;
  const activeSchedules = adminSchedules.length;

  const moduleCards = [
    {
      title: "Quan ly Tour",
      desc: "Tao, cap nhat, an/hien tour, quan ly hinh anh va lich trinh.",
      href: "/dashboard/tours",
      icon: Plane,
    },
    {
      title: "Quan ly Lich khoi hanh",
      desc: "Thiet lap ngay khoi hanh, tong so cho va theo doi con trong.",
      href: "/dashboard/schedules",
      icon: CalendarDays,
    },
    {
      title: "Quan ly Lich trinh tour",
      desc: "Quan ly timeline theo ngay cua tour: tao, sua, xoa noi dung chi tiet.",
      href: "/dashboard/itineraries",
      icon: Map,
    },
    {
      title: "Quan ly Don dat",
      desc: "Duyet don, cap nhat trang thai thanh toan va xuat danh sach khach.",
      href: "/dashboard/bookings",
      icon: Wallet,
    },
    {
      title: "Quan ly Blog",
      desc: "Tao va quan ly bai viet, noi dung truyen thong va SEO.",
      href: "/dashboard/blog",
      icon: BookOpenText,
    },
    {
      title: "Voucher va Marketing",
      desc: "Tao ma giam gia, kiem soat thoi han va trang thai voucher.",
      href: "/dashboard/vouchers",
      icon: TicketPercent,
    },
    {
      title: "Nguoi dung va Quyen",
      desc: "Phan quyen USER/STAFF/ADMIN, khoa/mo khoa tai khoan.",
      href: "/dashboard/users",
      icon: Users,
    },
    {
      title: "Thoi tiet va diem den",
      desc: "Theo doi du bao thoi tiet va thong tin dia diem du lich.",
      href: "/dashboard/weather",
      icon: CloudSun,
    },
    {
      title: "Chatbot AI",
      desc: "Theo doi phien chat, toi uu prompt va du lieu RAG.",
      href: "/dashboard/chatbot",
      icon: Bot,
    },
  ];

  const priorityFeatures = [
    "CN10 Quan ly tour",
    "CN16 Quan ly lich khoi hanh",
    "CN19 Dat tour",
    "CN22 Duyet don hang",
    "CN24 Thanh toan VNPAY",
    "CN29 Quan ly voucher",
    "CN32 Chatbot AI tu van",
  ];

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="text-2xl font-bold text-slate-900">Admin Dashboard</h2>
            <p className="mt-1 text-sm text-slate-600">
              Tong quan he thong Website du lich va cac module quan tri.
            </p>
          </div>
          <div className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            <ShieldCheck className="h-4 w-4" />
            JWT + Spring Security
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Tong so tour"
          value={totalTours}
          subtitle={`${activeTours} tour dang hoat dong`}
          icon={Plane}
        />
        <StatCard
          title="Danh muc"
          value={totalCategories}
          subtitle="Quan ly bo loc va nhom tour"
          icon={MapPinned}
        />
        <StatCard
          title="Voucher hoat dong"
          value={activeVouchers}
          subtitle="Voucher co the ap dung"
          icon={TicketPercent}
        />
        <StatCard
          title="Lich khoi hanh"
          value={activeSchedules}
          subtitle="Tong so lich dang duoc khai bao"
          icon={CalendarDays}
        />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <Card className="border-slate-200 shadow-sm lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-lg">Module quan tri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              {moduleCards.map((module) => (
                <ModuleCard key={module.title} {...module} />
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg">Uu tien trien khai</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {priorityFeatures.map((feature) => (
              <div
                key={feature}
                className="rounded-md border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700"
              >
                {feature}
              </div>
            ))}

            <SeparatorLine />

            <div className="rounded-md bg-slate-900 p-3 text-slate-100">
              <p className="text-xs text-slate-300">Trang thai he thong</p>
              <div className="mt-2 flex items-center gap-2 text-sm font-semibold">
                <Clock3 className="h-4 w-4" />
                San sang mo rong cac trang admin tiep theo
              </div>
              <p className="mt-2 text-xs text-slate-300">
                De xuat tiep theo: Users, Tours, Bookings, Vouchers.
              </p>
            </div>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Noi dung & truyen thong</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-slate-600">
              Hien co <span className="font-semibold text-slate-900">{totalPosts}</span>{" "}
              bai viet trong he thong blog.
            </p>
          </CardContent>
        </Card>
        <Card className="border-slate-200 shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Cong nghe su dung</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-slate-600">
            Frontend: Next.js + Tailwind + Axios. Backend: Spring Boot + JWT +
            JPA + MySQL.
          </CardContent>
        </Card>
      </section>
    </div>
  );
}

function SeparatorLine() {
  return <div className="my-1 h-px w-full bg-slate-200" />;
}
