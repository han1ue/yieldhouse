"use client";

import {
  Flex,
  Text,
  Button,
  Card,
  Heading,
  IconButton,
  Grid,
  TextField,
  Separator,
  Table,
  Box,
} from "@radix-ui/themes";
import { useState } from "react";
import data from "/public/mockPositions.json";
import {
  FaceIcon,
  ImageIcon,
  SunIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import Image from "next/image";

export default function Dashboard() {
  return (
    <Flex direction="column" gap="6">
      <Heading weight="medium">My current positions</Heading>
      <Grid columns="4" gap="2">
        {data.map((position) => (
          <Card asChild>
            <a href={"/" + position.id}>
              <Flex direction="column" align="center" gap="1">
                <Flex
                  direction="row"
                  justify="center"
                  align="center"
                  width="100%"
                  gap="3"
                >
                  <Image
                    src={
                      "/images/chains/" + position.chain.toLowerCase() + ".png"
                    }
                    width={20}
                    height={20}
                  />
                  <Separator orientation="vertical" size="1" />
                  <Image
                    src={
                      "/images/protocols/" +
                      position.protocol.toLowerCase() +
                      ".svg"
                    }
                    width={80}
                    height={60}
                  />
                </Flex>
                <Flex direction="row" justify="center" width="100%">
                  <Separator orientation="horizontal" size="4" />
                </Flex>
                <Flex
                  direction="column"
                  justify="center"
                  width="80%"
                  mt="2"
                  gap="2"
                >
                  <Flex direction="row" justify="between">
                    <Flex direction="column">
                      <Text size="1">APY</Text>
                      <Text size="2" weight="medium">
                        {position.apy}
                      </Text>
                    </Flex>
                    <Flex direction="column">
                      <Text size="1">Value</Text>
                      <Text size="2" weight="medium">
                        {position.value}
                      </Text>
                    </Flex>
                  </Flex>
                  <Flex direction="column">
                    <Text size="1">Profit</Text>
                    <Text size="2" weight="medium">
                      {position.profit}
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </a>
          </Card>
        ))}
      </Grid>
    </Flex>
  );
}
