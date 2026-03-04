import { getPostBySlug } from "@/services/blogService";
import { notFound } from "next/navigation";
import { Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";

export default async function PostDetailPage({ params }) {
  const awaitedParams = await params;
  const post = await getPostBySlug(awaitedParams.slug);

  if (!post) {
    notFound();
  }

  const formattedDate = new Date(post.ngayTao).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white py-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <article>
          <header className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-gray-900 leading-tight">
              {post.tieuDe}
            </h1>
            <div className="mt-4 flex items-center text-muted-foreground">
              <Calendar className="w-4 h-4 mr-2" />
              <span>Đăng ngày {formattedDate}</span>
            </div>
          </header>

          <img
            src={post.anhBia}
            alt={post.tieuDe}
            className="w-full h-auto max-h-[500px] object-cover rounded-lg shadow-lg mb-8"
          />

          <div className="prose lg:prose-xl max-w-none">
            <ReactMarkdown>{post.content}</ReactMarkdown>
          </div>
        </article>
      </div>
    </div>
  );
}
