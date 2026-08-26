import React, { useState } from 'react';
import { Search, Filter, ArrowUpRight, RefreshCw, Loader2, Plus } from 'lucide-react';
import { STATUS_LABELS } from '../genlayer';

export default function ExplorePage({ escrows, setActiveRoute, setSelectedEscrowId, onRefresh, loading }) {
  const [filterStatus, setFilterStatus] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const filterOptions = [
    'ALL',
    'FUNDED',
    'SUBMITTED',
    'UNDER_REVIEW',
    'VERIFIED',
    'SETTLED',
    'REJECTED',
    'REFUNDED',
  ];

  const filteredEscrows = (escrows || []).filter((item) => {
    const statusObj = STATUS_LABELS[item.status] || { label: 'UNKNOWN' };
    const matchesFilter = filterStatus === 'ALL' || statusObj.label === filterStatus;
    const matchesSearch =
      item.project_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.registry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.buyer?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.supplier?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      String(item.escrow_id) === searchQuery;
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8">
      {/* Header */}
      <div className="border-b border-borderLine pb-6 flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <div className="font-mono text-xs text-orangeAccent uppercase tracking-widest font-semibold mb-1">
            Live Settlement Registry
          </div>
          <h1 className="font-editorial text-3xl md:text-5xl font-bold text-textMain">
            Explore On-Chain Escrows
          </h1>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={onRefresh}
            disabled={loading}
            className="px-3 py-1.5 bg-surface hover:bg-surfaceDark border border-borderLine rounded-xs font-mono text-xs text-textMain flex items-center space-x-1.5 transition-colors cursor-pointer"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-orangeAccent' : 'text-mutedText'}`} />
            <span>{loading ? 'Refreshing...' : 'Refresh On-Chain'}</span>
          </button>
          <div className="font-mono text-xs text-mutedText">
            Total on-chain: <span className="font-bold text-textMain">{escrows?.length || 0}</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 bg-surface p-4 rounded-sm border border-borderLine">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-mutedText absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by project name, registry, address or Escrow ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 bg-bgMain border border-borderLine rounded-sm text-xs font-mono focus:outline-none focus:border-orangeAccent"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex items-center space-x-1.5 overflow-x-auto pb-1 md:pb-0">
          <Filter className="w-3.5 h-3.5 text-mutedText shrink-0 mr-1" />
          {filterOptions.map((opt) => (
            <button
              key={opt}
              onClick={() => setFilterStatus(opt)}
              className={`px-3 py-1.5 rounded-sm text-xs font-mono transition-all whitespace-nowrap ${
                filterStatus === opt
                  ? 'bg-orangeAccent text-white font-semibold shadow-xs'
                  : 'bg-bgMain text-mutedText hover:text-textMain border border-borderLine'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>

      {/* Loading state */}
      {loading && escrows.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-borderLine rounded-sm space-y-3">
          <Loader2 className="w-8 h-8 text-orangeAccent animate-spin mx-auto" />
          <div className="font-mono text-xs text-mutedText">Reading contract state from GenLayer Studionet RPC...</div>
        </div>
      ) : filteredEscrows.length === 0 ? (
        <div className="text-center py-20 bg-surface border border-borderLine rounded-sm space-y-4">
          <div className="font-editorial text-2xl text-textMain font-bold">No Escrows Found on Contract</div>
          <p className="text-sm text-mutedText max-w-md mx-auto">
            Contract <code>0x54B0...57d3</code> currently has 0 escrows or none matching your filter.
          </p>
          <button
            onClick={() => setActiveRoute('/create')}
            className="px-6 py-3 bg-orangeAccent hover:bg-orangeAccent/90 text-white rounded-sm text-xs font-mono font-bold inline-flex items-center space-x-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Create the First On-Chain Escrow Deal</span>
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEscrows.map((e) => {
            const badge = STATUS_LABELS[e.status] || { label: 'UNKNOWN', color: 'bg-surfaceDark' };
            const amountInGen = (Number(e.amount_wei) / 1e18).toFixed(2);

            return (
              <div
                key={e.escrow_id}
                className="bg-surface hover:bg-surface/80 border border-borderLine hover:border-orangeAccent/60 p-6 rounded-sm space-y-5 transition-all shadow-xs flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-mutedText font-semibold">ESCROW #{e.escrow_id}</span>
                    <span className={`px-2.5 py-0.5 rounded-xs text-[11px] font-semibold ${badge.color}`}>
                      {badge.label}
                    </span>
                  </div>

                  <h3 className="font-editorial text-xl font-bold text-textMain line-clamp-1">
                    {e.project_name || "Untitled Green Project"}
                  </h3>

                  <div className="grid grid-cols-2 gap-2 text-xs font-mono pt-1 border-t border-borderLine/60">
                    <div>
                      <div className="text-mutedText text-[10px] uppercase">Registry</div>
                      <div className="font-semibold text-textMain">{e.registry}</div>
                    </div>
                    <div>
                      <div className="text-mutedText text-[10px] uppercase">Volume</div>
                      <div className="font-semibold text-textMain">{e.required_volume} {e.required_unit}</div>
                    </div>
                    <div>
                      <div className="text-mutedText text-[10px] uppercase">Vintage</div>
                      <div className="font-semibold text-textMain">{e.required_vintage}</div>
                    </div>
                    <div>
                      <div className="text-mutedText text-[10px] uppercase">Required Status</div>
                      <div className="font-semibold text-orangeAccent">{e.required_status}</div>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-borderLine space-y-3">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs font-mono text-mutedText">Escrowed Value:</span>
                    <span className="font-mono text-base font-bold text-textMain">{amountInGen} GEN</span>
                  </div>

                  <button
                    onClick={() => {
                      setSelectedEscrowId(e.escrow_id);
                      setActiveRoute(`/escrow/${e.escrow_id}`);
                    }}
                    className="w-full py-2.5 bg-bgMain hover:bg-surfaceDark text-textMain border border-borderLine rounded-sm text-xs font-mono font-medium flex items-center justify-center space-x-1.5 transition-colors cursor-pointer"
                  >
                    <span>Inspect Full Evidence Dossier</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-orangeAccent" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
