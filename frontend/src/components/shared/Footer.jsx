"use client";
import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Mountain, MapPin, Phone, Mail, Send, Facebook, Instagram, Twitter, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";
import { getAllCategories } from "@/services/categoryService";

export default function PremiumFooter() {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const data = await getAllCategories();
        if (data && data.length > 0) {
          setCategories(data.slice(0, 5)); // Lấy tối đa 5 danh mục
        }
      } catch (error) {
        console.error("Lỗi khi tải danh mục ở footer:", error);
      }
    };
    fetchCategories();
  }, []);

  return (
    <footer className="bg-[#0a2d4d] pb-8 pt-16 text-white/80">
      <div className="mx-auto w-full max-w-[1400px] px-4 lg:px-6">
        <div className="mb-12 grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-4">
          {/* Cột 1: Giới thiệu công ty */}
          <div className="space-y-6">
            <div className="flex items-center gap-2">
              <Mountain className="h-8 w-8 text-amber-500 shadow-sm" />
              <span className="text-2xl font-black tracking-tighter text-white uppercase italic">VietTour</span>
            </div>
            <p className="text-sm leading-relaxed text-slate-300">
              Nền tảng đặt tour du lịch trực tuyến giúp bạn khám phá những điểm đến tuyệt vời trên khắp Việt Nam với lịch trình hấp dẫn và dịch vụ chất lượng.
            </p>
            <div className="space-y-3">
              <div className="flex items-center gap-3 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 group-hover:bg-amber-500/20 transition-colors">
                  <MapPin className="h-4 w-4 text-amber-500" />
                </div>
                <span className="text-sm">Cần Thơ, Việt Nam</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 group-hover:bg-amber-500/20 transition-colors">
                  <Phone className="h-4 w-4 text-amber-500" />
                </div>
                <span className="text-sm">Hotline: 0333 303 056</span>
              </div>
              <div className="flex items-center gap-3 group">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/5 group-hover:bg-amber-500/20 transition-colors">
                  <Mail className="h-4 w-4 text-amber-500" />
                </div>
                <span className="text-sm">Email: hoangtom976@gmail.com</span>
              </div>
            </div>
          </div>

          {/* Cột 2: Khám phá */}
          <div>
            <h4 className="mb-6 text-lg font-black text-white uppercase tracking-wider">Khám phá</h4>
            <ul className="space-y-4">
              {categories.length > 0 ? categories.map((cat) => (
                <li key={cat.id}>
                  <Link href={`/tours?category=${cat.id}`} className="text-sm hover:text-amber-500 transition-colors flex items-center gap-2 group">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500/50 group-hover:bg-amber-500 transition-all" />
                    {cat.tenDanhMuc}
                  </Link>
                </li>
              )) : [
                { name: "Tour nổi bật", href: "/tours?q=nổi bật" },
                { name: "Tour mới nhất", href: "/tours?q=mới" },
                { name: "Du lịch biển đảo", href: "/tours?category=1" },
                { name: "Du lịch sinh thái", href: "/tours?category=2" },
                { name: "Du lịch nghỉ dưỡng", href: "/tours?category=3" }
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm hover:text-amber-500 transition-colors flex items-center gap-2 group">
                    <span className="h-1.5 w-1.5 rounded-full bg-amber-500/50 group-hover:bg-amber-500 transition-all" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 3: Hỗ trợ khách hàng */}
          <div>
            <h4 className="mb-6 text-lg font-black text-white uppercase tracking-wider">Hỗ trợ khách hàng</h4>
            <ul className="space-y-4">
              {[
                { name: "Cách đặt tour", href: "/chinh-sach/huong-dan" },
                { name: "Chính sách thanh toán", href: "/chinh-sach/thanh-toan" },
                { name: "Chính sách hủy tour", href: "/chinh-sach/huy-tour" },
                { name: "Điều khoản sử dụng", href: "/chinh-sach/dieu-khoan" },
                { name: "Chính sách bảo mật", href: "/chinh-sach/bao-mat" }
              ].map((item) => (
                <li key={item.name}>
                  <Link href={item.href} className="text-sm hover:text-amber-500 transition-colors flex items-center gap-2 group">
                    <span className="h-1.5 w-1.5 rounded-full bg-slate-500 group-hover:bg-amber-500 transition-all" />
                    {item.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Cột 4: Đăng ký nhận ưu đãi */}
          <div className="space-y-6">
            <h4 className="text-lg font-black text-white uppercase tracking-wider">Nhận ưu đãi du lịch</h4>
            <p className="text-sm leading-relaxed text-slate-300">
              Đăng ký email để nhận thông tin khuyến mãi và các tour mới nhất.
            </p>
            <div className="relative group">
              <input
                type="email"
                placeholder="Email của bạn..."
                className="w-full h-12 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500 transition-all placeholder:text-slate-500"
              />
              <button className="absolute right-1 top-1 h-10 px-4 bg-amber-500 text-slate-900 rounded-lg font-black text-xs uppercase hover:bg-amber-600 transition-colors flex items-center gap-2">
                Đăng ký
                <Send className="h-3.5 w-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-4 pt-4 border-t border-white/10">
              {Object.entries({
                facebook: { Icon: Facebook, href: "https://facebook.com/viettour" },
                instagram: { Icon: Instagram, href: "https://instagram.com/viettour" },
                twitter: { Icon: Twitter, href: "https://twitter.com/viettour" },
                youtube: { Icon: Youtube, href: "https://youtube.com/viettour" }
              }).map(([key, { Icon, href }]) => (
                <Link key={key} href={href} target="_blank" rel="noopener noreferrer" className="h-10 w-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-amber-500 hover:text-slate-900 transition-all duration-300">
                  <Icon className="h-5 w-5" />
                </Link>
              ))}
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-slate-400">
          <p>&copy; {new Date().getFullYear()} <span className="text-white font-bold">VietTour</span>. All Rights Reserved.</p>
          <div className="flex items-center gap-6">
            <Link href="/sitemap" className="hover:text-white transition-colors">Sitemap</Link>
            <Link href="/faq" className="hover:text-white transition-colors">FAQs</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
