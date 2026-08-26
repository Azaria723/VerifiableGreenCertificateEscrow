import React, { useState, useEffect } from 'react';
import { CheckCircle2, XCircle, ArrowLeft, ExternalLink, ShieldCheck, Lock, DollarSign, Clock, FileText, RefreshCw, Loader2 } from 'lucide-react';
import {
  STATUS_LABELS,
  EXPLORER_ADDRESS_URL,
  fetchOnChainCertificate,
  fetchOnChainVerification,
  fetchOnChainEscrow,
} from '../genlayer';

export default function EscrowDetailPage({
  escrowId,
  escrows,
  setActiveRoute,
  onSettleEscrow,
  onRefundEscrow,
  onFundEscrow,
  account,
}) {
  const [escrow, setEscrow] = useState(
    escrows.find((e) => e.escrow_id === Number(escrowId)) || {
      escrow_id: Number(escrowId),
      project_name: "Loading...",
      status: 0,
      amount_wei: "0",
    }
  );
  const [certificate, setCertificate] = useState(null);
  const [verification, setVerification] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        const [eData, cData, vData] = await Promise.all([
          fetchOnChainEscrow(escrowId),
          fetchOnChainCertificate(escrowId),
          fetchOnChainVerification(escrowId),
        ]);
        if (eData && eData.project_name) setEscrow(eData);
        if (cData) setCertificate(cData);
        if (vData) setVerification(vData);
      } catch (err) {
        console.warn("Error fetching details for escrow", escrowId, err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [escrowId]);

  const badge = STATUS_LABELS[escrow.status] || { label: 'UNKNOWN', color: 'bg-surfaceDark' };
  const amountGen = (Number(escrow.amount_wei || 0) / 1e18).toFixed(2);

  const timelineSteps = [
    { label: "CREATED", active: escrow.status >= 0 },
    { label: "FUNDED", active: escrow.status >= 1 },
    { label: "SUBMITTED", active: escrow.status >= 2 },
    { label: "UNDER_REVIEW", active: escrow.status >= 3 },
    { label: escrow.status === 7 ? "REJECTED" : "VERIFIED", active: escrow.status >= 4 },
    { label: escrow.status === 8 ? "REFUNDED" : "SETTLED", active: escrow.status === 6 || escrow.status === 8 },
  ];

  const diag = verification?.diagnostics ? (() => {
    try { return JSON.parse(verification.diagnostics); } catch { return {}; }
  })() : {};

  return (
    <div className="max-w-6xl mx-auto px-4 md:px-8 py-12 space-y-10">
      {/* Navigation */}
      <button
        onClick={() => setActiveRoute('/explore')}
        className="inline-flex items-center space-x-1.5 text-xs font-mono text-mutedText hover:text-textMain transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        <span>Return to Escrows List</span>
      </button>

      {/* Header */}
      <div className="bg-surface border border-borderLine p-8 rounded-sm space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-borderLine pb-6">
          <div>
            <div className="flex items-center space-x-3">
              <span className="font-mono text-xs font-bold text-mutedText">ESCROW #{escrow.escrow_id}</span>
              <span className={`px-2.5 py-0.5 rounded-xs text-xs font-bold font-mono ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <h1 className="font-editorial text-3xl md:text-4xl font-bold text-textMain mt-1">
              {escrow.project_name || "Green Energy Escrow Deal"}
            </h1>
          </div>

          <div className="text-right">
            <div className="font-mono text-xs text-mutedText uppercase">Escrow Locked Balance</div>
            <div className="font-mono text-3xl font-bold text-orangeAccent">{amountGen} GEN</div>
          </div>
        </div>

        {/* Counterparty addresses */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
          <div className="p-3 bg-bgMain rounded-xs border border-borderLine">
            <div className="text-mutedText uppercase text-[10px]">Buyer Address</div>
            <div className="font-semibold text-textMain break-all">{escrow.buyer || "N/A"}</div>
          </div>
          <div className="p-3 bg-bgMain rounded-xs border border-borderLine">
            <div className="text-mutedText uppercase text-[10px]">Supplier Beneficiary</div>
            <div className="font-semibold text-textMain break-all">{escrow.supplier || "N/A"}</div>
          </div>
        </div>
      </div>

      {/* Lifecycle Progress Timeline */}
      <div className="bg-surface border border-borderLine p-6 rounded-sm space-y-4">
        <div className="font-mono text-xs uppercase tracking-widest text-mutedText border-b border-borderLine pb-2">
          On-Chain Lifecycle Progression
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-2">
          {timelineSteps.map((step, idx) => (
            <div
              key={idx}
              className={`p-3 rounded-xs text-center border font-mono text-xs transition-all ${
                step.active
                  ? 'bg-bgMain border-orangeAccent text-textMain font-bold shadow-xs'
                  : 'bg-surfaceDark/40 border-borderLine text-mutedText'
              }`}
            >
              <div className="text-[10px] text-mutedText mb-1">STAGE {idx + 1}</div>
              <div>{step.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Two Columns: Evidence Panel + Categorical Decision Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Evidence Dossier */}
        <div className="lg:col-span-6 bg-surface border border-borderLine p-6 rounded-sm space-y-5">
          <div className="flex items-center space-x-2 font-mono text-xs font-bold text-textMain uppercase tracking-wider border-b border-borderLine pb-3">
            <FileText className="w-4 h-4 text-orangeAccent" />
            <span>Public Evidence Dossier</span>
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex justify-between py-1.5 border-b border-borderLine/50">
              <span className="text-mutedText">Registry Standard:</span>
              <span className="font-bold text-textMain">{escrow.registry}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-borderLine/50">
              <span className="text-mutedText">Volume Obligation:</span>
              <span className="font-bold text-textMain">{escrow.required_volume} {escrow.required_unit}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-borderLine/50">
              <span className="text-mutedText">Vintage Year:</span>
              <span className="font-bold text-textMain">{escrow.required_vintage}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-borderLine/50">
              <span className="text-mutedText">Beneficiary:</span>
              <span className="font-bold text-textMain">{escrow.required_beneficiary}</span>
            </div>
            <div className="flex justify-between py-1.5 border-b border-borderLine/50">
              <span className="text-mutedText">Target Status:</span>
              <span className="font-bold text-greenStatus">{escrow.required_status}</span>
            </div>
            {certificate?.serial_start && (
              <>
                <div className="flex justify-between py-1.5 border-b border-borderLine/50">
                  <span className="text-mutedText">Serial Range:</span>
                  <span className="font-bold text-textMain">{certificate.serial_start} &rarr; {certificate.serial_end}</span>
                </div>
                <div className="flex justify-between py-1.5 border-b border-borderLine/50">
                  <span className="text-mutedText">Registry URL:</span>
                  <a href={certificate.registry_url} target="_blank" rel="noreferrer" className="text-orangeAccent hover:underline truncate max-w-[200px] inline-flex items-center space-x-1">
                    <span>{certificate.registry_url}</span>
                    <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </div>
                <div className="flex justify-between py-1.5">
                  <span className="text-mutedText">Evidence Digest:</span>
                  <span className="font-bold text-orangeAccent text-[10px] truncate max-w-[180px]">{certificate.digest}</span>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Categorical Decision Panel */}
        <div className="lg:col-span-6 bg-surface border border-borderLine p-6 rounded-sm space-y-5">
          <div className="flex items-center space-x-2 font-mono text-xs font-bold text-textMain uppercase tracking-wider border-b border-borderLine pb-3">
            <ShieldCheck className="w-4 h-4 text-greenStatus" />
            <span>Consensus Categorical Checks</span>
          </div>

          <div className="space-y-2.5 font-mono text-xs">
            {[
              { label: "Registry Identity Match", status: diag?.registry_match || "PENDING", ok: diag?.registry_match === "PASS" },
              { label: "Serial Range Consistency", status: diag?.serial_status || "PENDING", ok: diag?.serial_status === "VALID" },
              { label: "Retirement Proof Confirmed", status: diag?.retirement_status || "PENDING", ok: diag?.retirement_status === "RETIRED" || diag?.retirement_status === "CANCELLED" },
              { label: "Beneficiary Ownership Match", status: diag?.beneficiary_match || "PENDING", ok: diag?.beneficiary_match === "PASS" },
              { label: "Vintage & Volume Exact Match", status: diag?.vintage_match || "PENDING", ok: diag?.vintage_match === "PASS" },
              { label: "Double-Claim Cross Check", status: diag?.double_claim_risk || "NONE", ok: diag?.double_claim_risk !== "SUSPECTED" },
            ].map((check, idx) => (
              <div key={idx} className="flex justify-between items-center p-2 bg-bgMain rounded-xs border border-borderLine">
                <span className="text-mutedText">{check.label}</span>
                <span className={`px-2 py-0.5 rounded-xs font-bold text-[10px] ${check.ok && check.status !== 'PENDING' ? 'bg-greenStatus/20 text-greenStatus' : 'bg-surfaceDark text-mutedText'}`}>
                  {check.status}
                </span>
              </div>
            ))}
          </div>

          {verification?.reason && (
            <div className="p-3 bg-bgMain rounded-xs border border-borderLine font-mono text-xs space-y-1">
              <div className="text-[10px] text-mutedText uppercase">Consensus Reason Code:</div>
              <div className="font-bold text-orangeAccent">{verification.reason}</div>
            </div>
          )}
        </div>
      </div>

      {/* Action Execution Bar */}
      <div className="bg-surfaceDark p-6 rounded-sm border border-borderLine flex flex-col sm:flex-row justify-between items-center gap-4">
        <div>
          <div className="font-editorial text-xl font-bold text-textMain">Escrow Actions</div>
          <div className="text-xs text-mutedText font-mono">
            {escrow.status === 0 && "Escrow created. Lock GEN to proceed."}
            {escrow.status === 1 && "Funded. Supplier must submit evidence."}
            {escrow.status === 2 && "Submitted. Verification can be triggered."}
            {escrow.status === 4 && "Verified! Settle payment to supplier."}
            {(escrow.status === 7 || escrow.status === 9 || escrow.status === 10 || escrow.status === 11) && "Refund available for buyer."}
          </div>
        </div>

        <div className="flex items-center space-x-3">
          {escrow.status === 0 && (
            <button
              onClick={() => onFundEscrow(escrow.escrow_id, escrow.amount_wei)}
              className="px-6 py-3 bg-orangeAccent hover:bg-orangeAccent/90 text-white rounded-sm font-mono text-xs font-bold flex items-center space-x-2 shadow-sm cursor-pointer"
            >
              <Lock className="w-4 h-4" />
              <span>Lock Funds ({amountGen} GEN)</span>
            </button>
          )}

          {(escrow.status === 4 || escrow.status === 5) && (
            <button
              onClick={() => onSettleEscrow(escrow.escrow_id)}
              className="px-6 py-3 bg-greenStatus hover:bg-greenStatus/90 text-white rounded-sm font-mono text-xs font-bold flex items-center space-x-2 shadow-sm cursor-pointer"
            >
              <DollarSign className="w-4 h-4" />
              <span>Release Payment ({amountGen} GEN)</span>
            </button>
          )}

          {(escrow.status === 1 || escrow.status === 7 || escrow.status === 9 || escrow.status === 10 || escrow.status === 11) && (
            <button
              onClick={() => onRefundEscrow(escrow.escrow_id)}
              className="px-6 py-3 bg-redStatus hover:bg-redStatus/90 text-white rounded-sm font-mono text-xs font-bold flex items-center space-x-2 shadow-sm cursor-pointer"
            >
              <span>Claim Refund ({amountGen} GEN)</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
