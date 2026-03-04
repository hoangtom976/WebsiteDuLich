"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getCurrentWeather } from "@/services/weatherService";

const WEATHER_CITIES = [
  { id: 1, thanhPho: "Ha Noi", lat: 21.0278, lon: 105.8342 },
  { id: 2, thanhPho: "Da Nang", lat: 16.0544, lon: 108.2022 },
  { id: 3, thanhPho: "Ho Chi Minh", lat: 10.8231, lon: 106.6297 },
  { id: 4, thanhPho: "Nha Trang", lat: 12.2388, lon: 109.1967 },
  { id: 5, thanhPho: "Da Lat", lat: 11.9404, lon: 108.4583 },
  { id: 6, thanhPho: "Phu Quoc", lat: 10.2899, lon: 103.984 },
];

export default function AdminWeatherPage() {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [citiesWeather, setCitiesWeather] = useState([]);

  const fetchWeather = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const results = await Promise.allSettled(
        WEATHER_CITIES.map(async (city) => {
          const weather = await getCurrentWeather(city.lat, city.lon);
          return {
            ...city,
            ...weather,
            thanhPho: weather.thanhPho || city.thanhPho,
          };
        }),
      );

      const resolved = results
        .filter((item) => item.status === "fulfilled")
        .map((item) => item.value);

      if (!resolved.length) {
        setError("Khong tai duoc du lieu thoi tiet. Vui long thu lai.");
      }

      setCitiesWeather(resolved);
    } catch {
      setError("Khong tai duoc du lieu thoi tiet. Vui long thu lai.");
      setCitiesWeather([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchWeather();
  }, [fetchWeather]);

  const filtered = useMemo(() => {
    const keyword = query.trim().toLowerCase();
    if (!keyword) return citiesWeather;

    return citiesWeather.filter((item) => item.thanhPho.toLowerCase().includes(keyword));
  }, [citiesWeather, query]);

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Bang du bao thoi tiet</CardTitle>
        <Button variant="outline" onClick={fetchWeather} disabled={loading}>
          {loading ? "Dang tai..." : "Lam moi"}
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Input
          placeholder="Tim thanh pho..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="max-w-sm"
        />

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {loading ? (
            <p className="text-sm text-slate-500">Dang tai du lieu...</p>
          ) : filtered.length === 0 ? (
            <p className="text-sm text-slate-500">Khong co thanh pho phu hop.</p>
          ) : (
            filtered.map((item) => (
              <div key={item.id} className="rounded-lg border bg-white p-4">
                <p className="text-sm text-slate-500">Thanh pho</p>
                <p className="text-lg font-bold text-slate-900">{item.thanhPho}</p>
                <p className="mt-2 text-2xl font-black text-blue-700">{Math.round(item.nhietDo)} C</p>
                <p className="mt-1 text-sm text-slate-600 capitalize">{item.moTa || "-"}</p>
                <p className="mt-1 text-xs text-slate-500">Do am: {item.doAm}%</p>
                <p className="text-xs text-slate-500">Cam giac nhu: {Math.round(item.camGiacNhu)} C</p>
                <p className="text-xs text-slate-400">Cap nhat: {item.thoiGian || "-"}</p>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  );
}
