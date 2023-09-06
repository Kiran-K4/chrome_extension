import { useEffect, useState } from "react";

import { useStorage } from "@plasmohq/storage/hook";

import "./font.css";
import "./popup-style.css";
import "@radix-ui/themes/styles.css";

import {
  PauseIcon,
  PlayIcon,
  ResetIcon,
  ResumeIcon
} from "@radix-ui/react-icons";
import { Box, Button, Flex, IconButton, Text, Theme } from "@radix-ui/themes";
import { Tabs } from "@radix-ui/themes";

import SettingsPage from "~tabs/settings-page";

const PomodoroPlayer = () => {
  const pomodoroFocusTarget = () => new Date().getTime() + 0.4 * 60 * 1000;
  const pomodoroPauseTarget = () => new Date().getTime() + 5 * 60 * 1000; // 5 minutes pause time
  // Retrieve the start time from storage

  const [focusStartTime, setFocusStartTime] = useStorage(
    "pom_focus_start_time"
  );
  const [pauseStartTime, setPauseStartTime] = useStorage(
    "pom_pause_start_time"
  );
  const [isPaused, setIsPaused] = useStorage("pom_focus_is_paused");

  const [remainingTime, setRemainingTime] = useState(calculateRemainingTime); // just store it, so we can read it bgscript, or make it influence a stored "isrunning" state

  // re-render on every focusStartTime change
  useEffect(() => {
    setRemainingTime(calculateRemainingTime());
    const timer = setInterval(() => {
      setRemainingTime(calculateRemainingTime());
    }, 1000);

    return () => clearInterval(timer);
  }, [focusStartTime, pauseStartTime]);

  const start = () => {
    setFocusStartTime(pomodoroFocusTarget());
    setPauseStartTime(null);
    setIsPaused(false);
  };

  const pause = () => {
    setPauseStartTime(pomodoroPauseTarget());
    setIsPaused(true);
  };

  const resume = () => {
    setFocusStartTime(pomodoroFocusTarget());
    setPauseStartTime(null);
    setIsPaused(false);
  };

  const reset = () => {
    setFocusStartTime(null);
    setPauseStartTime(null);
    setIsPaused(false);
  };

  function calculateRemainingTime() {
    const currentTime = new Date().getTime();

    const focusDifference = focusStartTime - currentTime;
    const pauseDifference = pauseStartTime - currentTime;

    if (
      focusStartTime &&
      (!pauseStartTime || focusDifference > pauseDifference)
    ) {
      const minutes = Math.floor(focusDifference / (1000 * 60));
      const seconds = Math.floor((focusDifference % (1000 * 60)) / 1000);
      return { minutes, seconds };
    } else if (pauseStartTime) {
      const minutes = Math.floor(pauseDifference / (1000 * 60));
      const seconds = Math.floor((pauseDifference % (1000 * 60)) / 1000);
      return { minutes, seconds };
    }

    return { minutes: 0, seconds: 0 };
  }

  function formatRemainingTime(remainingTime) {
    let timeText = "";

    if (remainingTime.minutes > 0) {
      timeText += `${remainingTime.minutes} minute${
        remainingTime.minutes > 1 ? "s" : ""
      }`;
    }

    if (remainingTime.minutes > 0 && remainingTime.seconds > 0) {
      timeText += " and ";
    }

    if (remainingTime.seconds > 0) {
      timeText += `${remainingTime.seconds} second${
        remainingTime.seconds > 1 ? "s" : ""
      }`;
    }

    if (timeText) {
      isPaused && (timeText += " of pause");
      timeText += " remaining";
    } else {
      timeText = "Break time!";
    }

    return timeText;
  }

  return (
    <div>
      <span>{formatRemainingTime(remainingTime)}</span>
      <br />
      <IconButton onClick={start} disabled={focusStartTime || pauseStartTime}>
        <PlayIcon width="16" height="16" />
      </IconButton>
      <IconButton onClick={pause} disabled={isPaused || !focusStartTime}>
        <PauseIcon width="16" height="16" />
      </IconButton>
      <IconButton onClick={resume} disabled={!isPaused}>
        <ResumeIcon width="16" height="16" />
      </IconButton>
      <IconButton onClick={reset} disabled={!focusStartTime && !pauseStartTime}>
        <ResetIcon width="16" height="16" />
      </IconButton>
    </div>
  );
};

function IndexPopup() {
  useEffect(() => {
    document.documentElement.setAttribute("class", "radix-themes dark"); // if something isn't getting styled, try moving it out
    // WA: Radix doesn't apply "dark" to root elem. Why?
  }, []);
  return (
    <Theme
      className="dark"
      accentColor="yellow"
      appearance="dark"
      panelBackground="solid"
      scaling="100%"
      radius="large">
      <Flex direction="column" gap="4">
        <Tabs.Root defaultValue="home">
          <Tabs.List size="2">
            <Tabs.Trigger value="home">Home</Tabs.Trigger>
            <Tabs.Trigger value="settings">Settings</Tabs.Trigger>
            <Tabs.Trigger value="account">Account</Tabs.Trigger>
          </Tabs.List>

          <Box px="4" pt="3" pb="2">
            <Tabs.Content value="account">
              <Text size="2">Welcome to focus bear.</Text>
            </Tabs.Content>

            <Tabs.Content value="home">
              <Text size="2">This will be the main control area.</Text>
              <div className="pomodoro_player">
                <h2>Pomodoro</h2>
                <PomodoroPlayer />
              </div>
            </Tabs.Content>

            <Tabs.Content value="settings">
              <SettingsPage />
            </Tabs.Content>
          </Box>
        </Tabs.Root>
      </Flex>
    </Theme>
  );
}

export default IndexPopup;
