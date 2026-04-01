package com.example.expensetracker.expense.service;

import com.example.expensetracker.expense.dto.ExpenseReportResponse;
import com.example.expensetracker.expense.dto.ExpenseRequest;
import com.example.expensetracker.expense.dto.ExpenseResponse;

import java.util.List;

public interface ExpenseService {
    ExpenseResponse create(ExpenseRequest request);

    List<ExpenseResponse> getAll();

    ExpenseResponse update(Long id, ExpenseRequest request);

    void delete(Long id);

    ExpenseReportResponse report();
}

