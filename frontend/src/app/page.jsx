import Link from "next/link";
import { ShieldCheck, Wallet, Headset, Star, Flame, Clock, BookOpen, Map, Sparkles, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import TourCard from "@/components/shared/TourCard";
import BlogCard from "@/components/shared/BlogCard";
import { getPopularTours, getAllTours, getTourById } from "@/services/tourService";
import { getRecentPosts } from "@/services/blogService";
import { getFlashDeal } from "@/services/promotionService";
import FlashDealSection from "@/components/shared/FlashDealSection";
import CinematicHero from "@/components/home/CinematicHero";
import CustomerReviews from "@/components/home/CustomerReviews";
import LuxuryTopBar from "@/components/shared/LuxuryTopBar";
import FeaturedCategories from "@/components/home/FeaturedCategories";
import SectionHeader from "@/components/shared/SectionHeader";

async function PopularToursSection() {
  const popularTours = await getPopularTours();

  return (
    <section className="bg-white py-2 sm:py-4">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader
          title="Tour nổi bật"
          subtitle="Những hành trình đẳng cấp, được lựa chọn kỹ lưỡng để mang đến cho khách hàng trải nghiệm tuyệt vời nhất."
          icon={Flame}
          badgeText="Xu hướng"
        />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {(popularTours || []).slice(0, 8).map((tour) => (
            <div
              key={tour.id}
              className="group overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
            >
              <TourCard tour={tour} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

async function NewestToursSection() {
  const newestTours = await getAllTours();

  return (
    <section className="bg-slate-50/50 py-2 sm:py-4">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader
          title="Tour mới nhất"
          subtitle="Cập nhật những điểm đến mới, hành trình mới lạ vừa được ra mắt để bạn thỏa sức khám phá."
          icon={Clock}
          badgeText="Mới cập nhật"
        />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {(newestTours || []).slice(0, 4).map((tour) => (
            <div
              key={tour.id}
              className="group overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
            >
              <TourCard tour={tour} />
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button
            asChild
            size="lg"
            className="group relative overflow-hidden rounded-full bg-slate-900 border-none px-8 py-6 text-white hover:bg-slate-800"
          >
            <Link href="/tours">
              <span className="relative z-10 flex items-center gap-2 font-bold">
                Khám phá tất cả hành trình
                <TrendingUp className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </span>
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}

function WhyChooseUs() {
  const reasons = [
    {
      icon: ShieldCheck,
      title: "An toàn tuyệt đối",
      desc: "Bảo hiểm du lịch và các biện pháp an toàn luôn được đặt lên hàng đầu.",
    },
    {
      icon: Sparkles,
      title: "Dịch vụ cao cấp",
      desc: "Đội ngũ chuyên nghiệp, tận tâm, sẵn sàng hỗ trợ 24/7.",
    },
    {
      icon: Wallet,
      title: "Giá cả tối ưu",
      desc: "Luôn có những ưu đãi tốt nhất cho các hành trình chất lượng.",
    },
    {
      icon: Headset,
      title: "Hỗ trợ tận tâm",
      desc: "Tư vấn và giải đáp mọi thắc mắc của bạn một cách nhanh chóng.",
    },
  ];

  return (
    <section className="relative overflow-hidden bg-white py-2 sm:py-4">
      <div className="absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-amber-200 to-transparent opacity-30" />
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader
          title="Vì sao chọn Việt Tour?"
          subtitle="Chúng tôi cam kết mang lại giá trị thực và những kỷ niệm khó quên cho mỗi chuyến đi của bạn."
          badgeText="Giá trị cốt lõi"
        />
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="group rounded-3xl border border-slate-100 p-8 text-center transition-all duration-300 hover:bg-slate-50 hover:shadow-xl"
            >
              <div className="mb-6 flex justify-center">
                <div className="relative rounded-2xl bg-amber-50 p-5 transition-transform duration-500 group-hover:scale-110 group-hover:bg-amber-100">
                  <reason.icon className="h-8 w-8 text-amber-600" />
                  <div className="absolute -inset-1 rounded-2xl bg-amber-500/10 blur-sm opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </div>
              <h3 className="mb-3 text-xl font-black text-slate-900">{reason.title}</h3>
              <p className="text-slate-500 leading-relaxed text-sm">{reason.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


async function LuxuryBanner() {
  const tour = await getTourById(8).catch(() => null);

  // Lấy ảnh đầu tiên trong danhSachAnh (bảng hinh_anh_tour) hoặc ảnh hinhAnh, nếu không có thì dùng ảnh mặc định
  const getBannerImage = () => {
    if (tour?.danhSachAnh && tour.danhSachAnh.length > 0) {
      const firstImage = tour.danhSachAnh[0];
      return firstImage.startsWith('http')
        ? firstImage
        : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api'}/files/image/${firstImage}`;
    }
    if (tour?.hinhAnh) {
      return tour.hinhAnh.startsWith('http')
        ? tour.hinhAnh
        : `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:8081/api'}/files/image/${tour.hinhAnh}`;
    }
    return "https://images.unsplash.com/photo-1599708149101-01748aeb896b?q=80&w=1920&auto=format&fit=crop";
  };

  const bgImage = getBannerImage();

  return (
    <section
      className="relative bg-fixed bg-cover bg-center py-6 sm:py-8"
      style={{ backgroundImage: `url('${bgImage}')` }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center text-white lg:px-8">
        <h2 className="text-4xl font-bold">{tour?.tenTour || "Khám phá Cố đô Huế"}</h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg">
          {tour?.moTa || "Hành trình di sản văn hóa đặc sắc với Đại Nội, lăng tẩm và nét cổ kính của xứ Huế."}
        </p>
        <Button
          asChild
          size="lg"
          className="mt-5 rounded-full bg-amber-500 px-8 font-bold text-black hover:bg-amber-600"
        >
          <Link href="/tours/8">Xem chi tiết</Link>
        </Button>
      </div>
    </section>
  );
}

async function FlashDealHomeSection() {
  const deal = await getFlashDeal();
  if (!deal) return null;

  return (
    <section className="bg-gray-50 py-1 sm:py-2">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FlashDealSection deal={deal} />
      </div>
    </section>
  );
}

import { getAllReviews } from "@/services/reviewService";

async function CustomerReviewsSection() {
  let reviews = [];
  try {
    const allReviews = await getAllReviews();
    reviews = allReviews
      .filter((r) => r.soSao >= 4) // Chỉ chọn đánh giá 4-5 sao
      .slice(0, 4); // Lấy 4 đánh giá mới nhất
  } catch (error) {
    console.error("Lỗi khi tải đánh giá trang chủ:", error);
  }

  if (!reviews || reviews.length === 0) return null;

  return <CustomerReviews reviews={reviews} />;
}

async function TravelBlog() {
  const recentPosts = await getRecentPosts(3);

  return (
    <section className="bg-white py-2 sm:py-4">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <SectionHeader
          title="Cẩm nang du lịch"
          subtitle="Khám phá những kinh nghiệm quý báu, bí kíp hành trình để chuyến đi của bạn thêm phần trọn vẹn."
          icon={BookOpen}
          badgeText="Blog & Tin tức"
        />
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {(recentPosts || []).map((post) => (
            <div
              key={post.id}
              className="group overflow-hidden rounded-2xl transition-all duration-500 hover:-translate-y-2 hover:shadow-[0_20px_50px_rgba(0,0,0,0.1)]"
            >
              <BlogCard post={{ ...post, anhBia: post.anhBia }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}


export default function Home() {
  return (
    <>
      <LuxuryTopBar />
      <div className="bg-white">
        <CinematicHero />
        <FlashDealHomeSection />
        <PopularToursSection />
        <FeaturedCategories />
        <NewestToursSection />
        <LuxuryBanner />
        <WhyChooseUs />
        <CustomerReviewsSection />
        <TravelBlog />
      </div>
    </>
  );
}

