"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";

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
import { register as registerService } from "@/services/authService";

export default function RegisterForm() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  const password = watch("matKhau", "");

  const onSubmit = async (data) => {
    setError("");
    setSuccess("");
    try {
      // Xóa confirmPassword trước khi gửi đi
      const { confirmPassword, ...userData } = data;
      const message = await registerService(userData);
      setSuccess(
        message + " Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây.",
      );

      // Chuyển hướng đến trang đăng nhập sau 3 giây
      setTimeout(() => {
        router.push("/dang-nhap");
      }, 3000);
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra, vui lòng thử lại.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] bg-gray-50 py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">Tạo tài khoản</CardTitle>
          <CardDescription>
            Nhập thông tin của bạn để bắt đầu khám phá
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="hoTen">Họ và tên</Label>
              <Input
                id="hoTen"
                {...register("hoTen", { required: "Họ và tên là bắt buộc" })}
              />
              {errors.hoTen && (
                <p className="text-sm font-medium text-destructive">
                  {errors.hoTen.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                {...register("email", {
                  required: "Email là bắt buộc",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Email không hợp lệ",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm font-medium text-destructive">
                  {errors.email.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="matKhau">Mật khẩu</Label>
              <Input
                id="matKhau"
                type="password"
                {...register("matKhau", {
                  required: "Mật khẩu là bắt buộc",
                  minLength: {
                    value: 6,
                    message: "Mật khẩu phải có ít nhất 6 ký tự",
                  },
                })}
              />
              {errors.matKhau && (
                <p className="text-sm font-medium text-destructive">
                  {errors.matKhau.message}
                </p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="confirmPassword">Xác nhận mật khẩu</Label>
              <Input
                id="confirmPassword"
                type="password"
                {...register("confirmPassword", {
                  validate: (value) =>
                    value === password || "Mật khẩu không khớp",
                })}
              />
              {errors.confirmPassword && (
                <p className="text-sm font-medium text-destructive">
                  {errors.confirmPassword.message}
                </p>
              )}
            </div>
            {error && (
              <p className="text-sm font-medium text-destructive">{error}</p>
            )}
            {success && (
              <p className="text-sm font-medium text-green-600">{success}</p>
            )}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Đăng ký"}
            </Button>
            <div className="mt-4 text-center text-sm">
              Đã có tài khoản?{" "}
              <Link href="/dang-nhap" className="underline">
                Đăng nhập
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
