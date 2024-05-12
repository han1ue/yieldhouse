"use client";

import { useState } from "react";
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
  RadioCards,
  Table,
  Box,
} from "@radix-ui/themes";
import RiskIndicator from "../../components/riskIndicator";

import data from "/public/mockData.json";

export default function YieldPage({ params }) {
  const [selectedTab, setSelectedTab] = useState("1");
  const yieldDetails = data[params.id];
  return (
    <>
      {yieldDetails ? (
        <Flex direction="column" gap="8">
          <Flex direction="row" justify="center" align="center" gap="6">
            <Flex direction="row" justify="center" align="center" gap="3">
              <Image
                src={
                  "/images/assets/" + yieldDetails.asset.toLowerCase() + ".png"
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
            <Flex justify="center" align="center">
              <RiskIndicator risk={yieldDetails.risk} size={64} textSize={34} />
            </Flex>
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
                columns="3"
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
                <RadioCards.Item value="3">
                  <Text weight="bold">Claim</Text>
                </RadioCards.Item>
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
                        Balance: 0.00
                      </Text>
                    </Box>
                    <Separator size="4" />
                    <Button variant="classic">Deposit</Button>
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
                        Balance: 0.00
                      </Text>
                    </Box>
                    <Separator size="4" />
                    <Button variant="classic">Withdraw</Button>
                  </Flex>
                </Card>
              )}
              {selectedTab == "3" && (
                <Card>
                  <Flex direction="column" gap="4">
                    <Text>
                      Claim your rewards from staking your {yieldDetails.asset}
                    </Text>
                    <Separator size="4" />
                    <Button variant="classic">Claim</Button>
                  </Flex>
                </Card>
              )}
            </Flex>
            <Flex
              direction="column"
              gap="4"
              width={{
                initial: "100%",
                sm: "50%",
              }}
            >
              <Flex justify="center" direction="row">
                <Card size="1">
                  <Flex direction="row" gap="7" justify="center" m="4" b="8">
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
              </Flex>
              <Flex direction="column" gap="1">
                <Text>APY: 20%</Text>
                <Text>Graph</Text>
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
