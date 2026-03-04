import { getFlashDeal, getVouchers } from "@/services/promotionService";
import FlashDealSection from "@/components/shared/FlashDealSection";
import { TicketPercent } from "lucide-react";

function VoucherCard({ voucher }) {
  const formattedExpiry = new Date(voucher.ngayHetHan).toLocaleDateString(
    "vi-VN",
  );

  return (
    <div className="bg-white rounded-lg shadow-lg overflow-hidden flex flex-col md:flex-row items-center transition-all duration-300 hover:shadow-xl">
      <div className="p-6 bg-amber-500 text-white flex flex-col items-center justify-center md:w-48">
        <h3 className="text-4xl font-bold">{voucher.phanTramGiam}%</h3>
        <p className="font-semibold">GIẢM GIÁ</p>
      </div>
      <div className="p-6 flex-grow">
        <p className="text-sm text-gray-500">Mã voucher</p>
        <p className="text-2xl font-bold text-gray-800 tracking-widest my-2">
          {voucher.maVoucher}
        </p>
        <p className="text-gray-600 text-sm mb-4">{voucher.moTa}</p>
        <p className="text-xs text-red-600">Hạn sử dụng: {formattedExpiry}</p>
      </div>
    </div>
  );
}

export default async function PromotionsPage() {
  const flashDealData = await getFlashDeal();
  const vouchers = await getVouchers();

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Ưu Đãi & Khuyến Mãi
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Đừng bỏ lỡ những cơ hội tuyệt vời để khám phá Việt Nam với chi phí
            tốt nhất từ Việt Tour.
          </p>
        </div>

        {/* Flash Deal Section */}
        {flashDealData && (
          <div className="mb-20">
            <h2 className="text-3xl font-bold text-center mb-12 text-red-600 flex items-center justify-center gap-3">
              🔥 Ưu Đãi Chớp Nhoáng 🔥
            </h2>
            <FlashDealSection deal={flashDealData} />
          </div>
        )}

        {/* Vouchers Section */}
        {vouchers && vouchers.length > 0 && (
          <div>
            <h2 className="text-3xl font-bold text-center mb-12 flex items-center justify-center gap-3">
              <TicketPercent className="w-8 h-8 text-amber-500" />
              Voucher Dành Cho Bạn
            </h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {vouchers.map((voucher) => (
                <VoucherCard key={voucher.id} voucher={voucher} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
