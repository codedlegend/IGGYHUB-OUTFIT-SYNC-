import { aDStyle, assignClass } from "../../Utils.js";
import obj from "../../manifest.json" with { type: "json" };

new aDStyle()?.run();

function updateExtensionVer() {
  document.getElementById("extVersion").textContent = `IOS-v-${obj.version}`;
}
document.addEventListener("DOMContentLoaded", () => {
  updateExtensionVer();
});

async function sendMessage(action = "", data = {}) {
  return new Promise((resolve, reject) => {
    try {
      chrome.runtime.sendMessage({ action, data }, (r) => {
        if (r) {
          resolve(r);
        } else {
          resolve("Message sent");
        }
      });
    } catch (e) {
      reject(e);
    }
  });
}

async function GCGD() {
  try {
    const tCont = document.querySelector("#activeGameDiv");
    const currentGameCont = tCont.querySelector("#currentGame");
    const currentGameID = tCont.querySelector("#currentGameID span:last-child");
    const currentGameGenre = tCont.querySelector(
      "#currentGameGenre span:last-child",
    );
    const currentPlayerCount = tCont.querySelector(
      "#currentPlayerCount span:last-child",
    );

    const c$backg$SW = await sendMessage("getCurrentPlayerSession");

    if (!c$backg$SW) {
      throw new Error("Expected a response but nothing was returned...");
      return;
    }
    if (c$backg$SW.status) {
      if (c$backg$SW.status != "success") {
        console.error(c$backg$SW.reason);
        return;
      }
      const c$backg$SWData = c$backg$SW.data;
      //console.log(c$backg$SWData.userPresences[0]);
      const { lastLocation, universeId, userPresenceType, rootPlaceId } =
        c$backg$SWData.userPresences[0];
      console.log(lastLocation, universeId, rootPlaceId, userPresenceType);

      currentGameCont.textContent = lastLocation;
      currentGameID.textContent = rootPlaceId;

      const getGameInfo = await sendMessage("getCurrentGameInfo", {
        universeId,
      });
      if (!getGameInfo || getGameInfo.status != "success") {
        console.error("Failed to get game info: ", getGameInfo.reason);
        return;
      }
      //console.log(getGameInfo.data.data[0]);
      const { playing, genre } = getGameInfo.data.data[0];

      currentPlayerCount.textContent = playing;
      currentGameGenre.textContent = genre;

      window.currentGameData = getGameInfo.data.data[0];
    }
  } catch (e) {
    throw new Error(e);
  }
}

(async () => {
  GCGD();
})();
/**breaker */

(() => {
  const int = setInterval(() => {
    try {
      const pBars = document.querySelectorAll(
        "div[data-element-type='progressBar']",
      );

      pBars.forEach((e) => {
        const cAttr = e.getAttribute("data-progress");
        if (cAttr != "0") {
          let innProg = e.querySelector("div[data-element-type = 'progress']");
          if (!innProg) {
            let innProg = document.createElement("div");
            e.appendChild(newProg);
            assignClass(["h-110", "b-c-robux"], e);
          }
          const percFill = `${parseInt(cAttr)}%`;
          innProg.style.width = percFill;
          if (percFill == "100%") {
            innProg.style.backgroundColor = "#FF6347";
          }
          return;
        }
      });
    } catch (e) {
      throw new Error(e);
      clearInterval(int);
    }
  }, 100);
})();

(async () => {
  try {
    //ROBLOX STATUS CHECK
    const response = await fetch(
      "http://hostedstatus.com/1.0/status/59db90dbcdeb2f04dadcf16d",
    );
    //Front-End Element
    const userSide = document.querySelector("#robloxStatusSpan");

    if (!response.ok) {
      throw new Error("Status server responded negatively...");
      return;
    }
    const jData = await response.json();
    if (!jData) {
      throw new Error("JSON conversion failed");
      return;
    }
    const resJData = jData.result;
    //console.log(resJData);
    const userJData = resJData.status.find((obj) => obj.name === "User");
    //console.log(userJData);
    if (!userJData) {
      throw new Error("Failed to find user data during status check!");
    }
    const userCont = userJData.containers;
    //console.log(userCont);
    if (!userCont) {
      throw new Error(
        "Failed to find user data container during status check!",
      );
    }
    const webFind = userCont.find((obj) => obj.name === "Website")?.status;
    if (webFind != "Operational") {
      userSide.textContent = "ROBLOX FAILED";
      return;
    }
    userSide.textContent = "ROBLOX CONNECTED";
  } catch (e) {
    throw new Error(e);
  }
})();
