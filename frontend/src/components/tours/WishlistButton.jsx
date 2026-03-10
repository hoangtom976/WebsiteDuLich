"use client";

import { useState } from "react";
import { Heart } from "lucide-react";
import { toggleYeuThich } from "@/services/yeuThichService";
import { toast } from "sonner";
import { getAuthState } from "@/lib/auth-client";

export default function WishlistButton({ tourId, initialStatus }) {
    const [isFavorite, setIsFavorite] = useState(initialStatus);
    const auth = getAuthState();

    const handleToggle = async (e) => {
        e.preventDefault();
        if (!auth.isLoggedIn) {
            toast.error("Vui lòng đăng nhập để sử dụng tính năng này");
            return;
        }

        try {
            await toggleYeuThich(tourId);
            const newStatus = !isFavorite;
            setIsFavorite(newStatus);
            if (newStatus) {
                toast.success("Đã thêm vào danh sách yêu thích");
            } else {
                toast.info("Đã xóa khỏi danh sách yêu thích");
            }
        } catch (error) {
            toast.error("Không thể cập nhật danh sách yêu thích");
        }
    };

    return (
        <button
            onClick={handleToggle}
            className="flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/20 transition-all group/heart active:scale-95 self-start sm:self-auto"
        >
            <Heart className={`w-5 h-5 transition-colors ${isFavorite ? 'fill-rose-500 text-rose-500' : 'text-white group-hover/heart:text-rose-400'}`} />
            <span className="text-sm font-bold text-white">Yêu thích</span>
        </button>
    );
}
