
package com.banking.bankingapi;

import java.util.Map;
import java.util.UUID;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5177")
public class AccountController {

    private final JdbcTemplate jdbcTemplate;

    public AccountController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/api/accounts")
    public String createAccount(@RequestBody Map<String, Object> request) {

        int customerId = Integer.parseInt(
                request.get("customerId").toString());

        String accountType = request.get("accountType").toString();

        double balance = Double.parseDouble(
                request.get("balance").toString());

        String accountNumber = "AC" + UUID.randomUUID()
                .toString().replace("-", "").substring(0, 10);

        String sql = "INSERT INTO accounts "
                + "(customer_id, account_number, account_type, balance) "
                + "VALUES (?, ?, ?, ?)";

        jdbcTemplate.update(
                sql,
                customerId,
                accountNumber,
                accountType,
                balance
        );

        return "Account created successfully! Account Number: "
                + accountNumber;
    }
}
