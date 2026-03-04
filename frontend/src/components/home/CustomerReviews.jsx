"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import { Star } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function CustomerReviews({ reviews }) {
  return (
    <section className="py-10 sm:py-12 bg-white">
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <h2 className="text-4xl font-bold text-center mb-8">
          Khách Hàng Nói Gì Về Chúng Tôi
        </h2>
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
            <SwiperSlide key={review.id} className="pb-12 h-auto">
              <div className="bg-white p-6 rounded-lg shadow-sm h-full min-h-[260px] border transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col">
                <div className="flex items-center mb-4">
                  <Avatar>
                    <AvatarImage
                      src={`https://i.pravatar.cc/150?u=${review.tenNguoiDung}`}
                    />
                    <AvatarFallback>
                      {review.tenNguoiDung.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="ml-4">
                    <p className="font-semibold">{review.tenNguoiDung}</p>
                    <div className="flex">
                      {[...Array(review.soSao)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-4 h-4 text-yellow-400 fill-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                </div>
                <p className="text-gray-600 italic leading-relaxed max-h-28 overflow-hidden">
                  "{review.binhLuan}"
                </p>
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>
    </section>
  );
}
