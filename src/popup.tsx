import { useEffect, useState } from "react";

import { useStorage } from "@plasmohq/storage/hook";

import "./popup-style.css";

const PomodoroPlayer = () => {
  // Predefined target time of 30 seconds (0.5 minutes)
  const pomodoroTarget = () => new Date().getTime() + 1.5 * 60 * 1000;

  // Retrieve or initialize the start time from storage
  // const [startTime, setStartTime] = useStorage("startTime");
  const [startTime, setStartTime] = useState(null);

  const [remainingTime, setRemainingTime] = useState({});

  useEffect(() => {
    // When component first mounts, send a message to get pomodoro_start_time
    const getStartTimeFromBackground = async () => {
      const response = await chrome.runtime.sendMessage({
        action: "get_pomodoro_start_time"
      });
      console.log("start response!!: 🤔", response);
      setStartTime(response.start_time);
    };

    getStartTimeFromBackground();
  }, []);

  // re-render on every startTime change
  useEffect(() => {
    const timer = setInterval(() => {
      if (startTime) {
        setRemainingTime(calculateRemainingTime());
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [startTime]);

  const saveStartTimeToStorage = async (startTime) => {
    console.log("startTime:", startTime);
    setStartTime(startTime);

    const response = await chrome.runtime.sendMessage({
      action: "set_pomodoro_start_time",
      start_time: startTime
    });
    // do something with response here, not outside the function
    console.log(response);
  };

  function calculateRemainingTime() {
    const currentTime = new Date().getTime();
    const difference = startTime - currentTime;

    const minutes = Math.floor(difference / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);

    console.log(
      "difference:",
      difference,
      "minutes:",
      minutes,
      "seconds:",
      seconds
    );
    return { minutes, seconds };
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
      timeText += " remaining";
    } else {
      timeText = "Break time!";
    }

    return timeText;
  }

  return (
    <div>
      <span>{formatRemainingTime(remainingTime)}</span>
      <button onClick={() => saveStartTimeToStorage(pomodoroTarget())}>
        Start
      </button>
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
