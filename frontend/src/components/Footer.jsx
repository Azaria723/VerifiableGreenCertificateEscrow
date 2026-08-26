import React from 'react';
import { ExternalLink, ShieldCheck, Leaf } from 'lucide-react';
import { EXPLORER_ADDRESS_URL } from '../genlayer';

export default function Footer({ setActiveRoute }) {
  return (
    <footer className="border-t border-borderLine bg-surface mt-20 pt-12 pb-16 text-mutedText text-xs">
      <div className="max-w-7xl mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-textMain font-editorial font-bold text-lg">
            <Leaf className="w-4 h-4 text-orangeAccent" />
            <span>VerifiableGreenCertificateEscrow</span>
          </div>
          <p className="leading-relaxed">
            An evidence-bound settlement protocol on GenLayer ensuring green claims, serial numbers, and retirement states match public registries before releasing escrowed funds.
          </p>
        </div>

        <div>
          <h4 className="font-mono uppercase text-textMain font-semibold tracking-wider text-[11px] mb-3">
            Core Routes
          </h4>
          <ul className="space-y-2">
            <li><button onClick={() => setActiveRoute('/explore')} className="hover:text-orangeAccent transition-colors">Explore Escrows</button></li>
            <li><button onClick={() => setActiveRoute('/create')} className="hover:text-orangeAccent transition-colors">Create Escrow Deal</button></li>
            <li><button onClick={() => setActiveRoute('/submit')} className="hover:text-orangeAccent transition-colors">Submit Certificate Evidence</button></li>
            <li><button onClick={() => setActiveRoute('/verify')} className="hover:text-orangeAccent transition-colors">Verification Desk</button></li>
            <li><button onClick={() => setActiveRoute('/settlement')} className="hover:text-orangeAccent transition-colors">Settlement Portal</button></li>
          </ul>
        </div>

        <div>
          <h4 className="font-mono uppercase text-textMain font-semibold tracking-wider text-[11px] mb-3">
            Protocol & Docs
          </h4>
          <ul className="space-y-2">
            <li><button onClick={() => setActiveRoute('/guide')} className="hover:text-orangeAccent transition-colors">Anti-Greenwashing Guide</button></li>
            <li><button onClick={() => setActiveRoute('/contract')} className="hover:text-orangeAccent transition-colors">Contract Architecture</button></li>
            <li><a href={EXPLORER_ADDRESS_URL} target="_blank" rel="noreferrer" className="hover:text-orangeAccent inline-flex items-center space-x-1"><span>GenLayer Explorer</span><ExternalLink className="w-2.5 h-2.5" /></a></li>
            <li><a href="https://docs.genlayer.com" target="_blank" rel="noreferrer" className="hover:text-orangeAccent inline-flex items-center space-x-1"><span>GenLayer Documentation</span><ExternalLink className="w-2.5 h-2.5" /></a></li>
          </ul>
        </div>

        <div className="space-y-3">
          <div className="flex items-center space-x-2 text-textMain font-semibold text-xs">
            <ShieldCheck className="w-4 h-4 text-greenStatus" />
            <span>Protocol Position Disclaimer</span>
          </div>
          <p className="leading-relaxed text-[11px]">
            This escrow protocol does not claim to replace official statutory registries (I-REC, Verra, Gold Standard) or legal certification. It adjudicates evidence consistency prior to value transfer.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 mt-12 pt-6 border-t border-borderLine/60 flex flex-col md:flex-row justify-between items-center text-[11px] gap-4">
        <div>&copy; 2026 VerifiableGreenCertificateEscrow. Built for GenLayer Studionet.</div>
        <div className="font-mono text-[10px]">Optimistic Democracy • Subjective Consensus • Zero Centralized Oracle</div>
      </div>
    </footer>
  );
}
