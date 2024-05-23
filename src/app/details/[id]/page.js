"use client";

import { useState, useEffect, use } from "react";
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
  Badge,
  Tooltip,
  RadioCards,
  Callout,
  Table,
  Spinner,
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
import { de, faker } from "@faker-js/faker";
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
  const [txConfirming, setTxConfirming] = useState(false);
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
  }

  async function getDepositApproved() {
    const isDepositApprovedResult = await adapterRegistry[
      yieldDetails.protocol.toLowerCase()
    ].isDepositApproved(
      wallets[0],
      yieldDetails.chain.chainId,
      yieldDetails.asset.address,
      yieldDetails.contractAddress,
      depositAmount > 0
        ? parseUnits(depositAmount, yieldDetails.asset.decimals)
        : 1
    );

    console.log("isDepositApprovedResult", isDepositApprovedResult);
    console.log("depositAmount", depositAmount);
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
  }

  async function getWithdrawApproved() {
    const isWithdrawApprovedResult = await adapterRegistry[
      yieldDetails.protocol.toLowerCase()
    ].isWithdrawApproved(
      wallets[0],
      yieldDetails.chain.chainId,
      yieldDetails.asset.address,
      yieldDetails.contractAddress,
      withdrawAmount > 0
        ? parseUnits(withdrawAmount, yieldDetails.asset.decimals)
        : 1
    );

    console.log("isWithdrawApprovedResult", isWithdrawApprovedResult);

    setWithdrawApproved(isWithdrawApprovedResult);
  }

  useEffect(() => {
    console.log("update depositAmount", depositAmount);

    if (yieldDetails) {
      getDepositApproved();
    }
  }, [depositAmount, yieldDetails, wallets]);

  useEffect(() => {
    console.log("update withdrawAmount", withdrawAmount);

    if (yieldDetails) {
      getWithdrawApproved();
    }
  }, [withdrawAmount, yieldDetails, wallets]);

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
          setYieldDetails(data.find((yieldData) => yieldData.id == params.id));
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
        <Flex direction="column">
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
                width={120}
                height={80}
              />
            </Flex>
            <Separator size="3" orientation="vertical" />
            <Flex direction="column" gap="1" align="center">
              <Text size="2" weight="medium">
                Risk Level
              </Text>
              <RiskIndicator
                risk={yieldDetails.risk ? yieldDetails.risk : 1}
                size={48}
                textSize={36}
              />
            </Flex>
          </Flex>
          <Flex
            direction={{
              initial: "column-reverse",
              sm: "row",
            }}
            mt="8"
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
                    <Flex direction="column" gap="1">
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
                      <Flex direction="row" justify="end" mx="2">
                        <Text
                          size="1"
                          weight="light"
                          style={{
                            cursor: "pointer",
                          }}
                          onClick={() => {
                            console.log("click");
                          }}
                        >
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
                      </Flex>
                    </Flex>
                    <Separator size="4" />
                    {depositApproved ? (
                      <Button
                        disabled={
                          depositAmount == 0 ||
                          parseUnits(
                            depositAmount,
                            yieldDetails.asset.decimals
                          ) > depositable
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

                          const publicClient = createPublicClient({
                            transport: custom(provider),
                            chain: extractChain({
                              chains: [mainnet, base, arbitrum, sepolia],
                              id: yieldDetails.chain.chainId,
                            }),
                          });

                          console.log("publicClient", publicClient);
                          console.log("waiting for tx receipt");
                          setTxConfirming(true);
                          const receipt =
                            await publicClient.waitForTransactionReceipt({
                              hash,
                            });

                          setTxConfirming(false);

                          console.log("receipt", receipt);

                          console.log("deposit-tx done");

                          getDepositable();
                          getWithdrawable();
                        }}
                        variant="classic"
                      >
                        {txConfirming ? <Spinner /> : "Deposit"}
                      </Button>
                    ) : (
                      <Button
                        disabled={depositAmount == 0}
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

                          setTxConfirming(true);

                          await publicClient.waitForTransactionReceipt({
                            hash,
                          });

                          await getDepositApproved();

                          setTxConfirming(false);
                        }}
                        variant="classic"
                      >
                        {txConfirming ? <Spinner /> : "Approve"}
                      </Button>
                    )}
                  </Flex>
                </Card>
              )}
              {selectedTab == "2" && (
                <Card>
                  <Flex direction="column" gap="4">
                    <Flex direction="column" gap="1">
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
                      <Flex direction="row" justify="end" mx="2">
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
                      </Flex>
                    </Flex>
                    <Separator size="4" />
                    {withdrawApproved ? (
                      <Button
                        disabled={
                          !withdrawApproved ||
                          withdrawAmount == 0 ||
                          parseUnits(
                            withdrawAmount,
                            yieldDetails.asset.decimals
                          ) > withdrawable ||
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

                          setTxConfirming(true);

                          const receipt =
                            await publicClient.waitForTransactionReceipt({
                              hash,
                            });

                          setTxConfirming(false);

                          console.log("receipt", receipt);

                          console.log("deposit-tx done");

                          getDepositable();
                          getWithdrawable();
                        }}
                        variant="classic"
                      >
                        {txConfirming ? <Spinner /> : "Withdraw"}
                      </Button>
                    ) : (
                      <Button
                        disabled={withdrawAmount == 0}
                        onClick={async () => {
                          switchChain();
                          const hash = await adapterRegistry[
                            yieldDetails.protocol.toLowerCase()
                          ].approveWithdraw(
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

                          setTxConfirming(true);

                          const receipt =
                            await publicClient.waitForTransactionReceipt({
                              hash,
                            });

                          await getWithdrawApproved();

                          setTxConfirming(false);
                        }}
                        variant="classic"
                      >
                        {txConfirming ? <Spinner /> : "Approve"}
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
              <Card>
                <Flex direction="column" gap="1" mx="2">
                  <Flex direction="row" justify="between" align="center">
                    <Text size="2">Available:</Text>
                    <Text size="3" weight="medium">
                      {Number(
                        formatUnits(depositable, yieldDetails.asset.decimals)
                      ).toFixed(6) +
                        " " +
                        yieldDetails.asset.name}
                    </Text>
                  </Flex>
                  <Flex direction="row" justify="between" align="center">
                    <Text size="2">Deposited:</Text>
                    <Text size="3" weight="medium">
                      {Number(
                        formatUnits(withdrawable, yieldDetails.asset.decimals)
                      ).toFixed(6) +
                        " " +
                        yieldDetails.asset.name}
                    </Text>
                  </Flex>
                </Flex>
              </Card>
              {yieldDetails.apy.type == "fixed" && (
                <Card>
                  <Flex direction="row" justify="between" align="center" mx="2">
                    <Text size="2">Time until maturity:</Text>
                    <Text size="3" weight="medium">
                      {moment(yieldDetails.apy.maturityTimestamp * 1000).diff(
                        moment(),
                        "days"
                      ) + " days"}
                    </Text>
                  </Flex>
                </Card>
              )}
            </Flex>
            <Flex
              direction="column"
              gap="6"
              width={{
                initial: "100%",
                sm: "50%",
              }}
            >
              <Flex direction="row" justify="center" align="center">
                <Box
                  width={{
                    initial: "70%",
                    sm: "100%",
                  }}
                >
                  <Card>
                    <Flex direction="row" gap="5" justify="center" my="1">
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
                </Box>
              </Flex>
              <Flex direction="column" gap="4">
                <Flex direction="row" justify="between" mx="2">
                  <Flex direction="row" gap="2">
                    <Flex direction="column" justify="end">
                      <Text size="6" weight="medium">
                        {Number(yieldDetails.apy.value * 100).toFixed(2) + "%"}
                      </Text>
                    </Flex>
                    <Flex direction="column">
                      <Text size="1" weight="light">
                        {yieldDetails.apy.type}
                      </Text>
                      <Text size="1" weight="light" trim="end">
                        APY
                      </Text>
                    </Flex>
                  </Flex>
                  <Flex direction="row" gap="1" align="center">
                    {yieldDetails.type.map((type, i) => (
                      <Badge
                        key={i}
                        variant="soft"
                        size="1"
                        color="iris"
                        radius="large"
                      >
                        {type}
                      </Badge>
                    ))}
                  </Flex>
                </Flex>
                <ApyChart historyData={yieldDetails.apy.history} />
              </Flex>
            </Flex>
          </Flex>
          <Flex mx="2" mt="6">
            <Callout.Root size="1">
              <Callout.Icon>
                <InfoCircledIcon />
              </Callout.Icon>
              <Callout.Text size="2">{yieldDetails.description}</Callout.Text>
            </Callout.Root>
          </Flex>
        </Flex>
      ) : (
        <div>Invalid ID</div>
      )}
    </>
  );
}
