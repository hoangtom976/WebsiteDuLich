"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
import { forgotPassword, resetPassword } from "@/services/authService";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập mã OTP & mật khẩu mới
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const newPassword = watch("matKhauMoi", "");
  const [userEmail, setUserEmail] = useState("");

  const handleRequestToken = async (data) => {
    setError("");
    setSuccess("");
    try {
      const email = (data.email || "").trim().toLowerCase();
      const message = await forgotPassword(email);
      setUserEmail(email);
      setSuccess("Yêu cầu thành công! Vui lòng kiểm tra email để lấy mã OTP.");
      setStep(2);
    } catch (err) {
      setError(err.thongDiep || err.message || "Email không tồn tại trong hệ thống.");
    }
  };

  const handleResetPassword = async (data) => {
    setError("");
    setSuccess("");
    try {
      const message = await resetPassword(data.verification_code, data.matKhauMoi);
      setSuccess(
        message + " Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây.",
      );
      setTimeout(() => {
        router.push("/dang-nhap");
      }, 3000);
    } catch (err) {
      setError(err.thongDiep || err.message || "Mã OTP không hợp lệ hoặc đã hết hạn.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] bg-gray-50 py-12">
      <Card className="mx-auto max-w-sm w-full">
        {step === 1 ? (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Quên mật khẩu</CardTitle>
              <CardDescription>
                Nhập email của bạn để nhận hướng dẫn đặt lại mật khẩu.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(handleRequestToken)}
                className="grid gap-4"
              >
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    {...register("email", { required: "Email là bắt buộc" })}
                  />
                  {errors.email && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.email.message}
                    </p>
                  )}
                </div>
                {error && (
                  <p className="text-sm font-medium text-destructive">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="text-sm font-medium text-green-600">
                    {success}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
                </Button>
                <div className="mt-4 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => router.push("/dang-nhap")}
                    className="underline text-slate-600"
                  >
                    Quay lại đăng nhập
                  </button>
                </div>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl text-center">Đặt lại mật khẩu</CardTitle>
              <CardDescription className="text-center">
                Nhập mã OTP được gửi đến <span className="font-medium text-black block mt-1">{userEmail}</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(handleResetPassword)}
                className="grid gap-4"
              >
                <div className="grid gap-2">
                  {/* Dummy hidden field to intercept browser autofill */}
                  <input
                    type="text"
                    name="dummy_email"
                    style={{ display: "none" }}
                    tabIndex="-1"
                    autoComplete="username"
                  />
                  <input
                    type="password"
                    name="dummy_password"
                    style={{ display: "none" }}
                    tabIndex="-1"
                    autoComplete="new-password"
                  />
                  <Label htmlFor="otp-input" className="text-center">Mã OTP 6 số</Label>
                  <Input
                    id="otp-input"
                    {...register("verification_code", {
                      required: "Mã OTP là bắt buộc",
                      minLength: { value: 6, message: "Mã OTP phải có 6 chữ số" },
                      maxLength: { value: 6, message: "Mã OTP phải có 6 chữ số" }
                    })}
                    placeholder="------"
                    className="text-center text-2xl tracking-[0.5em] font-mono h-14"
                    maxLength={6}
                    autoComplete="off"
                    inputMode="numeric"
                    autoFocus
                  />
                  {errors.verification_code && (
                    <p className="text-sm font-medium text-destructive text-center">
                      {errors.verification_code.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="matKhauMoi">Mật khẩu mới</Label>
                  <Input
                    id="matKhauMoi"
                    type="password"
                    autoComplete="new-password"
                    {...register("matKhauMoi", {
                      required: "Mật khẩu mới là bắt buộc",
                      minLength: {
                        value: 6,
                        message: "Mật khẩu phải có ít nhất 6 ký tự",
                      },
                    })}
                  />
                  {errors.matKhauMoi && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.matKhauMoi.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="confirmNewPassword">
                    Xác nhận mật khẩu mới
                  </Label>
                  <Input
                    id="confirmNewPassword"
                    type="password"
                    autoComplete="new-password"
                    {...register("confirmNewPassword", {
                      validate: (value) =>
                        value === newPassword || "Mật khẩu không khớp",
                    })}
                  />
                  {errors.confirmNewPassword && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.confirmNewPassword.message}
                    </p>
                  )}
                </div>
                {error && (
                  <p className="text-sm font-medium text-destructive text-center">
                    {error}
                  </p>
                )}
                {success && (
                  <p className="text-sm font-medium text-green-600 text-center">
                    {success}
                  </p>
                )}
                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </Button>
                <div className="mt-4 text-center text-sm">
                  <button
                    type="button"
                    onClick={() => { setStep(1); setError(""); setSuccess(""); }}
                    className="underline text-blue-600 font-medium"
                  >
                    Không nhận được email? Gửi lại
                  </button>
                </div>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
