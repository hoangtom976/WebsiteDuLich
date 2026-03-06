"use client";

import { usePathname } from "next/navigation";

export default function MainLayout({ children }) {
  const pathname = usePathname();

  const isHomePage = pathname === "/";
  const isAdminPage = pathname?.startsWith("/dashboard");

  if (isHomePage || isAdminPage) {
    return <>{children}</>;
  }

  return (
    <main className="pt-[var(--header-height)]">
      <div className="mx-auto w-full max-w-[1400px] px-4 lg:px-6">{children}</div>
    </main>
  );
}
