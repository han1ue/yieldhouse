"use client";

import { Inter } from "next/font/google";
import { useState, useEffect } from "react";
import "@radix-ui/themes/styles.css";
import "./globals.css";
import { Theme } from "@radix-ui/themes";
import { Container } from "@radix-ui/themes";
import { Flex, Switch, Text } from "@radix-ui/themes";
import { PrivyProvider } from "@privy-io/react-auth";
import Header from "./components/header";
import { TestnetContextProvider } from "./components/TestnetContext";
import { usePathname } from "next/navigation";
import moment from "moment";
import { CheckCircledIcon } from "@radix-ui/react-icons";
import { base, mainnet, sepolia, arbitrum } from "viem/chains";
import { ThemeProvider, createTheme } from "@mui/material/styles";

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({ children }) {
  const pathname = usePathname();
  const [testnet, setTestnet] = useState(false);
  const [appearance, setAppearance] = useState();
  const [lastUpdate, setLastUpdate] = useState();

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedAppearance = localStorage.getItem("appearance");
      if (storedAppearance) {
        console.log("storedAppearance", storedAppearance);
        setAppearance(storedAppearance);
      }
    }

    async function fetchLastUpdate() {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/jvalentee/yieldhouse-data/main/data/lastUpdate.json"
        );
        if (response.ok) {
          const data = await response.json();
          setLastUpdate(data);
        } else {
          console.error(
            "Failed to fetch lastUpdate.json:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching lastUpdate.json:", error);
      }
    }

    fetchLastUpdate();
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined" && appearance) {
      localStorage.setItem("appearance", appearance);
    }
    console.log("appearance", appearance);
  }, [appearance]);

  const muiTheme = createTheme({
    palette: {
      mode: appearance,
    },
  });

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
            appearance={appearance}
          >
            <ThemeProvider theme={muiTheme}>
              <Container maxWidth="640px" mx="2">
                <Header appearance={appearance} setAppearance={setAppearance} />
                <TestnetContextProvider testnet={testnet}>
                  {children}
                </TestnetContextProvider>
                <Flex direction="row" justify="between" mx="2" mb="2" mt="8">
                  <Flex direction="row" justify="center" gapX="2">
                    <CheckCircledIcon size="1" color="green" />
                    <Text size="1">
                      {"Updated " +
                        (lastUpdate &&
                          moment(lastUpdate.timestamp * 1000).fromNow())}
                    </Text>
                  </Flex>
                  {!pathname.startsWith("/details/") && (
                    <Flex direction="row" align="center" gapX="1">
                      <Text size="1" weight="light">
                        Testnet Environment
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
            </ThemeProvider>
          </Theme>
        </PrivyProvider>
      </body>
    </html>
  );
}
