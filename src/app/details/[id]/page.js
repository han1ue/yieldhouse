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
import { adapterRegistry } from "../../adapters/adapterRegistry";
import { useTestnetContext } from "../../components/TestnetContext";
import React from "react";
import { Line } from "react-chartjs-2";
import moment from "moment";
import {
  createWalletClient,
  custom,
  extractChain,
  formatUnits,
  parseUnits,
  createPublicClient,
  maxUint256,
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
  const [yieldsData, setYieldsData] = useState();
  const [yieldDetails, setYieldDetails] = useState();
  const [maturityDate, setMaturityDate] = useState();
  const claimAvailable = false;
  const currentTimestamp = new Date().getTime() / 1000;

  async function getDepositable() {
    console.log("getDepositable");
    const depositable = await adapterRegistry[
      yieldDetails.protocol.toLowerCase()
    ].depositable(
      wallets[0],
      yieldDetails.chain.chainId,
      yieldDetails.asset.address
    );
    console.log("depositable", depositable);
    setDepositable(depositable);

    const isDepositApprovedResult = await adapterRegistry[
      yieldDetails.protocol.toLowerCase()
    ].isDepositApproved(
      wallets[0],
      yieldDetails.chain.chainId,
      yieldDetails.asset.address,
      yieldDetails.contractAddress,
      depositable == 0 ? maxUint256 : depositable
    );

    console.log("isDepositApprovedResult", isDepositApprovedResult);
    // Get approval status
    setDepositApproved(isDepositApprovedResult);
  }

  async function getWithdrawable() {
    console.log("getWithdrawable");
    const withdrawable = await adapterRegistry[
      yieldDetails.protocol.toLowerCase()
    ].withdrawable(
      wallets[0],
      yieldDetails.chain.chainId,
      yieldDetails.contractAddress
    );
    setWithdrawable(withdrawable);

    console.log("withdrawable", withdrawable);

    const isWithdrawApprovedResult = await adapterRegistry[
      yieldDetails.protocol.toLowerCase()
    ].isWithdrawApproved(
      wallets[0],
      yieldDetails.chain.chainId,
      yieldDetails.asset.address,
      yieldDetails.contractAddress,
      withdrawable == 0 ? maxUint256 : withdrawable
    );

    console.log("isWithdrawApprovedResult", isWithdrawApprovedResult);

    setWithdrawApproved(isWithdrawApprovedResult);
  }

  useEffect(() => {
    async function getProvider() {
      console.log("ready", ready);

      var walletZero = wallets[0];
      console.log("walletZero", walletZero);
      setProvider(await walletZero.getEthereumProvider());
    }

    if (ready && wallets.length > 0 && yieldDetails) {
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
  }, [ready, wallets, yieldDetails]);

  useEffect(() => {
    async function fetchData() {
      try {
        const yieldsUrl = testnet
          ? "https://raw.githubusercontent.com/jvalentee/yieldhouse-data/main/data/yieldsTestnet.json"
          : "https://raw.githubusercontent.com/jvalentee/yieldhouse-data/main/data/yields.json";

        const response = await fetch(yieldsUrl);
        if (response.ok) {
          const data = await response.json();
          setYieldsData(data);
          setYieldDetails(data[params.id]);
          setMaturityDate(
            new Date(data[params.id].apy.maturityTimestamp * 1000)
          );
        } else {
          console.error("Failed to fetch yields data:", response.statusText);
        }
      } catch (error) {
        console.error("Error fetching yields data:", error);
      }
    }

    fetchData();
  }, [testnet, params.id]);

  async function switchChain() {
    console.log("yieldDetails", yieldDetails);
    console.log("wallets[0]", wallets[0]);
    const walletChainId = wallets[0].chainId;
    console.log("yieldDetails.chain.chainId", yieldDetails.chain.chainId);
    if (walletChainId != yieldDetails.chain.chainId) {
      wallets[0]
        .switchChain(yieldDetails.chain.chainId)
        .then(() => {
          console.log("Switched chain to", yieldDetails.chain.chainId);
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
                id: yieldDetails.chain.chainId,
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
                width={100}
                height={80}
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
              {yieldDetails.chain.chainId !=
                wallets[0]?.chainId.substring(
                  wallets[0].chainId.indexOf(":") + 1
                ) && (
                <Callout.Root color="red" role="alert" size="2">
                  <Callout.Icon>
                    <ExclamationTriangleIcon />
                  </Callout.Icon>
                  <Callout.Text>
                    {wallets[0]
                      ? `Switch to the ${yieldDetails.chain.name} network to see your balance.`
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
                          Number(
                            formatUnits(
                              depositable,
                              yieldDetails.asset.decimals
                            )
                          ).toFixed(6) +
                          " " +
                          yieldDetails.asset.name}
                      </Text>
                    </Box>
                    <Separator size="4" />
                    {depositApproved ? (
                      <Button
                        disabled={
                          !depositApproved ||
                          depositAmount == 0 ||
                          depositAmount >
                            formatUnits(
                              depositable,
                              yieldDetails.asset.decimals
                            )
                        }
                        onClick={async () => {
                          switchChain();
                          const hash = await adapterRegistry[
                            yieldDetails.protocol.toLowerCase()
                          ].deposit(
                            wallets[0],
                            yieldDetails.chain.chainId,
                            yieldDetails.contractAddress,
                            parseUnits(
                              depositAmount,
                              yieldDetails.asset.decimals
                            )
                          );
                          console.log("hash", hash);
                          const publicClient = createPublicClient({
                            transport: custom(provider),
                            chain: extractChain({
                              chains: [mainnet, base, arbitrum, sepolia],
                              id: yieldDetails.chain.chainId,
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
                          const hash = await adapterRegistry[
                            yieldDetails.protocol.toLowerCase()
                          ].approveDeposit(
                            wallets[0],
                            yieldDetails.chain.chainId,
                            yieldDetails.asset.address,
                            yieldDetails.contractAddress,
                            maxUint256
                          );

                          console.log("hash", hash);
                          const publicClient = createPublicClient({
                            transport: custom(provider),
                            chain: extractChain({
                              chains: [mainnet, base, arbitrum, sepolia],
                              id: yieldDetails.chain.chainId,
                            }),
                          });

                          console.log("publicClient", publicClient);

                          console.log("waiting for tx receipt");

                          const receipt =
                            await publicClient.waitForTransactionReceipt({
                              hash,
                            });

                          console.log("receipt", receipt);

                          getDepositable();
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
                          Number(
                            formatUnits(
                              withdrawable,
                              yieldDetails.asset.decimals
                            )
                          ).toFixed(6) +
                          " " +
                          yieldDetails.asset.name}
                      </Text>
                    </Box>
                    <Separator size="4" />
                    {withdrawApproved ? (
                      <Button
                        disabled={
                          !withdrawApproved ||
                          withdrawAmount == 0 ||
                          withdrawAmount >
                            formatUnits(
                              withdrawable,
                              yieldDetails.asset.decimals
                            ) ||
                          currentTimestamp < yieldDetails.apy.maturityTimestamp
                        }
                        onClick={async () => {
                          switchChain();
                          const hash = await adapterRegistry[
                            yieldDetails.protocol.toLowerCase()
                          ].withdraw(
                            wallets[0],
                            yieldDetails.chain.chainId,
                            yieldDetails.contractAddress,
                            parseUnits(
                              withdrawAmount,
                              yieldDetails.asset.decimals
                            )
                          );
                          console.log("hash", hash);
                          const publicClient = createPublicClient({
                            transport: custom(provider),
                            chain: extractChain({
                              chains: [mainnet, base, arbitrum, sepolia],
                              id: yieldDetails.chain.chainId,
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
                          const hash = await adapterRegistry[
                            yieldDetails.protocol.toLowerCase()
                          ].approveWithdraw(
                            wallets[0],
                            yieldDetails.chain.chainId,
                            yieldDetails.asset.address,
                            yieldDetails.contractAddress,
                            withdrawAmount
                          );

                          console.log("hash", hash);

                          const publicClient = createPublicClient({
                            transport: custom(provider),
                            chain: extractChain({
                              chains: [mainnet, base, arbitrum, sepolia],
                              id: yieldDetails.chain.chainId,
                            }),
                          });

                          console.log("publicClient", publicClient);
                          console.log("waiting for tx receipt");

                          const receipt =
                            await publicClient.waitForTransactionReceipt({
                              hash,
                            });

                          console.log("receipt", receipt);

                          getWithdrawable();
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
              {yieldDetails.apy.type == "fixed" && (
                <Card>
                  <Flex direction="row" justify="between" align="center" mx="2">
                    <Text size="2">Time until maturity:</Text>
                    <Text size="3" weight="medium">
                      {moment(
                        yieldDetails.apy.maturityTimestamp * 1000
                      ).fromNow(true)}
                    </Text>
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
                <Flex direction="row" gap="4" justify="center" my="1">
                  <Flex direction="column" gap="1">
                    <Text size="1">Chain</Text>
                    <Text size="2" weight="medium">
                      {yieldDetails.chain.name}
                    </Text>
                  </Flex>
                  <Flex direction="column" gap="1">
                    <Text size="1">TVL</Text>
                    <Text size="2" weight="medium">
                      {Intl.NumberFormat("en-US", {
                        notation: "compact",
                        maximumFractionDigits: 2,
                      }).format(yieldDetails.tvl) + " $"}
                    </Text>
                  </Flex>
                  <Flex direction="column" gap="1">
                    <Text size="1">Type</Text>
                    <Text size="2" weight="medium">
                      {yieldDetails.type}
                    </Text>
                  </Flex>
                  {yieldDetails.apy.type == "fixed" && (
                    <Flex direction="column" gap="1">
                      <Text size="1">Maturity</Text>
                      <Text size="2" weight="medium">
                        {maturityDate.toLocaleDateString("en-GB")}
                      </Text>
                    </Flex>
                  )}
                </Flex>
              </Card>
              <Flex direction="column" gap="2">
                <Flex direction="row" gapX="1" align="baseline">
                  <Text ml="2" size="7" weight="medium">
                    {Number(yieldDetails.apy.value * 100).toFixed(2) + "%"}
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
