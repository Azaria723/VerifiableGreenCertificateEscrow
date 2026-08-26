import hashlib
import pytest


def get_identity_hash(registry: str, cert_type: str, s_start: str, s_end: str) -> str:
    canonical = f"{registry.strip().upper()}:{cert_type.strip().upper()}:{s_start.strip()}:{s_end.strip()}"
    return hashlib.sha256(canonical.encode("utf-8")).hexdigest().lower()


class MockDoubleClaimRegistry:
    def __init__(self):
        self.consumed = set()
        self.active_escrows = {}  # escrow_id -> identity_hash

    def submit(self, escrow_id: int, identity_hash: str) -> str:
        if identity_hash in self.consumed:
            return "CERTIFICATE_ALREADY_CONSUMED"

        for other_id, other_hash in self.active_escrows.items():
            if other_id != escrow_id and other_hash == identity_hash:
                return "CERTIFICATE_LOCKED_IN_OTHER_ESCROW"

        self.active_escrows[escrow_id] = identity_hash
        return "CERTIFICATE_SUBMITTED"

    def settle(self, escrow_id: int):
        ident = self.active_escrows.pop(escrow_id, None)
        if ident:
            self.consumed.add(ident)


def test_double_submission_in_parallel_escrows_blocked():
    reg = MockDoubleClaimRegistry()
    ident = get_identity_hash("I-REC_STANDARD", "I-REC", "IREC-100", "IREC-200")

    # First escrow submits
    res1 = reg.submit(0, ident)
    assert res1 == "CERTIFICATE_SUBMITTED"

    # Second parallel escrow tries to submit the same certificate
    res2 = reg.submit(1, ident)
    assert res2 == "CERTIFICATE_LOCKED_IN_OTHER_ESCROW"


def test_consumed_certificate_cannot_be_reused_post_settlement():
    reg = MockDoubleClaimRegistry()
    ident = get_identity_hash("VERRA_VCS", "VERRA", "VCS-500", "VCS-600")

    # Escrow 0 submits and settles
    reg.submit(0, ident)
    reg.settle(0)
    assert ident in reg.consumed

    # Escrow 1 tries to reuse the consumed certificate
    res = reg.submit(1, ident)
    assert res == "CERTIFICATE_ALREADY_CONSUMED"


def test_distinct_serial_ranges_produce_distinct_hashes():
    h1 = get_identity_hash("I-REC_STANDARD", "I-REC", "IREC-001", "IREC-050")
    h2 = get_identity_hash("I-REC_STANDARD", "I-REC", "IREC-051", "IREC-100")
    assert h1 != h2


if __name__ == "__main__":
    pytest.main(["-v", __file__])
