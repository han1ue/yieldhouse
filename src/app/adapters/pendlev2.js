import {
  createWalletClient,
  createPublicClient,
  custom,
  extractChain,
  erc20Abi,
} from "viem";
import { mainnet, base, arbitrum, sepolia } from "viem/chains";
import { useWallets } from "@privy-io/react-auth";

const sdkServer = "https://api-v2.pendle.finance/sdk/api";

function getWalletClient(address, chainId, provider) {
  const chain = extractChain({
    chains: [mainnet, base, arbitrum, sepolia],
    id: chainId,
  });

  return createWalletClient({
    account: address,
    chain: chain,
    transport: custom(provider),
  });
}

export async function isDepositApproved(
  privyWallet,
  chainId,
  token,
  spender,
  amount
) {
  return true;
}

export async function approveDeposit(
  privyWallet,
  chainId,
  token,
  spender,
  amount
) {}

export async function deposit(privyWallet, chainId, contractAddress, amount) {
  const endpoint = "/v1/swapExactTokenForPt";

  console.log("amount", amount);

  const params = new URLSearchParams({
    chainId: chainId.toString(),
    receiverAddr: privyWallet.address,
    marketAddr: contractAddress,
    tokenInAddr: "0x0000000000000000000000000000000000000000", // Replace with actual token address if needed
    amountTokenIn: amount.toString(),
    slippage: "0.005", // 0.5% slippage
  });

  const url = sdkServer + endpoint + "?" + params.toString();

  try {
    const response = await fetch(url, {
      method: "GET", // Change to 'POST' if the API requires it
      headers: {
        "Content-Type": "application/json",
        // Add any other headers required by the API
      },
    });

    if (!response.ok) {
      throw new Error("Error:", response.statusText);
    }

    const data = await response.json();
    console.log("Data:", data);

    // Sign and broadcast the transaction
    const walletClient = getWalletClient(
      privyWallet.address,
      chainId,
      await privyWallet.getEthereumProvider()
    );
    const hash = await walletClient.sendTransaction({
      data: data.transaction.data,
      to: data.transaction.to,
    });

    console.log("hash", hash);

    return hash;
  } catch (error) {
    console.error("Error:", error);
  }
}

export async function depositable(privyWallet, chainId, token) {
  const provider = await privyWallet.getEthereumProvider();
  const publicClient = createPublicClient({
    chain: extractChain({
      chains: [mainnet, base, arbitrum, sepolia],
      id: chainId,
    }),
    transport: custom(provider),
  });

  console.log("token", token);

  const balance = await publicClient.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [privyWallet.address],
  });

  console.log("balance", balance);

  return balance;
}

export async function withdraw(privyWallet, chainId, contractAddress, amount) {
  // Check if we are past the market maturity date
  // If we are past the market maturity date, we withdraw the funds
  // If we are not past the market maturity date, we return an error
}

export async function withdrawable(
  privyWallet,
  chainId,
  contractAddress,
  amount
) {
  return "10";
}

export async function isWithdrawApproved(
  privyWallet,
  chainId,
  token,
  spender,
  amount
) {
  return true;
}

export async function approveWithdraw(
  privyWallet,
  chainId,
  token,
  spender,
  amount
) {}
