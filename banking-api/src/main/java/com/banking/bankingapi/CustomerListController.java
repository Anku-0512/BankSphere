
package com.banking.bankingapi;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class CustomerListController {

    private final JdbcTemplate jdbcTemplate;

    public CustomerListController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @GetMapping("/api/customers")
    public List<Map<String, Object>> getAllCustomers() {

        String sql = "SELECT * FROM customers ORDER BY customer_id";

        return jdbcTemplate.queryForList(sql);
    }
}
