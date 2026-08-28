import { createClient } from "genlayer-js";
import { studionet } from "genlayer-js/chains";

const CONTRACT_ADDRESS = "0x2440A4742DEE0878c2AD6FaacaAE68E23063F4d6";

async function main() {
  console.log("=== Testing with genlayer-js on Studionet ===");
  console.log("Studionet chain info:", studionet);

  const client = createClient({ chain: studionet });

  try {
    const counts = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_counts",
      args: [],
    });
    console.log("get_counts result:", counts);
  } catch (err) {
    console.error("get_counts error:", err);
  }

  try {
    const accounting = await client.readContract({
      address: CONTRACT_ADDRESS,
      functionName: "get_accounting",
      args: [],
    });
    console.log("get_accounting result:", accounting);
  } catch (err) {
    console.error("get_accounting error:", err);
  }

  try {
    const schema = await client.getContractSchema(CONTRACT_ADDRESS);
    console.log("Contract schema loaded successfully:", Object.keys(schema || {}));
  } catch (err) {
    console.error("getContractSchema error:", err.message);
  }
}

main();
