"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2, CreditCard, AlertCircle, ArrowRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { layChiTietDonHang, taoThanhToanVnPay } from "@/services/datTourService";
import LuxuryTopBar from "@/components/shared/LuxuryTopBar";

function ThanhToanProcessor() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const orderId = searchParams.get("orderId");
  const [error, setError] = useState(null);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!orderId) {
      setError("Thiếu mã đơn hàng.");
      setLoading(false);
      return;
    }

    const loadBooking = async () => {
      try {
        const data = await layChiTietDonHang(orderId);
        
        if (!data) {
          setError("Không tìm thấy thông tin đơn hàng.");
          setLoading(false);
          return;
        }

        if (data.trangThai !== "CHO_THANH_TOAN") {
          setError("Đơn hàng này không ở trạng thái chờ thanh toán.");
          setLoading(false);
          return;
        }

        setBooking(data);
      } catch (err) {
        console.error("Lỗi lấy thông tin đơn hàng:", err);
        setError("Đã xảy ra lỗi trong quá trình tải thông tin.");
      } finally {
        setLoading(false);
      }
    };

    loadBooking();
  }, [orderId]);

  const handlePayment = async () => {
    if (!booking) return;
    
    setIsProcessing(true);
    try {
      const paymentUrl = await taoThanhToanVnPay({
        maDonHang: booking.id,
        soTien: booking.tongTien,
        noiDung: `Thanh toan don hang ${booking.id}`
      });

      if (paymentUrl) {
        window.location.href = paymentUrl;
      } else {
        setError("Không thể tạo liên kết thanh toán. Vui lòng thử lại sau.");
        setIsProcessing(false);
      }
    } catch (err) {
      console.error("Lỗi xử lý thanh toán:", err);
      setError("Đã xảy ra lỗi trong quá trình xử lý thanh toán.");
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center">
        <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-4" />
        <p className="text-slate-500">Đang tải thông tin đơn hàng...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-center">
        <AlertCircle className="h-16 w-16 text-rose-500 mb-4" />
        <h2 className="text-2xl font-black text-slate-900 mb-2">Lỗi thanh toán</h2>
        <p className="text-slate-500 mb-8 max-w-md">{error}</p>
        <Button onClick={() => router.push("/lich-su-dat-tour")} className="rounded-full bg-slate-900 border-none px-8 py-6 text-white hover:bg-slate-800">
          Quay lại phòng điều khiển
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 md:p-12 text-center">
      <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center mb-6">
        <CreditCard className="h-10 w-10 text-blue-600" />
      </div>
      <h2 className="text-3xl font-black text-slate-900 mb-2">Xác nhận thanh toán</h2>
      <p className="text-slate-500 mb-8">Vui lòng kiểm tra lại thông tin đơn hàng trước khi tiến hành thanh toán</p>
      
      <div className="w-full bg-slate-50 rounded-2xl p-6 mb-8 text-left border border-slate-100">
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
          <span className="text-slate-500 font-medium">Mã đơn đặt tour</span>
          <span className="font-bold text-slate-900">#{booking.id}</span>
        </div>
        <div className="flex justify-between items-center mb-4 pb-4 border-b border-slate-200">
          <span className="text-slate-500 font-medium">Tour</span>
          <span className="font-bold text-slate-900 text-sm max-w-[200px] truncate text-right">{booking.lichKhoiHanh?.tour?.tenTour || 'N/A'}</span>
        </div>
        <div className="flex justify-between items-center pt-2">
          <span className="text-slate-600 font-medium">Tổng thanh toán</span>
          <span className="text-2xl font-black text-blue-600">
            {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(booking.tongTien)}
          </span>
        </div>
      </div>

      <Button 
        onClick={handlePayment} 
        disabled={isProcessing}
        className="w-full rounded-2xl bg-blue-600 border-none px-8 py-7 text-lg font-bold text-white hover:bg-blue-700 shadow-lg shadow-blue-600/20 transition-all hover:-translate-y-1"
      >
        {isProcessing ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Đang tạo liên kết VNPay...
          </>
        ) : (
          <>
            Thanh toán qua VNPay <ArrowRight className="ml-2 h-5 w-5" />
          </>
        )}
      </Button>
      
      <p className="mt-6 text-sm text-slate-400">
        Bạn sẽ được chuyển hướng một cách an toàn đến VNPay Sandbox
      </p>
    </div>
  );
}

export default function ThanhToanPage() {
  return (
    <>
      <LuxuryTopBar />
      <div className="min-h-screen bg-slate-50 pt-32 pb-12 flex items-center justify-center">
        <div className="w-full max-w-lg px-4">
          <Card className="rounded-[2rem] border border-slate-200 shadow-2xl shadow-slate-200/50 overflow-hidden bg-white">
            <CardContent className="p-0">
              <Suspense fallback={
                <div className="flex flex-col items-center justify-center p-16 text-center">
                  <Loader2 className="h-16 w-16 animate-spin text-blue-600 mb-4" />
                  <p className="text-slate-500">Đang chuẩn bị...</p>
                </div>
              }>
                <ThanhToanProcessor />
              </Suspense>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
