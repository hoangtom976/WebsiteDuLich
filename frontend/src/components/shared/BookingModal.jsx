"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  MapPin,
  Calendar,
  ChevronDown,
  LayoutGrid,
  Search,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

// Component Form tìm kiếm có thể tái sử dụng
function GlobalSearchForm({ onSearch }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-4">
      <div className="grid gap-2">
        <Label htmlFor="destination" className="flex items-center gap-2">
          <MapPin size={16} /> Điểm đến
        </Label>
        <Input id="destination" placeholder="Bạn muốn đi đâu?" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="departure-date" className="flex items-center gap-2">
          <Calendar size={16} /> Ngày khởi hành
        </Label>
        <Input id="departure-date" type="date" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="price-range" className="flex items-center gap-2">
          <ChevronDown size={16} /> Khoảng giá
        </Label>
        <Input id="price-range" placeholder="Chọn mức giá" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="category" className="flex items-center gap-2">
          <LayoutGrid size={16} /> Danh mục
        </Label>
        <Input id="category" placeholder="Chọn danh mục" />
      </div>
    </div>
  );
}

export default function BookingModal() {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  const handleSearch = () => {
    // Logic tìm kiếm sẽ được triển khai ở đây
    console.log("Đang tìm kiếm...");
    setOpen(false); // Đóng modal sau khi tìm kiếm
    router.push("/tours"); // Chuyển hướng đến trang danh sách tour
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="bg-amber-500 hover:bg-amber-600 text-black font-bold">
          Đặt tour ngay
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[625px]">
        <DialogHeader>
          <DialogTitle className="text-2xl">Tìm kiếm hành trình</DialogTitle>
          <DialogDescription>
            Khám phá chuyến đi mơ ước của bạn ngay hôm nay.
          </DialogDescription>
        </DialogHeader>
        <GlobalSearchForm onSearch={handleSearch} />
        <DialogFooter>
          <Button
            type="submit"
            size="lg"
            className="w-full"
            onClick={handleSearch}
          >
            <Search className="mr-2 h-4 w-4" />
            Tìm kiếm
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
