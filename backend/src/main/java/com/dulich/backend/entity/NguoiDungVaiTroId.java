package com.dulich.backend.entity;

import java.io.Serializable;

import jakarta.persistence.Embeddable;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Embeddable
@Data
@NoArgsConstructor
@AllArgsConstructor
public class NguoiDungVaiTroId implements Serializable {
    private Long nguoiDungId;
    private Long vaiTroId;
}
