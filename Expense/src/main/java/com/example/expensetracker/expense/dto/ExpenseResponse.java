package com.example.expensetracker.expense.dto;

import com.example.expensetracker.expense.model.ExpenseCategory;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseResponse(
        Long id,
        BigDecimal amount,
        ExpenseCategory category,
        String description,
        LocalDate date
) {}

