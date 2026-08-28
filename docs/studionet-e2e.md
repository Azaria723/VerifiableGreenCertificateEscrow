# Studionet E2E evidence

## Scope

This record documents one successful native-GEN custody lifecycle on Studionet. It does not claim that the synthetic DEMO-002 fixture is a real issued environmental certificate.

## Deployment

- Contract: `0x2440A4742DEE0878c2AD6FaacaAE68E23063F4d6`
- Escrow: `3`
- Buyer: `0x67A1A08Fc4cf7D05c859d0d3D8398a3A30B1677e`
- Supplier: `0x7C87B10a3d43F3b3551414401F8b26B9F662bAB5`
- Amount: `0.001 GEN`
- Registry mapping: `I-REC` to the repository-controlled HTTPS prefix under `raw.githubusercontent.com/Azaria723/VerifiableGreenCertificateEscrow/main/evidence/`

## Canonical evidence

- Submitted record: `evidence/retired-demo-002.json`
- Canonical registry record: `evidence/certificates/DEMO-002.json`
- Serial range: `DEMO-002` to `DEMO-002`
- SHA-256 digest: `ffcc220a47f73ca9a159006dedeb9433968f4d3ba8cefc951444ec764dbe7910`

The contract derived the canonical URL from the owner-controlled registry prefix and submitted serial. Supplier-selected URLs outside the prefix are rejected before state mutation.

## Observed lifecycle

1. Escrow `3` was created for the supplier.
2. The buyer funded exactly `1,000,000,000,000,000 wei`.
3. The supplier submitted DEMO-002 evidence and the escrow moved to `SUBMITTED`.
4. `verify_certificate(3)` finalized with return code `4` and verdict `VERIFIED`.
5. Diagnostics reported `fetch_ok=true`, `digest_ok=true`, `registry_match=PASS`, `serial_status=VALID`, `retirement_status=RETIRED`, `beneficiary_match=PASS`, and `vintage_match=PASS`.
6. `settle_escrow(3)` released the locked amount and moved the escrow to `SETTLED`.

Settlement transaction:

`0xfd6b86ad3afa936d756c11ceb0c576f2e589e690c75143a50b1807979219242b`

Post-settlement accounting observed:

```json
{"active_locked_wei":"3000000000000000","total_escrowed_wei":"4000000000000000","total_paid_wei":"1000000000000000","total_refunded_wei":"0"}
```

## Negative-path history

Escrows `0`, `1`, and `2` were earlier development attempts that ended as `UNAVAILABLE` or `REJECTED` while the authoritative-source and canonical-schema checks were being corrected. They remain visible on-chain. They are not claimed as successful lifecycle evidence.
