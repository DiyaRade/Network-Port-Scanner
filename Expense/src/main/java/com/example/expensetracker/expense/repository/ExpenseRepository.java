package com.example.expensetracker.expense.repository;

import com.example.expensetracker.expense.model.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;

import java.time.LocalDate;
import java.util.List;

public interface ExpenseRepository extends JpaRepository<Expense, Long> {

    @Query("select e from Expense e order by e.date desc, e.id desc")
    List<Expense> findAllOrderByDateDesc();

    List<Expense> findAllByDateBetween(LocalDate from, LocalDate to);
}

