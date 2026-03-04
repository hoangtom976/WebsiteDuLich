"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";

export default function VoucherCard({ voucher }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(voucher.maVoucher);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000); // Reset trạng thái sau 2 giây
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden flex flex-col md:flex-row">
      <div className="p-6 bg-blue-500 text-white flex flex-col justify-center items-center md:w-1/3">
        <p className="text-sm">Giảm giá</p>
        <p className="text-4xl font-bold">{voucher.phanTramGiam}%</p>
      </div>
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-sm text-gray-500">
            Hạn sử dụng:{" "}
            {new Date(voucher.ngayHetHan).toLocaleDateString("vi-VN")}
          </p>
          <p className="mt-2 text-gray-700">{voucher.moTa}</p>
        </div>
        <div className="mt-4 flex items-center gap-4">
          <div className="border-2 border-dashed border-gray-300 rounded-md px-4 py-2 font-mono text-lg text-gray-800">
            {voucher.maVoucher}
          </div>
          <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? (
              <Check className="w-4 h-4 mr-2 text-green-500" />
            ) : (
              <Copy className="w-4 h-4 mr-2" />
            )}
            {copied ? "Đã chép" : "Sao chép"}
          </Button>
        </div>
      </div>
    </div>
  );
}
