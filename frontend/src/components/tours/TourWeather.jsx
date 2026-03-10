"use client";

import { useEffect, useState } from "react";
import { getForecast } from "@/services/weatherService";
import { Cloud, Sun, CloudRain, CloudLightning, Wind, Thermometer, Droplets, Loader2, CloudSun } from "lucide-react";

export default function TourWeather({ lat, lon, destinationName }) {
    const [forecast, setForecast] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!lat || !lon) {
            setLoading(false);
            return;
        }

        const fetchWeather = async () => {
            try {
                setLoading(true);
                const data = await getForecast(lat, lon);
                setForecast(data);
            } catch (err) {
                console.error("Failed to fetch tour weather:", err);
                setError("Không thể tải thông tin thời tiết");
            } finally {
                setLoading(false);
            }
        };

        fetchWeather();
    }, [lat, lon]);

    if (loading) return <WeatherLoading />;
    if (!lat || !lon) {
        return (
            <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 text-center">
                <CloudSun className="w-8 h-8 text-amber-400 mx-auto mb-2" />
                <p className="text-sm text-amber-800 font-medium">Chưa có thông tin tọa độ cho {destinationName}</p>
                <p className="text-xs text-amber-600 mt-1">Cần cập nhật Latitude/Longitude trong database để xem thời tiết.</p>
            </div>
        );
    }
    if (error || !forecast) return null;

    const today = forecast.danhSachDuBao[0];

    return (
        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1 h-6 bg-blue-400 rounded-full" />
                    Thời tiết tại {destinationName}
                </h2>
                <span className="text-xs text-gray-400 font-medium bg-gray-50 px-2 py-1 rounded-md">
                    Dự báo 5 ngày
                </span>
            </div>

            <div className="p-6">
                {/* Current Day Highlights */}
                <div className="flex items-center justify-between mb-8 bg-gradient-to-br from-blue-50 to-indigo-50 rounded-2xl p-5 border border-blue-100">
                    <div className="flex items-center gap-5">
                        <div className="relative">
                            <img
                                src={`https://openweathermap.org/img/wn/${today.icon}@4x.png`}
                                alt={today.moTa}
                                className="w-20 h-20 drop-shadow-md"
                            />
                        </div>
                        <div>
                            <p className="text-4xl font-black text-blue-900">{Math.round(today.nhietDoNgay)}°C</p>
                            <p className="text-sm font-semibold text-blue-600 capitalize">{today.moTa}</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-gray-600">
                            <Droplets className="w-4 h-4 text-blue-400" />
                            <span className="text-sm font-medium">{today.doAm}%</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                            <Thermometer className="w-4 h-4 text-orange-400" />
                            <span className="text-sm font-medium">{Math.round(today.nhietDoDem)}°C</span>
                        </div>
                    </div>
                </div>

                {/* 5 Day Forecast Grid */}
                <div className="grid grid-cols-5 gap-2">
                    {forecast.danhSachDuBao.map((day, idx) => (
                        <div key={idx} className="flex flex-col items-center p-3 rounded-xl hover:bg-slate-50 transition-colors">
                            <span className="text-[10px] font-bold text-gray-400 uppercase mb-1">
                                {idx === 0 ? "Hôm nay" : day.thoiGian.split('/')[0] + '/' + day.thoiGian.split('/')[1]}
                            </span>
                            <img
                                src={`https://openweathermap.org/img/wn/${day.icon}.png`}
                                alt={day.moTa}
                                className="w-10 h-10"
                            />
                            <span className="text-sm font-bold text-gray-800">{Math.round(day.nhietDoNgay)}°</span>
                            <span className="text-[10px] font-medium text-gray-400">{Math.round(day.nhietDoDem)}°</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

function WeatherLoading() {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-12 flex flex-col items-center justify-center space-y-3">
            <Loader2 className="w-8 h-8 text-blue-400 animate-spin" />
            <p className="text-sm text-gray-400 font-medium">Đang tải thông tin thời tiết...</p>
        </div>
    );
}
