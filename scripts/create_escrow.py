"""
CLI script to format and simulate an escrow creation payload.
"""

import json
import sys


def generate_sample_escrow_payload():
    return {
        "supplier": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "project_name": "Ninh Thuan Solar Farm 50MW",
        "cert_type": "I-REC",
        "registry": "I-REC_STANDARD",
        "required_volume": "1000",
        "required_unit": "MWh",
        "required_vintage": "2026",
        "required_beneficiary": "Acme Corp ESG Fund",
        "required_status": "RETIRED",
        "deal_amount_wei": 5000000000000000000,  # 5 GEN
        "settlement_delay_seconds": 0,
        "deadline_seconds": 86400,
    }


if __name__ == "__main__":
    payload = generate_sample_escrow_payload()
    print("=== VerifiableGreenCertificateEscrow: Escrow Creation Payload ===")
    print(json.dumps(payload, indent=2))
