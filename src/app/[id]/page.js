"use client";

import {
  Flex,
  Text,
  Button,
  Heading,
  IconButton,
  Grid,
  TextField,
  Table,
  Box,
} from "@radix-ui/themes";

import data from "/public/mockData.json";

export default function YieldPage({ params }) {
  const yieldDetails = data[params.id];
  return (
    <>
      {yieldDetails ? (
        <Flex direction="column" gap="4">
          <div>ID: {params.id}</div>
          <div>Asset: {yieldDetails.asset}</div>
        </Flex>
      ) : (
        <div>Invalid ID</div>
      )}
    </>
  );
}
