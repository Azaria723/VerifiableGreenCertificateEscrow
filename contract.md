# Contract Design: VerifiableGreenCertificateEscrow

## 1. Policy Boundary

The contract enforces an evidence-bound settlement condition for environmental commodity transactions (Renewable Energy Certificates & Verified Carbon Units). It evaluates the consistency between public registry statements, serial identity, and agreed escrow terms. It does not claim to replace statutory registries or provide physical environmental inspection.

---

## 2. Evidence & Consensus Protocol

1. **Evidence Packet Commitment:**
   Every certificate submission binds:
   - Registry HTTPS URL
   - Public Retirement Proof HTTPS URL
   - Serial Number Range (`serial_start` & `serial_end`)
   - Volume, Vintage, and Beneficiary name
   - Raw Evidence JSON and its SHA-256 Digest (`cert_digests`)

2. **Decentralized Validator Adjudication:**
   During `verify_certificate`, validators:
   - Fetch the public retirement URL directly over HTTPS.
   - Verify that raw evidence bytes match the committed SHA-256 digest.
   - Categorize output into closed enums (`PASS`/`FAIL`, `VALID`/`INVALID`, `RETIRED`/`CANCELLED`/`ACTIVE`, `NONE`/`SUSPECTED`).
   - The contract deterministically derives the final status (`VERIFIED`, `REJECTED`, `UNAVAILABLE`, `CONFLICTED`).

---

## 3. Threat Model & Mitigations

| Threat | Vector | Contract Mitigation |
|---|---|---|
| **Double-Claim / Double-Selling** | Reusing the same certificate in multiple deals | `certificate_identity_hash` uniquely indexed and locked upon settlement |
| **Unretired Resale** | Submitting active certificates | Status must be explicitly `RETIRED` or `CANCELLED`; `ACTIVE` is rejected |
| **Beneficiary Spoofing** | Retiring under another entity's name | Exact beneficiary string matching against registry record |
| **Tampered Evidence Payload** | Changing payload post-commitment | Cryptographic SHA-256 digest verification before web fetch |
| **Registry Outage / HTTP 500** | Temporary server failure | Fails closed to `UNAVAILABLE`; enables retry or guaranteed buyer refund |

---

## 4. Custody & Accounting Rules

- Escrow utilizes native GEN payable transactions (`@gl.public.write.payable`).
- Funds are transferred via `gl.get_contract_at(recipient).emit_transfer(value=amount)`.
- Reentrancy / race condition mitigation: Escrow status is updated and amount is zeroed before any external transfer call.
- Balance conservation is guaranteed across all transitions.
