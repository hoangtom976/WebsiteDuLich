"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { getAdminCategories } from "@/services/adminCategoryService";
import { getAdminLocations } from "@/services/adminLocationService";
import { createAdminTour, deleteAdminTour, getAdminTours, updateAdminTour } from "@/services/adminTourService";
import {
  deleteAdminTourImage,
  getAdminTourImages,
  uploadAdminTourImage,
} from "@/services/adminTourImageService";

const EMPTY_FORM = {
  tenTour: "",
  moTa: "",
  gia: "",
  soNgay: "",
  danhMucId: "",
  diaDiemId: "",
  trangThai: true,
};

function formatCurrency(value) {
  return `${new Intl.NumberFormat("vi-VN").format(Number(value || 0))} đ`;
}

function extractApiError(error, fallback) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.thongDiep) return data.thongDiep;
  if (data?.message) return data.message;
  if (status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (status === 403) return "Bạn không có quyền quản lý tour.";
  return fallback;
}

export default function AdminToursPage() {
  const [query, setQuery] = useState("");
  const [tours, setTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionKey, setActionKey] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [modalForm, setModalForm] = useState(EMPTY_FORM);
  const [modalTourId, setModalTourId] = useState(null);
  const [modalImageFile, setModalImageFile] = useState(null);
  const [modalImageFiles, setModalImageFiles] = useState([]);
  const [modalImages, setModalImages] = useState([]);
  const [modalImagesLoading, setModalImagesLoading] = useState(false);
  const [modalImageActionKey, setModalImageActionKey] = useState("");
  const [modalImageMessage, setModalImageMessage] = useState("");
  const [modalImageError, setModalImageError] = useState("");

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [tourData, categoryData, locationData] = await Promise.all([
        getAdminTours(),
        getAdminCategories(),
        getAdminLocations(),
      ]);
      setTours(tourData);
      setCategories(categoryData);
      setLocations(locationData);
    } catch (err) {
      setError(extractApiError(err, "Không thể tải dữ liệu quản lý tour."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const filtered = useMemo(() => {
    return tours.filter((tour) =>
      `${tour.tenTour} ${tour.tenDanhMuc} ${tour.tenDiaDiem}`
        .toLowerCase()
        .includes(query.toLowerCase()),
    );
  }, [tours, query]);

  const resetModalImageState = () => {
    setModalImages([]);
    setModalImageFile(null);
    setModalImageFiles([]);
    setModalImagesLoading(false);
    setModalImageActionKey("");
    setModalImageMessage("");
    setModalImageError("");
  };

  const openCreateModal = () => {
    setModalMode("create");
    setModalForm(EMPTY_FORM);
    setModalTourId(null);
    resetModalImageState();
    setModalOpen(true);
  };

  const openEditModal = async (tour) => {
    setModalMode("edit");
    setModalForm({
      tenTour: tour.tenTour || "",
      moTa: tour.moTa || "",
      gia: String(tour.gia ?? ""),
      soNgay: String(tour.soNgay ?? ""),
      danhMucId: String(tour.danhMucId ?? ""),
      diaDiemId: String(tour.diaDiemId ?? ""),
      trangThai: !!tour.trangThai,
    });
    setModalTourId(tour.id);
    setModalOpen(true);
    setModalImagesLoading(true);
    setModalImageError("");
    setModalImageMessage("");
    try {
      const imageData = await getAdminTourImages(tour.id);
      setModalImages(imageData);
    } catch (err) {
      setModalImageError(extractApiError(err, "Không thể tải danh sách ảnh tour."));
    } finally {
      setModalImagesLoading(false);
    }
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode("create");
    setModalForm(EMPTY_FORM);
    setModalTourId(null);
    resetModalImageState();
  };

  const saveTourFromModal = async () => {
    setMessage("");
    setError("");
    const key = modalMode === "create" ? "create-modal" : `save-modal-${modalTourId}`;
    setActionKey(key);
    try {
      const payload = {
        tenTour: modalForm.tenTour.trim(),
        moTa: modalForm.moTa.trim(),
        gia: Number(modalForm.gia),
        soNgay: Number(modalForm.soNgay),
        danhMucId: Number(modalForm.danhMucId),
        diaDiemId: Number(modalForm.diaDiemId),
        trangThai: modalForm.trangThai,
      };

      if (modalMode === "create") {
        const created = await createAdminTour(payload);
        setTours((prev) => [created, ...prev]);
        let createMessage = "Thêm tour thành công.";

        if (modalImageFiles.length > 0) {
          const uploadResults = await Promise.allSettled(
            modalImageFiles.map((file) => uploadAdminTourImage(created.id, file)),
          );
          const successImages = uploadResults
            .filter((result) => result.status === "fulfilled")
            .map((result) => result.value);
          const failedCount = uploadResults.length - successImages.length;
          setModalImages(successImages);
          setModalImageFiles([]);

          if (failedCount === 0) {
            createMessage = `Thêm tour thành công, đã upload ${successImages.length} ảnh.`;
          } else {
            createMessage = `Thêm tour thành công, upload ${successImages.length}/${uploadResults.length} ảnh.`;
            setModalImageError(`${failedCount} ảnh upload thất bại. Bạn có thể tải lại trong modal.`);
          }
        }

        setMessage(createMessage);
        setModalMode("edit");
        setModalTourId(created.id);
        if (modalImageFiles.length === 0) {
          setModalImageMessage("Đã tạo tour. Bạn có thể thêm hình ảnh ngay.");
        }
      } else {
        const updated = await updateAdminTour(modalTourId, payload);
        setTours((prev) => prev.map((tour) => (tour.id === modalTourId ? updated : tour)));
        setMessage("Cập nhật tour thành công.");
      }
    } catch (err) {
      setError(extractApiError(err, modalMode === "create" ? "Thêm tour thất bại." : "Cập nhật tour thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const toggleStatus = async (tour) => {
    setMessage("");
    setError("");
    setActionKey(`status-${tour.id}`);
    try {
      const updated = await updateAdminTour(tour.id, {
        tenTour: tour.tenTour,
        moTa: tour.moTa || "",
        gia: Number(tour.gia),
        soNgay: Number(tour.soNgay),
        danhMucId: Number(tour.danhMucId),
        diaDiemId: Number(tour.diaDiemId),
        trangThai: !tour.trangThai,
      });
      setTours((prev) => prev.map((item) => (item.id === tour.id ? updated : item)));
      setMessage(updated.trangThai ? "Đã hiển thị lại tour." : "Đã ẩn tour.");
    } catch (err) {
      setError(extractApiError(err, "Cập nhật trạng thái tour thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const removeTour = async (tour) => {
    const ok = window.confirm(`Xóa tour "${tour.tenTour}"?`);
    if (!ok) return;

    setMessage("");
    setError("");
    setActionKey(`delete-${tour.id}`);
    try {
      await deleteAdminTour(tour.id);
      setTours((prev) => prev.filter((item) => item.id !== tour.id));
      setMessage("Xóa tour thành công.");
    } catch (err) {
      setError(extractApiError(err, "Xóa tour thất bại."));
    } finally {
      setActionKey("");
    }
  };

  const uploadImageInModal = async () => {
    if (!modalTourId || !modalImageFile) return;
    setModalImageMessage("");
    setModalImageError("");
    setModalImageActionKey("upload");
    try {
      const created = await uploadAdminTourImage(modalTourId, modalImageFile);
      setModalImages((prev) => [created, ...prev]);
      setModalImageFile(null);
      setModalImageMessage("Tải ảnh lên thành công.");
    } catch (err) {
      setModalImageError(extractApiError(err, "Tải ảnh lên thất bại."));
    } finally {
      setModalImageActionKey("");
    }
  };

  const deleteImageInModal = async (imageId) => {
    setModalImageMessage("");
    setModalImageError("");
    setModalImageActionKey(`delete-${imageId}`);
    try {
      await deleteAdminTourImage(imageId);
      setModalImages((prev) => prev.filter((image) => image.id !== imageId));
      setModalImageMessage("Xóa ảnh thành công.");
    } catch (err) {
      setModalImageError(extractApiError(err, "Xóa ảnh thất bại."));
    } finally {
      setModalImageActionKey("");
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Quản lý tour</CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={fetchData} disabled={loading}>
            {loading ? "Đang tải..." : "Làm mới dữ liệu"}
          </Button>
          <Button onClick={openCreateModal}>Thêm tour</Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Tìm theo tên tour, danh mục, địa điểm..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-md"
        />

        <p className="text-xs text-slate-500">
          Luồng xóa chuẩn: xóa đơn đặt tour -&gt; xóa lịch khởi hành -&gt; xóa lịch trình/hình ảnh/đánh giá -&gt; xóa tour.
        </p>
        {message && <p className="text-sm text-emerald-600">{message}</p>}
        {error && <p className="text-sm text-red-600">{error}</p>}

        <div className="overflow-auto rounded-lg border">
          <table className="w-full min-w-[1100px] text-sm">
            <thead className="bg-slate-50 text-left">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Tên tour</th>
                <th className="px-4 py-3">Danh mục</th>
                <th className="px-4 py-3">Địa điểm</th>
                <th className="px-4 py-3">Số ngày</th>
                <th className="px-4 py-3">Giá</th>
                <th className="px-4 py-3">Trạng thái</th>
                <th className="px-4 py-3">Tác vụ</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                    Đang tải dữ liệu...
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-6 text-center text-slate-500">
                    Không có tour phù hợp.
                  </td>
                </tr>
              ) : (
                filtered.map((tour) => (
                  <tr key={tour.id} className="border-t">
                    <td className="px-4 py-3">{tour.id}</td>
                    <td className="px-4 py-3 font-medium">{tour.tenTour}</td>
                    <td className="px-4 py-3">{tour.tenDanhMuc || "-"}</td>
                    <td className="px-4 py-3">{tour.tenDiaDiem || "-"}</td>
                    <td className="px-4 py-3">{tour.soNgay} ngày</td>
                    <td className="px-4 py-3 font-semibold text-blue-700">{formatCurrency(tour.gia)}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${
                          tour.trangThai
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                        }`}
                      >
                        {tour.trangThai ? "Đang hiển thị" : "Đang ẩn"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditModal(tour)}>
                          Sửa
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => toggleStatus(tour)}
                          disabled={actionKey === `status-${tour.id}`}
                        >
                          {tour.trangThai ? "Ẩn tour" : "Hiển thị"}
                        </Button>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeTour(tour)}
                          disabled={actionKey === `delete-${tour.id}`}
                        >
                          {actionKey === `delete-${tour.id}` ? "Đang xóa..." : "Xóa"}
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

      <Dialog open={modalOpen} onOpenChange={(open) => (open ? setModalOpen(true) : closeModal())}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-4xl">
          <DialogHeader>
            <DialogTitle>{modalMode === "create" ? "Thêm tour mới" : `Sửa tour #${modalTourId}`}</DialogTitle>
            <DialogDescription>
              Nhập thông tin tour và quản lý hình ảnh ngay trong cửa sổ này.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 md:grid-cols-2">
            <Input
              placeholder="Tên tour"
              value={modalForm.tenTour}
              onChange={(e) => setModalForm((p) => ({ ...p, tenTour: e.target.value }))}
            />
            <Input
              type="number"
              min={0}
              placeholder="Giá"
              value={modalForm.gia}
              onChange={(e) => setModalForm((p) => ({ ...p, gia: e.target.value }))}
            />
            <Input
              type="number"
              min={1}
              placeholder="Số ngày"
              value={modalForm.soNgay}
              onChange={(e) => setModalForm((p) => ({ ...p, soNgay: e.target.value }))}
            />
            <select
              className="rounded-md border px-3 py-2"
              value={modalForm.danhMucId}
              onChange={(e) => setModalForm((p) => ({ ...p, danhMucId: e.target.value }))}
            >
              <option value="">Chọn danh mục</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.tenDanhMuc}
                </option>
              ))}
            </select>
            <select
              className="rounded-md border px-3 py-2"
              value={modalForm.diaDiemId}
              onChange={(e) => setModalForm((p) => ({ ...p, diaDiemId: e.target.value }))}
            >
              <option value="">Chọn địa điểm</option>
              {locations.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.tenDiaDiem}
                </option>
              ))}
            </select>
            <label className="flex items-center gap-2 rounded-md border px-3 py-2 text-sm">
              <input
                type="checkbox"
                checked={modalForm.trangThai}
                onChange={(e) => setModalForm((p) => ({ ...p, trangThai: e.target.checked }))}
              />
              Hiển thị
            </label>
            <div className="md:col-span-2">
              <Input
                placeholder="Mô tả"
                value={modalForm.moTa}
                onChange={(e) => setModalForm((p) => ({ ...p, moTa: e.target.value }))}
              />
            </div>
          </div>

          <div className="rounded-lg border p-3">
            <h3 className="mb-2 font-semibold">Hình ảnh tour</h3>
            {modalMode === "create" ? (
              <>
                <div className="grid gap-3 md:grid-cols-[1fr,auto]">
                  <Input
                    type="file"
                    accept="image/*"
                    multiple
                    onChange={(e) => setModalImageFiles(Array.from(e.target.files || []))}
                  />
                  <p className="rounded-md border px-3 py-2 text-sm text-slate-600">
                    {modalImageFiles.length > 0
                      ? `Đã chọn ${modalImageFiles.length} ảnh`
                      : "Chưa chọn ảnh"}
                  </p>
                </div>
                <p className="mt-2 text-sm text-slate-500">
                  Ảnh sẽ được upload tự động song song ngay sau khi tạo tour.
                </p>
              </>
            ) : (
              <>
                <div className="grid gap-3 md:grid-cols-[1fr,auto]">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={(e) => setModalImageFile(e.target.files?.[0] || null)}
                  />
                  <Button
                    onClick={uploadImageInModal}
                    disabled={!modalImageFile || modalImageActionKey === "upload"}
                  >
                    {modalImageActionKey === "upload" ? "Đang tải..." : "Upload ảnh"}
                  </Button>
                </div>

                <div className="mt-2">
                  {modalImageMessage && <p className="text-sm text-emerald-600">{modalImageMessage}</p>}
                  {modalImageError && <p className="text-sm text-red-600">{modalImageError}</p>}
                </div>

                <div className="mt-3 grid gap-3 md:grid-cols-2">
                  {modalImagesLoading ? (
                    <p className="text-sm text-slate-500">Đang tải danh sách ảnh...</p>
                  ) : modalImages.length === 0 ? (
                    <p className="text-sm text-slate-500">Chưa có ảnh.</p>
                  ) : (
                    modalImages.map((image) => (
                      <div key={image.id} className="rounded-md border p-2">
                        <img
                          src={image.urlHinhAnh}
                          alt={`Ảnh tour ${image.id}`}
                          className="h-32 w-full rounded border object-cover"
                        />
                        <p className="mt-2 line-clamp-2 break-all text-xs text-slate-600">{image.urlHinhAnh}</p>
                        <div className="mt-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => deleteImageInModal(image.id)}
                            disabled={modalImageActionKey === `delete-${image.id}`}
                          >
                            {modalImageActionKey === `delete-${image.id}` ? "Đang xóa..." : "Xóa ảnh"}
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={closeModal}>
              Đóng
            </Button>
            <Button
              onClick={saveTourFromModal}
              disabled={actionKey === "create-modal" || actionKey === `save-modal-${modalTourId}`}
            >
              {actionKey === "create-modal" || actionKey === `save-modal-${modalTourId}`
                ? "Đang lưu..."
                : modalMode === "create"
                  ? "Tạo tour"
                  : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
}
