import { Flex, Text, Heading, Button } from "@radix-ui/themes";
import { usePrivy, useWallets } from "@privy-io/react-auth";
import Link from "next/link";

export default function Header() {
  const { connectOrCreateWallet, logout } = usePrivy();
  const { ready, wallets } = useWallets();

  console.log("wallets", wallets);

  // Disable login when Privy is not ready or the user is already authenticated
  const connected = !ready || (ready && wallets.length > 0);

  return (
    <Flex justify="between" direction="row" mt="2" mb="6" align="center">
      <Flex direction="row" align="center">
        <Link href="/">
          <Heading weight="medium">yield.🏠</Heading>
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
      <Button
        variant={connected ? "outline" : "soft"}
        onClick={connected ? wallets[0]?.disconnect : connectOrCreateWallet}
      >
        {connected ? "disconnect" : "connect"}
      </Button>
    </Flex>
  );
}
