"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAdminTours } from "@/services/adminTourService";
import {
  createAdminSchedule,
  deleteAdminSchedule,
  getAdminSchedulesByTour,
  updateAdminScheduleDate,
  updateAdminScheduleSeats,
} from "@/services/adminScheduleService";

function extractApiError(error, fallback) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (status === 403) return "Bạn không có quyền quản lý lịch khởi hành.";
  return fallback;
}

function fmtDate(value) {
  if (!value) return "-";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleDateString("vi-VN");
}

export default function AdminSchedulesPage() {
  const [tours, setTours] = useState([]);
  const [selectedTourId, setSelectedTourId] = useState("");
  const [schedules, setSchedules] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [schedulesLoading, setSchedulesLoading] = useState(false);
  const [actionKey, setActionKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [createForm, setCreateForm] = useState({
    ngayKhoiHanh: "",
    tongSoCho: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({
    ngayKhoiHanh: "",
    tongSoCho: "",
  });

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

  const loadSchedulesByTour = useCallback(async (tourId) => {
    if (!tourId) {
      setSchedules([]);
      return;
    }
    setSchedulesLoading(true);
    setError("");
    try {
      const data = await getAdminSchedulesByTour(Number(tourId));
      setSchedules(data);
    } catch (err) {
      setError(extractApiError(err, "Không thể tải lịch khởi hành."));
    } finally {
      setSchedulesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTours();
  }, [loadTours]);

  useEffect(() => {
    loadSchedulesByTour(selectedTourId);
  }, [selectedTourId, loadSchedulesByTour]);

  const selectedTour = useMemo(
    () => tours.find((tour) => String(tour.id) === String(selectedTourId)),
    [tours, selectedTourId],
  );

  const filteredSchedules = useMemo(() => {
    if (!query.trim()) return schedules;
    const q = query.toLowerCase();
    return schedules.filter((item) =>
      `${item.id} ${item.tenTour} ${item.ngayKhoiHanh}`.toLowerCase().includes(q),
    );
  }, [schedules, query]);

  const addSchedule = async () => {
    if (!selectedTourId) return;
    setMessage("");
    setError("");
    setActionKey("create");
    try {
      const created = await createAdminSchedule({
        tourId: Number(selectedTourId),
        ngayKhoiHanh: createForm.ngayKhoiHanh,
        tongSoCho: Number(createForm.tongSoCho),
      });
      setSchedules((prev) => [...prev, created]);
      setCreateForm({ ngayKhoiHanh: "", tongSoCho: "" });
      setMessage("Thêm lịch khởi hành thành công.");
    } catch (err) {
      setError(extractApiError(err, "Thêm lịch khởi hành thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingForm({
      ngayKhoiHanh: item.ngayKhoiHanh || "",
      tongSoCho: String(item.tongSoCho || ""),
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingForm({ ngayKhoiHanh: "", tongSoCho: "" });
  };

  const saveEdit = async (id) => {
    setMessage("");
    setError("");
    setActionKey(`save-${id}`);
    try {
      const current = schedules.find((item) => item.id === id);
      let updated = current;

      if (current && editingForm.ngayKhoiHanh !== current.ngayKhoiHanh) {
        updated = await updateAdminScheduleDate(id, editingForm.ngayKhoiHanh);
      }
      if (current && Number(editingForm.tongSoCho) !== Number(current.tongSoCho)) {
        updated = await updateAdminScheduleSeats(id, Number(editingForm.tongSoCho));
      }

      if (updated) {
        setSchedules((prev) => prev.map((item) => (item.id === id ? updated : item)));
      }
      setMessage("Cập nhật lịch khởi hành thành công.");
      cancelEdit();
    } catch (err) {
      setError(extractApiError(err, "Cập nhật lịch khởi hành thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const removeSchedule = async (id) => {
    setMessage("");
    setError("");
    setActionKey(`delete-${id}`);
    try {
      await deleteAdminSchedule(id);
      setSchedules((prev) => prev.filter((item) => item.id !== id));
      setMessage("Xóa lịch khởi hành thành công.");
    } catch (err) {
      setError(extractApiError(err, "Xóa lịch khởi hành thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const refreshAllData = async () => {
    setMessage("");
    setError("");
    await loadTours();
    await loadSchedulesByTour(selectedTourId);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quản lý lịch khởi hành</CardTitle>
        <Button variant="outline" onClick={refreshAllData} disabled={loading || schedulesLoading}>
          {loading || schedulesLoading ? "Đang tải..." : "Làm mới dữ liệu"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-3 rounded-lg border p-4 md:grid-cols-4">
          <select
            className="rounded-md border px-3 py-2"
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
            type="date"
            value={createForm.ngayKhoiHanh}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, ngayKhoiHanh: e.target.value }))}
          />
          <Input
            type="number"
            min={1}
            placeholder="Tổng số chỗ"
            value={createForm.tongSoCho}
            onChange={(e) => setCreateForm((prev) => ({ ...prev, tongSoCho: e.target.value }))}
          />
          <Button onClick={addSchedule} disabled={!selectedTourId || actionKey === "create"}>
            {actionKey === "create" ? "Đang thêm..." : "Thêm lịch"}
          </Button>
        </div>

        <Input
          placeholder="Tìm theo mã lịch hoặc ngày khởi hành..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />

        {selectedTour && (
          <p className="text-sm text-slate-600">
            Tour đang xem: <span className="font-semibold">{selectedTour.tenTour}</span>
          </p>
        )}

        <p className="text-xs text-slate-500">
          Luồng xóa chuẩn: xóa đơn đặt tour trước rồi mới xóa lịch khởi hành.
        </p>
        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="overflow-auto rounded-lg border">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Tour</th>
                <th className="px-4 py-3">Ngày khởi hành</th>
                <th className="px-4 py-3">Tổng số chỗ</th>
                <th className="px-4 py-3">Số chỗ còn lại</th>
                <th className="px-4 py-3">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {schedulesLoading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                    Đang tải lịch khởi hành...
                  </td>
                </tr>
              ) : filteredSchedules.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                    Không có lịch khởi hành phù hợp.
                  </td>
                </tr>
              ) : (
                filteredSchedules.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3 font-medium">{item.tenTour}</td>
                    <td className="px-4 py-3">
                      {editingId === item.id ? (
                        <Input
                          type="date"
                          className="h-9 w-44"
                          value={editingForm.ngayKhoiHanh}
                          onChange={(e) =>
                            setEditingForm((prev) => ({ ...prev, ngayKhoiHanh: e.target.value }))
                          }
                        />
                      ) : (
                        fmtDate(item.ngayKhoiHanh)
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          min={1}
                          className="h-9 w-28"
                          value={editingForm.tongSoCho}
                          onChange={(e) =>
                            setEditingForm((prev) => ({ ...prev, tongSoCho: e.target.value }))
                          }
                        />
                      ) : (
                        item.tongSoCho
                      )}
                    </td>
                    <td className="px-4 py-3">{item.soChoConLai}</td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        {editingId === item.id ? (
                          <>
                            <Button
                              size="sm"
                              onClick={() => saveEdit(item.id)}
                              disabled={actionKey === `save-${item.id}`}
                            >
                              {actionKey === `save-${item.id}` ? "Đang lưu..." : "Lưu"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              Hủy
                            </Button>
                          </>
                        ) : (
                          <Button size="sm" variant="outline" onClick={() => startEdit(item)}>
                            Sửa
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => removeSchedule(item.id)}
                          disabled={actionKey === `delete-${item.id}`}
                        >
                          {actionKey === `delete-${item.id}` ? "Đang xóa..." : "Xóa"}
                        </Button>
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
