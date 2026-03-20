"use client";

import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send, Bot, User, Loader2 } from "lucide-react";
import { askChatbot, getSuggestedQuestions, getUserChatSessions, getChatHistory } from "@/services/chatbotService";
import { getAuthState } from "@/lib/auth-client";
import { getTourById } from "@/services/tourService";
import TourCard from "./TourCard";

// =============== ChatMessage Component ===============
function ChatMessage({ content, role }) {
  const [cleanContent, setCleanContent] = useState("");
  const [tourIds, setTourIds] = useState([]);
  const [tours, setTours] = useState({});
  const [isLoadingTours, setIsLoadingTours] = useState(false);

  useEffect(() => {
    // Parser to extract all [TOURID:id] tags and clean the text
    const regex = /\[TOURID:(\d+)\]/g;
    let match;
    const ids = [];
    let text = content;

    while ((match = regex.exec(content)) !== null) {
      ids.push(parseInt(match[1]));
    }

    // Remove the tags from the text
    text = text.replace(regex, '').trim();
    
    setCleanContent(text);
    setTourIds(ids);
  }, [content]);

  useEffect(() => {
    const fetchTours = async () => {
      if (tourIds.length === 0) return;
      setIsLoadingTours(true);
      
      const tourData = {};
      for (const id of tourIds) {
        if (!tours[id]) { // Avoid refetching if already fetched
          try {
            const tour = await getTourById(id);
            if (tour) {
              tourData[id] = tour;
            }
          } catch (error) {
            console.error("Failed to fetch tour data for chatbot:", error);
          }
        }
      }
      
      if (Object.keys(tourData).length > 0) {
         setTours(prev => ({ ...prev, ...tourData }));
      }
      setIsLoadingTours(false);
    };

    fetchTours();
  }, [tourIds]);

  const renderText = (text) => {
    return text.split('\n').map((line, i) => (
      <span key={i}>
        {line}
        <br />
      </span>
    ));
  };

  return (
    <div className="flex flex-col gap-2">
      <div>{renderText(cleanContent)}</div>
      
      {/* Render TourCards if tour tags are found */}
      {tourIds.length > 0 && (
        <div className="flex flex-col gap-3 mt-2 w-full max-w-[280px]">
           {isLoadingTours && Object.keys(tours).length === 0 && (
              <div className="flex items-center gap-2 text-xs text-green-600">
                <Loader2 className="w-3 h-3 animate-spin"/> Đang tải thông tin tour...
              </div>
           )}
           {tourIds.map(id => tours[id] ? (
              <div key={id} className="w-[260px] transform origin-top-left scale-[0.85] -mb-12">
                <TourCard tour={tours[id]} />
              </div>
           ) : null)}
        </div>
      )}
    </div>
  );
}
// =====================================================

