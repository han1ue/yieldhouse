"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { encodeFunctionData, decodeFunctionData } from "viem";
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
  Table,
  Box,
} from "@radix-ui/themes";
import RiskIndicator from "../../components/riskIndicator";
import data from "/public/mockData.json";
import { adapterRegistry } from "../../adapters/adapterRegistry";
import React from "react";

import { Line } from "react-chartjs-2";
import { faker } from "@faker-js/faker";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import ApyChart from "../../components/apyChart";

export default function YieldPage({ params }) {
  const { ready, wallets } = useWallets();
  var wallet;
  var provider;
  const [selectedTab, setSelectedTab] = useState("1");
  const yieldDetails = data[params.id];
  const claimAvailable =
    adapterRegistry[yieldDetails.protocol.toLowerCase()].claim !== undefined;

  useEffect(() => {
    async function getProvider() {
      console.log("ready", ready);
      if (ready && wallets.length > 0) {
        wallet = wallets[0];
        console.log("wallet", wallet);
        provider = await wallet.getEthereumProvider();
        console.log("provider", provider);
      }
    }
    getProvider();
  }, [ready, wallets]);

  return (
    <>
      {yieldDetails ? (
        <Flex direction="column" gap="8">
          <Flex direction="row" justify="center" align="center" gap="6">
            <Flex direction="row" justify="center" align="center" gap="3">
              <Image
                src={
                  "/images/assets/" + yieldDetails.asset.toLowerCase() + ".svg"
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
              {selectedTab == "1" && (
                <Card>
                  <Flex direction="column" gap="4">
                    <Box>
                      <TextField.Root size="3" type="number">
                        <TextField.Slot>
                          <Image
                            src={
                              "/images/assets/" +
                              yieldDetails.asset.toLowerCase() +
                              ".svg"
                            }
                            width={20}
                            height={20}
                          />
                        </TextField.Slot>
                      </TextField.Root>
                      <Text size="1" weight="light">
                        {"Balance: " +
                          adapterRegistry[
                            yieldDetails.protocol.toLowerCase()
                          ].depositable() +
                          " " +
                          yieldDetails.asset}
                      </Text>
                    </Box>
                    <Separator size="4" />
                    <Button
                      onClick={() =>
                        adapterRegistry[
                          yieldDetails.protocol.toLowerCase()
                        ].deposit()
                      }
                      variant="classic"
                    >
                      Deposit
                    </Button>
                  </Flex>
                </Card>
              )}
              {selectedTab == "2" && (
                <Card>
                  <Flex direction="column" gap="4">
                    <Box>
                      <TextField.Root size="3" type="number">
                        <TextField.Slot>
                          <Image
                            src={
                              "/images/assets/" +
                              yieldDetails.asset.toLowerCase() +
                              ".svg"
                            }
                            width={20}
                            height={20}
                          />
                        </TextField.Slot>
                      </TextField.Root>
                      <Text size="1" weight="light">
                        {"Balance: " +
                          adapterRegistry[
                            yieldDetails.protocol.toLowerCase()
                          ].withdrawable() +
                          " " +
                          yieldDetails.asset}
                      </Text>
                    </Box>
                    <Separator size="4" />
                    <Button
                      onClick={() =>
                        adapterRegistry[
                          yieldDetails.protocol.toLowerCase()
                        ].withdraw()
                      }
                      variant="classic"
                    >
                      Withdraw
                    </Button>
                  </Flex>
                </Card>
              )}
              {selectedTab == "3" && (
                <Card>
                  <Flex direction="column" gap="4">
                    <Text size="2">Claimable Assets</Text>
                    <Separator size="4" />
                    <Button
                      onClick={
                        claimAvailable &&
                        adapterRegistry[
                          yieldDetails.protocol.toLowerCase()
                        ].claim()
                      }
                      variant="classic"
                    >
                      Claim
                    </Button>
                  </Flex>
                </Card>
              )}
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
                  <Text size="5" weight="medium">
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
