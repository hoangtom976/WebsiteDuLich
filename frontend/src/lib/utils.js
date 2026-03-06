import { clsx } from "clsx";
import { twMerge } from "tailwind-merge"

export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export function formatDuration(days) {
  if (!days || isNaN(days)) return "0 ngày";
  const numDays = Number(days);
  if (numDays <= 1) return `${numDays} ngày`;
  return `${numDays} ngày ${numDays - 1} đêm`;
}

export function formatPrice(price) {
  if (price === undefined || price === null) return "0 ₫";
  let actualPrice = Number(price);
  if (actualPrice < 10000) {
    actualPrice *= 1000000;
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(actualPrice);
}
