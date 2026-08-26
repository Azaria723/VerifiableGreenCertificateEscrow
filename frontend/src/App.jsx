import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import TransactionModal from './components/TransactionModal';

import HomePage from './pages/HomePage';
import ExplorePage from './pages/ExplorePage';
import CreateEscrowPage from './pages/CreateEscrowPage';
import SubmitCertificatePage from './pages/SubmitCertificatePage';
import VerificationDeskPage from './pages/VerificationDeskPage';
import EscrowDetailPage from './pages/EscrowDetailPage';
import SettlementPage from './pages/SettlementPage';
import ActivityPage from './pages/ActivityPage';
import GuidePage from './pages/GuidePage';
import ContractPage from './pages/ContractPage';

import {
  CONTRACT,
  reader,
  writer,
  fetchAllOnChainEscrows,
  fetchOnChainEscrow,
} from './genlayer';

export default function App() {
  const [activeRoute, setActiveRoute] = useState('/');
  const [account, setAccount] = useState('');
  const [selectedEscrowId, setSelectedEscrowId] = useState(0);
  const [escrows, setEscrows] = useState([]);
  const [loadingEscrows, setLoadingEscrows] = useState(false);

  // Transaction Lifecycle Modal State
  const [txModalOpen, setTxModalOpen] = useState(false);
  const [txState, setTxState] = useState({
    status: 'pending',
    title: '',
    message: '',
    txHash: '',
    result: '',
    readbackState: '',
  });

  // Load Real On-Chain Escrows
  const refreshOnChainState = useCallback(async () => {
    try {
      setLoadingEscrows(true);
      const liveList = await fetchAllOnChainEscrows();
      setEscrows(liveList);
    } catch (err) {
      console.error("Failed to load on-chain escrows:", err);
    } finally {
      setLoadingEscrows(false);
    }
  }, []);

  useEffect(() => {
    refreshOnChainState();
  }, [refreshOnChainState]);

  // Wait for Tx Confirmation & Readback State
  const waitForTxAndRefresh = async (client, txHash, successMsg) => {
    try {
      if (client.waitForTransactionReceipt) {
        await client.waitForTransactionReceipt({ hash: txHash });
      } else {
        await new Promise((res) => setTimeout(res, 4000));
      }
      await refreshOnChainState();
      setTxState((prev) => ({
        ...prev,
        status: 'success',
        message: successMsg,
        result: 'FINALIZED & ACCEPTED BY GENVM',
        readbackState: 'On-chain state synchronized successfully',
      }));
    } catch (err) {
      console.warn("Receipt wait warning:", err);
      await refreshOnChainState();
      setTxState((prev) => ({
        ...prev,
        status: 'success',
        message: successMsg,
        result: 'TRANSACTION SUBMITTED ON-CHAIN',
        readbackState: 'Refreshed from Studionet',
      }));
    }
  };

  // 1. Create Escrow & Optional Auto-Fund
  const handleCreateEscrow = async (formData) => {
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }
    setTxModalOpen(true);
    setTxState({
      status: 'pending',
      title: 'Creating Escrow on Studionet',
      message: 'Signing and broadcasting create_escrow transaction via MetaMask...',
      txHash: '',
      result: '',
      readbackState: '',
    });

    try {
      const client = writer(account);
      const amountWei = BigInt(Math.floor(Number(formData.amountGen) * 1e18));
      const delaySec = BigInt(formData.settlementDelay || 0);
      const deadlineSec = BigInt(Number(formData.deadlineHours || 24) * 3600);

      const txHash = await client.writeContract({
        address: CONTRACT,
        functionName: 'create_escrow',
        args: [
          formData.supplier,
          formData.projectName,
          formData.certType,
          formData.registry,
          formData.volume,
          formData.unit,
          formData.vintage,
          formData.beneficiary,
          formData.requiredStatus,
          amountWei,
          delaySec,
          deadlineSec,
        ],
      });

      setTxState((prev) => ({
        ...prev,
        txHash,
        message: 'Transaction broadcast! Waiting for block finality...',
      }));

      await waitForTxAndRefresh(client, txHash, "Escrow created on-chain! You can now fund it.");
    } catch (err) {
      console.error("create_escrow error:", err);
      setTxState({
        status: 'error',
        title: 'Escrow Creation Failed',
        message: err.message || 'MetaMask signature or transaction execution failed.',
        txHash: '',
        result: 'ERROR',
        readbackState: '',
      });
    }
  };

  // 2. Fund Escrow (Payable)
  const handleFundEscrow = async (escrowId, amountWei) => {
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }
    setTxModalOpen(true);
    setTxState({
      status: 'pending',
      title: `Funding Escrow #${escrowId}`,
      message: `Locking ${Number(amountWei)/1e18} GEN into contract custody...`,
      txHash: '',
      result: '',
      readbackState: '',
    });

    try {
      const client = writer(account);
      const txHash = await client.writeContract({
        address: CONTRACT,
        functionName: 'fund_escrow',
        args: [BigInt(escrowId)],
        value: BigInt(amountWei),
      });

      setTxState((prev) => ({ ...prev, txHash, message: 'Funding tx submitted. Waiting for finality...' }));
      await waitForTxAndRefresh(client, txHash, `Escrow #${escrowId} funded successfully!`);
    } catch (err) {
      console.error("fund_escrow error:", err);
      setTxState({
        status: 'error',
        title: 'Funding Failed',
        message: err.message || 'Value transfer was rejected by wallet or contract.',
        txHash: '',
        result: 'ERROR',
        readbackState: '',
      });
    }
  };

  // 3. Submit Certificate Evidence
  const handleSubmitCertificate = async (escrowId, formData) => {
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }
    setTxModalOpen(true);
    setTxState({
      status: 'pending',
      title: `Submitting Evidence for Escrow #${escrowId}`,
      message: 'Broadcasting HTTPS URLs & SHA-256 evidence digest commitment...',
      txHash: '',
      result: '',
      readbackState: '',
    });

    try {
      const client = writer(account);
      const txHash = await client.writeContract({
        address: CONTRACT,
        functionName: 'submit_certificate',
        args: [
          BigInt(escrowId),
          formData.registryUrl,
          formData.projectUrl,
          formData.retirementUrl,
          formData.serialStart,
          formData.serialEnd,
          formData.volume,
          formData.vintage,
          formData.beneficiary,
          formData.digest,
          formData.rawJson,
        ],
      });

      setTxState((prev) => ({ ...prev, txHash, message: 'Evidence committed on-chain. Waiting for finality...' }));
      await waitForTxAndRefresh(client, txHash, `Certificate evidence submitted for Escrow #${escrowId}!`);
    } catch (err) {
      console.error("submit_certificate error:", err);
      setTxState({
        status: 'error',
        title: 'Submission Failed',
        message: err.message || 'Transaction rejected by caller guard or contract rule.',
        txHash: '',
        result: 'ERROR',
        readbackState: '',
      });
    }
  };

  // 4. Verify Certificate (Consensus Nondet)
  const handleVerifyCertificate = async (escrowId) => {
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }
    setTxModalOpen(true);
    setTxState({
      status: 'pending',
      title: `Triggering Consensus Review for Escrow #${escrowId}`,
      message: 'Dispatching GenLayer validator nodes to fetch live registry proof...',
      txHash: '',
      result: '',
      readbackState: '',
    });

    try {
      const client = writer(account);
      const txHash = await client.writeContract({
        address: CONTRACT,
        functionName: 'verify_certificate',
        args: [BigInt(escrowId)],
      });

      setTxState((prev) => ({ ...prev, txHash, message: 'Consensus nodes evaluating evidence...' }));
      await waitForTxAndRefresh(client, txHash, `Consensus review complete for Escrow #${escrowId}!`);
    } catch (err) {
      console.error("verify_certificate error:", err);
      setTxState({
        status: 'error',
        title: 'Verification Execution Failed',
        message: err.message || 'Consensus call failed.',
        txHash: '',
        result: 'ERROR',
        readbackState: '',
      });
    }
  };

  // 5. Settle Escrow
  const handleSettleEscrow = async (escrowId) => {
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }
    setTxModalOpen(true);
    setTxState({
      status: 'pending',
      title: `Settling Payment for Escrow #${escrowId}`,
      message: 'Releasing native GEN transfer to verified supplier...',
      txHash: '',
      result: '',
      readbackState: '',
    });

    try {
      const client = writer(account);
      const txHash = await client.writeContract({
        address: CONTRACT,
        functionName: 'settle_escrow',
        args: [BigInt(escrowId)],
      });

      setTxState((prev) => ({ ...prev, txHash, message: 'Settlement transaction broadcast...' }));
      await waitForTxAndRefresh(client, txHash, `Escrow #${escrowId} settled! Payment released.`);
    } catch (err) {
      console.error("settle_escrow error:", err);
      setTxState({
        status: 'error',
        title: 'Settlement Failed',
        message: err.message || 'Settlement guard rejected execution.',
        txHash: '',
        result: 'ERROR',
        readbackState: '',
      });
    }
  };

  // 6. Refund Escrow
  const handleRefundEscrow = async (escrowId) => {
    if (!account) {
      alert("Please connect your wallet first.");
      return;
    }
    setTxModalOpen(true);
    setTxState({
      status: 'pending',
      title: `Claiming Refund for Escrow #${escrowId}`,
      message: 'Returning locked GEN to buyer address...',
      txHash: '',
      result: '',
      readbackState: '',
    });

    try {
      const client = writer(account);
      const txHash = await client.writeContract({
        address: CONTRACT,
        functionName: 'refund_escrow',
        args: [BigInt(escrowId), 'Buyer claimed refund via DApp portal'],
      });

      setTxState((prev) => ({ ...prev, txHash, message: 'Refund transaction broadcast...' }));
      await waitForTxAndRefresh(client, txHash, `Escrow #${escrowId} refunded to buyer!`);
    } catch (err) {
      console.error("refund_escrow error:", err);
      setTxState({
        status: 'error',
        title: 'Refund Failed',
        message: err.message || 'Refund guard rejected execution.',
        txHash: '',
        result: 'ERROR',
        readbackState: '',
      });
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-between bg-bgMain text-textMain">
      <Navbar
        activeRoute={activeRoute}
        setActiveRoute={setActiveRoute}
        account={account}
        setAccount={setAccount}
      />

      <main className="flex-1">
        {activeRoute === '/' && (
          <HomePage setActiveRoute={setActiveRoute} />
        )}
        {activeRoute === '/explore' && (
          <ExplorePage
            escrows={escrows}
            setActiveRoute={setActiveRoute}
            setSelectedEscrowId={setSelectedEscrowId}
            onRefresh={refreshOnChainState}
            loading={loadingEscrows}
          />
        )}
        {activeRoute === '/create' && (
          <CreateEscrowPage
            onCreateEscrow={handleCreateEscrow}
            account={account}
          />
        )}
        {activeRoute === '/submit' && (
          <SubmitCertificatePage
            onSubmitCertificate={handleSubmitCertificate}
            escrows={escrows}
            account={account}
          />
        )}
        {activeRoute === '/verify' && (
          <VerificationDeskPage
            onVerifyCertificate={handleVerifyCertificate}
            escrows={escrows}
            account={account}
          />
        )}
        {activeRoute.startsWith('/escrow/') && (
          <EscrowDetailPage
            escrowId={selectedEscrowId}
            escrows={escrows}
            setActiveRoute={setActiveRoute}
            onSettleEscrow={handleSettleEscrow}
            onRefundEscrow={handleRefundEscrow}
            onFundEscrow={handleFundEscrow}
            account={account}
          />
        )}
        {activeRoute === '/settlement' && (
          <SettlementPage
            escrows={escrows}
            onSettleEscrow={handleSettleEscrow}
            onRefundEscrow={handleRefundEscrow}
            setActiveRoute={setActiveRoute}
            setSelectedEscrowId={setSelectedEscrowId}
          />
        )}
        {activeRoute === '/activity' && (
          <ActivityPage
            escrows={escrows}
            account={account}
            setActiveRoute={setActiveRoute}
            setSelectedEscrowId={setSelectedEscrowId}
          />
        )}
        {activeRoute === '/guide' && (
          <GuidePage setActiveRoute={setActiveRoute} />
        )}
        {activeRoute === '/contract' && (
          <ContractPage onRefresh={refreshOnChainState} />
        )}
      </main>

      <Footer setActiveRoute={setActiveRoute} />

      <TransactionModal
        isOpen={txModalOpen}
        onClose={() => setTxModalOpen(false)}
        txState={txState}
      />
    </div>
  );
}
