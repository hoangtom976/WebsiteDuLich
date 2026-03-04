package com.dulich.backend.service;

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
    private final GuiEmailService guiEmailService;
    private final VoucherService voucherService;

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
                        .build())
                .collect(Collectors.toList());
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
            donDatTour.setTrangThai(DA_XAC_NHAN);
            donDatTourRepository.save(donDatTour);
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
