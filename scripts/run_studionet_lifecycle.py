"""Run a live Studionet lifecycle; keys are supplied only via environment."""
import hashlib
import json
import os
import urllib.request

from genlayer_py import create_account, create_client, studionet
from genlayer_py.types.transactions import TransactionStatus

ADDRESS = "0x2440A4742DEE0878c2AD6FaacaAE68E23063F4d6"
AMOUNT = 1000000000000000
ESCROW_ID = 3
EVIDENCE_URL = "https://raw.githubusercontent.com/Azaria723/VerifiableGreenCertificateEscrow/main/evidence/retired-demo-002.json"

def wait(client, tx, label):
    print(label, tx.hex() if hasattr(tx, "hex") else tx, flush=True)
    rec = client.wait_for_transaction_receipt(tx, status=TransactionStatus.ACCEPTED, interval=2000, retries=90)
    print(label + "_RECEIPT", rec, flush=True)

def main():
    buyer = create_account(os.environ["GREEN_BUYER_KEY"])
    supplier = create_account(os.environ["GREEN_SUPPLIER_KEY"])
    client = create_client(studionet, account=buyer)
    print("BUYER", buyer.address, "SUPPLIER", supplier.address, flush=True)
    print("BALANCES", client.get_balance(buyer.address), client.get_balance(supplier.address), flush=True)
    print("BEFORE", client.read_contract(ADDRESS, "get_counts"), client.read_contract(ADDRESS, "get_accounting"), flush=True)

    tx = client.write_contract(ADDRESS, "create_escrow", account=buyer, args=[supplier.address, "Solar Demo 002", "I-REC", "I-REC", "1000", "MWh", "2025", "Demo Buyer", "RETIRED", AMOUNT, 0, 3600])
    wait(client, tx, "create")
    wait(client, client.write_contract(ADDRESS, "fund_escrow", account=buyer, value=AMOUNT, args=[ESCROW_ID]), "fund")
    with urllib.request.urlopen(EVIDENCE_URL, timeout=30) as response:
        raw = response.read().decode("utf-8")
    digest = hashlib.sha256(raw.encode()).hexdigest()
    canonical = "https://raw.githubusercontent.com/Azaria723/VerifiableGreenCertificateEscrow/main/evidence/certificates/DEMO-002.json"
    args = [ESCROW_ID, canonical, canonical, canonical, "DEMO-002", "DEMO-002", "1000", "2025", "Demo Buyer", digest, raw]
    wait(client, client.write_contract(ADDRESS, "submit_certificate", account=supplier, args=args), "submit")
    wait(client, client.write_contract(ADDRESS, "verify_certificate", account=buyer, args=[ESCROW_ID]), "verify")
    print("AFTER_VERIFY", client.read_contract(ADDRESS, "get_escrow", args=[ESCROW_ID]), client.read_contract(ADDRESS, "get_accounting"), flush=True)
    wait(client, client.write_contract(ADDRESS, "settle_escrow", account=buyer, args=[ESCROW_ID]), "settle")
    print("FINAL", client.read_contract(ADDRESS, "get_escrow", args=[ESCROW_ID]), client.read_contract(ADDRESS, "get_accounting"), flush=True)

if __name__ == "__main__":
    main()
