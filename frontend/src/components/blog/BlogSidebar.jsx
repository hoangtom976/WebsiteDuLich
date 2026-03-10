"use client";

import Link from "next/link";
import { Calendar, ChevronRight, Flame, Tag, MapPin } from "lucide-react";
import { formatPrice } from "@/lib/utils";

const fallbackImage = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop";

export default function BlogSidebar({ popularPosts = [], categories = [], relatedTours = [] }) {
    return (
        <aside className="space-y-10">
            {/* Popular Posts */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <Flame className="w-5 h-5 text-orange-500" />
                    Bài viết nổi bật
                </h3>
                <div className="space-y-5">
                    {(popularPosts || []).map((post) => (
                        <Link key={post.id} href={`/blog/${post.slug}`} className="group flex gap-4 items-start">
                            <div className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden relative">
                                <img
                                    src={post.anhBia || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=200&auto=format&fit=crop"}
                                    alt={post.tieuDe}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            </div>
                            <div className="flex-grow">
                                <h4 className="text-sm font-bold group-hover:text-amber-600 transition-colors line-clamp-2 leading-tight mb-1">
                                    {post.tieuDe}
                                </h4>
                                <p className="text-[10px] text-gray-400 uppercase tracking-wider font-semibold">
                                    {new Date(post.ngayTao).toLocaleDateString("vi-VN")}
                                </p>
                            </div>
                        </Link>
                    ))}
                </div>
            </div>



            {/* Related Tours */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                    <MapPin className="w-5 h-5 text-blue-500" />
                    Tour gợi ý
                </h3>
                <div className="space-y-6">
                    {(relatedTours || []).slice(0, 3).map((tour) => (
                        <Link key={tour.id} href={`/tours/${tour.id}`} className="group block">
                            <div className="relative h-40 rounded-xl overflow-hidden mb-3">
                                <img
                                    src={tour.hinhAnh ? (tour.hinhAnh.startsWith('http') ? tour.hinhAnh : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api'}/files/image/${tour.hinhAnh}`) : fallbackImage}
                                    alt={tour.tenTour}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                    onError={(e) => {
                                        e.currentTarget.src = fallbackImage;
                                    }}
                                />
                                <div className="absolute top-2 left-2 bg-amber-500 text-white text-[10px] font-bold px-2 py-1 rounded shadow-sm">
                                    {tour.giaKhuyenMai ? "ƯU ĐÃI" : "HOT"}
                                </div>
                            </div>
                            <h4 className="font-bold text-gray-900 group-hover:text-amber-600 transition-colors line-clamp-1">
                                {tour.tenTour}
                            </h4>
                            <p className="text-sm text-amber-600 font-bold mt-1">
                                {formatPrice(tour.gia || tour.giaKhuyenMai || tour.giaGoc || 0)}
                            </p>
                        </Link>
                    ))}
                </div>
                <Link href="/tours" className="mt-6 flex items-center justify-center gap-2 text-sm font-bold text-gray-500 hover:text-amber-600 transition-colors py-3 border-t border-gray-50">
                    Xem tất cả tour <ChevronRight className="w-4 h-4" />
                </Link>
            </div>
        </aside>
    );
}
