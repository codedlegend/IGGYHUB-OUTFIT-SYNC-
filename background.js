"use strict";
console.log(
  `%cIGGYHUB Outfit Sync, Background Script is Loaded ${JSON.stringify(obj)}`,
  "color: purple",
);

import obj from "./config.json" with { type: "json" };
import { S, P, saveDataToLocal, getFromStorage,saveToSession } from "./Utils.js";

let Rr = 0;
const $p = obj.pro_id;
let gID;

const awkInt = setInterval(async () => {
  try {
    await updGID();
  } catch (e) {
    throw new Error(e);
    clearInterval(awkInt);
  }
}, 100);

async function updGID() {
  const fLSt = await getFromStorage("local", "authData");
  if (fLSt.id) {
    gID = fLSt.id;
  }
}

//--LISTENERS--//
chrome.runtime.onInstalled.addListener(async () => {
  GCRU();
  openExtensionDBP();
  saveDataToLocal("activeRules", []);
});

chrome.tabs.onCreated.addListener(async (tab) => {
  try {
    //Check url if it matches /games
    //console.log(tab);
    const cUrl = new URL(tab.url || tab.pendingUrl);
    if (!cUrl && tab && tab.url.includes("/games")) {
      await insertScript("JS", "content/listener.js", tab.id);
      await insertScript("CSS", "content/page.css", tab.id);
    }
    if (cUrl.pathname.startsWith("/games/")) {
      await insertScript("JS", "content/listener.js", tab.id);
      await insertScript("CSS", "content/page.css", tab.id);
    }
  } catch (e) {
    throw new Error("[TAB ONCREATED LISTENER]" + e);
  }
}); //Listen for when tab is created

chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
  try {
    let newUrl;
    if (changeInfo.url) {
      newUrl = new URL(changeInfo.url);
    } else {
      newUrl = new URL(tab.url);
    }
    if (newUrl.pathname.startsWith("/games/")) {
      await insertScript("JS", "content/listener.js", tabId);
      await insertScript("CSS", "content/page.css", tabId);
    }
  } catch (e) {
    throw new Error("[TAB UPDATE LISTENER]" + e);
  }
});

chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
  if (message.action === "openOutfitPage") {
    try {
      if (message.ref) {
        //console.log("Ref: ", message.ref);
        chrome.storage.session.set({ tarGame: message.ref }, () => {
          openExtensionDBP();
          // console.log("Saved in session storage");
        });
        sendResponse({ status: "success" });
        return;
      }
      openExtensionDBP();
      sendResponse({ status: "success" });
      return;
    } catch (e) {
      sendResponse({ status: "failed", reason: e });
    }
  }
  if (message.action === "refreshAuth") {
    try {
      await GCRU();
      sendResponse({ status: "complete" });
    } catch (e) {
      sendResponse({ status: "failed", reason: e });
    }
  }
  if (message.action === "getCurrentPlayerSession") {
    try {
      const cacheCGame = await getFromStorage("session", "currentGameCache");

      if (!cacheCGame) {
        const f$ = await fetch(obj.presence_api, {
          method: "POST",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({ userIds: [gID] }),
        });
        if (!f$.ok) {
          sendResponse({
            status: "failed",
            reason: `"API ${obj.presence_api} failed"`,
          });
          return;
        }
        const f$js = await f$.json();
        if (f$js) {
          console.log(f$js);
          
          sendResponse({ status: "success", data: f$js, method: "fetch" });
          return;
        }
      }
      sendResponse({ status: "success", method: "cache", data: cacheCGame });
    } catch (e) {
      sendResponse({ status: "error", reason: e });
    }
  }
});

chrome.action.onClicked.addListener((tab) => {
  chrome.storage.session.remove("tarGame", () => {
    openExtensionDBP();
  });
});

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "refreshAuth") {
    GCRU();
  }
});
//--LISTENERS-END--//
chrome.alarms.create("refreshAuth", { periodInMinutes: 60 });
function openExtensionDBP() {
  chrome.tabs.create({ url: chrome.runtime.getURL("./pages/index.html") });
}

//FUNCTION: Fetch user data from api request and save it to local.
async function GCRU() {
  //Only fetch user data
  try {
    const f = await fetch(obj.auth_URL, { credentials: "include" });
    if (!f.ok) {
      console.error("Fetch failed retrying");
      GCRU();
      if (Rr >= 5) {
        console.error("Timeout on fetch retries");
      }
      Rr++;
    }
    const r = await f.json();
    if (r) {
      saveDataToLocal("authData", r);
      IP();
      return;
    }
  } catch (e) {
    console.error(e);
  }
}

//FUNCTION: Checks if user has gamepass
async function IP() {
  //console.log(await getFromStorage("local", "authData"));

  let userID = await getFromStorage("local", "authData");
  userID = userID?.id;
  //console.log(userID);
  if (userID) {
    const apiUnproc = obj.pro_api.replace("{userId}", userID);

    //console.log("Fetching inventory from ", apiUnproc, "with userID: ", userID);
    const fetchRes = await fetch(apiUnproc, { credentials: "include" });
    if (!fetchRes.ok) {
      console.error("Failed to fetch inventory");
      return;
    }
    const res = await fetchRes.json();
    if (!res) {
      console.error("JSON conversion failed at IP");
    }
    if (res.data) {
      if (res.data.length > 0) {
        saveDataToLocal("isPro", true);
        return;
      } else {
        saveDataToLocal("isPro", false);
      }
    }
  } else {
    console.error("UserID does not exist");
  }
}
//Function to insert listener script
async function insertScript(type, p, tabId) {
  const result = await chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: () => document.body.dataset.iggyhubOutfitSync,
  });

  if (!result.result) {
    console.log("[SCRIPT INJECTOR] Injecting scripts into", tabId);
    if (type === "CSS") {
      chrome.scripting.insertCSS({
        target: { tabId: tabId },
        files: [String(p)],
      });
    }
    if (type === "JS") {
      chrome.scripting.executeScript({
        target: { tabId: tabId },
        files: [String(p)],
      });
    }
  }
  return;
}
