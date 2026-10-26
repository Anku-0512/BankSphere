
package com.banking.bankingapi;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@CrossOrigin(origins = "http://localhost:5177")
public class BeneficiaryController {

    private final JdbcTemplate jdbcTemplate;

    public BeneficiaryController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Add a new beneficiary
    @PostMapping("/api/customers/{customerId}/beneficiaries")
    public String addBeneficiary(
            @PathVariable int customerId,
            @RequestBody Map<String, String> request) {

        String sql = "INSERT INTO beneficiaries "
                + "(customer_id, beneficiary_name, account_number, bank_name, ifsc_code) "
                + "VALUES (?, ?, ?, ?, ?)";

        jdbcTemplate.update(
                sql,
                customerId,
                request.get("beneficiaryName"),
                request.get("accountNumber"),
                request.get("bankName"),
                request.get("ifscCode")
        );

        return "Beneficiary added successfully!";
    }

    // View beneficiaries for a customer
    @GetMapping("/api/customers/{customerId}/beneficiaries")
    public List<Map<String, Object>> getBeneficiaries(
            @PathVariable int customerId) {

        String sql = "SELECT * FROM beneficiaries "
                + "WHERE customer_id = ? "
                + "ORDER BY beneficiary_id DESC";

        return jdbcTemplate.queryForList(sql, customerId);
    }

    // Update an existing beneficiary
    @PutMapping("/api/customers/{customerId}/beneficiaries/{beneficiaryId}")
    public String updateBeneficiary(
            @PathVariable int customerId,
            @PathVariable int beneficiaryId,
            @RequestBody Map<String, String> request) {

        String sql = "UPDATE beneficiaries SET "
                + "beneficiary_name = ?, "
                + "account_number = ?, "
                + "bank_name = ?, "
                + "ifsc_code = ? "
                + "WHERE beneficiary_id = ? AND customer_id = ?";

        int rowsUpdated = jdbcTemplate.update(
                sql,
                request.get("beneficiaryName"),
                request.get("accountNumber"),
                request.get("bankName"),
                request.get("ifscCode"),
                beneficiaryId,
                customerId
        );

        if (rowsUpdated == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Beneficiary not found."
            );
        }

        return "Beneficiary updated successfully!";
    }

    // Delete a beneficiary
    @DeleteMapping("/api/customers/{customerId}/beneficiaries/{beneficiaryId}")
    public String deleteBeneficiary(
            @PathVariable int customerId,
            @PathVariable int beneficiaryId) {

        String sql = "DELETE FROM beneficiaries "
                + "WHERE beneficiary_id = ? AND customer_id = ?";

        int rowsDeleted = jdbcTemplate.update(
                sql, beneficiaryId, customerId
        );

        if (rowsDeleted == 0) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Beneficiary not found."
            );
        }

        return "Beneficiary deleted successfully!";
    }
}
