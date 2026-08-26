import React from 'react';
import { DollarSign, RefreshCw, CheckCircle2, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { STATUS_LABELS } from '../genlayer';

export default function SettlementPage({ escrows, onSettleEscrow, onRefundEscrow, setActiveRoute, setSelectedEscrowId }) {
  const settleableList = escrows.filter(e => e.status === 4 || e.status === 5);
  const refundList = escrows.filter(e => e.status === 7 || e.status === 9 || e.status === 10 || e.status === 11 || e.status === 1);
  const settledHistory = escrows.filter(e => e.status === 6 || e.status === 8);

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-borderLine pb-6">
        <div className="font-mono text-xs text-orangeAccent uppercase tracking-widest font-semibold mb-1">
          Liquidity Settlement Rail
        </div>
        <h1 className="font-editorial text-3xl md:text-5xl font-bold text-textMain">
          Escrow Settlement & Payout Desk
        </h1>
        <p className="text-sm text-mutedText mt-2">
          Execute payment disbursements for verified green claims or trigger guaranteed refunds for failed submissions.
        </p>
      </div>

      {/* Settleable Queue Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-borderLine pb-3">
          <h2 className="font-editorial text-2xl font-bold text-textMain flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-greenStatus"></span>
            <span>Verified Escrows Ready for Payment ({settleableList.length})</span>
          </h2>
          <span className="text-xs font-mono text-mutedText">Instant Native Transfer</span>
        </div>

        {settleableList.length === 0 ? (
          <div className="p-8 bg-surface border border-borderLine rounded-sm text-center text-xs font-mono text-mutedText">
            No escrows currently in VERIFIED settlement queue.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {settleableList.map((e) => {
              const amountGen = (Number(e.amount_wei) / 1e18).toFixed(2);
              return (
                <div key={e.escrow_id} className="bg-surface border border-greenStatus/50 p-6 rounded-sm space-y-4 shadow-xs">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-mono text-xs text-mutedText">ESCROW #{e.escrow_id}</div>
                      <h3 className="font-editorial text-xl font-bold text-textMain">{e.project_name}</h3>
                    </div>
                    <div className="font-mono text-xl font-bold text-greenStatus">{amountGen} GEN</div>
                  </div>

                  <div className="p-3 bg-bgMain rounded-xs border border-borderLine text-xs font-mono space-y-1">
                    <div className="flex justify-between text-mutedText">
                      <span>Supplier Recipient:</span>
                      <span className="font-semibold text-textMain">{e.supplier?.slice(0, 10)}...{e.supplier?.slice(-6)}</span>
                    </div>
                    <div className="flex justify-between text-mutedText">
                      <span>Beneficiary:</span>
                      <span className="font-semibold text-textMain">{e.required_beneficiary}</span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => onSettleEscrow(e.escrow_id)}
                      className="flex-1 py-2.5 bg-greenStatus hover:bg-greenStatus/90 text-white rounded-sm font-mono text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <DollarSign className="w-4 h-4" />
                      <span>Release {amountGen} GEN Payout</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEscrowId(e.escrow_id);
                        setActiveRoute(`/escrow/${e.escrow_id}`);
                      }}
                      className="px-3 py-2.5 bg-bgMain border border-borderLine rounded-sm hover:border-orangeAccent text-xs font-mono"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Refundable Queue Section */}
      <div className="space-y-6">
        <div className="flex justify-between items-center border-b border-borderLine pb-3">
          <h2 className="font-editorial text-2xl font-bold text-textMain flex items-center space-x-2">
            <span className="w-3 h-3 rounded-full bg-redStatus"></span>
            <span>Refund Eligible Escrows ({refundList.length})</span>
          </h2>
          <span className="text-xs font-mono text-mutedText">Guaranteed Buyer Protection</span>
        </div>

        {refundList.length === 0 ? (
          <div className="p-8 bg-surface border border-borderLine rounded-sm text-center text-xs font-mono text-mutedText">
            No escrows currently pending refund claims.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {refundList.map((e) => {
              const amountGen = (Number(e.amount_wei) / 1e18).toFixed(2);
              const badge = STATUS_LABELS[e.status] || { label: 'UNKNOWN', color: 'bg-surfaceDark' };

              return (
                <div key={e.escrow_id} className="bg-surface border border-borderLine p-6 rounded-sm space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="flex items-center space-x-2 font-mono text-xs text-mutedText">
                        <span>ESCROW #{e.escrow_id}</span>
                        <span className={`px-2 py-0.5 rounded-xs text-[10px] ${badge.color}`}>{badge.label}</span>
                      </div>
                      <h3 className="font-editorial text-xl font-bold text-textMain">{e.project_name}</h3>
                    </div>
                    <div className="font-mono text-xl font-bold text-textMain">{amountGen} GEN</div>
                  </div>

                  <div className="flex items-center space-x-3 pt-2">
                    <button
                      onClick={() => onRefundEscrow(e.escrow_id)}
                      className="flex-1 py-2.5 bg-redStatus hover:bg-redStatus/90 text-white rounded-sm font-mono text-xs font-bold flex items-center justify-center space-x-1.5 shadow-xs cursor-pointer"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>Execute Buyer Refund ({amountGen} GEN)</span>
                    </button>
                    <button
                      onClick={() => {
                        setSelectedEscrowId(e.escrow_id);
                        setActiveRoute(`/escrow/${e.escrow_id}`);
                      }}
                      className="px-3 py-2.5 bg-bgMain border border-borderLine rounded-sm hover:border-orangeAccent text-xs font-mono"
                    >
                      <ArrowUpRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
