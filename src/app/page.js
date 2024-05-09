"use client";

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
import { useState } from "react";
import Image from "next/image";
import {
  FaceIcon,
  ImageIcon,
  SunIcon,
  MagnifyingGlassIcon,
} from "@radix-ui/react-icons";
import AssetTable from "./components/assetTable";

export default function Home() {
  const [selectedChains, setSelectedChains] = useState([]);
  const [selectedAssetTypes, setSelectedAssetTypes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const handleClickChain = (chain) => {
    if (selectedChains.includes(chain)) {
      setSelectedChains(selectedChains.filter((c) => c !== chain));
    } else {
      setSelectedChains([...selectedChains, chain]);
    }
  };

  const handleClickAssetType = (assetType) => {
    if (selectedAssetTypes.includes(assetType)) {
      setSelectedAssetTypes(
        selectedAssetTypes.filter((type) => type !== assetType)
      );
    } else {
      setSelectedAssetTypes([...selectedAssetTypes, assetType]);
    }
  };
  return (
    <Flex direction="column" gap="6">
      <Flex direction="row" justify="between">
        <Flex direction="column" gap="2" width="300px">
          <TextField.Root
            onChange={(e) => setSearchQuery(e.target.value)}
            variant="surface"
            radius="large"
            placeholder="Search for an asset"
          >
            <TextField.Slot>
              <MagnifyingGlassIcon height="16" width="16" />
            </TextField.Slot>
          </TextField.Root>
          <Grid columns="4" gap="1">
            <Button
              size="1"
              color="gray"
              variant={selectedAssetTypes.includes("Stable") ? "solid" : "soft"}
              onClick={() => handleClickAssetType("Stable")}
            >
              Stables
            </Button>
            <Button
              size="1"
              color="gray"
              variant={
                selectedAssetTypes.includes("Lending") ? "solid" : "soft"
              }
              onClick={() => handleClickAssetType("Lending")}
            >
              Lending
            </Button>
            <Button
              size="1"
              color="gray"
              variant={selectedAssetTypes.includes("LP") ? "solid" : "soft"}
              onClick={() => handleClickAssetType("LP")}
            >
              LPs
            </Button>
            <Button
              size="1"
              color="gray"
              variant={selectedAssetTypes.includes("LST") ? "solid" : "soft"}
              onClick={() => handleClickAssetType("LST")}
            >
              LSDs
            </Button>
            <Button
              size="1"
              color="gray"
              variant={selectedAssetTypes.includes("LRT") ? "solid" : "soft"}
              onClick={() => handleClickAssetType("LRT")}
            >
              LRTs
            </Button>
          </Grid>
        </Flex>
        <Grid columns="3" gap="2">
          <Box align="center">
            <IconButton
              color={!selectedChains.includes("Ethereum") && "gray"}
              variant="surface"
              size="3"
              onClick={() => handleClickChain("Ethereum")}
            >
              <Image src="/images/chains/ethereum.png" width={25} height={25} />
            </IconButton>
          </Box>
          <Box align="center">
            <IconButton
              color={!selectedChains.includes("Arbitrum") && "gray"}
              variant="outline"
              size="3"
              onClick={() => handleClickChain("Arbitrum")}
            >
              <Image src="/images/chains/arbitrum.png" width={25} height={25} />
            </IconButton>
          </Box>
          <Box align="center">
            <IconButton
              color={!selectedChains.includes("Base") && "gray"}
              variant="outline"
              size="3"
              onClick={() => handleClickChain("Base")}
            >
              <Image src="/images/chains/base.png" width={25} height={25} />
            </IconButton>
          </Box>
        </Grid>
      </Flex>
      <AssetTable
        selectedChains={selectedChains}
        selectedAssetTypes={selectedAssetTypes}
        searchQuery={searchQuery}
      />
    </Flex>
  );
}
