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
public class YeuThichId implements Serializable {
    private Long nguoiDungId;
    private Long tourId;
}
