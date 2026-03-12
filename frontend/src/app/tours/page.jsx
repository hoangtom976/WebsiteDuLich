"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { Loader2, Search, MapPin, Clock, Star, DollarSign, RotateCcw, Calendar } from "lucide-react";
import TourCard from "@/components/shared/TourCard";
import { getAllTours } from "@/services/tourService";
import { getAllCategories } from "@/services/categoryService";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Slider } from "@/components/ui/slider";
import { Separator } from "@/components/ui/separator";
import { formatPrice } from "@/lib/utils";
import FeaturedToursBanner from "@/components/tours/FeaturedToursBanner";

const getActualTourPrice = (price) => {
  const p = Number(price || 0);
  return p < 10000 ? p * 1000000 : p;
};

export default function ToursPage() {
  const searchParams = useSearchParams();
  const [allTours, setAllTours] = useState([]);
  const [filteredTours, setFilteredTours] = useState([]);
  const [featuredTours, setFeaturedTours] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState(searchParams.get("q") || "");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [priceRange, setPriceRange] = useState([
    Number(searchParams.get("minPrice") || 500000), 
    Number(searchParams.get("maxPrice") || 50000000)
  ]);
  const [durationFilter, setDurationFilter] = useState("all");
  const [ratingFilter, setRatingFilter] = useState(0);
  const [departureDate, setDepartureDate] = useState(searchParams.get("departureDate") || "");

  const resetFilters = () => {
    setSearchTerm("");
    setSelectedCategory("all");
    setPriceRange([500000, 50000000]);
    setDurationFilter("all");
    setRatingFilter(0);
    setDepartureDate("");
  };

  useEffect(() => {
    async function fetchData() {
      const toursData = await getAllTours();
      const categoriesData = await getAllCategories();

      // Chọn 3 tour ngẫu nhiên cho banner
      if (toursData && toursData.length >= 3) {
        const shuffled = [...toursData].sort(() => 0.5 - Math.random());
        setFeaturedTours(shuffled.slice(0, 3));
      }

      setAllTours(toursData);
      setFilteredTours(toursData);
      setCategories(categoriesData);

      // Tự động nhận diện Loại tour (category) từ URL
      const catParam = searchParams.get("category");
      if (catParam && categoriesData) {
        const matchedCat = categoriesData.find(c => 
          c.tenDanhMuc.toLowerCase().includes(catParam.toLowerCase())
        );
        if (matchedCat) {
          setSelectedCategory(String(matchedCat.id));
        }
      }

      setLoading(false);
    }
    fetchData();
  }, []);

  useEffect(() => {
    let tempTours = [...allTours];

    if (searchTerm) {
      tempTours = tempTours.filter((tour) =>
        tour.tenTour.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (tour.tenDiaDiem && tour.tenDiaDiem.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (departureDate) {
      tempTours = tempTours.filter((tour) => 
        tour.cacNgayKhoiHanh && tour.cacNgayKhoiHanh.includes(departureDate)
      );
    }

    if (selectedCategory !== "all") {
      tempTours = tempTours.filter(
        (tour) => tour.danhMucId === parseInt(selectedCategory),
      );
    }

    tempTours = tempTours.filter((tour) => {
      const actualPrice = getActualTourPrice(tour.gia);
      return actualPrice >= priceRange[0] && actualPrice <= priceRange[1];
    });

    if (durationFilter !== "all") {
      tempTours = tempTours.filter((tour) => {
        if (durationFilter === "1-2") return tour.soNgay <= 2;
        if (durationFilter === "3-4") return tour.soNgay >= 3 && tour.soNgay <= 4;
        if (durationFilter === "5+") return tour.soNgay >= 5;
        return true;
      });
    }

    if (ratingFilter > 0) {
      tempTours = tempTours.filter((tour) => (tour.soSaoTrungBinh || 0) >= ratingFilter);
    }

    setFilteredTours(tempTours);
  }, [searchTerm, selectedCategory, priceRange, durationFilter, ratingFilter, departureDate, allTours]);

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
        <aside className="lg:sticky lg:top-[calc(var(--header-height)+1rem)] lg:self-start max-h-[calc(100vh-var(--header-height)-2rem)] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-slate-200 scrollbar-track-transparent hover:scrollbar-thumb-slate-300">
          <div className="rounded-xl border bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-slate-900">Bộ lọc</h3>
              <button
                onClick={resetFilters}
                className="text-xs font-medium text-blue-600 hover:text-blue-800 flex items-center gap-1"
              >
                <RotateCcw className="h-3 w-3" />
                Xóa bộ lọc
              </button>
            </div>

            <Separator />

            {/* Tìm kiếm */}
            <div className="mt-5 space-y-2">
              <Label htmlFor="search" className="text-sm font-bold flex items-center gap-2 text-slate-700">
                <Search className="h-4 w-4 text-blue-500" />
                Tìm kiếm tour
              </Label>
              <div className="relative">
                <Input
                  id="search"
                  placeholder="Nhập tên tour..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="rounded-lg border-slate-200 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Ngày khởi hành */}
            <div className="mt-7 space-y-2">
              <Label htmlFor="dateSearch" className="text-sm font-bold flex items-center gap-2 text-slate-700">
                <Calendar className="h-4 w-4 text-purple-500" />
                Ngày khởi hành
              </Label>
              <div className="relative">
                <Input
                  id="dateSearch"
                  type="date"
                  value={departureDate}
                  onChange={(e) => setDepartureDate(e.target.value)}
                  className="rounded-lg border-slate-200 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Danh mục / Điểm đến */}
            <div className="mt-7">
              <Label className="text-sm font-bold flex items-center gap-2 text-slate-700">
                <MapPin className="h-4 w-4 text-red-500" />
                Điểm đến
              </Label>
              <RadioGroup
                value={selectedCategory}
                onValueChange={setSelectedCategory}
                className="mt-3 space-y-1"
              >
                <div className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value="all" id="cat-all" />
                  <Label htmlFor="cat-all" className="text-sm font-medium cursor-pointer">Tất cả điểm đến</Label>
                </div>
                {categories.map((cat) => (
                  <div key={cat.id} className="flex items-center space-x-2 py-1">
                    <RadioGroupItem value={String(cat.id)} id={`cat-${cat.id}`} />
                    <Label htmlFor={`cat-${cat.id}`} className="text-sm font-medium cursor-pointer">{cat.tenDanhMuc}</Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Thời gian tour */}
            <div className="mt-7">
              <Label className="text-sm font-bold flex items-center gap-2 text-slate-700">
                <Clock className="h-4 w-4 text-emerald-500" />
                Thời gian tour
              </Label>
              <RadioGroup
                value={durationFilter}
                onValueChange={setDurationFilter}
                className="mt-3 space-y-1"
              >
                <div className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value="all" id="dur-all" />
                  <Label htmlFor="dur-all" className="text-sm font-medium cursor-pointer">Tất cả thời gian</Label>
                </div>
                <div className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value="1-2" id="dur-1-2" />
                  <Label htmlFor="dur-1-2" className="text-sm font-medium cursor-pointer">1 - 2 ngày</Label>
                </div>
                <div className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value="3-4" id="dur-3-4" />
                  <Label htmlFor="dur-3-4" className="text-sm font-medium cursor-pointer">3 - 4 ngày</Label>
                </div>
                <div className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value="5+" id="dur-5+" />
                  <Label htmlFor="dur-5+" className="text-sm font-medium cursor-pointer">5+ ngày</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Khoảng giá */}
            <div className="mt-7">
              <Label className="text-sm font-bold flex items-center gap-2 text-slate-700">
                <DollarSign className="h-4 w-4 text-orange-500" />
                Khoảng giá
              </Label>
              <Slider
                min={500000}
                max={50000000}
                step={500000}
                value={priceRange}
                onValueChange={setPriceRange}
                className="mt-5"
              />
              <div className="mt-3 flex items-center justify-between text-[11px] font-bold text-slate-500 bg-slate-50 p-2 rounded-lg border border-dashed border-slate-200">
                <span>{formatPrice(priceRange[0])}</span>
                <span>-</span>
                <span>{formatPrice(priceRange[1])}</span>
              </div>
            </div>

            {/* Đánh giá */}
            <div className="mt-7">
              <Label className="text-sm font-bold flex items-center gap-2 text-slate-700">
                <Star className="h-4 w-4 text-amber-500" />
                Đánh giá
              </Label>
              <RadioGroup
                value={String(ratingFilter)}
                onValueChange={(val) => setRatingFilter(Number(val))}
                className="mt-3 space-y-1"
              >
                <div className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value="0" id="rate-all" />
                  <Label htmlFor="rate-all" className="text-sm font-medium cursor-pointer">Tất cả đánh giá</Label>
                </div>
                <div className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value="5" id="rate-5" />
                  <Label htmlFor="rate-5" className="text-sm font-medium cursor-pointer flex items-center gap-1">
                    <div className="flex">
                      {[1, 2, 3, 4, 5].map(i => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                    </div>
                    <span>trở lên</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 py-1">
                  <RadioGroupItem value="4" id="rate-4" />
                  <Label htmlFor="rate-4" className="text-sm font-medium cursor-pointer flex items-center gap-1">
                    <div className="flex">
                      {[1, 2, 3, 4].map(i => <Star key={i} className="h-3 w-3 fill-amber-400 text-amber-400" />)}
                      <Star className="h-3 w-3 text-slate-200" />
                    </div>
                    <span>trở lên</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>
          </div>
        </aside>

        <section>
          {/* Banner 3 Tour nổi bật ngẫu nhiên */}
          <FeaturedToursBanner tours={featuredTours} />

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
