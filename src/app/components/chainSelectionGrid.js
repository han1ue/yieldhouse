import {
  Flex,
  Text,
  Button,
  IconButton,
  Grid,
  TextField,
  Table,
  Box,
} from "@radix-ui/themes";
import Image from "next/image";

export default function ChainSelectionGrid(props) {
  return (
    <Grid columns="3" gap="2">
      <Box align="center">
        <IconButton
          color={!props.selectedChains.includes("Ethereum") && "gray"}
          variant="surface"
          size="3"
          onClick={() => props.handleClickChain("Ethereum")}
        >
          <Image src="/images/chains/ethereum.png" width={25} height={25} />
        </IconButton>
      </Box>
      <Box align="center">
        <IconButton
          color={!props.selectedChains.includes("Arbitrum") && "gray"}
          variant="outline"
          size="3"
          onClick={() => props.handleClickChain("Arbitrum")}
        >
          <Image src="/images/chains/arbitrum.png" width={25} height={25} />
        </IconButton>
      </Box>
      <Box align="center">
        <IconButton
          color={!props.selectedChains.includes("Base") && "gray"}
          variant="outline"
          size="3"
          onClick={() => props.handleClickChain("Base")}
        >
          <Image src="/images/chains/base.png" width={25} height={25} />
        </IconButton>
      </Box>
    </Grid>
  );
}
