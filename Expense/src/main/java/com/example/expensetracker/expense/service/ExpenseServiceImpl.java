package com.example.expensetracker.expense.service;

import com.example.expensetracker.common.exception.ResourceNotFoundException;
import com.example.expensetracker.expense.dto.ExpenseReportResponse;
import com.example.expensetracker.expense.dto.ExpenseRequest;
import com.example.expensetracker.expense.dto.ExpenseResponse;
import com.example.expensetracker.expense.model.Expense;
import com.example.expensetracker.expense.model.ExpenseCategory;
import com.example.expensetracker.expense.repository.ExpenseRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.YearMonth;
import java.util.EnumMap;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Service
public class ExpenseServiceImpl implements ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseServiceImpl(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    @Override
    @Transactional
    public ExpenseResponse create(ExpenseRequest request) {
        Expense e = new Expense();
        e.setAmount(request.amount());
        e.setCategory(request.category());
        e.setDescription(request.description());
        e.setDate(request.date());
        return toResponse(expenseRepository.save(e));
    }

    @Override
    @Transactional(readOnly = true)
    public List<ExpenseResponse> getAll() {
        return expenseRepository.findAllOrderByDateDesc()
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Override
    @Transactional
    public ExpenseResponse update(Long id, ExpenseRequest request) {
        Expense e = expenseRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found: " + id));

        e.setAmount(request.amount());
        e.setCategory(request.category());
        e.setDescription(request.description());
        e.setDate(request.date());

        return toResponse(expenseRepository.save(e));
    }

    @Override
    @Transactional
    public void delete(Long id) {
        if (!expenseRepository.existsById(id)) {
            throw new ResourceNotFoundException("Expense not found: " + id);
        }
        expenseRepository.deleteById(id);
    }

    @Override
    @Transactional(readOnly = true)
    public ExpenseReportResponse report() {
        List<Expense> expenses = expenseRepository.findAll();

        BigDecimal total = expenses.stream()
                .map(Expense::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<ExpenseCategory, BigDecimal> byCategory = new EnumMap<>(ExpenseCategory.class);
        for (ExpenseCategory c : ExpenseCategory.values()) {
            byCategory.put(c, BigDecimal.ZERO);
        }
        for (Expense e : expenses) {
            byCategory.put(e.getCategory(), byCategory.get(e.getCategory()).add(e.getAmount()));
        }

        Map<String, BigDecimal> byMonth = new LinkedHashMap<>();
        expenses.stream()
                .sorted((a, b) -> b.getDate().compareTo(a.getDate()))
                .forEach(e -> {
                    YearMonth ym = YearMonth.from(e.getDate());
                    String key = ym.toString(); // YYYY-MM
                    byMonth.put(key, byMonth.getOrDefault(key, BigDecimal.ZERO).add(e.getAmount()));
                });

        return new ExpenseReportResponse(total, byCategory, byMonth);
    }

    private ExpenseResponse toResponse(Expense e) {
        return new ExpenseResponse(
                e.getId(),
                e.getAmount(),
                e.getCategory(),
                e.getDescription(),
                e.getDate()
        );
    }
}

