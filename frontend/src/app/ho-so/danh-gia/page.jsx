"use client";

import { useEffect, useState } from "react";
import { Star, MessageSquare, Calendar, Pencil, Trash2, Send, MapPin, ChevronDown } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { getMyReviews, getToursForReview, submitReview } from "@/services/reviewService";
import Link from "next/link";

function StarSelector({ value, onChange }) {
    const [hover, setHover] = useState(0);
    return (
        <div className="flex items-center gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
                <button
                    key={star}
                    type="button"
                    onClick={() => onChange(star)}
                    onMouseEnter={() => setHover(star)}
                    onMouseLeave={() => setHover(0)}
                    className="p-0.5 transition-transform hover:scale-110"
                >
                    <Star
                        className={`h-7 w-7 transition-colors ${(hover || value) >= star
                            ? "fill-amber-400 text-amber-400"
                            : "fill-slate-200 text-slate-200"
                            }`}
                    />
                </button>
            ))}
            {value > 0 && (
                <span className="ml-2 text-sm font-bold text-amber-600">
                    {value === 1 ? "Tệ" : value === 2 ? "Kém" : value === 3 ? "Bình thường" : value === 4 ? "Tốt" : "Tuyệt vời"}
                </span>
            )}
        </div>
    );
}

function ReviewForm({ tour, onSuccess, onCancel }) {
    const [soSao, setSoSao] = useState(0);
    const [binhLuan, setBinhLuan] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (soSao === 0) {
            setError("Vui lòng chọn số sao");
            return;
        }
        if (!binhLuan.trim()) {
            setError("Vui lòng nhập bình luận");
            return;
        }
        setError("");
        setSubmitting(true);
        try {
            await submitReview({ tourId: tour.tourId, soSao, binhLuan: binhLuan.trim() });
            onSuccess();
        } catch (err) {
            setError(err?.response?.data || "Có lỗi xảy ra, vui lòng thử lại");
        } finally {
            setSubmitting(false);
        }
    };

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081/api";
    const tourImage = tour.anhTour
        ? (tour.anhTour.startsWith("http") ? tour.anhTour : `${apiBase}/files/image/${tour.anhTour}`)
        : null;

    return (
        <Card className="overflow-hidden rounded-2xl border-blue-200 shadow-lg bg-white">
            <CardContent className="p-0">
                <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 flex items-center gap-4">
                    {tourImage && (
                        <img src={tourImage} alt={tour.tenTour} className="h-12 w-12 rounded-xl object-cover border-2 border-white/30" />
                    )}
                    <div className="flex-1 min-w-0">
                        <h3 className="text-white font-bold text-base truncate">{tour.tenTour}</h3>
                        <div className="flex items-center gap-1 text-blue-100 text-xs mt-0.5">
                            <Calendar className="h-3 w-3" />
                            <span>Ngày đi: {new Date(tour.ngayKhoiHanh).toLocaleDateString("vi-VN")}</span>
                        </div>
                    </div>
                    <button onClick={onCancel} className="text-white/70 hover:text-white text-xs font-medium px-3 py-1 rounded-lg hover:bg-white/10 transition">
                        Đóng
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-5">
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Đánh giá của bạn</label>
                        <StarSelector value={soSao} onChange={setSoSao} />
                    </div>
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2">Chia sẻ trải nghiệm</label>
                        <textarea
                            value={binhLuan}
                            onChange={(e) => setBinhLuan(e.target.value)}
                            placeholder="Hãy chia sẻ cảm nhận của bạn về chuyến đi này..."
                            rows={4}
                            className="w-full rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm outline-none ring-blue-500/20 transition focus:border-blue-500 focus:ring-2 focus:bg-white resize-none placeholder:text-slate-400"
                        />
                    </div>
                    {error && (
                        <p className="text-sm text-rose-600 bg-rose-50 px-3 py-2 rounded-lg">{error}</p>
                    )}
                    <div className="flex justify-end gap-3">
                        <Button type="button" variant="ghost" size="sm" onClick={onCancel} className="rounded-full text-slate-500">
                            Hủy
                        </Button>
                        <Button
                            type="submit"
                            size="sm"
                            disabled={submitting}
                            className="rounded-full bg-blue-600 hover:bg-blue-700 text-white gap-2 px-6"
                        >
                            {submitting ? "Đang gửi..." : (
                                <>
                                    <Send className="h-3.5 w-3.5" />
                                    Gửi đánh giá
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}

export default function MyReviewsPage() {
    const [reviews, setReviews] = useState([]);
    const [toursForReview, setToursForReview] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeReviewTourId, setActiveReviewTourId] = useState(null);

    const fetchData = async () => {
        try {
            const [reviewsData, toursData] = await Promise.all([
                getMyReviews(),
                getToursForReview()
            ]);
            setReviews(reviewsData);
            setToursForReview(toursData);
        } catch (error) {
            console.error("Lỗi khi tải dữ liệu đánh giá:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleReviewSuccess = () => {
        setActiveReviewTourId(null);
        setLoading(true);
        fetchData();
    };

    const apiBase = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081/api";

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

                {/* Tour chờ đánh giá */}
                {!loading && toursForReview.length > 0 && (
                    <div className="mb-8">
                        <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                            <span className="w-1 h-5 bg-blue-600 rounded-full" />
                            Tour chờ đánh giá
                            <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 border-blue-200">
                                {toursForReview.length}
                            </Badge>
                        </h2>

                        <div className="space-y-4">
                            {toursForReview.map((tour) => {
                                if (activeReviewTourId === tour.tourId) {
                                    return (
                                        <ReviewForm
                                            key={tour.tourId}
                                            tour={tour}
                                            onSuccess={handleReviewSuccess}
                                            onCancel={() => setActiveReviewTourId(null)}
                                        />
                                    );
                                }

                                const tourImage = tour.anhTour
                                    ? (tour.anhTour.startsWith("http") ? tour.anhTour : `${apiBase}/files/image/${tour.anhTour}`)
                                    : null;

                                return (
                                    <Card key={tour.tourId} className="overflow-hidden rounded-2xl border-slate-100 shadow-sm transition hover:shadow-md">
                                        <CardContent className="p-0">
                                            <div className="flex items-center gap-4 p-4">
                                                {tourImage && (
                                                    <img src={tourImage} alt={tour.tenTour} className="h-16 w-24 rounded-xl object-cover flex-shrink-0" />
                                                )}
                                                <div className="flex-1 min-w-0">
                                                    <Link href={`/tours/${tour.tourId}`} className="text-base font-bold text-slate-900 hover:text-blue-600 transition-colors line-clamp-1">
                                                        {tour.tenTour}
                                                    </Link>
                                                    <div className="flex items-center gap-1 text-xs text-slate-400 mt-1">
                                                        <Calendar className="h-3 w-3" />
                                                        <span>Ngày đi: {new Date(tour.ngayKhoiHanh).toLocaleDateString("vi-VN")}</span>
                                                    </div>
                                                </div>
                                                <Button
                                                    size="sm"
                                                    onClick={() => setActiveReviewTourId(tour.tourId)}
                                                    className="rounded-full bg-blue-600 hover:bg-blue-700 text-white gap-2 flex-shrink-0"
                                                >
                                                    <Pencil className="h-3.5 w-3.5" />
                                                    Viết đánh giá
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* Đánh giá đã viết */}
                {!loading && reviews.length > 0 && (
                    <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <span className="w-1 h-5 bg-amber-500 rounded-full" />
                        Đánh giá đã viết
                        <Badge variant="outline" className="rounded-full px-2.5 py-0.5 text-[10px] font-bold bg-amber-50 text-amber-600 border-amber-200">
                            {reviews.length}
                        </Badge>
                    </h2>
                )}

                {loading ? (
                    <div className="space-y-4">
                        {[1, 2].map(i => (
                            <div key={i} className="h-40 w-full animate-pulse rounded-2xl bg-white" />
                        ))}
                    </div>
                ) : reviews.length === 0 && toursForReview.length === 0 ? (
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
                                                    Phản hồi từ VietTour
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
                                </CardContent>
                            </Card>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
