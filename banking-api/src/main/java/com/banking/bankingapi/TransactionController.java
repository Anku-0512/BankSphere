
package com.banking.bankingapi;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TransactionController {

    private final JdbcTemplate jdbcTemplate;

    public TransactionController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

  
    @GetMapping("/api/accounts/{accountNumber}/transactions")
    public List<Map<String, Object>> getTransactionHistory(
            @PathVariable String accountNumber) {

        String sql = "SELECT t.transaction_id, a.account_number, "
                   + "t.transaction_type, t.amount, t.description, "
                   + "t.transaction_date "
                   + "FROM transactions t "
                   + "JOIN accounts a ON t.account_id = a.account_id "
                   + "WHERE a.account_number = ? "
                   + "ORDER BY t.transaction_date DESC";

        return jdbcTemplate.queryForList(sql, accountNumber);
    }


    @GetMapping("/api/accounts/{accountNumber}/mini-statement")
    public List<Map<String, Object>> getMiniStatement(
            @PathVariable String accountNumber) {

        String sql = "SELECT t.transaction_id, a.account_number, "
                   + "t.transaction_type, t.amount, t.description, "
                   + "t.transaction_date "
                   + "FROM transactions t "
                   + "JOIN accounts a ON t.account_id = a.account_id "
                   + "WHERE a.account_number = ? "
                   + "ORDER BY t.transaction_date DESC, "
                   + "t.transaction_id DESC "
                   + "LIMIT 5";

        return jdbcTemplate.queryForList(sql, accountNumber);
    }
}
