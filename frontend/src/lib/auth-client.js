"use client";

import { jwtDecode } from "jwt-decode";

const ONE_DAY_SECONDS = 60 * 60 * 24;
const PROFILE_NAME_KEY = "profileFullName";

function normalizeRole(role) {
  if (!role || typeof role !== "string") return null;
  const trimmed = role.trim().toUpperCase();
  if (!trimmed) return null;
  return trimmed.startsWith("ROLE_") ? trimmed : `ROLE_${trimmed}`;
}

export function decodeAccessToken(token) {
  if (!token) return null;
  try {
    return jwtDecode(token);
  } catch {
    return null;
  }
}

export function extractRoles(payload) {
  const rolesFromToken = payload?.roles ?? payload?.authorities ?? payload?.vaiTro ?? [];
  const list = Array.isArray(rolesFromToken) ? rolesFromToken : [rolesFromToken];
  return list.map(normalizeRole).filter(Boolean);
}

export function getAuthState() {
  if (typeof window === "undefined") {
    return { isLoggedIn: false, roles: [], payload: null, token: null };
  }
  const token = localStorage.getItem("accessToken");
  const payload = decodeAccessToken(token);
  const roles = extractRoles(payload);
  return {
    isLoggedIn: Boolean(token && payload),
    token,
    payload,
    roles,
    isAdmin: roles.includes("ROLE_ADMIN"),
    isStaff: roles.includes("ROLE_STAFF"),
    isUser: roles.includes("ROLE_USER"),
  };
}

export function setAuthToken(token) {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", token);
  document.cookie = `accessToken=${token}; Path=/; Max-Age=${ONE_DAY_SECONDS}; SameSite=Lax`;
}

export function clearAuthToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem(PROFILE_NAME_KEY);
  document.cookie =
    "accessToken=; Path=/; Expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
}

export function setProfileFullName(name) {
  if (typeof window === "undefined") return;
  const trimmed = (name || "").trim();
  if (!trimmed) return;
  localStorage.setItem(PROFILE_NAME_KEY, trimmed);
}

export function getProfileFullName() {
  if (typeof window === "undefined") return "";
  return localStorage.getItem(PROFILE_NAME_KEY) || "";
}

export function getDefaultPathByRoles(roles) {
  if (roles.includes("ROLE_ADMIN") || roles.includes("ROLE_STAFF")) {
    return "/dashboard";
  }
  return "/";
}
