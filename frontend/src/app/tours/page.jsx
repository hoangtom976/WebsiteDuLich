"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Search } from "lucide-react";
import TourCard from "@/components/shared/TourCard";
import { getAllTours } from "@/services/tourService";
import { getAllCategories } from "@/services/categoryService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";

export default function ToursPage() {
  const searchParams = useSearchParams();
  const [allTours, setAllTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([0, 10000000]);

  useEffect(() => {
    async function fetchData() {
      const toursData = await getAllTours();
      const categoriesData = await getAllCategories();
      setAllTours(toursData);
      setFilteredTours(toursData);
      setCategories(categoriesData);
      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    let tempTours = [...allTours];

    if (searchTerm) {
      tempTours = tempTours.filter((tour) =>
        tour.tenTour.toLowerCase().includes(searchTerm.toLowerCase()),
      );
    }

    if (selectedCategory !== "all") {
      tempTours = tempTours.filter(
        (tour) => tour.danhMucId === parseInt(selectedCategory),
      );
    }

    tempTours = tempTours.filter(
      (tour) => tour.gia >= priceRange[0] && tour.gia <= priceRange[1],
    );

    setFilteredTours(tempTours);
  }, [searchTerm, selectedCategory, priceRange, allTours]);

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-var(--header-height))] items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="py-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[320px_minmax(0,1fr)]">
        <aside className="lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:self-start">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="mb-4">
              <h3 className="text-2xl font-bold text-slate-900">Bo loc</h3>
              <p className="mt-1 text-sm text-slate-500">
                Chon nhanh tour phu hop nhu cau cua ban.
              </p>
            </div>

            <Separator />

            <div className="mt-5 space-y-2">
              <Label htmlFor="search" className="text-base font-semibold">
                Tim kiem tour
              </Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  id="search"
                  placeholder="Nhap ten tour..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="mt-7">
              <Label className="text-base font-semibold">Danh muc</Label>
              <RadioGroup
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                className="mt-3 space-y-2"
              >
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="cat-all" />
                  <Label htmlFor="cat-all">Tat ca</Label>
                </div>
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center space-x-2">
                    <RadioGroupItem value={String(cat.id)} id={`cat-${cat.id}`} />
                    <Label htmlFor={`cat-${cat.id}`}>{cat.tenDanhMuc}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            <div className="mt-7">
              <Label className="text-base font-semibold">Khoang gia</Label>
              <Slider
                min={0}
                max={10000000}
                step={500000}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mt-4"
              />
              <div className="mt-3 flex items-center justify-between text-sm font-medium text-slate-600">
                <span>{new Intl.NumberFormat("vi-VN").format(priceRange[0])}d</span>
                <span>{new Intl.NumberFormat("vi-VN").format(priceRange[1])}d</span>
              </div>
            </div>
          </div>
        </aside>

        <section>
          <h2 className="mb-5 text-4xl font-bold text-slate-900">
            {filteredTours.length} tour duoc tim thay
          </h2>
          {filteredTours.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
              {filteredTours.map((tour) => (
                <TourCard key={tour.id} tour={tour} />
              ))}
            </div>
          ) : (
            <div className="rounded-xl border bg-white py-14 text-center text-slate-600">
              Khong tim thay tour nao phu hop voi tieu chi cua ban.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
