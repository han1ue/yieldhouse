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

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const [testnet, setTestnet] = useState(true);
  return (
    <html lang="en">
      <body className={inter.className}>
        <PrivyProvider appId="clvyg5hc308tixi9m43pjngmw">
          <Theme
            accentColor="mint"
            grayColor="gray"
            panelBackground="solid"
            scaling="100%"
            radius="medium"
          >
            <Container maxWidth="640px" mx="2">
              <Header />
              {children}
              <Flex direction="row" justify="between" mx="2" mt="8">
                <Text size="1">Last updated: 6 hours ago</Text>
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
              </Flex>
            </Container>
          </Theme>
        </PrivyProvider>
      </body>
    </html>
  );
}
