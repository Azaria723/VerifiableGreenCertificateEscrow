"""
End-to-End simulation runner for VerifiableGreenCertificateEscrow.
"""

import hashlib
import json
import sys


def simulate_full_deal_lifecycle(deal: dict, raw_evidence: str, web_response: dict, fetch_ok: bool = True):
    expected_digest = deal["evidence_digest"]
    raw_bytes = raw_evidence.encode("utf-8")
    calc_digest = hashlib.sha256(raw_bytes).hexdigest().lower()
    digest_ok = (calc_digest == expected_digest)

    if not fetch_ok or not digest_ok:
        return {"status": 9, "verdict": "UNAVAILABLE", "next_action": "REFUND"}

    web_data = web_response or {}
    r_registry = str(web_data.get("registry", "")).strip().upper()
    r_status = str(web_data.get("status", "")).strip().upper()
    r_ben = str(web_data.get("beneficiary", "")).strip()
    r_vol = str(web_data.get("volume", "")).strip()
    r_vin = str(web_data.get("vintage", "")).strip()
    r_s_start = str(web_data.get("serial_start", "")).strip()
    r_s_end = str(web_data.get("serial_end", "")).strip()
    r_dc = str(web_data.get("double_claim_risk", "NONE")).strip().upper()

    reg_ok = (r_registry == deal["registry"])
    serial_ok = (r_s_start == deal["serial_start"] and r_s_end == deal["serial_end"])
    ret_ok = (r_status == deal["required_status"])
    ben_ok = (r_ben == deal["beneficiary"])
    vin_ok = (r_vin == deal["vintage"] and r_vol == deal["volume"])

    if r_dc == "SUSPECTED":
        return {"status": 10, "verdict": "CONFLICTED", "next_action": "REFUND"}
    elif reg_ok and serial_ok and ret_ok and ben_ok and vin_ok:
        return {"status": 4, "verdict": "VERIFIED", "next_action": "SETTLE"}
    else:
        return {"status": 7, "verdict": "REJECTED", "next_action": "REFUND"}


