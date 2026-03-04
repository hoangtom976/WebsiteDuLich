import Link from "next/link";
import { Mountain } from "lucide-react";

export default function PremiumFooter() {
  return (
    <footer className="bg-[#0a2d4d] pb-8 pt-16 text-white/80">
      <div className="mx-auto w-full max-w-[1400px] px-4 lg:px-6">
        <div className="mb-8 grid grid-cols-1 gap-8 md:grid-cols-4">
          <div className="text-center md:text-left">
            <div className="mb-4 flex items-center justify-center gap-2 md:justify-start">
              <Mountain className="h-7 w-7 text-amber-400" />
              <span className="text-2xl font-bold text-white">Viet Tour</span>
            </div>
            <p className="text-sm leading-7">
              Chuyen cung cap cac tour du lich noi dia cao cap, mang den nhung
              trai nghiem tinh te va dang nho tai nhung mien dat xinh dep cua
              Viet Nam.
            </p>
          </div>

          <div className="text-center md:text-left">
            <h4 className="mb-4 font-bold text-white">Tour Noi Bat</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/tours/1" className="hover:text-amber-400">
                  Du thuyen Ha Long
                </Link>
              </li>
              <li>
                <Link href="/tours/2" className="hover:text-amber-400">
                  Kham pha Sapa
                </Link>
              </li>
              <li>
                <Link href="/tours/3" className="hover:text-amber-400">
                  Nghi duong Phu Quoc
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h4 className="mb-4 font-bold text-white">Ho Tro</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/lien-he" className="hover:text-amber-400">
                  Lien he
                </Link>
              </li>
              <li>
                <Link href="/tours" className="hover:text-amber-400">
                  Danh sach tour
                </Link>
              </li>
              <li>
                <Link href="/thoi-tiet" className="hover:text-amber-400">
                  Thong tin thoi tiet
                </Link>
              </li>
            </ul>
          </div>

          <div className="text-center md:text-left">
            <h4 className="mb-4 font-bold text-white">Chinh Sach</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/dang-ky" className="hover:text-amber-400">
                  Dang ky tai khoan
                </Link>
              </li>
              <li>
                <Link href="/dang-nhap" className="hover:text-amber-400">
                  Dang nhap
                </Link>
              </li>
              <li>
                <Link href="/khuyen-mai" className="hover:text-amber-400">
                  Khuyen mai
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-white/20 pt-8 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Viet Tour. All Rights Reserved.</p>
        </div>
      </div>
    </footer>
  );
}
