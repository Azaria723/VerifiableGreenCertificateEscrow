import React, { useState, useEffect } from 'react';
import { ExternalLink, Code2, ShieldCheck, Database, Layers, CheckCircle2, RefreshCw, Loader2 } from 'lucide-react';
import { CONTRACT, EXPLORER_ADDRESS_URL, fetchOnChainAccounting, fetchOnChainCounts } from '../genlayer';

export default function ContractPage({ onRefresh }) {
  const [accounting, setAccounting] = useState({
    total_escrowed_wei: '0',
    total_paid_wei: '0',
    total_refunded_wei: '0',
    active_locked_wei: '0',
  });

  const [counts, setCounts] = useState({
    escrow_count: 0,
    registry_allowlist_count: 0,
  });

  const [loading, setLoading] = useState(false);

  const loadStats = async () => {
    try {
      setLoading(true);
      const [acc, cnt] = await Promise.all([
        fetchOnChainAccounting(),
        fetchOnChainCounts(),
      ]);
      if (acc) setAccounting(acc);
      if (cnt) setCounts(cnt);
    } catch (err) {
      console.warn("Could not read contract live accounting", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  const publicMethods = [
    { name: "create_escrow", type: "WRITE", desc: "Instantiates a new certificate escrow with strict deal parameters." },
    { name: "fund_escrow", type: "PAYABLE WRITE", desc: "Locks native GEN funds into the contract custody vault." },
    { name: "submit_certificate", type: "WRITE", desc: "Supplier attaches public registry URL & SHA-256 evidence digest." },
    { name: "verify_certificate", type: "WRITE (NONDET)", desc: "Invokes GenLayer consensus nodes to verify live registry status." },
    { name: "settle_escrow", type: "WRITE", desc: "Releases native GEN payment to verified supplier & consumes identity." },
    { name: "refund_escrow", type: "WRITE", desc: "Returns locked GEN to buyer upon breach or expiration." },
    { name: "expire_escrow", type: "WRITE", desc: "Marks unfulfilled escrow as EXPIRED after deadline passes." },
    { name: "get_escrow", type: "VIEW", desc: "Returns full metadata record for a given Escrow ID." },
    { name: "get_certificate", type: "VIEW", desc: "Returns submitted evidence URLs, serials, and digests." },
    { name: "get_verification", type: "VIEW", desc: "Returns consensus diagnostics and categorical check results." },
    { name: "get_accounting", type: "VIEW", desc: "Returns macro balance conservation accounting totals." },
  ];

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 space-y-12">
      {/* Header */}
      <div className="border-b border-borderLine pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="font-mono text-xs text-orangeAccent uppercase tracking-widest font-semibold mb-1">
            Smart Contract Infrastructure
          </div>
          <h1 className="font-editorial text-3xl md:text-5xl font-bold text-textMain">
            On-Chain Protocol Architecture
          </h1>
          <p className="text-sm text-mutedText mt-2">
            Technical specifications, live accounting balances, and public interface of VerifiableGreenCertificateEscrow.
          </p>
        </div>

        <button
          onClick={loadStats}
          disabled={loading}
          className="px-3 py-1.5 bg-surface hover:bg-surfaceDark border border-borderLine rounded-xs font-mono text-xs text-textMain flex items-center space-x-1.5 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orangeAccent' : 'text-mutedText'}`} />
          <span>{loading ? 'Refreshing...' : 'Refresh On-Chain'}</span>
        </button>
      </div>

      {/* Network & Contract Pillar */}
      <div className="bg-surface border border-borderLine p-8 rounded-sm space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-borderLine pb-6">
          <div>
            <span className="font-mono text-[10px] uppercase text-mutedText font-semibold">Contract Deployment Address</span>
            <div className="font-mono text-sm sm:text-base font-bold text-textMain break-all">{CONTRACT}</div>
          </div>
          <a
            href={EXPLORER_ADDRESS_URL}
            target="_blank"
            rel="noreferrer"
            className="px-4 py-2 bg-bgMain hover:bg-surfaceDark text-textMain border border-borderLine rounded-sm text-xs font-mono font-medium inline-flex items-center space-x-1.5 transition-colors"
          >
            <span>Open on GenLayer Explorer</span>
            <ExternalLink className="w-3.5 h-3.5 text-orangeAccent" />
          </a>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
          <div>
            <span className="text-mutedText uppercase text-[10px]">Network:</span>
            <div className="font-bold text-textMain">GenLayer Studionet</div>
          </div>
          <div>
            <span className="text-mutedText uppercase text-[10px]">Chain ID:</span>
            <div className="font-bold text-textMain">61999 (0xF1EF)</div>
          </div>
          <div>
            <span className="text-mutedText uppercase text-[10px]">Bytecode Dialect:</span>
            <div className="font-bold text-textMain">GenVM Python (v0.2.16)</div>
          </div>
          <div>
            <span className="text-mutedText uppercase text-[10px]">Total Escrows Count:</span>
            <div className="font-bold text-orangeAccent">{counts.escrow_count} Deals</div>
          </div>
        </div>
      </div>

      {/* Macro Accounting Ledgers */}
      <div className="space-y-4">
        <h3 className="font-editorial text-2xl font-bold text-textMain">Macro Accounting & Solvency</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 font-mono">
          <div className="bg-surface p-6 rounded-sm border border-borderLine space-y-2">
            <span className="text-mutedText text-xs uppercase">Total Escrowed</span>
            <div className="text-2xl font-bold text-textMain">
              {(Number(accounting.total_escrowed_wei) / 1e18).toFixed(2)} GEN
            </div>
            <p className="text-[10px] text-mutedText">Cumulative deposits locked into custody</p>
          </div>

          <div className="bg-surface p-6 rounded-sm border border-borderLine space-y-2">
            <span className="text-mutedText text-xs uppercase">Total Disbursed (Paid)</span>
            <div className="text-2xl font-bold text-greenStatus">
              {(Number(accounting.total_paid_wei) / 1e18).toFixed(2)} GEN
            </div>
            <p className="text-[10px] text-mutedText">Released to verified green suppliers</p>
          </div>

          <div className="bg-surface p-6 rounded-sm border border-borderLine space-y-2">
            <span className="text-mutedText text-xs uppercase">Total Refunded</span>
            <div className="text-2xl font-bold text-redStatus">
              {(Number(accounting.total_refunded_wei) / 1e18).toFixed(2)} GEN
            </div>
            <p className="text-[10px] text-mutedText">Returned to buyers upon breach/timeout</p>
          </div>
        </div>
      </div>

      {/* Public Interface Table */}
      <div className="space-y-4">
        <h3 className="font-editorial text-2xl font-bold text-textMain">Public Contract Methods (ABI)</h3>
        <div className="bg-surface border border-borderLine rounded-sm overflow-hidden">
          <table className="w-full text-left border-collapse font-mono text-xs">
            <thead>
              <tr className="bg-surfaceDark/60 border-b border-borderLine text-[10px] uppercase text-mutedText">
                <th className="p-4">Method Name</th>
                <th className="p-4">Execution Type</th>
                <th className="p-4">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-borderLine/60">
              {publicMethods.map((m, idx) => (
                <tr key={idx} className="hover:bg-bgMain/60 transition-colors">
                  <td className="p-4 font-bold text-textMain">{m.name}()</td>
                  <td className="p-4">
                    <span className={`px-2 py-0.5 rounded-xs text-[10px] font-semibold ${m.type.includes('WRITE') ? 'bg-orangeSoft/30 text-orangeAccent' : 'bg-surfaceDark text-mutedText'}`}>
                      {m.type}
                    </span>
                  </td>
                  <td className="p-4 text-mutedText">{m.desc}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
