import { getEnabledCategories } from "trace_events";

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

  // const blocked_list_data: string = await storage.get("blocked");
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
