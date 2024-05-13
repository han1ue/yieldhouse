export async function deposit() {
  const data = encodeFunctionData({
    abi: yieldDetails.depositAbi,
    functionName: yieldDetails.depositAbi.name,
  });

  const transactionRequest = {
    to: yieldDetails.contractAddress,
    data: data,
    value: 100000, // Only necessary for payable methods
  };
  const transactionHash = await provider.request({
    method: "eth_sendTransaction",
    params: [transactionRequest],
  });

  console.log("transactionHash", transactionHash);

  return "deposit";
}

export function depositable() {
  return "depositBalance";
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
