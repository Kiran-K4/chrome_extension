import fblogo from "data-base64:/assets/fblogo.svg";

import "./splash-style.css";
import "@radix-ui/themes/styles.css";

import { PlusIcon } from "@radix-ui/react-icons";
import {
  AlertDialog,
  Button,
  Flex,
  Section,
  Text,
  TextArea,
  Theme
} from "@radix-ui/themes";
import { get } from "http";
import { useEffect, useState } from "react";

import { useStorage } from "@plasmohq/storage/hook";

document.documentElement.setAttribute("class", "radix-themes dark");
function SplashPage() {
  const [relaxList, setRelaxList] = useStorage("relax_list");
  const [blockedURL, setBlockedURL] = useState<string>("");
  // Extract domain name from a URL
  const getURL = () => {
    chrome.runtime.sendMessage({ action: "getLastBlockedURL" }, (response) => {
      console.log("url spl: ", response);
      setBlockedURL(response.url);
    });
  };

  useEffect(() => {
    getURL();
  }, []);

  function addToRelaxed() {
    let currentList = [];

    // Try to parse relaxList from JSON string to array
    try {
      if (relaxList) {
        currentList = JSON.parse(relaxList);
      }
    } catch (err) {
      console.error("Failed to parse relaxList", err);
    }

    // Ensure the parsed result is an array
    if (!Array.isArray(currentList)) {
      currentList = [];
    }

    // Check if the previous site is already in the list
    if (blockedURL && !currentList.includes(blockedURL)) {
      // Add the previous site to the list
      const updatedList = [...currentList, blockedURL];
      // Convert back to JSON string and save
      setRelaxList(JSON.stringify(updatedList));
    }
    console.log("relaxed_list:", relaxList);
  }

  return (
    <Theme
      className="dark"
      accentColor="yellow"
      appearance="dark"
      panelBackground="solid"
      scaling="100%"
      radius="large">
      <Section></Section>
      <Flex direction="column" align="center" gap="5">
        <img className="fblogo" src={fblogo} />
        <div className="decorator">
          <h1 className="sign">Not yet...✋</h1>
        </div>
        <Text size="4">
          Try focusing on your work, that way you will be finished earlier!🐻 If
          you wish to unblock this page, remove it from the{" "}
          <a className="addBtn" href="/tabs/settings-page.html">
            blocked list
          </a>
          .
        </Text>
        <Text size="2">
          It would appear that you've blocked this site. Would you like to
          <AlertDialog.Root>
            <AlertDialog.Trigger>
              <Text
                className="addBtn"
                style={{ marginRight: "2px", marginLeft: "2px" }}
                color="jade">
                add
              </Text>
            </AlertDialog.Trigger>
            <AlertDialog.Content style={{ maxWidth: 450 }}>
              <AlertDialog.Title>Add to Relax List</AlertDialog.Title>
              <AlertDialog.Description size="2">
                Are you sure? This site will no longer be blocked and you might
                spend too much time on it.
              </AlertDialog.Description>
              <TextArea
                my="2"
                size="2"
                placeholder="I would like to..."
                color="jade"
                variant="soft"></TextArea>
              <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                  <Button variant="solid" color="jade" onClick={addToRelaxed}>
                    <PlusIcon width="16" height="16"></PlusIcon>
                    Add to Relax List
                  </Button>
                </AlertDialog.Action>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>
          it to your Relax List?
        </Text>
      </Flex>
    </Theme>
  );
}

export default SplashPage;
