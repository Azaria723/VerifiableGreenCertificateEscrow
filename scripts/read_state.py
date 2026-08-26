"""
CLI script to inspect contract state and escrow details.
"""

import json
import sys

STATUS_MAP = {
    0: "CREATED",
    1: "FUNDED",
    2: "SUBMITTED",
    3: "UNDER_REVIEW",
    4: "VERIFIED",
    5: "SETTLEABLE",
    6: "SETTLED",
    7: "REJECTED",
    8: "REFUNDED",
    9: "UNAVAILABLE",
    10: "CONFLICTED",
    11: "EXPIRED",
}

def print_formatted_escrow(escrow_data: dict, cert_data: dict = None, verif_data: dict = None):
    st = escrow_data.get("status", 0)
    status_str = STATUS_MAP.get(st, "UNKNOWN")

    print("\n==================================================================")
    print(f" ESCROW #{escrow_data.get('escrow_id', 0)}: {escrow_data.get('project_name', 'N/A')}")
    print("==================================================================")
    print(f" Buyer:        {escrow_data.get('buyer')}")
    print(f" Supplier:     {escrow_data.get('supplier')}")
    print(f" Amount:       {escrow_data.get('amount_wei')} wei")
    print(f" Status:       [{st}] {status_str}")
    print(f" Registry:     {escrow_data.get('registry')}")
    print(f" Volume/Unit:  {escrow_data.get('required_volume')} {escrow_data.get('required_unit')}")
    print(f" Vintage:      {escrow_data.get('required_vintage')}")
    print(f" Beneficiary:  {escrow_data.get('required_beneficiary')}")

    if cert_data and cert_data.get("serial_start"):
        print("\n--- Submitted Certificate Evidence ---")
        print(f" Serial Range: {cert_data.get('serial_start')} -> {cert_data.get('serial_end')}")
        print(f" Registry URL: {cert_data.get('registry_url')}")
        print(f" Digest:       {cert_data.get('digest')}")

    if verif_data and verif_data.get("verdict"):
        print("\n--- Consensus Verification Decision ---")
        print(f" Verdict:      {verif_data.get('verdict')}")
        print(f" Reason:       {verif_data.get('reason')}")
        if verif_data.get("diagnostics"):
            print(f" Diagnostics:  {verif_data.get('diagnostics')}")

    print("==================================================================\n")

if __name__ == "__main__":
    mock_escrow = {
        "escrow_id": 0,
        "project_name": "Ninh Thuan Solar Farm 50MW",
        "buyer": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
        "supplier": "0x70997970C51812dc3A010C7d01b50e0d17dc79C8",
        "amount_wei": "5000000000000000000",
        "status": 4,
        "registry": "I-REC_STANDARD",
        "required_volume": "1000",
        "required_unit": "MWh",
        "required_vintage": "2026",
        "required_beneficiary": "Acme Corp ESG Fund",
    }
    mock_cert = {
        "serial_start": "IREC-2026-VN-0001000",
        "serial_end": "IREC-2026-VN-0002000",
        "registry_url": "https://registry.irec-standard.org/certificates/IREC-2026-VN-SOLAR-0019283",
        "digest": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
    }
    mock_verif = {
        "verdict": "VERIFIED",
        "reason": "ALL_REGISTRY_CRITERIA_VERIFIED",
        "diagnostics": '{"registry_match":"PASS","serial_status":"VALID","retirement_status":"RETIRED","beneficiary_match":"PASS","vintage_match":"PASS"}',
    }
    print_formatted_escrow(mock_escrow, mock_cert, mock_verif)
