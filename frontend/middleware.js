import { NextResponse } from "next/server";

const AUTH_PAGES = ["/dang-nhap", "/dang-ky"];
const CUSTOMER_PROTECTED_PREFIXES = ["/yeu-thich", "/ho-so", "/lich-su-dat-tour"];
const ADMIN_ONLY_PREFIXES = ["/dashboard/users", "/dashboard/settings"];

function base64UrlDecode(input) {
  const base64 = input.replace(/-/g, "+").replace(/_/g, "/");
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);
  return atob(base64 + padding);
}

function parseTokenPayload(token) {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;
    const json = base64UrlDecode(parts[1]);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

function normalizeRole(role) {
  if (!role || typeof role !== "string") return null;
  const upper = role.trim().toUpperCase();
  if (!upper) return null;
  return upper.startsWith("ROLE_") ? upper : `ROLE_${upper}`;
}

function extractRoles(payload) {
  const raw = payload?.roles ?? payload?.authorities ?? payload?.vaiTro ?? [];
  const list = Array.isArray(raw) ? raw : [raw];
  return list.map(normalizeRole).filter(Boolean);
}

function startsWithAny(pathname, prefixes) {
  return prefixes.some((prefix) => pathname.startsWith(prefix));
}

function getDefaultPathByRoles(roles) {
  if (roles.includes("ROLE_ADMIN") || roles.includes("ROLE_STAFF")) {
    return "/dashboard";
  }
  return "/";
}

export function middleware(request) {
  const { pathname } = request.nextUrl;
  const token = request.cookies.get("accessToken")?.value;

  const isAdminRoute = pathname.startsWith("/dashboard");
  const isAuthPage = AUTH_PAGES.includes(pathname);
  const isCustomerProtected = startsWithAny(pathname, CUSTOMER_PROTECTED_PREFIXES);
  const isAdminOnlyPage = startsWithAny(pathname, ADMIN_ONLY_PREFIXES);

  if (!token) {
    if (isAdminRoute || isCustomerProtected) {
      const loginUrl = new URL("/dang-nhap", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
    return NextResponse.next();
  }

  const payload = parseTokenPayload(token);
  const roles = extractRoles(payload);
  const isAdmin = roles.includes("ROLE_ADMIN");
  const isStaff = roles.includes("ROLE_STAFF");
  const isUser = roles.includes("ROLE_USER");

  if (isAuthPage) {
    return NextResponse.redirect(new URL(getDefaultPathByRoles(roles), request.url));
  }

  if (isAdminRoute) {
    if (!(isAdmin || isStaff)) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    if (isAdminOnlyPage && !isAdmin) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

  if (isCustomerProtected && !isUser) {
    return NextResponse.redirect(new URL(getDefaultPathByRoles(roles), request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};

