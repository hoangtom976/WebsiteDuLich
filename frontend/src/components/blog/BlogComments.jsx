"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { User, Send, Loader2 } from "lucide-react";
import { getPostComments, postBlogComment } from "@/services/blogService";
import { toast } from "sonner";

export default function BlogComments({ postId }) {
    const [comments, setComments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [newComment, setNewComment] = useState("");

    useEffect(() => {
        async function loadComments() {
            if (!postId) return;
            try {
                const data = await getPostComments(postId);
                setComments(data);
            } catch (error) {
                console.error("Failed to load comments:", error);
            } finally {
                setLoading(false);
            }
        }
        loadComments();
    }, [postId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!newComment.trim() || !postId) return;

        setSubmitting(true);
        try {
            const savedComment = await postBlogComment(postId, newComment);
            setComments([savedComment, ...comments]);
            setNewComment("");
            toast.success("Đã gửi bình luận của bạn!");
        } catch (error) {
            console.error("Failed to post comment:", error);
            toast.error("Không thể gửi bình luận. Vui lòng thử lại!");
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <section className="mt-16 bg-gray-50 rounded-2xl p-8 border border-gray-100">
            <h3 className="text-2xl font-bold mb-8 flex items-center gap-2">
                Bình luận ({comments.length})
            </h3>

            {/* Comment Form */}
            <form onSubmit={handleSubmit} className="mb-10">
                <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 focus-within:ring-2 focus-within:ring-amber-500/20 focus-within:border-amber-500 transition-all">
                    <textarea
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        placeholder="Chia sẻ suy nghĩ của bạn về bài viết này..."
                        className="w-full min-h-[120px] resize-none border-none focus:ring-0 text-gray-700 bg-transparent disabled:opacity-50"
                        disabled={submitting}
                    />
                    <div className="flex justify-end mt-2 pt-2 border-t border-gray-50">
                        <Button
                            type="submit"
                            className="bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg px-6"
                            disabled={!newComment.trim() || submitting}
                        >
                            {submitting ? (
                                <>
                                    Đang gửi... <Loader2 className="w-4 h-4 ml-2 animate-spin" />
                                </>
                            ) : (
                                <>
                                    Gửi bình luận <Send className="w-4 h-4 ml-2" />
                                </>
                            )}
                        </Button>
                    </div>
                </div>
            </form>

            {/* Comments List */}
            <div className="space-y-6">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                        <Loader2 className="w-8 h-8 animate-spin mb-4" />
                        <p>Đang tải bình luận...</p>
                    </div>
                ) : comments.length > 0 ? (
                    comments.map((comment) => (
                        <div key={comment.id} className="flex gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex-shrink-0 w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center">
                                <User className="w-6 h-6 text-amber-600" />
                            </div>
                            <div className="flex-grow">
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold text-gray-900">{comment.tenNguoiDung}</span>
                                        <span className="text-xs text-gray-400 font-medium">
                                            {new Date(comment.ngayTao).toLocaleDateString("vi-VN", {
                                                day: "2-digit",
                                                month: "2-digit",
                                                year: "numeric"
                                            })}
                                        </span>
                                    </div>
                                    <p className="text-gray-600 text-sm leading-relaxed">{comment.noiDung}</p>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center py-10 text-gray-400 italic">
                        Chưa có bình luận nào. Hãy là người đầu tiên chia sẻ cảm nghĩ!
                    </div>
                )}
            </div>
        </section>
    );
}
