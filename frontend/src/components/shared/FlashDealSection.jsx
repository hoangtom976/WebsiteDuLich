"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { formatPrice } from "@/lib/utils";

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
    <section id="flash-sale" className="scroll-mt-20">
      <div className="grid md:grid-cols-2 gap-10 items-center">
        <div>
          <img
            src={deal.hinhAnh}
            alt={deal.tenTour}
            className="rounded-lg shadow-xl"
          />
        </div>
        <div>
          <h3 className="text-red-500 font-bold text-lg">ƯU ĐÃI HÔM NAY</h3>
          <h2 className="text-4xl font-bold mt-2">{deal.tenTour}</h2>
          <p className="text-gray-600 mt-4">{deal.moTa}</p>
          <div className="flex items-center gap-4 mt-4">
            <span className="text-gray-500 line-through text-2xl">
              {formatPrice(deal.giaGoc)}
            </span>
            <span className="text-red-600 font-bold text-4xl">
              {formatPrice(giaKhuyenMai)}
            </span>
          </div>
          <div className="flex gap-4 mt-6">
            {Object.keys(timeLeft).length > 0 ? (
              Object.entries(timeLeft).map(([interval, value]) => (
                <div key={interval} className="text-center">
                  <div className="bg-white p-4 rounded-lg shadow-sm w-20">
                    <div className="text-3xl font-bold">
                      {String(value).padStart(2, "0")}
                    </div>
                    <div className="text-xs text-gray-500 uppercase">
                      {interval}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-red-600 font-bold">Ưu đãi đã kết thúc!</p>
            )}
          </div>
          <Button
            asChild
            size="lg"
            className="mt-8 bg-red-500 hover:bg-red-600 text-white font-bold"
          >
            <Link href={`/tours/${deal.tourId}`}>Đặt Ngay Kẻo Lỡ</Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
