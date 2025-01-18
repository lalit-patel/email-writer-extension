package com.patel.emailWriter.DTO;

import lombok.Data;

@Data
public class EmailRequest {
    private String emailContent;
    private String tone;
}
