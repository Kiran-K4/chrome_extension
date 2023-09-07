import { useEffect, useState } from "react";

import { Storage } from "@plasmohq/storage";

import "./settings-style.css";

import {
  CodeIcon,
  MinusIcon,
  PlusIcon,
  TrashIcon
} from "@radix-ui/react-icons";
import {
  Box,
  Button,
  Flex,
  Heading,
  IconButton,
  Kbd,
  Table,
  TextField,
  Theme
} from "@radix-ui/themes";

import TimePicker from "~components/time-picker";

const BlockList = () => {
  const storage = new Storage(); // ref
  const [blockedPages, setBlockedPages] = useState([]);
  const [newPage, setNewPage] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("class", "dark"); // if something isn't getting styled, try moving it out
    const loadPages = async () => {
      const blockedPagesData = await storage.get("blocked");
      console.log("obj:", blockedPagesData);
      console.log("objParsed:", JSON.parse(blockedPagesData));
      setBlockedPages(JSON.parse(blockedPagesData));
    };

    loadPages();
  }, []);

  const handleAddPage = async () => {
    const updatedBlockedPages = [...blockedPages, newPage];
    setBlockedPages(updatedBlockedPages);
    await storage.set("blocked", JSON.stringify(updatedBlockedPages));
    setNewPage("");
  };

  const handleDeletePage = async (index) => {
    const updatedBlockedPages = [...blockedPages];
    updatedBlockedPages.splice(index, 1);
    setBlockedPages(updatedBlockedPages);
    await storage.set("blocked", JSON.stringify(updatedBlockedPages));
  };

  return (
    <Box>
      <Heading as="h2">List</Heading>
      <Flex direction="column" gap="2">
        <Flex direction="row" gap="1" align="baseline">
          <TextField.Root>
            <TextField.Slot>
              <CodeIcon height="16" width="16" />
            </TextField.Slot>
            <TextField.Input
              // color="crimson"
              // variant="soft"
              value={newPage}
              placeholder="Enter an url..."
              onChange={(e) => setNewPage(e.target.value)}
              size="3"
            />
            <TextField.Slot pr="3">
              {/* todo: make it morph into 'enter' on focus */}
              <Kbd>Ctrl + /</Kbd>
            </TextField.Slot>
          </TextField.Root>

          <Button variant="classic">
            <PlusIcon width="16" height="16" onClick={handleAddPage} /> Add
          </Button>
        </Flex>

        <Table.Root variant="surface">
          <Table.Header>
            <Table.Row>
              <Table.ColumnHeaderCell>URL/Keyword</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell>Maybe some stat?</Table.ColumnHeaderCell>
              <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
            </Table.Row>
          </Table.Header>

          <Table.Body>
            {blockedPages.map((page, index) => (
              <Table.Row key={index}>
                <Table.RowHeaderCell>{page}</Table.RowHeaderCell>
                <Table.Cell>lorem</Table.Cell>
                <Table.Cell>
                  <IconButton
                    onClick={() => handleDeletePage(index)}
                    color="crimson"
                    variant="ghost">
                    <MinusIcon width="18" height="18"></MinusIcon>
                  </IconButton>
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table.Root>
      </Flex>
    </Box>
  );
};

function SettingsPage() {
  return (
    <Flex direction="column" gap="3">
      <BlockList />
      {/* <h2>Working hours</h2> */}
      <Heading as="h2">Hours</Heading>
      <TimePicker />
    </Flex>
  );
}

export default SettingsPage;
