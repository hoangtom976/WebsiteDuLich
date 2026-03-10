import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, User } from "lucide-react";

export default function BlogCard({ post }) {
  // Định dạng ngày tháng cho đẹp hơn
  const formattedDate = new Date(post.ngayTao).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });

  return (
    <Link href={`/blog/${post.slug}`} className="group block h-full">
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-2xl transition-all duration-500 border-none bg-white rounded-2xl">
        <div className="relative overflow-hidden aspect-[16/10]">
          <img
            src={post.anhBia || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=800&auto=format&fit=crop"}
            alt={post.tieuDe}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/40 transition-colors" />
        </div>
        <CardContent className="p-6 flex flex-col flex-grow">
          <div className="flex items-center text-xs font-medium text-amber-600 mb-3 bg-amber-50 w-fit px-2 py-1 rounded-md">
            <Calendar className="w-3.5 h-3.5 mr-1.5" />
            {formattedDate} • 5 phút đọc
          </div>
          <h3 className="text-xl font-bold mb-3 group-hover:text-amber-600 transition-colors line-clamp-2 leading-snug">
            {post.tieuDe}
          </h3>
          <p className="text-gray-600 text-sm line-clamp-3 mb-6 flex-grow leading-relaxed">
            {post.moTa || (post.content ? post.content.replace(/<[^>]*>/g, '').substring(0, 150) + "..." : "Khám phá bài viết thú vị về những hành trình du lịch đầy cảm hứng.")}
          </p>
          <div className="flex items-center text-amber-600 font-bold text-sm tracking-wide group/btn">
            ĐỌC TIẾP
            <span className="ml-2 transition-transform duration-300 group-hover/btn:translate-x-1">→</span>
          </div>
        </CardContent>
      </Card>
    </Link>

  );
}
