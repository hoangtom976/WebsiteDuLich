package com.dulich.backend.util;

import java.text.Normalizer;
import java.util.regex.Pattern;

/**
 * Tiện ích chuẩn hóa ký tự tiếng Việt:
 * - Bỏ dấu (Phú Quốc → Phu Quoc)
 * - Chuyển đ/Đ → d/D
 */
public final class VNCharacterUtils {

    private static final Pattern DIACRITICS = Pattern.compile("\\p{InCombiningDiacriticalMarks}+");

    private VNCharacterUtils() {}

    /**
     * Loại bỏ dấu tiếng Việt khỏi chuỗi.
     * Ví dụ: "Phú Quốc" → "Phu Quoc", "Đà Nẵng" → "Da Nang"
     */
    public static String removeDiacritics(String input) {
        if (input == null || input.isEmpty()) return input;
        String normalized = Normalizer.normalize(input, Normalizer.Form.NFD);
        String withoutDiacritics = DIACRITICS.matcher(normalized).replaceAll("");
        // Xử lý riêng đ/Đ vì NFD không tách được
        withoutDiacritics = withoutDiacritics.replace('đ', 'd').replace('Đ', 'D');
        return withoutDiacritics;
    }
}
