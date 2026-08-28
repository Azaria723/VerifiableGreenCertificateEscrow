import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

export const chain = studionet;

export const CONTRACT =
  import.meta.env.VITE_CONTRACT_ADDRESS || "0x2440A4742DEE0878c2AD6FaacaAE68E23063F4d6";

export const configured = /^0x[a-fA-F0-9]{40}$/.test(CONTRACT);

export const EXPLORER_ADDRESS_URL = `https://explorer-studio.genlayer.com/address/${CONTRACT}`;

export const reader = () => {
  return createClient({ chain });
};

export const writer = (userAccount) => {
  const provider = window.ethereum;
  if (!provider) {
    throw new Error("MetaMask is not installed.");
  }
  return createClient({
    chain,
    provider,
    account: userAccount,
  });
};

export const STATUS_LABELS = {
  0: { label: "CREATED", color: "bg-surfaceDark text-textMain" },
  1: { label: "FUNDED", color: "bg-orangeSoft/30 text-orangeAccent border border-orangeAccent/30" },
  2: { label: "SUBMITTED", color: "bg-blueNeutral/20 text-blueNeutral border border-blueNeutral/30" },
  3: { label: "UNDER_REVIEW", color: "bg-orangeAccent text-white animate-pulse" },
  4: { label: "VERIFIED", color: "bg-greenStatus text-white font-semibold" },
  5: { label: "SETTLEABLE", color: "bg-greenStatus/20 text-greenStatus border border-greenStatus/30" },
  6: { label: "SETTLED", color: "bg-greenStatus text-white" },
  7: { label: "REJECTED", color: "bg-redStatus text-white" },
  8: { label: "REFUNDED", color: "bg-surfaceDark text-mutedText" },
  9: { label: "UNAVAILABLE", color: "bg-surfaceDark text-redStatus border border-redStatus/40" },
  10: { label: "CONFLICTED", color: "bg-redStatus text-white font-bold" },
  11: { label: "EXPIRED", color: "bg-surfaceDark text-mutedText" },
};

// ----------------------------------------------------------------------------
// Real On-Chain Read Methods
// ----------------------------------------------------------------------------

export async function fetchOnChainCounts() {
  const client = reader();
  const raw = await client.readContract({
    address: CONTRACT,
    functionName: "get_counts",
    args: [],
  });
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function fetchOnChainAccounting() {
  const client = reader();
  const raw = await client.readContract({
    address: CONTRACT,
    functionName: "get_accounting",
    args: [],
  });
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function fetchOnChainEscrow(escrowId) {
  const client = reader();
  const raw = await client.readContract({
    address: CONTRACT,
    functionName: "get_escrow",
    args: [BigInt(escrowId)],
  });
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function fetchOnChainCertificate(escrowId) {
  const client = reader();
  const raw = await client.readContract({
    address: CONTRACT,
    functionName: "get_certificate",
    args: [BigInt(escrowId)],
  });
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function fetchOnChainVerification(escrowId) {
  const client = reader();
  const raw = await client.readContract({
    address: CONTRACT,
    functionName: "get_verification",
    args: [BigInt(escrowId)],
  });
  return typeof raw === "string" ? JSON.parse(raw) : raw;
}

export async function fetchAllOnChainEscrows() {
  try {
    const counts = await fetchOnChainCounts();
    const total = counts.escrow_count || 0;
    if (total === 0) return [];

    const promises = [];
    for (let i = 0; i < total; i++) {
      promises.push(fetchOnChainEscrow(i));
    }
    const escrows = await Promise.all(promises);
    return escrows.filter((e) => e && e.project_name);
  } catch (err) {
    console.error("Error loading on-chain escrows:", err);
    return [];
  }
}
