(async () => {
  if (!document.body.dataset.iggyhubOutfitSync) {
    document.body.dataset.iggyhubOutfitSync = "true";

    console.log(
      "%c Listener Loaded",
      "font-weight: 600; background-color: black;",
    );
    //--UTILITY FUNCTIONS--//
    function extractNumFromH(className) {
      //Extracts the number using a separater
      const divCls = className.split("-");
      return parseInt(divCls[1]);
    }

    function sendMessageToBackground(message) {
      return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, (response) => {
          if (chrome.runtime.lastError) {
            reject(chrome.runtime.lastError);
          } else {
            resolve(response);
          }
        });
      });
    }

    function MCL(el = null) {
      try {
        if (!el) {
          const D$ = document.querySelectorAll("*");
          Array.from(D$).forEach((e) => {
            let v;
            for (const x of e.classList) {
              if (x.startsWith("m-")) {
                v = extractNumFromH(x);
                break;
              }
            }
            if (v) {
              e.style.margin = `${v}px`;
              return e;
            }
          });
        }

        for (const cl of el.classList) {
          //console.log(cl);
          if (cl.startsWith("m-")) {
            console.log("Found class");
            const v = extractNumFromH(cl);
            el.style.margin = `${v}px`;
            break;
          }
        }
        return { target: el, targetStyle: "margin" };
      } catch (e) {
        throw new Error(e);
      }
    }

    function HCL(el = null) {
      try {
        if (!el) {
          const D$ = document.querySelectorAll("*");
          Array.from(D$).forEach((e) => {
            let v;
            for (const x of e.classList) {
              if (x.startsWith("h-")) {
                v = extractNumFromH(x);
                break;
              }
            }
            if (v) {
              e.style.height = `${v}px`;
              return e;
            }
          });
        }
        console.log("starting loop", el.classList);
        for (const cl of el.classList) {
          //console.log(cl)
          if (cl.startsWith("h-")) {
            //console.log("Found class")
            const v = extractNumFromH(cl);
            el.style.height = `${v}%`;
            break;
          }
        }
        return { target: el, targetStyle: "height" };
      } catch (e) {
        throw new Error(e);
      }
    }

    function WCL(el = null) {
      try {
        if (!el) {
          const D$ = document.querySelectorAll("*");
          Array.from(D$).forEach((e) => {
            let v;
            for (const x of e.classList) {
              if (x.startsWith("w-")) {
                v = extractNumFromH(x);
                break;
              }
            }
            if (v) {
              e.style.height = `${v}px`;
              return e;
            }
          });
        }
        for (const cl of el.classList) {
          //console.log(cl)
          if (cl.startsWith("w-")) {
            //console.log("Found class")
            const v = extractNumFromH(cl);
            el.style.width = `${v}%`;
            break;
          }
        }
        return { target: el, targetStyle: "width" };
      } catch (e) {
        throw new Error(e);
      }
    }
    //--UTILITY FUNCTION END--//

    const cl = window.location.pathname;
    const gID = await extractID(cl);
    //console.log(gID);
    //enable mutation observers

    function deployMutationObserver() {
      let r;
      const contObs = new MutationObserver((mutations) => {
        mutations.forEach((mutation) => {
          //console.log(mutation);
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                //console.log(node);
                if (
                  node.matches("ul.favorite-follow-vote-share") ||
                  node.classList.includes("favorite-follow-vote-share")
                ) {
                  //console.log("Target container found");
                  r = node;
                  contObs.disconnect();
                }
              }
            });
          }
        });
      });
      contObs.observe(document.body, {
        childList: true,
        subtree: false,
      });

      return r;
    }
    async function extractID(path = String) {
      //FUNCTION: Gets the game ID from the path
      try {
        const divPath = path.split("/");
        //console.log(divPath);

        if (typeof parseInt(divPath[2]) === "number") {
          return parseInt(divPath[2]);
        }

        const regexID = path.match(/(\d+)/);
        return parseInt(regexID[0]);
      } catch (e) {
        throw new Error("[ID EXTRACTION]: " + e);
      }
    }

    function createButtonElement(cont) {
      const linkToPage = chrome.runtime.getURL("./Pages/index.html");
      const newLi = document.createElement("li");

      newLi.title = "Assign Outfit";
      //console.log(`Generated Link: ${linkToPage}`);

      const newClass = [
        "cursor-pointer",
        "h-100",
        "p-relative",
        "iggy-flex-row",
        "w-10",
      ];
      function assignClass(arr, el) {
        arr.forEach((i) => {
          el.classList.add(i);
        });
      }

      assignClass(newClass, newLi);

      if (!cont) {
        throw new Error("[BUTTON INSERTION] Invalid parameter");
      }
      const innerIMG = document.createElement("img");

      innerIMG.alt = "Igyyhub Outfiit Sync";
      innerIMG.src = chrome.runtime.getURL("./Public/assignIcon.png");
      innerIMG.id = "iggyhub-outfit-sync-btn";

      newLi.appendChild(innerIMG);
      cont.appendChild(newLi);
      return newLi;
    }
    function assignClickListeners(el, func = () => {}) {
      el.addEventListener("click", func);
    }

    //--IIFE--//
    (() => {
      //console.log("[IIFE] Running");
      let cont = document.querySelector(".favorite-follow-vote-share");
      if (!cont) {
        cont = deployMutationObserver();
      }
      //console.log("[ELEMENT FINDER] Found container: ", cont);
      //Add the element to the Container
      const b = createButtonElement(cont);
      MCL(b);
      HCL(b);
      WCL(b);

      assignClickListeners(b, async () => {
        //console.log("Assigning outfit");
        const oAt = await sendMessageToBackground({
          action: "openOutfitPage",
          ref: gID,
        });
        if (oAt.status === "failed") {
          alert("An error ocurred", oAt.reason);
        }
        //console.log(oAt);
      });
    })();
  }
  
  const aCheck = await sendMessageToBackground({
    action: "checkOutfitAssignment",
    ref: gID,
  });
  if (aCheck) {
    try {
      const p$B = document.querySelector(
        "button.btn-common-play-game-lg[data-testid='play-button']",
      );
      if (p$B) {
        console.log(p$B);
      }
    } catch (e) {
      throw new Error(e);
    }
  }
})();
