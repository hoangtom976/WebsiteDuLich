"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
    Calendar, Users, CreditCard, MapPin,
    ArrowLeft, Clock, ShieldCheck, CheckCircle2,
    XCircle, History, Package, Loader2, AlertCircle, MessageCircle
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { layChiTietDonHang } from "@/services/datTourService";
import { formatPrice } from "@/lib/utils";
import Link from "next/link";
import DeparturePointSection from "@/components/tours/DeparturePointSection";

const STATUS_MAP = {
    "CHO_THANH_TOAN": { label: "Chờ thanh toán", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
    "DA_THANH_TOAN": { label: "Đã thanh toán", color: "bg-blue-100 text-blue-700 border-blue-200", icon: CheckCircle2 },
    "DA_XAC_NHAN": { label: "Đã xác nhận", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: ShieldCheck },
    "DA_HOAN_THANH": { label: "Đã hoàn thành", color: "bg-slate-100 text-slate-700 border-slate-200", icon: Package },
    "DA_HUY": { label: "Đã hủy", color: "bg-rose-100 text-rose-700 border-rose-200", icon: XCircle },
};

export default function ChiTietDonHangPage() {
    const { id } = useParams();
    const router = useRouter();
    const [booking, setBooking] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDetail = async () => {
            try {
                const data = await layChiTietDonHang(id);
                setBooking(data);
            } catch (err) {
                console.error("Lỗi khi tải chi tiết đơn hàng:", err);
                setError("Không thể tải thông tin đơn hàng. Vui lòng thử lại sau.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchDetail();
    }, [id]);

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50">
                <Loader2 className="h-10 w-10 animate-spin text-blue-600 mb-4" />
                <p className="text-slate-500 font-medium">Đang tải thông tin đơn hàng...</p>
            </div>
        );
    }

    if (error || !booking) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4 text-center">
                <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100 max-w-md">
                    <XCircle className="h-16 w-16 text-rose-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-slate-900 mb-2">Đã xảy ra lỗi</h1>
                    <p className="text-slate-500 mb-8">{error || "Không tìm thấy đơn hàng"}</p>
                    <Button onClick={() => router.push("/lich-su-dat-tour")} className="rounded-full">
                        Quay lại lịch sử
                    </Button>
                </div>
            </div>
        );
    }

    const status = STATUS_MAP[booking.trangThai] || { label: booking.trangThai, color: "bg-slate-100", icon: Package };
    const StatusIcon = status.icon;

    return (
        <div className="min-h-screen bg-slate-50/50 py-12">
            <div className="mx-auto max-w-4xl px-4">
                <div className="mb-8 flex items-center justify-between">
                    <Button variant="ghost" asChild className="rounded-full">
                        <Link href="/lich-su-dat-tour" className="flex items-center gap-2">
                            <ArrowLeft className="h-4 w-4" />
                            Quay lại lịch sử
                        </Link>
                    </Button>
                    <Badge variant="outline" className={`rounded-full px-4 py-1 flex items-center gap-2 font-bold ${status.color}`}>
                        <StatusIcon className="h-4 w-4" />
                        {status.label}
                    </Badge>
                </div>

                <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
                    {/* Cột trái: Thông tin chính */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card className="overflow-hidden rounded-3xl border-none shadow-sm ring-1 ring-slate-100">
                            <CardHeader className="bg-white border-b border-slate-50 p-6">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Chi tiết đơn hàng #{booking.id}</CardTitle>
                                        <CardDescription className="mt-1">Đặt ngày {new Date(booking.ngayDat).toLocaleString("vi-VN")}</CardDescription>
                                    </div>
                                    <Package className="h-8 w-8 text-blue-500 opacity-20" />
                                </div>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="flex flex-col md:flex-row gap-6 mb-8">
                                    <div className="relative h-32 w-full md:w-48 overflow-hidden rounded-2xl">
                                        <img
                                            src={booking.hinhAnh?.startsWith('http')
                                                ? booking.hinhAnh
                                                : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api'}/files/image/${booking.hinhAnh}`}
                                            alt={booking.tenTour}
                                            className="h-full w-full object-cover"
                                            onError={(e) => e.target.src = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop"}
                                        />
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-xl font-bold text-slate-900 mb-2">{booking.tenTour}</h3>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                                            <div className="flex items-center gap-1.5">
                                                <MapPin className="h-4 w-4 text-rose-500" />
                                                {booking.tenDiaDiem}
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="h-4 w-4 text-blue-500" />
                                                Khởi hành: {new Date(booking.ngayKhoiHanh).toLocaleDateString("vi-VN")}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <Separator className="my-8" />

                                <div>
                                    <h4 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                                        <Users className="h-5 w-5 text-blue-600" />
                                        Danh sách khách hàng ({booking.danhSachKhach?.length || 0})
                                    </h4>
                                    <div className="space-y-3">
                                        {booking.danhSachKhach?.map((khach, idx) => (
                                            <div key={idx} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100">
                                                <div>
                                                    <p className="font-bold text-slate-900">{khach.tenKhach}</p>
                                                    <p className="text-xs text-slate-500">{khach.soDienThoai}</p>
                                                </div>
                                                <Badge variant="secondary" className="rounded-full text-[10px] bg-white border-slate-200">Khách {idx + 1}</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Điểm xuất phát */}
                        <DeparturePointSection />

                        {/* Yêu cầu hủy đơn */}
                        {booking.trangThai === "CHO_THANH_TOAN" && (
                            <div className="bg-rose-50 border border-rose-200 rounded-3xl p-6 mt-6">
                                <h4 className="text-rose-800 font-bold text-lg mb-3 flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-rose-600" />
                                    Yêu cầu hủy đơn hàng
                                </h4>
                                <p className="text-sm text-rose-700 font-medium mb-4">
                                    Lưu ý: Chỉ được hủy các đơn chưa thanh toán.
                                </p>
                                <div className="text-sm text-slate-700 bg-white p-4 rounded-2xl border border-rose-100 shadow-sm space-y-3">
                                    <p>Nếu Quý khách muốn hủy đơn, vui lòng liên hệ trực tiếp với chúng tôi qua thông tin dưới đây:</p>
                                    <ul className="list-disc list-inside space-y-1 ml-1">
                                        <li><strong>Zalo:</strong> 0333303056</li>
                                        <li><strong>Email:</strong> hoangtom976@gmail.com</li>
                                    </ul>
                                    <p className="mt-2 font-medium">Nội dung tin nhắn/email cần bao gồm:</p>
                                    <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 font-mono text-xs space-y-1 text-slate-600">
                                        <p>- Họ và tên người đặt: .................</p>
                                        <p>- Email đặt tour: ......................</p>
                                        <p>- Số điện thoại liên hệ: ...............</p>
                                        <p>- Mã đơn hàng: #{booking.id}</p>
                                        <p>- Lý do hủy: ...........................</p>
                                    </div>
                                    <p className="text-xs text-slate-500 italic mt-2">
                                        * Nhân viên sẽ kiểm tra, xác nhận lưu vết và tiến hành hủy đơn trên hệ thống cho Quý khách.
                                    </p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Cột phải: Thanh toán */}
                    <div className="space-y-6">
                        <Card className="rounded-3xl border-none shadow-sm ring-1 ring-slate-100 overflow-hidden">
                            <CardHeader className="bg-slate-900 text-white p-6">
                                <CardTitle className="text-lg font-bold flex items-center gap-2">
                                    <CreditCard className="h-5 w-5 text-amber-500" />
                                    Tổng cộng
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-6 space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-slate-500">Số lượng khách</span>
                                    <span className="font-bold text-slate-900">{booking.danhSachKhach?.length} người</span>
                                </div>

                                {booking.maVoucher && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-slate-500">Mã voucher ({booking.maVoucher})</span>
                                        <span className="font-medium text-emerald-600">-{booking.phanTramGiam}%</span>
                                    </div>
                                )}

                                <Separator />

                                <div className="flex justify-between items-end">
                                    <span className="text-sm font-medium text-slate-500">Tổng tiền</span>
                                    <span className="text-2xl font-black text-orange-600 leading-none">{formatPrice(booking.tongTien)}</span>
                                </div>

                                {booking.trangThai === "CHO_THANH_TOAN" && (
                                    <Button className="w-full mt-6 rounded-2xl bg-blue-600 hover:bg-blue-700 h-12 font-bold shadow-lg shadow-blue-200" asChild>
                                        <Link href={`/thanh-toan?orderId=${booking.id}`}>
                                            Thanh toán ngay
                                        </Link>
                                    </Button>
                                )}
                            </CardContent>
                        </Card>

                        <div className="bg-amber-50 border border-amber-100 rounded-3xl p-6">
                            <h5 className="font-bold text-amber-900 mb-2 flex items-center gap-2">
                                <Clock className="h-4 w-4" />
                                Lưu ý quan trọng
                            </h5>
                            <ul className="text-xs text-amber-800 space-y-2 list-disc pl-4 opacity-80">
                                <li>Vui lòng kiểm tra kỹ thông tin hành khách trước khi khởi hành.</li>
                                <li>Có mặt tại điểm hẹn ít nhất 15 phút trước giờ khởi hành.</li>
                                <li>Mang theo CMND/CCCD hoặc Hộ chiếu gốc để làm thủ tục.</li>
                                <li>Thông tin chi tiết hành trình đã được gửi về email của bạn.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
