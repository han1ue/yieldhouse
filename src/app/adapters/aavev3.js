import { Pool } from "@aave/contract-helpers";
import {
  createWalletClient,
  createPublicClient,
  custom,
  extractChain,
  erc20Abi,
} from "viem";
import { mainnet, base, arbitrum, sepolia } from "viem/chains";
import { useWallets } from "@privy-io/react-auth";
import { AaveV3Ethereum, AaveV3Sepolia } from "@bgd-labs/aave-address-book"; // import specific pool

function getAddressBook(chainId) {
  const addressBooks = [AaveV3Ethereum, AaveV3Sepolia];
  return addressBooks.find((addressBook) => addressBook.CHAIN_ID === chainId);
}

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

export async function approvedDeposit(
  privyWallet,
  chainId,
  token,
  spender,
  amount
) {
  const addressBook = getAddressBook(chainId);

  const pool = new Pool(await privyWallet.getEthersProvider(), {
    POOL: addressBook.POOL,
    WETH_GATEWAY: addressBook.WETH_GATEWAY,
  });

  const tx = await pool.supply({
    user: privyWallet.address,
    reserve: token,
    amount: amount,
    onBehalfOf: privyWallet.address,
  });

  return tx.length == 1;
}

export async function approveDeposit(
  privyWallet,
  chainId,
  token,
  spender,
  amount
) {
  deposit(privyWallet, chainId, token, amount);
}

export async function deposit(privyWallet, chainId, contractAddress, amount) {
  const addressBook = getAddressBook(chainId);

  const pool = new Pool(await privyWallet.getEthersProvider(), {
    POOL: addressBook.POOL,
    WETH_GATEWAY: addressBook.WETH_GATEWAY,
  });

  console.log("user", privyWallet.address);
  console.log("amount", amount);
  console.log("contractAddress", contractAddress);

  const tx = await pool.supply({
    user: privyWallet.address,
    reserve: contractAddress,
    amount: amount,
  });

  console.log("tx", tx);

  const extendedTxData = await tx[0].tx();
  console.log("extendedTxData", extendedTxData);
  const { from, ...txData } = extendedTxData;
  console.log("txData", txData);
  console.log("from", from);

  const walletClient = getWalletClient(
    privyWallet.address,
    chainId,
    await privyWallet.getEthereumProvider()
  );
  const hash = await walletClient.sendTransaction({
    ...txData,
  });

  console.log("hash", hash);
}

export async function depositable(privyWallet, chainId, token) {
  // Token is ETH
  if (token == "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE") {
    console.log("ETH");
    const provider = await privyWallet.getEthereumProvider();
    const publicClient = createPublicClient({
      chain: extractChain({
        chains: [mainnet, base, arbitrum, sepolia],
        id: chainId,
      }),
      transport: custom(provider),
    });
    console.log("chainId", chainId);
    console.log("publicClient", publicClient);
    console.log("privyWallet.address", privyWallet.address);
    const balance = await publicClient.getBalance({
      address: privyWallet.address,
    });
    console.log("balance", balance);
    return balance;
  } else {
    console.log("ERC20");
    const walletClient = getWalletClient(
      privyWallet.address,
      chainId,
      await privyWallet.getEthereumProvider()
    );

    const balance = await walletClient.readContract({
      address: token,
      abi: erc20Abi,
      method: "balanceOf",
      args: [privyWallet.address],
    });

    return balance;
  }
}

export function withdraw() {
  return "withdraw";
}

export function withdrawable() {
  return "withdrawBalance";
}

// export function claim() {
//   return "claim";
// }

// export function claimable() {
//   return "claimBalance";
// }
