import React, { useState, useEffect } from "react";
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
import yields from "/public/mockData/yields.json";
import yieldsTestnet from "/public/mockData/yieldsTestnet.json";
import Image from "next/image";
import "react-circular-progressbar/dist/styles.css";
import Link from "next/link";
import { useTestnetContext } from "../components/TestnetContext";
import RiskIndicator from "./riskIndicator";

export default function AssetTable({
  selectedChains,
  selectedAssetTypes,
  searchQuery,
}) {
  const [tableData, setTableData] = useState([]);
  const testnet = useTestnetContext();

  useEffect(() => {
    const yieldsData = testnet ? yieldsTestnet : yields;
    // Filter data based on selected chains, asset types, and search query
    const filteredData = yieldsData.filter((asset) => {
      // Check if the asset's chain is included in selected chains
      const chainMatch =
        selectedChains.length === 0 || selectedChains.includes(asset.chain);
      // Check if the asset's type is included in selected asset types
      const typeMatch =
        selectedAssetTypes.length === 0 ||
        selectedAssetTypes.includes(asset.type);
      // Check if the asset contains the search query in its name or chain
      const searchMatch =
        searchQuery === "" ||
        asset.asset.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.protocol.toLowerCase().includes(searchQuery.toLowerCase());
      return chainMatch && typeMatch && searchMatch;
    });

    setTableData(filteredData);
  }, [selectedChains, selectedAssetTypes, searchQuery, testnet]);

  return (
    <Table.Root variant="ghost" size="1">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Asset</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>APY</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>TVL</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Risk</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {tableData.map((row, index) => (
          <Table.Row key={index} align="center">
            <Table.RowHeaderCell>
              <Flex direction="row" align="center">
                <Box>
                  <Image
                    src={
                      "/images/assets/" + row.asset.name.toLowerCase() + ".svg"
                    }
                    width={24}
                    height={24}
                  />
                </Box>
                <Flex direction="roq" align="start">
                  <Text size="3" weight="medium" ml="2" trim="start">
                    {row.asset.name}
                  </Text>
                  {row.type == "LP" && (
                    <Text size="1" color="gray" ml="1">
                      {"/ " + row.baseAsset}
                    </Text>
                  )}
                </Flex>
              </Flex>
              <Text size="1" weight="light">
                {row.protocol + " • " + row.chain.name}{" "}
              </Text>
            </Table.RowHeaderCell>
            <Table.Cell>{row.apy * 100 + "%"}</Table.Cell>
            <Table.Cell>{row.tvl + " $"}</Table.Cell>
            <Table.Cell>{row.type}</Table.Cell>
            <Table.Cell>
              <RiskIndicator risk={row.risk} size={32} textSize={48} />
            </Table.Cell>
            <Table.Cell>
              <Flex direction="row" width="90%" justify="end">
                <Link href={"/details/" + index}>
                  <Button variant="soft">Deposit</Button>
                </Link>
              </Flex>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
