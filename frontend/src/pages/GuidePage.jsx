import React from 'react';
import { ShieldCheck, Leaf, AlertTriangle, CheckCircle2, HelpCircle, FileText, ArrowRight } from 'lucide-react';

export default function GuidePage({ setActiveRoute }) {
  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 space-y-16">
      {/* Header */}
      <div className="border-b border-borderLine pb-6">
        <div className="font-mono text-xs text-orangeAccent uppercase tracking-widest font-semibold mb-1">
          Knowledge Base
        </div>
        <h1 className="font-editorial text-3xl md:text-5xl font-bold text-textMain">
          Protocol Architecture & Anti-Greenwashing Guide
        </h1>
        <p className="text-sm text-mutedText mt-2">
          An in-depth explanation of how GenLayer smart contracts safeguard renewable energy certificates and carbon credit transactions.
        </p>
      </div>

      {/* Section 1: The Problem */}
      <section className="space-y-4">
        <h2 className="font-editorial text-2xl md:text-3xl font-bold text-textMain">
          1. The Greenwashing & Double-Claim Challenge
        </h2>
        <p className="text-sm text-mutedText leading-relaxed">
          In voluntary carbon markets and renewable energy trading (I-REC, TIGR, GOs), corporate buyers frequently face settlement fraud:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 font-mono text-xs pt-2">
          <div className="p-4 bg-surface rounded-sm border border-borderLine space-y-2">
            <div className="font-bold text-redStatus">Double-Selling</div>
            <p className="text-mutedText">The same certificate serial range is sold to multiple corporate buyers simultaneously.</p>
          </div>
          <div className="p-4 bg-surface rounded-sm border border-borderLine space-y-2">
            <div className="font-bold text-redStatus">Unretired Claims</div>
            <p className="text-mutedText">Certificates remain active in a broker account rather than being retired for the buyer.</p>
          </div>
          <div className="p-4 bg-surface rounded-sm border border-borderLine space-y-2">
            <div className="font-bold text-redStatus">Beneficiary Mismatch</div>
            <p className="text-mutedText">The certificate is cancelled in the registry under an unrelated third-party name.</p>
          </div>
        </div>
      </section>

      {/* Section 2: Why GenLayer */}
      <section className="space-y-4">
        <h2 className="font-editorial text-2xl md:text-3xl font-bold text-textMain">
          2. Why GenLayer's Subjective Consensus is Necessary
        </h2>
        <p className="text-sm text-mutedText leading-relaxed">
          Traditional EVM smart contracts cannot read web pages or interpret registry documents without centralized oracle middle-men. GenLayer introduces <strong>Intelligent Contracts</strong>:
        </p>
        <ul className="space-y-3 font-mono text-xs text-textMain">
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-greenStatus shrink-0 mt-0.5" />
            <span><strong>Native Web Fetching:</strong> Validator nodes directly query authoritative registry endpoints over HTTPS.</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-greenStatus shrink-0 mt-0.5" />
            <span><strong>Semantic Document Verification:</strong> Validators extract serial ranges, dates, and beneficiary statements without API lock-in.</span>
          </li>
          <li className="flex items-start space-x-2">
            <CheckCircle2 className="w-4 h-4 text-greenStatus shrink-0 mt-0.5" />
            <span><strong>Equivalence Principle:</strong> Independent nodes execute the analysis in parallel; only matching categorical conclusions pass consensus.</span>
          </li>
        </ul>
      </section>

      {/* Section 3: Supported Registries */}
      <section className="space-y-4">
        <h2 className="font-editorial text-2xl md:text-3xl font-bold text-textMain">
          3. Supported Environmental Registries
        </h2>
        <div className="bg-surface p-6 rounded-sm border border-borderLine font-mono text-xs space-y-3">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-textMain font-semibold">
            <div className="p-3 bg-bgMain rounded-xs border border-borderLine text-center">I-REC Standard</div>
            <div className="p-3 bg-bgMain rounded-xs border border-borderLine text-center">Verra VCS</div>
            <div className="p-3 bg-bgMain rounded-xs border border-borderLine text-center">Gold Standard</div>
            <div className="p-3 bg-bgMain rounded-xs border border-borderLine text-center">REDEX / TIGR</div>
          </div>
          <p className="text-[11px] text-mutedText">
            Governance can register additional approved registries on-chain via the <code>set_registry_allowlist</code> method.
          </p>
        </div>
      </section>

      {/* Section 4: What the Protocol Cannot Guarantee */}
      <section className="bg-surfaceDark p-8 rounded-sm border border-borderLine space-y-4">
        <div className="flex items-center space-x-2 text-textMain font-bold font-mono text-xs uppercase">
          <AlertTriangle className="w-4 h-4 text-orangeAccent" />
          <span>Protocol Boundary & Non-Claims</span>
        </div>
        <p className="text-xs text-mutedText leading-relaxed">
          This decentralized escrow does not grant legal statutory title, nor does it conduct physical audits of solar farms or forestry projects. It acts strictly as an automated, tamper-proof payment settlement rail conditioned upon public registry evidence matching agreed transaction terms.
        </p>
      </section>

      {/* Action CTA */}
      <div className="pt-6 flex justify-center">
        <button
          onClick={() => setActiveRoute('/create')}
          className="px-8 py-3.5 bg-orangeAccent hover:bg-orangeAccent/90 text-white rounded-sm font-mono text-xs font-bold flex items-center space-x-2 shadow-sm"
        >
          <span>Create Your First Verified Escrow</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
