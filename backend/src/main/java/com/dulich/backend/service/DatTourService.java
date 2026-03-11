package com.dulich.backend.service;

import com.dulich.backend.dto.DonDatTourChiTietDTO;
import com.dulich.backend.dto.DuyetDonDTO;
import com.dulich.backend.dto.KhachDiCungDTO;
import com.dulich.backend.dto.LichSuDatTourDTO;
import com.dulich.backend.dto.LoiBadRequestException;
import com.dulich.backend.dto.QuanLyDonDatTourDTO;
import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.dto.YeuCauDatTourDTO;
import com.dulich.backend.entity.ChiTietDatTour;
import com.dulich.backend.entity.DonDatTour;
import com.dulich.backend.entity.LichKhoiHanh;
import com.dulich.backend.entity.NguoiDung;
import com.dulich.backend.entity.Voucher;
import com.dulich.backend.repository.DonDatTourRepository;
import com.dulich.backend.repository.LichKhoiHanhRepository;
import com.dulich.backend.repository.NguoiDungRepository;
import lombok.RequiredArgsConstructor;
import org.apache.poi.ss.usermodel.Row;
import org.apache.poi.ss.usermodel.Sheet;
import org.apache.poi.ss.usermodel.Workbook;
import org.apache.poi.xssf.usermodel.XSSFWorkbook;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayInputStream;
import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DatTourService {

    private static final String CHO_THANH_TOAN = "CHO_THANH_TOAN";
    private static final String DA_THANH_TOAN = "DA_THANH_TOAN";
    private static final String DA_XAC_NHAN = "DA_XAC_NHAN";
    private static final String DA_HUY = "DA_HUY";

    private final DonDatTourRepository donDatTourRepository;
    private final LichKhoiHanhRepository lichKhoiHanhRepository;
    private final NguoiDungRepository nguoiDungRepository;
    private final com.dulich.backend.repository.HinhAnhTourRepository hinhAnhTourRepository;
    private final GuiEmailService guiEmailService;
    private final VoucherService voucherService;
    private final ThongBaoService thongBaoService;
    private final com.dulich.backend.repository.FlashSaleRepository flashSaleRepository;

    @Transactional
    public DonDatTour datTour(YeuCauDatTourDTO req) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy người dùng: " + email));

        Long lichId = req.getLichKhoiHanhId();
        if (lichId == null) {
            throw new LoiBadRequestException("ID lịch khởi hành không được để trống");
        }
        LichKhoiHanh lich = lichKhoiHanhRepository.findById(lichId)
                .orElseThrow(
                        () -> new TaiNguyenKhongTonTaiException("Không tìm thấy lịch khởi hành với ID: " + lichId));

        int soLuongKhach = req.getDanhSachKhach().size();
        if (lich.getSoChoConLai() < soLuongKhach) {
            throw new LoiBadRequestException("Hết chỗ. Chỉ còn " + lich.getSoChoConLai() + " chỗ.");
        }

        BigDecimal giaTour = lich.getTour().getGia();
        com.dulich.backend.entity.FlashSale flashSale = null;

        if (req.getMaFlashSale() != null) {
            flashSale = flashSaleRepository.findById(req.getMaFlashSale())
                    .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy Flash Sale"));

            if (!flashSale.getTrangThai() || java.time.LocalDateTime.now().isAfter(flashSale.getTgKetThuc())
                    || java.time.LocalDateTime.now().isBefore(flashSale.getTgBatDau())) {
                throw new LoiBadRequestException("Flash Sale không còn hiệu lực.");
            }
            if (flashSale.getSoLuong() <= 0) {
                throw new LoiBadRequestException("Flash Sale đã hết lượt sử dụng.");
            }

            // Check if user already used this exact flash sale
            java.util.List<DonDatTour> usedOrders = donDatTourRepository
                    .findByNguoiDungIdAndFlashSaleIsNotNull(nguoiDung.getId());
            System.out.println("Checking flash sale usage for user " + nguoiDung.getEmail() + ": req.maFlashSale="
                    + req.getMaFlashSale() + ", previously used flash sales count=" + usedOrders.size());
            for (DonDatTour od : usedOrders) {
                System.out.println(" - Order ID: " + od.getId() + " has flash sale ID: "
                        + (od.getFlashSale() != null ? od.getFlashSale().getId() : "null"));
            }

            boolean alreadyUsedFlashSale = usedOrders.stream()
                    .anyMatch(don -> don.getFlashSale() != null
                            && don.getFlashSale().getId().equals(req.getMaFlashSale())
                            && !don.getTrangThai().equals("DA_HUY"));
            if (alreadyUsedFlashSale) {
                throw new LoiBadRequestException("Mỗi tài khoản chỉ được áp dụng Flash Sale này 1 lần.");
            }

            BigDecimal phanTram = BigDecimal.valueOf(100 - flashSale.getPhanTramGiam());
            giaTour = lich.getTour().getGia().multiply(phanTram).divide(BigDecimal.valueOf(100));
        }

        BigDecimal tongTien = giaTour.multiply(BigDecimal.valueOf(soLuongKhach));

        if (req.getMaVoucher() != null && !req.getMaVoucher().isEmpty()) {
            Voucher voucher = voucherService.kiemTraVoucher(req.getMaVoucher());
            BigDecimal phanTram = BigDecimal.valueOf(voucher.getPhanTramGiam());
            BigDecimal soTienGiam = tongTien.multiply(phanTram).divide(BigDecimal.valueOf(100));
            tongTien = tongTien.subtract(soTienGiam);
        }

        DonDatTour donDatTour = new DonDatTour();
        donDatTour.setNguoiDung(nguoiDung);
        donDatTour.setLichKhoiHanh(lich);
        donDatTour.setTongTien(tongTien);
        donDatTour.setTrangThai(CHO_THANH_TOAN);

        if (flashSale != null) {
            donDatTour.setFlashSale(flashSale);
            // Decrease flash sale stock
            flashSale.setSoLuong(flashSale.getSoLuong() - 1);
            flashSaleRepository.save(flashSale);
        }

        if (req.getMaVoucher() != null && !req.getMaVoucher().isEmpty()) {
            Voucher voucher = voucherService.kiemTraVoucher(req.getMaVoucher());
            donDatTour.setVoucher(voucher);
        }

        List<ChiTietDatTour> chiTiets = new ArrayList<>();
        for (KhachDiCungDTO khach : req.getDanhSachKhach()) {
            ChiTietDatTour chiTiet = new ChiTietDatTour();
            chiTiet.setTenKhach(khach.getTenKhach());
            chiTiet.setSoDienThoai(khach.getSoDienThoai());
            chiTiet.setDonDatTour(donDatTour);
            chiTiets.add(chiTiet);
        }
        donDatTour.setChiTiets(chiTiets);

        lich.setSoChoConLai(lich.getSoChoConLai() - soLuongKhach);
        lichKhoiHanhRepository.save(lich);

        DonDatTour savedDonDatTour = donDatTourRepository.save(donDatTour);

        guiEmailService.guiEmailXacNhanDatTour(
                nguoiDung.getEmail(),
                String.valueOf(savedDonDatTour.getId()),
                lich.getTour().getTenTour(),
                tongTien.doubleValue());

        thongBaoService.taoThongBao(
                nguoiDung,
                "Đơn đặt tour mới",
                "Bạn đã đặt tour " + lich.getTour().getTenTour() + " thành công. Vui lòng thanh toán để xác nhận.",
                "DON_HANG");

        return savedDonDatTour;
    }

    @Transactional
    public String huyDonHang(Long donHangId) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();

        if (donHangId == null) {
            throw new LoiBadRequestException("ID đơn hàng không được để trống");
        }
        DonDatTour donDatTour = donDatTourRepository.findById(donHangId)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy đơn hàng với ID: " + donHangId));

        if (!donDatTour.getNguoiDung().getEmail().equals(email)) {
            throw new LoiBadRequestException("Bạn không có quyền hủy đơn này");
        }

        if (!CHO_THANH_TOAN.equals(donDatTour.getTrangThai())) {
            throw new LoiBadRequestException("Không thể hủy đơn hàng đã thanh toán hoặc đã hủy");
        }

        donDatTour.setTrangThai(DA_HUY);
        congLaiSoCho(donDatTour);
        donDatTourRepository.save(donDatTour);

        thongBaoService.taoThongBao(
                donDatTour.getNguoiDung(),
                "Hủy đơn đặt tour",
                "Đơn đặt tour #" + donHangId + " đã được hủy thành công.",
                "DON_HANG");

        return "Hủy đơn hàng thành công!";
    }

    @Transactional
    public String xacNhanThanhToanThuCong(Long donHangId) {
        if (donHangId == null) {
            throw new LoiBadRequestException("ID đơn hàng không được để trống");
        }
        DonDatTour donDatTour = donDatTourRepository.findById(donHangId)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy đơn hàng với ID: " + donHangId));

        if (!CHO_THANH_TOAN.equals(donDatTour.getTrangThai())) {
            throw new LoiBadRequestException("Chỉ xác nhận thanh toán cho đơn đang chờ thanh toán.");
        }

        donDatTour.setTrangThai(DA_THANH_TOAN);
        donDatTourRepository.save(donDatTour);

        thongBaoService.taoThongBao(
                donDatTour.getNguoiDung(),
                "Thanh toán thành công",
                "Đơn đặt tour #" + donHangId + " đã được xác nhận thanh toán thành công.",
                "THANH_TOAN");

        return "Đã xác nhận thanh toán thủ công cho đơn hàng " + donHangId;
    }

    public List<LichSuDatTourDTO> layLichSuDatTour() {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        NguoiDung nguoiDung = nguoiDungRepository.findByEmail(email)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy người dùng: " + email));

        List<DonDatTour> danhSachDonHang = donDatTourRepository.findByNguoiDungIdOrderByNgayDatDesc(nguoiDung.getId());

        return danhSachDonHang.stream()
                .map(donHang -> LichSuDatTourDTO.builder()
                        .id(donHang.getId())
                        .ngayDat(donHang.getNgayDat())
                        .tenTour(donHang.getLichKhoiHanh().getTour().getTenTour())
                        .ngayKhoiHanh(donHang.getLichKhoiHanh().getNgayKhoiHanh())
                        .soLuongKhach(donHang.getChiTiets().size())
                        .tongTien(donHang.getTongTien())
                        .trangThai(donHang.getTrangThai())
                        .soNgay(donHang.getLichKhoiHanh().getTour().getSoNgay())
                        .build())
                .collect(Collectors.toList());
    }

    public DonDatTourChiTietDTO layChiTietDonHang(Long id) {
        String email = SecurityContextHolder.getContext().getAuthentication().getName();
        DonDatTour don = donDatTourRepository.findById(id)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy đơn hàng #" + id));

        if (!don.getNguoiDung().getEmail().equals(email)) {
            throw new LoiBadRequestException("Bạn không có quyền xem đơn hàng này.");
        }

        LichKhoiHanh lich = don.getLichKhoiHanh();

        List<KhachDiCungDTO> khachDTOs = don.getChiTiets().stream()
                .map(ct -> new KhachDiCungDTO(ct.getTenKhach(), ct.getSoDienThoai()))
                .collect(Collectors.toList());

        String hinhAnh = "";
        List<com.dulich.backend.entity.HinhAnhTour> anhs = hinhAnhTourRepository.findByTourId(lich.getTour().getId());
        if (!anhs.isEmpty()) {
            hinhAnh = anhs.get(0).getUrlHinhAnh();
        }

        return DonDatTourChiTietDTO.builder()
                .id(don.getId())
                .ngayDat(don.getNgayDat())
                .trangThai(don.getTrangThai())
                .tongTien(don.getTongTien())
                .tourId(lich.getTour().getId())
                .tenTour(lich.getTour().getTenTour())
                .hinhAnh(hinhAnh)
                .ngayKhoiHanh(lich.getNgayKhoiHanh())
                .tenDiaDiem(lich.getTour().getDiaDiem() != null ? lich.getTour().getDiaDiem().getTenDiaDiem() : "")
                .danhSachKhach(khachDTOs)
                .maVoucher(don.getVoucher() != null ? don.getVoucher().getMaVoucher() : null)
                .phanTramGiam(don.getVoucher() != null ? don.getVoucher().getPhanTramGiam() : 0)
                .build();
    }

    public List<QuanLyDonDatTourDTO> layDanhSachDonQuanTri(String tuKhoa, String trangThai) {
        String keyword = tuKhoa == null ? "" : tuKhoa.trim().toLowerCase(Locale.ROOT);
        String normalizedStatus = normalizeTrangThai(trangThai);

        return donDatTourRepository.findAllByOrderByNgayDatDesc().stream()
                .filter(don -> keyword.isEmpty() || matchKeyword(don, keyword))
                .filter(don -> normalizedStatus == null || normalizedStatus.equals(don.getTrangThai()))
                .map(this::toQuanLyDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public String duyetDonHang(Long id, DuyetDonDTO req) {
        if (id == null) {
            throw new LoiBadRequestException("ID đơn hàng không được để trống");
        }
        DonDatTour donDatTour = donDatTourRepository.findById(id)
                .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy đơn hàng với ID: " + id));

        String current = donDatTour.getTrangThai();
        String target = normalizeTrangThai(req.getTrangThai());
        if (target == null) {
            throw new LoiBadRequestException("Trạng thái không hợp lệ.");
        }
        if (target.equals(current)) {
            throw new LoiBadRequestException("Đơn hàng đã ở trạng thái " + target + ".");
        }

        if (DA_XAC_NHAN.equals(target)) {
            if (!DA_THANH_TOAN.equals(current)) {
                throw new LoiBadRequestException("Chỉ duyệt đơn khi đơn đã thanh toán.");
            }
            donDatTourRepository.save(donDatTour);

            thongBaoService.taoThongBao(
                    donDatTour.getNguoiDung(),
                    "Đơn đặt tour đã xác nhận",
                    "Đơn đặt tour #" + id + " của bạn đã được quản trị viên xác nhận.",
                    "DON_HANG");

            return "Duyệt đơn hàng thành công.";
        }

        if (DA_HUY.equals(target)) {
            if (!(CHO_THANH_TOAN.equals(current) || DA_THANH_TOAN.equals(current))) {
                throw new LoiBadRequestException("Chỉ hủy đơn ở trạng thái chờ thanh toán hoặc đã thanh toán.");
            }
            donDatTour.setTrangThai(DA_HUY);
            congLaiSoCho(donDatTour);
            donDatTourRepository.save(donDatTour);
            return "Hủy đơn hàng thành công.";
        }

        throw new LoiBadRequestException("Chỉ hỗ trợ duyệt sang DA_XAC_NHAN hoặc hủy sang DA_HUY.");
    }

    public ByteArrayInputStream xuatDanhSachKhachHang(Long lichKhoiHanhId) {
        if (lichKhoiHanhId == null) {
            throw new LoiBadRequestException("ID lịch khởi hành không được để trống");
        }
        List<DonDatTour> danhSachDon = donDatTourRepository.findAll().stream()
                .filter(d -> d.getLichKhoiHanh().getId().equals(lichKhoiHanhId))
                .filter(d -> DA_THANH_TOAN.equals(d.getTrangThai()) || DA_XAC_NHAN.equals(d.getTrangThai()))
                .collect(Collectors.toList());

        try (Workbook workbook = new XSSFWorkbook(); ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Sheet sheet = workbook.createSheet("Danh Sách Khách Hàng");

            Row headerRow = sheet.createRow(0);
            headerRow.createCell(0).setCellValue("STT");
            headerRow.createCell(1).setCellValue("Mã Đơn");
            headerRow.createCell(2).setCellValue("Tên Khách");
            headerRow.createCell(3).setCellValue("SĐT");
            headerRow.createCell(4).setCellValue("Người Đặt");

            int rowIdx = 1;
            int stt = 1;

            for (DonDatTour don : danhSachDon) {
                for (ChiTietDatTour chiTiet : don.getChiTiets()) {
                    Row row = sheet.createRow(rowIdx++);
                    row.createCell(0).setCellValue(stt++);
                    row.createCell(1).setCellValue(don.getId());
                    row.createCell(2).setCellValue(chiTiet.getTenKhach());
                    row.createCell(3).setCellValue(chiTiet.getSoDienThoai());
                    row.createCell(4).setCellValue(don.getNguoiDung().getHoTen());
                }
            }

            for (int i = 0; i < 5; i++) {
                sheet.autoSizeColumn(i);
            }

            workbook.write(out);
            return new ByteArrayInputStream(out.toByteArray());
        } catch (IOException e) {
            throw new LoiBadRequestException("Lỗi khi xuất file Excel: " + e.getMessage());
        }
    }

    private QuanLyDonDatTourDTO toQuanLyDTO(DonDatTour don) {
        NguoiDung nguoiDung = don.getNguoiDung();
        LichKhoiHanh lich = don.getLichKhoiHanh();
        return QuanLyDonDatTourDTO.builder()
                .id(don.getId())
                .nguoiDungId(nguoiDung.getId())
                .hoTenNguoiDat(nguoiDung.getHoTen())
                .emailNguoiDat(nguoiDung.getEmail())
                .soDienThoaiNguoiDat(nguoiDung.getSoDienThoai())
                .tourId(lich.getTour().getId())
                .tenTour(lich.getTour().getTenTour())
                .lichKhoiHanhId(lich.getId())
                .ngayKhoiHanh(lich.getNgayKhoiHanh())
                .ngayDat(don.getNgayDat())
                .soLuongKhach(don.getChiTiets() == null ? 0 : don.getChiTiets().size())
                .tongTien(don.getTongTien())
                .trangThai(don.getTrangThai())
                .build();
    }

    private boolean matchKeyword(DonDatTour don, String keyword) {
        return contains(don.getNguoiDung().getHoTen(), keyword)
                || contains(don.getNguoiDung().getEmail(), keyword)
                || contains(don.getLichKhoiHanh().getTour().getTenTour(), keyword)
                || contains(don.getTrangThai(), keyword)
                || contains(String.valueOf(don.getId()), keyword);
    }

    private boolean contains(String source, String keyword) {
        return source != null && source.toLowerCase(Locale.ROOT).contains(keyword);
    }

    private String normalizeTrangThai(String status) {
        if (status == null || status.trim().isEmpty()) {
            return null;
        }
        String upper = status.trim().toUpperCase(Locale.ROOT);
        if (CHO_THANH_TOAN.equals(upper)
                || DA_THANH_TOAN.equals(upper)
                || DA_XAC_NHAN.equals(upper)
                || DA_HUY.equals(upper)) {
            return upper;
        }
        return null;
    }

    private void congLaiSoCho(DonDatTour donDatTour) {
        int soLuongKhach = donDatTour.getChiTiets() == null ? 0 : donDatTour.getChiTiets().size();
        LichKhoiHanh lich = donDatTour.getLichKhoiHanh();
        lich.setSoChoConLai(lich.getSoChoConLai() + soLuongKhach);
        lichKhoiHanhRepository.save(lich);
    }
}
