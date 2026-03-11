package com.dulich.backend.controller;

import com.dulich.backend.dto.GuiOtpDangKyDTO;
import com.dulich.backend.dto.XacNhanOtpDangKyDTO;
import com.dulich.backend.dto.DangNhapDTO;
import com.dulich.backend.dto.DatLaiMatKhauDTO;
import com.dulich.backend.dto.PhanHoiTokenDTO;
import com.dulich.backend.dto.QuenMatKhauDTO;
import com.dulich.backend.repository.NguoiDungRepository;
import com.dulich.backend.service.XacThucService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class XacThucController {

    private final XacThucService xacThucService;
    private final NguoiDungRepository nguoiDungRepository;

    @PostMapping("/gui-otp-dang-ky")
    public ResponseEntity<String> guiOtpDangKy(@Valid @RequestBody GuiOtpDangKyDTO request) {
        return ResponseEntity.ok(xacThucService.guiOtpDangKy(request.getEmail()));
    }

    @PostMapping("/xac-nhan-dang-ky")
    public ResponseEntity<String> xacNhanDangKy(@Valid @RequestBody XacNhanOtpDangKyDTO request) {
        return ResponseEntity.ok(xacThucService.xacNhanDangKy(request.getThongTinDangKy(), request.getOtp()));
    }

    @PostMapping("/dang-nhap")
    public ResponseEntity<?> dangNhap(@Valid @RequestBody DangNhapDTO request) {
        try {
            String token = xacThucService.dangNhap(request);
            PhanHoiTokenDTO phanHoi = new PhanHoiTokenDTO();
            phanHoi.setAccessToken(token);
            String hoTen = nguoiDungRepository.findByEmailIgnoreCase(request.getEmail())
                    .map(nguoiDung -> nguoiDung.getHoTen())
                    .orElse("");
            phanHoi.setHoTen(hoTen);
            return ResponseEntity.ok(phanHoi);
        } catch (DisabledException e) {
            return ResponseEntity.badRequest().body("Tài khoản đã bị khóa");
        } catch (AuthenticationException e) {
            return ResponseEntity.badRequest().body("Tài khoản hoặc mật khẩu không chính xác");
        }
    }

    @PostMapping("/quen-mat-khau")
    public ResponseEntity<String> quenMatKhau(@Valid @RequestBody QuenMatKhauDTO request) {
        String result = xacThucService.quenMatKhau(request.getEmail());
        return ResponseEntity.ok(result);
    }

    @PostMapping("/dat-lai-mat-khau")
    public ResponseEntity<String> datLaiMatKhau(@Valid @RequestBody DatLaiMatKhauDTO request) {
        String result = xacThucService.datLaiMatKhau(request.getToken(), request.getMatKhauMoi());
        return ResponseEntity.ok(result);
    }
}
