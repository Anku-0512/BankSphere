
package com.banking.bankingapi;

import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class AccountBalanceController {

    private final JdbcTemplate jdbcTemplate;

    public AccountBalanceController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/accounts/{accountNumber}/balance")
    public Map<String, Object> getBalance(
            @PathVariable String accountNumber) {

        String sql = "SELECT account_number, balance "
                   + "FROM accounts WHERE account_number = ?";

        return jdbcTemplate.queryForMap(sql, accountNumber);
    }
}
