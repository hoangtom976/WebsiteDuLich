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
    <Link href={`/blog/${post.slug}`} className="group">
      <Card className="overflow-hidden h-full flex flex-col hover:shadow-lg transition-shadow duration-300">
        <img
          src={post.anhBia || "https://via.placeholder.com/400x250"}
          alt={post.tieuDe}
          width={400}
          height={250}
          className="w-full h-48 object-cover"
        />
        <CardContent className="p-4 flex flex-col flex-grow">
          <h3 className="text-lg font-semibold mb-2 group-hover:text-blue-600 transition-colors flex-grow">
            {post.tieuDe}
          </h3>
          <div className="flex items-center text-sm text-muted-foreground mt-4">
            <Calendar className="w-4 h-4 mr-2" /> {formattedDate}
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
