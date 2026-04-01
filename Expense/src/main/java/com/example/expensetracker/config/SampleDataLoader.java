package com.example.expensetracker.config;

import com.example.expensetracker.expense.model.Expense;
import com.example.expensetracker.expense.model.ExpenseCategory;
import com.example.expensetracker.expense.repository.ExpenseRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Configuration
public class SampleDataLoader {

    private final ExpenseRepository expenseRepository;

    public SampleDataLoader(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    @Bean
    CommandLineRunner loadSampleData() {
        return args -> {
            if (expenseRepository.count() > 0) return;

            Expense e1 = new Expense();
            e1.setAmount(new BigDecimal("12.50"));
            e1.setCategory(ExpenseCategory.FOOD);
            e1.setDescription("Lunch");
            e1.setDate(LocalDate.now().minusDays(2));

            Expense e2 = new Expense();
            e2.setAmount(new BigDecimal("45.00"));
            e2.setCategory(ExpenseCategory.TRAVEL);
            e2.setDescription("Taxi");
            e2.setDate(LocalDate.now().minusDays(10));

            Expense e3 = new Expense();
            e3.setAmount(new BigDecimal("120.00"));
            e3.setCategory(ExpenseCategory.BILLS);
            e3.setDescription("Internet bill");
            e3.setDate(LocalDate.now().withDayOfMonth(1));

            expenseRepository.saveAll(List.of(e1, e2, e3));
        };
    }
}

