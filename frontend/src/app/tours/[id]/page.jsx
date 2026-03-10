import { getTourById, getPopularTours, getTourItinerary } from "@/services/tourService";
import { notFound } from "next/navigation";
import {
  MapPin, Calendar, Users, Star, ChevronRight, Home,
  Clock, Shield, Heart, Camera, Bus, Utensils, Ticket, CheckCircle2, XCircle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import TourReviews from "@/components/tours/TourReviews";
import TourBookingWrapper from "@/components/tours/TourBookingWrapper";
import TourCard from "@/components/shared/TourCard";
import TourGallery from "@/components/tours/TourGallery";
import { formatDuration, formatPrice } from "@/lib/utils";
import Link from "next/link";
import TourWeather from "@/components/tours/TourWeather";
import WishlistButton from "@/components/tours/WishlistButton";

export default async function TourDetailPage({ params }) {
  const awaitedParams = await params;
  const tour = await getTourById(awaitedParams.id);
  const itinerary = await getTourItinerary(awaitedParams.id);

  if (!tour) notFound();

  const popularTours = await getPopularTours();
  const suggestedTours = popularTours.filter(t => t.id !== tour.id).slice(0, 3);

  const formattedPrice = formatPrice(tour.gia);

  const coverImage = tour.danhSachAnh && tour.danhSachAnh.length > 0
    ? (tour.danhSachAnh[0].startsWith("http") ? tour.danhSachAnh[0] : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081/api"}/files/image/${tour.danhSachAnh[0]}`)
    : "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1200&auto=format&fit=crop";

  /* ═══════════ LEFT COLUMN CONTENT (Server-rendered) ═══════════ */
  const leftContent = (
    <>
      {/* Quick Info Pills */}
      <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 p-6">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-5">
          {[
            { icon: MapPin, label: "Điểm đến", value: tour.tenDiaDiem || "Cập nhật", color: "text-blue-600 bg-blue-50" },
            { icon: Calendar, label: "Thời gian", value: formatDuration(tour.soNgay), color: "text-amber-600 bg-amber-50" },
            { icon: Bus, label: "Phương tiện", value: "Xe du lịch", color: "text-emerald-600 bg-emerald-50" },
            { icon: Users, label: "Quy mô", value: "10-25 khách", color: "text-violet-600 bg-violet-50" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <item.icon className="w-5 h-5" />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-gray-400 font-medium uppercase tracking-wider">{item.label}</p>
                <p className="text-sm font-semibold text-gray-900 truncate">{item.value}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-blue-600 rounded-full" />
            Giới thiệu về tour
          </h2>
        </div>
        <div className="p-6">
          <p className="text-gray-600 text-[15px] leading-relaxed">
            {tour.moTaDai || tour.moTa || "Chưa có mô tả chi tiết cho tour này."}
          </p>
        </div>
      </div>

      {/* Weather Forecast */}
      <TourWeather
        lat={tour.diaDiem?.latitude}
        lon={tour.diaDiem?.longitude}
        destinationName={tour.tenDiaDiem}
      />

      {/* Itinerary */}
      <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-amber-500 rounded-full" />
            Lịch trình chi tiết
          </h2>
          <p className="text-sm text-gray-400 mt-1">Khám phá hành trình của bạn từng ngày</p>
        </div>
        <div className="p-6">
          {itinerary && itinerary.length > 0 ? (
            <div className="space-y-0">
              {itinerary.map((item, index) => (
                <div key={item.ngayThu || index} className="relative flex gap-5 group">
                  {index < itinerary.length - 1 && (
                    <div className="absolute left-[23px] top-12 bottom-0 w-[2px] bg-gradient-to-b from-blue-200 to-transparent" />
                  )}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-700 text-white flex flex-col items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-110 transition-transform duration-300">
                      <span className="text-[10px] font-medium leading-none uppercase">Ngày</span>
                      <span className="text-lg font-bold leading-none">{item.ngayThu}</span>
                    </div>
                  </div>
                  <div className="flex-1 pb-8">
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-100 group-hover:border-blue-200 group-hover:bg-blue-50/30 transition-all duration-300">
                      <h4 className="font-bold text-gray-900 text-lg">{item.tieuDe}</h4>
                      <p className="mt-2 text-gray-600 leading-relaxed text-sm whitespace-pre-wrap">{item.moTa}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                <Calendar className="w-8 h-8 text-gray-300" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900">Lịch trình đang được cập nhật</h3>
              <p className="text-sm text-gray-400 mt-1">Vui lòng quay lại sau để xem chi tiết lịch trình tour.</p>
            </div>
          )}
        </div>
      </div>

      {/* Gallery */}
      <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-emerald-500 rounded-full" />
            <Camera className="w-5 h-5 text-emerald-600" />
            Ảnh trải nghiệm
          </h2>
        </div>
        <div className="p-4">
          <TourGallery
            images={(tour.danhSachAnh || []).map(img =>
              img.startsWith("http") ? img : `${process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8081/api"}/files/image/${img}`
            )}
          />
        </div>
      </div>

      {/* Pricing & Services */}
      <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden">
        <div className="px-6 py-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <span className="w-1 h-6 bg-violet-500 rounded-full" />
            Giá tour & Dịch vụ
          </h2>
        </div>
        <div className="p-6">
          <div className="flex items-baseline gap-2 mb-8 pb-6 border-b border-dashed border-gray-200">
            <Ticket className="w-6 h-6 text-blue-600" />
            <span className="text-3xl font-extrabold bg-gradient-to-r from-blue-700 to-blue-500 bg-clip-text text-transparent">{formattedPrice}</span>
            <span className="text-gray-400 text-sm">/ khách</span>
          </div>
          <div className="grid sm:grid-cols-2 gap-8">
            <div>
              <h4 className="font-bold text-emerald-700 flex items-center gap-2 mb-4 text-sm uppercase tracking-wider">
                <CheckCircle2 className="w-5 h-5" /> Bao gồm
              </h4>
              <ul className="space-y-3">
                {["Xe đưa đón đời mới, máy lạnh", "Các bữa ăn tiêu chuẩn theo chương trình", "Vé tham quan các điểm trong lịch trình", "Hướng dẫn viên nhiệt tình, kinh nghiệm", "Bảo hiểm du lịch trọn gói"].map((text, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600"><CheckCircle2 className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />{text}</li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-rose-600 flex items-center gap-2 mb-4 text-sm uppercase tracking-wider">
                <XCircle className="w-5 h-5" /> Không bao gồm
              </h4>
              <ul className="space-y-3">
                {["Chi phí cá nhân ngoài chương trình", "Đồ uống gọi thêm trong các bữa ăn", "Tiền bồi dưỡng (Tip) cho tài xế và HDV"].map((text, i) => (
                  <li key={i} className="flex items-start gap-2.5 text-sm text-gray-600"><XCircle className="w-4 h-4 text-rose-400 mt-0.5 flex-shrink-0" />{text}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Reviews */}
      <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden p-6">
        <TourReviews tourId={tour.id} />
      </div>
    </>
  );

  /* ═══════════ RIGHT COLUMN CONTENT (Server-rendered) ═══════════ */
  const rightContent = (
    <>
      {/* Why Viet Tour */}
      <div className="bg-[#0a2d4d] rounded-2xl p-6 text-white shadow-xl shadow-[#0a2d4d]/20">
        <h3 className="text-lg font-bold mb-5">Vì sao chọn Viet Tour?</h3>
        <div className="space-y-4">
          {[
            { icon: Shield, title: "An toàn tuyệt đối", desc: "Bảo hiểm du lịch trọn gói & xe đời mới.", color: "bg-emerald-500/20 text-emerald-400" },
            { icon: Star, title: "Dịch vụ 5 sao", desc: "Cam kết trải nghiệm tốt nhất cho bạn.", color: "bg-amber-500/20 text-amber-400" },
            { icon: Heart, title: "HDV tận tâm", desc: "Đội ngũ am hiểu văn hóa địa phương.", color: "bg-rose-500/20 text-rose-400" },
            { icon: Utensils, title: "Ẩm thực đặc sắc", desc: "Thưởng thức món ngon vùng miền.", color: "bg-orange-500/20 text-orange-400" },
          ].map((item, i) => (
            <div key={i} className="flex items-start gap-3">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${item.color}`}>
                <item.icon className="w-4 h-4" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">{item.title}</h4>
                <p className="text-xs text-white/70 mt-0.5 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="bg-amber-50 border border-amber-200 rounded-2xl p-5 text-center">
        <p className="text-sm text-amber-800 font-medium">🔥 Ưu đãi có hạn! Đặt ngay để nhận giá tốt nhất.</p>
        <p className="text-xs text-amber-600 mt-1">Hỗ trợ tư vấn 24/7 & Lên lịch trình riêng theo yêu cầu</p>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* ═══ HERO ═══ */}
      {/* ═══ HERO ═══ */}
      <section className="relative h-[60vh] min-h-[500px] w-full bg-slate-900">
        <div className="absolute inset-0 w-full h-full">
          <img
            src={coverImage}
            alt={tour.tenTour}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-black/30" />
        </div>

        {/* Breadcrumb */}
        <div className="absolute top-0 left-0 right-0 z-10 pt-6">
          <div className="container mx-auto px-4">
            <nav className="flex items-center text-sm text-white/80 font-medium">
              <Link href="/" className="hover:text-white flex items-center gap-1 transition-colors"><Home className="w-4 h-4" /> Trang chủ</Link>
              <ChevronRight className="w-4 h-4 mx-1.5 text-white/50" />
              <Link href="/tours" className="hover:text-white transition-colors">Tours</Link>
              <ChevronRight className="w-4 h-4 mx-1.5 text-white/50" />
              <span className="text-white truncate max-w-[250px]">{tour.tenTour}</span>
            </nav>
          </div>
        </div>

        {/* Main Hero Content */}
        <div className="absolute bottom-12 left-0 right-0 z-10">
          <div className="container mx-auto px-4">
            <div className="max-w-4xl">
              <div className="flex flex-wrap items-center gap-2 mb-4">
                <span className="px-3 py-1 bg-amber-500 text-white text-xs font-bold rounded-full uppercase tracking-wider">{tour.tenDanhMuc}</span>
                <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-medium rounded-full flex items-center gap-1">
                  <MapPin className="w-3 h-3" />{tour.tenDiaDiem}
                </span>
              </div>

              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white leading-tight text-shadow-sm">
                  {tour.tenTour}
                </h1>
                <WishlistButton tourId={tour.id} initialStatus={tour.daYeuThich} />
              </div>

              <div className="flex flex-wrap items-center gap-6 text-white/90">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <Clock className="w-4 h-4 text-amber-400" />
                  </div>
                  <span className="font-medium">{formatDuration(tour.soNgay)}</span>
                </div>

                {tour.soSaoTrungBinh > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                      <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                    </div>
                    <div>
                      <span className="font-bold">{tour.soSaoTrungBinh}</span>
                      <span className="text-white/60 text-sm ml-1">({tour.tongDanhGia} đánh giá)</span>
                    </div>
                  </div>
                )}

                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center backdrop-blur-sm">
                    <Users className="w-4 h-4 text-emerald-400" />
                  </div>
                  <span className="font-medium">10 - 25 khách</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ MAIN ═══ */}
      <div className="container mx-auto px-4 -mt-6 relative z-20">
        <TourBookingWrapper
          tour={tour}
          formattedPrice={formattedPrice}
          leftContent={leftContent}
          rightContent={rightContent}
        />

        {/* ═══ SUGGESTED TOURS ═══ */}
        {suggestedTours.length > 0 && (
          <div className="mt-20 pb-16">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">Có thể bạn quan tâm</h2>
                <p className="text-sm text-gray-400 mt-1">Những hành trình tuyệt vời đang chờ bạn</p>
              </div>
              <Button variant="outline" asChild className="hidden sm:inline-flex group rounded-full">
                <Link href="/tours">Xem tất cả <ChevronRight className="ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedTours.map(t => (<TourCard key={t.id} tour={t} />))}
            </div>
            <div className="mt-6 text-center sm:hidden">
              <Button variant="outline" asChild className="w-full rounded-full"><Link href="/tours">Xem tất cả tour</Link></Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
