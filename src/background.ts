import { Storage } from "@plasmohq/storage";

(async () => {
  const storage = new Storage();
  let POMODORO_START_TIME = undefined;

  async function getPomodoroStartTime() {
    debugger;

    if (POMODORO_START_TIME != undefined) {
      console.log(" POMODORO_START_TIME: ", POMODORO_START_TIME);
      return POMODORO_START_TIME;
    } else {
      console.log("READING FROM STORAGE!!! ERR !! 💥", POMODORO_START_TIME);
      return await storage.get("pomodoro_start_time");
    }
  }

  chrome.runtime.onMessage.addListener(async function (
    request,
    sender,
    sendResponse
  ) {
    if (request.action === "get_pomodoro_start_time") {
      debugger;
      const pom = getPomodoroStartTime();
      // console.log("pom:::", pom);
      sendResponse({ start_time: await getPomodoroStartTime() });
    }
    if (request.action === "set_pomodoro_start_time") {
      POMODORO_START_TIME = request.start_time;
      console.log("setting pomodoro start time tooooo: ", request.start_time);
      storage.set("pomodoro_start_time", request.start_time);
    }
  });

  const getBlockedList = async () => {
    const blocked_list_data: string = await storage.get("blocked");
    const blocked_list: Array<string> = blocked_list_data
      ? JSON.parse(blocked_list_data)
      : [];
    console.debug("blocked_list:", blocked_list);
    return blocked_list;
  };

  let blocked_list: Array<string> = await getBlockedList();
  //   ? JSON.parse(blocked_list_data)
  //   : [];
  // console.debug("blocked_list:", blocked_list);

  storage.watch({
    blocked: async (c) => {
      blocked_list = await getBlockedList();
    }
  });

  // chrome.runtime.onMessage.addListener(());

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      const isBlocked: boolean =
        tab.url &&
        blocked_list.length > 0 &&
        blocked_list.some((blockedUrl) => tab.url.includes(blockedUrl));
      console.log("🎂 is blocked: ", isBlocked);
      isBlocked && chrome.tabs.update(tabId, { url: "/tabs/splash-page.html" });
    }
  });
})();

console.log("HELLO WORLD FROM BGSCRIPTS");

export {};
