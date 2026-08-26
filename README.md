# VerifiableGreenCertificateEscrow

`VerifiableGreenCertificateEscrow` is a decentralized climate-finance escrow protocol on GenLayer for renewable energy certificates (I-REC, TIGR) and carbon offsets (Verra VCS, Gold Standard).

Buyers lock native GEN into custody, suppliers submit public registry evidence, and GenLayer validators evaluate categorical certificate facts against live authoritative registry records before releasing payment.

---

## 1. Why GenLayer? (GenLayer Fit)

Traditional escrow smart contracts cannot verify whether an off-chain certificate was actually retired or if a serial range was double-sold across multiple OTC desks.

`VerifiableGreenCertificateEscrow` utilizes GenLayer's **Decentralized LLM & Web Consensus**:
- Validators directly fetch live registry endpoints over HTTPS on-chain without centralized oracles.
- Cryptographic SHA-256 evidence digests guarantee evidence integrity.
- Canonical identity hashing (`registry + cert_type + serial_start + serial_end`) permanently prevents double-claims.
- Closed categorical enums (`PASS`/`FAIL`, `RETIRED`/`CANCELLED`/`ACTIVE`) ensure deterministic, reproducible consensus decisions.

---

## 2. Escrow State Machine

```text
CREATED → FUNDED → SUBMITTED → UNDER_REVIEW → VERIFIED ────→ SETTLED (Payment Released)
                                             ↳ REJECTED ───→ REFUNDED (Capital Returned)
                                             ↳ UNAVAILABLE ─→ REFUNDED
                                             ↳ CONFLICTED ─→ REFUNDED
```

---

## 3. Project Structure

```text
G:\Genlayer Azaria\VerifiableGreenCertificateEscrow\
├── contracts\
│   └── VerifiableGreenCertificateEscrow.py  # GenLayer Intelligent Contract (Pure ASCII, GenVM compatible)
├── tests\
│   ├── test_contract_static.py             # Schema, hash & allowlist tests
│   ├── test_consensus_logic.py             # Decision tree & categorical logic
│   ├── test_escrow_lifecycle.py            # Financial custody & conservation invariants
│   ├── test_double_claim.py                # Serial collision & consumed registry
│   └── test_differential.py                # Single-field mutation tests
├── scripts\
│   ├── create_escrow.py                    # CLI escrow creation tool
│   ├── submit_certificate.py               # CLI evidence submission tool
│   ├── verify_certificate.py               # Consensus adjudication simulator
│   ├── settle_escrow.py                    # Settlement & payout release
│   ├── refund_escrow.py                    # Buyer refund execution
│   ├── read_state.py                       # Formatted on-chain state reader
│   └── run_e2e.py                          # 6-Scenario E2E simulation runner
├── samples\
│   ├── sample-irec-valid.json
│   ├── sample-verra-valid.json
│   ├── sample-invalid-serial.json
│   └── sample-active-unretired.json
├── frontend\                               # Multi-Page Editorial Climate-Finance DApp
│   ├── src\
│   │   ├── components\ (Navbar, Footer, TransactionModal)
│   │   ├── pages\ (10 standalone routes: Home, Explore, Create, Submit, Verify, Detail, Settlement, Activity, Guide, Contract)
│   │   ├── genlayer.js (Web3 integration for Studionet)
│   │   └── App.jsx
│   └── package.json
├── SPEC.md
├── contract.md
├── docs\
│   └── release-evidence.md
├── requirements.txt
└── README.md
```

---

## 4. Local Testing & Verification

### Run Automated Contract Test Suite
```bash
python -m pytest tests/ -v
# Output: 14 passed in 0.15s
```

### Run End-to-End Deal Flow Matrix
```bash
python scripts/run_e2e.py
# Output: 6/6 scenarios PASSED successfully!
```

### Build Frontend Application
```bash
cd frontend
npm install
npm run build
```

---

## 5. Contract API Reference

### Write Methods
- `create_escrow(...) -> u256`
- `fund_escrow(escrow_id: u256) -> str` (payable)
- `submit_certificate(escrow_id: u256, ...) -> str`
- `verify_certificate(escrow_id: u256) -> u256`
- `settle_escrow(escrow_id: u256) -> str`
- `refund_escrow(escrow_id: u256, reason: str) -> str`
- `expire_escrow(escrow_id: u256) -> str`

### View Methods
- `get_escrow(escrow_id: u256) -> str`
- `get_certificate(escrow_id: u256) -> str`
- `get_verification(escrow_id: u256) -> str`
- `get_accounting() -> str`
- `get_counts() -> str`
- `is_certificate_consumed(identity_hash: str) -> bool`

---

## 6. Frontend Routes

- `/` — Editorial Overview & Hero
- `/explore` — Live Escrow Registry & Status Filtering
- `/create` — 3-Step Escrow Builder Wizard
- `/submit` — Supplier Delivery Portal & Pre-Flight Validation
- `/verify` — Verification Desk & Consensus Review
- `/escrow/:id` — In-Depth Dossier & Timeline
- `/settlement` — Settlement Rail & Balance Reconciliation
- `/activity` — Connected Wallet Ledger
- `/guide` — Anti-Greenwashing Knowledge Base
- `/contract` — Smart Contract Architecture & Explorer Link
