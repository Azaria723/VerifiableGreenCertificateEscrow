import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, Lock, ShieldCheck, AlertCircle } from 'lucide-react';

export default function CreateEscrowPage({ onCreateEscrow, account }) {
  const [step, setStep] = useState(1);

  // Form State
  const [formData, setFormData] = useState({
    supplier: '0x70997970C51812dc3A010C7d01b50e0d17dc79C8',
    projectName: 'Ninh Thuan Solar Farm 50MW',
    certType: 'I-REC',
    registry: 'I-REC_STANDARD',
    volume: '1000',
    unit: 'MWh',
    vintage: '2026',
    beneficiary: 'Acme Corp ESG Fund',
    requiredStatus: 'RETIRED',
    amountGen: '5.0',
    settlementDelay: '0',
    deadlineHours: '24',
    serialPrefix: 'IREC-2026-VN',
    registryUrl: 'https://registry.irec-standard.org',
  });

  const handleChange = (field, val) => {
    setFormData((prev) => ({ ...prev, [field]: val }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }
    onCreateEscrow(formData);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 md:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="border-b border-borderLine pb-6">
        <div className="font-mono text-xs text-orangeAccent uppercase tracking-widest font-semibold mb-1">
          Escrow Builder
        </div>
        <h1 className="font-editorial text-3xl md:text-5xl font-bold text-textMain">
          Create a Green Certificate Escrow
        </h1>
        <p className="text-sm text-mutedText mt-2">
          Lock funds into a self-enforcing escrow that releases payments only upon cryptographic proof of certificate retirement.
        </p>
      </div>

      {/* Stepper Progress */}
      <div className="grid grid-cols-3 gap-2 text-xs font-mono border-b border-borderLine pb-4">
        {[
          { num: 1, label: 'Deal Terms' },
          { num: 2, label: 'Evidence Spec' },
          { num: 3, label: 'Review & Lock' },
        ].map((s) => (
          <div
            key={s.num}
            className={`flex items-center space-x-2 py-2 px-3 rounded-xs transition-colors ${
              step === s.num
                ? 'bg-orangeAccent text-white font-semibold'
                : step > s.num
                ? 'bg-surfaceDark text-textMain'
                : 'bg-surface text-mutedText'
            }`}
          >
            <span className="w-5 h-5 rounded-full bg-black/20 flex items-center justify-center text-[10px]">
              {s.num}
            </span>
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* Form Container */}
      <form onSubmit={handleSubmit} className="bg-surface border border-borderLine p-8 rounded-sm space-y-6">
        {/* Step 1: Deal Terms */}
        {step === 1 && (
          <div className="space-y-5">
            <h3 className="font-editorial text-xl font-bold text-textMain border-b border-borderLine pb-2">
              Step 1: Core Transaction Terms
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-mutedText">Supplier Ethereum Address *</label>
                <input
                  type="text"
                  required
                  value={formData.supplier}
                  onChange={(e) => handleChange('supplier', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs font-mono"
                  placeholder="0x..."
                />
              </div>

              <div className="space-y-1">
                <label className="text-mutedText">Project Name *</label>
                <input
                  type="text"
                  required
                  value={formData.projectName}
                  onChange={(e) => handleChange('projectName', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs"
                  placeholder="e.g. Ninh Thuan Solar 50MW"
                />
              </div>

              <div className="space-y-1">
                <label className="text-mutedText">Certificate Standard / Type *</label>
                <select
                  value={formData.certType}
                  onChange={(e) => handleChange('certType', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs"
                >
                  <option value="I-REC">I-REC (Renewable Energy Certificate)</option>
                  <option value="VERRA">VERRA (VCS Carbon Offset)</option>
                  <option value="GOLD_STANDARD">Gold Standard</option>
                  <option value="GLOBAL_CARBON_COUNCIL">Global Carbon Council</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-mutedText">Authoritative Registry *</label>
                <select
                  value={formData.registry}
                  onChange={(e) => handleChange('registry', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs"
                >
                  <option value="I-REC_STANDARD">I-REC Standard</option>
                  <option value="VERRA_VCS">Verra VCS Registry</option>
                  <option value="GOLD_STANDARD">Gold Standard Impact Registry</option>
                  <option value="REDEX_REGISTRY">REDEX Registry</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-mutedText">Required Generation Volume *</label>
                <input
                  type="text"
                  required
                  value={formData.volume}
                  onChange={(e) => handleChange('volume', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs"
                  placeholder="1000"
                />
              </div>

              <div className="space-y-1">
                <label className="text-mutedText">Measurement Unit *</label>
                <select
                  value={formData.unit}
                  onChange={(e) => handleChange('unit', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs"
                >
                  <option value="MWh">MWh (Megawatt hours)</option>
                  <option value="tCO2e">tCO2e (Metric tonnes CO2 equivalent)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-mutedText">Production Vintage Year *</label>
                <input
                  type="text"
                  required
                  value={formData.vintage}
                  onChange={(e) => handleChange('vintage', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs"
                  placeholder="2026"
                />
              </div>

              <div className="space-y-1">
                <label className="text-mutedText">Designated Beneficiary Name *</label>
                <input
                  type="text"
                  required
                  value={formData.beneficiary}
                  onChange={(e) => handleChange('beneficiary', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs"
                  placeholder="e.g. Acme Corp ESG Fund"
                />
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-2.5 bg-orangeAccent text-white text-xs font-mono font-medium rounded-sm flex items-center space-x-1.5"
              >
                <span>Continue to Evidence Requirements</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Evidence Spec */}
        {step === 2 && (
          <div className="space-y-5">
            <h3 className="font-editorial text-xl font-bold text-textMain border-b border-borderLine pb-2">
              Step 2: Evidence & Delivery Rules
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-mutedText">Required Final Status *</label>
                <select
                  value={formData.requiredStatus}
                  onChange={(e) => handleChange('requiredStatus', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs"
                >
                  <option value="RETIRED">RETIRED (Permanently taken out of circulation)</option>
                  <option value="CANCELLED">CANCELLED (Cancelled for compliance claim)</option>
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-mutedText">Escrow Payment Amount (GEN) *</label>
                <input
                  type="text"
                  required
                  value={formData.amountGen}
                  onChange={(e) => handleChange('amountGen', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs font-bold text-orangeAccent"
                  placeholder="5.0"
                />
              </div>

              <div className="space-y-1">
                <label className="text-mutedText">Expected Serial Prefix</label>
                <input
                  type="text"
                  value={formData.serialPrefix}
                  onChange={(e) => handleChange('serialPrefix', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs"
                  placeholder="IREC-2026-VN"
                />
              </div>

              <div className="space-y-1">
                <label className="text-mutedText">Max Delivery Deadline (Hours) *</label>
                <input
                  type="text"
                  required
                  value={formData.deadlineHours}
                  onChange={(e) => handleChange('deadlineHours', e.target.value)}
                  className="w-full p-2.5 bg-bgMain border border-borderLine rounded-xs focus:border-orangeAccent text-xs"
                  placeholder="24"
                />
              </div>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-5 py-2.5 bg-surfaceDark text-textMain text-xs font-mono rounded-sm flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                className="px-6 py-2.5 bg-orangeAccent text-white text-xs font-mono font-medium rounded-sm flex items-center space-x-1.5"
              >
                <span>Review Deal Summary</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Review & Lock */}
        {step === 3 && (
          <div className="space-y-6">
            <h3 className="font-editorial text-xl font-bold text-textMain border-b border-borderLine pb-2">
              Step 3: Review Terms and Lock Escrow
            </h3>

            <div className="bg-bgMain p-6 rounded-sm border border-borderLine space-y-4 font-mono text-xs">
              <div className="grid grid-cols-2 gap-3 border-b border-borderLine pb-3">
                <div>
                  <span className="text-mutedText uppercase text-[10px]">Buyer (You):</span>
                  <div className="font-semibold text-textMain">{account ? `${account.slice(0, 10)}...${account.slice(-8)}` : "Not connected"}</div>
                </div>
                <div>
                  <span className="text-mutedText uppercase text-[10px]">Supplier Recipient:</span>
                  <div className="font-semibold text-textMain">{formData.supplier.slice(0, 10)}...{formData.supplier.slice(-8)}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 border-b border-borderLine pb-3">
                <div>
                  <span className="text-mutedText uppercase text-[10px]">Project:</span>
                  <div className="font-semibold text-textMain">{formData.projectName}</div>
                </div>
                <div>
                  <span className="text-mutedText uppercase text-[10px]">Registry:</span>
                  <div className="font-semibold text-textMain">{formData.registry}</div>
                </div>
                <div>
                  <span className="text-mutedText uppercase text-[10px]">Volume:</span>
                  <div className="font-semibold text-textMain">{formData.volume} {formData.unit}</div>
                </div>
                <div>
                  <span className="text-mutedText uppercase text-[10px]">Vintage:</span>
                  <div className="font-semibold text-textMain">{formData.vintage}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-mutedText uppercase text-[10px]">Required Status:</span>
                  <div className="font-bold text-greenStatus">{formData.requiredStatus} for {formData.beneficiary}</div>
                </div>
                <div>
                  <span className="text-mutedText uppercase text-[10px]">Escrowed Value:</span>
                  <div className="font-bold text-orangeAccent text-sm">{formData.amountGen} GEN</div>
                </div>
              </div>
            </div>

            <div className="bg-surfaceDark p-4 rounded-sm border border-borderLine text-xs space-y-2">
              <div className="flex items-center space-x-2 text-textMain font-bold">
                <AlertCircle className="w-4 h-4 text-orangeAccent" />
                <span>Binding Escrow Protocol Rule</span>
              </div>
              <p className="text-mutedText leading-relaxed text-[11px]">
                Funds are locked before certificate verification. Settlement will occur only after GenLayer consensus confirms the certificate has been retired according to the terms above. Refund is guaranteed if requirements are not met.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-5 py-2.5 bg-surfaceDark text-textMain text-xs font-mono rounded-sm flex items-center space-x-1.5"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="px-8 py-3.5 bg-orangeAccent hover:bg-orangeAccent/90 text-white text-sm font-medium rounded-sm flex items-center space-x-2 shadow-sm"
              >
                <Lock className="w-4 h-4" />
                <span>Create Escrow & Lock {formData.amountGen} GEN</span>
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
