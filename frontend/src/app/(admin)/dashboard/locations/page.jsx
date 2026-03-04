"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createAdminLocation,
  deleteAdminLocation,
  getAdminLocations,
  updateAdminLocation,
} from "@/services/adminLocationService";

const EMPTY_FORM = { tenDiaDiem: "", moTa: "" };

function extractApiError(error, fallback) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (status === 403) return "Bạn không có quyền quản lý địa điểm.";
  return fallback;
}

export default function AdminLocationsPage() {
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState(EMPTY_FORM);

  const fetchLocations = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminLocations();
      setLocations(data);
    } catch (err) {
      setError(extractApiError(err, "Không thể tải danh sách địa điểm."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchLocations();
  }, [fetchLocations]);

  const addLocation = async () => {
    setMessage("");
    setError("");
    setActionKey("create");
    try {
      const created = await createAdminLocation({
        tenDiaDiem: form.tenDiaDiem.trim(),
        moTa: form.moTa.trim(),
      });
      setLocations((prev) => [created, ...prev]);
      setForm(EMPTY_FORM);
      setMessage("Thêm địa điểm thành công.");
    } catch (err) {
      setError(extractApiError(err, "Thêm địa điểm thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingForm({ tenDiaDiem: item.tenDiaDiem, moTa: item.moTa || "" });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditingForm(EMPTY_FORM);
  };

  const saveEdit = async (id) => {
    setMessage("");
    setError("");
    setActionKey(`save-${id}`);
    try {
      const updated = await updateAdminLocation(id, {
        tenDiaDiem: editingForm.tenDiaDiem.trim(),
        moTa: editingForm.moTa.trim(),
      });
      setLocations((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setMessage("Cập nhật địa điểm thành công.");
      cancelEdit();
    } catch (err) {
      setError(extractApiError(err, "Cập nhật địa điểm thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const removeLocation = async (item) => {
    const ok = window.confirm(`Xóa địa điểm "${item.tenDiaDiem}"?`);
    if (!ok) return;

    setMessage("");
    setError("");
    setActionKey(`delete-${item.id}`);
    try {
      await deleteAdminLocation(item.id);
      setLocations((prev) => prev.filter((row) => row.id !== item.id));
      setMessage("Xóa địa điểm thành công.");
    } catch (err) {
      setError(extractApiError(err, "Xóa địa điểm thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const refreshAllData = async () => {
    setMessage("");
    setError("");
    setEditingId(null);
    await fetchLocations();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quản lý địa điểm du lịch</CardTitle>
          <Button variant="outline" onClick={refreshAllData} disabled={loading}>
            {loading ? "Đang tải..." : "Làm mới dữ liệu"}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Input
            placeholder="Tên địa điểm"
            value={form.tenDiaDiem}
            onChange={(e) => setForm((prev) => ({ ...prev, tenDiaDiem: e.target.value }))}
          />
          <Input
            placeholder="Mô tả ngắn"
            value={form.moTa}
            onChange={(e) => setForm((prev) => ({ ...prev, moTa: e.target.value }))}
          />
          <Button onClick={addLocation} disabled={actionKey === "create"}>
            {actionKey === "create" ? "Đang thêm..." : "Thêm địa điểm"}
          </Button>
        </CardContent>
      </Card>

      {message && <p className="text-sm text-emerald-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-slate-500">
        Luồng xóa chuẩn: xóa đơn đặt tour -&gt; lịch khởi hành -&gt; lịch trình/hình ảnh/đánh giá -&gt; tour -&gt; địa điểm.
      </p>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto rounded-lg border">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Tên địa điểm</th>
                  <th className="px-4 py-3">Mô tả</th>
                  <th className="px-4 py-3">Tác vụ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : locations.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      Chưa có địa điểm.
                    </td>
                  </tr>
                ) : (
                  locations.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-3">{item.id}</td>
                      <td className="px-4 py-3 font-medium">
                        {editingId === item.id ? (
                          <Input
                            value={editingForm.tenDiaDiem}
                            onChange={(e) =>
                              setEditingForm((prev) => ({
                                ...prev,
                                tenDiaDiem: e.target.value,
                              }))
                            }
                            className="h-9"
                          />
                        ) : (
                          item.tenDiaDiem
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === item.id ? (
                          <Input
                            value={editingForm.moTa}
                            onChange={(e) =>
                              setEditingForm((prev) => ({ ...prev, moTa: e.target.value }))
                            }
                            className="h-9"
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
                            onClick={() => removeLocation(item)}
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
    </div>
  );
}
