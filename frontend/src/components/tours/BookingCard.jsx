"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import DepartureDatePicker from "./DepartureDatePicker";

export default function BookingCard({ tour, formattedPrice }) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);

  const handleBooking = () => {
    if (!selectedDate) {
      alert("Vui lòng chọn ngày khởi hành ở phần bên trái trước.");
      return;
    }

    const token = localStorage.getItem("accessToken");
    if (!token) {
      alert("Bạn cần đăng nhập để đặt tour. Đang chuyển đến trang đăng nhập...");
      router.push(`/dang-nhap?redirect=/tours/${tour.id}`);
      return;
    }

    console.log("Booking for date ID:", selectedDate.id);
    alert(`Đã chọn ngày khởi hành: ${new Date(selectedDate.ngayKhoiHanh).toLocaleDateString("vi-VN")}. Sẵn sàng đặt tour!`);
  };

  return (
    <>
      {/* ─── Departure Date Picker (rendered in parent's left column via portal-like  pattern) ─── */}
      {/* This is the DepartureDatePicker slot - rendered by the parent page layout */}

      {/* ─── Sidebar Booking Card ─── */}
      <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden">
        <div className="p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-1">Đặt tour ngay</h3>
          <p className="text-sm text-gray-400 mb-5">
            Chỉ từ <span className="font-bold text-blue-600 text-lg">{formattedPrice}</span>/khách
          </p>

          {selectedDate ? (
            <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <p className="text-xs text-emerald-700 uppercase font-medium tracking-wider mb-1">Ngày khởi hành đã chọn</p>
              <p className="text-base font-bold text-emerald-900">
                {new Date(selectedDate.ngayKhoiHanh).toLocaleDateString("vi-VN", {
                  weekday: "long",
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })}
              </p>
              <p className="text-xs text-emerald-600 mt-1">
                Còn {selectedDate.soChoConLai} chỗ trống
              </p>
            </div>
          ) : (
            <div className="mb-5 bg-amber-50 border border-amber-200 rounded-xl p-4 text-center">
              <p className="text-sm text-amber-700 font-medium">⚠️ Vui lòng chọn ngày khởi hành</p>
              <p className="text-xs text-amber-500 mt-1">Cuộn xuống phần lịch khởi hành ở bên trái</p>
            </div>
          )}

          <Button
            size="lg"
            onClick={handleBooking}
            disabled={!selectedDate}
            className={`w-full text-base font-semibold h-12 rounded-xl transition-all duration-300 ${selectedDate
                ? "bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/30"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
          >
            {selectedDate ? "🚀 Đặt tour ngay" : "Chọn ngày để đặt tour"}
          </Button>

          <p className="text-xs text-gray-400 text-center mt-3">
            Miễn phí hủy trước 7 ngày khởi hành
          </p>
        </div>
      </div>

      {/* Hidden input to expose date picker callback */}
      <input type="hidden" id="__booking_card_ref" data-ready="true" />
    </>
  );
}

// Export the hook for external state sharing
BookingCard.DepartureDatePicker = DepartureDatePicker;
