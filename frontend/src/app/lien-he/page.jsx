"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Phone, Mail, MapPin, Send, Clock, ChevronDown, ChevronUp, Loader2, MessageCircle,
} from "lucide-react";
import { getPublicSystemSettings, submitContactForm } from "@/services/adminSystemSettingsService";

const FALLBACK = {
  tenHeThong: "Công Ty Du Lịch Việt Tour",
  hotline: "0333303056",
  emailLienHe: "viettour@gmail.com",
  diaChi: "132 Nguyễn Văn Trường, Long Tuyền, Bình Thuỷ, Cần Thơ",
  gioLamViec: "08:00 – 17:30 (Thứ 2 – Thứ 7)",
};

export default function ContactPage() {
  const [settings, setSettings] = useState(FALLBACK);
  const [showMap, setShowMap] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  useEffect(() => {
    getPublicSystemSettings()
      .then((s) =>
        setSettings({
          tenHeThong: s.tenHeThong || FALLBACK.tenHeThong,
          hotline: s.hotline || FALLBACK.hotline,
          emailLienHe: s.emailLienHe || FALLBACK.emailLienHe,
          diaChi: s.diaChi || FALLBACK.diaChi,
          gioLamViec: s.gioLamViec || FALLBACK.gioLamViec,
        }),
      )
      .catch(() => { });
  }, []);

  const onSubmit = async (data) => {
    try {
      await submitContactForm(data);
      alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất qua email: " + settings.emailLienHe);
      reset();
    } catch (error) {
      console.error("Lỗi khi gửi liên hệ:", error);
      const errData = error?.response?.data;
      if (typeof errData === "string") {
        alert(errData);
      } else if (errData && typeof errData === "object") {
        // Validation errors usually come as {field: "message"} or similar list
        const msg = Object.values(errData).join("\n") || JSON.stringify(errData);
        alert(msg);
      } else {
        alert("Có lỗi xảy ra khi gửi tin nhắn. Vui lòng thử lại sau.");
      }
    }
  };

  const contactCards = [
    {
      icon: MapPin,
      title: "Địa chỉ",
      value: settings.diaChi,
      color: "from-rose-500 to-pink-600",
      bg: "bg-rose-50",
    },
    {
      icon: Phone,
      title: "Điện thoại & Zalo",
      value: settings.hotline,
      href: `tel:${settings.hotline}`,
      extra: (
        <a
          href={`https://zalo.me/${settings.hotline}`}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 mt-2 text-xs font-semibold text-blue-600 bg-blue-50 px-3 py-1 rounded-full hover:bg-blue-100 transition-colors"
        >
          <MessageCircle className="w-3.5 h-3.5" /> Nhắn Zalo
        </a>
      ),
      color: "from-blue-500 to-cyan-600",
      bg: "bg-blue-50",
    },
    {
      icon: Mail,
      title: "Email",
      value: settings.emailLienHe,
      href: `mailto:${settings.emailLienHe}`,
      color: "from-amber-500 to-orange-600",
      bg: "bg-amber-50",
    },
    {
      icon: Clock,
      title: "Giờ làm việc",
      value: settings.gioLamViec,
      color: "from-emerald-500 to-teal-600",
      bg: "bg-emerald-50",
    },
  ];

  return (
    <div className="bg-gradient-to-b from-slate-50 to-white min-h-screen">
      {/* Hero */}
      <div className="relative bg-gradient-to-br from-[#0a2d4d] via-[#0f3d6b] to-[#1a5276] text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 w-72 h-72 bg-blue-400 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-96 h-96 bg-amber-400 rounded-full blur-3xl" />
        </div>
        <div className="container mx-auto max-w-7xl px-6 lg:px-8 py-20 sm:py-28 relative z-10 text-center">
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-4">
            Liên hệ với {settings.tenHeThong}
          </h1>
          <p className="text-lg text-white/70 max-w-2xl mx-auto leading-relaxed">
            Chúng tôi luôn sẵn sàng lắng nghe. Đừng ngần ngại chia sẻ thắc mắc,
            góp ý hoặc yêu cầu của bạn.
          </p>
        </div>
      </div>

      <div className="container mx-auto max-w-7xl px-6 lg:px-8 -mt-10 relative z-20 pb-20">
        {/* Contact Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-14">
          {contactCards.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 p-6 hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
            >
              <div
                className={`w-12 h-12 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center mb-4 shadow-lg`}
              >
                <item.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-bold text-gray-900 text-sm uppercase tracking-wider mb-1">
                {item.title}
              </h3>
              {item.href ? (
                <a
                  href={item.href}
                  className="text-gray-600 hover:text-blue-600 font-medium transition-colors"
                >
                  {item.value}
                </a>
              ) : (
                <p className="text-gray-600 text-sm leading-relaxed">{item.value}</p>
              )}
              {item.extra && item.extra}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-start">
          {/* Cột trái: Bản đồ + thông tin */}
          <div className="space-y-6">
            <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden">
              <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <span className="w-1 h-6 bg-rose-500 rounded-full" />
                  <MapPin className="w-5 h-5 text-rose-600" />
                  Vị trí công ty
                </h2>
                <p className="text-sm text-gray-500 mt-1">{settings.tenHeThong}</p>
              </div>
              <div className="p-6 space-y-4">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                    <MapPin className="w-5 h-5 text-rose-600" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{settings.tenHeThong}</p>
                    <p className="text-sm text-gray-600 mt-0.5">{settings.diaChi}</p>
                  </div>
                </div>

                {/* Nút mở bản đồ */}
                <button
                  onClick={() => setShowMap(!showMap)}
                  className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:text-blue-700 transition-all duration-200"
                >
                  <MapPin className="w-4 h-4" />
                  {showMap ? "Ẩn bản đồ" : "Xem bản đồ vị trí công ty"}
                  {showMap ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </button>

                {/* Google Maps */}
                {showMap && (
                  <div className="rounded-xl overflow-hidden border border-gray-200">
                    <iframe
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3734.5905162993627!2d105.72365067479379!3d10.017364790088914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a088fcf5e00595%3A0xf0e7021820d028dd!2zMTM1IE5ndXnhu4VuIFbEg24gVHLGsOG7nW5nLCBMb25nIFR1eeG7gW4sIELDrG5oIFRo4buneSwgQ-G6p24gVGjGoSwgVmnhu4d0IE5hbQ!5e1!3m2!1svi!2s!4v1773233124043!5m2!1svi!2s"
                      width="100%"
                      height="350"
                      style={{ border: 0 }}
                      allowFullScreen=""
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                      title="Bản đồ Công Ty Du Lịch Việt Tour"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Lưu ý */}
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 space-y-3">
              <h3 className="font-bold text-amber-900 flex items-center gap-2">
                <Clock className="w-5 h-5" /> Lưu ý quan trọng
              </h3>
              <ul className="text-sm text-amber-800 space-y-2 list-disc pl-5 opacity-90">
                <li>
                  Khách hàng phải đến đúng điểm hẹn (tại công ty) trước <strong>15-30 phút</strong>{" "}
                  để nhân viên rà soát trước khi khởi hành.
                </li>
                <li>
                  Nếu cần xe đưa đón đến điểm xuất phát, hãy gọi{" "}
                  <a href={`tel:${settings.hotline}`} className="font-bold text-blue-700 underline">
                    {settings.hotline}
                  </a>{" "}
                  hoặc Zalo{" "}
                  <a
                    href={`https://zalo.me/${settings.hotline}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-blue-700 underline"
                  >
                    {settings.hotline}
                  </a>{" "}
                  để được tư vấn cụ thể!
                </li>
              </ul>
            </div>
          </div>

          {/* Cột phải: Form liên hệ */}
          <div className="bg-white p-8 rounded-2xl shadow-lg shadow-black/5 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-6">
              <span className="w-1 h-6 bg-blue-600 rounded-full" />
              Gửi tin nhắn cho chúng tôi
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  placeholder="Nhập họ và tên"
                  className="mt-1.5"
                  {...register("name", { required: "Họ và tên là bắt buộc" })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Nhập email"
                  className="mt-1.5"
                  {...register("email", {
                    required: "Email là bắt buộc",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Địa chỉ email không hợp lệ",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại (Tùy chọn)</Label>
                <Input
                  id="phone"
                  placeholder="Nhập số điện thoại"
                  className="mt-1.5"
                  {...register("phone")}
                />
              </div>
              <div>
                <Label htmlFor="message">Nội dung tin nhắn</Label>
                <Textarea
                  id="message"
                  rows={5}
                  placeholder="Nhập nội dung tin nhắn..."
                  className="mt-1.5"
                  {...register("message", {
                    required: "Nội dung tin nhắn là bắt buộc",
                  })}
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">{errors.message.message}</p>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full rounded-xl bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-200 h-12 font-bold"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Send className="mr-2 h-4 w-4" />
                )}
                {isSubmitting ? "Đang gửi..." : "Gửi tin nhắn"}
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
