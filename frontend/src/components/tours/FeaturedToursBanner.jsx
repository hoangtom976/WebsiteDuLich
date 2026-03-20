"use client";

import Link from "next/link";
import { ArrowRight, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/utils";
import { useState, useEffect } from "react";

export default function FeaturedToursBanner({ tours }) {
    const [activeIndex, setActiveIndex] = useState(0);

    // Reset index if tours change
    useEffect(() => {
        setActiveIndex(0);
    }, [tours]);

    if (!tours || tours.length < 3) return null;

    const mainTour = tours[activeIndex];

    // Tìm index của 2 tour còn lại
    const sideTourIndices = tours
        .map((_, idx) => idx)
        .filter(idx => idx !== activeIndex);

    const getImageUrl = (img) => {
        if (!img) return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200";
        return img.startsWith('http') ? img : `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081/api'}/files/image/${img}`;
    };

    return (
        <div className="mb-10 overflow-hidden">
            {/* Banner chính */}
            <div className="relative overflow-hidden rounded-3xl group h-[500px] shadow-2xl bg-slate-100">
                <img
                    key={mainTour.id}
                    src={getImageUrl(mainTour.hinhAnh)}
                    alt={mainTour.tenTour}
                    className="absolute inset-0 h-full w-full object-cover transition-all duration-1000 animate-in fade-in zoom-in-95"
                />

                {/* Overlay làm tối để text nổi hơn */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />

                <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-end">
                    <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                        {/* Thông tin Tour chính - Chỉ Link khi bấm vào nút Khám phá ngay */}
                        <div key={`info-${mainTour.id}`} className="flex-1 animate-in slide-in-from-left-4 duration-700">
                            <div className="flex flex-wrap items-center gap-3 mb-4">
                                <span className="bg-amber-500 text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-lg">
                                    Tour Nổi Bật
                                </span>
                                <span className="flex items-center text-white/90 text-sm font-medium backdrop-blur-md bg-black/20 px-3 py-1 rounded-full border border-white/10">
                                    <MapPin className="h-4 w-4 mr-1.5 text-red-500" />
                                    {mainTour.tenDiaDiem}
                                </span>
                            </div>

                            <h2 className="text-3xl md:text-4xl lg:text-5xl font-black text-white mb-6 leading-tight drop-shadow-2xl line-clamp-2 max-w-3xl">
                                {mainTour.tenTour}
                            </h2>

                            <div className="flex items-center gap-6">
                                <div className="flex flex-col">
                                    <span className="text-white/60 text-xs uppercase tracking-widest font-bold">Giá ưu đãi</span>
                                    <span className="text-3xl md:text-4xl font-black text-orange-400 drop-shadow-lg">
                                        {formatPrice(mainTour.gia)}
                                    </span>
                                </div>

                                <Link
                                    href={`/tours/${mainTour.id}`}
                                    className="inline-flex items-center justify-center bg-white text-slate-900 font-bold px-8 py-4 rounded-2xl transition-all hover:bg-orange-500 hover:text-white hover:scale-105 active:scale-95 shadow-xl"
                                >
                                    Khám phá ngay
                                    <ArrowRight className="ml-2 h-5 w-5" />
                                </Link>
                            </div>
                        </div>

                        {/* 2 Tour phụ ở góc dưới bên phải - Click để THAY THẾ banner chính */}
                        <div className="hidden lg:flex gap-4 max-w-md">
                            {sideTourIndices.map((idx) => {
                                const tour = tours[idx];
                                return (
                                    <button
                                        onClick={() => setActiveIndex(idx)}
                                        key={tour.id}
                                        className="relative overflow-hidden rounded-2xl group/sub h-[160px] w-[200px] border border-white/20 shadow-2xl transition-all hover:scale-105 hover:border-orange-500 active:scale-95"
                                    >
                                        <img
                                            src={getImageUrl(tour.hinhAnh)}
                                            alt={tour.tenTour}
                                            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 pointer-events-none"
                                        />
                                        <div className="absolute inset-0 bg-black/40 hover:bg-black/20 transition-colors" />

                                        <div className="absolute inset-0 p-3 flex flex-col justify-end text-left">
                                            <h3 className="text-[13px] font-bold text-white line-clamp-2 leading-snug mb-1 drop-shadow-md">
                                                {tour.tenTour}
                                            </h3>
                                            <span className="text-orange-400 font-black text-xs">
                                                {formatPrice(tour.gia)}
                                            </span>
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>
            </div>

            {/* Hiển thị 2 tour phụ cho Mobile - Click để thay thế */}
            <div className="lg:hidden grid grid-cols-2 gap-3 mt-4">
                {sideTourIndices.map((idx) => {
                    const tour = tours[idx];
                    return (
                        <button
                            onClick={() => setActiveIndex(idx)}
                            key={tour.id}
                            className="relative overflow-hidden rounded-xl h-[120px] shadow-md border border-slate-100 active:scale-95 transition-transform"
                        >
                            <img
                                src={getImageUrl(tour.hinhAnh)}
                                alt={tour.tenTour}
                                className="absolute inset-0 h-full w-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent" />
                            <div className="absolute inset-0 p-3 flex flex-col justify-end text-left">
                                <h3 className="text-[11px] font-bold text-white line-clamp-1 mb-0.5">
                                    {tour.tenTour}
                                </h3>
                                <span className="text-orange-400 font-extrabold text-[10px]">
                                    {formatPrice(tour.gia)}
                                </span>
                            </div>
                        </button>
                    );
                })}
            </div>
        </div>
    );
}
