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
  Theme
} from "@radix-ui/themes";

document.documentElement.setAttribute("class", "radix-themes dark"); // if something isn't getting styled, try moving it out
function SplashPage() {
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
        {/* // style={{
        //   marginTop: "15%",
        //   marginBottom: "25%",
        //   display: "flex",
        //   flexDirection: "column",
        //   alignItems: "center",
        //   padding: "10px"
        // }}> */}
        <img className="fblogo" src={fblogo} />
        <div className="decorator">
          <h1 className="sign">Not yet...✋</h1>
        </div>
        {/* <br></br> */}
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
              <Flex gap="3" mt="4" justify="end">
                <AlertDialog.Cancel>
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </AlertDialog.Cancel>
                <AlertDialog.Action>
                  <Button variant="solid" color="jade">
                    Add to Relax List
                  </Button>
                </AlertDialog.Action>
              </Flex>
            </AlertDialog.Content>
          </AlertDialog.Root>
          it to your Relax List?
        </Text>
        {/* <Text size="2">it to your Relax List?</Text> */}
      </Flex>
      {/* </Flex> */}
    </Theme>
  );
}

export default SplashPage;
