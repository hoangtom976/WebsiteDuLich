"use client";

import { useEffect, useState, useRef } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import {
  MessageCircle, Trash2, User, Bot, Clock, AlertCircle, RefreshCw,
  Database, Upload, FileText, X, CheckCircle2, Loader2, Zap
} from "lucide-react";

import { getAllChatSessions, syncChatbotData, getRAGStats, uploadDocument, deleteDocument } from "@/services/chatbotService.admin";
import { getChatHistory, deleteChatHistory } from "@/services/chatbotService";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

export default function AdminChatbotPage() {
  const [sessions, setSessions] = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(true);

  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const [sessionToDelete, setSessionToDelete] = useState(null);

  // RAG Management States
  const [ragStats, setRagStats] = useState(null);
  const [syncing, setSyncing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [docToDelete, setDocToDelete] = useState(null);
  const fileInputRef = useRef(null);

  const fetchSessions = async () => {
    try {
      setLoadingSessions(true);
      const data = await getAllChatSessions();
      setSessions(data || []);
    } catch (error) {
      console.error("Lỗi tải danh sách phiên chat:", error);
      toast.error("Không thể tải danh sách phiên chat");
    } finally {
      setLoadingSessions(false);
    }
  };

  const fetchRAGStats = async () => {
    try {
      const data = await getRAGStats();
      setRagStats(data);
      setDocuments(data?.danhSachTaiLieu || []);
    } catch (error) {
      console.error("Lỗi tải thống kê RAG:", error);
    }
  };

  useEffect(() => {
    fetchSessions();
    fetchRAGStats();
  }, []);

  useEffect(() => {
    if (!selectedSessionId) {
      setChatHistory([]);
      return;
    }

    const fetchHistory = async () => {
      try {
        setLoadingHistory(true);
        const data = await getChatHistory(selectedSessionId);
        setChatHistory(data || []);
      } catch (error) {
        console.error("Lỗi tải lịch sử chat:", error);
        toast.error("Không thể tải chi tiết cuộc hội thoại");
      } finally {
        setLoadingHistory(false);
      }
    };

    fetchHistory();
  }, [selectedSessionId]);

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;

    try {
      await deleteChatHistory(sessionToDelete);
      toast.success("Đã xóa phiên chat thành công");

      if (selectedSessionId === sessionToDelete) {
        setSelectedSessionId(null);
        setChatHistory([]);
      }

      setSessions(prev => prev.filter(s => s.id !== sessionToDelete));
    } catch (error) {
      console.error("Lỗi xóa phiên chat:", error);
      toast.error("Không thể xóa phiên chat lúc này");
    } finally {
      setSessionToDelete(null);
    }
  };

  const handleSync = async () => {
    try {
      setSyncing(true);
      const result = await syncChatbotData();
      toast.success(`Đồng bộ thành công: ${result.soLuongTour} tour → Qdrant`);
      fetchRAGStats();
    } catch (error) {
      console.error("Lỗi đồng bộ:", error);
      toast.error("Đồng bộ thất bại: " + (error.response?.data?.message || error.message));
    } finally {
      setSyncing(false);
    }
  };

  const handleUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.toLowerCase().endsWith('.txt')) {
      toast.error("Chỉ chấp nhận file .txt");
      return;
    }

    try {
      setUploading(true);
      const result = await uploadDocument(file);
      toast.success(`Upload thành công: ${result.tenFile} (${result.soChunks} chunks)`);
      fetchRAGStats();
    } catch (error) {
      console.error("Lỗi upload:", error);
      toast.error("Upload thất bại: " + (error.response?.data?.message || error.message));
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const handleDeleteDocument = async () => {
    if (!docToDelete) return;
    try {
      await deleteDocument(docToDelete);
      toast.success(`Đã xóa tài liệu: ${docToDelete}`);
      fetchRAGStats();
    } catch (error) {
      console.error("Lỗi xóa tài liệu:", error);
      toast.error("Không thể xóa tài liệu");
    } finally {
      setDocToDelete(null);
    }
  };

  const formatTime = (isoString) => {
    if (!isoString) return "";
    try {
      return format(new Date(isoString), "HH:mm, dd/MM/yyyy", { locale: vi });
    } catch {
      return isoString;
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-6rem)] overflow-hidden bg-white/50 shadow-lg border border-slate-200">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 bg-white/80">
        <div className="flex items-center gap-3 text-slate-800">
          <div className="p-2 bg-blue-100 text-blue-600 rounded-lg">
            <MessageCircle className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-sky-500">
              Quản lý Chatbot AI
            </h1>
            <p className="text-sm text-slate-500">Giám sát & quản lý RAG Chatbot</p>
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={fetchSessions} disabled={loadingSessions}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loadingSessions ? 'animate-spin' : ''}`} />
          Làm mới
        </Button>
      </div>

      {/* RAG Management Bar */}
      <div className="px-6 py-3 border-b border-slate-200 bg-gradient-to-r from-indigo-50 to-blue-50">
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-4">
            {/* Qdrant Status */}
            <div className="flex items-center gap-2 text-sm">
              <Database className="w-4 h-4 text-indigo-500" />
              <span className="text-slate-600">Qdrant:</span>
              {ragStats?.qdrantKhaDung ? (
                <span className="flex items-center gap-1 text-green-600 font-medium">
                  <CheckCircle2 className="w-3.5 h-3.5" /> Hoạt động
                </span>
              ) : (
                <span className="flex items-center gap-1 text-red-500 font-medium">
                  <AlertCircle className="w-3.5 h-3.5" /> Không kết nối
                </span>
              )}
            </div>

            {/* Vector Count */}
            <div className="px-3 py-1 bg-white border border-indigo-200 rounded-full text-sm font-medium text-indigo-700">
              <Zap className="w-3.5 h-3.5 inline mr-1" />
              {ragStats?.tongSoVector ?? "..."} vectors
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Sync Button */}
            <Button
              size="sm"
              onClick={handleSync}
              disabled={syncing}
              className="bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {syncing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              {syncing ? "Đang đồng bộ..." : "Đồng bộ Tour"}
            </Button>

            {/* Upload Button */}
            <Button
              size="sm"
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="border-indigo-300 text-indigo-700 hover:bg-indigo-50"
            >
              {uploading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Upload className="w-4 h-4 mr-2" />
              )}
              {uploading ? "Đang upload..." : "Upload Tài Liệu (.txt)"}
            </Button>
            <input
              ref={fileInputRef}
              type="file"
              accept=".txt"
              onChange={handleUpload}
              className="hidden"
            />
          </div>
        </div>

        {/* Documents List */}
        {documents.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-2">
            {documents.map((doc, idx) => (
              <div
                key={idx}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-sm text-slate-700 group hover:border-red-200 transition-colors"
              >
                <FileText className="w-3.5 h-3.5 text-indigo-400" />
                <span>{doc}</span>
                <button
                  onClick={() => setDocToDelete(doc)}
                  className="ml-1 p-0.5 text-slate-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  title="Xóa tài liệu này"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Cột trái: Danh sách phiên chat */}
        <div className="w-1/3 min-w-[300px] border-r border-slate-200 bg-slate-50/50 flex flex-col">
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {loadingSessions ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                <p>Đang tải danh sách...</p>
              </div>
            ) : sessions.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                <AlertCircle className="w-12 h-12 text-slate-300" />
                <p>Chưa có phiên chat nào.</p>
              </div>
            ) : (
              sessions.map(session => (
                <div
                  key={session.id}
                  onClick={() => setSelectedSessionId(session.id)}
                  className={`relative p-4 rounded-xl border cursor-pointer transition-all duration-200 group flex flex-col gap-2 ${selectedSessionId === session.id
                    ? 'bg-blue-50 border-blue-300 shadow-sm ring-1 ring-blue-200'
                    : 'bg-white border-slate-200 hover:border-blue-300 hover:shadow-md'
                    }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <h3 className="font-semibold text-slate-800 line-clamp-2 text-sm">
                      {session.tieuDe || "Hội thoại mới"}
                    </h3>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setSessionToDelete(session.id);
                      }}
                      className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-md transition-colors opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Xóa phiên chat này"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-500 mt-auto">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatTime(session.thoiGianBatDau)}
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded-md text-slate-600 font-medium border border-slate-200">
                      ID: {session.id}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Cột phải: Chat box */}
        <div className="flex-1 bg-white flex flex-col relative bg-[url('https://transparenttextures.com/patterns/cubes.png')] bg-fixed">
          {selectedSessionId ? (
            <>
              {/* Header chi tiết */}
              <div className="px-6 py-3 border-b border-slate-200 bg-white/90 backdrop-blur shadow-sm sticky top-0 z-10 flex justify-between items-center">
                <div>
                  <h2 className="font-bold text-slate-800">
                    Chi tiết Hội Thoại #{selectedSessionId}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {sessions.find(s => s.id === selectedSessionId)?.tieuDe}
                  </p>
                </div>
              </div>

              {/* Lịch sử */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                {loadingHistory ? (
                  <div className="flex flex-col flex-1 h-full items-center justify-center text-slate-400 space-y-3">
                    <RefreshCw className="w-8 h-8 animate-spin text-blue-400" />
                    <p>Đang tải nội dung...</p>
                  </div>
                ) : chatHistory.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-3">
                    <AlertCircle className="w-12 h-12 text-slate-300" />
                    <p>Phiên chat này không có tin nhắn nào.</p>
                  </div>
                ) : (
                  chatHistory.map((msg, idx) => {
                    const isUser = msg.nguoiGui !== "AI";
                    return (
                      <div key={idx} className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-1 shadow-sm ${isUser ? 'bg-gradient-to-tr from-blue-500 to-blue-600 text-white' : 'bg-gradient-to-tr from-emerald-400 to-teal-500 text-white'
                          }`}>
                          {isUser ? <User className="w-4 h-4" /> : <Bot className="w-5 h-5" />}
                        </div>

                        <div className={`max-w-[75%] flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
                          <div className={`px-5 py-3 rounded-2xl text-sm leading-relaxed shadow-sm break-words whitespace-pre-wrap ${isUser
                            ? 'bg-blue-500 text-white rounded-tr-sm'
                            : 'bg-white border border-slate-200 text-slate-700 rounded-tl-sm'
                            }`}>
                            {msg.noiDung}
                          </div>
                          <span className="text-[11px] text-slate-400 mt-1.5 px-1 flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {formatTime(msg.thoiGian)}
                          </span>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-400 space-y-4">
              <div className="p-6 bg-slate-50 rounded-full border border-dashed border-slate-300 w-24 h-24 flex items-center justify-center">
                <MessageCircle className="w-10 h-10 text-slate-300" />
              </div>
              <p className="text-lg font-medium text-slate-500">Chọn một phiên chat để xem chi tiết</p>
            </div>
          )}
        </div>
      </div>

      {/* Dialog xóa phiên chat */}
      <AlertDialog open={!!sessionToDelete} onOpenChange={(open) => !open && setSessionToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Xác nhận xóa phiên chat
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa phiên chat này không? Mọi nội dung trò chuyện sẽ bị xóa vĩnh viễn và không thể khôi phục.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDeleteSession(); }}
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              Xóa Vĩnh Viễn
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Dialog xóa tài liệu */}
      <AlertDialog open={!!docToDelete} onOpenChange={(open) => !open && setDocToDelete(null)}>
        <AlertDialogContent className="rounded-2xl">
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2 text-red-600">
              <AlertCircle className="w-5 h-5" />
              Xóa tài liệu
            </AlertDialogTitle>
            <AlertDialogDescription>
              Bạn có chắc chắn muốn xóa tài liệu <strong>&quot;{docToDelete}&quot;</strong> khỏi hệ thống RAG? Chatbot sẽ không còn tham chiếu được nội dung này.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-xl">Hủy</AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => { e.preventDefault(); handleDeleteDocument(); }}
              className="bg-red-600 hover:bg-red-700 rounded-xl"
            >
              Xóa
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
