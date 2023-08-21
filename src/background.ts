import { Storage } from "@plasmohq/storage";

(async () => {
  const storage = new Storage();

  const getBlockedList = async () => {
    const blocked_list_data: string = await storage.get("blocked");
    const blocked_list: Array<string> = blocked_list_data
      ? JSON.parse(blocked_list_data)
      : [];
    console.debug("blocked_list:", blocked_list);
    return blocked_list;
  };

  // update;

  let blocked_list: Array<string> = await getBlockedList();

  // const is_pomodoro_running: boolean = undefined;
  storage.watch({
    blocked: async (c) => {
      blocked_list = await getBlockedList();
    }
    // pom_start_time: async (c) => {
    //   updatePomodoroState(c.newValue);
    // }
  });

  // chrome.runtime.onMessage.addListener(());

  chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.url) {
      const pom_start_time: number = JSON.parse(
        await storage.get("pom_focus_start_time")
      );
      const pom_is_focus_paused: boolean = JSON.parse(
        await storage.get("pom_focus_is_paused")
      );
      // todo: pararellize the awaits with promise.all or something
      const is_pomodoro_running = (): boolean => {
        const currentTime: number = new Date().getTime();
        const difference: number = pom_start_time - currentTime;
        return difference > 0;
      };
      const is_blocked: boolean =
        tab.url &&
        blocked_list.length > 0 &&
        blocked_list.some((blockedUrl) => tab.url.includes(blockedUrl));
      console.log("ruined? up is_pomodoro_running: ", is_pomodoro_running());
      is_blocked &&
        !pom_is_focus_paused &&
        is_pomodoro_running() &&
        chrome.tabs.update(tabId, { url: "/tabs/splash-page.html" });
    }
  });
})();

console.log("HELLO WORLD FROM BGSCRIPTS");

export {};
