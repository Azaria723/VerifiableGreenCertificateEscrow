import pytest


class MockEscrowSystem:
    def __init__(self):
        self.escrows = {}
        self.total_escrowed = 0
        self.total_paid = 0
        self.total_refunded = 0
        self.contract_balance = 0

    def create_escrow(self, escrow_id: int, buyer: str, supplier: str, amount: int):
        assert buyer != supplier
        assert amount > 0
        self.escrows[escrow_id] = {
            "buyer": buyer,
            "supplier": supplier,
            "amount": amount,
            "status": 0,  # CREATED
        }

    def fund_escrow(self, escrow_id: int, caller: str, value: int):
        escrow = self.escrows[escrow_id]
        assert escrow["status"] == 0
        assert caller == escrow["buyer"]
        assert value == escrow["amount"]
        escrow["status"] = 1  # FUNDED
        self.total_escrowed += value
        self.contract_balance += value

    def submit_certificate(self, escrow_id: int, caller: str):
        escrow = self.escrows[escrow_id]
        assert escrow["status"] == 1
        assert caller == escrow["supplier"]
        escrow["status"] = 2  # SUBMITTED

    def set_verified(self, escrow_id: int):
        escrow = self.escrows[escrow_id]
        assert escrow["status"] == 2
        escrow["status"] = 4  # VERIFIED

    def set_rejected(self, escrow_id: int):
        escrow = self.escrows[escrow_id]
        assert escrow["status"] == 2
        escrow["status"] = 7  # REJECTED

    def settle_escrow(self, escrow_id: int, caller: str) -> int:
        escrow = self.escrows[escrow_id]
        assert escrow["status"] == 4  # Must be VERIFIED
        assert caller in [escrow["supplier"], escrow["buyer"]]
        amt = escrow["amount"]
        assert amt > 0
        assert self.contract_balance >= amt

        escrow["status"] = 6  # SETTLED
        escrow["amount"] = 0
        self.total_paid += amt
        self.contract_balance -= amt
        return amt

    def refund_escrow(self, escrow_id: int, caller: str) -> int:
        escrow = self.escrows[escrow_id]
        assert escrow["status"] in [1, 7, 9, 10, 11]  # Eligible for refund
        assert caller == escrow["buyer"]
        amt = escrow["amount"]
        assert amt > 0
        assert self.contract_balance >= amt

        escrow["status"] = 8  # REFUNDED
        escrow["amount"] = 0
        self.total_refunded += amt
        self.contract_balance -= amt
        return amt

    def assert_balance_conservation(self):
        active_locked = sum(e["amount"] for e in self.escrows.values())
        assert self.contract_balance == active_locked
        assert self.total_escrowed == (self.total_paid + self.total_refunded + self.contract_balance)


def test_happy_path_settlement_and_conservation():
    sys = MockEscrowSystem()
    sys.create_escrow(0, "0xBuyer", "0xSupplier", 5000)
    sys.fund_escrow(0, "0xBuyer", 5000)
    sys.assert_balance_conservation()

    sys.submit_certificate(0, "0xSupplier")
    sys.set_verified(0)

    payout = sys.settle_escrow(0, "0xSupplier")
    assert payout == 5000
    assert sys.contract_balance == 0
    assert sys.total_paid == 5000
    sys.assert_balance_conservation()


def test_rejected_path_refund_and_conservation():
    sys = MockEscrowSystem()
    sys.create_escrow(1, "0xBuyer", "0xSupplier", 3000)
    sys.fund_escrow(1, "0xBuyer", 3000)
    sys.submit_certificate(1, "0xSupplier")
    sys.set_rejected(1)

    refund = sys.refund_escrow(1, "0xBuyer")
    assert refund == 3000
    assert sys.contract_balance == 0
    assert sys.total_refunded == 3000
    sys.assert_balance_conservation()


def test_cannot_settle_unverified_escrow():
    sys = MockEscrowSystem()
    sys.create_escrow(2, "0xBuyer", "0xSupplier", 1000)
    sys.fund_escrow(2, "0xBuyer", 1000)
    sys.submit_certificate(2, "0xSupplier")
    # Status is SUBMITTED (2), not VERIFIED (4)
    with pytest.raises(AssertionError):
        sys.settle_escrow(2, "0xSupplier")


if __name__ == "__main__":
    pytest.main(["-v", __file__])
