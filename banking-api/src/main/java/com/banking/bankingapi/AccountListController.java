package com.banking.bankingapi;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5177")
public class AccountListController {

    private final JdbcTemplate jdbcTemplate;

    public AccountListController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/accounts")
    public List<Map<String, Object>> getAllAccounts() {

        String sql = "SELECT * FROM accounts ORDER BY account_id";

        return jdbcTemplate.queryForList(sql);
    }
}
