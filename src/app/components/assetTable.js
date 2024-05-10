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
import data from "/public/data.json";
import Image from "next/image";
import { CircularProgressbar, buildStyles } from "react-circular-progressbar";
import "react-circular-progressbar/dist/styles.css";

export default function AssetTable({
  selectedChains,
  selectedAssetTypes,
  searchQuery,
}) {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    // Filter data based on selected chains, asset types, and search query
    const filteredData = data.filter((asset) => {
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
  }, [selectedChains, selectedAssetTypes, searchQuery]);

  function getColorForRisk(risk) {
    const hue = (1 - risk / 10) * 120; // Calculate hue value for the HSL color space
    return `hsl(${hue}, 100%, 40%)`; // Generate color based on hue, saturation, and lightness
  }

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
                    src={"/images/assets/" + row.asset.toLowerCase() + ".svg"}
                    width={24}
                    height={24}
                  />
                </Box>
                <Flex direction="roq" align="start">
                  <Text size="3" weight="medium" ml="2" trim="start">
                    {row.asset}
                  </Text>
                  {row.type == "LP" && (
                    <Text size="1" color="gray" ml="1">
                      {"/ " + row.baseAsset}
                    </Text>
                  )}
                </Flex>
              </Flex>
              <Text size="1" weight="light">
                {row.protocol + " • " + row.chain}{" "}
              </Text>
            </Table.RowHeaderCell>
            <Table.Cell>{row.apy * 100 + "%"}</Table.Cell>
            <Table.Cell>{row.tvl + " $"}</Table.Cell>
            <Table.Cell>{row.type}</Table.Cell>
            <Table.Cell>
              <div style={{ width: 32, height: 32 }}>
                <CircularProgressbar
                  value={row.risk}
                  strokeWidth={10}
                  maxValue={10}
                  text={row.risk}
                  styles={buildStyles({
                    // Text size
                    textSize: "48px",

                    // Colors
                    pathColor: getColorForRisk(row.risk),
                    textColor: getColorForRisk(row.risk),
                  })}
                />
              </div>
            </Table.Cell>
            <Table.Cell>
              <Button variant="soft">Deposit</Button>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