def run_e2e_scenarios():
    print("==========================================================================")
    print("   VerifiableGreenCertificateEscrow - End-to-End Simulation Matrix        ")
    print("==========================================================================\n")

    scenarios = [
        {
            "name": "Scenario 1: Valid I-REC 1,000 MWh Solar Certificate",
            "deal": {
                "registry": "I-REC_STANDARD",
                "serial_start": "IREC-2026-VN-0001000",
                "serial_end": "IREC-2026-VN-0002000",
                "volume": "1000",
                "vintage": "2026",
                "beneficiary": "Acme Corp ESG Fund",
                "required_status": "RETIRED",
                "evidence_digest": "valid_digest_1",
            },
            "raw": "valid_digest_1_raw",
            "web": {
                "registry": "I-REC_STANDARD",
                "serial_start": "IREC-2026-VN-0001000",
                "serial_end": "IREC-2026-VN-0002000",
                "volume": "1000",
                "vintage": "2026",
                "beneficiary": "Acme Corp ESG Fund",
                "status": "RETIRED",
                "double_claim_risk": "NONE",
            },
            "fetch_ok": True,
            "expected_status": 4,
            "expected_verdict": "VERIFIED",
            "expected_action": "SETTLE",
        },
        {
            "name": "Scenario 2: Valid Verra 2,500 tCO2e Carbon Offset",
            "deal": {
                "registry": "VERRA_VCS",
                "serial_start": "VCS-2026-BR-0050000",
                "serial_end": "VCS-2026-BR-0052500",
                "volume": "2500",
                "vintage": "2025",
                "beneficiary": "Nordic Carbon Neutral Portfolio",
                "required_status": "RETIRED",
                "evidence_digest": "valid_digest_2",
            },
            "raw": "valid_digest_2_raw",
            "web": {
                "registry": "VERRA_VCS",
                "serial_start": "VCS-2026-BR-0050000",
                "serial_end": "VCS-2026-BR-0052500",
                "volume": "2500",
                "vintage": "2025",
                "beneficiary": "Nordic Carbon Neutral Portfolio",
                "status": "RETIRED",
                "double_claim_risk": "NONE",
            },
            "fetch_ok": True,
            "expected_status": 4,
            "expected_verdict": "VERIFIED",
            "expected_action": "SETTLE",
        },
        {
            "name": "Scenario 3: Unretired Active Certificate (Non-Retired Breach)",
            "deal": {
                "registry": "I-REC_STANDARD",
                "serial_start": "IREC-2026-VN-0099000",
                "serial_end": "IREC-2026-VN-0099500",
                "volume": "500",
                "vintage": "2026",
                "beneficiary": "Trader Account",
                "required_status": "RETIRED",
                "evidence_digest": "digest_3",
            },
            "raw": "digest_3_raw",
            "web": {
                "registry": "I-REC_STANDARD",
                "serial_start": "IREC-2026-VN-0099000",
                "serial_end": "IREC-2026-VN-0099500",
                "volume": "500",
                "vintage": "2026",
                "beneficiary": "Trader Account",
                "status": "ACTIVE",  # BREACH!
                "double_claim_risk": "NONE",
            },
            "fetch_ok": True,
            "expected_status": 7,
            "expected_verdict": "REJECTED",
            "expected_action": "REFUND",
        },
        {
            "name": "Scenario 4: Double-Claim Detected across Marketplaces",
            "deal": {
                "registry": "I-REC_STANDARD",
                "serial_start": "IREC-2026-VN-0001000",
                "serial_end": "IREC-2026-VN-0002000",
                "volume": "1000",
                "vintage": "2026",
                "beneficiary": "Acme Corp ESG Fund",
                "required_status": "RETIRED",
                "evidence_digest": "digest_4",
            },
            "raw": "digest_4_raw",
            "web": {
                "registry": "I-REC_STANDARD",
                "serial_start": "IREC-2026-VN-0001000",
                "serial_end": "IREC-2026-VN-0002000",
                "volume": "1000",
                "vintage": "2026",
                "beneficiary": "Acme Corp ESG Fund",
                "status": "RETIRED",
                "double_claim_risk": "SUSPECTED",  # CONFLICT!
            },
            "fetch_ok": True,
            "expected_status": 10,
            "expected_verdict": "CONFLICTED",
            "expected_action": "REFUND",
        },
        {
            "name": "Scenario 5: Tampered Evidence Digest Mismatch",
            "deal": {
                "registry": "I-REC_STANDARD",
                "evidence_digest": "0000000000000000000000000000000000000000000000000000000000000000",
            },
            "raw": "tampered_bytes",
            "web": {},
            "fetch_ok": True,
            "expected_status": 9,
            "expected_verdict": "UNAVAILABLE",
            "expected_action": "REFUND",
        },
        {
            "name": "Scenario 6: Registry Server Unreachable / Timeout",
            "deal": {
                "registry": "I-REC_STANDARD",
                "evidence_digest": "digest_6",
            },
            "raw": "digest_6_raw",
            "web": {},
            "fetch_ok": False,  # Server 500/timeout
            "expected_status": 9,
            "expected_verdict": "UNAVAILABLE",
            "expected_action": "REFUND",
        },
    ]

    passed = 0
    for sc in scenarios:
        # Prepare valid sha256 for digest
        deal = sc["deal"].copy()
        raw = sc["raw"]
        deal["evidence_digest"] = hashlib.sha256(raw.encode("utf-8")).hexdigest().lower()
        if "tampered" in raw:
            deal["evidence_digest"] = "0000000000000000000000000000000000000000000000000000000000000000"

        res = simulate_full_deal_lifecycle(deal, raw, sc["web"], sc["fetch_ok"])
        ok = (
            res["status"] == sc["expected_status"]
            and res["verdict"] == sc["expected_verdict"]
            and res["next_action"] == sc["expected_action"]
        )

        badge = "[PASS]" if ok else "[FAIL]"
        if ok:
            passed += 1

        print(f"{badge} {sc['name']}")
        print(f"       Result: Status [{res['status']}] {res['verdict']} -> Next: {res['next_action']}")
        print(f"       Expected: Status [{sc['expected_status']}] {sc['expected_verdict']} -> Next: {sc['expected_action']}\n")

    print("--------------------------------------------------------------------------")
    print(f"Result: {passed}/{len(scenarios)} scenarios PASSED successfully!")
    print("==========================================================================")


if __name__ == "__main__":
    run_e2e_scenarios()
