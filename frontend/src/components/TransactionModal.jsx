import React from 'react';
import { Loader2, CheckCircle2, XCircle, ExternalLink, ArrowRight } from 'lucide-react';
import { EXPLORER_ADDRESS_URL } from '../genlayer';

export default function TransactionModal({ isOpen, onClose, txState }) {
  if (!isOpen) return null;

  const { status, title, message, txHash, result, readbackState } = txState;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-textMain/40 backdrop-blur-xs">
      <div className="bg-bgMain border border-borderLine rounded-sm max-w-lg w-full p-6 shadow-xl space-y-5">
        <div className="flex justify-between items-start border-b border-borderLine pb-3">
          <div className="font-editorial text-lg font-bold text-textMain">{title || "Transaction Execution"}</div>
          <button
            onClick={onClose}
            className="text-mutedText hover:text-textMain text-sm font-mono"
          >
            ✕
          </button>
        </div>

        <div className="space-y-4">
          {/* Status Indicator */}
          <div className="flex items-center space-x-3">
            {status === 'pending' && (
              <Loader2 className="w-6 h-6 text-orangeAccent animate-spin shrink-0" />
            )}
            {status === 'success' && (
              <CheckCircle2 className="w-6 h-6 text-greenStatus shrink-0" />
            )}
            {status === 'error' && (
              <XCircle className="w-6 h-6 text-redStatus shrink-0" />
            )}
            <div>
              <div className="text-sm font-medium text-textMain">{message}</div>
              {status === 'pending' && (
                <div className="text-xs text-mutedText mt-0.5 font-mono">
                  Optimistic democracy validators evaluating consensus...
                </div>
              )}
            </div>
          </div>

          {/* Transaction Metadata */}
          {txHash && (
            <div className="bg-surface p-3 rounded-sm border border-borderLine text-xs space-y-1.5 font-mono">
              <div className="flex justify-between text-mutedText">
                <span>Transaction Hash:</span>
                <a
                  href={`https://explorer-studio.genlayer.com/tx/${txHash}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-orangeAccent hover:underline inline-flex items-center space-x-1"
                >
                  <span>{txHash.slice(0, 12)}...{txHash.slice(-8)}</span>
                  <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </div>
              {result && (
                <div className="flex justify-between">
                  <span className="text-mutedText">GenVM Result:</span>
                  <span className="font-semibold text-textMain">{result}</span>
                </div>
              )}
              {readbackState && (
                <div className="flex justify-between">
                  <span className="text-mutedText">Post-State Readback:</span>
                  <span className="font-semibold text-greenStatus">{readbackState}</span>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="pt-2 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-surfaceDark hover:bg-surfaceDark/80 text-textMain rounded-sm text-xs font-mono font-medium transition-colors"
          >
            Close Window
          </button>
        </div>
      </div>
    </div>
  );
}
