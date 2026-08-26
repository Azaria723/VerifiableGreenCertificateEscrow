# VerifiableGreenCertificateEscrow — Technical Specification

## 1. Executive Summary

`VerifiableGreenCertificateEscrow` is an evidence-bound settlement protocol on GenLayer for renewable energy certificates (I-REC, TIGR) and carbon offsets (Verra VCS, Gold Standard). It locks native GEN into escrow and releases funds to suppliers only after decentralized validator nodes verify public registry evidence of certificate retirement under the exact agreed terms.

---

## 2. Escrow State Machine

```text
               ┌───────────────┐
               │    CREATED    │
               └───────┬───────┘
                       │ fund_escrow (payable)
               ┌───────▼───────┐
               │    FUNDED     │
               └───────┬───────┘
                       │ submit_certificate
               ┌───────▼───────┐
               │   SUBMITTED   │
               └───────┬───────┘
                       │ verify_certificate (nondet)
               ┌───────▼───────┐
               │ UNDER_REVIEW  │
               └───────┬───────┘
     ┌─────────────────┼─────────────────┬─────────────────┐
     │                 │                 │                 │
┌────▼────┐      ┌─────▼──────┐    ┌─────▼────────┐  ┌─────▼────────┐
│VERIFIED │      │  REJECTED  │    │ UNAVAILABLE  │  │  CONFLICTED  │
└────┬────┘      └─────┬──────┘    └─────┬────────┘  └─────┬────────┘
     │ settle          │ refund          │ refund          │ refund
┌────▼────┐      ┌─────▼──────┐    ┌─────▼────────┐  ┌─────▼────────┐
│ SETTLED │      │  REFUNDED  │    │   REFUNDED   │  │   REFUNDED   │
└─────────┘      └────────────┘    └──────────────┘  └──────────────┘
```

---

## 3. Anti-Double-Claim Protection

To prevent selling or retiring the same certificate serials across multiple escrows:

$$\text{certificate\_identity\_hash} = \text{SHA-256}(\text{registry} \parallel \text{cert\_type} \parallel \text{serial\_start} \parallel \text{serial\_end})$$

1. **Submission Guard:** The contract verifies `consumed_certificates[identity_hash] == 0` and checks no other active escrow holds the same identity.
2. **Settlement Lock:** Upon `settle_escrow`, the identity hash is permanently marked as consumed: `consumed_certificates[identity_hash] = escrow_id + 1`.
3. **Replay Invalidation:** Any subsequent attempt to submit or settle the same identity hash is unconditionally rejected.

---

## 4. Consensus Binding Matrix

| Field | Origin | Persisted | Consensus Binding Mechanism | Differential Test |
|---|---|---|---|---|
| `registry_match` | Evaluated registry | Yes | `strict_eq` string equality | Mutate registry -> `FAIL` |
| `serial_status` | Serial range check | Yes | `strict_eq` string equality | Mutate serial -> `INVALID` |
| `retirement_status`| Web fetch of status | Yes | `strict_eq` string equality | Active status -> `REJECTED` |
| `beneficiary_match`| Buyer entity match | Yes | `strict_eq` string equality | Mutate beneficiary -> `FAIL` |
| `vintage_match` | Vintage & volume | Yes | `strict_eq` string equality | Mutate year/amount -> `FAIL` |
| `double_claim_risk`| Cross-market search | Yes | `strict_eq` string equality | Suspected risk -> `CONFLICTED` |
| `digest_ok` | Raw bytes SHA-256 | Yes | Deterministic digest verify | Tamper bytes -> `UNAVAILABLE` |

---

## 5. Balance Conservation Invariant

$$\text{Initial Balance} + \sum \text{Deposits} - \sum \text{Payouts} - \sum \text{Refunds} \equiv \text{Current Contract Balance}$$

- Payouts are executed via `gl.get_contract_at(supplier).emit_transfer(value=amount)`.
- Refunds are executed via `gl.get_contract_at(buyer).emit_transfer(value=amount)`.
- State mutation occurs strictly before external transfers (Checks-Effects-Interactions).
