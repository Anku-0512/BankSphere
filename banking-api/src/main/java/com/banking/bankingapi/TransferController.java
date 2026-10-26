package com.banking.bankingapi;

import java.math.BigDecimal;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RestController;

@RestController
public class TransferController {

    private final JdbcTemplate jdbcTemplate;

    public TransferController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    @PostMapping("/api/accounts/{sourceAccount}/transfer")
    @Transactional
    public ResponseEntity<Map<String, Object>> transferMoney(
            @PathVariable String sourceAccount,
            @RequestBody Map<String, Object> request) {

        // 1. Validate account numbers
        if (sourceAccount == null || sourceAccount.trim().isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Source account is required."));
        }

        sourceAccount = sourceAccount.trim();

        if (request == null || request.get("destinationAccount") == null) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Destination account is required."));
        }

        String destinationAccount =
                request.get("destinationAccount").toString().trim();

        if (destinationAccount.isEmpty()) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Destination account is required."));
        }

        // 2. Source and destination must be different
        if (sourceAccount.equals(destinationAccount)) {
            return ResponseEntity.badRequest().body(
                    Map.of("message",
                            "Source and destination accounts must be different."));
        }

        // 3. Validate amount
        BigDecimal amount;

        try {
            Object amountValue = request.get("amount");

            if (amountValue == null) {
                throw new NumberFormatException();
            }

            amount = new BigDecimal(amountValue.toString());

            if (amount.compareTo(BigDecimal.ZERO) <= 0) {
                return ResponseEntity.badRequest().body(
                        Map.of("message",
                                "Amount must be greater than zero."));
            }

            if (amount.stripTrailingZeros().scale() > 2) {
                return ResponseEntity.badRequest().body(
                        Map.of("message",
                                "Amount cannot have more than two decimal places."));
            }

        } catch (NumberFormatException e) {
            return ResponseEntity.badRequest().body(
                    Map.of("message", "Please enter a valid amount."));
        }

        try {
            // 4. Check and lock source account
            Map<String, Object> source = jdbcTemplate.queryForMap(
                    "SELECT account_id FROM accounts "
                    + "WHERE account_number = ? FOR UPDATE",
                    sourceAccount);

            // 5. Check and lock destination account
            Map<String, Object> destination = jdbcTemplate.queryForMap(
                    "SELECT account_id FROM accounts "
                    + "WHERE account_number = ? FOR UPDATE",
                    destinationAccount);

            int sourceId =
                    ((Number) source.get("account_id")).intValue();

            int destinationId =
                    ((Number) destination.get("account_id")).intValue();

            // 6. Deduct money only if sufficient balance exists
            int updated = jdbcTemplate.update(
                    "UPDATE accounts SET balance = balance - ? "
                    + "WHERE account_id = ? AND balance >= ?",
                    amount, sourceId, amount);

            if (updated == 0) {
                return ResponseEntity.badRequest().body(
                        Map.of("message", "Insufficient balance."));
            }

            // 7. Add money to destination account
            jdbcTemplate.update(
                    "UPDATE accounts SET balance = balance + ? "
                    + "WHERE account_id = ?",
                    amount, destinationId);

            // 8. Record outgoing transaction
            jdbcTemplate.update(
                    "INSERT INTO transactions "
                    + "(account_id, transaction_type, amount, description) "
                    + "VALUES (?, 'TRANSFER_OUT', ?, ?)",
                    sourceId, amount,
                    "Transfer to " + destinationAccount);

            // 9. Record incoming transaction
            jdbcTemplate.update(
                    "INSERT INTO transactions "
                    + "(account_id, transaction_type, amount, description) "
                    + "VALUES (?, 'TRANSFER_IN', ?, ?)",
                    destinationId, amount,
                    "Transfer from " + sourceAccount);

            return ResponseEntity.ok(
                    Map.of("message", "Money transferred successfully."));

        } catch (org.springframework.dao.EmptyResultDataAccessException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(
                    Map.of("message",
                            "Source or destination account not found."));
        }
    }
}
