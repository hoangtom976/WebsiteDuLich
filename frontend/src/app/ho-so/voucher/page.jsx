"use client";

import { useEffect, useState } from "react";
import { Ticket, Clock, CheckCircle2, AlertCircle, Copy, Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getMyVouchers } from "@/services/voucherService";
import { toast } from "sonner";

export default function MyVouchersPage() {
    const [vouchers, setVouchers] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchVouchers = async () => {
            try {
                const data = await getMyVouchers();
                setVouchers(data);
            } catch (error) {
                console.error("Lỗi khi tải voucher của tôi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchVouchers();
    }, []);

    const copyToClipboard = (text) => {
        navigator.clipboard.writeText(text);
        toast.success("Đã sao chép mã voucher!");
    };

    const getVouchersByStatus = (status) => {
        return vouchers.filter(v => v.trangThai === status);
    };

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="mx-auto max-w-4xl px-4">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Voucher của tôi</h1>
                        <p className="mt-1 text-slate-500 text-sm">Tiết kiệm nhiều hơn với các ưu đãi đặc quyền.</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                        <Ticket className="h-6 w-6" />
                    </div>
                </div>

                <Tabs defaultValue="CON_HAN" className="w-full">
                    <TabsList className="mb-8 flex w-full justify-start overflow-x-auto rounded-2xl bg-white p-1 shadow-sm h-auto">
                        <TabsTrigger value="CON_HAN" className="flex-1 rounded-xl px-4 py-2 text-sm gap-2">
                            Có thể sử dụng <Badge variant="secondary" className="h-5 w-5 p-0 flex items-center justify-center rounded-full text-[10px]">{getVouchersByStatus("CON_HAN").length}</Badge>
                        </TabsTrigger>
                        <TabsTrigger value="DA_DUNG" className="flex-1 rounded-xl px-4 py-2 text-sm">Đã sử dụng</TabsTrigger>
                        <TabsTrigger value="HET_HAN" className="flex-1 rounded-xl px-4 py-2 text-sm">Đã hết hạn</TabsTrigger>
                    </TabsList>

                    <TabsContent value="CON_HAN" className="mt-0">
                        <VoucherList
                            vouchers={getVouchersByStatus("CON_HAN")}
                            loading={loading}
                            onCopy={copyToClipboard}
                            emptyMessage="Bạn chưa có mã giảm giá nào khả dụng."
                        />
                    </TabsContent>
                    <TabsContent value="DA_DUNG" className="mt-0">
                        <VoucherList
                            vouchers={getVouchersByStatus("DA_DUNG")}
                            loading={loading}
                            isUsed
                            emptyMessage="Bạn chưa sử dụng mã giảm giá nào."
                        />
                    </TabsContent>
                    <TabsContent value="HET_HAN" className="mt-0">
                        <VoucherList
                            vouchers={getVouchersByStatus("HET_HAN")}
                            loading={loading}
                            isExpired
                            emptyMessage="Không có mã giảm giá nào đã hết hạn."
                        />
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}

function VoucherList({ vouchers, loading, onCopy, emptyMessage, isUsed, isExpired }) {
    if (loading) {
        return (
            <div className="grid gap-4 sm:grid-cols-2">
                {[1, 2, 3, 4].map(i => (
                    <div key={i} className="h-32 w-full animate-pulse rounded-2xl bg-white" />
                ))}
            </div>
        );
    }

    if (vouchers.length === 0) {
        return (
            <div className="rounded-3xl border-2 border-dashed border-slate-200 bg-white/50 py-16 text-center">
                <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                    <Ticket className="h-8 w-8 text-slate-400" />
                </div>
                <p className="text-slate-500">{emptyMessage}</p>
            </div>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2">
            {vouchers.map((voucher) => (
                <Card key={voucher.id} className={`group overflow-hidden rounded-2xl border-slate-100 shadow-sm transition hover:shadow-md ${isUsed || isExpired ? 'opacity-70 grayscale-[0.5]' : ''}`}>
                    <CardContent className="flex p-0">
                        <div className={`flex w-24 flex-col items-center justify-center gap-1 border-r border-dashed border-slate-200 ${isUsed ? 'bg-slate-100' : isExpired ? 'bg-rose-50' : 'bg-blue-600'} p-4 text-white`}>
                            <span className="text-2xl font-black">{voucher.phanTramGiam}%</span>
                            <span className="text-[10px] font-bold uppercase tracking-wider">Giảm giá</span>
                        </div>
                        <div className="flex flex-1 flex-col p-4 bg-white relative">
                            <div className="mb-2 flex items-center justify-between">
                                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Antigravity Travel</span>
                                {isUsed && <Badge className="bg-slate-100 text-slate-600 text-[10px]">Đã dùng</Badge>}
                                {isExpired && <Badge variant="destructive" className="text-[10px]">Hết hạn</Badge>}
                            </div>

                            <h3 className="text-lg font-black text-slate-900 mb-1 leading-none">{voucher.maVoucher}</h3>

                            <div className="flex items-center gap-1 text-[10px] text-slate-500 mb-4 font-medium">
                                <Clock className="h-3 w-3" />
                                <span>HSD: {new Date(voucher.ngayHetHan).toLocaleDateString("vi-VN")}</span>
                            </div>

                            {!isUsed && !isExpired && (
                                <button
                                    onClick={() => onCopy(voucher.maVoucher)}
                                    className="flex items-center justify-center gap-1.5 rounded-lg bg-blue-50 py-1.5 text-xs font-bold text-blue-600 transition hover:bg-blue-100 active:scale-95"
                                >
                                    <Copy className="h-3 w-3" /> Sao chép mã
                                </button>
                            )}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
