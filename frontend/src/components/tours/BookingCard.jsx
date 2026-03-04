"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useRouter } from "next/navigation";

export default function BookingCard({ tour, formattedPrice }) {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);

  const handleBooking = () => {
    if (selectedDate) {
      // Kiểm tra xem người dùng đã đăng nhập chưa bằng cách xem token trong localStorage
      const token = localStorage.getItem("accessToken");

      if (!token) {
        // Nếu chưa đăng nhập, chuyển hướng đến trang đăng nhập
        // và đính kèm URL hiện tại để quay lại sau khi đăng nhập thành công
        alert(
          "Bạn cần đăng nhập để đặt tour. Đang chuyển đến trang đăng nhập...",
        );
        router.push(`/dang-nhap?redirect=/tours/${tour.id}`);
        return;
      }

      // Nếu đã đăng nhập, tiếp tục xử lý (hiện tại là thông báo)
      console.log("Booking for date ID:", selectedDate);
      alert(`Đã chọn ngày khởi hành. Sẵn sàng để đặt tour!`);
    } else {
      alert("Vui lòng chọn một ngày khởi hành.");
    }
  };

  return (
    <Card className="sticky top-24">
      <CardHeader>
        <CardTitle className="text-2xl">Đặt tour ngay</CardTitle>
        <CardDescription>
          Chỉ từ{" "}
          <span className="font-bold text-blue-600 text-xl">
            {formattedPrice}
          </span>
          /khách
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Dialog>
          <DialogTrigger asChild>
            <Button size="lg" className="w-full">
              Chọn ngày khởi hành
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Chọn ngày khởi hành của bạn</DialogTitle>
            </DialogHeader>
            <RadioGroup
              onValueChange={setSelectedDate}
              className="mt-4 space-y-2"
            >
              {tour.danhSachLich.map((lich) => (
                <Label
                  key={lich.id}
                  htmlFor={`date-${lich.id}`}
                  className={`flex justify-between items-center p-4 border rounded-md cursor-pointer ${lich.soChoConLai === 0 ? "cursor-not-allowed bg-gray-100 text-gray-400" : "hover:bg-accent"}`}
                >
                  <span>
                    {new Date(lich.ngayKhoiHanh).toLocaleDateString("vi-VN")}
                  </span>
                  <span
                    className={lich.soChoConLai === 0 ? "" : "text-green-600"}
                  >
                    {lich.soChoConLai > 0
                      ? `Còn ${lich.soChoConLai} chỗ`
                      : "Hết chỗ"}
                  </span>
                  <RadioGroupItem
                    value={lich.id}
                    id={`date-${lich.id}`}
                    disabled={lich.soChoConLai === 0}
                  />
                </Label>
              ))}
            </RadioGroup>
            <Button
              onClick={handleBooking}
              className="w-full mt-4"
              disabled={!selectedDate}
            >
              Tiến hành đặt tour
            </Button>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
