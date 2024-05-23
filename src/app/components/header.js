import { Flex, Text, Heading, Button } from "@radix-ui/themes";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import Link from "next/link";
import { DarkModeSwitch } from "react-toggle-dark-mode";
import Image from "next/image";

export default function Header(props) {
  const { connectOrCreateWallet } = usePrivy();
  const { ready, wallets } = useWallets();

  console.log("wallets", wallets);

  // Disable login when Privy is not ready or the user is already authenticated
  const connected = !ready || (ready && wallets.length > 0);

  return (
    <Flex justify="between" direction="row" mt="2" mb="6" align="center">
      <Flex direction="row" align="center" gapX="1">
        <Link href="/">
          <Flex direction="row" align="center" gapX="1">
            <Heading trim="end" weight="medium">
              yield.
            </Heading>
            <Image src="/images/logo/icon.png" width="28" height="28" />
          </Flex>
        </Link>
        <Flex direction="row" mx="5" gapX="2">
          {/* {connected && (
            <Link href="/dashboard">
              <Button size="1" variant="soft">
                Dashboard
              </Button>
            </Link>
          )} */}

          <Link href="/">
            <Button size="1" variant="soft">
              Yields
            </Button>
          </Link>

          <Link href="/about">
            <Button size="1" variant="soft">
              About
            </Button>
          </Link>
        </Flex>
      </Flex>
      <Flex direction="row" align="center" gapX="4">
        <Button
          variant={connected ? "outline" : "soft"}
          onClick={connected ? wallets[0]?.disconnect : connectOrCreateWallet}
        >
          {connected ? "disconnect" : "connect wallet"}
        </Button>
        <DarkModeSwitch
          checked={props.appearance == "dark"}
          onChange={() =>
            props.setAppearance(props.appearance == "dark" ? "light" : "dark")
          }
          size={24}
        />
      </Flex>
    </Flex>
  );
}
