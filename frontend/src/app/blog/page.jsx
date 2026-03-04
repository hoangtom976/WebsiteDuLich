import { getAllPosts } from "@/services/blogService";
import BlogCard from "@/components/shared/BlogCard";

export default async function BlogPage() {
  const posts = await getAllPosts();

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)]">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Blog Du Lịch
          </h1>
          <p className="mt-4 text-lg leading-8 text-gray-600">
            Những câu chuyện, kinh nghiệm và cảm hứng cho chuyến đi tiếp theo
            của bạn.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <BlogCard key={post.id} post={post} />
          ))}
        </div>
      </div>
    </div>
  );
}
