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

export default function AssetTable({ selectedChains, selectedAssetTypes }) {
  const [tableData, setTableData] = useState([]);

  useEffect(() => {
    // Filter data based on selected chains and asset types
    const filteredData = data.filter((asset) => {
      // Check if the asset's chain is included in selected chains
      const chainMatch =
        selectedChains.length === 0 || selectedChains.includes(asset.chain);
      // Check if the asset's type is included in selected asset types
      const typeMatch =
        selectedAssetTypes.length === 0 ||
        selectedAssetTypes.includes(asset.type);
      return chainMatch && typeMatch;
    });

    setTableData(filteredData);
  }, [selectedChains, selectedAssetTypes]);

  return (
    <Table.Root>
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>Asset (Chain)</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>APY</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>TVL</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Type</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Risk</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>

      <Table.Body>
        {tableData.map((row, index) => (
          <Table.Row key={index}>
            <Table.RowHeaderCell>
              {row.asset + " (" + row.chain + ")"}
            </Table.RowHeaderCell>
            <Table.Cell>{row.apy * 100 + "%"}</Table.Cell>
            <Table.Cell>{row.tvl + " $"}</Table.Cell>
            <Table.Cell>{row.type}</Table.Cell>
            <Table.Cell>{row.risk}</Table.Cell>
            <Table.Cell>Deposit</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
