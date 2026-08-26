import hashlib
import json
import pytest


def evaluate_certificate(
    expected_deal: dict,
    raw_evidence_json: str,
    web_response_json: dict = None,
    fetch_success: bool = True,
) -> dict:
    expected_digest = expected_deal["evidence_digest"]
    raw_bytes = raw_evidence_json.encode("utf-8")
    calc_digest = hashlib.sha256(raw_bytes).hexdigest().lower()
    digest_ok = (calc_digest == expected_digest)

    if not fetch_success or not digest_ok:
        return {
            "verdict": "UNAVAILABLE",
            "verdict_status_code": 9,
            "reason_code": "REGISTRY_URL_UNREACHABLE_OR_DIGEST_MISMATCH",
        }

    web_data = web_response_json or {}
    r_registry = str(web_data.get("registry", "")).strip().upper()
    r_status = str(web_data.get("status", "")).strip().upper()
    r_ben = str(web_data.get("beneficiary", "")).strip()
    r_vol = str(web_data.get("volume", "")).strip()
    r_vin = str(web_data.get("vintage", "")).strip()
    r_s_start = str(web_data.get("serial_start", "")).strip()
    r_s_end = str(web_data.get("serial_end", "")).strip()
    r_dc = str(web_data.get("double_claim_risk", "NONE")).strip().upper()

    registry_match = "PASS" if r_registry == expected_deal["registry"] else "FAIL"
    serial_status = (
        "VALID"
        if (r_s_start == expected_deal["serial_start"] and r_s_end == expected_deal["serial_end"] and len(r_s_start) > 0)
        else "INVALID"
    )
    retirement_status = r_status
    beneficiary_match = "PASS" if r_ben == expected_deal["beneficiary"] else "FAIL"
    vintage_match = "PASS" if (r_vin == expected_deal["vintage"] and r_vol == expected_deal["volume"]) else "FAIL"
    double_claim_risk = "SUSPECTED" if r_dc == "SUSPECTED" else "NONE"

    if double_claim_risk == "SUSPECTED":
        return {
            "verdict": "CONFLICTED",
            "verdict_status_code": 10,
            "reason_code": "DOUBLE_CLAIM_SUSPECTED",
        }
    elif (
        registry_match == "PASS"
        and serial_status == "VALID"
        and retirement_status == expected_deal["required_status"]
        and beneficiary_match == "PASS"
        and vintage_match == "PASS"
    ):
        return {
            "verdict": "VERIFIED",
            "verdict_status_code": 4,
            "reason_code": "ALL_REGISTRY_CRITERIA_VERIFIED",
        }
    else:
        return {
            "verdict": "REJECTED",
            "verdict_status_code": 7,
            "reason_code": "EVIDENCE_DOES_NOT_MEET_DEAL_TERMS",
        }


def test_valid_certificate_yields_verified():
    raw_evidence = '{"sample": "valid_irec"}'
    digest = hashlib.sha256(raw_evidence.encode("utf-8")).hexdigest().lower()

    deal = {
        "registry": "I-REC_STANDARD",
        "serial_start": "IREC-001",
        "serial_end": "IREC-100",
        "volume": "100",
        "vintage": "2026",
        "beneficiary": "Acme Corp",
        "required_status": "RETIRED",
        "evidence_digest": digest,
    }

    web_resp = {
        "registry": "I-REC_STANDARD",
        "serial_start": "IREC-001",
        "serial_end": "IREC-100",
        "volume": "100",
        "vintage": "2026",
        "beneficiary": "Acme Corp",
        "status": "RETIRED",
        "double_claim_risk": "NONE",
    }

    res = evaluate_certificate(deal, raw_evidence, web_resp, fetch_success=True)
    assert res["verdict"] == "VERIFIED"
    assert res["verdict_status_code"] == 4


def test_digest_mismatch_yields_unavailable():
    deal = {
        "registry": "I-REC_STANDARD",
        "evidence_digest": "0000000000000000000000000000000000000000000000000000000000000000",
    }
    raw = '{"content": "tampered"}'
    res = evaluate_certificate(deal, raw, {}, fetch_success=True)
    assert res["verdict"] == "UNAVAILABLE"
    assert res["verdict_status_code"] == 9


def test_unretired_active_status_yields_rejected():
    raw = '{"data": "active"}'
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest().lower()

    deal = {
        "registry": "I-REC_STANDARD",
        "serial_start": "IREC-001",
        "serial_end": "IREC-100",
        "volume": "100",
        "vintage": "2026",
        "beneficiary": "Acme Corp",
        "required_status": "RETIRED",
        "evidence_digest": digest,
    }

    web_resp = {
        "registry": "I-REC_STANDARD",
        "serial_start": "IREC-001",
        "serial_end": "IREC-100",
        "volume": "100",
        "vintage": "2026",
        "beneficiary": "Acme Corp",
        "status": "ACTIVE",  # NOT RETIRED!
        "double_claim_risk": "NONE",
    }

    res = evaluate_certificate(deal, raw, web_resp, fetch_success=True)
    assert res["verdict"] == "REJECTED"
    assert res["verdict_status_code"] == 7


def test_double_claim_suspected_yields_conflicted():
    raw = '{"data": "double"}'
    digest = hashlib.sha256(raw.encode("utf-8")).hexdigest().lower()

    deal = {
        "registry": "I-REC_STANDARD",
        "serial_start": "IREC-001",
        "serial_end": "IREC-100",
        "volume": "100",
        "vintage": "2026",
        "beneficiary": "Acme Corp",
        "required_status": "RETIRED",
        "evidence_digest": digest,
    }

    web_resp = {
        "registry": "I-REC_STANDARD",
        "serial_start": "IREC-001",
        "serial_end": "IREC-100",
        "volume": "100",
        "vintage": "2026",
        "beneficiary": "Acme Corp",
        "status": "RETIRED",
        "double_claim_risk": "SUSPECTED",
    }

    res = evaluate_certificate(deal, raw, web_resp, fetch_success=True)
    assert res["verdict"] == "CONFLICTED"
    assert res["verdict_status_code"] == 10


if __name__ == "__main__":
    pytest.main(["-v", __file__])
