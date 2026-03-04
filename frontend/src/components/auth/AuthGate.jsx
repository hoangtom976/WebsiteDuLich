"use client";

import { useEffect, useMemo } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getAuthState, getDefaultPathByRoles, setAuthToken } from "@/lib/auth-client";

const AUTH_PAGES = ["/dang-nhap", "/dang-ky"];
const AUTH_REQUIRED_PREFIXES = ["/ho-so"];
const CUSTOMER_PROTECTED_PREFIXES = ["/yeu-thich", "/lich-su-dat-tour"];
const ADMIN_ONLY_PREFIXES = ["/dashboard/users", "/dashboard/settings"];

function startsWithAny(pathname, prefixes) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

export default function AuthGate({ children }) {
  const pathname = usePathname() || "/";
  const router = useRouter();

  const decision = useMemo(() => {
    const auth = getAuthState();

    const isAdminRoute = pathname.startsWith("/dashboard");
    const isAuthRequiredRoute = startsWithAny(pathname, AUTH_REQUIRED_PREFIXES);
    const isCustomerProtected = startsWithAny(pathname, CUSTOMER_PROTECTED_PREFIXES);
    const isAuthPage = AUTH_PAGES.includes(pathname);
    const isAdminOnlyPage = startsWithAny(pathname, ADMIN_ONLY_PREFIXES);

    if (!auth.isLoggedIn) {
      if (isAdminRoute || isAuthRequiredRoute || isCustomerProtected) {
        return {
          allow: false,
          redirectTo: `/dang-nhap?redirect=${encodeURIComponent(pathname)}`,
          syncToken: null,
        };
      }
      return { allow: true, redirectTo: null, syncToken: null };
    }

    if (isAuthPage) {
      return {
        allow: false,
        redirectTo: getDefaultPathByRoles(auth.roles),
        syncToken: auth.token,
      };
    }

    if (isAdminRoute) {
      if (!(auth.isAdmin || auth.isStaff)) {
        return { allow: false, redirectTo: "/", syncToken: auth.token };
      }
      if (isAdminOnlyPage && !auth.isAdmin) {
        return { allow: false, redirectTo: "/dashboard", syncToken: auth.token };
      }
      return { allow: true, redirectTo: null, syncToken: auth.token };
    }

    if (isCustomerProtected && !auth.isUser) {
      return {
        allow: false,
        redirectTo: getDefaultPathByRoles(auth.roles),
        syncToken: auth.token,
      };
    }

    return { allow: true, redirectTo: null, syncToken: auth.token };
  }, [pathname]);

  useEffect(() => {
    if (decision.syncToken) {
      setAuthToken(decision.syncToken);
    }
    if (decision.redirectTo) {
      router.replace(decision.redirectTo);
    }
  }, [decision, router]);

  if (!decision.allow) return null;
  return children;
}
