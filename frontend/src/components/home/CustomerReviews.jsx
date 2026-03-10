"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Star, Quote, MessageSquareQuote } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import SectionHeader from "@/components/shared/SectionHeader";

export default function CustomerReviews({ reviews }) {
  return (
    <section className="py-10 sm:py-16 bg-slate-50/50 relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-200/20 blur-3xl rounded-full" />
      <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-200/20 blur-3xl rounded-full" />

      <div className="max-w-7xl mx-auto px-6 lg:px-8 relative z-10">
        <SectionHeader
          title="Khách Hàng Nói Gì Về Chúng Tôi"
          subtitle="Những chia sẻ chân thực từ những du khách đã đồng hành cùng Việt Tour trên mọi nẻo đường."
          icon={MessageSquareQuote}
          badgeText="Đánh giá"
          iconBg="bg-rose-50"
          iconColor="text-rose-500"
        />
        <Swiper
          modules={[Pagination, Autoplay]}
          spaceBetween={30}
          slidesPerView={1}
          pagination={{ clickable: true }}
          autoplay={{ delay: 5000 }}
          breakpoints={{
            768: { slidesPerView: 2 },
            1024: { slidesPerView: 3 },
          }}
        >
          {(reviews || []).map((review) => (
            <SwiperSlide key={review.id} className="pb-16 h-auto">
              <div className="group bg-white p-8 rounded-[2rem] shadow-[0_4px_20px_rgba(0,0,0,0.03)] h-full min-h-[300px] border border-slate-100 transition-all duration-500 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)] hover:-translate-y-2 flex flex-col relative overflow-hidden">
                <div className="absolute top-6 right-8 opacity-[0.05] group-hover:opacity-[0.1] transition-opacity duration-500">
                  <Quote className="w-16 h-16 text-slate-900" />
                </div>

                <div className="flex items-center mb-6 relative z-10">
                  <div className="relative">
                    <Avatar className="h-14 w-14 border-2 border-amber-100 p-0.5">
                      <AvatarImage
                        src={`https://i.pravatar.cc/150?u=${review.tenNguoiDung}`}
                      />
                      <AvatarFallback className="bg-amber-500 text-white font-bold">
                        {review.tenNguoiDung.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-1 shadow-sm">
                      <div className="bg-emerald-500 w-3 h-3 rounded-full border-2 border-white" />
                    </div>
                  </div>
                  <div className="ml-4">
                    <p className="font-extrabold text-slate-900 text-lg tracking-tight">{review.tenNguoiDung}</p>
                    <div className="flex gap-0.5 mt-1">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3.5 h-3.5 ${i < review.soSao ? "text-amber-500 fill-amber-500" : "text-slate-200"}`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <div className="relative z-10 flex-1">
                  <p className="text-slate-600 italic leading-relaxed text-base font-medium">
                    "{review.binhLuan}"
                  </p>
                </div>
                <div className="mt-6 pt-6 border-t border-slate-50 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Khách hàng xác thực</span>
                </div>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
