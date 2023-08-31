import { useEffect, useState } from "react";

import { useStorage } from "@plasmohq/storage/hook";

import "./font.css";
import "./popup-style.css";

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
    setPauseStartTime(null); // Clear the timer
    setIsPaused(false);
    // setIsRunning();
  };
  const pause = () => {
    if (!isPaused) {
      setPauseStartTime(pomodoroPauseTarget());
      setFocusStartTime(null);
      setIsPaused(true);
    } else {
      setFocusStartTime(pomodoroFocusTarget());
      setPauseStartTime(null);
      setIsPaused(false);
    }
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
      <br></br>
      <button onClick={() => start()}>Start</button>
      {(focusStartTime || isPaused) && (
        <button onClick={pause}>
          {isPaused ? "Resume Focus" : "Pause for 5min"}
        </button>
      )}
    </div>
  );
};

function IndexPopup() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        padding: 16
      }}>
      <h1>
        Welcome to focus bear{" "}
        <a href="/tabs/settings-page.html">Settings inline</a>
      </h1>
      <button
        onClick={() => {
          chrome.tabs.create({ url: "/tabs/settings-page.html" });
        }}>
        {" "}
        Settings page
      </button>
      <div className="pomodoro_player">
        <h2>Pomodoro</h2>
        <PomodoroPlayer />
      </div>
    </div>
  );
}

export default IndexPopup;
