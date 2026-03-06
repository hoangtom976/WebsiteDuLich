import Link from "next/link";
import { ShieldCheck, Wallet, Headset, Star } from "lucide-react";
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

async function PopularToursSection() {
  const popularTours = await getPopularTours();

  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-8 text-center text-4xl font-bold">Các tour nổi bật</h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {(popularTours || []).slice(0, 4).map((tour) => (
            <div
              key={tour.id}
              className="rounded-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
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
    <section className="bg-white pb-10 pt-0 sm:pb-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-8 text-center text-4xl font-bold">Tour mới nhất</h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {(newestTours || []).slice(0, 4).map((tour) => (
            <div
              key={tour.id}
              className="rounded-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <TourCard tour={tour} />
            </div>
          ))}
        </div>
        <div className="mt-8 text-center">
          <Button
            asChild
            size="lg"
            variant="outline"
            className="border-amber-500 text-amber-600 hover:bg-amber-50 hover:text-amber-700"
          >
            <Link href="/tours">Xem tất cả tour</Link>
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
      icon: Star,
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
    <section className="bg-gray-50 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-8 text-center text-4xl font-bold">
          Vì sao chọn Việt Tour?
        </h2>
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
          {reasons.map((reason) => (
            <div
              key={reason.title}
              className="rounded-xl p-6 text-center transition-all duration-300 hover:bg-white hover:shadow-lg"
            >
              <div className="mb-4 flex justify-center">
                <div className="rounded-full bg-amber-100 p-4">
                  <reason.icon className="h-8 w-8 text-amber-500" />
                </div>
              </div>
              <h3 className="mb-2 text-xl font-semibold">{reason.title}</h3>
              <p className="text-muted-foreground">{reason.desc}</p>
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
      className="relative bg-fixed bg-cover bg-center py-14 sm:py-16"
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
    <section className="bg-gray-50 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <FlashDealSection deal={deal} />
      </div>
    </section>
  );
}

async function CustomerReviewsSection() {
  const reviews = (await getPopularTours())
    .flatMap((tour) => tour.danhGia || [])
    .slice(0, 5);

  if (!reviews || reviews.length === 0) return null;

  return <CustomerReviews reviews={reviews} />;
}

async function TravelBlog() {
  const recentPosts = await getRecentPosts(3);

  return (
    <section className="bg-gray-50 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-8 text-center text-4xl font-bold">Cẩm nang du lịch</h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-3">
          {(recentPosts || []).map((post) => (
            <div
              key={post.id}
              className="rounded-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <BlogCard post={{ ...post, anhBia: post.anhBia }} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Newsletter() {
  return (
    <section className="bg-[#0a2d4d] py-10 text-white sm:py-12">
      <div className="mx-auto max-w-4xl px-6 text-center lg:px-8">
        <h2 className="text-4xl font-bold">Nhận ưu đãi độc quyền</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/80">
          Trở thành thành viên của Viet Tour để nhận ngay voucher giảm giá và
          cập nhật những hành trình mới nhất.
        </p>
        <div className="mt-5 flex justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-amber-500 font-bold text-black hover:bg-amber-600"
          >
            <Link href="/dang-ky">Đăng ký ngay</Link>
          </Button>
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
        <Newsletter />
      </div>
    </>
  );
}

