package com.example.expensetracker.expense.dto;

import com.example.expensetracker.expense.model.ExpenseCategory;

import java.math.BigDecimal;
import java.util.Map;

public record ExpenseReportResponse(
        BigDecimal totalExpenses,
        Map<ExpenseCategory, BigDecimal> categoryWiseExpenses,
        Map<String, BigDecimal> monthlySummary
) {}

