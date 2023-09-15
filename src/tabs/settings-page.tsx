import { useEffect, useState } from "react";

import { Storage } from "@plasmohq/storage";

import { ListType } from "~types";

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
  TextField
} from "@radix-ui/themes";

import TimePicker from "~components/time-picker";

const BlockList = () => {
  const storage = new Storage(); // ref
  const [blockedPages, setBlockedPages] = useState([]);
  const [newPage, setNewPage] = useState("");

  useEffect(() => {
    document.documentElement.setAttribute("class", "dark"); // if something isn't getting styled, try moving it out
    const loadPages = async () => {
      const blockedPagesData = await storage.get("blocked_list");
      console.log("obj:", blockedPagesData);
      console.log("objParsed:", JSON.parse(blockedPagesData));
      setBlockedPages(JSON.parse(blockedPagesData));
    };

    loadPages();
  }, []);

  const handleAddPage = async () => {
    console.log("add clicked...");
    const updatedBlockedPages = [...blockedPages, newPage];
    setBlockedPages(updatedBlockedPages);
    await storage.set(
      ListType.BLOCKED_LIST,
      JSON.stringify(updatedBlockedPages)
    );
    setNewPage("");
  };

  const handleDeletePage = async (index) => {
    const updatedBlockedPages = [...blockedPages];
    updatedBlockedPages.splice(index, 1);
    setBlockedPages(updatedBlockedPages);
    await storage.set(
      ListType.BLOCKED_LIST,
      JSON.stringify(updatedBlockedPages)
    );
  };

  return (
    <Box>
      <Flex direction="column" gap="3">
        <Flex direction="column" gap="1">
          <Heading as="h2">Blocklist</Heading>
          <Flex direction="row" gap="1" align="baseline">
            <TextField.Root>
              <TextField.Slot>
                <CodeIcon height="16" width="16" />
              </TextField.Slot>
              <TextField.Input
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

            <Button variant="classic" onClick={handleAddPage}>
              <PlusIcon width="16" height="16" /> Add
            </Button>
          </Flex>

          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>URL/Keyword</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>
                  Maybe some stat?
                </Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {blockedPages.map((page, index) => (
                <Table.Row key={index}>
                  <Table.RowHeaderCell>{page}</Table.RowHeaderCell>
                  <Table.Cell>lorem ipsum dolor sit aaaa met!</Table.Cell>
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
        <Flex direction="column" gap="2">
          <Heading as="h2">Relax List</Heading>
          <Table.Root variant="surface">
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>URL</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Reason</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell></Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>

            <Table.Body>
              {blockedPages.map((page, index) => (
                <Table.Row key={index}>
                  <Table.RowHeaderCell>{page}</Table.RowHeaderCell>
                  <Table.Cell>
                    bla bla bla to... asdada dadas adasdadad ad asd asd asa das
                    asd ad asd as asd ad ad a asd ada d sd ad d{" "}
                  </Table.Cell>
                  <Table.Cell>
                    <IconButton
                      // onClick={() => handleDeletePage(index)}
                      color="jade"
                      variant="ghost">
                      <MinusIcon width="18" height="18"></MinusIcon>
                    </IconButton>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Flex>
      </Flex>
    </Box>
  );
};

function SettingsPage() {
  return (
    <Flex direction="column" gap="3">
      <BlockList />
      <Heading as="h2">Hours</Heading>
      <TimePicker />
    </Flex>
  );
}

export default SettingsPage;
