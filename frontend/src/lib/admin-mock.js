export const adminUsers = [
  { id: 1, hoTen: "Tran Minh Tuan", email: "admin@viettour.com", vaiTro: "ADMIN", trangThai: true },
  { id: 2, hoTen: "Le Thi Thu Ha", email: "nhanvien@viettour.com", vaiTro: "STAFF", trangThai: true },
  { id: 3, hoTen: "Nguyen Hoang Nam", email: "hoangnam.design@gmail.com", vaiTro: "USER", trangThai: true },
  { id: 4, hoTen: "Pham Minh Thu", email: "minhthu.marketing@gmail.com", vaiTro: "USER", trangThai: true },
  { id: 5, hoTen: "Vu Duc Dung", email: "ducdung.it@gmail.com", vaiTro: "USER", trangThai: false },
];

export const adminCategories = [
  { id: 1, tenDanhMuc: "Du lich Bien Dao", moTa: "Tour bien va dao" },
  { id: 2, tenDanhMuc: "Kham pha Cao Nguyen", moTa: "Tour nui rung" },
  { id: 3, tenDanhMuc: "Nghi duong", moTa: "Tour thu gian" },
];

export const adminLocations = [
  { id: 1, tenDiaDiem: "Vinh Ha Long", moTa: "Di san thien nhien" },
  { id: 2, tenDiaDiem: "Da Nang", moTa: "Thanh pho bien" },
  { id: 3, tenDiaDiem: "Phu Quoc", moTa: "Dao ngoc" },
];

export const adminTours = [
  { id: 1, tenTour: "Du thuyen Ha Long 2N1D", gia: 3500000, soNgay: 2, trangThai: true, danhMuc: "Du lich Bien Dao", diaDiem: "Vinh Ha Long" },
  { id: 2, tenTour: "Sapa - Fansipan 3N2D", gia: 4200000, soNgay: 3, trangThai: true, danhMuc: "Kham pha Cao Nguyen", diaDiem: "Sa Pa" },
  { id: 3, tenTour: "Phu Quoc 4N3D", gia: 6800000, soNgay: 4, trangThai: false, danhMuc: "Du lich Bien Dao", diaDiem: "Phu Quoc" },
];

export const adminSchedules = [
  { id: 1, tourTen: "Du thuyen Ha Long 2N1D", ngayKhoiHanh: "2026-06-01", tongSoCho: 20, soChoConLai: 18 },
  { id: 2, tourTen: "Sapa - Fansipan 3N2D", ngayKhoiHanh: "2026-07-01", tongSoCho: 15, soChoConLai: 5 },
  { id: 3, tourTen: "Phu Quoc 4N3D", ngayKhoiHanh: "2026-08-10", tongSoCho: 25, soChoConLai: 22 },
];

export const adminBookings = [
  { id: 101, khachHang: "Nguyen Hoang Nam", tourTen: "Du thuyen Ha Long 2N1D", ngayDat: "2026-05-20", tongTien: 7000000, trangThai: "DA_THANH_TOAN" },
  { id: 102, khachHang: "Pham Minh Thu", tourTen: "Sapa - Fansipan 3N2D", ngayDat: "2026-06-01", tongTien: 12600000, trangThai: "CHO_THANH_TOAN" },
  { id: 103, khachHang: "Vu Duc Dung", tourTen: "Phu Quoc 4N3D", ngayDat: "2026-06-08", tongTien: 6800000, trangThai: "CHO_XAC_NHAN" },
];

export const adminVouchers = [
  { id: 1, maVoucher: "HE2026", phanTramGiam: 15, ngayHetHan: "2026-08-31", trangThai: true },
  { id: 2, maVoucher: "WELCOME_MEMBER", phanTramGiam: 5, ngayHetHan: "2026-12-31", trangThai: true },
  { id: 3, maVoucher: "VIP_TOUR", phanTramGiam: 20, ngayHetHan: "2026-09-01", trangThai: false },
];

export const adminReviews = [
  { id: 1, nguoiDung: "Nguyen Hoang Nam", tourTen: "Du thuyen Ha Long 2N1D", soSao: 5, binhLuan: "Dich vu rat tot", daPhanHoi: true },
  { id: 2, nguoiDung: "Vu Duc Dung", tourTen: "Da Nang - Hoi An", soSao: 4, binhLuan: "Can cai thien bua an", daPhanHoi: false },
];

export const adminBlogs = [
  { id: 1, tieuDe: "Kinh nghiem du lich Da Lat", trangThai: "XUAT_BAN", ngayTao: "2026-02-20" },
  { id: 2, tieuDe: "Top mon an Hoi An", trangThai: "BAN_NHAP", ngayTao: "2026-02-18" },
];

export const adminWeatherCities = [
  { id: 1, thanhPho: "Ha Noi", nhietDo: 31, moTa: "May rai rac" },
  { id: 2, thanhPho: "Da Nang", nhietDo: 30, moTa: "Nang dep" },
  { id: 3, thanhPho: "Ho Chi Minh", nhietDo: 33, moTa: "Nang nong" },
];

export const adminChatSessions = [
  { id: 1, nguoiDung: "Guest", cauHoi: "Tu van tour Da Lat", traLoiTomTat: "Goi y 3 tour phu hop", thoiGian: "2026-03-01 09:20" },
  { id: 2, nguoiDung: "Nguyen Hoang Nam", cauHoi: "Tour nao duoi 4 trieu?", traLoiTomTat: "Tim thay 2 tour", thoiGian: "2026-03-01 10:05" },
];
