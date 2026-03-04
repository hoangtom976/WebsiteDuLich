"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { UserRound, LockKeyhole, Mail, ShieldCheck, CalendarDays } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  getCurrentUserProfile,
  updateCurrentUserProfile,
  changeCurrentUserPassword,
} from "@/services/userService";
import { getAuthState, setProfileFullName } from "@/lib/auth-client";

function roleToLabel(role, auth) {
  const roleValue = String(role || "").toUpperCase();
  if (roleValue.includes("ADMIN") || auth.isAdmin) return "Quản trị viên";
  if (roleValue.includes("STAFF") || auth.isStaff) return "Nhân viên";
  return "Khách hàng";
}

function statusToLabel(trangThai) {
  return trangThai === false ? "Bị khóa" : "Đang hoạt động";
}

function extractApiError(error, fallback) {
  const status = error?.response?.status;
  const data = error?.response?.data;
  if (typeof data === "string" && data.trim()) return data;
  if (data?.message) return data.message;
  if (status === 401) return "Phiên đăng nhập đã hết hạn, vui lòng đăng nhập lại.";
  if (status === 403) return "Bạn không có quyền truy cập dữ liệu hồ sơ.";
  return fallback;
}

export default function HoSoPage() {
  const auth = getAuthState();
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [profile, setProfile] = useState(null);
  const [profileMessage, setProfileMessage] = useState("");
  const [passwordMessage, setPasswordMessage] = useState("");
  const [profileError, setProfileError] = useState("");
  const [passwordError, setPasswordError] = useState("");

  const profileForm = useForm({
    defaultValues: {
      hoTen: "",
      soDienThoai: "",
    },
  });

  const passwordForm = useForm({
    defaultValues: {
      matKhauCu: "",
      matKhauMoi: "",
      xacNhanMatKhauMoi: "",
    },
  });

  useEffect(() => {
    let cancelled = false;
    const fetchProfile = async () => {
      try {
        const profile = await getCurrentUserProfile();
        if (cancelled) return;
        setProfile(profile);
        profileForm.reset({
          hoTen: profile.hoTen || "",
          soDienThoai: profile.soDienThoai || "",
        });
      } catch (error) {
        if (!cancelled) setProfileError(extractApiError(error, "Không thể tải thông tin cá nhân."));
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    };
    fetchProfile();
    return () => {
      cancelled = true;
    };
  }, [profileForm]);

  const onSubmitProfile = profileForm.handleSubmit(async (values) => {
    setProfileMessage("");
    setProfileError("");
    try {
      const updated = await updateCurrentUserProfile({
        hoTen: values.hoTen?.trim(),
        soDienThoai: values.soDienThoai?.trim(),
      });
      setProfile(updated);
      const nextName = updated.hoTen || values.hoTen || "";
      setProfileFullName(nextName);
      profileForm.reset({
        hoTen: nextName,
        soDienThoai: updated.soDienThoai || values.soDienThoai || "",
      });
      setProfileMessage("Cập nhật thông tin thành công.");
    } catch (error) {
      setProfileError(extractApiError(error, "Cập nhật thông tin thất bại."));
    }
  });

  const onSubmitPassword = passwordForm.handleSubmit(async (values) => {
    setPasswordMessage("");
    setPasswordError("");

    if (values.matKhauMoi !== values.xacNhanMatKhauMoi) {
      setPasswordError("Xác nhận mật khẩu mới không khớp.");
      return;
    }

    try {
      const message = await changeCurrentUserPassword({
        matKhauCu: values.matKhauCu,
        matKhauMoi: values.matKhauMoi,
      });
      passwordForm.reset();
      setPasswordMessage(typeof message === "string" ? message : "Đổi mật khẩu thành công.");
    } catch (error) {
      setPasswordError(extractApiError(error, "Đổi mật khẩu thất bại."));
    }
  });

  return (
    <section className="bg-slate-50 py-10">
      <div className="mx-auto grid w-full max-w-6xl gap-6 px-4 lg:grid-cols-3">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-xl">
              <UserRound className="h-5 w-5" />
              Tài khoản
            </CardTitle>
            <CardDescription>Thông tin nhận diện tài khoản đăng nhập.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg border bg-white p-3">
              <p className="mb-1 text-xs text-slate-500">Họ tên</p>
              <p className="font-semibold text-slate-900">{profile?.hoTen || "Chưa cập nhật"}</p>
            </div>

            <div className="rounded-lg border bg-white p-3">
              <p className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                <Mail className="h-4 w-4" />
                Email
              </p>
              <p className="break-all font-semibold text-slate-900">{profile?.email || "-"}</p>
            </div>

            <div className="rounded-lg border bg-white p-3">
              <p className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="h-4 w-4" />
                Vai trò
              </p>
              <p className="font-semibold text-slate-900">{roleToLabel(profile?.vaiTro, auth)}</p>
            </div>

            <div className="rounded-lg border bg-white p-3">
              <p className="mb-1 text-xs text-slate-500">Trạng thái</p>
              <p className="font-semibold text-slate-900">{statusToLabel(profile?.trangThai)}</p>
            </div>

            <div className="rounded-lg border bg-white p-3">
              <p className="mb-1 flex items-center gap-2 text-xs text-slate-500">
                <CalendarDays className="h-4 w-4" />
                Ngày tạo
              </p>
              <p className="font-semibold text-slate-900">
                {profile?.ngayTao
                  ? new Date(profile.ngayTao).toLocaleString("vi-VN")
                  : "Không có dữ liệu"}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <UserRound className="h-6 w-6" />
              Hồ sơ cá nhân
            </CardTitle>
            <CardDescription>Cập nhật thông tin họ tên và số điện thoại.</CardDescription>
          </CardHeader>
          <CardContent>
            {loadingProfile ? (
              <p className="text-sm text-slate-500">Đang tải dữ liệu...</p>
            ) : (
              <form className="space-y-4" onSubmit={onSubmitProfile}>
                <div className="space-y-2">
                  <Label htmlFor="hoTen">Họ tên</Label>
                  <Input
                    id="hoTen"
                    {...profileForm.register("hoTen", {
                      required: "Họ tên là bắt buộc",
                      minLength: { value: 2, message: "Họ tên tối thiểu 2 ký tự" },
                    })}
                  />
                  {profileForm.formState.errors.hoTen && (
                    <p className="text-sm text-red-600">
                      {profileForm.formState.errors.hoTen.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="soDienThoai">Số điện thoại</Label>
                  <Input
                    id="soDienThoai"
                    {...profileForm.register("soDienThoai", {
                      required: "Số điện thoại là bắt buộc",
                      pattern: {
                        value: /^[0-9+\s()-]{8,20}$/,
                        message: "Số điện thoại không hợp lệ",
                      },
                    })}
                  />
                  {profileForm.formState.errors.soDienThoai && (
                    <p className="text-sm text-red-600">
                      {profileForm.formState.errors.soDienThoai.message}
                    </p>
                  )}
                </div>

                {profileError && <p className="text-sm text-red-600">{profileError}</p>}
                {profileMessage && <p className="text-sm text-emerald-600">{profileMessage}</p>}

                <Button type="submit" disabled={profileForm.formState.isSubmitting}>
                  {profileForm.formState.isSubmitting ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-2xl">
              <LockKeyhole className="h-6 w-6" />
              Đổi mật khẩu
            </CardTitle>
            <CardDescription>Đổi mật khẩu để tăng bảo mật tài khoản.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={onSubmitPassword}>
              <div className="space-y-2">
                <Label htmlFor="matKhauCu">Mật khẩu cũ</Label>
                <Input
                  id="matKhauCu"
                  type="password"
                  {...passwordForm.register("matKhauCu", {
                    required: "Mật khẩu cũ là bắt buộc",
                  })}
                />
                {passwordForm.formState.errors.matKhauCu && (
                  <p className="text-sm text-red-600">
                    {passwordForm.formState.errors.matKhauCu.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="matKhauMoi">Mật khẩu mới</Label>
                <Input
                  id="matKhauMoi"
                  type="password"
                  {...passwordForm.register("matKhauMoi", {
                    required: "Mật khẩu mới là bắt buộc",
                    minLength: { value: 6, message: "Mật khẩu tối thiểu 6 ký tự" },
                  })}
                />
                {passwordForm.formState.errors.matKhauMoi && (
                  <p className="text-sm text-red-600">
                    {passwordForm.formState.errors.matKhauMoi.message}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="xacNhanMatKhauMoi">Xác nhận mật khẩu mới</Label>
                <Input
                  id="xacNhanMatKhauMoi"
                  type="password"
                  {...passwordForm.register("xacNhanMatKhauMoi", {
                    required: "Vui lòng xác nhận mật khẩu mới",
                  })}
                />
                {passwordForm.formState.errors.xacNhanMatKhauMoi && (
                  <p className="text-sm text-red-600">
                    {passwordForm.formState.errors.xacNhanMatKhauMoi.message}
                  </p>
                )}
              </div>

              {passwordError && <p className="text-sm text-red-600">{passwordError}</p>}
              {passwordMessage && <p className="text-sm text-emerald-600">{passwordMessage}</p>}

              <Button type="submit" disabled={passwordForm.formState.isSubmitting}>
                {passwordForm.formState.isSubmitting ? "Đang cập nhật..." : "Đổi mật khẩu"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
