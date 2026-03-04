"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createAdminCategory,
  deleteAdminCategory,
  getAdminCategories,
  updateAdminCategory,
} from "@/services/adminCategoryService";

const EMPTY_FORM = { tenDanhMuc: "", moTa: "" };

function extractApiError(error, fallback) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (status === 403) return "Bạn không có quyền quản lý danh mục.";
  return fallback;
}

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState(EMPTY_FORM);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminCategories();
      setCategories(data);
    } catch (err) {
      setError(extractApiError(err, "Không thể tải danh sách danh mục."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const addCategory = async () => {
    setMessage("");
    setError("");
    setActionKey("create");
    try {
      const created = await createAdminCategory({
        tenDanhMuc: form.tenDanhMuc.trim(),
        moTa: form.moTa.trim(),
      });
      setCategories((prev) => [created, ...prev]);
      setForm(EMPTY_FORM);
      setMessage("Thêm danh mục thành công.");
    } catch (err) {
      setError(extractApiError(err, "Thêm danh mục thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingForm({ tenDanhMuc: item.tenDanhMuc, moTa: item.moTa || "" });
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
      const updated = await updateAdminCategory(id, {
        tenDanhMuc: editingForm.tenDanhMuc.trim(),
        moTa: editingForm.moTa.trim(),
      });
      setCategories((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setMessage("Cập nhật danh mục thành công.");
      cancelEdit();
    } catch (err) {
      setError(extractApiError(err, "Cập nhật danh mục thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const removeCategory = async (item) => {
    const ok = window.confirm(`Xóa danh mục "${item.tenDanhMuc}"?`);
    if (!ok) return;

    setMessage("");
    setError("");
    setActionKey(`delete-${item.id}`);
    try {
      await deleteAdminCategory(item.id);
      setCategories((prev) => prev.filter((row) => row.id !== item.id));
      setMessage("Xóa danh mục thành công.");
    } catch (err) {
      setError(extractApiError(err, "Xóa danh mục thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const refreshAllData = async () => {
    setMessage("");
    setError("");
    setEditingId(null);
    await fetchCategories();
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quản lý danh mục tour</CardTitle>
          <Button variant="outline" onClick={refreshAllData} disabled={loading}>
            {loading ? "Đang tải..." : "Làm mới dữ liệu"}
          </Button>
        </CardHeader>
        <CardContent className="grid gap-3 sm:grid-cols-3">
          <Input
            placeholder="Tên danh mục"
            value={form.tenDanhMuc}
            onChange={(e) => setForm((prev) => ({ ...prev, tenDanhMuc: e.target.value }))}
          />
          <Input
            placeholder="Mô tả ngắn"
            value={form.moTa}
            onChange={(e) => setForm((prev) => ({ ...prev, moTa: e.target.value }))}
          />
          <Button onClick={addCategory} disabled={actionKey === "create"}>
            {actionKey === "create" ? "Đang thêm..." : "Thêm danh mục"}
          </Button>
        </CardContent>
      </Card>

      {message && <p className="text-sm text-emerald-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <p className="text-xs text-slate-500">
        Luồng xóa chuẩn: xóa đơn đặt tour -&gt; lịch khởi hành -&gt; lịch trình/hình ảnh/đánh giá -&gt; tour -&gt; danh mục.
      </p>

      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto rounded-lg border">
            <table className="w-full min-w-[700px] text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Tên danh mục</th>
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
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-slate-500">
                      Chưa có danh mục.
                    </td>
                  </tr>
                ) : (
                  categories.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-3">{item.id}</td>
                      <td className="px-4 py-3 font-medium">
                        {editingId === item.id ? (
                          <Input
                            value={editingForm.tenDanhMuc}
                            onChange={(e) =>
                              setEditingForm((prev) => ({ ...prev, tenDanhMuc: e.target.value }))
                            }
                            className="h-9"
                          />
                        ) : (
                          item.tenDanhMuc
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
                            onClick={() => removeCategory(item)}
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
