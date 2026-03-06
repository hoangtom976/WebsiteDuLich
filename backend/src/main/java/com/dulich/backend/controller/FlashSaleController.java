package com.dulich.backend.controller;

import com.dulich.backend.dto.FlashSaleDTO;
import com.dulich.backend.service.FlashSaleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/flash-sales")
@RequiredArgsConstructor
public class FlashSaleController {

    private final FlashSaleService flashSaleService;

    @GetMapping
    public ResponseEntity<List<FlashSaleDTO>> getAllFlashSales() {
        return ResponseEntity.ok(flashSaleService.getAllFlashSales());
    }

    @GetMapping("/tour/{tourId}")
    public ResponseEntity<FlashSaleDTO> getActiveFlashSaleForTour(@PathVariable Long tourId) {
        FlashSaleDTO flashSale = flashSaleService.getActiveFlashSaleForTour(tourId);
        return ResponseEntity.ok(flashSale);
    }

    @GetMapping("/active")
    public ResponseEntity<FlashSaleDTO> getActiveFlashSale() {
        FlashSaleDTO activeDeal = flashSaleService.getActiveFlashSale();
        if (activeDeal == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(activeDeal);
    }

    @PostMapping
    public ResponseEntity<FlashSaleDTO> createFlashSale(@RequestBody FlashSaleDTO dto) {
        return ResponseEntity.ok(flashSaleService.createFlashSale(dto));
    }

    @PutMapping("/{id}")
    public ResponseEntity<FlashSaleDTO> updateFlashSale(@PathVariable Long id, @RequestBody FlashSaleDTO dto) {
        return ResponseEntity.ok(flashSaleService.updateFlashSale(id, dto));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFlashSale(@PathVariable Long id) {
        flashSaleService.deleteFlashSale(id);
        return ResponseEntity.ok().build();
    }
}
