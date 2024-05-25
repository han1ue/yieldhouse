import {
  Flex,
  Switch,
  Text,
  Popover,
  Button,
  TextField,
  Box,
} from "@radix-ui/themes";
import moment from "moment";
import { useState, useEffect } from "react";
import { GearIcon } from "@radix-ui/react-icons";
import { CheckCircledIcon } from "@radix-ui/react-icons";

export default function Footer(props) {
  const [lastUpdate, setLastUpdate] = useState();

  useEffect(() => {
    async function fetchLastUpdate() {
      try {
        const response = await fetch(
          "https://raw.githubusercontent.com/jvalentee/yieldhouse-data/main/data/lastUpdate.json"
        );
        if (response.ok) {
          const data = await response.json();
          setLastUpdate(data);
        } else {
          console.error(
            "Failed to fetch lastUpdate.json:",
            response.statusText
          );
        }
      } catch (error) {
        console.error("Error fetching lastUpdate.json:", error);
      }
    }

    fetchLastUpdate();
  }, []);

  return (
    <Flex direction="row" justify="between" align="center" mx="2" mb="2" mt="8">
      <Flex direction="row" justify="center" gapX="2">
        <CheckCircledIcon size="1" color="green" />
        <Text size="1">
          {"Updated " +
            (lastUpdate && moment(lastUpdate.timestamp * 1000).fromNow())}
        </Text>
      </Flex>
      <Popover.Root>
        <Popover.Trigger>
          <Button variant="ghost" color="gray">
            <GearIcon width="20" height="20" />
          </Button>
        </Popover.Trigger>
        <Popover.Content size="1">
          <Flex direction="column" gapY="2">
            <Flex direction="row" align="center" justify="between" gapX="2">
              <Text size="1" weight="light">
                Items per page
              </Text>
              <Box width="40px">
                <TextField.Root
                  size="1"
                  placeholder="10"
                  type="number"
                  defaultValue={props.settings.itemsPerPage}
                  onChange={(e) =>
                    props.setSettings({
                      testnet: props.settings.testnet,
                      itemsPerPage: parseInt(
                        e.target.value ? e.target.value : 10
                      ),
                    })
                  }
                />
              </Box>
            </Flex>

            <Flex direction="row" align="center" justify="between" gapX="2">
              <Text size="1" weight="light">
                Testnet
              </Text>
              <Switch
                size="1"
                checked={props.settings.testnet}
                onCheckedChange={() =>
                  props.setSettings({
                    testnet: !props.settings.testnet,
                    itemsPerPage: props.settings.itemsPerPage,
                  })
                }
              />
            </Flex>
          </Flex>
        </Popover.Content>
      </Popover.Root>
    </Flex>
  );
}
