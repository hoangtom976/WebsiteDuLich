"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { MessageSquare, X, Send } from "lucide-react";

export default function Chatbox() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Nút bấm nổi */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button
          size="icon"
          className="rounded-full w-14 h-14 shadow-lg"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? (
            <X className="w-7 h-7" />
          ) : (
            <MessageSquare className="w-7 h-7" />
          )}
        </Button>
      </div>

      {/* Cửa sổ chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 z-50 animate-in slide-in-from-bottom-5 fade-in-50">
          <Card className="w-80 shadow-xl">
            <CardHeader className="flex flex-row items-center justify-between bg-gray-100 p-4">
              <CardTitle className="text-lg">Việt Tour AI</CardTitle>
              <div className="flex items-center gap-1.5">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                </span>
                <p className="text-xs text-muted-foreground">Online</p>
              </div>
            </CardHeader>
            <CardContent className="p-4 h-80 overflow-y-auto">
              <p className="text-sm text-center text-gray-500 mt-4">
                Bắt đầu cuộc trò chuyện...
              </p>
            </CardContent>
            <CardFooter className="p-2 border-t">
              <form className="w-full flex items-center gap-2">
                <Input placeholder="Nhập câu hỏi..." />
                <Button type="submit" size="icon">
                  <Send className="w-4 h-4" />
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      )}
    </>
  );
}
