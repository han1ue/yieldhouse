import { Flex, Text, Heading, Button } from "@radix-ui/themes";
import { usePrivy } from "@privy-io/react-auth";

export default function Header() {
  const { ready, authenticated, login, logout } = usePrivy();
  // Disable login when Privy is not ready or the user is already authenticated
  const loggedIn = !ready || (ready && authenticated);

  return (
    <Flex justify="between" direction="row" my="2" align="center">
      <Flex direction="row" align="center">
        <Heading weight="medium">yield.🏠</Heading>
        <Flex direction="row" mx="5" gapX="2">
          {loggedIn && (
            <Button size="1" variant="soft">
              Dashboard
            </Button>
          )}
          <Button size="1" variant="soft">
            Twitter
          </Button>
          <Button size="1" variant="soft">
            About
          </Button>
        </Flex>
      </Flex>
      <Button
        variant={loggedIn ? "outline" : "soft"}
        onClick={loggedIn ? logout : login}
      >
        {loggedIn ? "disconnect" : "connect"}
      </Button>
    </Flex>
  );
}