export default function Chatbox() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [phienChatId, setPhienChatId] = useState(null);
  const [suggestions, setSuggestions] = useState([]);
  const [isInitializingDialog, setIsInitializingDialog] = useState(false);

  const messagesEndRef = useRef(null);
  const auth = getAuthState();

  // Handle initialization on open
  useEffect(() => {
    const initializeChatbox = async () => {
      if (!isOpen || messages.length > 0) return;
      
      setIsInitializingDialog(true);
      try {
        let hasHistory = false;
        
        // 1. If logged in, look for existing chat sessions
        if (auth.isLoggedIn && auth.user?.id) {
          const sessions = await getUserChatSessions(auth.user.id);
          if (sessions && sessions.length > 0) {
            // Get the most recent session
            const latestSession = sessions[0];
            const history = await getChatHistory(latestSession.id);
            
            if (history && history.length > 0) {
               setPhienChatId(latestSession.id);
               // Map backend format to frontend format {role, content}
               const formattedHistory = history.map(msg => ({
                  role: msg.nguoiGui,
                  content: msg.noiDung
               }));
               setMessages(formattedHistory);
               hasHistory = true;
            }
          }
        }
        
        // 2. Fetch suggestions if no history
        if (!hasHistory) {
          try {
            const sugs = await getSuggestedQuestions();
            setSuggestions(sugs);
          } catch (err) {
             console.error("Could not fetch suggestions", err);
          }
        }
      } catch (error) {
        console.error("Error initializing chatbox:", error);
      } finally {
        setIsInitializingDialog(false);
      }
    };

    initializeChatbox();
  }, [isOpen, auth.isLoggedIn, auth.user?.id]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = async (text) => {
    if (!text.trim()) return;

    const newMessages = [...messages, { role: "USER", content: text }];
    setMessages(newMessages);
    setInputValue("");
    setIsLoading(true);
    setSuggestions([]); // hide suggestions when chat starts

    try {
      const requestData = {
        cauHoi: text,
        phienChatId: phienChatId,
        nguoiDungId: auth.isLoggedIn && auth.user?.id ? auth.user.id : null
      };

      const response = await askChatbot(requestData);

      if (!phienChatId && response.phienChatId) {
        setPhienChatId(response.phienChatId);
      }

      setMessages([...newMessages, { role: "AI", content: response.cauTraLoi }]);
    } catch (error) {
      console.error("Chatbot API error:", error);
      setMessages([...newMessages, { role: "AI", content: "Xin lỗi anh/chị, hệ thống đang bận. Vui lòng thử lại sau!" }]);
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (e) => {
    e.preventDefault();
    handleSend(inputValue);
  };

  return (
    <>
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="rounded-full w-14 h-14 shadow-lg bg-green-500 hover:bg-green-600"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="w-7 h-7 text-white" />
          ) : (
            <MessageSquare className="w-7 h-7 text-white" />
          )}
        </Button>
      </div>

      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in-50">
          <Card className="w-80 md:w-96 shadow-2xl flex flex-col h-[500px] border-0">
            <CardHeader className="flex flex-row items-center justify-between bg-gradient-to-r from-green-500 to-green-600 p-4 text-white rounded-t-xl">
              <div className="flex items-center gap-3">
                <div className="bg-white p-2 rounded-full">
                  <Bot className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <CardTitle className="text-lg font-bold">Việt Tour AI</CardTitle>
                  <div className="flex items-center gap-1.5 mt-1">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-200 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-green-300"></span>
                    </span>
                    <p className="text-xs text-green-100">Đang hoạt động</p>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 flex-1 overflow-y-auto bg-gray-50 flex flex-col gap-4">
              {isInitializingDialog ? (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                   <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
                   <p className="text-sm text-gray-500">Đang tải hộp thoại...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                  <Bot className="w-12 h-12 text-gray-300" />
                  <p className="text-sm text-gray-500">
                    Xin chào! Em là trợ lý AI của Việt Tour. Em có thể giúp gì cho anh/chị?
                  </p>
                  {suggestions.length > 0 && (
                    <div className="flex flex-col gap-2 w-full mt-4">
                      {suggestions.map((q, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSend(q)}
                          className="text-xs bg-white border border-green-200 text-green-700 p-2 rounded-lg hover:bg-green-50 transition-colors text-left"
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              ) : (
                messages.map((msg, index) => (
                  <div
                    key={index}
                    className={`flex items-end gap-2 ${msg.role === "USER" ? "justify-end" : "justify-start"
                      }`}
                  >
                    {msg.role === "AI" && (
                      <div className="w-8 h-8 rounded-full flex-shrink-0 bg-green-100 flex items-center justify-center mb-1">
                        <Bot className="w-5 h-5 text-green-600" />
                      </div>
                    )}
                    <div
                      className={`max-w-[85%] p-3 rounded-2xl text-sm ${msg.role === "USER"
                          ? "bg-green-500 text-white rounded-br-none"
                          : "bg-white border text-gray-700 rounded-bl-none shadow-sm"
                        }`}
                    >
                      <ChatMessage content={msg.content} role={msg.role} />
                    </div>
                    {msg.role === "USER" && (
                      <div className="w-8 h-8 rounded-full flex-shrink-0 bg-gray-200 flex items-center justify-center mb-1">
                        <User className="w-5 h-5 text-gray-500" />
                      </div>
                    )}
                  </div>
                ))
              )}

              {isLoading && (
                <div className="flex items-end gap-2 justify-start">
                  <div className="w-8 h-8 rounded-full flex-shrink-0 bg-green-100 flex items-center justify-center mb-1">
                    <Bot className="w-5 h-5 text-green-600" />
                  </div>
                  <div className="bg-white border text-gray-500 p-3 rounded-2xl rounded-bl-none shadow-sm flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-100"></span>
                    <span className="w-2 h-2 rounded-full bg-gray-400 animate-bounce delay-200"></span>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </CardContent>
            <CardFooter className="p-3 bg-white border-t rounded-b-xl">
              <form onSubmit={onSubmit} className="w-full flex items-center gap-2">
                <Input
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Nhập câu hỏi..."
                  className="flex-1 rounded-full border-gray-300 focus-visible:ring-green-500"
                  disabled={isLoading}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="rounded-full bg-green-500 hover:bg-green-600 flex-shrink-0"
                  disabled={isLoading || !inputValue.trim()}
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
