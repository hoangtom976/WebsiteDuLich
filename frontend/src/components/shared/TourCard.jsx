"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Clock, Star, Heart } from "lucide-react";
import { cn, formatDuration, formatPrice } from "@/lib/utils";
import { useState } from "react";
import { toggleYeuThich } from "@/services/yeuThichService";
import { toast } from "sonner";
import { getAuthState } from "@/lib/auth-client";

export default function TourCard({ tour }) {
  const [isFavorite, setIsFavorite] = useState(tour.daYeuThich);
  const auth = getAuthState();
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

          <div className="absolute left-4 top-4 flex w-full justify-between pr-8">
            <span className="inline-flex items-center rounded-full bg-white/90 px-2.5 py-0.5 text-xs font-semibold text-slate-800 shadow-sm transition-colors hover:bg-white">
              {tour.tenDanhMuc || "Du lịch"}
            </span>
            <button
              onClick={async (e) => {
                e.preventDefault();
                e.stopPropagation();

                if (!auth.isLoggedIn) {
                  toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
                  return;
                }

                try {
                  const res = await toggleYeuThich(tour.id);
                  const newStatus = !isFavorite;
                  setIsFavorite(newStatus);
                  if (newStatus) {
                    toast.success("Đã thêm vào danh sách yêu thích");
                  } else {
                    toast.info("Đã xóa khỏi danh sách yêu thích");
                  }
                } catch (error) {
                  toast.error("Không thể cập nhật danh sách yêu thích");
                }
              }}
              className="group/heart rounded-full bg-white/90 p-1.5 text-slate-400 shadow-sm transition-all hover:bg-white active:scale-95"
            >
              <Heart className={cn("h-4 w-4 transition-colors", isFavorite ? "fill-rose-500 text-rose-500" : "group-hover/heart:fill-rose-500/20 group-hover/heart:text-rose-400")} />
            </button>
          </div>

          <div className="absolute bottom-4 left-4 right-4 flex items-center text-sm font-medium text-white/90">
            <MapPin className="mr-1.5 h-4 w-4" />
            <span className="truncate">{tour.tenDiaDiem || "Đang cập nhật"}</span>
          </div>
        </div>

        <CardContent className="flex flex-1 flex-col p-3">
          <div className="flex items-start justify-between gap-1">
            <h3 className="line-clamp-2 min-h-[2.5rem] text-sm font-bold leading-tight text-slate-900 transition-colors group-hover:text-blue-600">
              {tour.tenTour}
            </h3>
          </div>

          <p className="mt-1 line-clamp-2 text-xs text-slate-500 min-h-[2rem]">
            {tour.moTa || "Khám phá những điểm đến tuyệt vời với trải nghiệm khó quên."}
          </p>

          <div className="mt-1 flex items-center justify-between">
            {rating.total > 0 ? (
              <div className="flex items-center text-xs font-medium text-amber-500">
                <Star className="mr-1 h-3 w-3 fill-amber-500" />
                <span>{rating.average}</span>
                <span className="ml-1 text-[10px] text-slate-400">({rating.total} đánh giá)</span>
              </div>
            ) : (
              <div className="text-[10px] text-slate-400 italic">Chưa có đánh giá</div>
            )}
          </div>

          <div className="mt-auto flex items-center justify-between border-t border-slate-100 pt-2">
            <div className="flex items-center text-xs font-medium text-slate-600">
              <Clock className="mr-1 h-3.5 w-3.5 text-emerald-500" />
              <span>{formatDuration(tour.soNgay) || "Đang cập nhật"}</span>
            </div>
            <div className="flex flex-col items-end">
              <span className="text-[10px] font-semibold text-slate-500">Giá từ</span>
              <span className="text-base font-extrabold text-orange-500 leading-none">{formattedPrice}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
