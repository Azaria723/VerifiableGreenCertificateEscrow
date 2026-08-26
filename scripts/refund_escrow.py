"""
CLI script to refund an escrow to buyer.
"""

import sys

def refund_simulation(escrow_id: int, reason: str = "Evidence verification failed"):
    print(f"=== Refunding Escrow #{escrow_id} ===")
    print(f"Reason: {reason}")
    print("1. Checking status eligibility (REJECTED / UNAVAILABLE / CONFLICTED / EXPIRED)...")
    print("2. Verifying caller authorization (Buyer or Owner)...")
    print("3. Executing native GEN transfer to buyer...")
    print("4. Updating accounting records...")
    print("=== Refund Completed: Funds Returned to Buyer ===")

if __name__ == "__main__":
    eid = int(sys.argv[1]) if len(sys.argv) > 1 else 0
    msg = sys.argv[2] if len(sys.argv) > 2 else "Evidence verification failed"
    refund_simulation(eid, msg)
