"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  Bold,
  ChevronDown,
  ChevronUp,
  ImagePlus,
  Italic,
  Link as LinkIcon,
  List,
  ListOrdered,
  Plus,
  RefreshCcw,
  Trash2,
  Underline,
} from "lucide-react";
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
import {
  createAdminBlog,
  deleteAdminBlog,
  getAdminBlogs,
  updateAdminBlog,
} from "@/services/adminBlogService";

const createSection = (index = 1) => ({
  id: `section-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  title: `Tiêu đề mục ${index}`,
  imageUrl: "",
  imageDataUrl: "",
  content: "",
});

const EMPTY_FORM = {
  tieuDe: "",
  anhBia: "",
  trangThai: "BAN_NHAP",
  sections: [createSection(1)],
};

function extractApiError(error, fallback) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (status === 403) return "Bạn không có quyền quản lý bài viết.";
  return fallback;
}

function formatDateTime(value) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function escapeHtml(raw = "") {
  return raw
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function sectionsToHtml(sections = []) {
  const validSections = sections.filter(
    (item) => item.content.trim() || item.title.trim() || item.imageDataUrl || item.imageUrl,
  );

  return validSections
    .map((section) => {
      const imageSrc = section.imageDataUrl || section.imageUrl || "";
      const title = escapeHtml(section.title || "");
      return `
        <section data-editor-section="1" style="margin:0 0 24px 0;">
          <h3 style="margin:0 0 12px 0;font-size:20px;font-weight:700;">${title}</h3>
          ${
            imageSrc
              ? `<img src="${escapeHtml(
                  imageSrc,
                )}" alt="${title}" style="display:block;width:100%;max-width:100%;height:320px;object-fit:cover;border-radius:12px;border:1px solid #e2e8f0;margin-bottom:12px;" />`
              : ""
          }
          <div>${section.content || ""}</div>
        </section>
      `.trim();
    })
    .join("");
}

function htmlToSections(html) {
  if (!html || !html.trim()) return [createSection(1)];
  const doc = new DOMParser().parseFromString(html, "text/html");
  const sectionNodes = [...doc.querySelectorAll('section[data-editor-section="1"]')];

  if (sectionNodes.length === 0) {
    return [
      {
        ...createSection(1),
        title: "Nội dung chính",
        content: html,
      },
    ];
  }

  return sectionNodes.map((node, idx) => {
    const titleEl = node.querySelector("h1,h2,h3,h4,h5,h6");
    const imgEl = node.querySelector("img");
    const clone = node.cloneNode(true);
    const cloneTitle = clone.querySelector("h1,h2,h3,h4,h5,h6");
    const cloneImg = clone.querySelector("img");
    if (cloneTitle) cloneTitle.remove();
    if (cloneImg) cloneImg.remove();
    return {
      ...createSection(idx + 1),
      title: titleEl?.textContent?.trim() || `Tiêu đề mục ${idx + 1}`,
      imageUrl: imgEl?.getAttribute("src") || "",
      imageDataUrl: "",
      content: clone.innerHTML?.trim() || "",
    };
  });
}

function StatusBadge({ status }) {
  const isPublished = status === "XUAT_BAN";
  return (
    <span
      className={`rounded-full px-2 py-1 text-xs font-semibold ${
        isPublished ? "bg-emerald-100 text-emerald-700" : "bg-slate-200 text-slate-700"
      }`}
    >
      {isPublished ? "Xuất bản" : "Bản nháp"}
    </span>
  );
}

function EditorToolbar({ onCommand, disabled }) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b bg-slate-50 p-2">
      <Button type="button" variant="outline" size="sm" onClick={() => onCommand("bold")} disabled={disabled}>
        <Bold className="h-4 w-4" />
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onCommand("italic")} disabled={disabled}>
        <Italic className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onCommand("underline")}
        disabled={disabled}
      >
        <Underline className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onCommand("insertUnorderedList")}
        disabled={disabled}
      >
        <List className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onCommand("insertOrderedList")}
        disabled={disabled}
      >
        <ListOrdered className="h-4 w-4" />
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onCommand("createLink")}
        disabled={disabled}
      >
        <LinkIcon className="h-4 w-4" />
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onCommand("formatH2")} disabled={disabled}>
        H2
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onCommand("formatH3")} disabled={disabled}>
        H3
      </Button>
      <Button type="button" variant="outline" size="sm" onClick={() => onCommand("formatP")} disabled={disabled}>
        P
      </Button>
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={() => onCommand("removeFormat")}
        disabled={disabled}
      >
        Xóa định dạng
      </Button>
    </div>
  );
}

export default function AdminBlogPage() {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [actionKey, setActionKey] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [modalForm, setModalForm] = useState(EMPTY_FORM);
  const [modalId, setModalId] = useState(null);
  const [activeSectionId, setActiveSectionId] = useState("");
  const [previewOpen, setPreviewOpen] = useState(false);

  const editorRefs = useRef({});

  const fetchBlogs = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const data = await getAdminBlogs();
      setBlogs(data);
    } catch (err) {
      setError(extractApiError(err, "Không thể tải danh sách bài viết."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlogs();
  }, [fetchBlogs]);

  useEffect(() => {
    modalForm.sections.forEach((section) => {
      const editor = editorRefs.current[section.id];
      if (editor && editor.innerHTML !== section.content) {
        editor.innerHTML = section.content || "";
      }
    });
  }, [modalForm.sections, modalOpen]);

  const filteredBlogs = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return blogs;
    return blogs.filter((item) => `${item.tieuDe} ${item.slug} ${item.tenTacGia}`.toLowerCase().includes(keyword));
  }, [blogs, query]);

  const previewHtml = useMemo(() => sectionsToHtml(modalForm.sections), [modalForm.sections]);

  const openCreateModal = () => {
    const first = createSection(1);
    setModalMode("create");
    setModalForm({
      tieuDe: "",
      anhBia: "",
      trangThai: "BAN_NHAP",
      sections: [first],
    });
    setModalId(null);
    setActiveSectionId(first.id);
    setPreviewOpen(false);
    setModalOpen(true);
  };

  const openEditModal = (blog) => {
    const sections = htmlToSections(blog.noiDung || "");
    setModalMode("edit");
    setModalId(blog.id);
    setModalForm({
      tieuDe: blog.tieuDe || "",
      anhBia: blog.anhBia || "",
      trangThai: blog.trangThai || "BAN_NHAP",
      sections,
    });
    setActiveSectionId(sections[0]?.id || "");
    setPreviewOpen(false);
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setModalMode("create");
    setModalForm(EMPTY_FORM);
    setModalId(null);
    setActiveSectionId("");
    setPreviewOpen(false);
    editorRefs.current = {};
  };

  const updateSection = (sectionId, patch) => {
    setModalForm((prev) => ({
      ...prev,
      sections: prev.sections.map((item) => (item.id === sectionId ? { ...item, ...patch } : item)),
    }));
  };

  const addSection = () => {
    setModalForm((prev) => {
      const next = [...prev.sections, createSection(prev.sections.length + 1)];
      setActiveSectionId(next[next.length - 1].id);
      return { ...prev, sections: next };
    });
  };

  const removeSection = (sectionId) => {
    setModalForm((prev) => {
      if (prev.sections.length <= 1) return prev;
      const next = prev.sections.filter((item) => item.id !== sectionId);
      if (activeSectionId === sectionId) {
        setActiveSectionId(next[0]?.id || "");
      }
      return { ...prev, sections: next };
    });
  };

  const moveSection = (sectionId, direction) => {
    setModalForm((prev) => {
      const index = prev.sections.findIndex((s) => s.id === sectionId);
      if (index < 0) return prev;
      const swapIndex = direction === "up" ? index - 1 : index + 1;
      if (swapIndex < 0 || swapIndex >= prev.sections.length) return prev;
      const next = [...prev.sections];
      const temp = next[index];
      next[index] = next[swapIndex];
      next[swapIndex] = temp;
      return { ...prev, sections: next };
    });
  };

  const onChooseImageFile = (sectionId, file) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      updateSection(sectionId, {
        imageDataUrl: String(reader.result || ""),
      });
    };
    reader.readAsDataURL(file);
  };

  const onEditorCommand = (command) => {
    const activeEditor = editorRefs.current[activeSectionId];
    if (!activeEditor) return;
    activeEditor.focus();

    if (command === "createLink") {
      const url = window.prompt("Nhập đường dẫn link:");
      if (url) document.execCommand("createLink", false, url);
      return;
    }
    if (command === "formatH2") {
      document.execCommand("formatBlock", false, "H2");
      return;
    }
    if (command === "formatH3") {
      document.execCommand("formatBlock", false, "H3");
      return;
    }
    if (command === "formatP") {
      document.execCommand("formatBlock", false, "P");
      return;
    }
    document.execCommand(command, false);
  };

  const onEditorInput = (sectionId) => {
    const html = editorRefs.current[sectionId]?.innerHTML ?? "";
    updateSection(sectionId, { content: html });
  };

  const saveBlog = async () => {
    const payload = {
      tieuDe: modalForm.tieuDe.trim(),
      anhBia: modalForm.anhBia.trim(),
      noiDung: sectionsToHtml(modalForm.sections),
      trangThai: modalForm.trangThai,
    };

    if (!payload.tieuDe || !payload.noiDung.trim()) {
      setError("Tiêu đề và nội dung không được để trống.");
      return;
    }

    setMessage("");
    setError("");
    const key = modalMode === "create" ? "create" : `save-${modalId}`;
    setActionKey(key);

    try {
      if (modalMode === "create") {
        const created = await createAdminBlog(payload);
        setBlogs((prev) => [created, ...prev]);
        setMessage("Thêm bài viết thành công.");
      } else {
        const updated = await updateAdminBlog(modalId, payload);
        setBlogs((prev) => prev.map((item) => (item.id === modalId ? updated : item)));
        setMessage("Cập nhật bài viết thành công.");
      }
      closeModal();
    } catch (err) {
      setError(
        extractApiError(
          err,
          modalMode === "create" ? "Thêm bài viết that bai." : "Cập nhật bài viết thất bại.",
        ),
      );
    } finally {
      setActionKey("");
    }
  };

  const removeBlog = async (blog) => {
    const ok = window.confirm(`Xóa bai viet "${blog.tieuDe}"?`);
    if (!ok) return;

    setMessage("");
    setError("");
    setActionKey(`delete-${blog.id}`);
    try {
      await deleteAdminBlog(blog.id);
      setBlogs((prev) => prev.filter((item) => item.id !== blog.id));
      setMessage("Xóa bài viết thành công.");
    } catch (err) {
      setError(extractApiError(err, "Xóa bài viết thất bại."));
    } finally {
      setActionKey("");
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Quản lý bài viết</CardTitle>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={fetchBlogs} disabled={loading}>
              <RefreshCcw className="mr-2 h-4 w-4" />
              {loading ? "Đang tải..." : "Làm mới dữ liệu"}
            </Button>
            <Button onClick={openCreateModal}>Thêm bài viết</Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Tìm theo tiêu đề, slug, tác giả..."
            className="max-w-md"
          />
          {message && <p className="text-sm text-emerald-600">{message}</p>}
          {error && <p className="text-sm text-red-600">{error}</p>}

          <div className="overflow-auto rounded-lg border">
            <table className="w-full min-w-[1080px] text-sm">
              <thead className="bg-slate-50 text-left">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Tiêu đề</th>
                  <th className="px-4 py-3">Slug</th>
                  <th className="px-4 py-3">Tác giả</th>
                  <th className="px-4 py-3">Ngày tạo</th>
                  <th className="px-4 py-3">Trạng thái</th>
                  <th className="px-4 py-3">Tác vụ</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Đang tải dữ liệu...
                    </td>
                  </tr>
                ) : filteredBlogs.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                      Không có bài viết phù hợp.
                    </td>
                  </tr>
                ) : (
                  filteredBlogs.map((item) => (
                    <tr key={item.id} className="border-t">
                      <td className="px-4 py-3">{item.id}</td>
                      <td className="px-4 py-3 font-medium">{item.tieuDe}</td>
                      <td className="px-4 py-3">{item.slug || "-"}</td>
                      <td className="px-4 py-3">{item.tenTacGia || "-"}</td>
                      <td className="px-4 py-3">{formatDateTime(item.ngayTao)}</td>
                      <td className="px-4 py-3">
                        <StatusBadge status={item.trangThai} />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button size="sm" variant="outline" onClick={() => openEditModal(item)}>
                            Chinh sua
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeBlog(item)}
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

      <Dialog open={modalOpen} onOpenChange={(open) => (open ? setModalOpen(true) : closeModal())}>
        <DialogContent className="max-h-[92vh] overflow-y-auto sm:max-w-6xl">
          <DialogHeader>
            <DialogTitle>{modalMode === "create" ? "Thêm bài viết" : `Chinh sua bai viet #${modalId}`}</DialogTitle>
            <DialogDescription>
              Soạn nội dung theo từng mục. Ảnh trong mỗi mục sẽ hiển thị cùng kích thước để đồng đều và rõ nét.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 md:grid-cols-3">
            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Tiêu đề bài viết</label>
              <Input
                value={modalForm.tieuDe}
                onChange={(e) => setModalForm((prev) => ({ ...prev, tieuDe: e.target.value }))}
                placeholder="Nhập tiêu đề bài viết..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Trạng thái</label>
              <select
                value={modalForm.trangThai}
                onChange={(e) => setModalForm((prev) => ({ ...prev, trangThai: e.target.value }))}
                className="h-10 w-full rounded-md border px-3 text-sm"
              >
                <option value="BAN_NHAP">Bản nháp</option>
                <option value="XUAT_BAN">Xuất bản</option>
              </select>
            </div>
            <div className="space-y-2 md:col-span-3">
              <label className="text-sm font-medium">Ảnh bìa (URL)</label>
              <Input
                value={modalForm.anhBia}
                onChange={(e) => setModalForm((prev) => ({ ...prev, anhBia: e.target.value }))}
                placeholder="https://..."
              />
            </div>
          </div>

          <div className="space-y-4 rounded-xl border p-4">
            {modalForm.sections.map((section, index) => {
              const imagePreview = section.imageDataUrl || section.imageUrl;
              const isActive = activeSectionId === section.id;
              return (
                <div key={section.id} className="rounded-xl border bg-white p-4">
                  <div className="mb-3 flex items-center gap-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-blue-500 text-sm font-semibold text-white">
                      {index + 1}
                    </span>
                    <Input
                      value={section.title}
                      onChange={(e) => updateSection(section.id, { title: e.target.value })}
                      placeholder={`Tiêu đề mục ${index + 1}`}
                    />
                    <Button type="button" variant="outline" size="icon" onClick={() => moveSection(section.id, "up")}>
                      <ChevronUp className="h-4 w-4" />
                    </Button>
                    <Button type="button" variant="outline" size="icon" onClick={() => moveSection(section.id, "down")}>
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={() => removeSection(section.id)}
                      disabled={modalForm.sections.length === 1}
                    >
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>

                  <div className="mb-3 space-y-2">
                    <p className="text-sm text-slate-600">Ảnh minh họa cho mục này</p>
                    <div className="flex flex-wrap gap-2">
                      <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium hover:bg-slate-50">
                        <ImagePlus className="h-4 w-4" />
                        Chọn ảnh
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={(e) => onChooseImageFile(section.id, e.target.files?.[0])}
                        />
                      </label>
                      <Input
                        value={section.imageUrl}
                        onChange={(e) => updateSection(section.id, { imageUrl: e.target.value })}
                        placeholder="Hoặc dán URL ảnh..."
                        className="max-w-md"
                      />
                    </div>
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt={section.title || `Anh muc ${index + 1}`}
                        className="h-56 w-full rounded-lg border object-cover"
                        loading="eager"
                        decoding="sync"
                      />
                    ) : null}
                  </div>

                  <p className="mb-2 text-sm text-slate-600">Nội dung mục</p>
                  <div className="overflow-hidden rounded-md border">
                    <EditorToolbar onCommand={onEditorCommand} disabled={!isActive} />
                    <div
                      ref={(el) => {
                        if (el) editorRefs.current[section.id] = el;
                      }}
                      contentEditable
                      suppressContentEditableWarning
                      onFocus={() => setActiveSectionId(section.id)}
                      onInput={() => onEditorInput(section.id)}
                      className={`min-h-[220px] p-3 text-sm outline-none ${isActive ? "bg-white" : "bg-slate-50"}`}
                      style={{ whiteSpace: "pre-wrap" }}
                    />
                  </div>
                </div>
              );
            })}

            <Button type="button" variant="outline" className="h-12 w-full border-dashed text-base" onClick={addSection}>
              <Plus className="mr-2 h-5 w-5" />
              Thêm mục mới
            </Button>
          </div>

          {previewOpen ? (
            <div className="mt-3 rounded-xl border bg-slate-50 p-4">
              <p className="mb-3 text-sm font-semibold text-slate-700">Xem trước bài viết</p>
              <article className="rounded-lg border bg-white p-4">
                <h1 className="mb-3 text-2xl font-bold text-slate-900">{modalForm.tieuDe?.trim() || "Tiêu đề bài viết"}</h1>
                {modalForm.anhBia?.trim() ? (
                  <img
                    src={modalForm.anhBia}
                    alt={modalForm.tieuDe || "Ảnh bìa"}
                    className="mb-4 h-72 w-full rounded-xl border object-cover"
                    loading="eager"
                    decoding="sync"
                  />
                ) : null}
                <div
                  className="prose max-w-none prose-img:my-3 prose-img:h-80 prose-img:w-full prose-img:rounded-xl prose-img:border prose-img:object-cover"
                  dangerouslySetInnerHTML={{ __html: previewHtml || "<p>Chưa có nội dung.</p>" }}
                />
              </article>
            </div>
          ) : null}

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setPreviewOpen((prev) => !prev)}>
              {previewOpen ? "Ẩn xem trước" : "Xem trước"}
            </Button>
            <Button variant="outline" onClick={closeModal}>
              Hủy
            </Button>
            <Button onClick={saveBlog} disabled={actionKey === "create" || actionKey === `save-${modalId}`}>
              {actionKey === "create" || actionKey === `save-${modalId}`
                ? "Đang lưu..."
                : modalMode === "create"
                  ? "Đăng bài viết"
                  : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

