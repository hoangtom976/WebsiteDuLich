package com.dulich.backend.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "dia_diem")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class DiaDiem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "ten_dia_diem", nullable = false)
    private String tenDiaDiem;

    @Column(name = "mo_ta", columnDefinition = "TEXT")
    private String moTa;
}