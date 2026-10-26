
package com.banking.bankingapi;

import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
@CrossOrigin(origins = "http://localhost:5177")
public class CustomerController {

    private final JdbcTemplate jdbcTemplate;

    public CustomerController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/api/customers")
    public String registerCustomer(@RequestBody Customer customer) {

        String sql = "INSERT INTO customers "
                + "(full_name, email, phone, address) "
                + "VALUES (?, ?, ?, ?)";

        jdbcTemplate.update(
                sql,
                customer.getName(),
                customer.getEmail(),
                customer.getPhone(),
                customer.getAddress()
        );

        return "Customer registered successfully!";
    }
}
