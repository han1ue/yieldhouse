export async function deposit(contractAddress, provider) {
  const abi = [
    {
      inputs: [],
      name: "deposit",
      outputs: [],
      stateMutability: "payable",
      type: "function",
    },
  ];

  const data = encodeFunctionData({
    abi: abi,
    functionName: abi.name,
  });

  const transactionRequest = {
    to: contractAddress,
    data: data,
    value: 0, // Only necessary for payable methods
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
