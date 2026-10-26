package com.banking.bankingapi;

import java.util.Map;

import org.springframework.dao.EmptyResultDataAccessException;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class WithdrawController {

    private final JdbcTemplate jdbcTemplate;

    public WithdrawController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    @PostMapping("/api/accounts/{accountNumber}/withdraw")
    public String withdrawMoney(
            @PathVariable String accountNumber,
            @RequestBody Map<String, Double> request) {

        Double amount = request.get("amount");

        if (amount == null || !Double.isFinite(amount) || amount <= 0) {
            return "Withdrawal amount must be greater than zero!";
        }

        String findSql =
                "SELECT account_id FROM accounts WHERE account_number = ?";

        Integer accountId;

        try {
            accountId = jdbcTemplate.queryForObject(
                    findSql, Integer.class, accountNumber);
        } catch (EmptyResultDataAccessException e) {
            return "Account not found!";
        }

        String updateSql =
                "UPDATE accounts SET balance = balance - ? "
              + "WHERE account_id = ? AND balance >= ?";

        int rows = jdbcTemplate.update(
                updateSql, amount, accountId, amount);

        if (rows == 0) {
            return "Insufficient balance!";
        }

        String transactionSql =
                "INSERT INTO transactions "
              + "(account_id, transaction_type, amount, description) "
              + "VALUES (?, ?, ?, ?)";

        jdbcTemplate.update(
                transactionSql, accountId, "WITHDRAW",
                amount, "Money withdrawn");

        return "Money withdrawn and transaction recorded successfully!";
    }
}
