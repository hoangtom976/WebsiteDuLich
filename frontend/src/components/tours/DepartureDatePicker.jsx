"use client";

import { useState, useEffect } from "react";
import { CalendarDays, CheckCircle2, Users, ChevronLeft, ChevronRight } from "lucide-react";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function DepartureDatePicker({ schedules = [], onDateSelect }) {
    const [selectedId, setSelectedId] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 4;

    // Sort schedules from earliest to latest date
    const sortedSchedules = [...schedules].sort((a, b) =>
        new Date(a.ngayKhoiHanh).getTime() - new Date(b.ngayKhoiHanh).getTime()
    );

    const totalPages = Math.ceil(sortedSchedules.length / itemsPerPage);

    // Reset page if schedules change
    useEffect(() => {
        setCurrentPage(1);
    }, [schedules]);

    const handleSelect = (value) => {
        setSelectedId(value);
        const found = sortedSchedules.find(s => String(s.id) === String(value));
        onDateSelect?.(found || null);
    };

    const paginatedSchedules = sortedSchedules.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    return (
        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1 h-6 bg-orange-500 rounded-full" />
                    <CalendarDays className="w-5 h-5 text-orange-600" />
                    Chọn ngày khởi hành
                </h2>
                <p className="text-sm text-gray-400 mt-1">Chọn lịch phù hợp để tiếp tục đặt tour</p>
            </div>
            <div className="p-6">
                {schedules.length > 0 ? (
                    <>
                        <RadioGroup onValueChange={handleSelect} className="space-y-3" value={String(selectedId)}>
                            {paginatedSchedules.map((lich) => {
                                const isSoldOut = lich.soChoConLai === 0;
                                const isSelected = String(selectedId) === String(lich.id);
                                return (
                                    <Label
                                        key={lich.id}
                                        htmlFor={`dep-date-${lich.id}`}
                                        onClick={(e) => {
                                            if (isSoldOut) e.preventDefault();
                                        }}
                                        className={`flex items-center justify-between p-4 rounded-xl border-2 cursor-pointer transition-all duration-200
                        ${isSoldOut
                                                ? "cursor-not-allowed bg-gray-50 border-gray-200 opacity-50"
                                                : isSelected
                                                    ? "border-blue-500 bg-blue-50/50 shadow-md shadow-blue-100"
                                                    : "border-gray-200 hover:border-blue-300 hover:bg-slate-50"
                                            }`}
                                    >
                                        <div className="flex items-center gap-3">
                                            <RadioGroupItem
                                                value={String(lich.id)}
                                                id={`dep-date-${lich.id}`}
                                                disabled={isSoldOut}
                                                className="data-[state=checked]:border-blue-600 data-[state=checked]:text-blue-600"
                                            />
                                            <div>
                                                <p className="font-semibold text-gray-900 text-sm">
                                                    {new Date(lich.ngayKhoiHanh).toLocaleDateString("vi-VN", {
                                                        weekday: "long",
                                                        day: "2-digit",
                                                        month: "2-digit",
                                                        year: "numeric"
                                                    })}
                                                </p>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-sm">
                                            {isSoldOut ? (
                                                <span className="text-red-500 font-medium">Hết chỗ</span>
                                            ) : (
                                                <span className="text-emerald-600 font-medium flex items-center gap-1">
                                                    <Users className="w-3.5 h-3.5" />
                                                    Còn {lich.soChoConLai} chỗ
                                                </span>
                                            )}
                                        </div>
                                    </Label>
                                );
                            })}
                        </RadioGroup>

                        {/* Pagination Controls */}
                        {totalPages > 1 && (
                            <div className="mt-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-gray-100 pt-4">
                                <div className="text-sm text-gray-500">
                                    Hiển thị {Math.min((currentPage - 1) * itemsPerPage + 1, sortedSchedules.length)} - {Math.min(currentPage * itemsPerPage, sortedSchedules.length)} trong tổng số {sortedSchedules.length} ngày
                                </div>
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                        disabled={currentPage === 1}
                                        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Previous page"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <div className="flex items-center gap-1">
                                        {Array.from({ length: totalPages }).map((_, idx) => {
                                            const pageNum = idx + 1;
                                            // Simple pagination logic to show max 5 dots/numbers based on total
                                            if (
                                                totalPages <= 5 ||
                                                pageNum === 1 ||
                                                pageNum === totalPages ||
                                                Math.abs(currentPage - pageNum) <= 1
                                            ) {
                                                return (
                                                    <button
                                                        key={pageNum}
                                                        onClick={() => setCurrentPage(pageNum)}
                                                        className={`w-8 h-8 rounded-lg text-sm font-medium transition-colors ${currentPage === pageNum
                                                            ? "bg-blue-600 text-white shadow-sm"
                                                            : "text-gray-600 hover:bg-gray-100"
                                                            }`}
                                                    >
                                                        {pageNum}
                                                    </button>
                                                );
                                            } else if (
                                                (pageNum === 2 && currentPage > 3) ||
                                                (pageNum === totalPages - 1 && currentPage < totalPages - 2)
                                            ) {
                                                return <span key={pageNum} className="text-gray-400 px-1">...</span>;
                                            }
                                            return null;
                                        })}
                                    </div>
                                    <button
                                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                        disabled={currentPage === totalPages}
                                        className="p-2 rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        aria-label="Next page"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <div className="flex flex-col items-center justify-center py-10 text-center">
                        <CalendarDays className="w-12 h-12 text-gray-200 mb-3" />
                        <h3 className="text-base font-semibold text-gray-900">Chưa có lịch khởi hành</h3>
                        <p className="text-sm text-gray-400 mt-1">Vui lòng quay lại sau để xem các ngày khởi hành mới.</p>
                    </div>
                )}

                {selectedId && (
                    <div className="mt-4 flex items-center gap-2 text-sm text-blue-700 bg-blue-50 rounded-lg px-4 py-3 border border-blue-100">
                        <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
                        <span>Bạn đã chọn ngày khởi hành. Hãy nhấn <strong>"Đặt tour ngay"</strong> ở bên phải để tiếp tục.</span>
                    </div>
                )}
            </div>
        </div>
    );
}
