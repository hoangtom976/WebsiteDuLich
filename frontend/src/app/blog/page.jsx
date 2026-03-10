import { getAllPosts, getRecentPosts } from "@/services/blogService";
import { getPopularTours } from "@/services/tourService";
import { getAllCategories } from "@/services/categoryService";
import BlogCard from "@/components/shared/BlogCard";
import BlogSidebar from "@/components/blog/BlogSidebar";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

export default async function BlogPage({ searchParams }) {
  const awaitedParams = await searchParams;
  const searchTerm = awaitedParams?.search || "";
  const activeCategory = awaitedParams?.category || "all";

  // Fetch data in parallel
  const [allPosts, popularPosts, popularTours, categories] = await Promise.all([
    getAllPosts(),
    getRecentPosts(5),
    getPopularTours(),
    getAllCategories()
  ]);

  // Filter posts based on search and category
  const filteredPosts = (allPosts || []).filter(post => {
    if (!post) return false;
    const title = post.tieuDe || "";
    const content = post.content || "";
    const matchesSearch = title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  });

  const displayCategories = [
    { id: "all", name: "Tất cả" },
    { id: "1", name: "Biển đảo" },
    { id: "2", name: "Văn hóa" },
    { id: "3", name: "Sinh thái" },
    { id: "4", name: "Nghỉ dưỡng" }
  ];

  return (
    <div className="bg-gray-50 min-h-screen">
      {/* 1. Hero Blog Section */}
      <section className="relative h-[400px] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1596422846543-75c6fc197f07?q=80&w=1920&auto=format&fit=crop"
            alt="Hero Background"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/50" />
        </div>
        <div className="relative z-10 text-center px-4 max-w-4xl">
          <h2 className="text-sm font-bold tracking-[0.2em] mb-4 text-amber-500 uppercase">Cẩm Nang Du Lịch</h2>
          <h1 className="text-4xl md:text-6xl font-extrabold mb-6 tracking-tight leading-tight">
            Khám phá kinh nghiệm du lịch khắp Việt Nam
          </h1>
          <p className="text-lg md:text-xl text-gray-200 font-medium">
            Những câu chuyện, bí kíp và cảm hứng cho chuyến hành trình tiếp theo của bạn.
          </p>
        </div>
      </section>

      <div className="container mx-auto px-4 max-w-7xl -mt-10 relative z-20 pb-20">
        {/* 2. Thanh Tìm Kiếm & Danh Mục */}
        <div className="bg-white p-6 rounded-2xl shadow-xl mb-12 border border-gray-100">
          <div className="flex flex-col lg:flex-row gap-6 items-center">
            {/* Search Input */}
            <form action="/blog" className="relative flex-grow w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                name="search"
                defaultValue={searchTerm}
                placeholder="Tìm bài viết du lịch..."
                className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-gray-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 transition-all text-gray-900 placeholder:text-gray-400 font-medium"
              />
            </form>

          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* 3. Grid Bài Viết (2/3 width) */}
          <div className="lg:w-2/3">
            {filteredPosts.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {filteredPosts.map((post) => (
                  <BlogCard key={post.id} post={post} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm px-6">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Search className="w-8 h-8 text-gray-300" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Không tìm thấy bài viết</h3>
                <p className="text-gray-500 text-lg">Thử tìm kiếm với từ khóa khác hoặc quay lại sau.</p>
                <Button asChild variant="outline" className="mt-8 px-8 border-amber-200 text-amber-600 hover:bg-amber-50">
                  <a href="/blog">Xem tất cả bài viết</a>
                </Button>
              </div>
            )}

            {/* Simple Pagination Placeholder */}
            {filteredPosts.length > 0 && (
              <div className="mt-16 flex justify-center gap-2">
                <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-sm font-bold hover:bg-amber-50 hover:text-amber-600 transition-colors bg-white">1</button>
                <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-sm font-bold hover:bg-amber-50 hover:text-amber-600 transition-colors bg-white">2</button>
                <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-sm font-bold hover:bg-amber-50 hover:text-amber-600 transition-colors bg-white">...</button>
                <button className="w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-sm font-bold hover:bg-amber-50 hover:text-amber-600 transition-colors bg-white">10</button>
              </div>
            )}
          </div>

          {/* 4. Sidebar Blog (1/3 width) */}
          <div className="lg:w-1/3">
            <BlogSidebar
              popularPosts={popularPosts}
              categories={displayCategories.slice(1)}
              relatedTours={popularTours}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

