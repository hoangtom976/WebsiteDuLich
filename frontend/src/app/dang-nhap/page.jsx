"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { useRouter, useSearchParams } from "next/navigation";

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
import { login } from "@/services/authService";
import {
  decodeAccessToken,
  extractRoles,
  getDefaultPathByRoles,
  setProfileFullName,
  setAuthToken,
} from "@/lib/auth-client";
import { getCurrentUserProfile } from "@/services/userService";

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    setError("");
    try {
      const email = (data.email || "").trim().toLowerCase();
      const response = await login({
        email,
        matKhau: data.password,
      });

      setAuthToken(response.accessToken);
      const responseName = (response?.hoTen || "").trim();
      if (responseName) {
        setProfileFullName(responseName);
      }

      const decoded = decodeAccessToken(response.accessToken);
      const tokenName = decoded?.hoTen?.trim?.() || "";
      if (tokenName) {
        setProfileFullName(tokenName);
      }

      try {
        const profile = await getCurrentUserProfile();
        const dbName = (profile?.ho_ten || profile?.hoTen || "").trim();
        if (dbName) setProfileFullName(dbName);
      } catch {
        // Keep token name fallback.
      }

      const roles = extractRoles(decoded);
      const redirectUrl = searchParams.get("redirect");

      if (roles.includes("ROLE_ADMIN") || roles.includes("ROLE_STAFF")) {
        router.push("/dashboard");
      } else if (roles.includes("ROLE_USER") && redirectUrl) {
        router.push(redirectUrl);
      } else {
        router.push(getDefaultPathByRoles(roles));
      }
    } catch (err) {
      setError(err.thongDiep || err.message || "Tài khoản hoặc mật khẩu không chính xác.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-gray-50">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Đăng nhập</CardTitle>
          <CardDescription>Nhập email và mật khẩu để tiếp tục</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="grid gap-4">
            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="m@example.com"
                {...register("email", {
                  required: "Email là bắt buộc",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Email không hợp lệ",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm font-medium text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mật khẩu</Label>
                <Link href="/quen-mat-khau" className="ml-auto inline-block text-sm underline">
                  Quên mật khẩu?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                {...register("password", { required: "Mật khẩu là bắt buộc" })}
              />
              {errors.password && (
                <p className="text-sm font-medium text-destructive">{errors.password.message}</p>
              )}
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Đang xử lý..." : "Đăng nhập"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense fallback={<div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-gray-50">Đang tải dữ liệu...</div>}>
      <LoginFormContent />
    </Suspense>
  );
}
