"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAdminTours } from "@/services/adminTourService";
import { getAdminReviewsByTour, replyAdminReview } from "@/services/adminReviewService";

function extractApiError(error, fallback) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.thongDiep) return data.thongDiep;
  if (data?.message) return data.message;
  if (status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (status === 403) return "Bạn không có quyền quản lý đánh giá.";
  return fallback;
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
}

function renderStars(count) {
  const safe = Math.max(0, Math.min(5, Number(count || 0)));
  return "★".repeat(safe) + "☆".repeat(5 - safe);
}

export default function AdminReviewsPage() {
  const [tours, setTours] = useState([]);
  const [selectedTourId, setSelectedTourId] = useState("");
  const [reviews, setReviews] = useState([]);
  const [query, setQuery] = useState("");
  const [replyMap, setReplyMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [reviewsLoading, setReviewsLoading] = useState(false);
  const [actionKey, setActionKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const loadTours = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminTours();
      setTours(data);
      if (data.length > 0) {
        setSelectedTourId((prev) => (prev ? prev : String(data[0].id)));
      } else {
        setSelectedTourId("");
      }
    } catch (err) {
      setError(extractApiError(err, "Không thể tải danh sách tour."));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadReviewsByTour = useCallback(async (tourId) => {
    if (!tourId) {
      setReviews([]);
      return;
    }
    setReviewsLoading(true);
    setError("");
    try {
      const data = await getAdminReviewsByTour(Number(tourId));
      setReviews(data);
    } catch (err) {
      setError(extractApiError(err, "Không thể tải danh sách đánh giá."));
    } finally {
      setReviewsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTours();
  }, [loadTours]);

  useEffect(() => {
    loadReviewsByTour(selectedTourId);
  }, [selectedTourId, loadReviewsByTour]);

  const refreshAllData = async () => {
    setMessage("");
    setError("");
    await loadTours();
    await loadReviewsByTour(selectedTourId);
  };

  const selectedTour = useMemo(
    () => tours.find((tour) => String(tour.id) === String(selectedTourId)),
    [tours, selectedTourId],
  );

  const filteredReviews = useMemo(() => {
    if (!query.trim()) return reviews;
    const q = query.toLowerCase();
    return reviews.filter((item) =>
      `${item.tenNguoiDung} ${item.binhLuan} ${item.noiDungPhanHoi}`.toLowerCase().includes(q),
    );
  }, [reviews, query]);

  const handleReply = async (item) => {
    const noiDung = (replyMap[item.id] || "").trim();
    if (!noiDung) {
      setError("Vui lòng nhập nội dung phản hồi.");
      return;
    }

    setMessage("");
    setError("");
    setActionKey(`reply-${item.id}`);
    try {
      const msg = await replyAdminReview({
        danhGiaId: item.id,
        noiDung,
      });
      setMessage(typeof msg === "string" ? msg : "Phản hồi đánh giá thành công.");
      setReplyMap((prev) => ({ ...prev, [item.id]: "" }));
      await loadReviewsByTour(selectedTourId);
    } catch (err) {
      setError(extractApiError(err, "Gửi phản hồi thất bại."));
    } finally {
      setActionKey("");
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-row items-center justify-between">
          <CardTitle>Quản lý đánh giá</CardTitle>
          <Button variant="outline" onClick={refreshAllData} disabled={loading || reviewsLoading}>
            {loading || reviewsLoading ? "Đang tải..." : "Làm mới dữ liệu"}
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          Chọn tour để xem đánh giá và phản hồi trực tiếp cho khách hàng.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[280px,1fr]">
          <select
            className="h-10 rounded-md border px-3 text-sm"
            value={selectedTourId}
            onChange={(e) => setSelectedTourId(e.target.value)}
            disabled={loading || tours.length === 0}
          >
            <option value="">Chọn tour</option>
            {tours.map((tour) => (
              <option key={tour.id} value={tour.id}>
                #{tour.id} - {tour.tenTour}
              </option>
            ))}
          </select>
          <Input
            placeholder="Tìm theo tên người đánh giá, bình luận, phản hồi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {selectedTour && (
          <p className="text-sm text-slate-600">
            Tour đang xem: <span className="font-semibold">{selectedTour.tenTour}</span>
          </p>
        )}

        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        {reviewsLoading ? (
          <div className="rounded-lg border p-6 text-center text-sm text-slate-500">
            Đang tải danh sách đánh giá...
          </div>
        ) : filteredReviews.length === 0 ? (
          <div className="rounded-lg border p-6 text-center text-sm text-slate-500">
            Chưa có đánh giá phù hợp.
          </div>
        ) : (
          <div className="space-y-4">
            {filteredReviews.map((item) => {
              const daPhanHoi = Boolean(item.noiDungPhanHoi);
              return (
                <div key={item.id} className="rounded-lg border bg-white p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="font-semibold text-slate-900">{item.tenNguoiDung}</p>
                    <span className="text-sm font-semibold text-amber-600">
                      {renderStars(item.soSao)}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">{formatDateTime(item.ngayDanhGia)}</p>
                  <p className="mt-2 text-sm text-slate-700">{item.binhLuan || "Không có bình luận."}</p>

                  {daPhanHoi ? (
                    <div className="mt-3 rounded-md border bg-slate-50 p-3">
                      <p className="text-xs font-semibold text-emerald-700">
                        Đã phản hồi {item.tenNhanVienPhanHoi ? `bởi ${item.tenNhanVienPhanHoi}` : ""}
                      </p>
                      {item.ngayPhanHoi && (
                        <p className="text-xs text-slate-500">{formatDateTime(item.ngayPhanHoi)}</p>
                      )}
                      <p className="mt-1 text-sm text-slate-700">{item.noiDungPhanHoi}</p>
                    </div>
                  ) : (
                    <div className="mt-3 space-y-2">
                      <Textarea
                        placeholder="Nhập nội dung phản hồi..."
                        value={replyMap[item.id] || ""}
                        onChange={(e) =>
                          setReplyMap((prev) => ({ ...prev, [item.id]: e.target.value }))
                        }
                      />
                      <div className="flex justify-end">
                        <Button
                          size="sm"
                          onClick={() => handleReply(item)}
                          disabled={actionKey === `reply-${item.id}`}
                        >
                          {actionKey === `reply-${item.id}` ? "Đang gửi..." : "Gửi phản hồi"}
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
