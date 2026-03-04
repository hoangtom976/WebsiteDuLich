import Link from "next/link";
import { ShieldCheck, Wallet, Headset, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import TourCard from "@/components/shared/TourCard";
import BlogCard from "@/components/shared/BlogCard";
import { getPopularTours, getAllTours } from "@/services/tourService";
import { getRecentPosts } from "@/services/blogService";
import { getFlashDeal } from "@/services/promotionService";
import FlashDealSection from "@/components/shared/FlashDealSection";
import CinematicHero from "@/components/home/CinematicHero";
import CustomerReviews from "@/components/home/CustomerReviews";
import LuxuryTopBar from "@/components/shared/LuxuryTopBar";

async function PopularToursSection() {
  const popularTours = await getPopularTours();

  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-8 text-center text-4xl font-bold">Cac tour noi bat</h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {(popularTours || []).slice(0, 8).map((tour) => (
            <div
              key={tour.id}
              className="rounded-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <TourCard
                tour={{
                  ...tour,
                  hinhAnh:
                    "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
                }}
              />
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
        <h2 className="mb-8 text-center text-4xl font-bold">Tour moi nhat</h2>
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-4">
          {(newestTours || []).slice(0, 4).map((tour) => (
            <div
              key={tour.id}
              className="rounded-lg transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl"
            >
              <TourCard
                tour={{
                  ...tour,
                  hinhAnh:
                    "https://images.unsplash.com/photo-1506744038136-46273834b3fb",
                }}
              />
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
            <Link href="/tours">Xem tat ca tour</Link>
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
      title: "An toan tuyet doi",
      desc: "Bao hiem du lich va cac bien phap an toan luon duoc dat len hang dau.",
    },
    {
      icon: Star,
      title: "Dich vu cao cap",
      desc: "Doi ngu chuyen nghiep, tan tam, san sang ho tro 24/7.",
    },
    {
      icon: Wallet,
      title: "Gia ca toi uu",
      desc: "Luon co nhung uu dai tot nhat cho cac hanh trinh chat luong.",
    },
    {
      icon: Headset,
      title: "Ho tro tan tam",
      desc: "Tu van va giai dap moi thac mac cua ban mot cach nhanh chong.",
    },
  ];

  return (
    <section className="bg-gray-50 py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-8 text-center text-4xl font-bold">
          Vi sao chon Viet Tour?
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

function FeaturedCategories() {
  const regions = [
    { name: "Mien Bac", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb" },
    { name: "Mien Trung", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb" },
    { name: "Mien Nam", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb" },
    { name: "Tay Nguyen", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb" },
    { name: "Bien Dao", img: "https://images.unsplash.com/photo-1506744038136-46273834b3fb" },
  ];

  return (
    <section className="bg-white py-10 sm:py-12">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <h2 className="mb-8 text-center text-4xl font-bold">Kham pha theo vung mien</h2>
        <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-5">
          {regions.map((region) => (
            <Link
              href={`/tours?region=${region.name}`}
              key={region.name}
              className="group relative h-64 overflow-hidden rounded-lg shadow-lg transition-transform duration-300 hover:scale-105"
            >
              <img
                src={region.img}
                alt={region.name}
                className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-110"
              />
              <div className="absolute inset-0 bg-black/40" />
              <h3 className="absolute bottom-4 left-4 text-2xl font-bold text-white">
                {region.name}
              </h3>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function LuxuryBanner() {
  return (
    <section
      className="relative bg-fixed bg-cover bg-center py-14 sm:py-16"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1528127269322-539801943592?q=80&w=2070&auto=format&fit=crop')",
      }}
    >
      <div className="absolute inset-0 bg-black/50" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 text-center text-white lg:px-8">
        <h2 className="text-4xl font-bold">Trai nghiem du thuyen dang cap</h2>
        <p className="mx-auto mt-4 max-w-2xl">
          Kham pha Vinh Ha Long tren du thuyen 5 sao voi dich vu tron goi va
          nhung hoat dong hap dan.
        </p>
        <Button
          asChild
          size="lg"
          className="mt-5 rounded-full bg-amber-500 px-8 font-bold text-black hover:bg-amber-600"
        >
          <Link href="/tours/1">Xem chi tiet</Link>
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
        <h2 className="mb-8 text-center text-4xl font-bold">Cam nang du lich</h2>
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
        <h2 className="text-4xl font-bold">Nhan uu dai doc quyen</h2>
        <p className="mx-auto mt-4 max-w-2xl text-white/80">
          Tro thanh thanh vien cua Viet Tour de nhan ngay voucher giam gia va
          cap nhat nhung hanh trinh moi nhat.
        </p>
        <div className="mt-5 flex justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-amber-500 font-bold text-black hover:bg-amber-600"
          >
            <Link href="/dang-ky">Dang ky ngay</Link>
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
