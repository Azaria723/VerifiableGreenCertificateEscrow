import React from 'react';
import { ArrowRight, CheckCircle2, ShieldAlert, Sparkles, FileSearch, Lock, CheckCheck, RefreshCw } from 'lucide-react';

export default function HomePage({ setActiveRoute }) {
  return (
    <div className="space-y-24 py-12">
      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        <div className="lg:col-span-8 space-y-6">
          <div className="inline-flex items-center space-x-2 px-3 py-1 bg-surfaceDark text-mutedText text-xs font-mono uppercase tracking-widest rounded-xs border border-borderLine">
            <Sparkles className="w-3.5 h-3.5 text-orangeAccent" />
            <span>Intelligent Escrow on GenLayer</span>
          </div>

          <h1 className="font-editorial text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-textMain leading-[1.08]">
            Green claims deserve <br />
            <span className="italic font-normal text-orangeAccent">verifiable</span> settlement.
          </h1>

          <p className="text-lg md:text-xl text-mutedText max-w-2xl font-light leading-relaxed">
            An evidence-bound escrow for renewable energy and carbon certificates. Buyers lock native GEN, validators verify live registry evidence on-chain, and funds disburse only when retirement is proved.
          </p>

          <div className="pt-4 flex flex-wrap items-center gap-4">
            <button
              onClick={() => setActiveRoute('/create')}
              className="px-6 py-3.5 bg-orangeAccent hover:bg-orangeAccent/90 text-white rounded-sm font-medium text-sm transition-all shadow-sm flex items-center space-x-2"
            >
              <span>Create an escrow deal</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => setActiveRoute('/explore')}
              className="px-6 py-3.5 bg-surface hover:bg-surfaceDark text-textMain border border-borderLine rounded-sm font-medium text-sm transition-all"
            >
              Browse verified claims
            </button>
          </div>
        </div>

        {/* Right Info Pillar */}
        <div className="lg:col-span-4 bg-surface border border-borderLine p-8 rounded-sm space-y-6 shadow-xs">
          <div className="font-mono text-xs uppercase tracking-widest text-mutedText border-b border-borderLine pb-3">
            Core Protocol Pillars
          </div>
          <div className="space-y-4 font-mono text-sm">
            <div className="flex items-center space-x-3 p-3 bg-bgMain rounded-xs border border-borderLine/70">
              <span className="w-2 h-2 rounded-full bg-orangeAccent"></span>
              <span className="font-semibold">REGISTRY EVIDENCE</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-bgMain rounded-xs border border-borderLine/70">
              <span className="w-2 h-2 rounded-full bg-orangeAccent"></span>
              <span className="font-semibold">SERIAL CHECKS</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-bgMain rounded-xs border border-borderLine/70">
              <span className="w-2 h-2 rounded-full bg-greenStatus"></span>
              <span className="font-semibold">NO DOUBLE-CLAIM</span>
            </div>
            <div className="flex items-center space-x-3 p-3 bg-bgMain rounded-xs border border-borderLine/70">
              <span className="w-2 h-2 rounded-full bg-blueNeutral"></span>
              <span className="font-semibold">NATIVE GEN ESCROW</span>
            </div>
          </div>
          <p className="text-xs text-mutedText leading-relaxed">
            Eliminates greenwashing through deterministic checks and independent LLM consensus before settlement.
          </p>
        </div>
      </section>

      {/* How it Works Section */}
      <section className="max-w-7xl mx-auto px-4 md:px-8 space-y-10">
        <div className="border-b border-borderLine pb-4 flex justify-between items-end">
          <div>
            <div className="font-mono uppercase text-xs text-orangeAccent tracking-widest font-semibold mb-1">
              Workflow Lifecycle
            </div>
            <h2 className="font-editorial text-3xl md:text-4xl font-bold text-textMain">
              How the Escrow Operates
            </h2>
          </div>
          <span className="text-xs font-mono text-mutedText">4-Step Verification</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-surface p-6 rounded-sm border border-borderLine space-y-4">
            <div className="w-8 h-8 rounded-full bg-orangeAccent/20 text-orangeAccent flex items-center justify-center font-mono font-bold text-sm">
              01
            </div>
            <h3 className="font-editorial text-xl font-bold text-textMain">1. Lock Funds</h3>
            <p className="text-sm text-mutedText leading-relaxed">
              Buyer configures deal terms (registry, volume, vintage, beneficiary) and locks native GEN into the escrow vault.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-sm border border-borderLine space-y-4">
            <div className="w-8 h-8 rounded-full bg-orangeAccent/20 text-orangeAccent flex items-center justify-center font-mono font-bold text-sm">
              02
            </div>
            <h3 className="font-editorial text-xl font-bold text-textMain">2. Submit Certificate</h3>
            <p className="text-sm text-mutedText leading-relaxed">
              Supplier retires or cancels the certificate on the registry and submits the public HTTPS evidence packet with SHA-256 digest.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-sm border border-borderLine space-y-4">
            <div className="w-8 h-8 rounded-full bg-orangeAccent/20 text-orangeAccent flex items-center justify-center font-mono font-bold text-sm">
              03
            </div>
            <h3 className="font-editorial text-xl font-bold text-textMain">3. Verify Registry</h3>
            <p className="text-sm text-mutedText leading-relaxed">
              GenLayer validator nodes cross-check serials, retirement status, vintage, and double-claim identity against live registries.
            </p>
          </div>

          <div className="bg-surface p-6 rounded-sm border border-borderLine space-y-4">
            <div className="w-8 h-8 rounded-full bg-orangeAccent/20 text-orangeAccent flex items-center justify-center font-mono font-bold text-sm">
              04
            </div>
            <h3 className="font-editorial text-xl font-bold text-textMain">4. Settle or Refund</h3>
            <p className="text-sm text-mutedText leading-relaxed">
              If verified, payment is transferred to the supplier. If rejected, conflicted, or unavailable, full refund is guaranteed to buyer.
            </p>
          </div>
        </div>
      </section>

      {/* What Gets Checked Section */}
      <section className="bg-surface border-y border-borderLine py-16">
        <div className="max-w-7xl mx-auto px-4 md:px-8 space-y-12">
          <div className="max-w-2xl space-y-2">
            <div className="font-mono uppercase text-xs text-orangeAccent tracking-widest font-semibold">
              Consensus Guardrails
            </div>
            <h2 className="font-editorial text-3xl md:text-4xl font-bold text-textMain">
              What Gets Categorically Checked
            </h2>
            <p className="text-mutedText text-sm">
              No black-box decisions. Validators evaluate strict categorical dimensions before unlocking funds.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { title: "Registry Identity", desc: "Must match approved standards (I-REC, Verra VCS, Gold Standard)." },
              { title: "Serial Range", desc: "Exact contiguous serial numbering verified against registry records." },
              { title: "Retirement Status", desc: "Certificate must be marked RETIRED or CANCELLED, never ACTIVE." },
              { title: "Beneficiary Match", desc: "Matches exact buyer corporate entity or designated ESG fund." },
              { title: "Vintage & Volume", desc: "Exact production year and generation volume in MWh or tCO2e." },
              { title: "Double-Claim Risk", desc: "SHA-256 canonical identity checked across all historical escrows." },
              { title: "Digest Authenticity", desc: "Raw submitted evidence matches on-chain cryptographic commitment." },
              { title: "Source Freshness", desc: "Live registry endpoint fetched on-chain without centralized oracles." },
            ].map((item, idx) => (
              <div key={idx} className="bg-bgMain p-5 rounded-sm border border-borderLine space-y-2">
                <div className="flex items-center space-x-2 text-greenStatus text-xs font-mono font-semibold">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>CRITERION #{idx + 1}</span>
                </div>
                <h4 className="font-editorial text-lg font-bold text-textMain">{item.title}</h4>
                <p className="text-xs text-mutedText leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Protocol Position Section */}
      <section className="max-w-5xl mx-auto px-4 md:px-8">
        <div className="bg-surfaceDark p-8 md:p-12 rounded-sm border border-borderLine/80 space-y-4">
          <div className="flex items-center space-x-2 text-textMain font-mono text-xs uppercase tracking-wider font-semibold">
            <ShieldAlert className="w-4 h-4 text-orangeAccent" />
            <span>Protocol Position & Legal Stance</span>
          </div>
          <h3 className="font-editorial text-2xl md:text-3xl font-bold text-textMain">
            "This protocol does not replace an official registry or legal certification. It verifies evidence before escrow settlement."
          </h3>
          <p className="text-mutedText text-sm leading-relaxed">
            By embedding cryptographic proof and decentralized validator checking into the payment release rail, green certificate transactions are protected against fraud, misrepresentation, and greenwashing.
          </p>
        </div>
      </section>
    </div>
  );
}
