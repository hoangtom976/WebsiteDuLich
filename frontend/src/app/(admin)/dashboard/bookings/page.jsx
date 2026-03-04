"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  approveAdminBooking,
  cancelAdminBooking,
  confirmAdminBookingPayment,
  exportAdminBookingPassengers,
  getAdminBookings,
  getBookingStatusLabel,
} from "@/services/adminBookingService";

const STATUS_OPTIONS = [
  { value: "", label: "Tất cả trạng thái" },
  { value: "CHO_THANH_TOAN", label: "Chờ thanh toán" },
  { value: "DA_THANH_TOAN", label: "Đã thanh toán" },
  { value: "DA_XAC_NHAN", label: "Đã xác nhận" },
  { value: "DA_HUY", label: "Đã hủy" },
];

function extractApiError(error, fallback) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (status === 403) return "Bạn không có quyền quản lý đơn hàng.";
  return fallback;
}

function formatCurrency(value) {
  return `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} đ`;
}

function formatDate(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("vi-VN");
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("vi-VN");
}

function getStatusBadgeClass(status) {
  if (status === "DA_XAC_NHAN") return "bg-emerald-100 text-emerald-700";
  if (status === "DA_THANH_TOAN") return "bg-blue-100 text-blue-700";
  if (status === "DA_HUY") return "bg-red-100 text-red-700";
  return "bg-amber-100 text-amber-700";
}

