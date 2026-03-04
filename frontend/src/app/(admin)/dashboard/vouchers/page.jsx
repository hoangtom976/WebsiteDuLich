"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  createAdminVoucher,
  deleteAdminVoucher,
  getAdminVouchers,
  updateAdminVoucher,
} from "@/services/adminVoucherService";

const EMPTY_FORM = {
  maVoucher: "",
  phanTramGiam: "",
  ngayHetHan: "",
  trangThai: true,
};

function extractApiError(error, fallback) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (status === 403) return "Bạn không có quyền quản lý voucher.";
  return fallback;
}

export default function AdminVouchersPage() {
  const [vouchers, setVouchers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [form, setForm] = useState(EMPTY_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editingForm, setEditingForm] = useState(EMPTY_FORM);

  const fetchVouchers = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminVouchers();
      setVouchers(data);
    } catch (err) {
      setError(extractApiError(err, "Không thể tải danh sách voucher."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchVouchers();
  }, [fetchVouchers]);

  const addVoucher = async () => {
    setMessage("");
    setError("");
    setActionKey("create");
    try {
      const created = await createAdminVoucher({
        maVoucher: form.maVoucher,
        phanTramGiam: Number(form.phanTramGiam),
        ngayHetHan: form.ngayHetHan,
        trangThai: form.trangThai,
      });
      setVouchers((prev) => [created, ...prev]);
      setForm(EMPTY_FORM);
      setMessage("Tạo voucher thành công.");
    } catch (err) {
      setError(extractApiError(err, "Tạo voucher thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const startEdit = (item) => {
    setEditingId(item.id);
    setEditingForm({
      maVoucher: item.maVoucher,
      phanTramGiam: String(item.phanTramGiam),
      ngayHetHan: item.ngayHetHan,
      trangThai: item.trangThai,
    });
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
      const updated = await updateAdminVoucher(id, {
        maVoucher: editingForm.maVoucher,
        phanTramGiam: Number(editingForm.phanTramGiam),
        ngayHetHan: editingForm.ngayHetHan,
        trangThai: editingForm.trangThai,
      });
      setVouchers((prev) => prev.map((item) => (item.id === id ? updated : item)));
      setMessage("Cập nhật voucher thành công.");
      cancelEdit();
    } catch (err) {
      setError(extractApiError(err, "Cập nhật voucher thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const toggleStatus = async (item) => {
    setMessage("");
    setError("");
    setActionKey(`status-${item.id}`);
    try {
      const updated = await updateAdminVoucher(item.id, {
        maVoucher: item.maVoucher,
        phanTramGiam: Number(item.phanTramGiam),
        ngayHetHan: item.ngayHetHan,
        trangThai: !item.trangThai,
      });
      setVouchers((prev) => prev.map((v) => (v.id === item.id ? updated : v)));
      setMessage("Cập nhật trạng thái voucher thành công.");
    } catch (err) {
      setError(extractApiError(err, "Thay đổi trạng thái voucher thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const removeVoucher = async (item) => {
    const ok = window.confirm(`Xóa voucher ${item.maVoucher}?`);
    if (!ok) return;

    setMessage("");
    setError("");
    setActionKey(`delete-${item.id}`);
    try {
      await deleteAdminVoucher(item.id);
      setVouchers((prev) => prev.filter((v) => v.id !== item.id));
      setMessage("Xóa voucher thành công.");
    } catch (err) {
      setError(extractApiError(err, "Xóa voucher thất bại."));
    } finally {
      setActionKey("");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Quản lý voucher</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-3 md:grid-cols-5">
          <Input
            placeholder="Mã voucher"
            value={form.maVoucher}
            onChange={(e) => setForm((prev) => ({ ...prev, maVoucher: e.target.value }))}
          />
          <Input
            type="number"
            placeholder="% giảm"
            value={form.phanTramGiam}
            onChange={(e) => setForm((prev) => ({ ...prev, phanTramGiam: e.target.value }))}
          />
          <Input
            type="date"
            value={form.ngayHetHan}
            onChange={(e) => setForm((prev) => ({ ...prev, ngayHetHan: e.target.value }))}
          />
          <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
            <input
              type="checkbox"
              checked={form.trangThai}
              onChange={(e) => setForm((prev) => ({ ...prev, trangThai: e.target.checked }))}
            />
            Kích hoạt
          </label>
          <Button onClick={addVoucher} disabled={actionKey === "create"}>
            {actionKey === "create" ? "Đang thêm..." : "Thêm voucher"}
          </Button>
        </CardContent>
      </Card>

      {message && <p className="text-sm text-emerald-600">{message}</p>}
      {error && <p className="text-sm text-red-600">{error}</p>}

      <Card>
        <CardContent className="p-0">
          <div className="overflow-auto rounded-lg border">
            <table className="w-full min-w-[920px] text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Mã voucher</th>
                  <th className="px-4 py-3">% giảm</th>
                  <th className="px-4 py-3">Ngày hết hạn</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Tác vụ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : vouchers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-4 py-6 text-center text-slate-500">
                      Chưa có voucher nào.
                    </td>
                  </tr>
                ) : (
                  vouchers.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-3">{item.id}</td>
                      <td className="px-4 py-3 font-medium">
                        {editingId === item.id ? (
                          <Input
                            value={editingForm.maVoucher}
                            onChange={(e) =>
                              setEditingForm((prev) => ({ ...prev, maVoucher: e.target.value }))
                            }
                            className="h-9"
                          />
                        ) : (
                          item.maVoucher
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === item.id ? (
                          <Input
                            type="number"
                            value={editingForm.phanTramGiam}
                            onChange={(e) =>
                              setEditingForm((prev) => ({
                                ...prev,
                                phanTramGiam: e.target.value,
                              }))
                            }
                            className="h-9"
                          />
                        ) : (
                          `${item.phanTramGiam}%`
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {editingId === item.id ? (
                          <Input
                            type="date"
                            value={editingForm.ngayHetHan}
                            onChange={(e) =>
                              setEditingForm((prev) => ({ ...prev, ngayHetHan: e.target.value }))
                            }
                            className="h-9"
                          />
                        ) : (
                          item.ngayHetHan
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${
                            item.trangThai
                              ? "bg-emerald-100 text-emerald-700"
                              : "bg-slate-200 text-slate-700"
                          }`}
                        >
                          {item.trangThai ? "Hoạt động" : "Tắt"}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-2">
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
                            onClick={() => toggleStatus(item)}
                            disabled={actionKey === `status-${item.id}`}
                          >
                            {item.trangThai ? "Tắt voucher" : "Bật lại"}
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeVoucher(item)}
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
