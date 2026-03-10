import { getPostBySlug, getRecentPosts } from "@/services/blogService";
import { getPopularTours } from "@/services/tourService";
import { notFound } from "next/navigation";
import { Calendar, User, Eye, ArrowLeft, Image as ImageIcon } from "lucide-react";
import BlogComments from "@/components/blog/BlogComments";
import BlogCard from "@/components/shared/BlogCard";
import TourCard from "@/components/shared/TourCard";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function PostDetailPage({ params }) {
  const awaitedParams = await params;
  const post = await getPostBySlug(awaitedParams.slug);

  if (!post) {
    notFound();
  }

  // Fetch related data
  const [relatedPosts, relatedTours] = await Promise.all([
    getRecentPosts(4),
    getPopularTours()
  ]);

  const otherPosts = relatedPosts.filter(p => p.id !== post.id).slice(0, 3);

  const formattedDate = new Date(post.ngayTao).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <div className="bg-white min-h-screen">
      {/* 1. Hero / Cover Image Section */}
      <section className="relative h-[60vh] md:h-[75vh] flex items-end overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={post.anhBia || "https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?q=80&w=1920&auto=format&fit=crop"}
            alt={post.tieuDe}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        </div>

        <div className="container mx-auto px-4 max-w-5xl relative z-10 pb-16">
          <Link
            href="/blog"
            className="inline-flex items-center text-white/80 hover:text-white transition-colors mb-8 group bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20 text-sm font-bold"
          >
            <ArrowLeft className="w-4 h-4 mr-2 transition-transform group-hover:-translate-x-1" />
            QUAY LẠI BLOG
          </Link>

          <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-8 tracking-tight leading-[1.1]">
            {post.tieuDe}
          </h1>

          {/* 2. Article Meta Info inside Cover */}
          <div className="flex flex-wrap items-center gap-6 text-white/90">
            <div className="flex items-center gap-2 pr-6 border-r border-white/20">
              <div className="w-10 h-10 rounded-full bg-amber-500 flex items-center justify-center">
                <User className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase font-bold tracking-wider">Tác giả</p>
                <p className="text-sm font-bold">{post.tenTacGia || "VietTour"}</p>
              </div>
            </div>

            <div className="flex items-center gap-2 pr-6 border-r border-white/20">
              <div className="w-10 h-10 rounded-full bg-blue-500/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Calendar className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase font-bold tracking-wider">Ngày đăng</p>
                <p className="text-sm font-bold">{formattedDate}</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <div className="w-10 h-10 rounded-full bg-orange-500/20 backdrop-blur-md flex items-center justify-center border border-white/10">
                <Eye className="w-5 h-5 text-orange-400" />
              </div>
              <div>
                <p className="text-[10px] text-white/60 uppercase font-bold tracking-wider">Lượt xem</p>
                <p className="text-sm font-bold">{post.luotXem?.toLocaleString("vi-VN") || "1.245"}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Main Content Section */}
      <div className="container mx-auto px-4 max-w-4xl py-20">
        <article>
          <div
            className="prose lg:prose-xl max-w-none text-gray-700 leading-relaxed
            [&>section]:mb-12 [&>section>h3]:text-3xl [&>section>h3]:font-bold [&>section>h3]:mb-6 [&>section>h3]:text-gray-900
            [&>section>img]:rounded-2xl [&>section>img]:shadow-2xl [&>section>img]:mb-6
            [&_table]:w-full [&_table]:border-collapse [&_table]:my-10 [&_table]:rounded-xl [&_table]:overflow-hidden [&_table]:shadow-lg
            [&_td]:border [&_td]:border-gray-100 [&_td]:p-4 [&_td]:text-sm
            [&_th]:border [&_th]:border-gray-100 [&_th]:p-4 [&_th]:bg-gray-50 [&_th]:font-bold [&_th]:text-gray-900
            [&_ul]:list-disc [&_ul]:pl-8 [&_ul]:mb-6
            [&_p]:mb-6 [&_p]:text-lg
            [&_a]:text-amber-600 [&_a]:font-bold [&_a]:hover:underline"
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          {/* 4. Comments Section */}
          <BlogComments postId={post.id} />
        </article>

        {/* 5. Related Tours */}
        <section className="mt-24">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-bold text-gray-900">Tour gợi ý khi đọc bài này</h3>
            <Link href="/tours" className="text-amber-600 font-bold hover:underline text-sm uppercase tracking-wider">TẤT CẢ TOUR &rarr;</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {relatedTours.slice(0, 4).map((tour) => (
              <TourCard key={tour.id} tour={tour} />
            ))}
          </div>
        </section>

        {/* 6. Related Posts */}
        <section className="mt-24 border-t border-gray-100 pt-16">
          <div className="flex items-center justify-between mb-10">
            <h3 className="text-2xl font-bold text-gray-900">Bài viết liên quan</h3>
            <Link href="/blog" className="text-amber-600 font-bold hover:underline text-sm uppercase tracking-wider">XEM THÊM &rarr;</Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {otherPosts.map((otherPost) => (
              <BlogCard key={otherPost.id} post={otherPost} />
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

