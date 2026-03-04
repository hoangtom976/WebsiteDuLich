import { getTourById } from "@/services/tourService";
import { notFound } from "next/navigation";
import { MapPin, Calendar, Users, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import TourReviews from "@/components/tours/TourReviews";
import BookingCard from "@/components/tours/BookingCard";

export default async function TourDetailPage({ params }) {
  const awaitedParams = await params;
  const tour = await getTourById(awaitedParams.id);

  if (!tour) {
    notFound();
  }

  const formattedPrice = new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(tour.gia);

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto px-4 py-12">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900">
            {tour.tenTour}
          </h1>
          <div className="mt-2 flex items-center gap-4 text-muted-foreground">
            <div className="flex items-center gap-1">
              <MapPin className="w-4 h-4" /> {tour.tenDiaDiem}
            </div>
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" /> {tour.soNgay} ngày
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Image Gallery & Details */}
          <div className="lg:col-span-2">
            <div className="mb-6">
              <img
                src={tour.hinhAnh}
                alt={tour.tenTour}
                className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-md"
              />
            </div>

            {/* Tabs for Description and Itinerary */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="description">Mô tả chi tiết</TabsTrigger>
                <TabsTrigger value="itinerary">Lịch trình</TabsTrigger>
              </TabsList>
              <TabsContent value="description" className="mt-4">
                <Card>
                  <CardContent className="p-6 text-base leading-relaxed">
                    {tour.moTaDai}
                  </CardContent>
                </Card>
              </TabsContent>
              <TabsContent value="itinerary" className="mt-4">
                <Card>
                  <CardContent className="p-6 space-y-6">
                    {tour.lichTrinh.map((item) => (
                      <div key={item.ngay} className="flex gap-4">
                        <div className="flex flex-col items-center">
                          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-500 text-white font-bold">
                            {item.ngay}
                          </div>
                          {item.ngay < tour.lichTrinh.length && (
                            <div className="w-px h-full bg-gray-300 mt-2"></div>
                          )}
                        </div>
                        <div>
                          <h4 className="font-semibold text-lg">
                            {item.tieuDe}
                          </h4>
                          <p className="mt-1 text-muted-foreground">
                            {item.moTa}
                          </p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {/* Reviews Section */}
            <TourReviews tourId={tour.id} />
          </div>

          {/* Right Column: Booking Card */}
          <aside className="lg:col-span-1">
            <BookingCard tour={tour} formattedPrice={formattedPrice} />
          </aside>
        </div>
      </div>
    </div>
  );
}
