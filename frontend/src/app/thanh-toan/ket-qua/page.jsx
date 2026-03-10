"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, ArrowRight, Home } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function KetQuaThanhToanPage() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState(null);
    const [orderId, setOrderId] = useState(null);

    useEffect(() => {
        const s = searchParams.get("status");
        const oId = searchParams.get("orderId");

        if (!s) {
            router.push("/");
            return;
        }

        setStatus(s);
        setOrderId(oId);

        // Tự động chuyển hướng sau 5 giây nếu thành công
        if (s === "success" && oId) {
            const timer = setTimeout(() => {
                router.push(`/ho-so/don-hang/${oId}`);
            }, 5000);
            return () => clearTimeout(timer);
        }
    }, [searchParams, router]);

    if (!status) {
        return (
            <div className="min-h-screen py-24 flex items-center justify-center bg-gray-50">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    const isSuccess = status === "success";

    return (
        <div className="min-h-[80vh] py-24 flex items-center justify-center bg-gradient-to-b from-slate-50 to-slate-100">
            <div className="bg-white p-8 md:p-12 rounded-3xl shadow-xl border border-gray-100 max-w-lg w-full text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-blue-500 to-primary"></div>

                <div className="flex justify-center mb-6">
                    {isSuccess ? (
                        <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center text-green-500 mb-2">
                            <CheckCircle2 className="w-16 h-16" />
                        </div>
                    ) : (
                        <div className="w-24 h-24 bg-red-50 rounded-full flex items-center justify-center text-red-500 mb-2">
                            <XCircle className="w-16 h-16" />
                        </div>
                    )}
                </div>

                <h1 className="text-3xl font-black text-gray-900 mb-4 tracking-tight">
                    {isSuccess ? "Thanh toán thành công" : "Thanh toán thất bại"}
                </h1>

                <p className="text-gray-500 mb-8 text-lg">
                    {isSuccess
                        ? "Cảm ơn bạn đã đặt tour. Trang sẽ tự động chuyển đến chi tiết đơn hàng sau 5 giây."
                        : "Đã có lỗi xảy ra trong quá trình thanh toán. Vui lòng thử lại sau."}
                </p>

                {orderId && (
                    <div className="bg-slate-50 rounded-xl p-4 mb-8 flex justify-between items-center text-sm font-medium">
                        <span className="text-gray-500">Mã đơn hàng</span>
                        <span className="text-gray-900">#{orderId}</span>
                    </div>
                )}

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Link href="/">
                        <Button variant={isSuccess ? "outline" : "default"} className="w-full sm:w-auto px-8 h-12 rounded-xl">
                            <Home className="w-4 h-4 mr-2" /> Trang chủ
                        </Button>
                    </Link>

                    {isSuccess && (
                        <Link href={`/ho-so/don-hang/${orderId}`}>
                            <Button className="w-full sm:w-auto px-8 h-12 rounded-xl bg-blue-600 hover:bg-blue-700">
                                Xem đơn hàng <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </Link>
                    )}
                </div>
            </div>
        </div>
    );
}
