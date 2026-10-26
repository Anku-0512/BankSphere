package com.banking.bankingapi;

import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.transaction.annotation.Transactional;

@RestController
public class DepositController {

    private final JdbcTemplate jdbcTemplate;

    public DepositController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @Transactional
    @PostMapping("/api/accounts/{accountNumber}/deposit")
    public String depositMoney(
            @PathVariable String accountNumber,
            @RequestBody Map<String, Double> request) {

        Double amount = request.get("amount");

        if (amount == null || !Double.isFinite(amount) || amount <= 0) {
            return "Deposit amount must be greater than zero!";
        }

        String findSql = "SELECT account_id FROM accounts WHERE account_number = ?";
        Integer accountId;

        try {
            accountId = jdbcTemplate.queryForObject(
                    findSql, Integer.class, accountNumber);
        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return "Account not found!";
        }

        String updateSql = "UPDATE accounts SET balance = balance + ? WHERE account_id = ?";
        jdbcTemplate.update(updateSql, amount, accountId);

        String transactionSql = "INSERT INTO transactions "
                + "(account_id, transaction_type, amount, description) "
                + "VALUES (?, ?, ?, ?)";

        jdbcTemplate.update(transactionSql, accountId, "DEPOSIT",
                amount, "Money deposited");

        return "Money deposited and transaction recorded successfully!";
    }
}
