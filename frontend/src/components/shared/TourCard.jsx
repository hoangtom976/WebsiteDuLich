"use client";

import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin } from "lucide-react";

export default function TourCard({ tour }) {
  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(tour.gia);

  const fallbackImage = "https://via.placeholder.com/400x250?text=Viet+Tour";

  return (
    <Link href={`/tours/${tour.id}`}>
      <Card className="overflow-hidden transition-shadow duration-300 hover:shadow-lg">
        <img
          src={tour.hinhAnh || fallbackImage}
          alt={tour.tenTour}
          width={400}
          height={250}
          className="h-48 w-full object-cover"
          onError={(e) => {
            e.currentTarget.src = fallbackImage;
          }}
        />
        <CardContent className="p-4">
          <h3 className="mb-2 h-14 overflow-hidden text-lg font-semibold">
            {tour.tenTour}
          </h3>
          <div className="mb-2 flex items-center text-sm text-muted-foreground">
            <MapPin className="mr-2 h-4 w-4" /> {tour.tenDiaDiem}
          </div>
          <div className="mt-4 flex items-center justify-between">
            <span className="text-sm text-muted-foreground">{tour.soNgay} ngay</span>
            <span className="text-lg font-bold text-blue-600">{formattedPrice}</span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
