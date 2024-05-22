import React, { useState, useEffect } from "react";
import {
  Flex,
  Text,
  Button,
  IconButton,
  Grid,
  TextField,
  Table,
  Badge,
  Box,
} from "@radix-ui/themes";
import moment from "moment";
import Image from "next/image";
import { ThickArrowUpIcon, ThickArrowDownIcon } from "@radix-ui/react-icons";
import "react-circular-progressbar/dist/styles.css";
import Link from "next/link";
import { useTestnetContext } from "../components/TestnetContext";
import RiskIndicator from "./riskIndicator";

export default function AssetTable({
  selectedChains,
  selectedAssetTypes,
  searchQuery,
}) {
  const [yieldsData, setYieldsData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const testnet = useTestnetContext();
  const [sortConfig, setSortConfig] = useState({
    key: null,
    direction: null,
  });

  // Fetch data when testnet context changes
  useEffect(() => {
    async function fetchData() {
      const response = await fetch(
        testnet
          ? "https://raw.githubusercontent.com/jvalentee/yieldhouse-data/main/data/yieldsTestnet.json"
          : "https://raw.githubusercontent.com/jvalentee/yieldhouse-data/main/data/yields.json"
      );
      const data = await response.json();
      setYieldsData(data);
    }

    fetchData();
  }, [testnet]);

  useEffect(() => {
    // Filter data based on selected chains, asset types, and search query
    var filteredData = yieldsData.filter((yieldData) => {
      // Check if the asset's chain is included in selected chains
      const chainMatch =
        selectedChains.length === 0 ||
        selectedChains.includes(yieldData.chain.name);
      // Check if the asset's type is included in selected asset types
      const typeMatch =
        selectedAssetTypes.length === 0 ||
        yieldData.type.some((type) => selectedAssetTypes.includes(type));
      // Check if the asset contains the search query in its name or chain
      const searchMatch =
        searchQuery === "" ||
        yieldData.asset.name
          .toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        yieldData.protocol.toLowerCase().includes(searchQuery.toLowerCase());
      return chainMatch && typeMatch && searchMatch;
    });

    if (sortConfig.key) {
      filteredData = sortData(
        filteredData,
        sortConfig.key,
        sortConfig.direction
      );
    }

    setTableData(filteredData);

    // Sort data if sortConfig is set
  }, [selectedChains, selectedAssetTypes, searchQuery, yieldsData]);

  function sortData(data, key, direction) {
    setSortConfig({ key, direction });

    console.log("Sorting by", key, direction);

    const sortedData = [...data].sort((a, b) => {
      if (key == "apy") {
        a = a.apy.value;
        b = b.apy.value;
      } else {
        a = a[key];
        b = b[key];
      }

      console.log("Sorting", Number(a), Number(b));
      if (Number(a) < Number(b)) {
        console.log("a < b");
        return direction == "ascending" ? -1 : 1;
      }
      if (Number(a) > Number(b)) {
        console.log("a > b");
        return direction == "descending" ? -1 : 1;
      }
      return 0;
    });

    return sortedData;
  }

  const renderSortIcons = (key) => {
    return (
      <Flex direction="column" align="center">
        <ThickArrowUpIcon
          style={{ cursor: "pointer" }}
          onClick={() => {
            const sortedData = sortData(tableData, key, "ascending");
            setTableData(sortedData);
          }}
          color={
            sortConfig.key === key && sortConfig.direction === "ascending"
              ? "green"
              : "black"
          }
        />
        <ThickArrowDownIcon
          style={{ cursor: "pointer" }}
          onClick={() => {
            const sortedData = sortData(tableData, key, "descending");
            setTableData(sortedData);
          }}
          color={
            sortConfig.key === key && sortConfig.direction === "descending"
              ? "green"
              : "black"
          }
        />
      </Flex>
    );
  };

  const formatTime = (timestamp) => {
    const now = moment();
    const end = moment(timestamp * 1000);
    const daysDifference = end.diff(now, "days");

    if (daysDifference >= 3) {
      return `${daysDifference} days`;
    } else {
      return end.fromNow();
    }
  };

  return (
    <Table.Root variant="ghost" size="1">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell>
            <Flex mt="1">
              <Text size="2">Asset</Text>
            </Flex>
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <Flex direction="row" align="center" gap="1">
              <Text size="2">APY</Text>
              <Box>{renderSortIcons("apy")}</Box>
            </Flex>
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <Flex direction="row" align="center" gap="1">
              <Box>TVL</Box>
              <Box>{renderSortIcons("tvl")}</Box>
            </Flex>
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <Flex mt="1">
              <Text size="2">Type</Text>
            </Flex>
          </Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>
            <Flex mt="1">
              <Text size="2">Risk</Text>
            </Flex>
          </Table.ColumnHeaderCell>
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
                <Flex direction="row" align="start">
                  <Text size="3" weight="medium" ml="2" trim="start">
                    {row.asset.name}
                  </Text>
                  {row.type == "LP" && (
                    <Text size="1" color="gray" ml="1">
                      {"/ " + row.baseAsset}
                    </Text>
                  )}
                  {row.apy.type == "fixed" && (
                    <Text size="1" color="gray" ml="1">
                      {"(" + formatTime(row.apy.maturityTimestamp) + ")"}
                    </Text>
                  )}
                </Flex>
              </Flex>
              <Text size="1" weight="light">
                {row.protocol + " • " + row.chain.name}{" "}
              </Text>
            </Table.RowHeaderCell>
            <Table.Cell>
              <Flex direction="column" gap="1">
                <Flex>{Number(row.apy.value * 100).toFixed(2) + "%"}</Flex>
                <Flex>
                  <Badge variant="soft" color="blue" size="1" radius="large">
                    {row.apy.type}
                  </Badge>
                </Flex>
              </Flex>
            </Table.Cell>
            <Table.Cell>
              {Intl.NumberFormat("en-US", {
                notation: "compact",
                maximumFractionDigits: 2,
              }).format(row.tvl) + " $"}
            </Table.Cell>
            <Table.Cell>
              <Flex direction="column" gap="1" display="inline-flex">
                {row.type.map((type, i) => (
                  <Badge key={i} variant="soft" color="iris" radius="large">
                    {type}
                  </Badge>
                ))}
              </Flex>
            </Table.Cell>
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
