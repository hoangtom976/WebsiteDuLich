"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  ChevronDown,
  LayoutGrid,
  MapPin,
  Search,
} from "lucide-react";

export default function HeroSearch() {
  const [filters, setFilters] = useState({
    destination: "",
    departureDate: "",
    budget: "",
    category: "",
  });
  const router = useRouter();

  const handleInputChange = (field, value) => {
    setFilters((prev) => ({ ...prev, [field]: value }));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const params = new URLSearchParams();

    if (filters.destination.trim()) params.set("q", filters.destination.trim());
    if (filters.departureDate)
      params.set("departureDate", filters.departureDate);
    if (filters.budget.trim()) params.set("budget", filters.budget.trim());
    if (filters.category.trim())
      params.set("category", filters.category.trim());

    const query = params.toString();
    router.push(query ? `/tours?${query}` : "/tours");
  };

  const quickDestinations = ["Hạ Long", "Đà Nẵng", "Phú Quốc", "Sapa"];

  return (
    <div className="w-full max-w-6xl animate-fade-in">
      <form
        onSubmit={handleSearch}
        className="rounded-[28px] border border-white/35 bg-white/18 p-3 shadow-[0_25px_90px_-20px_rgba(0,0,0,0.75)] ring-1 ring-white/25 backdrop-blur-2xl md:p-4"
      >
        <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2 xl:grid-cols-[1.4fr_1fr_1fr_1fr_auto]">
          <div className="rounded-2xl border border-slate-200/80 bg-white/92 px-4 py-3 text-left shadow-sm">
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <MapPin size={14} /> Diem den
            </label>
            <Input
              placeholder="Ban muon di dau?"
              className="h-8 border-0 bg-transparent p-0 text-black shadow-none focus-visible:ring-0"
              value={filters.destination}
              onChange={(e) => handleInputChange("destination", e.target.value)}
            />
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/92 px-4 py-3 text-left shadow-sm">
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <Calendar size={14} /> Ngay khoi hanh
            </label>
            <Input
              type="date"
              className="h-8 border-0 bg-transparent p-0 text-black shadow-none focus-visible:ring-0"
              value={filters.departureDate}
              onChange={(e) =>
                handleInputChange("departureDate", e.target.value)
              }
            />
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/92 px-4 py-3 text-left shadow-sm">
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <ChevronDown size={14} /> Ngan sach
            </label>
            <Input
              placeholder="VD: 3-5 trieu"
              className="h-8 border-0 bg-transparent p-0 text-black shadow-none placeholder:text-slate-500 focus-visible:ring-0"
              value={filters.budget}
              onChange={(e) => handleInputChange("budget", e.target.value)}
            />
          </div>

          <div className="rounded-2xl border border-slate-200/80 bg-white/92 px-4 py-3 text-left shadow-sm">
            <label className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-600">
              <LayoutGrid size={14} /> Loai tour
            </label>
            <Input
              placeholder="VD: Nghi duong"
              className="h-8 border-0 bg-transparent p-0 text-black shadow-none placeholder:text-slate-500 focus-visible:ring-0"
              value={filters.category}
              onChange={(e) => handleInputChange("category", e.target.value)}
            />
          </div>

          <Button
            type="submit"
            className="h-[66px] w-full rounded-2xl bg-amber-500 text-base font-bold text-slate-950 hover:bg-amber-400 xl:w-[180px]"
            aria-label="Tim kiem tour"
          >
            <Search className="mr-2 h-5 w-5" />
            Tim tour
          </Button>
        </div>
      </form>

      <div className="mt-3 flex flex-wrap items-center justify-center gap-2">
        {quickDestinations.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => handleInputChange("destination", item)}
            className="rounded-full border border-white/35 bg-white/15 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-white/25"
          >
            {item}
          </button>
        ))}
      </div>
    </div>
  );
}
