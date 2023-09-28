import { Storage } from "@plasmohq/storage";

import { ListType, type RelaxListEntry } from "~types";

let lastBlockedURL = "";

(async () => {
  const storage = new Storage();

  // Listen for messages from splash-page
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action == "getLastBlockedURL") {
      sendResponse({ url: lastBlockedURL });
    }
  });

  const getBlockedList = async () => {
    const blocked_list_data: string = await storage.get(ListType.BLOCKED_LIST);
    const blocked_list: Array<string> = blocked_list_data
      ? JSON.parse(blocked_list_data)
      : [];
    console.debug("blocked_list:", blocked_list);
    return blocked_list;
  };

  const getRelaxList = async (): Promise<Array<RelaxListEntry>> => {
    const relax_list_data: string = await storage.get(ListType.RELAX_LIST);

    let relax_list: Array<RelaxListEntry> = [];

    try {
      relax_list = relax_list_data ? JSON.parse(relax_list_data) : [];

      if (
        !Array.isArray(relax_list) ||
        !relax_list.every((entry) => "URL" in entry && "reason" in entry)
      ) {
        throw new Error("Invalid RelaxList data structure");
      }
    } catch (err) {
      console.error("Failed to parse relaxList", err);
    }

    console.debug("relax_list:", relax_list);
    return relax_list;
  };

  let blocked_list: Array<string> = await getBlockedList();
  let relax_list: Array<RelaxListEntry> = await getRelaxList();

  storage.watch({
    blocked_list: async (c) => {
      blocked_list = await getBlockedList();
    },
    relax_list: async (c) => {
      relax_list = await getRelaxList();
    }
  });

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
      const is_relax_page: boolean = relax_list.some((entry) =>
        tab.url.includes(entry.URL)
      );
      tab.url && console.log("is_pomodoro_running: ", is_pomodoro_running());
      if (
        is_blocked &&
        !pom_is_focus_paused &&
        is_pomodoro_running() &&
        !is_relax_page
      ) {
        lastBlockedURL = tab.url;
        chrome.tabs.update(tabId, { url: "/tabs/splash-page.html" });
      }
    }
  });
})();

export {};
