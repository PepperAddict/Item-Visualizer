import React, { useState, useEffect, Fragment } from "react";

import { BoardContext } from "./Context";

import searchIcon from "./icon/search.svg";
import FileSent from "./FileSent";
let mWindow;

export default function WorkspaceAndItem({ monday, file, context }) {
  const [items, setItems] = useState(null);
  const [theStatus, setTheStatus] = useState(null);
  const [newItems, setNewItems] = useState(null);
  const [token, setToken] = useState(null);
  // const [percent, setUploadPercentage] = useState("0");
  const [updateID, setUpdateID] = useState(null);
  const endpointRoute = 'https://iv-backend.herokuapp.com/'

  const localstorage = (method, key, value = null) => {
    let name;
    try {
      switch (method) {
        case "get":
          name = localStorage.getItem(key);
          break;
        case "set":
          name = localStorage.setItem(key, value);
          break;
        case "remove":
          name = localStorage.removeItem(key);
          break;
      }
      return name;
    } catch (err) {
      console.log(err);
    }
  };
  useEffect(() => {
    monday.listen(["settings", "context"], async (res) => {
      if (res.data.boardIds) {
        let itemz = [];
        res.data.boardIds.forEach(async (board) => {
          await monday
            .api(`query {boards (ids: ${board} ) {name, items {name, id}}}`)
            .then(async (res) => {
              if (res.data.boards[0]) {
                res.data.boards[0].items.forEach((it) => {
                  itemz.push(it);
                });
              }
            });
        });
        await setItems(itemz);
      }
    });
  }, [monday]);

  const searchInput = (e, it) => {
    e = e.toLowerCase();
    const regex = new RegExp("^" + e + ".*$");
    let newarray = [];
    if (e.length > 0 && items) {
      for (let each of items) {
        each.name = each.name.toLowerCase();

        if (each.name.match(regex)) {
          const itemInfo = {
            name: each.name,
            id: each.id,
          };
          newarray.push(itemInfo);
        } else {
          setNewItems([]);
        }
      }
    } else {
      setNewItems([]);
    }

    setNewItems(newarray.slice(0, 5));
  };

  useEffect(() => {
    window.addEventListener("message", (e) => {
      if (typeof e.data === "string") {
        mWindow.close();
        setToken(e.data);
        if (file) {
          setTheStatus({ code: "yellow", message: "Uploading File" });
          localStorage.setItem("forUpdate", e.data);
          //now that we got the info, we can commence the upload

          sendItInt(file, updateID);
        }
      }
    });
  }, [window, file, updateID]);

  const sendItInt = async (file, updateid = updateID) => {
    const formData = new FormData();
    const noVariableQuery = `mutation addFile($file: File!) {add_file_to_update (update_id: ${updateid}, file: $file) {id}}`;
    formData.append("query", noVariableQuery);
    formData.append("variables[file]", file.file, file.name + file.ext);

    let alreadyKey = localstorage("get", "forUpdate") || token;
    setUpdateID(updateid);
    if (!alreadyKey) {
      setTheStatus({ code: "red", message: "Please Authenticate" });
      mWindow = window.open(
        endpointRoute + "api/1/apiformun",
        "_blank",
        "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=800,height=800"
      );
    } else {
      await fetch("https://api.monday.com/v2/", {
        method: "POST",
        body: formData,
        headers: {
          Authorization: alreadyKey,
        },
      })
        .then((resp) => {
          return resp.json();
        })
        .then((res) => {
          setTheStatus({ code: "green", message: "File Attached" });
          context.setFile(null);
        })
        .catch((err) => {
          setTheStatus({ code: "red", message: "Something went wrong." });
          console.log(err);
          //unfortunately using fetch this way won't tell you if there's an authentication error, but let's work with that
          //if there is a problem and overwrite with new key and see if that works:
          if (alreadyKey) {
            setTheStatus({ code: "red", message: "Please Re-Authenticate" });
            mWindow = window.open(
              endpointRoute + "api/1/apiformun",
              "_blank",
              "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=800,height=800"
            );
          }
        });
    }
  };

  const sendUpdate = (e, element) => {
    const textarea = element.current.querySelectorAll("textarea");

    //get rid of empty title and description
    for (let x of textarea) {
      let inner = x.innerHTML;
      if (inner.length < 1) {
        x.parentNode.remove();
      }
    }
    //get rid of those spans
    const hideIt = element.current.querySelectorAll("span");
    for (let x of hideIt) {
      x.remove();
    }

    const html = JSON.stringify(element.current.outerHTML);

    //create The update with the summary HTML
    monday
      .api(`mutation {create_update (item_id: ${e.id}, body: ${html}) {id}}`)
      .then((res) => {
        setTheStatus({ code: "green", message: "Update Created" });
        //Once the update is created, if there is a pending file, upload it!
        if (file) {
          setTheStatus({ code: "yellow", message: "Uploading File" });
          sendItInt(file, res.data.create_update.id);
        }
      })
      .then(() => {
        setNewItems(null);
        context.setSetup(false);
        context.setNav("welcome");
      });
  };

  return (
    <BoardContext.Consumer>
      {(context) => (
        <div className="workspace-container">
          <div className="workspace-items">
            <FileSent status={theStatus} setStatus={setTheStatus} />
            <label>
              <strong>Send Update to</strong>
              {context.setup && context.ready ? (
                <Fragment>
                  <input
                    onChange={(e) => searchInput(e.target.value)}
                    placeholder="Enter Item Name"
                  />
                  <img
                    className="search-icon"
                    src={searchIcon}
                    alt="search for an item"
                  />
                </Fragment>
              ) : (
                <p className="nothing-yet">Nothing to send yet</p>
              )}
            </label>

            {newItems && context.setup && context.ready && (
              <div className="item-list">
                {newItems.slice(0, 3).map((item, key) => {
                  return (
                    <button
                      key={key}
                      id={item.id}
                      onClick={(e) => sendUpdate(e.target, context.setSumm)}
                    >
                      {item.name}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </BoardContext.Consumer>
  );
}
