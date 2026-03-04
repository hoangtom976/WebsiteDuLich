"use client";

import { useState } from "react";
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

export default function LoginForm() {
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
      const response = await login({
        email: data.email,
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
      setError(err.message || "Tai khoan hoac mat khau khong chinh xac.");
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-150px)] items-center justify-center bg-gray-50">
      <Card className="mx-auto w-full max-w-sm">
        <CardHeader>
          <CardTitle className="text-2xl">Dang nhap</CardTitle>
          <CardDescription>Nhap email va mat khau de tiep tuc</CardDescription>
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
                  required: "Email la bat buoc",
                  pattern: {
                    value: /^\S+@\S+$/i,
                    message: "Email khong hop le",
                  },
                })}
              />
              {errors.email && (
                <p className="text-sm font-medium text-destructive">{errors.email.message}</p>
              )}
            </div>
            <div className="grid gap-2">
              <div className="flex items-center">
                <Label htmlFor="password">Mat khau</Label>
                <Link href="/quen-mat-khau" className="ml-auto inline-block text-sm underline">
                  Quen mat khau?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                {...register("password", { required: "Mat khau la bat buoc" })}
              />
              {errors.password && (
                <p className="text-sm font-medium text-destructive">{errors.password.message}</p>
              )}
            </div>
            {error && <p className="text-sm font-medium text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "Dang xu ly..." : "Dang nhap"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
