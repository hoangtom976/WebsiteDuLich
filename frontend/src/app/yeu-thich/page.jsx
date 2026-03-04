"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import TourCard from "@/components/shared/TourCard";
import { getFavoriteTours } from "@/services/tourService";

export default function FavoriteToursPage() {
  const [favoriteTours, setFavoriteTours] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const fetchFavorites = async () => {
      const token = localStorage.getItem("accessToken");
      if (!token) {
        router.push("/dang-nhap?redirect=/yeu-thich");
        return;
      }

      try {
        const tours = await getFavoriteTours();
        setFavoriteTours(tours || []);
      } catch (err) {
        console.error("Failed to fetch favorite tours:", err);
        setError("Không thể tải danh sách yêu thích. Vui lòng thử lại.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchFavorites();
  }, [router]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <p className="text-lg">Đang tải danh sách tour yêu thích của bạn...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-20 text-center text-red-600">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)]">
      <div className="container mx-auto px-6 lg:px-8 py-16 sm:py-20">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 mb-12">
          Tour Yêu Thích
        </h1>

        {favoriteTours.length === 0 ? (
          <div className="text-center py-20 border-2 border-dashed rounded-lg bg-white">
            <Heart className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-4 text-lg font-semibold text-gray-900">
              Danh sách trống
            </h3>
            <p className="mt-1 text-gray-500">
              Bạn chưa có tour yêu thích nào.
            </p>
            <Button asChild className="mt-6">
              <Link href="/tours">Khám phá ngay</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {favoriteTours.map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
