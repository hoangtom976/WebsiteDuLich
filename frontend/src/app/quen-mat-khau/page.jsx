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
  const [step, setStep] = useState(1); // 1: Nhập email, 2: Nhập mật khẩu mới
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resetToken, setResetToken] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const newPassword = watch("matKhauMoi", "");

  const handleRequestToken = async (data) => {
    setError("");
    setSuccess("");
    try {
      const message = await forgotPassword(data.email);
      // Trích xuất token từ message trả về để test
      const token = message.split(": ")[1];
      setResetToken(token);
      setSuccess("Yêu cầu thành công! Vui lòng kiểm tra email để lấy token.");
      setStep(2); // Chuyển sang bước 2
    } catch (err) {
      setError(err.message || "Email không tồn tại trong hệ thống.");
    }
  };

  const handleResetPassword = async (data) => {
    setError("");
    setSuccess("");
    try {
      const message = await resetPassword(data.token, data.matKhauMoi);
      setSuccess(
        message + " Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây.",
      );
      setTimeout(() => {
        router.push("/dang-nhap");
      }, 3000);
    } catch (err) {
      setError(err.message || "Token không hợp lệ hoặc đã hết hạn.");
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
                <Button
                  type="submit"
                  className="w-full"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Đang gửi..." : "Gửi yêu cầu"}
                </Button>
              </form>
            </CardContent>
          </>
        ) : (
          <>
            <CardHeader>
              <CardTitle className="text-2xl">Đặt lại mật khẩu</CardTitle>
              <CardDescription>
                Nhập token bạn nhận được và mật khẩu mới.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={handleSubmit(handleResetPassword)}
                className="grid gap-4"
              >
                <div className="grid gap-2">
                  <Label htmlFor="token">Token</Label>
                  <Input
                    id="token"
                    defaultValue={resetToken} // Tự điền token giả
                    {...register("token", { required: "Token là bắt buộc" })}
                  />
                  {errors.token && (
                    <p className="text-sm font-medium text-destructive">
                      {errors.token.message}
                    </p>
                  )}
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="matKhauMoi">Mật khẩu mới</Label>
                  <Input
                    id="matKhauMoi"
                    type="password"
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
                  {isSubmitting ? "Đang xử lý..." : "Đặt lại mật khẩu"}
                </Button>
              </form>
            </CardContent>
          </>
        )}
      </Card>
    </div>
  );
}
