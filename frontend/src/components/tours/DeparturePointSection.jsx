"use client";

import { useState } from "react";
import { MapPin, Phone, Clock, ChevronDown, ChevronUp } from "lucide-react";

export default function DeparturePointSection() {
    const [showMap, setShowMap] = useState(false);

    return (
        <div className="bg-white rounded-2xl shadow-lg shadow-black/5 border border-gray-100 overflow-hidden">
            <div className="px-6 py-5 border-b border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <span className="w-1 h-6 bg-rose-500 rounded-full" />
                    <MapPin className="w-5 h-5 text-rose-600" />
                    Điểm xuất phát
                </h2>
            </div>
            <div className="p-6 space-y-4">
                {/* Địa chỉ */}
                <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center flex-shrink-0">
                        <MapPin className="w-5 h-5 text-rose-600" />
                    </div>
                    <div>
                        <p className="font-bold text-gray-900 text-[15px]">Công Ty Du Lịch Việt Tour</p>
                        <p className="text-sm text-gray-600 mt-0.5">
                            132 Nguyễn Văn Trường, Long Tuyền, Bình Thuỷ, Cần Thơ
                        </p>
                    </div>
                </div>

                {/* Lưu ý */}
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                    <div className="flex items-start gap-2">
                        <Clock className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800 font-medium">
                            <strong>Lưu ý:</strong> Khách hàng phải đến đúng điểm hẹn (tại công ty) trước 15-30 phút để nhân viên rà soát trước khi khởi hành.
                        </p>
                    </div>
                    <div className="flex items-start gap-2">
                        <Phone className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
                        <p className="text-sm text-amber-800">
                            Nếu khách hàng cần xe đưa đón đến điểm xuất phát (tại công ty), hãy gọi số{" "}
                            <a href="tel:0333303056" className="font-bold text-blue-700 underline">0333303056</a>
                            {" "}hoặc Zalo{" "}
                            <a href="https://zalo.me/0333303056" target="_blank" rel="noopener noreferrer" className="font-bold text-blue-700 underline">0333303056</a>
                            {" "}để được tư vấn cụ thể!
                        </p>
                    </div>
                </div>

                {/* Nút mở bản đồ */}
                <button
                    onClick={() => setShowMap(!showMap)}
                    className="w-full flex items-center justify-center gap-2 rounded-xl border border-gray-200 bg-gray-50 hover:bg-blue-50 hover:border-blue-200 px-4 py-3 text-sm font-semibold text-gray-700 hover:text-blue-700 transition-all duration-200"
                >
                    <MapPin className="w-4 h-4" />
                    {showMap ? "Ẩn bản đồ" : "Xem bản đồ vị trí công ty"}
                    {showMap ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>

                {/* Google Maps */}
                {showMap && (
                    <div className="rounded-xl overflow-hidden border border-gray-200 animate-in slide-in-from-top-2 duration-300">
                        <iframe
                            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3734.5905162993627!2d105.72365067479379!3d10.017364790088914!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x31a088fcf5e00595%3A0xf0e7021820d028dd!2zMTM1IE5ndXnhu4VuIFbEg24gVHLGsOG7nW5nLCBMb25nIFR1eeG7gW4sIELDrG5oIFRo4buneSwgQ-G6p24gVGjGoSwgVmnhu4d0IE5hbQ!5e1!3m2!1svi!2s!4v1773233124043!5m2!1svi!2s"
                            width="100%"
                            height="350"
                            style={{ border: 0 }}
                            allowFullScreen=""
                            loading="lazy"
                            referrerPolicy="no-referrer-when-downgrade"
                            title="Bản đồ Công Ty Du Lịch Việt Tour"
                        />
                    </div>
                )}
            </div>
        </div>
    );
}
