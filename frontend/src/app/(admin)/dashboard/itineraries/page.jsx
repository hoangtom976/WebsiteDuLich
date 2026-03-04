"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getAdminTours } from "@/services/adminTourService";
import {
  createAdminItinerary,
  deleteAdminItinerary,
  getAdminItinerariesByTour,
  updateAdminItinerary,
} from "@/services/adminItineraryService";

function extractApiError(error, fallback) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (status === 403) return "Bạn không có quyền quản lý lịch trình.";
  return fallback;
}

export default function AdminItinerariesPage() {
  const [tours, setTours] = useState([]);
  const [selectedTourId, setSelectedTourId] = useState("");
  const [itineraries, setItineraries] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [itinerariesLoading, setItinerariesLoading] = useState(false);
  const [actionKey, setActionKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    ngayThu: "",
    tieuDe: "",
    moTa: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState({
    ngayThu: "",
    tieuDe: "",
    moTa: "",
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

  const loadItinerariesByTour = useCallback(async (tourId) => {
    if (!tourId) {
      setItineraries([]);
      return;
    }
    setItinerariesLoading(true);
    setError("");
    try {
      const data = await getAdminItinerariesByTour(Number(tourId));
      setItineraries(data);
    } catch (err) {
      setError(extractApiError(err, "Không thể tải lịch trình tour."));
    } finally {
      setItinerariesLoading(false);
    }
  }, []);

  useEffect(() => {
    loadTours();
  }, [loadTours]);

  useEffect(() => {
    loadItinerariesByTour(selectedTourId);
  }, [selectedTourId, loadItinerariesByTour]);

  const selectedTour = useMemo(
    () => tours.find((tour) => String(tour.id) === String(selectedTourId)),
    [tours, selectedTourId],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return itineraries;
    const q = query.toLowerCase();
    return itineraries.filter((item) =>
      `${item.ngayThu} ${item.tieuDe} ${item.moTa}`.toLowerCase().includes(q),
    );
  }, [itineraries, query]);

  const addItinerary = async () => {
    if (!selectedTourId) return;
    setMessage("");
    setError("");
    setActionKey("create");
    try {
      const created = await createAdminItinerary({
        tourId: Number(selectedTourId),
        ngayThu: Number(form.ngayThu),
        tieuDe: form.tieuDe.trim(),
        moTa: form.moTa.trim(),
      });
      setItineraries((prev) =>
        [...prev, created].sort((a, b) => a.ngayThu - b.ngayThu),
      );
      setForm({ ngayThu: "", tieuDe: "", moTa: "" });
      setMessage("Thêm lịch trình thành công.");
    } catch (err) {
      setError(extractApiError(err, "Thêm lịch trình thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingForm({
      ngayThu: String(item.ngayThu || ""),
      tieuDe: item.tieuDe || "",
      moTa: item.moTa || "",
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingForm({ ngayThu: "", tieuDe: "", moTa: "" });
  };

  const saveEdit = async (id) => {
    if (!selectedTourId) return;
    setMessage("");
    setError("");
    setActionKey(`save-${id}`);
    try {
      const updated = await updateAdminItinerary(id, {
        tourId: Number(selectedTourId),
        ngayThu: Number(editingForm.ngayThu),
        tieuDe: editingForm.tieuDe.trim(),
        moTa: editingForm.moTa.trim(),
      });
      setItineraries((prev) =>
        prev
          .map((item) => (item.id === id ? updated : item))
          .sort((a, b) => a.ngayThu - b.ngayThu),
      );
      setMessage("Cập nhật lịch trình thành công.");
      cancelEdit();
    } catch (err) {
      setError(extractApiError(err, "Cập nhật lịch trình thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const removeItinerary = async (item) => {
    const ok = window.confirm(`Xóa lịch trình Ngày ${item.ngayThu}?`);
    if (!ok) return;

    setMessage("");
    setError("");
    setActionKey(`delete-${item.id}`);
    try {
      await deleteAdminItinerary(item.id);
      setItineraries((prev) => prev.filter((row) => row.id !== item.id));
      setMessage("Xóa lịch trình thành công.");
    } catch (err) {
      setError(extractApiError(err, "Xóa lịch trình thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const refreshAllData = async () => {
    setMessage("");
    setError("");
    await loadTours();
    await loadItinerariesByTour(selectedTourId);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quản lý lịch trình tour</CardTitle>
        <Button variant="outline" onClick={refreshAllData} disabled={loading || itinerariesLoading}>
          {loading || itinerariesLoading ? "Đang tải..." : "Làm mới dữ liệu"}
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
            type="number"
            min={1}
            placeholder="Ngày thứ"
            value={form.ngayThu}
            onChange={(e) => setForm((prev) => ({ ...prev, ngayThu: e.target.value }))}
          />
          <Input
            placeholder="Tiêu đề"
            value={form.tieuDe}
            onChange={(e) => setForm((prev) => ({ ...prev, tieuDe: e.target.value }))}
          />
          <Button onClick={addItinerary} disabled={!selectedTourId || actionKey === "create"}>
            {actionKey === "create" ? "Đang thêm..." : "Thêm lịch trình"}
          </Button>
          <div className="md:col-span-4">
            <Input
              placeholder="Mô tả chi tiết"
              value={form.moTa}
              onChange={(e) => setForm((prev) => ({ ...prev, moTa: e.target.value }))}
            />
          </div>
        </div>

        <Input
          placeholder="Tìm theo ngày, tiêu đề, mô tả..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />

        {selectedTour && (
          <p className="text-sm text-slate-600">
            Tour đang xem: <span className="font-semibold">{selectedTour.tenTour}</span>
          </p>
        )}

        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="overflow-auto rounded-lg border">
          <table className="w-full min-w-[980px] text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Ngày thứ</th>
                <th className="px-4 py-3">Tiêu đề</th>
                <th className="px-4 py-3">Mô tả</th>
                <th className="px-4 py-3">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {itinerariesLoading ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    Đang tải lịch trình...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-4 py-6 text-center text-slate-500">
                    Chưa có lịch trình phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => (
                  <tr key={item.id} className="border-t">
                    <td className="px-4 py-3">{item.id}</td>
                    <td className="px-4 py-3">
                      {editingId === item.id ? (
                        <Input
                          type="number"
                          min={1}
                          className="h-9 w-24"
                          value={editingForm.ngayThu}
                          onChange={(e) =>
                            setEditingForm((prev) => ({ ...prev, ngayThu: e.target.value }))
                          }
                        />
                      ) : (
                        `Ngày ${item.ngayThu}`
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {editingId === item.id ? (
                        <Input
                          className="h-9"
                          value={editingForm.tieuDe}
                          onChange={(e) =>
                            setEditingForm((prev) => ({ ...prev, tieuDe: e.target.value }))
                          }
                        />
                      ) : (
                        item.tieuDe || "-"
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {editingId === item.id ? (
                        <Input
                          className="h-9"
                          value={editingForm.moTa}
                          onChange={(e) =>
                            setEditingForm((prev) => ({ ...prev, moTa: e.target.value }))
                          }
                        />
                      ) : (
                        item.moTa || "-"
                      )}
                    </td>
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
                          variant="destructive"
                          onClick={() => removeItinerary(item)}
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
