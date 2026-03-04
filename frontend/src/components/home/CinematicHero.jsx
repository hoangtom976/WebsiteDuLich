"use client";

import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, Pagination, Navigation } from "swiper/modules";
import "swiper/css";
import "swiper/css/pagination";
import "swiper/css/navigation";
import HeroSearch from "./HeroSearch";

export default function CinematicHero() {
  const images = [
    "https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2560&auto=format&fit=crop",
  ];

  return (
    <section className="relative h-[calc(100svh-var(--topbar-height))] min-h-[700px] w-full select-none overflow-hidden">
      <Swiper
        modules={[Autoplay, Pagination, Navigation]}
        autoplay={{ delay: 7000, disableOnInteraction: false }}
        navigation={true}
        pagination={{ clickable: true }}
        className="h-full w-full"
      >
        {images.map((imgUrl, index) => (
          <SwiperSlide key={index} className="relative h-full">
            <img
              src={imgUrl}
              alt={`Banner image ${index + 1}`}
              className="w-full h-full object-cover"
            />
          </SwiperSlide>
        ))}
      </Swiper>

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/55 via-slate-950/35 to-slate-950/60" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(245,158,11,0.20),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(14,116,144,0.22),transparent_35%)]" />

      <div className="absolute inset-0 z-10 flex h-full select-none flex-col items-center justify-center px-4 pt-[calc(var(--header-height)+1rem)] text-center text-white">
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-6 md:gap-7">
          <h1 className="text-4xl font-bold tracking-tight md:text-6xl lg:text-7xl animate-fade-in-down">
            Tinh hoa du lich Viet Nam
          </h1>
          <p className="max-w-3xl text-base text-white/90 md:text-lg lg:text-xl animate-fade-in-up">
            Hon 500+ hanh trinh chon loc, san sang dua ban den nhung diem den
            tuyet voi.
          </p>

          <div className="w-full select-text">
            <HeroSearch />
          </div>
        </div>
      </div>
    </section>
  );
}
