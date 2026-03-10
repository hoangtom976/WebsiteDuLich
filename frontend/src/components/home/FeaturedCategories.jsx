"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { getAllCategories } from "@/services/categoryService";
import { LayoutGrid } from "lucide-react";
import SectionHeader from "@/components/shared/SectionHeader";

export default function FeaturedCategories() {
    const [categories, setCategories] = useState([]);

    const getCategoryImage = (name) => {
        const n = (name || "").toLowerCase();

        // 1. Văn hóa / Di sản / Thăng Long / Đà Nẵng / Tâm linh (Khớp cực mạnh)
        if (n.includes("văn") || n.includes("van") || n.includes("hóa") || n.includes("hoá") || n.includes("hoa") || n.includes("đà nẵng") || n.includes("di sản") || n.includes("lịch sử") || n.includes("tâm linh")) {
            return "https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?q=80&w=800&auto=format&fit=crop";
        }
        // 2. Biển đảo
        if (n.includes("biển") || n.includes("đảo") || n.includes("vịnh")) {
            return "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?q=80&w=800&auto=format&fit=crop";
        }
        // 3. Sinh thái / Thiên nhiên
        if (n.includes("sinh thái") || n.includes("nhiên") || n.includes("vườn") || n.includes("rừng")) {
            return "https://images.unsplash.com/photo-1501785888041-af3ef285b470?q=80&w=800&auto=format&fit=crop";
        }
        // 4. Nghỉ dưỡng
        if (n.includes("nghỉ dưỡng") || n.includes("resort") || n.includes("sang trọng")) {
            return "https://images.unsplash.com/photo-1540541338287-41700207dee6?q=80&w=800&auto=format&fit=crop";
        }
        // 5. Khám phá / Mạo hiểm
        if (n.includes("khám phá") || n.includes("mạo hiểm") || n.includes("trekking")) {
            return "https://images.unsplash.com/photo-1533240332313-0db49b459ad6?q=80&w=800&auto=format&fit=crop";
        }
        // Ẩm thực
        if (n.includes("ẩm thực") || n.includes("ăn uống") || n.includes("đặc sản")) {
            return "https://images.unsplash.com/photo-1504674900247-0877df9cc836?q=80&w=800&auto=format&fit=crop";
        }

        // Fallback image
        return "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop";
    };

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const data = await getAllCategories();
                const limitedCategories = (data || []).slice(0, 5);
                const formattedCategories = limitedCategories.map((cat) => ({
                    id: cat.id,
                    name: cat.tenDanhMuc,
                    img: getCategoryImage(cat.tenDanhMuc),
                }));
                setCategories(formattedCategories);
            } catch (error) {
                console.error("Lỗi khi lấy danh mục:", error);
            }
        };
        fetchCategories();
    }, []);

    return (
        <section className="bg-white py-8 sm:py-12">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <SectionHeader
                    title="Khám phá theo danh mục"
                    subtitle="Tìm kiếm trải nghiệm hoàn hảo phù hợp với sở thích của bạn để bắt đầu hành trình đáng nhớ."
                    icon={LayoutGrid}
                    badgeText="Phân loại"
                    iconBg="bg-blue-50"
                    iconColor="text-blue-500"
                />

                <div className="grid grid-cols-2 gap-4 sm:gap-6 md:grid-cols-3 lg:grid-cols-5">
                    {categories.map((cat) => (
                        <Link
                            href={`/tours?category=${cat.id}`}
                            key={cat.id}
                            className="group relative flex h-72 flex-col justify-end overflow-hidden rounded-2xl shadow-md transition-all duration-500 hover:-translate-y-2 hover:shadow-xl"
                        >
                            <img
                                key={cat.img}
                                src={cat.img}
                                alt={cat.name}
                                onError={(e) => {
                                    e.target.src = "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop";
                                }}
                                className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300 group-hover:from-black/90" />

                            <div className="relative p-5 text-center">
                                <h3 className="text-lg font-bold text-white transition-colors duration-300 sm:text-xl">
                                    {cat.name}
                                </h3>
                                <div className="mt-2 h-1 w-0 bg-amber-500 mx-auto transition-all duration-300 group-hover:w-12" />
                            </div>
                        </Link>
                    ))}
                </div>
            </div>
        </section>
    );
}
