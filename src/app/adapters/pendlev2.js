import {
  createWalletClient,
  createPublicClient,
  custom,
  extractChain,
  erc20Abi,
} from "viem";
import { mainnet, base, arbitrum, sepolia } from "viem/chains";
import { useWallets } from "@privy-io/react-auth";

export async function isDepositApproved(
  privyWallet,
  chainId,
  token,
  spender,
  amount
) {}

export async function approveDeposit(
  privyWallet,
  chainId,
  token,
  spender,
  amount
) {}

export async function deposit(privyWallet, chainId, contractAddress, amount) {
  // Use fetch to call the hosted sdk and get the details for the deposit PT function
}

export async function depositable(
  privyWallet,
  chainId,
  contractAddress,
  amount
) {}

export async function withdraw(privyWallet, chainId, contractAddress, amount) {
  // Check if we are past the market maturity date
  // If we are past the market maturity date, we withdraw the funds
  // If we are not past the market maturity date, we return an error
}
