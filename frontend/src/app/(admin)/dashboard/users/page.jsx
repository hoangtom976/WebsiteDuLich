"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  assignUserRole,
  changeUserStatus,
  createAdminUser,
  getAdminUsers,
  updateAdminUser,
} from "@/services/adminUserService";

const EMPTY_CREATE_FORM = {
  hoTen: "",
  email: "",
  soDienThoai: "",
  matKhau: "",
  vaiTro: "USER",
  trangThai: true,
};

const EMPTY_EDIT_FORM = {
  hoTen: "",
  email: "",
  soDienThoai: "",
  matKhauMoi: "",
  vaiTro: "USER",
  trangThai: true,
};

function roleText(role) {
  if (role === "ADMIN") return "Quản trị viên";
  if (role === "STAFF") return "Nhân viên";
  return "Khách hàng";
}

function extractApiError(error, fallback) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (status === 403) return "Bạn không có quyền truy cập chức năng này.";
  if (status === 404) return "API quản lý người dùng chưa sẵn sàng. Hãy khởi động lại backend.";
  return fallback;
}

export default function AdminUsersPage() {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [createForm, setCreateForm] = useState(EMPTY_CREATE_FORM);
  const [editingId, setEditingId] = useState(null);
  const [editForm, setEditForm] = useState(EMPTY_EDIT_FORM);

  const fetchUsers = useCallback(async (tuKhoa = "") => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminUsers(tuKhoa);
      setUsers(data);
    } catch (err) {
      setError(extractApiError(err, "Không thể tải danh sách người dùng."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers("");
  }, [fetchUsers]);

  const filtered = useMemo(() => {
    return users.filter((u) =>
      `${u.hoTen} ${u.email}`.toLowerCase().includes(query.toLowerCase()),
    );
  }, [users, query]);

  const handleCreate = async () => {
    setMessage("");
    setError("");
    setActionKey("create");
    try {
      const created = await createAdminUser({
        hoTen: createForm.hoTen.trim(),
        email: createForm.email.trim(),
        soDienThoai: createForm.soDienThoai.trim(),
        matKhau: createForm.matKhau,
        vaiTro: createForm.vaiTro,
        trangThai: createForm.trangThai,
      });
      setUsers((prev) => [created, ...prev]);
      setCreateForm(EMPTY_CREATE_FORM);
      setMessage("Tạo tài khoản thành công.");
    } catch (err) {
      setError(extractApiError(err, "Tạo tài khoản thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const startEdit = (u) => {
    setEditingId(u.id);
    setEditForm({
      hoTen: u.hoTen || "",
      email: u.email || "",
      soDienThoai: u.soDienThoai || "",
      matKhauMoi: "",
      vaiTro: u.vaiTro || "USER",
      trangThai: !!u.trangThai,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm(EMPTY_EDIT_FORM);
  };

  const saveEdit = async (id) => {
    setMessage("");
    setError("");
    setActionKey(`save-${id}`);
    try {
      const updated = await updateAdminUser(id, {
        hoTen: editForm.hoTen.trim(),
        email: editForm.email.trim(),
        soDienThoai: editForm.soDienThoai.trim(),
        matKhauMoi: editForm.matKhauMoi || "",
        vaiTro: editForm.vaiTro,
        trangThai: editForm.trangThai,
      });
      setUsers((prev) => prev.map((u) => (u.id === id ? updated : u)));
      setMessage("Cập nhật tài khoản thành công.");
      cancelEdit();
    } catch (err) {
      setError(extractApiError(err, "Cập nhật tài khoản thất bại."));
    } finally {
      setActionKey("");
    }
  };



  const handleRoleChange = async (user, tenVaiTro) => {
    setMessage("");
    setError("");
    setActionKey(`role-${user.id}`);
    try {
      const responseMessage = await assignUserRole({ email: user.email, tenVaiTro });
      setUsers((prev) =>
        prev.map((u) => (u.email === user.email ? { ...u, vaiTro: tenVaiTro } : u)),
      );
      setMessage(typeof responseMessage === "string" ? responseMessage : "Cập nhật quyền thành công.");
    } catch (err) {
      setError(extractApiError(err, "Cập nhật quyền thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const handleToggleStatus = async (user) => {
    setMessage("");
    setError("");
    setActionKey(`status-${user.id}`);
    try {
      const nextStatus = !user.trangThai;
      const responseMessage = await changeUserStatus({
        email: user.email,
        trangThai: nextStatus,
      });
      setUsers((prev) =>
        prev.map((u) => (u.email === user.email ? { ...u, trangThai: nextStatus } : u)),
      );
      setMessage(typeof responseMessage === "string" ? responseMessage : "Cập nhật trạng thái thành công.");
    } catch (err) {
      setError(extractApiError(err, "Thay đổi trạng thái thất bại."));
    } finally {
      setActionKey("");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Quản lý người dùng</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="rounded-lg border p-4">
          <h3 className="mb-3 text-base font-semibold">Thêm tài khoản mới</h3>
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            <Input
              placeholder="Họ tên"
              value={createForm.hoTen}
              onChange={(e) => setCreateForm((p) => ({ ...p, hoTen: e.target.value }))}
            />
            <Input
              placeholder="Email"
              type="email"
              value={createForm.email}
              onChange={(e) => setCreateForm((p) => ({ ...p, email: e.target.value }))}
            />
            <Input
              placeholder="Số điện thoại"
              value={createForm.soDienThoai}
              onChange={(e) => setCreateForm((p) => ({ ...p, soDienThoai: e.target.value }))}
            />
            <Input
              placeholder="Mật khẩu"
              type="password"
              value={createForm.matKhau}
              onChange={(e) => setCreateForm((p) => ({ ...p, matKhau: e.target.value }))}
            />
            <select
              className="rounded-md border px-3 py-2"
              value={createForm.vaiTro}
              onChange={(e) => setCreateForm((p) => ({ ...p, vaiTro: e.target.value }))}
            >
              <option value="USER">USER</option>
              <option value="STAFF">STAFF</option>
              <option value="ADMIN">ADMIN</option>
            </select>
            <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={createForm.trangThai}
                onChange={(e) => setCreateForm((p) => ({ ...p, trangThai: e.target.checked }))}
              />
              Kích hoạt ngay
            </label>
          </div>
          <div className="mt-3">
            <Button onClick={handleCreate} disabled={actionKey === "create"}>
              {actionKey === "create" ? "Đang tạo..." : "Thêm tài khoản"}
            </Button>
          </div>
        </div>

        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            placeholder="Tìm theo tên hoặc email..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-sm"
          />
          <Button variant="outline" onClick={() => fetchUsers(query)}>
            Làm mới dữ liệu
          </Button>
        </div>

        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="overflow-auto rounded-lg border">
          <table className="w-full min-w-[1150px] text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Họ tên</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Số điện thoại</th>
                <th className="px-4 py-3">Vai trò</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-6 text-center text-slate-500">
                    Không có người dùng phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((u) => {
                  const isEditing = editingId === u.id;
                  return (
                    <tr key={u.id} className="border-t align-top">
                      <td className="px-4 py-3">{u.id}</td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <Input
                            value={editForm.hoTen}
                            onChange={(e) => setEditForm((p) => ({ ...p, hoTen: e.target.value }))}
                          />
                        ) : (
                          <span className="font-medium">{u.hoTen || "Chưa cập nhật"}</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <Input
                            type="email"
                            value={editForm.email}
                            onChange={(e) => setEditForm((p) => ({ ...p, email: e.target.value }))}
                          />
                        ) : (
                          u.email
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <Input
                            value={editForm.soDienThoai}
                            onChange={(e) =>
                              setEditForm((p) => ({ ...p, soDienThoai: e.target.value }))
                            }
                          />
                        ) : (
                          u.soDienThoai || "-"
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <select
                            className="rounded-md border px-2 py-1"
                            value={editForm.vaiTro}
                            onChange={(e) => setEditForm((p) => ({ ...p, vaiTro: e.target.value }))}
                          >
                            <option value="USER">USER</option>
                            <option value="STAFF">STAFF</option>
                            <option value="ADMIN">ADMIN</option>
                          </select>
                        ) : (
                          <div className="flex items-center gap-2">
                            <select
                              className="rounded-md border px-2 py-1"
                              value={u.vaiTro}
                              onChange={(e) => handleRoleChange(u, e.target.value)}
                              disabled={actionKey === `role-${u.id}`}
                            >
                              <option value="USER">USER</option>
                              <option value="STAFF">STAFF</option>
                              <option value="ADMIN">ADMIN</option>
                            </select>
                            <span className="text-xs text-slate-500">{roleText(u.vaiTro)}</span>
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <label className="flex items-center gap-2 text-sm">
                            <input
                              type="checkbox"
                              checked={editForm.trangThai}
                              onChange={(e) =>
                                setEditForm((p) => ({ ...p, trangThai: e.target.checked }))
                              }
                            />
                            Hoạt động
                          </label>
                        ) : (
                          <span
                            className={`rounded-full px-2 py-1 text-xs font-semibold ${u.trangThai
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-red-100 text-red-700"
                              }`}
                          >
                            {u.trangThai ? "Hoạt động" : "Bị khóa"}
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        {isEditing ? (
                          <div className="flex flex-wrap gap-2">
                            <Input
                              type="password"
                              placeholder="Mật khẩu mới (tùy chọn)"
                              value={editForm.matKhauMoi}
                              onChange={(e) =>
                                setEditForm((p) => ({ ...p, matKhauMoi: e.target.value }))
                              }
                              className="h-8 min-w-[220px]"
                            />
                            <Button
                              size="sm"
                              onClick={() => saveEdit(u.id)}
                              disabled={actionKey === `save-${u.id}`}
                            >
                              {actionKey === `save-${u.id}` ? "Đang lưu..." : "Lưu"}
                            </Button>
                            <Button size="sm" variant="outline" onClick={cancelEdit}>
                              Hủy
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-wrap gap-2">
                            <Button size="sm" variant="outline" onClick={() => startEdit(u)}>
                              Sửa
                            </Button>
                            <Button
                              size="sm"
                              variant={u.trangThai ? "destructive" : "default"}
                              onClick={() => handleToggleStatus(u)}
                              disabled={actionKey === `status-${u.id}`}
                            >
                              {u.trangThai ? "Khóa" : "Mở khóa"}
                            </Button>

                          </div>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
