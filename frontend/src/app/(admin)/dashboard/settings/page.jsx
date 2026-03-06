"use client";

import { useCallback, useEffect, useState } from "react";
import { Bell, Bot, CloudSun, RefreshCcw, Save, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  getAdminSystemSettings,
  updateAdminSystemSettings,
} from "@/services/adminSystemSettingsService";

const EMPTY_SETTINGS = {
  tenHeThong: "",
  hotline: "",
  emailLienHe: "",
  diaChi: "",
  gioLamViec: "",
  batEmailThongBao: true,
  batChatbot: true,
  batThoiTiet: true,
};

function extractApiError(error, fallback) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (status === 401) return "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
  if (status === 403) return "Bạn không có quyền cấu hình hệ thống.";
  return fallback;
}

function ToggleItem({ checked, onChange, icon: Icon, title, desc }) {
  return (
    <label className="flex items-start gap-3 rounded-lg border p-3 transition hover:bg-slate-50">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="mt-1 h-4 w-4"
      />
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <Icon className="h-4 w-4 text-slate-600" />
          <p className="font-medium text-slate-800">{title}</p>
        </div>
        <p className="mt-1 text-xs text-slate-500">{desc}</p>
      </div>
    </label>
  );
}

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState(EMPTY_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const loadSettings = useCallback(async (showRefreshedMessage = false) => {
    setLoading(true);
    setError("");
    if (!showRefreshedMessage) setMessage("");

    try {
      const data = await getAdminSystemSettings();
      setSettings(data);
      if (showRefreshedMessage) setMessage("Đã làm mới dữ liệu cấu hình.");
    } catch (err) {
      setError(extractApiError(err, "Không thể tải cài đặt hệ thống."));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadSettings(false);
  }, [loadSettings]);

  const handleSave = async () => {
    setSaving(true);
    setError("");
    setMessage("");
    try {
      const updated = await updateAdminSystemSettings(settings);
      setSettings(updated);
      setMessage("Lưu cài đặt hệ thống thành công.");
    } catch (err) {
      setError(extractApiError(err, "Lưu cài đặt thất bại."));
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Settings2 className="h-5 w-5" />
            Cài đặt hệ thống
          </CardTitle>
          <Button variant="outline" onClick={() => loadSettings(true)} disabled={loading || saving}>
            <RefreshCcw className="mr-2 h-4 w-4" />
            {loading ? "Đang tải..." : "Làm mới dữ liệu"}
          </Button>
        </CardHeader>
        <CardContent className="space-y-5">
          {message ? <p className="text-sm text-emerald-600">{message}</p> : null}
          {error ? <p className="text-sm text-red-600">{error}</p> : null}

          <div className="grid gap-3 md:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Tên hệ thống</label>
              <Input
                value={settings.tenHeThong}
                onChange={(e) => setSettings((prev) => ({ ...prev, tenHeThong: e.target.value }))}
                placeholder="Ví dụ: Viet Tour Admin"
                disabled={loading || saving}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Hotline</label>
              <Input
                value={settings.hotline}
                onChange={(e) => setSettings((prev) => ({ ...prev, hotline: e.target.value }))}
                placeholder="1900 1234"
                disabled={loading || saving}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Email liên hệ</label>
              <Input
                value={settings.emailLienHe}
                onChange={(e) => setSettings((prev) => ({ ...prev, emailLienHe: e.target.value }))}
                placeholder="contact@viettour.com"
                disabled={loading || saving}
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Giờ làm việc</label>
              <Input
                value={settings.gioLamViec}
                onChange={(e) => setSettings((prev) => ({ ...prev, gioLamViec: e.target.value }))}
                placeholder="08:00 - 22:00"
                disabled={loading || saving}
              />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium">Địa chỉ</label>
              <Input
                value={settings.diaChi}
                onChange={(e) => setSettings((prev) => ({ ...prev, diaChi: e.target.value }))}
                placeholder="Địa chỉ văn phòng chính"
                disabled={loading || saving}
              />
            </div>
          </div>

          <div className="space-y-3 rounded-lg border bg-white p-4">
            <p className="text-sm font-semibold text-slate-800">Bật/Tắt module hệ thống</p>

            <div className="grid gap-3 md:grid-cols-3">
              <ToggleItem
                checked={settings.batEmailThongBao}
                onChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    batEmailThongBao: checked,
                  }))
                }
                icon={Bell}
                title="Email thông báo"
                desc="Gửi email xác nhận đơn hàng và thanh toán."
              />

              <ToggleItem
                checked={settings.batChatbot}
                onChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    batChatbot: checked,
                  }))
                }
                icon={Bot}
                title="Chatbot AI"
                desc="Hiển thị và cho phép tư vấn tự động trên website."
              />

              <ToggleItem
                checked={settings.batThoiTiet}
                onChange={(checked) =>
                  setSettings((prev) => ({
                    ...prev,
                    batThoiTiet: checked,
                  }))
                }
                icon={CloudSun}
                title="Dự báo thời tiết"
                desc="Bật module thời tiết trên trang công khai."
              />
            </div>
          </div>

          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading || saving}>
              <Save className="mr-2 h-4 w-4" />
              {saving ? "Đang lưu..." : "Lưu cài đặt"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
