"use client";

import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Phone, Mail, MapPin, Send } from "lucide-react";

const contactInfo = [
  {
    icon: MapPin,
    title: "Địa chỉ",
    value: "Tầng 5, Tòa nhà Bitexco, 2 Hải Triều, Bến Nghé, Quận 1, TP.HCM",
  },
  {
    icon: Phone,
    title: "Điện thoại",
    value: "1900 1234 - (028) 38 123 456",
  },
  {
    icon: Mail,
    title: "Email",
    value: "hotro@viettour.com",
  },
];

export default function ContactPage() {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset,
  } = useForm();

  const onSubmit = async (data) => {
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Giả lập gọi API
    console.log("Form submitted:", data);
    alert("Cảm ơn bạn đã liên hệ! Chúng tôi sẽ phản hồi sớm nhất có thể.");
    reset();
  };

  return (
    <div className="bg-gray-50">
      <div className="container mx-auto max-w-7xl px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center mb-16">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Liên hệ với Việt Tour
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600 max-w-2xl mx-auto">
            Chúng tôi luôn sẵn sàng lắng nghe. Đừng ngần ngại chia sẻ thắc mắc,
            góp ý hoặc yêu cầu của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start">
          {/* Cột thông tin liên hệ và bản đồ */}
          <div className="space-y-10">
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">
                Thông tin liên hệ
              </h2>
              {contactInfo.map((item) => (
                <div key={item.title} className="flex items-start gap-4">
                  <item.icon className="h-6 w-6 text-amber-500 mt-1 flex-shrink-0" />
                  <div>
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="text-gray-600">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-lg overflow-hidden shadow-lg">
              <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3919.493959958993!2d106.7022213153354!3d10.77320106220398!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31752f46a8884979%3A0x20c5253b67036e3!2sBitexco%20Financial%20Tower!5e0!3m2!1svi!2s!4v1677142425513!5m2!1svi!2s"
                width="100%"
                height="350"
                style={{ border: 0 }}
                allowFullScreen=""
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
              ></iframe>
            </div>
          </div>

          {/* Cột form liên hệ */}
          <div className="bg-white p-8 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">
              Gửi tin nhắn cho chúng tôi
            </h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div>
                <Label htmlFor="name">Họ và tên</Label>
                <Input
                  id="name"
                  {...register("name", { required: "Họ và tên là bắt buộc" })}
                />
                {errors.name && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  {...register("email", {
                    required: "Email là bắt buộc",
                    pattern: {
                      value: /^\S+@\S+$/i,
                      message: "Địa chỉ email không hợp lệ",
                    },
                  })}
                />
                {errors.email && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.email.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="phone">Số điện thoại (Tùy chọn)</Label>
                <Input id="phone" {...register("phone")} />
              </div>
              <div>
                <Label htmlFor="message">Nội dung tin nhắn</Label>
                <Textarea
                  id="message"
                  rows={5}
                  {...register("message", {
                    required: "Nội dung tin nhắn là bắt buộc",
                  })}
                />
                {errors.message && (
                  <p className="text-red-500 text-sm mt-1">
                    {errors.message.message}
                  </p>
                )}
              </div>
              <Button
                type="submit"
                size="lg"
                className="w-full"
                disabled={isSubmitting}
              >
                <Send className="mr-2 h-4 w-4" /> Gửi tin nhắn
              </Button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
