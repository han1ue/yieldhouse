"use client";

import { Inter } from "next/font/google";
import { useState } from "react";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
import { Container } from "@radix-ui/themes";
import { Flex, Switch, Text } from "@radix-ui/themes";
import { PrivyProvider } from "@privy-io/react-auth";
import Header from "./components/header";
import { TestnetContextProvider } from "./components/TestnetContext";
import { usePathname } from "next/navigation";
import lastUpdate from "/public/mockData/lastUpdate.json";
import moment from "moment";
import { base, mainnet, sepolia, arbitrum } from "viem/chains";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [testnet, setTestnet] = useState(false);

  return (
    <html lang="en">
      <body className={inter.className}>
        <PrivyProvider
          appId="clvyg5hc308tixi9m43pjngmw"
          config={{
            defaultChain: mainnet,
            chains: [mainnet, base, arbitrum, sepolia],
          }}
        >
          <Theme
            accentColor="mint"
            grayColor="gray"
            panelBackground="solid"
            scaling="100%"
            radius="medium"
          >
            <Container maxWidth="640px" mx="2">
              <Header />
              <TestnetContextProvider testnet={testnet}>
                {children}
              </TestnetContextProvider>
              <Flex direction="row" justify="between" mx="2" mb="2" mt="8">
                <Text size="1">
                  {"Last updated: " +
                    moment(lastUpdate.timestamp * 1000).fromNow()}
                </Text>
                {!pathname.startsWith("/details/") && (
                  <Flex direction="row" align="center" gapX="1">
                    <Text size="1" weight="light">
                      Testnet Mode
                    </Text>

                    <Switch
                      size="1"
                      checked={testnet}
                      onCheckedChange={() => setTestnet(!testnet)}
                    />
                  </Flex>
                )}
              </Flex>
            </Container>
          </Theme>
        </PrivyProvider>
      </body>
    </html>
  );
}
