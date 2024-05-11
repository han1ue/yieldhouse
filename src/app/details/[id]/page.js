"use client";

import { useState } from "react";
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

import data from "/public/mockData.json";

export default function YieldPage({ params }) {
  const [selectedTab, setSelectedTab] = useState("1");
  const yieldDetails = data[params.id];
  return (
    <>
      {yieldDetails ? (
        <Flex
          direction={{
            initial: "column",
            sm: "row",
          }}
          justify="between"
          gap="8"
        >
          <Flex direction="column" gap="4">
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
                <Button>Deposit</Button>
              </Card>
            )}
            {selectedTab == "2" && (
              <Card>
                <Button>Withdraw</Button>
              </Card>
            )}
            {selectedTab == "3" && (
              <Card>
                <Button>Claim</Button>
              </Card>
            )}
          </Flex>
          <Flex direction="column" gap="4">
            <Card>
              <Flex direction="row" gap="7">
                <Flex direction="column" gap="1">
                  <Text size="1">Title</Text>
                  <Text size="3">Data</Text>
                </Flex>
                <Flex direction="column" gap="1">
                  <Text size="1">Title</Text>
                  <Text size="3">Data</Text>
                </Flex>
                <Flex direction="column" gap="1">
                  <Text size="1">Title</Text>
                  <Text size="3">Data</Text>
                </Flex>
                <Flex direction="column" gap="1">
                  <Text size="1">Title</Text>
                  <Text size="3">Data</Text>
                </Flex>
              </Flex>
            </Card>
            <Flex direction="column" gap="1">
              <Text>APY: 20%</Text>
              <Text>Graph</Text>
            </Flex>
          </Flex>
        </Flex>
      ) : (
        <div>Invalid ID</div>
      )}
    </>
  );
}
