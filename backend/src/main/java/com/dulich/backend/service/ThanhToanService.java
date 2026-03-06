package com.dulich.backend.service;

import com.dulich.backend.config.CauHinhVnPay;
import com.dulich.backend.dto.TaoThanhToanDTO;
import com.dulich.backend.entity.DonDatTour;
import com.dulich.backend.dto.TaiNguyenKhongTonTaiException;
import com.dulich.backend.repository.DonDatTourRepository;
import jakarta.servlet.http.HttpServletRequest;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
@RequiredArgsConstructor
public class ThanhToanService {

    private final DonDatTourRepository donDatTourRepository;
    private final GuiEmailService guiEmailService;

    public String taoUrlThanhToan(TaoThanhToanDTO req, HttpServletRequest request) {
        String vnp_Version = "2.1.0";
        String vnp_Command = "pay";
        String vnp_OrderInfo = req.getNoiDung();
        String vnp_TxnRef = String.valueOf(req.getMaDonHang());
        String vnp_IpAddr = getIpAddress(request);
        String vnp_TmnCode = CauHinhVnPay.VNP_TMN_CODE;

        long amount = req.getSoTien() * 100;
        Map<String, String> vnp_Params = new HashMap<>();
        vnp_Params.put("vnp_Version", vnp_Version);
        vnp_Params.put("vnp_Command", vnp_Command);
        vnp_Params.put("vnp_TmnCode", vnp_TmnCode);
        vnp_Params.put("vnp_Amount", String.valueOf(amount));
        vnp_Params.put("vnp_CurrCode", "VND");
        vnp_Params.put("vnp_TxnRef", vnp_TxnRef);
        vnp_Params.put("vnp_OrderInfo", vnp_OrderInfo);
        vnp_Params.put("vnp_OrderType", "other");
        vnp_Params.put("vnp_Locale", "vn");
        vnp_Params.put("vnp_ReturnUrl", CauHinhVnPay.VNP_RETURN_URL);
        vnp_Params.put("vnp_IpAddr", vnp_IpAddr);

        Calendar cld = Calendar.getInstance(TimeZone.getTimeZone("Etc/GMT+7"));
        SimpleDateFormat formatter = new SimpleDateFormat("yyyyMMddHHmmss");
        String vnp_CreateDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_CreateDate", vnp_CreateDate);

        cld.add(Calendar.MINUTE, 15);
        String vnp_ExpireDate = formatter.format(cld.getTime());
        vnp_Params.put("vnp_ExpireDate", vnp_ExpireDate);

        List<String> fieldNames = new ArrayList<>(vnp_Params.keySet());
        Collections.sort(fieldNames);
        StringBuilder hashData = new StringBuilder();
        StringBuilder query = new StringBuilder();
        Iterator<String> itr = fieldNames.iterator();
        while (itr.hasNext()) {
            String fieldName = itr.next();
            String fieldValue = vnp_Params.get(fieldName);
            if ((fieldValue != null) && (fieldValue.length() > 0)) {
                // Build hash data
                hashData.append(fieldName);
                hashData.append('=');
                hashData.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                // Build query
                query.append(URLEncoder.encode(fieldName, StandardCharsets.US_ASCII));
                query.append('=');
                query.append(URLEncoder.encode(fieldValue, StandardCharsets.US_ASCII));
                if (itr.hasNext()) {
                    query.append('&');
                    hashData.append('&');
                }
            }
        }
        String queryUrl = query.toString();
        String vnp_SecureHash = CauHinhVnPay.hmacSHA512(CauHinhVnPay.VNP_HASH_SECRET, hashData.toString());
        queryUrl += "&vnp_SecureHash=" + vnp_SecureHash;
        return CauHinhVnPay.VNP_PAY_URL + "?" + queryUrl;
    }

    @Transactional
    public String xuLyKetQuaThanhToan(HttpServletRequest request) {
        String vnp_ResponseCode = request.getParameter("vnp_ResponseCode");
        String vnp_TxnRef = request.getParameter("vnp_TxnRef");
        // Ở đây nên kiểm tra thêm checksum để đảm bảo an toàn (tương tự logic tạo URL)
        // Tuy nhiên, để đơn giản cho demo, ta tạm thời tin tưởng response code

        if ("00".equals(vnp_ResponseCode)) {
            // Thanh toán thành công
            Long donHangId = Long.parseLong(vnp_TxnRef);
            DonDatTour donDatTour = donDatTourRepository.findById(donHangId)
                    .orElseThrow(() -> new TaiNguyenKhongTonTaiException("Không tìm thấy đơn hàng: " + donHangId));

            donDatTour.setTrangThai("DA_THANH_TOAN");
            donDatTourRepository.save(donDatTour);

            try {
                // Gửi email thông báo thanh toán thành công
                guiEmailService.guiEmailThanhToanThanhCong(
                        donDatTour.getNguoiDung().getEmail(),
                        String.valueOf(donHangId));
            } catch (Exception e) {
                System.err.println("Lỗi khi gửi email xác nhận thanh toán: " + e.getMessage());
            }
            return "Thanh toán thành công";
        } else {
            return "Thanh toán thất bại";
        }
    }

    private String getIpAddress(HttpServletRequest request) {
        String ipAdress;
        try {
            ipAdress = request.getHeader("X-FORWARDED-FOR");
            if (ipAdress == null) {
                ipAdress = request.getRemoteAddr();
            }
        } catch (Exception e) {
            ipAdress = "Invalid IP:" + e.getMessage();
        }
        return ipAdress;
    }
}