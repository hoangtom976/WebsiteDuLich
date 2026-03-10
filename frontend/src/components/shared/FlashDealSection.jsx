"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";
import { Zap, Timer, Sparkles, Flame } from "lucide-react";

export default function FlashDealSection({ deal }) {
  const calculateTimeLeft = () => {
    const difference = +new Date(deal.ngayKetThuc) - +new Date();
    let timeLeft = {};
    if (difference > 0) {
      timeLeft = {
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
      };
    }
    return timeLeft;
  };

  const [timeLeft, setTimeLeft] = useState({});
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    setTimeLeft(calculateTimeLeft());

    const timer = setInterval(() => {
      setTimeLeft(calculateTimeLeft());
    }, 1000);

    return () => clearInterval(timer);
  }, [deal.ngayKetThuc]);

  if (!isMounted) {
    return null; // Or a loading skeleton to avoid layout shift
  }

  const giaKhuyenMai = deal.giaKhuyenMai || (deal.giaGoc - deal.giaGoc * (deal.phanTramGiam / 100));

  return (
    <section id="flash-sale" className="relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-red-100/30 blur-3xl rounded-full -z-10" />

      <div className="grid md:grid-cols-2 gap-12 items-center bg-white rounded-[2.5rem] p-8 md:p-12 border border-slate-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)] transition-all hover:shadow-[0_40px_80px_rgba(0,0,0,0.1)]">
        <div className="relative group">
          <div className="absolute -top-4 -left-4 z-20 bg-red-600 text-white px-6 py-2 rounded-2xl font-black text-sm uppercase tracking-[0.1em] shadow-lg flex items-center gap-2 animate-bounce">
            <Zap className="h-4 w-4 fill-white" />
            Giảm mạnh {deal.phanTramGiam}%
          </div>
          <div className="overflow-hidden rounded-3xl shadow-2xl transition-transform duration-700 group-hover:scale-[1.02]">
            <img
              src={deal.hinhAnh}
              alt={deal.tenTour}
              className="w-full h-[400px] object-cover transition-transform duration-700 group-hover:scale-110"
            />
          </div>
          <div className="absolute -bottom-6 -right-6 h-32 w-32 bg-amber-100/50 rounded-full blur-2xl -z-10" />
        </div>

        <div className="relative">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 text-red-600 mb-6 border border-red-100">
            <Sparkles className="h-4 w-4" />
            <span className="text-xs font-black uppercase tracking-wider">Ưu đãi giới hạn</span>
          </div>

          <h2 className="text-4xl md:text-5xl font-black text-slate-900 leading-tight mb-6">
            {deal.tenTour}
          </h2>

          <p className="text-slate-500 text-lg leading-relaxed mb-8">
            {deal.moTa}
          </p>

          <div className="flex flex-wrap items-center gap-6 mb-10">
            <div className="flex flex-col">
              <span className="text-slate-400 line-through text-xl font-medium">
                {formatPrice(deal.giaGoc)}
              </span>
              <span className="text-red-600 font-black text-5xl tracking-tight">
                {formatPrice(giaKhuyenMai)}
              </span>
            </div>
            <div className="flex flex-col gap-3 min-w-[200px]">
              <div className="flex justify-between items-end">
                <span className="text-xs font-black text-slate-500 uppercase tracking-wider">Số chỗ còn lại</span>
                <span className="text-sm font-black text-red-600">chỉ còn 08 chỗ</span>
              </div>
              <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                <div
                  className="h-full bg-red-600 rounded-full animate-pulse shadow-[0_0_10px_rgba(220,38,38,0.5)]"
                  style={{ width: "85%" }}
                />
              </div>
              <div className="flex items-center gap-1.5 mt-1">
                <Flame className="h-3 w-3 text-red-500 fill-red-500" />
                <span className="text-[10px] font-bold text-red-500 uppercase tracking-tighter">Đang có rất nhiều người xem tour này</span>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold uppercase text-xs tracking-widest">
              <Timer className="h-4 w-4 text-red-500" />
              Thời gian còn lại
            </div>
            <div className="flex gap-3">
              {Object.keys(timeLeft).length > 0 ? (
                Object.entries(timeLeft).map(([interval, value]) => (
                  <div key={interval} className="flex-1 max-w-[80px]">
                    <div className="bg-slate-900 text-white rounded-2xl p-3 text-center transition-transform hover:scale-105">
                      <div className="text-2xl font-black leading-none">
                        {String(value).padStart(2, "0")}
                      </div>
                      <div className="text-[10px] text-white/50 uppercase font-black tracking-tighter mt-1">
                        {interval === 'days' ? 'Ngày' : interval === 'hours' ? 'Giờ' : interval === 'minutes' ? 'Phút' : 'Giây'}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="w-full bg-red-50 text-red-600 py-4 rounded-2xl text-center font-black uppercase tracking-widest border border-red-100">
                  Chương trình đã kết thúc
                </div>
              )}
            </div>
          </div>

          <Button
            asChild
            size="lg"
            className="w-full mt-10 h-16 rounded-[1.25rem] bg-slate-900 hover:bg-red-600 text-white font-black text-lg transition-all shadow-[0_10px_30px_rgba(15,23,42,0.15)] hover:shadow-[0_15px_35px_rgba(220,38,38,0.25)] flex items-center justify-center gap-3 overflow-hidden group"
          >
            <Link href={`/tours/${deal.tourId}`}>
              ĐẶT TOUR NGAY KẺO LỠ
              <Zap className="h-5 w-5 fill-amber-400 text-amber-400 group-hover:scale-125 transition-transform" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
