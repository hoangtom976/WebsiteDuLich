package com.dulich.backend.controller;

import com.dulich.backend.dto.VoucherDTO;
import com.dulich.backend.dto.VoucherCuaToiDTO;
import com.dulich.backend.entity.Voucher;
import com.dulich.backend.service.VoucherService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/voucher")
@RequiredArgsConstructor
public class VoucherController {

    private final VoucherService voucherService;

    @GetMapping
    public ResponseEntity<List<Voucher>> layTatCaVoucher() {
        return ResponseEntity.ok(voucherService.layTatCaVoucher());
    }

    @PostMapping
    public ResponseEntity<Voucher> taoVoucher(@RequestBody @Valid VoucherDTO req) {
        Voucher voucher = voucherService.taoVoucher(req);
        return new ResponseEntity<>(voucher, HttpStatus.CREATED);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Voucher> suaVoucher(@PathVariable Long id, @RequestBody @Valid VoucherDTO req) {
        Voucher voucher = voucherService.suaVoucher(id, req);
        return ResponseEntity.ok(voucher);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> xoaVoucher(@PathVariable Long id) {
        voucherService.xoaVoucher(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/kiem-tra/{maVoucher}")
    public ResponseEntity<Voucher> kiemTraVoucher(@PathVariable String maVoucher) {
        Voucher voucher = voucherService.kiemTraVoucher(maVoucher);
        return ResponseEntity.ok(voucher);
    }

    @GetMapping("/cua-toi")
    public ResponseEntity<List<VoucherCuaToiDTO>> layVoucherCuaToi() {
        return ResponseEntity.ok(voucherService.layVouchersCuaToi());
    }
}
