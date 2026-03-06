package com.dulich.backend.service;

import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.dulich.backend.dto.CauHinhHeThongDTO;
import com.dulich.backend.entity.CauHinhHeThong;
import com.dulich.backend.repository.CauHinhHeThongRepository;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CauHinhHeThongService {

    private static final long DEFAULT_ID = 1L;
    private final CauHinhHeThongRepository cauHinhHeThongRepository;

    @Transactional(readOnly = true)
    public CauHinhHeThongDTO layCauHinh() {
        CauHinhHeThong config = layHoacTaoCauHinhMacDinh();
        return toDto(config);
    }

    @Transactional
    public CauHinhHeThongDTO capNhatCauHinh(CauHinhHeThongDTO request) {
        CauHinhHeThong config = layHoacTaoCauHinhMacDinh();

        config.setTenHeThong(request.getTenHeThong());
        config.setHotline(request.getHotline());
        config.setEmailLienHe(request.getEmailLienHe());
        config.setDiaChi(request.getDiaChi());
        config.setGioLamViec(request.getGioLamViec());
        config.setBatEmailThongBao(Boolean.TRUE.equals(request.getBatEmailThongBao()));
        config.setBatChatbot(Boolean.TRUE.equals(request.getBatChatbot()));
        config.setBatThoiTiet(Boolean.TRUE.equals(request.getBatThoiTiet()));

        CauHinhHeThong saved = cauHinhHeThongRepository.save(config);
        return toDto(saved);
    }

    private CauHinhHeThong layHoacTaoCauHinhMacDinh() {
        return cauHinhHeThongRepository.findById(DEFAULT_ID)
                .orElseGet(() -> cauHinhHeThongRepository.save(
                        CauHinhHeThong.builder()
                                .id(DEFAULT_ID)
                                .tenHeThong("Viet Tour Admin")
                                .hotline("1900 1234")
                                .emailLienHe("contact@viettour.com")
                                .diaChi("TP. Ho Chi Minh")
                                .gioLamViec("08:00 - 22:00")
                                .batEmailThongBao(true)
                                .batChatbot(true)
                                .batThoiTiet(true)
                                .build()));
    }

    private CauHinhHeThongDTO toDto(CauHinhHeThong config) {
        CauHinhHeThongDTO dto = new CauHinhHeThongDTO();
        dto.setTenHeThong(config.getTenHeThong());
        dto.setHotline(config.getHotline());
        dto.setEmailLienHe(config.getEmailLienHe());
        dto.setDiaChi(config.getDiaChi());
        dto.setGioLamViec(config.getGioLamViec());
        dto.setBatEmailThongBao(Boolean.TRUE.equals(config.getBatEmailThongBao()));
        dto.setBatChatbot(Boolean.TRUE.equals(config.getBatChatbot()));
        dto.setBatThoiTiet(Boolean.TRUE.equals(config.getBatThoiTiet()));
        return dto;
    }
}
