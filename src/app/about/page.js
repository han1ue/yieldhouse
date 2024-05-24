"use client";

import {
  Flex,
  Text,
  Button,
  Heading,
  IconButton,
  Grid,
  TextField,
  Table,
  Separator,
  Code,
  Box,
} from "@radix-ui/themes";
import { useState } from "react";
import Image from "next/image";
import { TwitterLogoIcon, GitHubLogoIcon } from "@radix-ui/react-icons";
import Link from "next/link";

export default function About() {
  return (
    <Flex direction="column" gap="4">
      <Flex direction="column">
        <Heading size="3">Integrated DeFi Protocols</Heading>
        <Text>AAVE, Pendle</Text>
      </Flex>
      <Flex direction="column">
        <Heading size="3">About yield.house</Heading>
        <Text>
          yield.house is a platform that helps you find the yield opportunities.
          We provide a curated list of all the best yield opportunities in the
          market.
        </Text>
        <Text>
          The platform is built on top of the Privy protocol, which allows you
          to create a wallet through your social network account.
        </Text>
        <Text>
          yield.house has a 0% fee policy, we don&apos;t charge any fee for
          using our platform.
        </Text>
      </Flex>

      <Flex
        direction="row"
        align="center"
        justify="center"
        mt="4"
        gapX="4"
        width="full"
      >
        <Link target="_blank" href="https://x.com/yielddothouse">
          <TwitterLogoIcon width="32" height="32" />
        </Link>
        <Separator orientation="vertical" />
        <Link target="_blank" href="https://github.com/han1ue/yieldhouse">
          <GitHubLogoIcon width="30" height="30" />
        </Link>
      </Flex>
      <Flex direction="row" gapX="2" align="center" justify="center" mt="9">
        <Text>Made by @piggydeveloper with</Text>
        <Code weight="bold">.love()</Code>
      </Flex>
    </Flex>
  );
}
