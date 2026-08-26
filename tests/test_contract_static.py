import hashlib
import pytest


def compute_identity_hash(registry: str, cert_type: str, serial_start: str, serial_end: str) -> str:
    canonical_str = f"{registry.strip().upper()}:{cert_type.strip().upper()}:{serial_start.strip()}:{serial_end.strip()}"
    return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest().lower()


def test_compute_identity_hash_determinism():
    h1 = compute_identity_hash("I-REC_STANDARD", "I-REC", "IREC-001", "IREC-100")
    h2 = compute_identity_hash("i-rec_standard", "i-rec", "IREC-001", "IREC-100")
    assert h1 == h2
    assert len(h1) == 64


def test_registry_allowlist_matching():
    default_registries = [
        "I-REC_STANDARD",
        "VERRA_VCS",
        "GOLD_STANDARD",
        "GLOBAL_CARBON_COUNCIL",
        "REDEX_REGISTRY",
        "TIGR_REGISTRY",
    ]

    def is_allowed(reg: str) -> bool:
        return reg.strip().upper() in default_registries

    assert is_allowed("I-REC_STANDARD") is True
    assert is_allowed("verra_vcs") is True
    assert is_allowed("gold_standard") is True
    assert is_allowed("UNKNOWN_SHADY_REGISTRY") is False


def test_sha256_format_validation():
    def is_valid_hex_sha256(digest: str) -> bool:
        if len(digest) != 64:
            return False
        valid_chars = "0123456789abcdefABCDEF"
        return all(c in valid_chars for c in digest)

    assert is_valid_hex_sha256("e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855") is True
    assert is_valid_hex_sha256("short_digest") is False
    assert is_valid_hex_sha256("g3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855") is False  # 'g' is invalid


if __name__ == "__main__":
    pytest.main(["-v", __file__])
