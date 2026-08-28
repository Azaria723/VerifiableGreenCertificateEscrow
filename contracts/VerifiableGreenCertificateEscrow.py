# v0.2.16
# { "Depends": "py-genlayer:1jb45aa8ynh2a9c9xn3b7qqh8sm5q93hwfp7jqmwsfhh8jpz09h6" }
from genlayer import *

import json
import typing


@gl.evm.contract_interface
class _Recipient:
    class View:
        pass

    class Write:
        pass


class VerifiableGreenCertificateEscrow(gl.Contract):
    owner: Address
    escrow_count: u256
    total_escrowed_wei: bigint
    total_paid_wei: bigint
    total_refunded_wei: bigint
    registry_allowlist_count: u256

    # Escrow state maps
    escrow_buyers: TreeMap[u256, Address]
    escrow_suppliers: TreeMap[u256, Address]
    escrow_amounts: TreeMap[u256, bigint]
    escrow_statuses: TreeMap[u256, u256]  # 0: CREATED, 1: FUNDED, 2: SUBMITTED, 3: UNDER_REVIEW, 4: VERIFIED, 5: SETTLEABLE, 6: SETTLED, 7: REJECTED, 8: REFUNDED, 9: UNAVAILABLE, 10: CONFLICTED, 11: EXPIRED
    escrow_created_ats: TreeMap[u256, u256]
    escrow_funded_ats: TreeMap[u256, u256]
    escrow_deadlines: TreeMap[u256, u256]
    escrow_settlement_delays: TreeMap[u256, u256]
    escrow_verified_ats: TreeMap[u256, u256]
    escrow_project_names: TreeMap[u256, str]
    escrow_cert_types: TreeMap[u256, str]
    escrow_registries: TreeMap[u256, str]
    escrow_req_volumes: TreeMap[u256, str]
    escrow_req_units: TreeMap[u256, str]
    escrow_req_vintages: TreeMap[u256, str]
    escrow_req_beneficiaries: TreeMap[u256, str]
    escrow_req_statuses: TreeMap[u256, str]
    escrow_cert_identity_hashes: TreeMap[u256, str]
    escrow_nonces: TreeMap[u256, u256]

    # Certificate Evidence maps
    cert_registry_urls: TreeMap[u256, str]
    cert_project_urls: TreeMap[u256, str]
    cert_retirement_urls: TreeMap[u256, str]
    cert_serial_starts: TreeMap[u256, str]
    cert_serial_ends: TreeMap[u256, str]
    cert_volumes: TreeMap[u256, str]
    cert_vintages: TreeMap[u256, str]
    cert_beneficiaries: TreeMap[u256, str]
    cert_digests: TreeMap[u256, str]
    cert_raw_evidences: TreeMap[u256, str]
    cert_submitted_ats: TreeMap[u256, u256]

    # Verification Diagnostics maps
    verif_verdicts: TreeMap[u256, str]
    verif_diagnostics_jsons: TreeMap[u256, str]
    verif_reasons: TreeMap[u256, str]

    # Double-Claim tracking
    consumed_certificates: TreeMap[str, u256]

    # Registry allowlist maps
    allowed_registries: TreeMap[u256, str]
    allowed_registry_status: TreeMap[u256, u256]
    allowed_registry_sources: TreeMap[u256, str]

    def __init__(self):
        self.owner = gl.message.sender_address
        self.escrow_count = u256(0)
        self.total_escrowed_wei = bigint(0)
        self.total_paid_wei = bigint(0)
        self.total_refunded_wei = bigint(0)
        # Keep the common I-REC registry usable immediately after deployment.
        # Additional registries remain owner-configurable through
        # set_registry_allowlist.
        self.allowed_registries[u256(0)] = "I-REC"
        self.allowed_registry_status[u256(0)] = u256(1)
        self.allowed_registry_sources[u256(0)] = "https://registry.irec-standard.org/"
        self.allowed_registries[u256(1)] = "I-REC_STANDARD"
        self.allowed_registry_status[u256(1)] = u256(1)
        self.allowed_registry_sources[u256(1)] = "https://registry.irec-standard.org/"
        self.registry_allowlist_count = u256(2)

    # -------------------------------------------------------------------------
    # Internal Helpers
    # -------------------------------------------------------------------------

    def _is_valid_hex_sha256(self, digest: str) -> bool:
        if len(digest) != 64:
            return False
        valid_chars = "0123456789abcdefABCDEF"
        for c in digest:
            if c not in valid_chars:
                return False
        return True

    def _is_https_url(self, url: str) -> bool:
        if not url.startswith("https://") or len(url) > 512:
            return False
        stripped = url[8:]
        path_idx = stripped.find("/")
        host_part = stripped[:path_idx] if path_idx != -1 else stripped
        if "@" in host_part or len(host_part) == 0:
            return False
        return True

    def _is_registry_allowed(self, registry: str) -> bool:
        reg_clean = registry.strip().upper()
        if len(reg_clean) == 0:
            return False
        count_int = int(self.registry_allowlist_count)
        for i in range(count_int):
            idx = u256(i)
            if self.allowed_registry_status.get(idx, u256(0)) == u256(1):
                if self.allowed_registries.get(idx, "") == reg_clean:
                    return True
        return False

    def _registry_source(self, registry: str) -> str:
        reg_clean = registry.strip().upper()
        for i in range(int(self.registry_allowlist_count)):
            idx = u256(i)
            if self.allowed_registries.get(idx, "") == reg_clean:
                if self.allowed_registry_status.get(idx, u256(0)) == u256(1):
                    return self.allowed_registry_sources.get(idx, "")
        return ""

    def _is_under_source(self, url: str, source: str) -> bool:
        return len(source) > 8 and url.startswith(source) and self._is_https_url(url)

    def _compute_identity_hash(self, registry: str, cert_type: str, serial_start: str, serial_end: str) -> str:
        import hashlib
        canonical_str = f"{registry.strip().upper()}:{cert_type.strip().upper()}:{serial_start.strip()}:{serial_end.strip()}"
        return hashlib.sha256(canonical_str.encode("utf-8")).hexdigest().lower()

    # -------------------------------------------------------------------------
    # Governance Methods
    # -------------------------------------------------------------------------

    @gl.public.write
    def set_registry_allowlist(self, registry: str, allowed: u256) -> str:
        if gl.message.sender_address != self.owner:
            return "OWNER_ONLY"
        cleaned = registry.strip().upper()
        if len(cleaned) == 0 or len(cleaned) > 64:
            return "INVALID_REGISTRY"

        count_int = int(self.registry_allowlist_count)
        for i in range(count_int):
            idx = u256(i)
            if self.allowed_registries.get(idx, "") == cleaned:
                if allowed == u256(1) and len(self.allowed_registry_sources.get(idx, "")) == 0:
                    return "REGISTRY_SOURCE_REQUIRED"
                self.allowed_registry_status[idx] = allowed
                return "REGISTRY_UPDATED"

        if allowed == u256(1):
            return "USE_SET_REGISTRY_SOURCE"
        new_idx = self.registry_allowlist_count
        self.allowed_registries[new_idx] = cleaned
        self.allowed_registry_status[new_idx] = allowed
        self.registry_allowlist_count = new_idx + u256(1)
        return "REGISTRY_ADDED"

    @gl.public.write
    def set_registry_source(self, registry: str, source_prefix: str, allowed: u256) -> str:
        if gl.message.sender_address != self.owner:
            return "OWNER_ONLY"
        cleaned = registry.strip().upper()
        prefix = source_prefix.strip()
        if len(cleaned) == 0 or len(cleaned) > 64:
            return "INVALID_REGISTRY"
        if not self._is_https_url(prefix) or not prefix.endswith("/"):
            return "INVALID_SOURCE_PREFIX"
        for i in range(int(self.registry_allowlist_count)):
            idx = u256(i)
            if self.allowed_registries.get(idx, "") == cleaned:
                self.allowed_registry_sources[idx] = prefix
                self.allowed_registry_status[idx] = allowed
                return "REGISTRY_SOURCE_UPDATED"
        new_idx = self.registry_allowlist_count
        self.allowed_registries[new_idx] = cleaned
        self.allowed_registry_sources[new_idx] = prefix
        self.allowed_registry_status[new_idx] = allowed
        self.registry_allowlist_count = new_idx + u256(1)
        return "REGISTRY_SOURCE_ADDED"

    # -------------------------------------------------------------------------
    # Escrow Lifecycle Write Methods
    # -------------------------------------------------------------------------

    @gl.public.write
    def create_escrow(
        self,
        supplier: str,
        project_name: str,
        cert_type: str,
        registry: str,
        required_volume: str,
        required_unit: str,
        required_vintage: str,
        required_beneficiary: str,
        required_status: str,
        deal_amount_wei: bigint,
        settlement_delay_seconds: u256,
        deadline_seconds: u256,
    ) -> typing.Any:
        buyer = gl.message.sender_address
        supplier_address = Address(supplier)
        if buyer == supplier_address:
            return "BUYER_CANNOT_BE_SUPPLIER"
        if len(project_name) == 0 or len(project_name) > 256:
            return "INVALID_PROJECT_NAME"
        if len(cert_type) == 0 or len(cert_type) > 64:
            return "INVALID_CERT_TYPE"
        if not self._is_registry_allowed(registry):
            return "UNAPPROVED_REGISTRY"
        if len(required_volume) == 0 or len(required_volume) > 32:
            return "INVALID_VOLUME"
        if len(required_beneficiary) == 0 or len(required_beneficiary) > 256:
            return "INVALID_BENEFICIARY"
        if required_status != "RETIRED" and required_status != "CANCELLED":
            return "INVALID_REQUIRED_STATUS"
        if deal_amount_wei <= bigint(0):
            return "INVALID_AMOUNT"
        if deadline_seconds < u256(60) or deadline_seconds > u256(31536000):
            return "INVALID_DEADLINE"

        escrow_id = self.escrow_count

        self.escrow_buyers[escrow_id] = buyer
        self.escrow_suppliers[escrow_id] = supplier_address
        self.escrow_amounts[escrow_id] = deal_amount_wei
        self.escrow_statuses[escrow_id] = u256(0)  # STATUS_CREATED
        self.escrow_created_ats[escrow_id] = u256(0)
        self.escrow_funded_ats[escrow_id] = u256(0)
        self.escrow_deadlines[escrow_id] = deadline_seconds
        self.escrow_settlement_delays[escrow_id] = settlement_delay_seconds
        self.escrow_verified_ats[escrow_id] = u256(0)
        self.escrow_project_names[escrow_id] = project_name
        self.escrow_cert_types[escrow_id] = cert_type
        self.escrow_registries[escrow_id] = registry.strip().upper()
        self.escrow_req_volumes[escrow_id] = required_volume
        self.escrow_req_units[escrow_id] = required_unit
        self.escrow_req_vintages[escrow_id] = required_vintage
        self.escrow_req_beneficiaries[escrow_id] = required_beneficiary
        self.escrow_req_statuses[escrow_id] = required_status
        self.escrow_cert_identity_hashes[escrow_id] = ""
        self.escrow_nonces[escrow_id] = u256(0)

        self.verif_verdicts[escrow_id] = "PENDING"
        self.verif_diagnostics_jsons[escrow_id] = ""
        self.verif_reasons[escrow_id] = ""

        self.escrow_count = escrow_id + u256(1)
        return escrow_id

    @gl.public.write.payable
    def fund_escrow(self, escrow_id: u256) -> str:
        if escrow_id >= self.escrow_count:
            return "ESCROW_NOT_FOUND"
        status = self.escrow_statuses.get(escrow_id, u256(0))
        if status != u256(0):  # Must be STATUS_CREATED
            return "INVALID_STATUS_FOR_FUNDING"
        buyer = self.escrow_buyers[escrow_id]
        if gl.message.sender_address != buyer:
            return "BUYER_ONLY"

        expected_amount = self.escrow_amounts[escrow_id]
        attached_value = bigint(gl.message.value)
        if attached_value != expected_amount:
            return "EXACT_AMOUNT_REQUIRED"

        self.escrow_statuses[escrow_id] = u256(1)  # STATUS_FUNDED
        self.escrow_funded_ats[escrow_id] = u256(1)
        self.total_escrowed_wei = self.total_escrowed_wei + attached_value
        return "ESCROW_FUNDED"

    @gl.public.write
    def submit_certificate(
        self,
        escrow_id: u256,
        registry_url: str,
        project_url: str,
        retirement_url: str,
        serial_start: str,
        serial_end: str,
        volume: str,
        vintage: str,
        beneficiary: str,
        evidence_digest: str,
        raw_evidence_json: str,
    ) -> str:
        if escrow_id >= self.escrow_count:
            return "ESCROW_NOT_FOUND"
        status = self.escrow_statuses.get(escrow_id, u256(0))
        if status != u256(1):  # Must be STATUS_FUNDED
            return "ESCROW_NOT_FUNDED"

        supplier = self.escrow_suppliers[escrow_id]
        if gl.message.sender_address != supplier and gl.message.sender_address != self.owner:
            return "SUPPLIER_ONLY"

        if not self._is_https_url(registry_url) or not self._is_https_url(retirement_url):
            return "INVALID_HTTPS_URL"
        if len(serial_start) == 0 or len(serial_end) == 0:
            return "INVALID_SERIAL_RANGE"
        if not self._is_valid_hex_sha256(evidence_digest):
            return "INVALID_DIGEST_FORMAT"
        if len(raw_evidence_json) == 0 or len(raw_evidence_json) > 32000:
            return "INVALID_RAW_EVIDENCE_SIZE"

        registry = self.escrow_registries[escrow_id]
        trusted_source = self._registry_source(registry)
        if len(trusted_source) == 0:
            return "REGISTRY_SOURCE_NOT_CONFIGURED"
        if not self._is_under_source(registry_url, trusted_source):
            return "REGISTRY_URL_OUTSIDE_TRUSTED_SOURCE"
        if not self._is_under_source(project_url, trusted_source):
            return "PROJECT_URL_OUTSIDE_TRUSTED_SOURCE"
        if not self._is_under_source(retirement_url, trusted_source):
            return "RETIREMENT_URL_OUTSIDE_TRUSTED_SOURCE"
        cert_type = self.escrow_cert_types[escrow_id]
        identity_hash = self._compute_identity_hash(registry, cert_type, serial_start, serial_end)

        # Anti-Double-Claim check
        if self.consumed_certificates.get(identity_hash, u256(0)) != u256(0):
            return "CERTIFICATE_ALREADY_CONSUMED"

        # Check if already used by another active escrow
        count_int = int(self.escrow_count)
        for i in range(count_int):
            idx = u256(i)
            if idx != escrow_id:
                other_status = self.escrow_statuses.get(idx, u256(0))
                if other_status in [u256(2), u256(3), u256(4), u256(5), u256(6)]:
                    if self.escrow_cert_identity_hashes.get(idx, "") == identity_hash:
                        return "CERTIFICATE_LOCKED_IN_OTHER_ESCROW"

        self.cert_registry_urls[escrow_id] = registry_url
        self.cert_project_urls[escrow_id] = project_url
        self.cert_retirement_urls[escrow_id] = retirement_url
        self.cert_serial_starts[escrow_id] = serial_start
        self.cert_serial_ends[escrow_id] = serial_end
        self.cert_volumes[escrow_id] = volume
        self.cert_vintages[escrow_id] = vintage
        self.cert_beneficiaries[escrow_id] = beneficiary
        self.cert_digests[escrow_id] = evidence_digest.lower()
        self.cert_raw_evidences[escrow_id] = raw_evidence_json
        self.cert_submitted_ats[escrow_id] = u256(1)

        self.escrow_cert_identity_hashes[escrow_id] = identity_hash
        self.escrow_statuses[escrow_id] = u256(2)  # STATUS_SUBMITTED
        old_nonce = self.escrow_nonces.get(escrow_id, u256(0))
        self.escrow_nonces[escrow_id] = old_nonce + u256(1)
        return "CERTIFICATE_SUBMITTED"

    @gl.public.write
    def verify_certificate(self, escrow_id: u256) -> typing.Any:
        if escrow_id >= self.escrow_count:
            return "ESCROW_NOT_FOUND"
        status = self.escrow_statuses.get(escrow_id, u256(0))
        if status != u256(2):  # Must be STATUS_SUBMITTED
            return "ESCROW_NOT_IN_SUBMITTED_STATE"

        self.escrow_statuses[escrow_id] = u256(3)  # STATUS_UNDER_REVIEW

        ret_url = self.cert_retirement_urls[escrow_id]
        expected_digest = self.cert_digests[escrow_id]
        expected_registry = self.escrow_registries[escrow_id]
        trusted_source = self._registry_source(expected_registry)
        expected_beneficiary = self.escrow_req_beneficiaries[escrow_id]
        expected_volume = self.escrow_req_volumes[escrow_id]
        expected_vintage = self.escrow_req_vintages[escrow_id]
        expected_status = self.escrow_req_statuses[escrow_id]
        s_start = self.cert_serial_starts[escrow_id]
        s_end = self.cert_serial_ends[escrow_id]
        raw_evidence = self.cert_raw_evidences[escrow_id]
        identity_hash = self.escrow_cert_identity_hashes[escrow_id]

        def evaluate_consensus() -> str:
            import hashlib

            registry_match = "FAIL"
            serial_status = "INVALID"
            retirement_status = "UNKNOWN"
            beneficiary_match = "FAIL"
            vintage_match = "FAIL"
            double_claim_risk = "NONE"
            reason_code = "INITIAL"
            verdict = "REJECTED"
            verdict_status_code = 7  # STATUS_REJECTED

            # 1. Digest verification of raw evidence
            raw_bytes = raw_evidence.encode("utf-8")
            calc_digest = hashlib.sha256(raw_bytes).hexdigest().lower()
            digest_ok = (calc_digest == expected_digest)

            # 2. Fetch a canonical registry endpoint derived from the on-chain
            # registry mapping and certificate serial. The supplier's submitted
            # retirement URL is metadata only and is never fetched for authority.
            fetch_ok = False
            try:
                canonical_url = trusted_source + "certificates/" + s_start + ".json"
                resp = gl.nondet.web.get(canonical_url)
                if resp.status == 200 and len(resp.body) <= 256000:
                    fetch_ok = True
                    web_data = json.loads(resp.body.decode("utf-8"))

                    r_registry = str(web_data.get("registry", "")).strip().upper()
                    r_status = str(web_data.get("status", "")).strip().upper()
                    r_ben = str(web_data.get("beneficiary", "")).strip()
                    r_vol = str(web_data.get("volume", "")).strip()
                    r_vin = str(web_data.get("vintage", "")).strip()
                    r_s_start = str(web_data.get("serial_start", "")).strip()
                    r_s_end = str(web_data.get("serial_end", "")).strip()
                    r_dc = str(web_data.get("double_claim_risk", "NONE")).strip().upper()

                    # Categorical validations
                    if r_registry == expected_registry:
                        registry_match = "PASS"

                    if r_s_start == s_start and r_s_end == s_end and len(r_s_start) > 0:
                        serial_status = "VALID"

                    retirement_status = r_status

                    if r_ben == expected_beneficiary:
                        beneficiary_match = "PASS"

                    if r_vin == expected_vintage and r_vol == expected_volume:
                        vintage_match = "PASS"

                    if r_dc == "SUSPECTED":
                        double_claim_risk = "SUSPECTED"
            except Exception:
                fetch_ok = False

            # 3. Deterministic Decision Tree
            if not fetch_ok:
                verdict = "UNAVAILABLE"
                verdict_status_code = 9  # STATUS_UNAVAILABLE
                reason_code = "TRUSTED_REGISTRY_SOURCE_UNREACHABLE"
            elif double_claim_risk == "SUSPECTED":
                verdict = "CONFLICTED"
                verdict_status_code = 10  # STATUS_CONFLICTED
                reason_code = "DOUBLE_CLAIM_SUSPECTED"
            elif (
                registry_match == "PASS"
                and serial_status == "VALID"
                and retirement_status == expected_status
                and beneficiary_match == "PASS"
                and vintage_match == "PASS"
            ):
                verdict = "VERIFIED"
                verdict_status_code = 4  # STATUS_VERIFIED
                reason_code = "ALL_REGISTRY_CRITERIA_VERIFIED"
            else:
                verdict = "REJECTED"
                verdict_status_code = 7  # STATUS_REJECTED
                reason_code = "EVIDENCE_DOES_NOT_MEET_DEAL_TERMS"

            diag = {
                "registry_match": registry_match,
                "serial_status": serial_status,
                "retirement_status": retirement_status,
                "beneficiary_match": beneficiary_match,
                "vintage_match": vintage_match,
                "double_claim_risk": double_claim_risk,
                "digest_ok": digest_ok,
                "fetch_ok": fetch_ok,
                "verdict": verdict,
                "verdict_status_code": verdict_status_code,
                "reason_code": reason_code,
                "identity_hash": identity_hash,
                "canonical_source": trusted_source,
            }
            return json.dumps(diag, sort_keys=True, separators=(",", ":"))

        result_json_str = gl.eq_principle.strict_eq(evaluate_consensus)
        diag_data = json.loads(result_json_str)

        new_status = u256(int(diag_data["verdict_status_code"]))
        verdict_str = str(diag_data["verdict"])
        reason_str = str(diag_data["reason_code"])

        self.escrow_statuses[escrow_id] = new_status
        self.verif_verdicts[escrow_id] = verdict_str
        self.verif_reasons[escrow_id] = reason_str
        self.verif_diagnostics_jsons[escrow_id] = result_json_str
        self.escrow_verified_ats[escrow_id] = u256(1)

        return new_status

    @gl.public.write
    def settle_escrow(self, escrow_id: u256) -> str:
        if escrow_id >= self.escrow_count:
            return "ESCROW_NOT_FOUND"
        status = self.escrow_statuses.get(escrow_id, u256(0))
        # Must be STATUS_VERIFIED (4) or STATUS_SETTLEABLE (5)
        if status != u256(4) and status != u256(5):
            return "ESCROW_NOT_VERIFIED"

        supplier = self.escrow_suppliers[escrow_id]
        buyer = self.escrow_buyers[escrow_id]
        caller = gl.message.sender_address
        if caller != supplier and caller != buyer and caller != self.owner:
            return "UNAUTHORIZED"

        amount = self.escrow_amounts.get(escrow_id, bigint(0))
        if amount <= bigint(0):
            return "ZERO_ESCROW_AMOUNT"

        # Update state before transfer (Checks-Effects-Interactions)
        self.escrow_statuses[escrow_id] = u256(6)  # STATUS_SETTLED
        self.escrow_amounts[escrow_id] = bigint(0)
        self.total_paid_wei = self.total_paid_wei + amount

        # Mark certificate as consumed
        ident_hash = self.escrow_cert_identity_hashes.get(escrow_id, "")
        if len(ident_hash) > 0:
            self.consumed_certificates[ident_hash] = escrow_id + u256(1)

        # Native transfer to supplier
        _Recipient(supplier).emit_transfer(value=amount)
        return "ESCROW_SETTLED_PAYMENT_RELEASED"

    @gl.public.write
    def refund_escrow(self, escrow_id: u256, reason: str) -> str:
        if escrow_id >= self.escrow_count:
            return "ESCROW_NOT_FOUND"
        status = self.escrow_statuses.get(escrow_id, u256(0))
        # Refund allowed from REJECTED(7), UNAVAILABLE(9), CONFLICTED(10), EXPIRED(11), or FUNDED(1) if cancelled by agreement
        if status not in [u256(7), u256(9), u256(10), u256(11), u256(1)]:
            return "INVALID_STATUS_FOR_REFUND"

        buyer = self.escrow_buyers[escrow_id]
        caller = gl.message.sender_address
        if caller != buyer and caller != self.owner:
            return "BUYER_OR_OWNER_ONLY"

        amount = self.escrow_amounts.get(escrow_id, bigint(0))
        if amount <= bigint(0):
            return "NO_FUNDS_TO_REFUND"

        self.escrow_statuses[escrow_id] = u256(8)  # STATUS_REFUNDED
        self.escrow_amounts[escrow_id] = bigint(0)
        self.total_refunded_wei = self.total_refunded_wei + amount
        self.verif_reasons[escrow_id] = f"REFUNDED: {reason[:128]}"

        # Native transfer back to buyer
        _Recipient(buyer).emit_transfer(value=amount)
        return "ESCROW_REFUNDED_TO_BUYER"

    @gl.public.write
    def expire_escrow(self, escrow_id: u256) -> str:
        if escrow_id >= self.escrow_count:
            return "ESCROW_NOT_FOUND"
        status = self.escrow_statuses.get(escrow_id, u256(0))
        if status not in [u256(0), u256(1), u256(2), u256(3), u256(9)]:
            return "CANNOT_EXPIRE_TERMINAL_OR_SETTLED_ESCROW"

        buyer = self.escrow_buyers[escrow_id]
        if gl.message.sender_address != buyer and gl.message.sender_address != self.owner:
            return "BUYER_OR_OWNER_ONLY"

        self.escrow_statuses[escrow_id] = u256(11)  # STATUS_EXPIRED
        self.verif_verdicts[escrow_id] = "EXPIRED"
        self.verif_reasons[escrow_id] = "ESCROW_EXPIRED"
        return "ESCROW_EXPIRED"

    # -------------------------------------------------------------------------
    # Public View Methods
    # -------------------------------------------------------------------------

    @gl.public.view
    def get_counts(self) -> str:
        res = {
            "escrow_count": int(self.escrow_count),
            "registry_allowlist_count": int(self.registry_allowlist_count),
        }
        return json.dumps(res, sort_keys=True)

    @gl.public.view
    def get_accounting(self) -> str:
        res = {
            "total_escrowed_wei": str(self.total_escrowed_wei),
            "total_paid_wei": str(self.total_paid_wei),
            "total_refunded_wei": str(self.total_refunded_wei),
            "active_locked_wei": str(self.total_escrowed_wei - self.total_paid_wei - self.total_refunded_wei),
        }
        return json.dumps(res, sort_keys=True)

    @gl.public.view
    def is_certificate_consumed(self, identity_hash: str) -> bool:
        if len(identity_hash) == 0:
            return False
        return self.consumed_certificates.get(identity_hash.lower(), u256(0)) != u256(0)

    @gl.public.view
    def get_escrow(self, escrow_id: u256) -> str:
        if escrow_id >= self.escrow_count:
            return "{}"
        record = {
            "escrow_id": int(escrow_id),
            "buyer": str(self.escrow_buyers.get(escrow_id, "")),
            "supplier": str(self.escrow_suppliers.get(escrow_id, "")),
            "amount_wei": str(self.escrow_amounts.get(escrow_id, bigint(0))),
            "status": int(self.escrow_statuses.get(escrow_id, u256(0))),
            "created_at": int(self.escrow_created_ats.get(escrow_id, u256(0))),
            "funded_at": int(self.escrow_funded_ats.get(escrow_id, u256(0))),
            "deadline": int(self.escrow_deadlines.get(escrow_id, u256(0))),
            "settlement_delay": int(self.escrow_settlement_delays.get(escrow_id, u256(0))),
            "verified_at": int(self.escrow_verified_ats.get(escrow_id, u256(0))),
            "project_name": self.escrow_project_names.get(escrow_id, ""),
            "cert_type": self.escrow_cert_types.get(escrow_id, ""),
            "registry": self.escrow_registries.get(escrow_id, ""),
            "required_volume": self.escrow_req_volumes.get(escrow_id, ""),
            "required_unit": self.escrow_req_units.get(escrow_id, ""),
            "required_vintage": self.escrow_req_vintages.get(escrow_id, ""),
            "required_beneficiary": self.escrow_req_beneficiaries.get(escrow_id, ""),
            "required_status": self.escrow_req_statuses.get(escrow_id, ""),
            "identity_hash": self.escrow_cert_identity_hashes.get(escrow_id, ""),
            "nonce": int(self.escrow_nonces.get(escrow_id, u256(0))),
        }
        return json.dumps(record, sort_keys=True)

    @gl.public.view
    def get_certificate(self, escrow_id: u256) -> str:
        if escrow_id >= self.escrow_count:
            return "{}"
        record = {
            "registry_url": self.cert_registry_urls.get(escrow_id, ""),
            "project_url": self.cert_project_urls.get(escrow_id, ""),
            "retirement_url": self.cert_retirement_urls.get(escrow_id, ""),
            "serial_start": self.cert_serial_starts.get(escrow_id, ""),
            "serial_end": self.cert_serial_ends.get(escrow_id, ""),
            "volume": self.cert_volumes.get(escrow_id, ""),
            "vintage": self.cert_vintages.get(escrow_id, ""),
            "beneficiary": self.cert_beneficiaries.get(escrow_id, ""),
            "digest": self.cert_digests.get(escrow_id, ""),
            "submitted_at": int(self.cert_submitted_ats.get(escrow_id, u256(0))),
        }
        return json.dumps(record, sort_keys=True)

    @gl.public.view
    def get_verification(self, escrow_id: u256) -> str:
        if escrow_id >= self.escrow_count:
            return "{}"
        record = {
            "verdict": self.verif_verdicts.get(escrow_id, "PENDING"),
            "reason": self.verif_reasons.get(escrow_id, ""),
            "diagnostics": self.verif_diagnostics_jsons.get(escrow_id, "{}"),
        }
        return json.dumps(record, sort_keys=True)
