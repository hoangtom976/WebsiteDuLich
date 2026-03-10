"use client";

import { useEffect, useState } from "react";
import { Heart, MapPin, Search, Loader2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getDanhSachYeuThich } from "@/services/yeuThichService";
import TourCard from "@/components/shared/TourCard";
import Link from "next/link";

export default function WishlistPage() {
  const [favorites, setFavorites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    fetchFavorites();
  }, []);

  const fetchFavorites = async () => {
    try {
      const data = await getDanhSachYeuThich();
      // Đảm bảo mỗi tour trong danh sách đều có daYeuThich = true
      const normalizedData = data.map(t => ({ ...t, daYeuThich: true }));
      setFavorites(normalizedData);
    } catch (error) {
      console.error("Lỗi khi tải danh sách yêu thích:", error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFavorites = favorites.filter(t =>
    t.tenTour.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.tenDiaDiem?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-slate-50 py-12">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mb-12 flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="mb-2 flex items-center gap-2 text-rose-600">
              <Heart className="h-5 w-5 fill-current" />
              <span className="text-sm font-bold uppercase tracking-wider">Danh sách của bạn</span>
            </div>
            <h1 className="text-4xl font-black text-slate-900 md:text-5xl">Chuyến đi yêu thích</h1>
            <p className="mt-2 text-slate-500">Lưu giữ những hành trình mơ ước của bạn tại đây.</p>
          </div>

          <div className="relative w-full max-w-md">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm trong danh sách yêu thích..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-12 w-full rounded-2xl border-none bg-white pl-12 pr-4 shadow-sm outline-none ring-rose-500/20 transition focus:ring-4"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex h-64 items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-rose-500" />
          </div>
        ) : favorites.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-[3rem] border-2 border-dashed border-slate-200 bg-white/50 py-24 text-center">
            <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-rose-50 text-rose-200">
              <Heart className="h-10 w-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Danh sách trống</h3>
            <p className="mt-2 max-w-sm text-slate-500">
              Bạn chưa bày tỏ sự yêu thích với tour nào. Hãy khám phá và lưu lại những tour bạn thích nhé!
            </p>
            <Button asChild className="mt-8 h-12 rounded-full bg-blue-600 px-8 font-bold hover:bg-blue-700">
              <Link href="/tours">Khám phá Tour</Link>
            </Button>
          </div>
        ) : filteredFavorites.length === 0 ? (
          <div className="py-20 text-center">
            <p className="text-lg text-slate-500">Không tìm thấy tour nào khớp với từ khóa "{searchQuery}"</p>
            <Button variant="ghost" className="mt-4 text-rose-600 hover:text-rose-700" onClick={() => setSearchQuery("")}>
              Xóa tìm kiếm
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredFavorites.map((tour) => (
              <div key={tour.id} className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                <TourCard tour={tour} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
