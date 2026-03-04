"use client";

import { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { adminChatSessions } from "@/lib/admin-mock";

export default function AdminChatbotPage() {
  const [query, setQuery] = useState("");
  const [prompt, setPrompt] = useState(
    "Ban la tro ly Viet Tour. Tra loi tieng Viet lich su va ngan gon.",
  );
  const [sessions] = useState(adminChatSessions);

  const filtered = useMemo(() => {
    return sessions.filter((item) =>
      `${item.nguoiDung} ${item.cauHoi}`.toLowerCase().includes(query.toLowerCase()),
    );
  }, [sessions, query]);

  return (
    <div className="grid gap-4 lg:grid-cols-3">
      <Card className="lg:col-span-2">
        <CardHeader>
          <CardTitle>Lich su phien chat (UI mock)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Tim theo user hoac cau hoi..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="max-w-md"
          />

          <div className="space-y-3">
            {filtered.map((item) => (
              <div key={item.id} className="rounded-lg border bg-white p-4">
                <div className="flex items-center justify-between gap-2">
                  <p className="font-semibold text-slate-900">
                    Session #{item.id} - {item.nguoiDung}
                  </p>
                  <p className="text-xs text-slate-500">{item.thoiGian}</p>
                </div>
                <p className="mt-2 text-sm text-slate-800">
                  <span className="font-medium">Q:</span> {item.cauHoi}
                </p>
                <p className="mt-1 text-sm text-slate-600">
                  <span className="font-medium">A:</span> {item.traLoiTomTat}
                </p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Cau hinh prompt (UI mock)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <Textarea value={prompt} onChange={(e) => setPrompt(e.target.value)} className="min-h-40" />
          <Button className="w-full">Luu prompt</Button>
          <p className="text-xs text-slate-500">
            Ban frontend: nut nay chi cap nhat giao dien, chua goi Groq API.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

