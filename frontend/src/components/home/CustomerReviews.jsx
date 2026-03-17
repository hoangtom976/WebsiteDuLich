"use client";

import { Star, Quote, MessageSquareQuote, MapPin, User } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";
import Link from "next/link";

export default function CustomerReviews({ reviews }) {
  if (!reviews || reviews.length === 0) return null;

  return (
    <section className="bg-slate-50/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/20 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10 py-2">
        <SectionHeader
          title="Khách Hàng Nói Gì Về Chúng Tôi"
          subtitle="Những đánh giá chân thực và trải nghiệm tuyệt vời nhất từ khách hàng."
          icon={MessageSquareQuote}
          badgeText="Phản hồi"
          iconBg="bg-rose-50"
          iconColor="text-rose-500"
        />

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          {reviews.map((review) => (
            <Link
              key={review.id}
              href={`/tours/${review.tourId}`}
              className="group bg-white p-5 rounded-2xl shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col relative overflow-hidden"
            >
              <div className="absolute top-4 right-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity duration-300">
                <Quote className="w-10 h-10 text-slate-900" />
              </div>

              <div className="flex items-center mb-4 relative z-10">
                <div className="relative">
                  <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center border border-slate-200 text-slate-500 group-hover:bg-amber-50 group-hover:text-amber-500 transition-colors">
                    <User className="h-5 w-5" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 bg-white rounded-full p-0.5 shadow-sm border border-slate-100">
                    <div className="bg-emerald-500 w-2.5 h-2.5 rounded-full border border-white" />
                  </div>
                </div>
                <div className="ml-3">
                  <h4 className="font-bold text-slate-900 text-sm tracking-tight line-clamp-1">
                    {review.tenNguoiDung}
                  </h4>
                  <div className="flex gap-0.5 mt-0.5">
                    {[...Array(5)].map((_, i) => (
                      <Star
                        key={i}
                        className={`w-3 h-3 ${i < review.soSao ? "text-amber-500 fill-amber-500" : "text-slate-200"}`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex-1 mb-4">
                <p className="text-slate-600 italic text-sm font-medium line-clamp-3">
                  "{review.binhLuan}"
                </p>
              </div>

              <div className="mt-auto pt-4 border-t border-slate-100 flex flex-col gap-2 relative z-10">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] font-bold text-emerald-600 uppercase tracking-wider bg-emerald-50 px-1.5 py-0.5 rounded">
                    Xác thực
                  </span>
                  <span className="text-[10px] text-slate-400 font-medium">
                    {new Date(review.ngayDanhGia).toLocaleDateString("vi-VN")}
                  </span>
                </div>

                {review.tenTour && (
                  <div className="flex items-center gap-1.5 text-[11px] font-bold text-blue-600 bg-blue-50 group-hover:bg-blue-100 px-2 py-1.5 rounded-lg transition-colors">
                    <MapPin className="w-3 h-3 shrink-0" />
                    <span className="truncate">{review.tenTour}</span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

