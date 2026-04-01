package com.example.expensetracker.expense.dto;

import com.example.expensetracker.expense.model.ExpenseCategory;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseRequest(
        @NotNull @DecimalMin(value = "0.01") BigDecimal amount,
        @NotNull ExpenseCategory category,
        @NotBlank @Size(max = 500) String description,
        @NotNull LocalDate date
) {}

