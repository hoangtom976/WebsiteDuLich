"use client";

import { useEffect, useState } from "react";
import { Sun, Cloud, CloudRain, Loader2 } from "lucide-react";
import { getCurrentWeather } from "@/services/weatherService";

export default function Weather() {
  const [weather, setWeather] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchWeather = async () => {
      try {
        // Giả lập lấy vị trí và gọi service
        const data = await getCurrentWeather(10.77, 106.7); // Tọa độ giả lập cho TP.HCM
        if (data) {
          setWeather(data);
        } else {
          setError("Không thể tải dữ liệu thời tiết.");
        }
      } catch (err) {
        setError("Lỗi khi tải thời tiết.");
      }
    };

    fetchWeather();
  }, []);

  if (error) {
    return <div className="text-xs text-gray-500">{error}</div>;
  }

  if (!weather) {
    return (
      <div className="flex items-center gap-2 text-sm text-gray-500">
        <Loader2 className="w-4 h-4 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-sm font-medium text-gray-600">
      <Sun className="w-5 h-5 text-yellow-500" />
      <span>
        {Math.round(weather.nhietDo)}°C, {weather.thanhPho}
      </span>
    </div>
  );
}
