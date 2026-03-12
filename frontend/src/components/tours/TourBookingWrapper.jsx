"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";
import DepartureDatePicker from "./DepartureDatePicker";
import { datTour, taoThanhToanVnPay } from "@/services/datTourService";
import { getActiveFlashSaleForTour } from "@/services/promotionService";
import { checkVoucher } from "@/services/voucherService";
import api from "@/lib/api";
import {
    UserPlus, Trash2, Ticket, Loader2, CheckCircle2,
    AlertCircle, Users, Phone, User, CreditCard, QrCode,
    ArrowLeft, ShieldCheck, Clock, X, Banknote, CloudSun,
    Sun, Cloud, CloudRain, CloudLightning, Snowflake, Wind
} from "lucide-react";
import { getForecast, getCurrentWeather } from "@/services/weatherService";

export default function TourBookingWrapper({
    tour,
    formattedPrice,
    leftContent,
    rightContent,
}) {
    const router = useRouter();

    // ─── State ───
    const [selectedDate, setSelectedDate] = useState(null);
    const [guests, setGuests] = useState([]);          // Guest #0 = logged-in user (auto-filled)
    const [voucher, setVoucher] = useState("");
    const [appliedVoucher, setAppliedVoucher] = useState(null); // { maVoucher, phanTramGiam }
    const [voucherError, setVoucherError] = useState("");
    const [checkingVoucher, setCheckingVoucher] = useState(false);
    const [isBooking, setIsBooking] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [errors, setErrors] = useState({});


    // User profile
    const [userProfile, setUserProfile] = useState(null);
    const [loadingProfile, setLoadingProfile] = useState(false);

    // Flash Sale state
    const [activeFlashSale, setActiveFlashSale] = useState(null);
    const [timeLeft, setTimeLeft] = useState({});

    // Weather state
    const [weatherForecast, setWeatherForecast] = useState(null);
    const [weatherCurrent, setWeatherCurrent] = useState(null);

    // Refs for scrolling
    const datePickerRef = useRef(null);
    const guestFormRef = useRef(null);
    const guestInputRefs = useRef({});

    const setGuestInputRef = useCallback((index, field, el) => {
        guestInputRefs.current[`guest_${index}_${field}`] = el;
    }, []);

    const scrollToElement = (el) => {
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            if (el.focus) setTimeout(() => el.focus(), 400);
        }
    };

    // ─── Fetch user profile when form opens ───
    const fetchUserProfile = async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        if (!token) return null;

        setLoadingProfile(true);
        try {
            const res = await api.get("/nguoi-dung/thong-tin");
            const profile = res.data;
            setUserProfile(profile);
            // Auto-fill guest #1 = logged-in user
            setGuests([
                { tenKhach: profile.hoTen || "", soDienThoai: profile.soDienThoai || "", isOwner: true },
            ]);
            return profile;
        } catch (err) {
            console.error("Failed to fetch profile:", err);
            setGuests([{ tenKhach: "", soDienThoai: "", isOwner: true }]);
            return null;
        } finally {
            setLoadingProfile(false);
        }
    };

    // ─── Fetch weather forecast ───
    useEffect(() => {
        const lat = tour.diaDiem?.latitude;
        const lon = tour.diaDiem?.longitude;
        if (!lat || !lon) return;

        const fetchWeather = async () => {
            try {
                const [forecastData, currentData] = await Promise.all([
                    getForecast(lat, lon),
                    getCurrentWeather(lat, lon).catch(() => null)
                ]);
                setWeatherForecast(forecastData);
                setWeatherCurrent(currentData);
            } catch (err) {
                console.error("Failed to fetch weather for sidebar:", err);
            }
        };
        fetchWeather();
    }, [tour.diaDiem]);

    // Helper to find weather for selected date
    const getWeatherHint = () => {
        if (!selectedDate) return null;

        const d = new Date(selectedDate.ngayKhoiHanh);
        const day = String(d.getDate()).padStart(2, '0');
        const month = String(d.getMonth() + 1).padStart(2, '0');
        const year = d.getFullYear();
        const targetDate = `${day}/${month}/${year}`;

        const today = new Date();
        const isToday = d.getDate() === today.getDate() &&
            d.getMonth() === today.getMonth() &&
            d.getFullYear() === today.getFullYear();

        if (isToday && weatherCurrent) {
            return {
                ...weatherCurrent,
                // Map current weather fields to match forecast UI if needed
                nhietDoNgay: weatherCurrent.nhietDo,
                nhietDoDem: weatherCurrent.nhietDo, // Fallback for today
            };
        }

        if (weatherForecast) {
            return weatherForecast.danhSachDuBao.find(d => d.thoiGian === targetDate);
        }

        return null;
    };

    const weatherHint = getWeatherHint();

    // ─── Validate & scroll ───
    const validateAndScroll = () => {
        const newErrors = {};

        if (!selectedDate) {
            newErrors.date = true;
            setErrors(newErrors);
            scrollToElement(datePickerRef.current);
            return false;
        }

        if (!showForm) {
            return false;
        }

        for (let i = 0; i < guests.length; i++) {
            if (!guests[i].tenKhach.trim()) {
                newErrors[`guest_${i}_tenKhach`] = true;
                if (Object.keys(newErrors).length === 1) {
                    const inputEl = guestInputRefs.current[`guest_${i}_tenKhach`];
                    setErrors(newErrors);
                    scrollToElement(inputEl);
                    return false;
                }
            }
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return false;
        }

        setErrors({});
        return true;
    };

    // ─── Guest management ───
    const addGuest = () => {
        if (selectedDate && guests.length >= selectedDate.soChoConLai) {
            alert(`Chỉ còn ${selectedDate.soChoConLai} chỗ trống!`);
            return;
        }
        setGuests([...guests, { tenKhach: "", soDienThoai: "", isOwner: false }]);
    };

    const removeGuest = (index) => {
        if (guests[index].isOwner) return;  // Can't remove the logged-in user
        setGuests(guests.filter((_, i) => i !== index));
        const newErrors = { ...errors };
        delete newErrors[`guest_${index}_tenKhach`];
        setErrors(newErrors);
    };

    const updateGuest = (index, field, value) => {
        const updated = [...guests];
        updated[index] = { ...updated[index], [field]: value };
        setGuests(updated);
        if (value.trim() && errors[`guest_${index}_${field}`]) {
            const newErrors = { ...errors };
            delete newErrors[`guest_${index}_${field}`];
            setErrors(newErrors);
        }
    };

    const isFormValid = () => {
        return (
            selectedDate &&
            showForm &&
            guests.length > 0 &&
            guests.every((g) => g.tenKhach.trim() !== "")
        );
    };

    // ─── Handle voucher ───
    const handleApplyVoucher = async () => {
        if (!voucher.trim()) {
            setVoucherError("Vui lòng nhập mã voucher");
            return;
        }
        setCheckingVoucher(true);
        setVoucherError("");
        try {
            const result = await checkVoucher(voucher.trim());
            setAppliedVoucher({ maVoucher: result.maVoucher, phanTramGiam: result.phanTramGiam });
            setVoucherError("");
        } catch (error) {
            const msg = error.response?.data?.thongDiep || error.response?.data?.message || error.response?.data || "Mã voucher không hợp lệ";
            setVoucherError(typeof msg === "string" ? msg : JSON.stringify(msg));
            setAppliedVoucher(null);
        } finally {
            setCheckingVoucher(false);
        }
    };

    const handleRemoveVoucher = () => {
        setAppliedVoucher(null);
        setVoucher("");
        setVoucherError("");
    };

    // ─── Total price calculation ───
    const currentPriceBase = activeFlashSale ? activeFlashSale.giaKhuyenMai : tour.gia;
    let currentPriceVND = Number(currentPriceBase);
    if (currentPriceVND < 10000) {
        currentPriceVND *= 1000000;
    }
    const subtotal = currentPriceVND * guests.length;
    const voucherDiscount = appliedVoucher ? Math.round(subtotal * appliedVoucher.phanTramGiam / 100) : 0;
    const totalPrice = subtotal - voucherDiscount;
    const formattedSubtotal = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(subtotal);
    const formattedDiscount = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(voucherDiscount);
    const formattedTotal = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(totalPrice);
    const formattedCurrentPrice = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(currentPriceVND);



    // ─── Fetch Flash Sale ───
    useEffect(() => {
        const fetchFlashSale = async () => {
            const sale = await getActiveFlashSaleForTour(tour.id);
            if (sale) {
                setActiveFlashSale(sale);
            }
        };
        fetchFlashSale();
    }, [tour.id]);

    // ─── Countdown Logic ───
    useEffect(() => {
        if (!activeFlashSale) return;

        const calculateTimeLeft = () => {
            const difference = +new Date(activeFlashSale.tgKetThuc) - +new Date();
            if (difference > 0) {
                return {
                    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
                    hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
                    minutes: Math.floor((difference / 1000 / 60) % 60),
                    seconds: Math.floor((difference / 1000) % 60),
                };
            }
            return null;
        };

        setTimeLeft(calculateTimeLeft());
        const timer = setInterval(() => {
            const remaining = calculateTimeLeft();
            if (!remaining) {
                setActiveFlashSale(null);
                clearInterval(timer);
            } else {
                setTimeLeft(remaining);
            }
        }, 1000);

        return () => clearInterval(timer);
    }, [activeFlashSale]);



    // ─── Confirm payment → Create booking ───
    const handleConfirmPayment = async () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        if (!token) {
            alert("Bạn cần đăng nhập để đặt tour.");
            router.push(`/dang-nhap?redirect=/tours/${tour.id}`);
            return;
        }
        if (!validateAndScroll()) return;

        setIsBooking(true);
        setBookingResult(null);

        try {
            const payload = {
                lichKhoiHanhId: selectedDate.id,
                danhSachKhach: guests.map((g) => ({
                    tenKhach: g.tenKhach.trim(),
                    soDienThoai: g.soDienThoai.trim(),
                })),
            };
            if (appliedVoucher) payload.maVoucher = appliedVoucher.maVoucher;
            if (activeFlashSale) payload.maFlashSale = activeFlashSale.id;

            // Step 1: Create booking
            const result = await datTour(payload);

            // Step 2: Redirect to VNPay
            try {
                const vnPayUrl = await taoThanhToanVnPay({
                    soTien: totalPrice,
                    noiDung: `Thanh toan don hang ${result.id}`,
                    maDonHang: result.id
                });

                if (vnPayUrl) {
                    window.location.href = vnPayUrl;
                    return; // Ngừng thực thi, trình duyệt sẽ tự chuyển hướng
                } else {
                    throw new Error("Không nhận được URL thanh toán từ server.");
                }
            } catch (payErr) {
                console.warn("Auto-confirm payment failed:", payErr);
                throw new Error("Không thể khởi tạo cổng thanh toán. Vui lòng thử lại.");
            }
        } catch (error) {
            const data = error.response?.data || {};
            const msg =
                data.thongDiep ||
                data.message ||
                (typeof data === "string" ? data : null) ||
                "Đã xảy ra lỗi khi đặt tour. Vui lòng thử lại.";

            setBookingResult({
                success: false,
                message: msg,
            });
            setShowPayment(false);
        } finally {
            setIsBooking(false);
        }
    };

    // ─── Sidebar button handler ───
    const handleSidebarClick = () => {
        const token = typeof window !== "undefined" ? localStorage.getItem("accessToken") : null;
        if (!token) {
            alert("Bạn cần đăng nhập để đặt tour.");
            router.push(`/dang-nhap?redirect=/tours/${tour.id}`);
            return;
        }
        if (!selectedDate) {
            setErrors({ date: true });
            scrollToElement(datePickerRef.current);
            return;
        }
        if (!showForm) {
            setShowForm(true);
            setBookingResult(null);
            fetchUserProfile();
            setTimeout(() => scrollToElement(guestFormRef.current), 200);
            return;
        }
        // If form is open, go to payment
        const dateError = !selectedDate;
        const nameError = guests.some((g) => !g.tenKhach.trim());
        setErrors({ date: dateError, name: nameError });
        if (dateError) {
            scrollToElement(datePickerRef.current);
            return;
        }
        if (nameError) return;

        handleConfirmPayment();
    };

    return (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ──── LEFT COLUMN ──── */}
            <div className="lg:col-span-2 space-y-8">
                {activeFlashSale && timeLeft && (
                    <div className="bg-gradient-to-r from-red-600 to-orange-500 rounded-2xl p-6 text-white shadow-xl shadow-red-500/20 animate-pulse-subtle">
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center">
                                    <Ticket className="w-8 h-8 text-white rotate-12" />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black tracking-tight uppercase">Flash Sale Đang Diễn Ra!</h3>
                                    <p className="text-white/80 font-medium">Giảm ngay 10% - Giá chỉ còn <span className="text-yellow-300 font-bold">{formattedCurrentPrice}</span></p>
                                </div>
                            </div>
                            <div className="flex gap-3">
                                {[
                                    { label: "Ngày", value: timeLeft.days },
                                    { label: "Giờ", value: timeLeft.hours },
                                    { label: "Phút", value: timeLeft.minutes },
                                    { label: "Giây", value: timeLeft.seconds }
                                ].map((item, i) => (
                                    <div key={i} className="flex flex-col items-center">
                                        <div className="bg-white text-red-600 w-14 h-14 rounded-xl flex items-center justify-center text-xl font-black shadow-lg">
                                            {String(item.value || 0).padStart(2, '0')}
                                        </div>
                                        <span className="text-[10px] uppercase font-bold mt-1 text-white/70">{item.label}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}
                {leftContent}

                {/* Departure Date Picker */}
                <div ref={datePickerRef} className={`transition-all duration-300 rounded-2xl ${errors.date ? "ring-2 ring-red-400 ring-offset-2" : ""}`}>
                    <DepartureDatePicker
                        schedules={tour.danhSachLich || []}
                        onDateSelect={(date) => {
                            setSelectedDate(date);
                            setBookingResult(null);
                            if (errors.date) {
                                const ne = { ...errors };
                                delete ne.date;
                                setErrors(ne);
                            }
                        }}
                    />
                    {errors.date && (
                        <div className="mt-2 flex items-center gap-2 text-red-600 text-sm px-2 animate-pulse">
                            <AlertCircle className="w-4 h-4" />
                            <span className="font-medium">Vui lòng chọn ngày khởi hành trước khi đặt tour</span>
                        </div>
                    )}
                </div>

                {/* ★ GUEST FORM */}
                {showForm && selectedDate && (
                    <div ref={guestFormRef} className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden">
                        <div className="px-6 py-5 border-b border-gray-100">
                            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <span className="w-1 h-6 bg-blue-600 rounded-full" />
                                <Users className="w-5 h-5 text-blue-600" />
                                Thông tin khách đi tour
                            </h2>
                            <p className="text-sm text-gray-400 mt-1">
                                Thông tin khách 1 được lấy từ tài khoản đăng nhập. Bạn có thể thêm người đi cùng.
                            </p>
                        </div>
                        <div className="p-6 space-y-4">
                            {loadingProfile ? (
                                <div className="flex items-center justify-center py-8 text-gray-400">
                                    <Loader2 className="w-5 h-5 animate-spin mr-2" /> Đang tải thông tin tài khoản...
                                </div>
                            ) : (
                                <>
                                    {guests.map((guest, index) => {
                                        const hasNameError = errors[`guest_${index}_tenKhach`];
                                        return (
                                            <div
                                                key={index}
                                                className={`flex items-start gap-3 rounded-xl p-4 border transition-all duration-300 ${hasNameError
                                                    ? "bg-red-50 border-red-300 ring-1 ring-red-300"
                                                    : guest.isOwner
                                                        ? "bg-blue-50/50 border-blue-200"
                                                        : "bg-slate-50 border-slate-100"
                                                    }`}
                                            >
                                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 mt-1 ${hasNameError ? "bg-red-100 text-red-700"
                                                    : guest.isOwner ? "bg-blue-200 text-blue-800"
                                                        : "bg-blue-100 text-blue-700"
                                                    }`}>
                                                    {index + 1}
                                                </div>
                                                <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 gap-3">
                                                    <div>
                                                        <Label className={`text-xs flex items-center gap-1 mb-1.5 ${hasNameError ? "text-red-600 font-semibold"
                                                            : guest.isOwner ? "text-blue-700 font-semibold"
                                                                : "text-gray-500"
                                                            }`}>
                                                            <User className="w-3 h-3" />
                                                            {guest.isOwner ? "Bạn (chủ đơn) *" : "Họ tên khách *"}
                                                        </Label>
                                                        <Input
                                                            ref={(el) => setGuestInputRef(index, "tenKhach", el)}
                                                            placeholder="Nguyễn Văn A"
                                                            value={guest.tenKhach}
                                                            onChange={(e) => updateGuest(index, "tenKhach", e.target.value)}
                                                            readOnly={guest.isOwner && !!userProfile?.hoTen}
                                                            className={`h-10 rounded-lg transition-colors ${hasNameError ? "border-red-400 bg-white focus:border-red-500 focus:ring-red-200"
                                                                : guest.isOwner && userProfile?.hoTen ? "bg-blue-50 border-blue-200 text-blue-900 font-medium cursor-default"
                                                                    : ""
                                                                }`}
                                                        />
                                                        {hasNameError && (
                                                            <p className="text-xs text-red-500 mt-1 flex items-center gap-1 animate-pulse">
                                                                <AlertCircle className="w-3 h-3" /> Vui lòng nhập họ tên khách
                                                            </p>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <Label className={`text-xs flex items-center gap-1 mb-1.5 ${guest.isOwner ? "text-blue-700" : "text-gray-500"
                                                            }`}>
                                                            <Phone className="w-3 h-3" /> Số điện thoại
                                                        </Label>
                                                        <Input
                                                            placeholder="0901234567"
                                                            value={guest.soDienThoai}
                                                            onChange={(e) => updateGuest(index, "soDienThoai", e.target.value)}
                                                            readOnly={guest.isOwner && !!userProfile?.soDienThoai}
                                                            className={`h-10 rounded-lg ${guest.isOwner && userProfile?.soDienThoai ? "bg-blue-50 border-blue-200 text-blue-900 font-medium cursor-default" : ""
                                                                }`}
                                                        />
                                                    </div>
                                                </div>
                                                {!guest.isOwner && (
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => removeGuest(index)}
                                                        className="text-red-400 hover:text-red-600 hover:bg-red-50 mt-1 flex-shrink-0"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                )}
                                                {guest.isOwner && (
                                                    <div className="mt-2">
                                                        <span className="text-[10px] px-2 py-1 bg-blue-100 text-blue-700 rounded-full font-semibold uppercase tracking-wider">
                                                            Chủ đơn
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        );
                                    })}

                                    <Button
                                        variant="outline"
                                        onClick={addGuest}
                                        disabled={selectedDate && guests.length >= selectedDate.soChoConLai}
                                        className="w-full rounded-xl border-dashed border-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 h-11"
                                    >
                                        <UserPlus className="w-4 h-4 mr-2" /> Thêm người đi cùng
                                    </Button>

                                    {/* Voucher — Tối đa 1 voucher mỗi đơn */}
                                    <div className="mt-4 pt-4 border-t border-gray-100">
                                        <Label className="text-xs text-gray-500 flex items-center gap-1 mb-1.5">
                                            <Ticket className="w-3 h-3" /> Mã giảm giá <span className="text-gray-400">(tối đa 1 voucher/đơn)</span>
                                        </Label>
                                        {appliedVoucher ? (
                                            <div className="flex items-center gap-2 bg-emerald-50 border border-emerald-200 rounded-lg p-3">
                                                <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                                                <div className="flex-1">
                                                    <p className="text-sm font-bold text-emerald-800">
                                                        {appliedVoucher.maVoucher} — Giảm {appliedVoucher.phanTramGiam}%
                                                    </p>
                                                    <p className="text-xs text-emerald-600">Tiết kiệm {formattedDiscount}</p>
                                                </div>
                                                <Button
                                                    variant="ghost"
                                                    size="icon"
                                                    onClick={handleRemoveVoucher}
                                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                                                >
                                                    <X className="w-4 h-4" />
                                                </Button>
                                            </div>
                                        ) : (
                                            <div className="flex gap-2">
                                                <Input
                                                    placeholder="Nhập mã voucher"
                                                    value={voucher}
                                                    onChange={(e) => { setVoucher(e.target.value); setVoucherError(""); }}
                                                    onKeyDown={(e) => e.key === 'Enter' && handleApplyVoucher()}
                                                    className={`h-10 rounded-lg flex-1 ${voucherError ? 'border-red-300 focus:border-red-400' : ''}`}
                                                />
                                                <Button
                                                    onClick={handleApplyVoucher}
                                                    disabled={checkingVoucher || !voucher.trim()}
                                                    className="h-10 px-4 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold"
                                                >
                                                    {checkingVoucher ? <Loader2 className="w-4 h-4 animate-spin" /> : "Áp dụng"}
                                                </Button>
                                            </div>
                                        )}
                                        {voucherError && (
                                            <p className="text-xs text-red-500 mt-1.5 flex items-center gap-1">
                                                <AlertCircle className="w-3 h-3" /> {voucherError}
                                            </p>
                                        )}
                                    </div>

                                    {/* Summary */}
                                    <div className="mt-4 pt-4 border-t border-gray-100 bg-blue-50 rounded-xl p-4">
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Giá tour:</span>
                                            <div className="text-right">
                                                {activeFlashSale && (
                                                    <span className="text-xs text-gray-400 line-through mr-2">{formattedPrice}</span>
                                                )}
                                                <span className="font-semibold text-gray-900">{formattedCurrentPrice}/khách</span>
                                            </div>
                                        </div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Số lượng:</span>
                                            <span className="font-semibold text-gray-900">{guests.length} khách</span>
                                        </div>
                                        <div className="flex justify-between text-sm mb-2">
                                            <span className="text-gray-600">Ngày khởi hành:</span>
                                            <span className="font-semibold text-gray-900">
                                                {new Date(selectedDate.ngayKhoiHanh).toLocaleDateString("vi-VN")}
                                            </span>
                                        </div>
                                        {appliedVoucher && (
                                            <>
                                                <div className="flex justify-between text-sm mb-2">
                                                    <span className="text-gray-600">Tạm tính:</span>
                                                    <span className="font-semibold text-gray-900">{formattedSubtotal}</span>
                                                </div>
                                                <div className="flex justify-between text-sm mb-2 text-emerald-700">
                                                    <span className="flex items-center gap-1">
                                                        <Ticket className="w-3 h-3" /> Voucher ({appliedVoucher.phanTramGiam}%):
                                                    </span>
                                                    <span className="font-bold">-{formattedDiscount}</span>
                                                </div>
                                            </>
                                        )}
                                        <div className="flex justify-between text-base pt-2 border-t border-blue-200">
                                            <span className="font-bold text-gray-900">Tổng thanh toán:</span>
                                            <span className="font-extrabold text-blue-700">{formattedTotal}</span>
                                        </div>
                                    </div>

                                    {/* Proceed to Payment */}
                                    <Button
                                        size="lg"
                                        onClick={handleConfirmPayment}
                                        disabled={isBooking}
                                        className="w-full text-base font-semibold h-12 rounded-xl mt-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg shadow-blue-600/30 transition-all duration-300"
                                    >
                                        {isBooking ? (
                                            <><Loader2 className="w-5 h-5 mr-2 animate-spin" /> Đang xử lý...</>
                                        ) : (
                                            <><CreditCard className="w-5 h-5 mr-2" /> Thanh toán qua VNPay</>
                                        )}
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                )}


                {/* Booking Result */}
                {bookingResult && (
                    <div className={`rounded-2xl p-6 border ${bookingResult.success ? "bg-emerald-50 border-emerald-200" : "bg-red-50 border-red-200"
                        }`}>
                        <div className="flex items-start gap-3">
                            {bookingResult.success ? (
                                <CheckCircle2 className="w-6 h-6 text-emerald-600 flex-shrink-0 mt-0.5" />
                            ) : (
                                <AlertCircle className="w-6 h-6 text-red-600 flex-shrink-0 mt-0.5" />
                            )}
                            <div>
                                <h3 className={`font-bold text-lg ${bookingResult.success ? "text-emerald-800" : "text-red-800"}`}>
                                    {bookingResult.success ? "Đặt tour & Thanh toán thành công!" : "Đặt tour thất bại"}
                                </h3>
                                <p className={`text-sm mt-1 ${bookingResult.success ? "text-emerald-600" : "text-red-600"}`}>
                                    {bookingResult.message}
                                </p>
                                {bookingResult.orderId && (
                                    <p className="text-sm text-emerald-700 mt-2 font-medium">
                                        Mã đơn hàng: <span className="font-bold">#{bookingResult.orderId}</span>
                                    </p>
                                )}
                                {bookingResult.success && (
                                    <p className="text-xs text-emerald-500 mt-2">
                                        Email xác nhận đã được gửi. Vui lòng kiểm tra hộp thư.
                                    </p>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* ──── RIGHT COLUMN (Sticky Sidebar) ──── */}
            <aside className="lg:col-span-1 space-y-6 sticky top-6 self-start">
                <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden">
                    <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-1">Đặt tour ngay</h3>
                        <div className="text-sm text-gray-400 mb-5">
                            Chỉ từ{" "}
                            {activeFlashSale ? (
                                <>
                                    <span className="text-xs line-through mr-1">{formattedPrice}</span>
                                    <span className="font-bold text-red-600 text-lg">{formattedCurrentPrice}</span>
                                </>
                            ) : (
                                <span className="font-bold text-[#0a2d4d] text-lg">{formattedPrice}</span>
                            )}
                            /khách
                        </div>

                        {selectedDate ? (
                            <div className="mb-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                                <p className="text-xs text-emerald-700 uppercase font-medium tracking-wider mb-1">Ngày khởi hành</p>
                                <p className="text-base font-bold text-emerald-900">
                                    {new Date(selectedDate.ngayKhoiHanh).toLocaleDateString("vi-VN", {
                                        weekday: "long", day: "2-digit", month: "2-digit", year: "numeric",
                                    })}
                                </p>
                                <p className="text-xs text-emerald-600 mt-1">Còn {selectedDate.soChoConLai} chỗ trống</p>

                                {weatherHint ? (
                                    <div className="mt-3 pt-3 border-t border-green-200 flex items-center gap-3">
                                        <div className="bg-white/60 rounded-lg p-2 text-green-600">
                                            <WeatherIcon iconCode={weatherHint.icon} className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-[10px] uppercase font-bold text-green-600 leading-tight">Dự báo thời tiết</p>
                                            <p className="text-sm font-bold text-green-900 leading-tight">
                                                {Math.round(weatherHint.nhietDoNgay)}°C • <span className="capitalize">{weatherHint.moTa}</span>
                                            </p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="mt-2 pt-2 border-t border-green-200/50">
                                        <p className="text-[10px] text-green-600 flex items-center gap-1 font-medium">
                                            <CloudSun className="w-3 h-3 text-green-500" /> Chỉ hiển thị dự báo trong 5 ngày tới
                                        </p>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="mb-5 bg-red-50 border border-red-200 rounded-xl p-4 text-center shadow-sm">
                                <p className="text-sm text-red-600 font-bold">⚠️ Vui lòng chọn ngày khởi hành</p>
                                <p className="text-xs text-red-500/80 mt-1">Cuộn xuống phần lịch khởi hành bên trái</p>
                            </div>
                        )}

                        {/* Sidebar total when form is open */}
                        {showForm && guests.length > 0 && (
                            <div className="mb-5 bg-blue-50 border border-blue-200 rounded-xl p-4">
                                <div className="flex justify-between text-sm mb-1">
                                    <span className="text-gray-600">Khách:</span>
                                    <span className="font-semibold">{guests.length} người</span>
                                </div>
                                <div className="flex justify-between text-base pt-1 border-t border-blue-200">
                                    <span className="font-bold text-gray-900">Tổng:</span>
                                    <span className="font-extrabold text-blue-700">{formattedTotal}</span>
                                </div>
                            </div>
                        )}

                        {bookingResult?.success ? (
                            <div className="text-center py-2">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
                                <p className="text-sm font-medium text-emerald-700">Đã thanh toán thành công!</p>
                                <p className="text-xs text-gray-400 mt-1">Mã đơn: #{bookingResult.orderId}</p>
                            </div>
                        ) : (
                            <Button
                                size="lg"
                                onClick={handleSidebarClick}
                                disabled={isBooking}
                                className="w-full text-base font-bold h-12 rounded-xl transition-all duration-300 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white shadow-lg shadow-orange-500/30 border-0"
                            >
                                {isBooking ? (
                                    <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Đang xử lý...</>
                                ) : !selectedDate ? (
                                    "📅 Chọn ngày khởi hành"
                                ) : !showForm ? (
                                    "🚀 Đặt tour ngay"
                                ) : (
                                    <><CreditCard className="w-4 h-4 mr-2" /> Thanh toán</>
                                )}
                            </Button>
                        )}

                        <p className="text-xs text-gray-400 text-center mt-3">
                            Hỗ trợ tư vấn 24/7 & Lên lịch trình riêng theo yêu cầu
                        </p>
                    </div>
                </div>

                {rightContent}
            </aside>
        </div >
    );
}

// ─── Weather Icon Helper (OpenWeatherMap to Lucide) ───
function WeatherIcon({ iconCode, className }) {
    if (!iconCode) return <CloudSun className={className} />;

    // OpenWeatherMap: https://openweathermap.org/weather-conditions
    const code = iconCode.substring(0, 2);

    switch (code) {
        case "01": return <Sun className={className} />;
        case "02": return <CloudSun className={className} />;
        case "03":
        case "04": return <Cloud className={className} />;
        case "09":
        case "10": return <CloudRain className={className} />;
        case "11": return <CloudLightning className={className} />;
        case "13": return <Snowflake className={className} />;
        case "50": return <Wind className={className} />;
        default: return <CloudSun className={className} />;
    }
}

