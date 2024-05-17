import { Pool, UiPoolDataProvider } from "@aave/contract-helpers";
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

const ETH_MOCK_ADDRESS = "0xEeeeeEeeeEeEeeEeEeEeeEEEeeeeEeeeeeeeEEeE";

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

  return hash;
}

export async function depositable(privyWallet, chainId, token) {
  // Token is ETH
  if (token == ETH_MOCK_ADDRESS) {
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

    const balance = await publicClient.readContract({
      address: token,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [privyWallet.address],
    });

    return balance;
  }
}

export async function approvedWithdraw(
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

  const tx = await pool.withdraw({
    user: privyWallet.address,
    reserve: token,
    amount: amount,
    aTokenAddress: token == ETH_MOCK_ADDRESS && addressBook.ASSETS.WETH.A_TOKEN,
  });

  console.log("approvedWithdraw:tx", tx);

  console.log("approvedWithdraw", tx.length == 1);

  return tx.length == 1;
}

export async function approveWithdraw(
  privyWallet,
  chainId,
  token,
  spender,
  amount
) {
  withdraw(privyWallet, chainId, token, amount);
}

export async function withdraw(privyWallet, chainId, contractAddress, amount) {
  const addressBook = getAddressBook(chainId);

  const pool = new Pool(await privyWallet.getEthersProvider(), {
    POOL: addressBook.POOL,
    WETH_GATEWAY: addressBook.WETH_GATEWAY,
  });

  console.log("user", privyWallet.address);
  console.log("amount", amount);
  console.log("contractAddress", contractAddress);

  const tx = await pool.withdraw({
    user: privyWallet.address,
    reserve: contractAddress,
    amount: amount,
    aTokenAddress:
      contractAddress == ETH_MOCK_ADDRESS && addressBook.ASSETS.WETH.A_TOKEN,
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

  return hash;
}

export async function withdrawable(privyWallet, chainId, contractAddress) {
  const addressBook = getAddressBook(chainId);
  var aTokenAddress = "";
  //Token is ETH
  if (contractAddress == ETH_MOCK_ADDRESS) {
    aTokenAddress = addressBook.ASSETS.WETH.A_TOKEN;
  } else {
    const poolDataProvider = new UiPoolDataProvider({
      uiPoolDataProviderAddress: addressBook.UI_POOL_DATA_PROVIDER,
      provider: await privyWallet.getEthersProvider(),
      chainId: chainId,
    });

    console.log("poolDataProvider", poolDataProvider);
    console.log("UI_POOL_DATA_PROVIDER", addressBook.UI_POOL_DATA_PROVIDER);

    const reserves = await poolDataProvider.getReservesHumanized({
      lendingPoolAddressProvider: addressBook.POOL_ADDRESSES_PROVIDER,
    });

    console.log("reserves", reserves);

    aTokenAddress = reserves.reservesData.find(
      (reserve) => reserve.underlyingAsset == contractAddress
    ).aTokenAddress;
  }

  const provider = await privyWallet.getEthereumProvider();
  const publicClient = createPublicClient({
    chain: extractChain({
      chains: [mainnet, base, arbitrum, sepolia],
      id: chainId,
    }),
    transport: custom(provider),
  });

  console.log("erc20Abi", erc20Abi);

  const balance = await publicClient.readContract({
    address: aTokenAddress,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [privyWallet.address],
  });

  return balance;
}