export default function AdminBookingsPage() {
  const [keywordInput, setKeywordInput] = useState("");
  const [keyword, setKeyword] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchBookings = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminBookings({
        tuKhoa: keyword.trim(),
        trangThai: statusFilter,
      });
      setBookings(data);
    } catch (err) {
      setError(extractApiError(err, "Không thể tải danh sách đơn hàng."));
    } finally {
      setLoading(false);
    }
  }, [keyword, statusFilter]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const submitSearch = () => {
    setKeyword(keywordInput);
  };

  const refreshData = () => {
    fetchBookings();
  };

  const handleConfirmPayment = async (item) => {
    setMessage("");
    setError("");
    setActionKey(`pay-${item.id}`);
    try {
      const msg = await confirmAdminBookingPayment(item.id);
      setMessage(typeof msg === "string" ? msg : "Xác nhận thanh toán thành công.");
      await fetchBookings();
    } catch (err) {
      setError(extractApiError(err, "Xác nhận thanh toán thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const handleApprove = async (item) => {
    setMessage("");
    setError("");
    setActionKey(`approve-${item.id}`);
    try {
      const msg = await approveAdminBooking(item.id);
      setMessage(typeof msg === "string" ? msg : "Duyệt đơn hàng thành công.");
      await fetchBookings();
    } catch (err) {
      setError(extractApiError(err, "Duyệt đơn hàng thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const handleCancel = async (item) => {
    const ok = window.confirm(`Hủy đơn #${item.id}? Hệ thống sẽ hoàn lại số chỗ cho lịch khởi hành.`);
    if (!ok) return;

    setMessage("");
    setError("");
    setActionKey(`cancel-${item.id}`);
    try {
      const msg = await cancelAdminBooking(item.id);
      setMessage(typeof msg === "string" ? msg : "Hủy đơn hàng thành công.");
      await fetchBookings();
    } catch (err) {
      setError(extractApiError(err, "Hủy đơn hàng thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const handleExportExcel = async (item) => {
    if (!item.lichKhoiHanhId) return;
    setMessage("");
    setError("");
    setActionKey(`excel-${item.id}`);
    try {
      await exportAdminBookingPassengers(item.lichKhoiHanhId);
      setMessage(`Đã xuất Excel hành khách cho lịch #${item.lichKhoiHanhId}.`);
    } catch (err) {
      setError(extractApiError(err, "Xuất Excel thất bại."));
    } finally {
      setActionKey("");
    }
  };

  return (
    <Card>
      <CardHeader className="space-y-2">
        <div className="flex flex-row items-center justify-between">
          <CardTitle>Quản lý đơn đặt tour</CardTitle>
          <Button variant="outline" onClick={refreshData} disabled={loading}>
            {loading ? "Đang tải..." : "Làm mới dữ liệu"}
          </Button>
        </div>
        <p className="text-xs text-slate-500">
          Luồng xử lý chuẩn: Chờ thanh toán -&gt; Đã thanh toán -&gt; Đã xác nhận (hoặc hủy đơn trước khi xác nhận).
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 md:grid-cols-[1fr,220px,auto,auto]">
          <Input
            placeholder="Tìm theo mã đơn, khách hàng, email, tên tour..."
            value={keywordInput}
            onChange={(e) => setKeywordInput(e.target.value)}
          />
          <select
            className="h-10 rounded-md border px-3 text-sm"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            {STATUS_OPTIONS.map((item) => (
              <option key={item.value || "all"} value={item.value}>
                {item.label}
              </option>
            ))}
          </select>
          <Button onClick={submitSearch}>Tìm kiếm</Button>
          <Button variant="outline" onClick={refreshData}>
            Làm mới dữ liệu
          </Button>
        </div>

        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="overflow-auto rounded-lg border">
          <table className="w-full min-w-[1300px] text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3">Mã đơn</th>
                <th className="px-4 py-3">Người đặt</th>
                <th className="px-4 py-3">Tour</th>
                <th className="px-4 py-3">Khởi hành</th>
                <th className="px-4 py-3">Ngày đặt</th>
                <th className="px-4 py-3">Số khách</th>
                <th className="px-4 py-3">Tổng tiền</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : bookings.length === 0 ? (
                <tr>
                  <td colSpan={9} className="px-4 py-6 text-center text-slate-500">
                    Không có đơn hàng phù hợp.
                  </td>
                </tr>
              ) : (
                bookings.map((item) => (
                  <tr key={item.id} className="border-t align-top">
                    <td className="px-4 py-3 font-semibold">#{item.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.hoTenNguoiDat || "Không rõ tên"}</p>
                      <p className="text-xs text-slate-500">{item.emailNguoiDat || "-"}</p>
                      <p className="text-xs text-slate-500">{item.soDienThoaiNguoiDat || "-"}</p>
                    </td>
                    <td className="px-4 py-3">
                      <p className="font-medium">{item.tenTour || "-"}</p>
                      <p className="text-xs text-slate-500">Lịch #{item.lichKhoiHanhId || "-"}</p>
                    </td>
                    <td className="px-4 py-3">{formatDate(item.ngayKhoiHanh)}</td>
                    <td className="px-4 py-3">{formatDateTime(item.ngayDat)}</td>
                    <td className="px-4 py-3">{item.soLuongKhach}</td>
                    <td className="px-4 py-3 font-semibold text-blue-700">
                      {formatCurrency(item.tongTien)}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(item.trangThai)}`}
                      >
                        {getBookingStatusLabel(item.trangThai)}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {item.trangThai === "CHO_THANH_TOAN" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleConfirmPayment(item)}
                              disabled={actionKey === `pay-${item.id}`}
                            >
                              {actionKey === `pay-${item.id}` ? "Đang xử lý..." : "Xác nhận thanh toán"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(item)}
                              disabled={actionKey === `cancel-${item.id}`}
                            >
                              {actionKey === `cancel-${item.id}` ? "Đang xử lý..." : "Hủy đơn"}
                            </Button>
                          </>
                        )}

                        {item.trangThai === "DA_THANH_TOAN" && (
                          <>
                            <Button
                              size="sm"
                              onClick={() => handleApprove(item)}
                              disabled={actionKey === `approve-${item.id}`}
                            >
                              {actionKey === `approve-${item.id}` ? "Đang xử lý..." : "Duyệt đơn"}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleCancel(item)}
                              disabled={actionKey === `cancel-${item.id}`}
                            >
                              {actionKey === `cancel-${item.id}` ? "Đang xử lý..." : "Hủy đơn"}
                            </Button>
                          </>
                        )}

                        {(item.trangThai === "DA_THANH_TOAN" || item.trangThai === "DA_XAC_NHAN") && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleExportExcel(item)}
                            disabled={actionKey === `excel-${item.id}`}
                          >
                            {actionKey === `excel-${item.id}` ? "Đang xuất..." : "Xuất Excel"}
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
