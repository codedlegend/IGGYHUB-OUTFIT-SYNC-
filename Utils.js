export function S(val) {
  if (typeof val === "object") return JSON.stringify(val);
  else {
    console.error("param 1 is expected object not ", typeof val);
  }
}
export function P(val) {
  if (typeof val === "string") return JSON.parse(val);
  else {
    console.error("param 1 is expected string not ", typeof val);
  }
}
export function saveDataToLocal(k, obj) {
  if (typeof k === "string") {
    chrome.storage.local.set({ [k]: obj });
  } else {
    console.error("Unexpected params");
  }
}

export async function getFromStorage(storageType = "local", key = "") {
  return new Promise((resolve, reject) => {
    try {
      switch (storageType) {
        case "local":
          chrome.storage.local.get(key, (r) => {
            if (r && r[key]) {
              //console.log(r[key]);
              resolve(r[key]);
            }
          });
          break;

        case "sync":
          chrome.storage.sync.get(key, (r) => {
            if (r && r[key]) {
              resolve(r[key]);
            }
          });
          break;

        case "session":
          chrome.storage.session.get(key, (r) => {
            if (r && r[key]) {
              resolve([key]);
            }
          });
          break;
      }
    } catch (e) {
      reject(e);
    }
  });
}
export function saveToSession(obj = {}) {
  chrome.storage.session.set(obj, (r) => {
    return r;
  });
}
function extractNumFromH(className) {
  //Extracts the number using a separater
  const divCls = className.split("-");
  return parseInt(divCls[1]);
}

export class aDStyle {
  MCL(el = null) {
    try {
      if (!el || el === null) {
        const D$ = document.querySelectorAll("*");
        D$.forEach((e) => {
          //console.log(e.classList.value);
          let v;
          if (e.classList.length > 0) {
            for (const x of e.classList) {
              if (x.startsWith("m-")) {
                v = extractNumFromH(x);
              }
            }
          }
          if (v) {
            e.style.margin = `${v}px`;
            return e;
          }
        });
        return;
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

  HCL(el = null) {
    try {
      if (!el || el === null) {
        const D$ = document.querySelectorAll("*");
        D$.forEach((e) => {
          let v;
          if (e.classList.length > 0) {
            for (const x of e.classList) {
              if (x.startsWith("h-")) {
                v = extractNumFromH(x);
                break;
              }
            }
          }
          if (v) {
            e.style.height = `${v}%`;
            return e;
          }
        });
        return;
      }
      //console.log("starting loop", el.classList);
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

  WCL(el = null) {
    try {
      if (!el || el === null) {
        const D$ = document.querySelectorAll("*");
        D$.forEach((e) => {
          let v;
          if (e.classList.length > 0) {
            for (const x of e.classList) {
              if (x.startsWith("w-")) {
                v = extractNumFromH(x);
                break;
              }
            }
          }
          if (v) {
            e.style.width = `${v}%`;
            return e;
          }
        });
        return;
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
  PCL(el = null) {
    try {
      if (!el || el === null) {
        const D$ = document.querySelectorAll("*");
        D$.forEach((e) => {
          let v;
          if (e.classList.length > 0) {
            for (const x of e.classList) {
              if (x.startsWith("p-")) {
                v = extractNumFromH(x);
                break;
              }
            }
          }
          if (v) {
            e.style.padding = `${v}px`;
            return e;
          }
        });
        return;
      }
      for (const cl of el.classList) {
        //console.log(cl)
        if (cl.startsWith("p-")) {
          //console.log("Found class")
          const v = extractNumFromH(cl);
          el.style.padding = `${v}px`;
          break;
        }
      }
      return { target: el, targetStyle: "width" };
    } catch (e) {
      throw new Error(e);
    }
  }
  GCL(el = null) {
    try {
      if (!el || el === null) {
        const D$ = document.querySelectorAll("*");

        D$.forEach((e) => {
          let v;
          if (e.classList.length > 0) {
            for (const x of e.classList) {
              if (x.startsWith("g-")) {
                v = extractNumFromH(x);
                break;
              }
            }
          }
          if (v) {
            e.style.gap = `${v}px`;
            return e;
          }
        });
        return;
      }
      for (const cl of el.classList) {
        //console.log(cl)
        if (cl.startsWith("g-")) {
          //console.log("Found class")
          const v = extractNumFromH(cl);
          el.style.gap = `${v}px`;
          break;
        }
      }
      return { target: el, targetStyle: "width" };
    } catch (e) {
      throw new Error(e);
    }
  }

  run() {
    this.MCL();
    this.HCL();
    this.WCL();
    this.PCL();
    this.GCL();
  }
  runInLoop() {
    setInterval(this.run, 100);
  }
}
export function assignClass(arr = [], el) {
  arr.forEach((i) => {
    el.classList.add(i);
  });
}
//setInterval(run, 100);
