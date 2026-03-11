"use client";

import { useEffect, useState } from "react";
import { History, Calendar, Users, CreditCard, ChevronRight, Search, Filter } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { layLichSuDatTour } from "@/services/datTourService";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";

const STATUS_MAP = {
    "CHO_THANH_TOAN": { label: "Chờ thanh toán", color: "bg-amber-100 text-amber-700 border-amber-200" },
    "DA_THANH_TOAN": { label: "Đã thanh toán", color: "bg-blue-100 text-blue-700 border-blue-200" },
    "DA_XAC_NHAN": { label: "Đã xác nhận", color: "bg-emerald-100 text-emerald-700 border-emerald-200" },
    "DA_HOAN_THANH": { label: "Đã hoàn thành", color: "bg-slate-100 text-slate-700 border-slate-200" },
    "DA_HUY": { label: "Đã hủy", color: "bg-rose-100 text-rose-700 border-rose-200" },
};

function getTripStatus(ngayKhoiHanh, soNgay) {
    if (!ngayKhoiHanh) return null;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const start = new Date(ngayKhoiHanh);
    start.setHours(0, 0, 0, 0);
    const end = new Date(start);
    end.setDate(end.getDate() + (soNgay || 1) - 1);

    if (today < start) return { label: "Chưa đến ngày đi", color: "bg-blue-100 text-blue-700 border-blue-200" };
    if (today > end) return { label: "Đã hoàn thành", color: "bg-slate-100 text-slate-700 border-slate-200" };
    return { label: "Đang đi", color: "bg-emerald-100 text-emerald-700 border-emerald-200" };
}

export default function LichSuDatTourPage() {
    const [bookings, setBookings] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");

    useEffect(() => {
        const fetchBookings = async () => {
            try {
                const data = await layLichSuDatTour();
                setBookings(data);
            } catch (error) {
                console.error("Lỗi khi tải lịch sử đặt tour:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchBookings();
    }, []);

    const filteredBookings = bookings.filter(b =>
        b.tenTour.toLowerCase().includes(searchQuery.toLowerCase()) ||
        String(b.id).includes(searchQuery)
    );

    const getBookingsByStatus = (status) => {
        if (status === "ALL") return filteredBookings;
        return filteredBookings.filter(b => b.trangThai === status);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="mx-auto max-w-5xl px-4">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Đơn đặt tour của tôi</h1>
                        <p className="mt-1 text-slate-500 text-sm">Quản lý và theo dõi các chuyến đi của bạn.</p>
                    </div>
                    <div className="relative max-w-xs">
                        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder="Tìm theo tên tour hoặc mã đơn..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full rounded-xl border border-slate-200 bg-white py-2 pl-10 pr-4 text-sm outline-none ring-blue-500/20 transition focus:border-blue-500 focus:ring-2"
                        />
                    </div>
                </div>

                <Tabs defaultValue="ALL" className="w-full">
                    <TabsList className="mb-6 flex w-full justify-start overflow-x-auto rounded-xl bg-white p-1 shadow-sm h-auto">
                        <TabsTrigger value="ALL" className="rounded-lg px-4 py-2 text-sm">Tất cả</TabsTrigger>
                        <TabsTrigger value="CHO_THANH_TOAN" className="rounded-lg px-4 py-2 text-sm">Chờ thanh toán</TabsTrigger>
                        <TabsTrigger value="DA_THANH_TOAN" className="rounded-lg px-4 py-2 text-sm">Đã thanh toán</TabsTrigger>
                        <TabsTrigger value="DA_XAC_NHAN" className="rounded-lg px-4 py-2 text-sm">Đã xác nhận</TabsTrigger>
                        <TabsTrigger value="DA_HUY" className="rounded-lg px-4 py-2 text-sm">Đã hủy</TabsTrigger>
                    </TabsList>

                    {["ALL", "CHO_THANH_TOAN", "DA_THANH_TOAN", "DA_XAC_NHAN", "DA_HUY"].map((status) => (
                        <TabsContent key={status} value={status} className="mt-0 focus-visible:outline-none">
                            <BookingList
                                bookings={getBookingsByStatus(status)}
                                loading={loading}
                            />
                        </TabsContent>
                    ))}
                </Tabs>
            </div>
        </div>
    );
}

function BookingList({ bookings, loading }) {
    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-white shadow-sm" />
                ))}
            </div>
        );
    }

    if (bookings.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 py-16 px-4 text-center">
                <div className="mb-4 rounded-full bg-slate-100 p-4">
                    <History className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="text-lg font-bold text-slate-900">Không tìm thấy đơn đặt tour</h3>
                <p className="mt-1 max-w-[280px] text-sm text-slate-500 leading-relaxed text-balance">
                    Bạn chưa có đơn đặt tour nào trong danh mục này. Hãy khám phá các tour hấp dẫn của chúng tôi!
                </p>
                <Button asChild className="mt-6 rounded-full bg-blue-600 hover:bg-blue-700">
                    <Link href="/tours">Khám phá ngay</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {bookings.map((booking) => (
                <Card key={booking.id} className="overflow-hidden rounded-2xl border-slate-100 shadow-sm transition hover:shadow-md">
                    <CardContent className="p-0">
                        <div className="flex flex-col md:flex-row">
                            <div className="flex flex-1 flex-col p-5">
                                <div className="mb-3 flex items-center justify-between">
                                    <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                                        Mã đơn: #{booking.id}
                                    </span>
                                    <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[10px] font-bold ${STATUS_MAP[booking.trangThai]?.color || ""}`}>
                                        {STATUS_MAP[booking.trangThai]?.label || booking.trangThai}
                                    </Badge>
                                    {(() => {
                                        const tripStatus = getTripStatus(booking.ngayKhoiHanh, booking.soNgay);
                                        return tripStatus ? (
                                            <Badge variant="outline" className={`rounded-full px-3 py-0.5 text-[10px] font-bold ${tripStatus.color}`}>
                                                {tripStatus.label}
                                            </Badge>
                                        ) : null;
                                    })()}
                                </div>

                                <h3 className="mb-4 text-lg font-bold text-slate-900 transition-colors hover:text-blue-600">
                                    <Link href={`/tours/${booking.tourId || '#'}`}>{booking.tenTour}</Link>
                                </h3>

                                <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Calendar className="h-4 w-4 text-blue-500" />
                                        <span>{new Date(booking.ngayKhoiHanh).toLocaleDateString("vi-VN")}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Users className="h-4 w-4 text-blue-500" />
                                        <span>{booking.soLuongKhach} khách</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm font-bold text-orange-600">
                                        <CreditCard className="h-4 w-4" />
                                        <span>{formatPrice(booking.tongTien)}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-row md:flex-col items-center justify-center gap-2 border-t border-slate-100 bg-slate-50/50 p-4 md:border-l md:border-t-0 md:min-w-[140px]">
                                <Button variant="outline" size="sm" className="w-full rounded-full text-xs font-bold" asChild>
                                    <Link href={`/ho-so/don-hang/${booking.id}`}>Chi tiết</Link>
                                </Button>
                                {booking.trangThai === "CHO_THANH_TOAN" && (
                                    <Button size="sm" className="w-full rounded-full text-xs font-bold bg-blue-600 hover:bg-blue-700" asChild>
                                        <Link href={`/thanh-toan?orderId=${booking.id}`}>Thanh toán</Link>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
