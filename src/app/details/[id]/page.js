"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import {
  Flex,
  Text,
  Button,
  Heading,
  IconButton,
  Card,
  Grid,
  TextField,
  Separator,
  Tooltip,
  RadioCards,
  Callout,
  Table,
  Box,
} from "@radix-ui/themes";
import { mainnet, base, arbitrum, sepolia } from "viem/chains";
import {
  InfoCircledIcon,
  ExclamationTriangleIcon,
} from "@radix-ui/react-icons";
import RiskIndicator from "../../components/riskIndicator";
import yields from "/public/mockData/yields.json";
import yieldsTestnet from "/public/mockData/yieldsTestnet.json";
import { adapterRegistry } from "../../adapters/adapterRegistry";
import { useTestnetContext } from "../../components/TestnetContext";
import React from "react";
import { Line } from "react-chartjs-2";
import {
  createWalletClient,
  custom,
  http,
  extractChain,
  formatEther,
  createPublicClient,
} from "viem";
import { faker } from "@faker-js/faker";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import ApyChart from "../../components/apyChart";

export default function YieldPage({ params }) {
  const testnet = useTestnetContext();
  const { ready, wallets } = useWallets();
  const [provider, setProvider] = useState();
  const [selectedTab, setSelectedTab] = useState("1");
  const [initialChainSwitch, setInitialChainSwitch] = useState(false);
  const [depositable, setDepositable] = useState("0");
  const [depositAmount, setDepositAmount] = useState("0");
  const [depositApproved, setDepositApproved] = useState(false);
  const [withdrawable, setWithdrawable] = useState("0");
  const [withdrawAmount, setWithdrawAmount] = useState("0");
  const [withdrawApproved, setWithdrawApproved] = useState(false);
  const yieldsData = testnet ? yieldsTestnet : yields;
  const yieldDetails = yieldsData[params.id];
  const claimAvailable = false;

  async function getDepositable() {
    console.log("getDepositable");
    const depositable = await adapterRegistry[
      yieldDetails.protocol.toLowerCase()
    ].depositable(
      wallets[0],
      yieldDetails.chainId,
      yieldDetails.contractAddress
    );
    setDepositable(depositable);

    const approvedDepositResult = adapterRegistry[
      yieldDetails.protocol.toLowerCase()
    ].approvedDeposit(
      wallets[0],
      yieldDetails.chainId,
      yieldDetails.asset.address,
      yieldDetails.contractAddress,
      depositable
    );

    console.log("approvedDepositResult", approvedDepositResult);
    // Get approval status
    setDepositApproved(depositable > 0 && approvedDepositResult);
  }

  async function getWithdrawable() {
    console.log("getWithdrawable");
    const withdrawable = await adapterRegistry[
      yieldDetails.protocol.toLowerCase()
    ].withdrawable(
      wallets[0],
      yieldDetails.chainId,
      yieldDetails.contractAddress
    );
    setWithdrawable(withdrawable);

    console.log("withdrawable", withdrawable);

    const approvedWithdrawResult = await adapterRegistry[
      yieldDetails.protocol.toLowerCase()
    ].approvedWithdraw(
      wallets[0],
      yieldDetails.chainId,
      yieldDetails.asset.address,
      yieldDetails.contractAddress,
      withdrawable
    );

    console.log("approvedWithdrawResult", approvedWithdrawResult);

    setWithdrawApproved(withdrawable > 0 && approvedWithdrawResult);
  }

  useEffect(() => {
    async function getProvider() {
      console.log("ready", ready);

      var walletZero = wallets[0];
      console.log("walletZero", walletZero);
      setProvider(await walletZero.getEthereumProvider());
    }

    if (ready && wallets.length > 0) {
      getProvider();

      // Get depositable amount
      getDepositable();

      // Get withdrawable amount
      getWithdrawable();

      // Chain switch
      if (!initialChainSwitch) {
        switchChain();
        setInitialChainSwitch(true);
      }
    }
  }, [ready, wallets]);

  async function switchChain() {
    console.log("yieldDetails", yieldDetails);
    console.log("wallets[0]", wallets[0]);
    const walletChainId = wallets[0].chainId;
    console.log("yieldDetails.chainId", yieldDetails.chainId);
    if (walletChainId != yieldDetails.chainId) {
      wallets[0]
        .switchChain(yieldDetails.chainId)
        .then(() => {
          console.log("Switched chain to", yieldDetails.chainId);
        })
        .catch(async (error) => {
          if (error.message.startsWith("Unrecognized chain ID")) {
            console.log("Adding chain to wallet");
            const walletClient = createWalletClient({
              transport: custom(provider),
            });
            // If the chain hasn't been added to the wallet, add it and try again
            await walletClient.addChain({
              chain: extractChain({
                chains: [mainnet, base, arbitrum, sepolia],
                id: yieldDetails.chainId,
              }),
            });
          }
        });
    }
  }

  return (
    <>
      {yieldDetails ? (
        <Flex direction="column" gap="8">
          <Flex direction="row" justify="center" align="center" gap="6">
            <Flex direction="row" justify="center" align="center" gap="3">
              <Image
                src={
                  "/images/assets/" +
                  yieldDetails.asset.name.toLowerCase() +
                  ".svg"
                }
                width={25}
                height={25}
              />
              <Separator orientation="vertical" size="1" />
              <Image
                src={
                  "/images/protocols/" +
                  yieldDetails.protocol.toLowerCase() +
                  ".svg"
                }
                width={80}
                height={60}
              />
            </Flex>
            <Separator size="3" orientation="vertical" />
            <RiskIndicator
              risk={yieldDetails.risk ? yieldDetails.risk : 1}
              size={58}
              textSize={38}
            />
          </Flex>
          <Flex
            direction={{
              initial: "column-reverse",
              sm: "row",
            }}
            gap="8"
          >
            <Flex
              direction="column"
              gap="4"
              width={{
                initial: "100%",
                sm: "50%",
              }}
            >
              <RadioCards.Root
                defaultValue="1"
                size="1"
                columns={claimAvailable ? "3" : "2"}
                onValueChange={(value) => {
                  console.log(value);
                  setSelectedTab(value);
                }}
              >
                <RadioCards.Item value="1">
                  <Text weight="bold">Deposit</Text>
                </RadioCards.Item>
                <RadioCards.Item value="2">
                  <Text weight="bold">Withdraw</Text>
                </RadioCards.Item>
                {claimAvailable && (
                  <RadioCards.Item value="3" disabled={!claimAvailable}>
                    <Text weight="bold">Claim</Text>
                  </RadioCards.Item>
                )}
              </RadioCards.Root>
              {yieldDetails.chainId !=
                wallets[0]?.chainId.substring(
                  wallets[0].chainId.indexOf(":") + 1
                ) && (
                <Callout.Root color="red" role="alert" size="2">
                  <Callout.Icon>
                    <ExclamationTriangleIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    {wallets[0]
                      ? `Please switch to the ${yieldDetails.chain} network to see your balance.`
                      : "Connect your wallet to see your balance."}
                  </Callout.Text>
                  {wallets[0] && (
                    <Button
                      size="1"
                      onClick={() => {
                        switchChain();
                      }}
                    >
                      Switch Network
                    </Button>
                  )}
                </Callout.Root>
              )}
              {selectedTab == "1" && (
                <Card>
                  <Flex direction="column" gap="4">
                    <Box>
                      <TextField.Root
                        size="3"
                        type="number"
                        onChange={(e) => {
                          console.log(e.target.value);
                          setDepositAmount(e.target.value);
                        }}
                      >
                        <TextField.Slot>
                          <Image
                            src={
                              "/images/assets/" +
                              yieldDetails.asset.name.toLowerCase() +
                              ".svg"
                            }
                            width={20}
                            height={20}
                          />
                        </TextField.Slot>
                      </TextField.Root>
                      <Text size="1" weight="light">
                        {"Balance: " +
                          Number(formatEther(depositable)).toFixed(4) +
                          " " +
                          yieldDetails.asset.name}
                      </Text>
                    </Box>
                    <Separator size="4" />
                    {depositApproved ? (
                      <Button
                        onClick={async () => {
                          switchChain();
                          const hash = await adapterRegistry[
                            yieldDetails.protocol.toLowerCase()
                          ].deposit(
                            wallets[0],
                            yieldDetails.chainId,
                            yieldDetails.contractAddress,
                            depositAmount
                          );
                          console.log("hash", hash);
                          const publicClient = createPublicClient({
                            transport: custom(provider),
                            chain: extractChain({
                              chains: [mainnet, base, arbitrum, sepolia],
                              id: yieldDetails.chainId,
                            }),
                          });

                          console.log("publicClient", publicClient);
                          console.log("waiting for tx receipt");

                          const receipt =
                            await publicClient.waitForTransactionReceipt({
                              hash,
                            });

                          console.log("receipt", receipt);

                          console.log("deposit-tx done");

                          getDepositable();
                          getWithdrawable();
                        }}
                        variant="classic"
                      >
                        Deposit
                      </Button>
                    ) : (
                      <Button
                        onClick={async () => {
                          switchChain();
                          await adapterRegistry[
                            yieldDetails.protocol.toLowerCase()
                          ].approveDeposit(
                            wallets[0],
                            yieldDetails.chainId,
                            yieldDetails.contractAddress,
                            depositAmount
                          );
                          setDepositApproved(true);
                        }}
                        variant="classic"
                      >
                        Approve
                      </Button>
                    )}
                  </Flex>
                </Card>
              )}
              {selectedTab == "2" && (
                <Card>
                  <Flex direction="column" gap="4">
                    <Box>
                      <TextField.Root
                        size="3"
                        type="number"
                        onChange={(e) => {
                          console.log(e.target.value);
                          setWithdrawAmount(e.target.value);
                        }}
                      >
                        <TextField.Slot>
                          <Image
                            src={
                              "/images/assets/" +
                              yieldDetails.asset.name.toLowerCase() +
                              ".svg"
                            }
                            width={20}
                            height={20}
                          />
                        </TextField.Slot>
                      </TextField.Root>
                      <Text size="1" weight="light">
                        {"Balance: " +
                          Number(formatEther(withdrawable)).toFixed(6) +
                          " " +
                          yieldDetails.asset.name}
                      </Text>
                    </Box>
                    <Separator size="4" />
                    {withdrawApproved ? (
                      <Button
                        onClick={async () => {
                          switchChain();
                          const hash = await adapterRegistry[
                            yieldDetails.protocol.toLowerCase()
                          ].withdraw(
                            wallets[0],
                            yieldDetails.chainId,
                            yieldDetails.contractAddress,
                            withdrawAmount
                          );
                          console.log("hash", hash);
                          const publicClient = createPublicClient({
                            transport: custom(provider),
                            chain: extractChain({
                              chains: [mainnet, base, arbitrum, sepolia],
                              id: yieldDetails.chainId,
                            }),
                          });

                          console.log("publicClient", publicClient);
                          console.log("waiting for tx receipt");

                          const receipt =
                            await publicClient.waitForTransactionReceipt({
                              hash,
                            });

                          console.log("receipt", receipt);

                          console.log("deposit-tx done");

                          getDepositable();
                          getWithdrawable();
                        }}
                        variant="classic"
                      >
                        Withdraw
                      </Button>
                    ) : (
                      <Button
                        onClick={async () => {
                          switchChain();
                          await adapterRegistry[
                            yieldDetails.protocol.toLowerCase()
                          ].approveWithdraw(
                            wallets[0],
                            yieldDetails.chainId,
                            yieldDetails.asset.address,
                            yieldDetails.contractAddress,
                            withdrawAmount
                          );
                          setWithdrawApproved(true);
                        }}
                        variant="classic"
                      >
                        Approve
                      </Button>
                    )}
                  </Flex>
                </Card>
              )}
              {selectedTab == "3" && (
                <Card>
                  <Flex direction="column" gap="4">
                    <Text size="2">Claimable Assets</Text>
                    <Separator size="4" />
                    <Button
                      onClick={() => {
                        switchChain();
                        claimAvailable &&
                          adapterRegistry[
                            yieldDetails.protocol.toLowerCase()
                          ].claim();
                      }}
                      variant="classic"
                    >
                      Claim
                    </Button>
                  </Flex>
                </Card>
              )}
              <Callout.Root size="1">
                <Callout.Icon>
                  <InfoCircledIcon />
                </Callout.Icon>
                <Callout.Text size="1">{yieldDetails.description}</Callout.Text>
              </Callout.Root>
            </Flex>
            <Flex
              direction="column"
              gap="5"
              width={{
                initial: "100%",
                sm: "50%",
              }}
            >
              <Card>
                <Flex direction="row" gap="7" justify="center" my="1">
                  <Flex direction="column" gap="1">
                    <Text size="1">Chain</Text>
                    <Text size="3" weight="medium">
                      {yieldDetails.chain}
                    </Text>
                  </Flex>
                  <Flex direction="column" gap="1">
                    <Text size="1">TVL</Text>
                    <Text size="3" weight="medium">
                      {yieldDetails.tvl}
                    </Text>
                  </Flex>
                  <Flex direction="column" gap="1">
                    <Text size="1">Type</Text>
                    <Text size="3" weight="medium">
                      {yieldDetails.type}
                    </Text>
                  </Flex>
                </Flex>
              </Card>
              <Flex direction="column" gap="2">
                <Flex direction="row" gapX="1" align="baseline">
                  <Text ml="2" size="7" weight="medium">
                    {yieldDetails.apy * 100 + "%"}
                  </Text>
                  <Text size="1" weight="light">
                    {" "}
                    APY
                  </Text>
                </Flex>
                <ApyChart />
              </Flex>
            </Flex>
          </Flex>
        </Flex>
      ) : (
        <div>Invalid ID</div>
      )}
    </>
  );
}
