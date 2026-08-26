"""
CLI script to format certificate submission payload.
"""

import hashlib
import json
import sys


def generate_submission_payload(escrow_id: int = 0):
    raw_content = json.dumps({
        "registry": "I-REC_STANDARD",
        "serial_start": "IREC-2026-VN-0001000",
        "serial_end": "IREC-2026-VN-0002000",
        "volume": "1000",
        "unit": "MWh",
        "vintage": "2026",
        "beneficiary": "Acme Corp ESG Fund",
        "status": "RETIRED",
        "double_claim_risk": "NONE",
    }, sort_keys=True)

    digest = hashlib.sha256(raw_content.encode("utf-8")).hexdigest().lower()

    return {
        "escrow_id": escrow_id,
        "registry_url": "https://registry.irec-standard.org/certificates/IREC-2026-VN-SOLAR-0019283",
        "project_url": "https://registry.irec-standard.org/projects/ninh-thuan-solar-50mw",
        "retirement_url": "https://registry.irec-standard.org/certificates/IREC-2026-VN-SOLAR-0019283",
        "serial_start": "IREC-2026-VN-0001000",
        "serial_end": "IREC-2026-VN-0002000",
        "volume": "1000",
        "vintage": "2026",
        "beneficiary": "Acme Corp ESG Fund",
        "evidence_digest": digest,
        "raw_evidence_json": raw_content,
    }


if __name__ == "__main__":
    eid = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    payload = generate_submission_payload(eid)
    print("=== Certificate Submission Payload ===")
    print(json.dumps(payload, indent=2))
