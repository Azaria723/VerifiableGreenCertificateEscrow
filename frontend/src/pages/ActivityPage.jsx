import React, { useState } from 'react';
import { Wallet, History, ArrowUpRight, CheckCircle2, RefreshCw } from 'lucide-react';
import { STATUS_LABELS } from '../genlayer';

export default function ActivityPage({ escrows, account, setActiveRoute, setSelectedEscrowId }) {
  const [roleFilter, setRoleFilter] = useState('ALL');

  if (!account) {
    return (
      <div className="max-w-4xl mx-auto px-4 md:px-8 py-20 text-center space-y-4">
        <div className="w-12 h-12 rounded-full bg-surfaceDark flex items-center justify-center mx-auto text-mutedText">
          <Wallet className="w-6 h-6" />
        </div>
        <h2 className="font-editorial text-2xl font-bold text-textMain">Wallet Not Connected</h2>
        <p className="text-sm text-mutedText max-w-md mx-auto">
          Please connect your MetaMask or Web3 wallet in the navigation bar to inspect your escrow activities.
        </p>
      </div>
    );
  }

  const myEscrows = escrows.filter((e) => {
    const isBuyer = e.buyer?.toLowerCase() === account.toLowerCase();
    const isSupplier = e.supplier?.toLowerCase() === account.toLowerCase();

    if (roleFilter === 'BUYER') return isBuyer;
    if (roleFilter === 'SUPPLIER') return isSupplier;
    return isBuyer || isSupplier;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-borderLine pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="font-mono text-xs text-orangeAccent uppercase tracking-widest font-semibold mb-1">
            Account Ledger
          </div>
          <h1 className="font-editorial text-3xl md:text-5xl font-bold text-textMain">
            My Escrow Activity
          </h1>
          <div className="font-mono text-xs text-mutedText mt-1">
            Connected: <span className="text-textMain font-semibold">{account}</span>
          </div>
        </div>

        {/* Role Filters */}
        <div className="flex items-center space-x-2 bg-surface p-1.5 rounded-sm border border-borderLine text-xs font-mono">
          {['ALL', 'BUYER', 'SUPPLIER'].map((r) => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-xs transition-all ${
                roleFilter === r
                  ? 'bg-orangeAccent text-white font-semibold'
                  : 'text-mutedText hover:text-textMain'
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Activity Table */}
      {myEscrows.length === 0 ? (
        <div className="p-12 bg-surface border border-borderLine rounded-sm text-center text-xs font-mono text-mutedText space-y-3">
          <History className="w-8 h-8 text-mutedText mx-auto" />
          <p>No escrow records associated with this address under filter [{roleFilter}].</p>
        </div>
      ) : (
        <div className="bg-surface border border-borderLine rounded-sm overflow-hidden">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-surfaceDark/60 border-b border-borderLine text-[10px] uppercase text-mutedText">
                <th className="p-4">Escrow ID</th>
                <th className="p-4">Role</th>
                <th className="p-4">Project / Registry</th>
                <th className="p-4">Volume</th>
                <th className="p-4">Value</th>
                <th className="p-4">Lifecycle State</th>
                <th className="p-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLine/60">
              {myEscrows.map((e) => {
                const isBuyer = e.buyer?.toLowerCase() === account.toLowerCase();
                const badge = STATUS_LABELS[e.status] || { label: 'UNKNOWN', color: 'bg-surfaceDark' };
                const amountGen = (Number(e.amount_wei) / 1e18).toFixed(2);

                return (
                  <tr key={e.escrow_id} className="hover:bg-bgMain/60 transition-colors">
                    <td className="p-4 font-bold text-textMain">#{e.escrow_id}</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold ${isBuyer ? 'bg-orangeSoft/30 text-orangeAccent' : 'bg-blueNeutral/20 text-blueNeutral'}`}>
                        {isBuyer ? 'BUYER' : 'SUPPLIER'}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-textMain">{e.project_name}</div>
                      <div className="text-[10px] text-mutedText">{e.registry} • {e.required_vintage}</div>
                    </td>
                    <td className="p-4">{e.required_volume} {e.required_unit}</td>
                    <td className="p-4 font-bold text-textMain">{amountGen} GEN</td>
                    <td className="p-4">
                      <span className={`px-2 py-0.5 rounded-xs text-[10px] font-bold ${badge.color}`}>
                        {badge.label}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedEscrowId(e.escrow_id);
                          setActiveRoute(`/escrow/${e.escrow_id}`);
                        }}
                        className="p-1.5 bg-bgMain hover:bg-surfaceDark border border-borderLine rounded-xs text-textMain inline-flex items-center space-x-1"
                      >
                        <span>Inspect</span>
                        <ArrowUpRight className="w-3 h-3 text-orangeAccent" />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
