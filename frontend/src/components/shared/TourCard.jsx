"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Star } from "lucide-react";
import { cn, formatDuration, formatPrice } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function TourCard({ tour }) {
  const formattedPrice = formatPrice(tour.gia);
  const fallbackImage = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop";

  const rating = {
    average: tour.soSaoTrungBinh || 0,
    total: tour.tongDanhGia || 0
  };

  return (
    <Link href={`/tours/${tour.id}`} className="block h-full">
      <Card className="group flex h-full flex-col overflow-hidden rounded-xl border border-slate-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-md">
        <div className="relative aspect-[3/2] w-full overflow-hidden">
          <img
            src={tour.hinhAnh ? (tour.hinhAnh.startsWith('http') ? tour.hinhAnh : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api'}/files/image/${tour.hinhAnh}`) : fallbackImage}
            alt={tour.tenTour}
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
            onError={(e) => {
              e.currentTarget.src = fallbackImage;
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent opacity-80" />

          <div className="absolute left-4 top-4">
            <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:bg-white">
              {tour.tenDanhMuc || "Du lịch"}
            </span>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center text-sm font-medium text-white/90">
            <MapPin className="mr-1.5 h-4 w-4" />
            <span className="truncate">{tour.tenDiaDiem || "Đang cập nhật"}</span>
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col p-4">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-2 min-h-[2.75rem] text-base font-bold leading-tight text-slate-900 transition-colors group-hover:text-blue-600">
              {tour.tenTour}
            </h3>
          </div>

          <div className="mt-2 flex items-center justify-between">
            {rating.total > 0 ? (
              <div className="flex items-center text-sm font-medium text-amber-500">
                <Star className="mr-1 h-3.5 w-3.5 fill-amber-500" />
                <span>{rating.average}</span>
                <span className="ml-1 text-xs text-slate-400">({rating.total} đánh giá)</span>
              </div>
            ) : (
              <div className="text-xs text-slate-400 italic">Chưa có đánh giá</div>
            )}
          </div>

          <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
            <div className="flex items-center text-sm font-medium text-slate-600">
              <Clock className="mr-1.5 h-4 w-4 text-emerald-500" />
              <span>{formatDuration(tour.soNgay) || "Đang cập nhật"}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-xs font-semibold text-slate-500">Giá từ</span>
              <span className="text-lg font-extrabold text-orange-500">{formattedPrice}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
