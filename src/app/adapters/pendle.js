import {
  createWalletClient,
  createPublicClient,
  custom,
  extractChain,
  erc20Abi,
} from "viem";
import { mainnet, base, arbitrum, sepolia } from "viem/chains";
import { useWallets } from "@privy-io/react-auth";

export async function deposit(privyWallet, chainId, contractAddress, amount) {}

export async function withdraw(privyWallet, chainId, contractAddress, amount) {}
