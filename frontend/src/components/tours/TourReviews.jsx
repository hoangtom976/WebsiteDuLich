import { getReviewsByTourId } from "@/services/reviewService";
import { Star, StarHalf, MessageSquare } from "lucide-react";

function StarRating({ rating }) {
  const fullStars = Math.floor(rating);
  const halfStar = rating % 1 !== 0;
  const emptyStars = 5 - fullStars - (halfStar ? 1 : 0);

  return (
    <div className="flex items-center">
      {[...Array(fullStars)].map((_, i) => (
        <Star
          key={`full-${i}`}
          className="w-5 h-5 text-yellow-400 fill-yellow-400"
        />
      ))}
      {halfStar && (
        <StarHalf className="w-5 h-5 text-yellow-400 fill-yellow-400" />
      )}
      {[...Array(emptyStars)].map((_, i) => (
        <Star
          key={`empty-${i}`}
          className="w-5 h-5 text-gray-300 fill-gray-300"
        />
      ))}
    </div>
  );
}

export default async function TourReviews({ tourId }) {
  const reviews = await getReviewsByTourId(tourId);

  if (!reviews || reviews.length === 0) {
    return (
      <div className="mt-12 text-center">
        <h2 className="text-2xl font-bold mb-4">Đánh giá của khách hàng</h2>
        <p className="text-muted-foreground">
          Chưa có đánh giá nào cho tour này.
        </p>
      </div>
    );
  }

  return (
    <div className="mt-12">
      <h2 className="text-2xl font-bold mb-6">Đánh giá của khách hàng</h2>
      <div className="space-y-8">
        {reviews.map((review) => (
          <div key={review.id} className="flex flex-col sm:flex-row gap-4">
            <div className="flex-shrink-0">
              <div className="w-12 h-12 rounded-full bg-gray-200 flex items-center justify-center font-bold text-gray-600">
                {review.tenNguoiDung.charAt(0)}
              </div>
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between">
                <h4 className="font-semibold">{review.tenNguoiDung}</h4>
                <span className="text-sm text-muted-foreground">
                  {new Date(review.ngayDanhGia).toLocaleDateString("vi-VN")}
                </span>
              </div>
              <StarRating rating={review.soSao} />
              <p className="mt-2 text-gray-700">{review.binhLuan}</p>

              {review.phanHoi && (
                <div className="mt-4 ml-4 p-4 bg-gray-100 rounded-lg border">
                  <div className="flex items-center justify-between">
                    <p className="font-semibold text-sm text-blue-600">
                      Phản hồi từ Việt Tour
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.phanHoi.ngayPhanHoi).toLocaleDateString(
                        "vi-VN",
                      )}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-gray-600">
                    {review.phanHoi.noiDung}
                  </p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
