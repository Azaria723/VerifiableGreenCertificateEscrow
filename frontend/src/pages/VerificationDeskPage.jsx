import React, { useState } from 'react';
import { Play, Sparkles, CheckCircle2, XCircle, AlertTriangle, RefreshCw, FileSearch, ShieldCheck } from 'lucide-react';
import { STATUS_LABELS } from '../genlayer';

export default function VerificationDeskPage({ onVerifyCertificate, escrows, account }) {
  const [selectedId, setSelectedId] = useState(0);

  const currentEscrow = escrows.find(e => e.escrow_id === Number(selectedId)) || escrows[0] || {
    escrow_id: 0,
    project_name: "Sample Project",
    status: 2,
    registry: "I-REC_STANDARD",
    required_volume: "1000",
    required_unit: "MWh",
    required_vintage: "2026",
    required_beneficiary: "Acme Corp ESG Fund",
    required_status: "RETIRED",
  };

  const statusBadge = STATUS_LABELS[currentEscrow.status] || { label: 'UNKNOWN', color: 'bg-surfaceDark' };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-borderLine pb-6">
        <div className="font-mono text-xs text-orangeAccent uppercase tracking-widest font-semibold mb-1">
          Consensus Adjudication
        </div>
        <h1 className="font-editorial text-3xl md:text-5xl font-bold text-textMain">
          Registry Verification Desk
        </h1>
        <p className="text-sm text-mutedText mt-2">
          Dispatch decentralized validator nodes to fetch public registry records and adjudicate certificate retirement.
        </p>
      </div>

      {/* Escrow Selector & Status Banner */}
      <div className="bg-surface p-6 rounded-sm border border-borderLine space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
          <div className="space-y-1 md:col-span-2">
            <label className="text-xs font-mono text-mutedText">Select Escrow For Consensus Adjudication:</label>
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(Number(e.target.value))}
              className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs font-mono text-xs font-bold text-textMain focus:border-orangeAccent"
            >
              {escrows.map((e) => (
                <option key={e.escrow_id} value={e.escrow_id}>
                  Escrow #{e.escrow_id} — {e.project_name} [{STATUS_LABELS[e.status]?.label || 'UNKNOWN'}]
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-mono text-mutedText">Current Lifecycle State:</label>
            <div className={`p-2.5 rounded-xs text-xs font-mono font-bold text-center ${statusBadge.color}`}>
              {statusBadge.label}
            </div>
          </div>
        </div>

        {/* Evidence Snapshot Card */}
        <div className="bg-bgMain p-6 rounded-sm border border-borderLine space-y-4 font-mono text-xs">
          <div className="flex justify-between items-center border-b border-borderLine pb-3">
            <span className="font-bold text-textMain uppercase tracking-wider text-sm flex items-center space-x-2">
              <FileSearch className="w-4 h-4 text-orangeAccent" />
              <span>Evidence Snapshot & Requirement Spec</span>
            </span>
            <span className="text-mutedText text-[10px]">Nonce: #{currentEscrow.nonce || 0}</span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div>
              <div className="text-mutedText text-[10px] uppercase">Registry Standard</div>
              <div className="font-bold text-textMain">{currentEscrow.registry}</div>
            </div>
            <div>
              <div className="text-mutedText text-[10px] uppercase">Required Volume</div>
              <div className="font-bold text-textMain">{currentEscrow.required_volume} {currentEscrow.required_unit}</div>
            </div>
            <div>
              <div className="text-mutedText text-[10px] uppercase">Vintage Year</div>
              <div className="font-bold text-textMain">{currentEscrow.required_vintage}</div>
            </div>
            <div>
              <div className="text-mutedText text-[10px] uppercase">Mandatory Status</div>
              <div className="font-bold text-greenStatus">{currentEscrow.required_status}</div>
            </div>
          </div>

          <div className="border-t border-borderLine pt-3">
            <div className="text-mutedText text-[10px] uppercase">Designated Beneficiary Entity:</div>
            <div className="font-bold text-textMain text-sm">{currentEscrow.required_beneficiary}</div>
          </div>
        </div>

        {/* Warning Callout */}
        <div className="bg-surfaceDark p-4 rounded-sm border border-borderLine text-xs space-y-2">
          <div className="flex items-center space-x-2 text-textMain font-bold">
            <AlertTriangle className="w-4 h-4 text-orangeAccent" />
            <span>Consensus Protocol Notice</span>
          </div>
          <p className="text-mutedText text-[11px] leading-relaxed">
            Verification is executed across independent GenLayer validator nodes. The outcome will be determined as <strong>VERIFIED</strong>, <strong>REJECTED</strong>, <strong>UNAVAILABLE</strong>, or <strong>CONFLICTED</strong> based on cryptographic proof and live registry data.
          </p>
        </div>

        {/* Action Button */}
        <div className="flex justify-end pt-2">
          <button
            onClick={() => onVerifyCertificate(Number(selectedId))}
            className="px-8 py-3.5 bg-orangeAccent hover:bg-orangeAccent/90 text-white rounded-sm font-mono text-xs font-bold flex items-center space-x-2 shadow-sm transition-all cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>Run Registry Verification on Escrow #{selectedId}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
