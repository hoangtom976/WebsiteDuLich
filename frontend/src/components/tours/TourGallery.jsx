"use client";

import { useState } from "react";
import { ChevronLeft, ChevronRight, X, Camera } from "lucide-react";

export default function TourGallery({ images = [] }) {
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [currentIndex, setCurrentIndex] = useState(0);

    if (!images || images.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center py-12 text-center">
                <Camera className="w-12 h-12 text-gray-200 mb-3" />
                <p className="text-sm text-gray-400 italic">Chưa có ảnh trải nghiệm nào được tải lên.</p>
            </div>
        );
    }

    const displayImages = images.slice(0, 5);
    const extraCount = images.length - 5;

    const openLightbox = (index) => {
        // Map display index to full images array index
        setCurrentIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => setLightboxOpen(false);

    const goNext = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev + 1) % images.length);
    };

    const goPrev = (e) => {
        e.stopPropagation();
        setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
    };

    const handleKeyDown = (e) => {
        if (e.key === "Escape") closeLightbox();
        if (e.key === "ArrowRight") goNext(e);
        if (e.key === "ArrowLeft") goPrev(e);
    };

    return (
        <>
            {/* Grid Gallery — 1 lớn + 4 nhỏ */}
            <div className="grid grid-cols-4 grid-rows-2 gap-1.5 rounded-2xl overflow-hidden h-[400px]">
                {/* Ảnh lớn */}
                <div
                    className="col-span-2 row-span-2 relative group cursor-pointer overflow-hidden"
                    onClick={() => openLightbox(0)}
                >
                    <img
                        src={displayImages[0]}
                        alt="Ảnh trải nghiệm 1"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* 4 ảnh nhỏ */}
                {displayImages.slice(1, 5).map((img, index) => (
                    <div
                        key={index + 1}
                        className="relative group overflow-hidden cursor-pointer"
                        onClick={() => openLightbox(index + 1)}
                    >
                        <img
                            src={img}
                            alt={`Ảnh trải nghiệm ${index + 2}`}
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        {/* Overlay "+N ảnh" trên ảnh cuối */}
                        {index === 3 && extraCount > 0 && (
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center hover:bg-black/60 transition-colors">
                                <span className="text-white text-xl font-bold">+{extraCount} ảnh</span>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* Lightbox */}
            {lightboxOpen && (
                <div
                    className="fixed inset-0 z-[9999] bg-black/95 flex items-center justify-center"
                    onClick={closeLightbox}
                    onKeyDown={handleKeyDown}
                    tabIndex={0}
                    ref={(el) => el && el.focus()}
                >
                    {/* Nút đóng */}
                    <button
                        onClick={closeLightbox}
                        className="absolute top-5 right-5 z-10 w-11 h-11 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                    >
                        <X className="w-6 h-6" />
                    </button>

                    {/* Số thứ tự */}
                    <div className="absolute top-5 left-5 z-10 px-4 py-2 rounded-full bg-white/10 backdrop-blur-md text-white text-sm font-medium">
                        {currentIndex + 1} / {images.length}
                    </div>

                    {/* Nút trước */}
                    {images.length > 1 && (
                        <button
                            onClick={goPrev}
                            className="absolute left-4 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            <ChevronLeft className="w-7 h-7" />
                        </button>
                    )}

                    {/* Ảnh chính */}
                    <div className="max-w-[90vw] max-h-[85vh] flex items-center justify-center" onClick={(e) => e.stopPropagation()}>
                        <img
                            key={currentIndex}
                            src={images[currentIndex]}
                            alt={`Ảnh ${currentIndex + 1}`}
                            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl animate-in fade-in zoom-in-95 duration-300"
                        />
                    </div>

                    {/* Nút sau */}
                    {images.length > 1 && (
                        <button
                            onClick={goNext}
                            className="absolute right-4 z-10 w-12 h-12 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/20 transition-colors"
                        >
                            <ChevronRight className="w-7 h-7" />
                        </button>
                    )}

                    {/* Thumbnail strip phía dưới */}
                    <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex gap-2 max-w-[90vw] overflow-x-auto px-4 py-2 rounded-2xl bg-white/5 backdrop-blur-md">
                        {images.map((img, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.stopPropagation(); setCurrentIndex(i); }}
                                className={`w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${i === currentIndex ? "border-white scale-110 shadow-lg" : "border-transparent opacity-50 hover:opacity-80"
                                    }`}
                            >
                                <img src={img} alt={`Thumb ${i + 1}`} className="w-full h-full object-cover" />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}
