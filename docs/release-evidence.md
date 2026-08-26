# Release & Verification Evidence: VerifiableGreenCertificateEscrow

This record reports only observed local and Studionet results. The evidence JSON
is a synthetic fixture and is not an issued environmental certificate.

## 1. Network & Deployment Configuration

- **Network:** GenLayer Studionet (`https://studio.genlayer.com`)
- **Chain ID:** `61999` (`0xF1EF`)
- **Contract Name:** `VerifiableGreenCertificateEscrow`
- **Deployed Address:** [`0xcd1B45045d3F41FD6224ee22e1Cc3FFA2D420Ba2`](https://explorer-studio.genlayer.com/address/0xcd1B45045d3F41FD6224ee22e1Cc3FFA2D420Ba2)
- **Compiler Dialect:** GenVM Python (`# v0.2.16`)
- **Storage Strategy:** Flat `TreeMap[u256, T]`, `u256`, `bigint`, `Address` (Pure ASCII)
- **Explorer Base URL:** `https://explorer-studio.genlayer.com`

---

## 2. Observed Verification Matrix

| Scenario ID | Test Case | Target Terms | Input Evidence | Consensus Verdict | Post-State | Financial Effect | Result |
|:---:|:---|:---|:---|:---|:---|:---|:---:|
| **LIVE-01** | Escrow 0 synthetic evidence | [`retired-demo.json`](https://raw.githubusercontent.com/Azaria723/VerifiableGreenCertificateEscrow/main/evidence/retired-demo.json), SHA-256 `68f47f4506c9a542417f0a8abe03ae17f74114ca691b96f680fbbdbadd58f000` | `VERIFIED` | Escrow 1, status `4` | 0.001 GEN locked | **PASS** |
| **LIVE-02** | Settlement | [`0x136fee...d63b03f`](https://explorer-studio.genlayer.com/tx/0x136feeaf100d2a1b3360d9b7d96c0594f44fc901e42fe8413eb536060d63b03f) | `SUCCESS`, `Accepted` | Escrow 1, status `6` | `total_paid_wei = 1000000000000000` | **PASS** |
| **LIVE-03** | External supplier send | Explorer screenshot shows external Send `0x4454adb2...b4f38cd5` | `FINALIZED` | Supplier recipient shown in Explorer | 0.001 GEN send | **PASS** |
| **LIVE-04** | Refund branch (escrow 0) | [`0x6bd5...af44f95`](https://explorer-studio.genlayer.com/tx/0x6bd5bbc781ab9b1f85e22d495140c0f9117741d592853c5594046a755af44f95) | `SUCCESS`, `Accepted` | status `8` | `total_refunded_wei = 1000000000000000` | **PASS** |

---

## 3. Financial Invariant & Solvency Proof

$$\sum \text{Escrowed Wei} \equiv \sum \text{Paid Wei} + \sum \text{Refunded Wei} + \text{Active Locked Balance}$$

- Live accounting after settlement: `total_escrowed_wei = 2000000000000000`,
  `total_paid_wei = 1000000000000000`, `total_refunded_wei = 1000000000000000`,
  `active_locked_wei = 0`.
- Local verification: `14 passed`; frontend Vite build completed successfully.
- Settled certificate identities are permanently locked in `consumed_certificates` map.
