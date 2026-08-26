import React, { useState, useEffect } from 'react';
import { UploadCloud, CheckCircle2, XCircle, AlertCircle, FileText, Sparkles } from 'lucide-react';

export default function SubmitCertificatePage({ onSubmitCertificate, escrows, account }) {
  const [escrowId, setEscrowId] = useState('0');
  const [formData, setFormData] = useState({
    registryUrl: 'https://registry.irec-standard.org/certificates/IREC-2026-VN-SOLAR-0019283',
    projectUrl: 'https://registry.irec-standard.org/projects/ninh-thuan-solar-50mw',
    retirementUrl: 'https://registry.irec-standard.org/certificates/IREC-2026-VN-SOLAR-0019283',
    serialStart: 'IREC-2026-VN-0001000',
    serialEnd: 'IREC-2026-VN-0002000',
    volume: '1000',
    vintage: '2026',
    beneficiary: 'Acme Corp ESG Fund',
    rawJson: JSON.stringify({
      registry: "I-REC_STANDARD",
      serial_start: "IREC-2026-VN-0001000",
      serial_end: "IREC-2026-VN-0002000",
      volume: "1000",
      vintage: "2026",
      beneficiary: "Acme Corp ESG Fund",
      status: "RETIRED",
      double_claim_risk: "NONE"
    }, null, 2),
    digest: '',
  });

  // Calculate SHA-256 digest dynamically
  useEffect(() => {
    async function updateDigest() {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(formData.rawJson);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
        setFormData(prev => ({ ...prev, digest: hashHex }));
      } catch (err) {
        console.error("Digest computation failed", err);
      }
    }
    updateDigest();
  }, [formData.rawJson]);

  const handleChange = (field, val) => {
    setFormData(prev => ({ ...prev, [field]: val }));
  };

  // Real-time Checklist Checks
  const checks = {
    httpsUrls: formData.registryUrl.startsWith('https://') && formData.retirementUrl.startsWith('https://'),
    serialValid: formData.serialStart.length > 0 && formData.serialEnd.length > 0,
    digestValid: formData.digest.length === 64,
    jsonValid: (() => {
      try { JSON.parse(formData.rawJson); return true; } catch { return false; }
    })(),
    volumeValid: Number(formData.volume) > 0,
  };

  const allChecksPass = Object.values(checks).every(Boolean);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }
    if (!allChecksPass) {
      alert("Please ensure all deterministic validation checks pass before submitting.");
      return;
    }
    onSubmitCertificate(Number(escrowId), formData);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 md:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-borderLine pb-6">
        <div className="font-mono text-xs text-orangeAccent uppercase tracking-widest font-semibold mb-1">
          Supplier Delivery Portal
        </div>
        <h1 className="font-editorial text-3xl md:text-5xl font-bold text-textMain">
          Submit Registry Evidence
        </h1>
        <p className="text-sm text-mutedText mt-2">
          Attach verifiable public retirement evidence to unlock payment release upon consensus approval.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Form */}
        <form onSubmit={handleSubmit} className="lg:col-span-8 bg-surface border border-borderLine p-8 rounded-sm space-y-6">
          <div className="space-y-4">
            <h3 className="font-editorial text-xl font-bold text-textMain border-b border-borderLine pb-2">
              Certificate Delivery Data
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1 md:col-span-2">
                <label className="text-mutedText">Select Target Escrow ID *</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={escrowId}
                  onChange={(e) => setEscrowId(e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs font-bold font-mono"
                  placeholder="0"
                />
              </div>

              <div className="space-y-1">
                <label className="text-mutedText">Serial Number Start *</label>
                <input
                  type="text"
                  required
                  value={formData.serialStart}
                  onChange={(e) => handleChange('serialStart', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs font-mono"
                  placeholder="IREC-2026-VN-0001000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-mutedText">Serial Number End *</label>
                <input
                  type="text"
                  required
                  value={formData.serialEnd}
                  onChange={(e) => handleChange('serialEnd', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs font-mono"
                  placeholder="IREC-2026-VN-0002000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-mutedText">Volume (MWh / tCO2e) *</label>
                <input
                  type="text"
                  required
                  value={formData.volume}
                  onChange={(e) => handleChange('volume', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs font-mono"
                  placeholder="1000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-mutedText">Vintage Year *</label>
                <input
                  type="text"
                  required
                  value={formData.vintage}
                  onChange={(e) => handleChange('vintage', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs font-mono"
                  placeholder="2026"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-mutedText">Beneficiary Recorded in Registry *</label>
                <input
                  type="text"
                  required
                  value={formData.beneficiary}
                  onChange={(e) => handleChange('beneficiary', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs"
                  placeholder="Acme Corp ESG Fund"
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-mutedText">Authoritative Registry URL (HTTPS) *</label>
                <input
                  type="url"
                  required
                  value={formData.registryUrl}
                  onChange={(e) => handleChange('registryUrl', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs font-mono"
                  placeholder="https://..."
                />
              </div>

              <div className="space-y-1 md:col-span-2">
                <label className="text-mutedText">Public Retirement/Cancellation Proof URL (HTTPS) *</label>
                <input
                  type="url"
                  required
                  value={formData.retirementUrl}
                  onChange={(e) => handleChange('retirementUrl', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs font-mono"
                  placeholder="https://..."
                />
              </div>
            </div>

            {/* Raw JSON Payload */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-mono text-mutedText flex justify-between">
                <span>Raw Evidence JSON (Will be hashed on-chain)</span>
                <span className="font-bold text-orangeAccent">SHA-256 Digest Linked</span>
              </label>
              <textarea
                rows={6}
                value={formData.rawJson}
                onChange={(e) => handleChange('rawJson', e.target.value)}
                className="w-full p-3 bg-bgMain border border-borderLine rounded-xs font-mono text-[11px] focus:border-orangeAccent focus:outline-none"
              />
            </div>

            {/* Digest Output */}
            <div className="p-3 bg-bgMain border border-borderLine rounded-xs font-mono text-xs space-y-1">
              <div className="text-[10px] text-mutedText uppercase">Calculated SHA-256 Commitment:</div>
              <div className="text-orangeAccent font-bold break-all text-[11px]">{formData.digest}</div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={!allChecksPass}
              className={`px-8 py-3.5 rounded-sm text-xs font-mono font-bold flex items-center space-x-2 transition-all ${
                allChecksPass
                  ? 'bg-orangeAccent hover:bg-orangeAccent/90 text-white shadow-sm cursor-pointer'
                  : 'bg-surfaceDark text-mutedText cursor-not-allowed border border-borderLine'
              }`}
            >
              <UploadCloud className="w-4 h-4" />
              <span>Submit Certificate Evidence On-Chain</span>
            </button>
          </div>
        </form>

        {/* Real-time Validation Checklist */}
        <div className="lg:col-span-4 bg-surface border border-borderLine p-6 rounded-sm space-y-6">
          <div className="font-mono text-xs uppercase tracking-widest text-mutedText border-b border-borderLine pb-2">
            Realtime Pre-Flight Gate
          </div>

          <div className="space-y-3 font-mono text-xs">
            <div className="flex items-center justify-between p-2.5 bg-bgMain rounded-xs border border-borderLine">
              <span className="text-mutedText">HTTPS Protocol</span>
              {checks.httpsUrls ? (
                <CheckCircle2 className="w-4 h-4 text-greenStatus" />
              ) : (
                <XCircle className="w-4 h-4 text-redStatus" />
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 bg-bgMain rounded-xs border border-borderLine">
              <span className="text-mutedText">Serial Range Valid</span>
              {checks.serialValid ? (
                <CheckCircle2 className="w-4 h-4 text-greenStatus" />
              ) : (
                <XCircle className="w-4 h-4 text-redStatus" />
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 bg-bgMain rounded-xs border border-borderLine">
              <span className="text-mutedText">Valid JSON Schema</span>
              {checks.jsonValid ? (
                <CheckCircle2 className="w-4 h-4 text-greenStatus" />
              ) : (
                <XCircle className="w-4 h-4 text-redStatus" />
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 bg-bgMain rounded-xs border border-borderLine">
              <span className="text-mutedText">SHA-256 (64 hex)</span>
              {checks.digestValid ? (
                <CheckCircle2 className="w-4 h-4 text-greenStatus" />
              ) : (
                <XCircle className="w-4 h-4 text-redStatus" />
              )}
            </div>

            <div className="flex items-center justify-between p-2.5 bg-bgMain rounded-xs border border-borderLine">
              <span className="text-mutedText">Volume Positive</span>
              {checks.volumeValid ? (
                <CheckCircle2 className="w-4 h-4 text-greenStatus" />
              ) : (
                <XCircle className="w-4 h-4 text-redStatus" />
              )}
            </div>
          </div>

          <p className="text-[11px] text-mutedText leading-relaxed">
            Pre-flight checks prevent invalid submissions and wasted gas before invoking consensus nodes.
          </p>
        </div>
      </div>
    </div>
  );
}
