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
const apiServer = "https://api-v2.pendle.finance/core";
const pendleRouterV4 = "0x888888888889758F76e7103c6CbF23ABbF58F946";

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

function getPublicClient(chainId, provider) {
  const chain = extractChain({
    chains: [mainnet, base, arbitrum, sepolia],
    id: chainId,
  });

  return createPublicClient({
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
  const publicClient = getPublicClient(
    chainId,
    await privyWallet.getEthereumProvider()
  );

  const allowance = await publicClient.readContract({
    address: token,
    abi: erc20Abi,
    functionName: "allowance",
    args: [privyWallet.address, pendleRouterV4],
  });

  console.log("allowance", allowance);
  console.log("amount", amount);

  return allowance >= amount;
}

export async function approveDeposit(
  privyWallet,
  chainId,
  token,
  spender,
  amount
) {
  const walletClient = getWalletClient(
    privyWallet.address,
    chainId,
    await privyWallet.getEthereumProvider()
  );
  const publicClient = getPublicClient(
    chainId,
    await privyWallet.getEthereumProvider()
  );

  const { request } = await publicClient.simulateContract({
    account: privyWallet.address,
    address: token,
    abi: erc20Abi,
    functionName: "approve",
    args: [pendleRouterV4, amount],
  });
  const hash = await walletClient.writeContract(request);

  return hash;
}

export async function deposit(privyWallet, chainId, contractAddress, amount) {
  const swapEndpoint = "/v1/swapExactTokenForPt";
  const marketDetailsEndpoint =
    "/v1/" + chainId.toString() + "/markets/" + contractAddress;
  var tokenInAddr = "";

  try {
    const response = await fetch(apiServer + marketDetailsEndpoint, {
      method: "GET",
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

    tokenInAddr = data.underlyingAsset.address;
    console.log("tokenInAddr", tokenInAddr);
  } catch (error) {
    console.error("Error:", error);
    return;
  }

  const params = new URLSearchParams({
    chainId: chainId.toString(),
    receiverAddr: privyWallet.address,
    marketAddr: contractAddress,
    tokenInAddr: tokenInAddr, // Replace with actual token address if needed
    amountTokenIn: amount.toString(),
    slippage: "0.005", // 0.5% slippage
  });

  const url = sdkServer + swapEndpoint + "?" + params.toString();

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
  const publicClient = getPublicClient(
    chainId,
    await privyWallet.getEthereumProvider()
  );

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
