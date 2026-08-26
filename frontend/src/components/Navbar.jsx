import React, { useState, useEffect } from 'react';
import { Leaf, ExternalLink, Wallet, CheckCircle2, ChevronRight } from 'lucide-react';
import { CONTRACT, EXPLORER_ADDRESS_URL } from '../genlayer';

export default function Navbar({ activeRoute, setActiveRoute, account, setAccount }) {
  const [connecting, setConnecting] = useState(false);

  const connectWallet = async () => {
    if (!window.ethereum) {
      alert("Please install MetaMask to interact with GenLayer Studionet.");
      return;
    }
    try {
      setConnecting(true);
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      if (accounts && accounts.length > 0) {
        setAccount(accounts[0]);
      }
    } catch (err) {
      console.error("Wallet connection error:", err);
    } finally {
      setConnecting(false);
    }
  };

  useEffect(() => {
    if (window.ethereum && window.ethereum.selectedAddress) {
      setAccount(window.ethereum.selectedAddress);
    }
  }, [setAccount]);

  const navLinks = [
    { id: 'home', label: 'Overview', route: '/' },
    { id: 'explore', label: 'Explore', route: '/explore' },
    { id: 'create', label: 'Create Escrow', route: '/create' },
    { id: 'submit', label: 'Submit Cert', route: '/submit' },
    { id: 'verify', label: 'Verification Desk', route: '/verify' },
    { id: 'settlement', label: 'Settlement', route: '/settlement' },
    { id: 'activity', label: 'My Activity', route: '/activity' },
    { id: 'guide', label: 'Protocol Guide', route: '/guide' },
    { id: 'contract', label: 'Contract', route: '/contract' },
  ];

  return (
    <header className="border-b border-borderLine bg-bgMain sticky top-0 z-40">
      {/* Top Banner */}
      <div className="bg-surfaceDark/60 text-xs text-mutedText py-1.5 px-4 md:px-8 flex justify-between items-center border-b border-borderLine/50">
        <div className="flex items-center space-x-2">
          <span className="inline-block w-2 h-2 rounded-full bg-greenStatus"></span>
          <span>GenLayer Studionet Active</span>
          <span className="text-borderLine">|</span>
          <span className="font-mono uppercase text-[10px]">Contract: {CONTRACT.slice(0, 10)}...{CONTRACT.slice(-6)}</span>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href={EXPLORER_ADDRESS_URL}
            target="_blank"
            rel="noreferrer"
            className="hover:text-orangeAccent flex items-center space-x-1 font-mono uppercase text-[10px] transition-colors"
          >
            <span>Explorer View</span>
            <ExternalLink className="w-2.5 h-2.5" />
          </a>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 py-4 flex flex-wrap justify-between items-center gap-4">
        {/* Brand */}
        <button
          onClick={() => setActiveRoute('/')}
          className="flex items-center space-x-3 text-left focus:outline-none group"
        >
          <div className="w-10 h-10 rounded-sm bg-orangeAccent text-white flex items-center justify-center shadow-sm">
            <Leaf className="w-5 h-5" />
          </div>
          <div>
            <div className="font-editorial text-xl font-bold tracking-tight text-textMain group-hover:text-orangeAccent transition-colors">
              VerifiableGreen
            </div>
            <div className="font-mono text-[9px] uppercase tracking-widest text-mutedText">
              Certificate Escrow
            </div>
          </div>
        </button>

        {/* Links */}
        <nav className="flex items-center space-x-1 md:space-x-4 overflow-x-auto py-1">
          {navLinks.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveRoute(item.route)}
              className={`text-xs md:text-sm font-medium px-2.5 py-1.5 rounded-sm transition-all whitespace-nowrap ${
                activeRoute === item.route
                  ? 'text-orangeAccent bg-surfaceDark font-semibold border-b-2 border-orangeAccent'
                  : 'text-mutedText hover:text-textMain hover:bg-surface'
              }`}
            >
              {item.label}
            </button>
          ))}
        </nav>

        {/* Action Controls */}
        <div className="flex items-center space-x-3">
          <a
            href={EXPLORER_ADDRESS_URL}
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-2 text-xs font-mono border border-borderLine rounded-sm hover:border-orangeAccent hover:text-orangeAccent bg-surface transition-all"
            title="Inspect contract on GenLayer Explorer"
          >
            <span>Contract</span>
            <ExternalLink className="w-3 h-3 text-mutedText" />
          </a>

          {account ? (
            <div className="flex items-center space-x-2 px-3 py-2 bg-surface rounded-sm border border-borderLine text-xs font-mono">
              <CheckCircle2 className="w-3.5 h-3.5 text-greenStatus" />
              <span>{account.slice(0, 6)}...{account.slice(-4)}</span>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              disabled={connecting}
              className="flex items-center space-x-2 px-4 py-2 bg-orangeAccent hover:bg-orangeAccent/90 text-white rounded-sm text-xs font-medium tracking-wide transition-all shadow-sm"
            >
              <Wallet className="w-3.5 h-3.5" />
              <span>{connecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
