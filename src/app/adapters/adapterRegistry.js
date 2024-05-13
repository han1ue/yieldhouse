import { deposit, depositable, withdraw, withdrawable } from "./aave";

// Adapter Registry
// This is a registry of all the adapters that are available in the app.
// It is used to call the correct adapter function based on the protocol name.
// The adapter functions are imported from the respective adapter files.
// Claim/claimable functions are required for non rebasing yields.

export const adapterRegistry = {
  aave: {
    deposit,
    depositable,
    withdraw,
    withdrawable,
  },
};
