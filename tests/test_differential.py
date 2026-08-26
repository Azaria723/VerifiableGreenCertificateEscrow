import pytest


def check_differential_field_validation(base_case: dict, mutated_field: str, mutated_val: str) -> bool:
    deal = base_case.copy()
    deal[mutated_field] = mutated_val

    # Expected true values from registry
    true_registry = "I-REC_STANDARD"
    true_s_start = "IREC-001"
    true_s_end = "IREC-100"
    true_ben = "Acme Corp"
    true_vin = "2026"
    true_vol = "1000"
    true_status = "RETIRED"

    valid = (
        deal["registry"] == true_registry
        and deal["serial_start"] == true_s_start
        and deal["serial_end"] == true_s_end
        and deal["beneficiary"] == true_ben
        and deal["vintage"] == true_vin
        and deal["volume"] == true_vol
        and deal["status"] == true_status
    )
    return valid


def test_differential_mutations():
    base = {
        "registry": "I-REC_STANDARD",
        "serial_start": "IREC-001",
        "serial_end": "IREC-100",
        "beneficiary": "Acme Corp",
        "vintage": "2026",
        "volume": "1000",
        "status": "RETIRED",
    }

    # Baseline is valid
    assert check_differential_field_validation(base, "registry", "I-REC_STANDARD") is True

    # Mutate registry -> FAIL
    assert check_differential_field_validation(base, "registry", "WRONG_REGISTRY") is False

    # Mutate serial_start -> FAIL
    assert check_differential_field_validation(base, "serial_start", "IREC-999") is False

    # Mutate serial_end -> FAIL
    assert check_differential_field_validation(base, "serial_end", "IREC-500") is False

    # Mutate beneficiary -> FAIL
    assert check_differential_field_validation(base, "beneficiary", "Evil Corp") is False

    # Mutate vintage -> FAIL
    assert check_differential_field_validation(base, "vintage", "2020") is False

    # Mutate volume -> FAIL
    assert check_differential_field_validation(base, "volume", "500") is False

    # Mutate status -> FAIL
    assert check_differential_field_validation(base, "status", "ACTIVE") is False


if __name__ == "__main__":
    pytest.main(["-v", __file__])
