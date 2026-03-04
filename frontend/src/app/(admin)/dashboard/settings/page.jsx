"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState({
    tenHeThong: "Viet Tour Admin",
    hotline: "1900 1234",
    batEmailThongBao: true,
    batChatbot: true,
    batThoiTiet: true,
  });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cai dat he thong (UI mock)</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-2">
            <Input
              value={settings.tenHeThong}
              onChange={(e) =>
                setSettings((prev) => ({ ...prev, tenHeThong: e.target.value }))
              }
              placeholder="Ten he thong"
            />
            <Input
              value={settings.hotline}
              onChange={(e) => setSettings((prev) => ({ ...prev, hotline: e.target.value }))}
              placeholder="Hotline"
            />
          </div>

          <div className="space-y-2 rounded-lg border bg-white p-4 text-sm">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.batEmailThongBao}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    batEmailThongBao: e.target.checked,
                  }))
                }
              />
              Bat email thong bao
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.batChatbot}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, batChatbot: e.target.checked }))
                }
              />
              Bat chatbot AI
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={settings.batThoiTiet}
                onChange={(e) =>
                  setSettings((prev) => ({ ...prev, batThoiTiet: e.target.checked }))
                }
              />
              Bat module thoi tiet
            </label>
          </div>

          <Button>Luu cai dat</Button>
        </CardContent>
      </Card>
    </div>
  );
}

