"use client";

import { useCallback, useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    getAllFlashSales,
    createFlashSale,
    updateFlashSale,
    deleteFlashSale,
} from "@/services/promotionService";
import { getAllTours } from "@/services/tourService";

const EMPTY_FORM = {
    tourId: "",
    phanTramGiam: 10,
    soLuong: "",
    tgBatDau: "",
    tgKetThuc: "",
    trangThai: true,
};

function extractApiError(error, fallback) {
    if (error?.response?.status === 403) return "Lỗi 403: Bạn không có quyền thực hiện hành động này.";
    if (error?.response?.status === 401) return "Lỗi 401: Vui lòng đăng nhập lại.";
    const data = error?.response?.data;
    if (typeof data === "string" && data.trim()) return data;
    if (data?.message) return data.message;
    if (data?.error) return data.error;
    return fallback;
}

export default function AdminFlashSalesPage() {
    const [flashSales, setFlashSales] = useState([]);
    const [tours, setTours] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionKey, setActionKey] = useState("");
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");

    const [form, setForm] = useState(EMPTY_FORM);
    const [editingId, setEditingId] = useState(null);
    const [editingForm, setEditingForm] = useState(EMPTY_FORM);

    const fetchData = useCallback(async () => {
        setLoading(true);
        setError("");
        try {
            const [fsData, tourData] = await Promise.all([
                getAllFlashSales(),
                getAllTours()
            ]);
            setFlashSales(fsData || []);
            setTours(tourData || []);
        } catch (err) {
            console.error("Fetch Data Error:", err);
            setError(extractApiError(err, "Không thể tải dữ liệu tour hoặc flash sale. Vui lòng kiểm tra backend."));
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleCreate = async () => {
        if (!form.tourId) {
            setError("Vui lòng chọn tour");
            return;
        }
        setMessage("");
        setError("");
        setActionKey("create");
        try {
            const created = await createFlashSale({
                tourId: Number(form.tourId),
                phanTramGiam: 10,
                soLuong: Number(form.soLuong),
                tgBatDau: form.tgBatDau ? `${form.tgBatDau}:00` : null,
                tgKetThuc: form.tgKetThuc ? `${form.tgKetThuc}:00` : null,
                trangThai: form.trangThai,
            });
            setFlashSales((prev) => [created, ...prev]);
            setForm(EMPTY_FORM);
            setMessage("Tạo Flash Sale thành công (giảm giá cố định 10%).");
        } catch (err) {
            setError(extractApiError(err, "Tạo Flash Sale thất bại."));
        } finally {
            setActionKey("");
        }
    };

    const startEdit = (item) => {
        setEditingId(item.id);
        setEditingForm({
            tourId: String(item.tourId),
            phanTramGiam: "10",
            soLuong: String(item.soLuong),
            tgBatDau: item.tgBatDau ? item.tgBatDau.substring(0, 16) : "",
            tgKetThuc: item.tgKetThuc ? item.tgKetThuc.substring(0, 16) : "",
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
            const updated = await updateFlashSale(id, {
                tourId: Number(editingForm.tourId),
                phanTramGiam: 10,
                soLuong: Number(editingForm.soLuong),
                tgBatDau: editingForm.tgBatDau ? `${editingForm.tgBatDau}:00` : null,
                tgKetThuc: editingForm.tgKetThuc ? `${editingForm.tgKetThuc}:00` : null,
                trangThai: editingForm.trangThai,
            });
            setFlashSales((prev) => prev.map((item) => (item.id === id ? updated : item)));
            setMessage("Cập nhật Flash Sale thành công.");
            cancelEdit();
        } catch (err) {
            setError(extractApiError(err, "Cập nhật Flash Sale thất bại."));
        } finally {
            setActionKey("");
        }
    };

    const removeFlashSale = async (item) => {
        const ok = window.confirm(`Xóa Flash Sale cho tour ${item.tenTour}?`);
        if (!ok) return;

        setMessage("");
        setError("");
        setActionKey(`delete-${item.id}`);
        try {
            await deleteFlashSale(item.id);
            setFlashSales((prev) => prev.filter((v) => v.id !== item.id));
            setMessage("Xóa Flash Sale thành công.");
        } catch (err) {
            setError(extractApiError(err, "Xóa Flash Sale thất bại."));
        } finally {
            setActionKey("");
        }
    };

    return (
        <div className="space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle>Quản lý Flash Sale (Giảm giá 10%)</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-3 md:grid-cols-4">
                    <select
                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        value={form.tourId}
                        onChange={(e) => setForm((prev) => ({ ...prev, tourId: e.target.value }))}
                    >
                        <option value="">Chọn Tour để Sale</option>
                        {tours.map(t => (
                            <option key={t.id} value={t.id}>{t.tenTour}</option>
                        ))}
                    </select>
                    <Input
                        type="number"
                        placeholder="Số lượng suất sale"
                        value={form.soLuong}
                        onChange={(e) => setForm((prev) => ({ ...prev, soLuong: e.target.value }))}
                    />
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground font-medium">Thời gian bắt đầu</label>
                        <Input
                            type="datetime-local"
                            value={form.tgBatDau}
                            onChange={(e) => setForm((prev) => ({ ...prev, tgBatDau: e.target.value }))}
                        />
                    </div>
                    <div className="flex flex-col gap-1">
                        <label className="text-xs text-muted-foreground font-medium">Thời gian kết thúc</label>
                        <Input
                            type="datetime-local"
                            value={form.tgKetThuc}
                            onChange={(e) => setForm((prev) => ({ ...prev, tgKetThuc: e.target.value }))}
                        />
                    </div>
                    <div className="md:col-span-4 flex justify-end">
                        <Button className="px-10 bg-blue-600 hover:bg-blue-700 text-white" onClick={handleCreate} disabled={actionKey === "create"}>
                            {actionKey === "create" ? "Đang xử lý..." : "Kế hoạch Flash Sale"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {message && <p className="text-sm text-emerald-600 font-bold">{message}</p>}
            {error && <p className="text-sm text-red-600 font-bold">{error}</p>}

            <Card>
                <CardContent className="p-0">
                    <div className="overflow-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-slate-100 text-left font-bold">
                                <tr>
                                    <th className="px-4 py-4">Tour Sale</th>
                                    <th className="px-4 py-4">Giảm giá</th>
                                    <th className="px-4 py-4">Số lượng / Đã đặt</th>
                                    <th className="px-4 py-4">Bắt đầu</th>
                                    <th className="px-4 py-4">Kết thúc</th>
                                    <th className="px-4 py-4">Trạng thái</th>
                                    <th className="px-4 py-4">Tác vụ</th>
                                </tr>
                            </thead>
                            <tbody>
                                {loading ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-slate-500">
                                            Đang tải dữ liệu...
                                        </td>
                                    </tr>
                                ) : (tours.length === 0 && flashSales.length === 0) ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-12 text-center text-red-500 font-medium">
                                            Không có dữ liệu tour hoặc flash sale. Hãy đảm bảo backend đang chạy.
                                        </td>
                                    </tr>
                                ) : flashSales.length === 0 ? (
                                    <tr>
                                        <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                                            Bạn chưa tạo chương trình Flash Sale nào.
                                        </td>
                                    </tr>
                                ) : (
                                    flashSales.map((item) => (
                                        <tr key={item.id} className="border-t hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-4 font-semibold text-blue-900">
                                                {editingId === item.id ? (
                                                    <select
                                                        className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm"
                                                        value={editingForm.tourId}
                                                        onChange={(e) => setEditingForm((prev) => ({ ...prev, tourId: e.target.value }))}
                                                    >
                                                        {tours.map(t => (
                                                            <option key={t.id} value={t.id}>{t.tenTour}</option>
                                                        ))}
                                                    </select>
                                                ) : (
                                                    item.tenTour
                                                )}
                                            </td>
                                            <td className="px-4 py-4 font-bold text-red-600">
                                                {item.phanTramGiam}%
                                            </td>
                                            <td className="px-4 py-4">
                                                {editingId === item.id ? (
                                                    <Input
                                                        type="number"
                                                        value={editingForm.soLuong}
                                                        onChange={(e) => setEditingForm((prev) => ({ ...prev, soLuong: e.target.value }))}
                                                        className="h-9"
                                                    />
                                                ) : (
                                                    <span className="font-medium text-slate-700">{item.soLuong} suất</span>
                                                )}
                                                <span className="ml-1 text-slate-400">/ Đã bán: {item.daBan}</span>
                                            </td>
                                            <td className="px-4 py-4 text-slate-600">
                                                {editingId === item.id ? (
                                                    <Input
                                                        type="datetime-local"
                                                        value={editingForm.tgBatDau}
                                                        onChange={(e) => setEditingForm((prev) => ({ ...prev, tgBatDau: e.target.value }))}
                                                        className="h-9"
                                                    />
                                                ) : (
                                                    new Date(item.tgBatDau).toLocaleString()
                                                )}
                                            </td>
                                            <td className="px-4 py-4 text-slate-600">
                                                {editingId === item.id ? (
                                                    <Input
                                                        type="datetime-local"
                                                        value={editingForm.tgKetThuc}
                                                        onChange={(e) => setEditingForm((prev) => ({ ...prev, tgKetThuc: e.target.value }))}
                                                        className="h-9"
                                                    />
                                                ) : (
                                                    new Date(item.tgKetThuc).toLocaleString()
                                                )}
                                            </td>
                                            <td className="px-4 py-4">
                                                <span
                                                    className={`rounded-full px-3 py-1 text-xs font-bold uppercase tracking-wider ${item.trangThai
                                                        ? "bg-emerald-100 text-emerald-700"
                                                        : "bg-slate-200 text-slate-700"
                                                        }`}
                                                >
                                                    {item.trangThai ? "Đang chạy" : "Tạm dừng"}
                                                </span>
                                            </td>
                                            <td className="px-4 py-4">
                                                <div className="flex gap-2">
                                                    {editingId === item.id ? (
                                                        <>
                                                            <Button
                                                                size="sm"
                                                                onClick={() => saveEdit(item.id)}
                                                                disabled={actionKey === `save-${item.id}`}
                                                            >
                                                                Lưu
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
                                                        onClick={() => removeFlashSale(item)}
                                                        disabled={actionKey === `delete-${item.id}`}
                                                    >
                                                        Xóa
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
