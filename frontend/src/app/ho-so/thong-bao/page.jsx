"use client";

import { useEffect, useState } from "react";
import { Bell, CheckCircle2, Clock, Info, AlertTriangle, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { layThongBaoCuaToi, danhDauDaDoc } from "@/services/thongBaoService";
import { toast } from "sonner";

const TYPE_MAP = {
    "DON_HANG": { icon: Clock, color: "text-blue-500 bg-blue-50", label: "Đơn hàng" },
    "THANH_TOAN": { icon: CheckCircle2, color: "text-emerald-500 bg-emerald-50", label: "Thanh toán" },
    "KHUYEN_MAI": { icon: Info, color: "text-amber-500 bg-amber-50", label: "Khuyến mãi" },
    "HE_THONG": { icon: AlertTriangle, color: "text-rose-500 bg-rose-50", label: "Hệ thống" },
};

export default function ThongBaoPage() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const data = await layThongBaoCuaToi();
            setNotifications(data);
        } catch (error) {
            console.error("Lỗi khi tải thông báo:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleMarkAsRead = async (id) => {
        try {
            await danhDauDaDoc(id);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, daDoc: true } : n));
        } catch (error) {
            console.error("Lỗi khi đánh dấu đã đọc:", error);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="mx-auto max-w-4xl px-4">
                <div className="mb-8 flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Thông báo</h1>
                        <p className="mt-1 text-slate-500 text-sm">Cập nhật những tin tức mới nhất về đơn hàng và ưu đãi.</p>
                    </div>
                    <Bell className="h-10 w-10 text-slate-200" />
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-24 w-full animate-pulse rounded-2xl bg-white" />
                        ))}
                    </div>
                ) : notifications.length === 0 ? (
                    <Card className="border-dashed border-2 bg-white/50 text-center py-16">
                        <CardContent>
                            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <Bell className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Bạn chưa có thông báo nào</h3>
                            <p className="text-slate-500 mt-2">Chúng tôi sẽ gửi thông báo cho bạn khi có cập nhật mới.</p>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-4">
                        {notifications.map((notif) => {
                            const TypeIcon = TYPE_MAP[notif.loaiThongBao]?.icon || Info;
                            const typeStyle = TYPE_MAP[notif.loaiThongBao] || TYPE_MAP["HE_THONG"];

                            return (
                                <div
                                    key={notif.id}
                                    onClick={() => !notif.daDoc && handleMarkAsRead(notif.id)}
                                    className={`group relative flex gap-4 rounded-2xl border p-4 transition-all hover:shadow-md cursor-pointer ${notif.daDoc ? "bg-white border-slate-100 opacity-75" : "bg-white border-blue-100 shadow-sm ring-1 ring-blue-50"
                                        }`}
                                >
                                    <div className={`mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${typeStyle.color}`}>
                                        <TypeIcon className="h-5 w-5" />
                                    </div>

                                    <div className="flex-1 pr-6">
                                        <div className="flex items-center gap-2 mb-1">
                                            <h3 className={`font-bold text-slate-900 ${notif.daDoc ? "font-semibold" : "font-extrabold"}`}>
                                                {notif.tieuDe}
                                            </h3>
                                            {!notif.daDoc && (
                                                <span className="h-2 w-2 rounded-full bg-blue-600 animate-pulse" />
                                            )}
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed mb-2">
                                            {notif.noiDung}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-400">
                                                {new Date(notif.ngayTao).toLocaleString("vi-VN")}
                                            </span>
                                            <Badge variant="secondary" className="text-[10px] uppercase font-bold tracking-wider">
                                                {typeStyle.label}
                                            </Badge>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
