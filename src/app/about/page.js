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
  Box,
} from "@radix-ui/themes";
import { useState } from "react";
import Image from "next/image";
import {
  FaceIcon,
  ImageIcon,
  SunIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";

export default function About() {
  return (
    <Flex direction="column" gap="4">
      <Flex direction="column">
        <Heading size="3">Integrated Protocols</Heading>
        <Text>AAVE</Text>
      </Flex>
      <Flex direction="column">
        <Heading size="3">About yield.house</Heading>
        <Text>
          yield.house is a platform that helps you find the yield opportunities.
          We provide a curated list of all the best yield opportunities in the
          market. We also provide a dashboard that helps you track your
          investments and monitor your portfolio.
        </Text>
        <Text>
          The platform is built on top of the Privy protocol, which allows you
          to create a wallet through your social network account.
        </Text>
        <Text>
          yield.house ha a 0% fee policy, we don't charge any fee for using our
          platform.
        </Text>
      </Flex>
    </Flex>
  );
}
