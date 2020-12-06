import React, { useState, useEffect, Fragment } from "react";

import { BoardContext } from "./Context";
import axios from "axios";
import searchIcon from "./icon/search.svg";
import FileSent from "./FileSent";

export default function WorkspaceAndItem({ monday, file, setFile, context }) {
  const [items, setItems] = useState(null);
  const [theStatus, setTheStatus] = useState(null);

  const [newItems, setNewItems] = useState(null);
  // const [percent, setUploadPercentage] = useState("0");

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
  const sendItIn = (data) => {

    return axios.post("https://talkingcloud.io/api/1/mupload", data, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        // onUploadProgress: (progressEvent) => {
        //   //progress bar works great, but it doesn't show upload progress from Monday. This
        //   //feature is useless at the moment.
        //   setUploadPercentage(Math.round((progressEvent.loaded * 100) / progressEvent.total));
        //   // clear percentage
        //   setTimeout(() => setUploadPercentage(0), 10000);
        // },
      })
      .then((res) => {
        if (res.data.errors) {
          window.open(
            "https://talkingcloud.io/api/1/apiformun",
            "_blank",
            "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=800,height=800"
          );
        }
        setTheStatus(3);
        //once completed, reset file
        context.setFile(null);
      })
      .then(() => {
        context.setSetup(false);
        context.setNav("welcome");
      })
      .catch((err) => {
        sessionStorage.remoteItem('forUpdate')
        console.log(err);
        setTheStatus(4);
      });
  };

  const sendFile = async (update_id) => {
    const data = new FormData();
    data.append("file", file.file, file.name + file.ext);
    data.append("updateId", update_id);
    let theKey;

    if (!sessionStorage.getItem("forUpdate")) {
      window.open(
        "https://talkingcloud.io/api/1/apiformun",
        "_blank",
        "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=800,height=800"
      );
    } else {
      theKey = sessionStorage.getItem('forUpdate')
      console.log(theKey)
      data.append("apiKey", theKey)
      sendItIn(data)
    }


    window.addEventListener("message", (e) => {
      if (e.data) {
        theKey = e.data
        data.append("apiKey", e.data);
        sessionStorage.setItem("forUpdate", e.data);
        sendItIn(data);
      }
    });

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
        setTheStatus(1);
        //Once the update is created, if there is a pending file, upload it!
        if (file) {
          setTheStatus(2);
          sendFile(res.data.create_update.id);
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
