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
import { sendRegistrationOtp, verifyRegistrationOtp } from "@/services/authService";

export default function RegisterForm() {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [savedData, setSavedData] = useState(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm();

  // For Step 2
  const [otp, setOtp] = useState("");
  const [isVerifying, setIsVerifying] = useState(false);

  const password = watch("matKhau", "");

  const onStep1Submit = async (data) => {
    setError("");
    setSuccess("");
    try {
      const email = (data.email || "").trim().toLowerCase();
      const { confirmPassword, ...userData } = { ...data, email };
      setSavedData(userData);

      const message = await sendRegistrationOtp(email);
      setSuccess(message || "Đã gửi mã xác thực đến email của bạn.");
      setStep(2);
    } catch (err) {
      setError(err.message || "Đã có lỗi xảy ra khi gửi OTP, vui lòng thử lại.");
    }
  };

  const onStep2Submit = async (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) {
      setError("Vui lòng nhập đủ 6 số mã xác thực (OTP).");
      return;
    }

    setError("");
    setIsVerifying(true);
    try {
      const message = await verifyRegistrationOtp(otp, savedData);
      setSuccess(message + " Bạn sẽ được chuyển đến trang đăng nhập sau 3 giây.");

      setTimeout(() => {
        router.push("/dang-nhap");
      }, 3000);
    } catch (err) {
      setError(err.message || "Xác thực thất bại, vui lòng kiểm tra lại mã OTP.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-150px)] bg-gray-50 py-12">
      <Card className="mx-auto max-w-sm w-full">
        <CardHeader>
          <CardTitle className="text-2xl">
            {step === 1 ? "Tạo tài khoản" : "Nhập mã xác thực"}
          </CardTitle>
          <CardDescription>
            {step === 1
              ? "Nhập thông tin của bạn để bắt đầu khám phá"
              : `Mã xác thực đã được gửi tới email ${savedData?.email}`
            }
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === 1 && (
            <form onSubmit={handleSubmit(onStep1Submit)} className="grid gap-4">
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
                <Label htmlFor="soDienThoai">Số điện thoại</Label>
                <Input
                  id="soDienThoai"
                  type="tel"
                  {...register("soDienThoai", { required: "Số điện thoại là bắt buộc" })}
                />
                {errors.soDienThoai && (
                  <p className="text-sm font-medium text-destructive">
                    {errors.soDienThoai.message}
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
                {isSubmitting ? "Đang gửi mã..." : "Nhận mã OTP"}
              </Button>
              <div className="mt-4 text-center text-sm">
                Đã có tài khoản?{" "}
                <Link href="/dang-nhap" className="underline">
                  Đăng nhập
                </Link>
              </div>
            </form>
          )}

          {step === 2 && (
            <form onSubmit={onStep2Submit} className="grid gap-4">
              <div className="grid gap-2 text-center">
                <Label htmlFor="otp">Nhập mã OTP 6 số</Label>
                <Input
                  id="otp"
                  type="text"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="text-center text-xl tracking-widest"
                  placeholder="------"
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-sm font-medium text-destructive text-center">{error}</p>
              )}
              {success && (
                <p className="text-sm font-medium text-green-600 text-center">{success}</p>
              )}

              <Button type="submit" className="w-full" disabled={isVerifying || otp.length < 6}>
                {isVerifying ? "Đang xác thực..." : "Xác nhận & Đăng ký"}
              </Button>

              <div className="mt-4 text-center text-sm">
                <button
                  type="button"
                  onClick={() => { setStep(1); setError(""); setSuccess(""); }}
                  className="underline text-blue-600"
                >
                  Quay lại để sửa thông tin
                </button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
