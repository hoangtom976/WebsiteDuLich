"use client";

import { useState, useEffect } from "react";
import { getWeather, getForecast } from "@/services/weatherService";
import { Loader2, MapPin, Wind, Droplets, Sunrise, Sunset } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function WeatherPage() {
  const [currentWeather, setCurrentWeather] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWeatherData(lat, lon) {
      const [current, forecastData] = await Promise.all([
        getWeather(lat, lon),
        getForecast(lat, lon),
      ]);
      setCurrentWeather(current);
      setForecast(forecastData);
      setLoading(false);
    }

    // Sử dụng dữ liệu giả lập vị trí
    const mockPosition = { coords: { latitude: 10.8231, longitude: 106.6297 } }; // TP. HCM
    fetchWeatherData(
      mockPosition.coords.latitude,
      mockPosition.coords.longitude,
    );

    // Logic lấy vị trí thật (sẽ dùng khi kết nối backend)
    /*
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          fetchWeatherData(position.coords.latitude, position.coords.longitude);
        },
        () => {
          // Nếu không lấy được vị trí, dùng vị trí mặc định
          fetchWeatherData(10.8231, 106.6297); // TP. HCM
        }
      );
    } else {
      fetchWeatherData(10.8231, 106.6297); // TP. HCM
    }
    */
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-[calc(100vh-80px)]">
        <Loader2 className="w-10 h-10 animate-spin" />
        <p className="ml-4 text-lg">Đang tải dữ liệu thời tiết...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-[calc(100vh-200px)]">
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl">
            Dự Báo Thời Tiết
          </h1>
          {currentWeather && (
            <p className="mt-4 text-lg leading-8 text-gray-600 flex items-center justify-center gap-2">
              <MapPin className="w-5 h-5" /> {currentWeather.thanhPho}
            </p>
          )}
        </div>

        {/* 5-Day Forecast */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {forecast.map((day, index) => (
            <Card key={index} className="text-center">
              <CardHeader>
                <CardTitle className="text-lg">
                  {new Date(day.ngay).toLocaleDateString("vi-VN", {
                    weekday: "long",
                  })}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center">
                <img
                  src={`https://openweathermap.org/img/wn/${day.icon}@2x.png`}
                  alt={day.moTa}
                  className="w-20 h-20"
                />
                <p className="text-3xl font-bold mt-2">{day.nhietDo}°C</p>
                <p className="text-muted-foreground capitalize">{day.moTa}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
