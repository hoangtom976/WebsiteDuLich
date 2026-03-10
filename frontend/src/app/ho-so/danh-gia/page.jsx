"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, Calendar, Pencil, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMyReviews } from "@/services/reviewService";
import Link from "next/link";

export default function MyReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const data = await getMyReviews();
                setReviews(data);
            } catch (error) {
                console.error("Lỗi khi tải đánh giá của tôi:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    return (
        <div className="min-h-screen bg-slate-50 py-12">
            <div className="mx-auto max-w-4xl px-4">
                <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                    <div>
                        <h1 className="text-3xl font-extrabold text-slate-900">Đánh giá của tôi</h1>
                        <p className="mt-1 text-slate-500 text-sm">Chia sẻ trải nghiệm của bạn về các chuyến đi.</p>
                    </div>
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-600">
                        <Star className="h-6 w-6 fill-current" />
                    </div>
                </div>

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="h-40 w-full animate-pulse rounded-2xl bg-white" />
                        ))}
                    </div>
                ) : reviews.length === 0 ? (
                    <Card className="border-dashed border-2 bg-white/50 text-center py-16 rounded-3xl">
                        <CardContent>
                            <div className="mx-auto w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                                <MessageSquare className="h-8 w-8 text-slate-400" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Bạn chưa có đánh giá nào</h3>
                            <p className="text-slate-500 mt-2">Hãy chia sẻ cảm nhận về các tour bạn đã tham gia nhé!</p>
                            <Button asChild className="mt-6 rounded-full bg-blue-600 hover:bg-blue-700">
                                <Link href="/lich-su-dat-tour">Xem tour đã đặt</Link>
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="space-y-6">
                        {reviews.map((review) => (
                            <Card key={review.id} className="overflow-hidden rounded-2xl border-slate-100 shadow-sm transition hover:shadow-md">
                                <CardContent className="p-0">
                                    <div className="p-6">
                                        <div className="mb-4 flex items-center justify-between">
                                            <Link href={`/tours/${review.tourId}`} className="text-lg font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                                                {review.tenTour}
                                            </Link>
                                            <div className="flex items-center gap-1 bg-amber-50 px-2 py-1 rounded-lg">
                                                <Star className="h-4 w-4 fill-amber-500 text-amber-500" />
                                                <span className="text-sm font-bold text-amber-700">{review.soSao}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
                                            <Calendar className="h-3.5 w-3.5" />
                                            <span>{new Date(review.ngayDanhGia).toLocaleString("vi-VN")}</span>
                                        </div>

                                        <p className="text-slate-700 text-sm leading-relaxed italic border-l-4 border-blue-500/20 pl-4 py-1 mb-6">
                                            "{review.binhLuan}"
                                        </p>

                                        {review.noiDungPhanHoi && (
                                            <div className="mt-4 rounded-xl bg-slate-50 p-4 border border-slate-100 relative">
                                                <div className="absolute -top-3 left-4 bg-white px-2 text-[10px] font-bold text-blue-600 uppercase border rounded-full">
                                                    Phản hồi từ Antigravity Travel
                                                </div>
                                                <p className="text-sm text-slate-600 leading-relaxed">
                                                    {review.noiDungPhanHoi}
                                                </p>
                                                <div className="mt-2 text-[10px] text-slate-400">
                                                    Bởi: {review.tenNhanVienPhanHoi} • {new Date(review.ngayPhanHoi).toLocaleDateString("vi-VN")}
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center justify-end gap-2 border-t border-slate-50 bg-slate-50/30 px-6 py-3">
                                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-blue-600 text-xs gap-2">
                                            <Pencil className="h-3.5 w-3.5" /> Chỉnh sửa
                                        </Button>
                                        <Button variant="ghost" size="sm" className="text-slate-500 hover:text-rose-600 text-xs gap-2">
                                            <Trash2 className="h-3.5 w-3.5" /> Xóa
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
