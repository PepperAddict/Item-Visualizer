import React, { useState, useEffect, Fragment } from "react";

import { BoardContext } from "./Context";
import axios from "axios";
import searchIcon from "./icon/search.svg";
import FileSent from "./FileSent";
let mWindow;

export default function WorkspaceAndItem({ monday, file, context }) {
  const [items, setItems] = useState(null);
  const [theStatus, setTheStatus] = useState(null);

  const [newItems, setNewItems] = useState(null);
  // const [percent, setUploadPercentage] = useState("0");

  const localstorage = (method, key, value = null) =>  {
    try {
      switch(method) {
        case 'get': 
          localStorage.getItem(key);
          break;
        case 'set':
          localStorage.setItem(key, value);
          break;
        case 'remove':
          localStorage.removeItem(key);
          break;
      }
    } catch(err) {
      console.log(err)
    }

  }
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

    return axios.post('https://talkingcloud.io/api/1/mupload', data, {
      headers: {
        "Content-Type": "multipart/form-data",
      }
    })
      .then((res) => {
        if (res.data.errors) {
            localstorage('remove', 'forUpdate')

          setTheStatus({code: 'red', message: "Please Authenticate"});
          mWindow = window.open(
            "https://talkingcloud.io/api/1/apiformun",
            "_blank",
            "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=800,height=800"
          );
        } else {
          setTheStatus({code: 'green', message: "File Attached"});
          context.setFile(null);
          context.setSetup(false);
          context.setNav("welcome");
        }
      })
      .catch((err) => {
        localstorage('remove',"forUpdate");
        console.dir(err);
        setTheStatus({code: 'red', message: "Something went wrong"});
      });
  };
  const sendFile = async (update_id) => {
    const data = new FormData();
    data.append("file", file.file, file.name + file.ext);
    data.append("updateId", update_id);


      if (!localstorage('get',"forUpdate")) {
        setTheStatus({code: 'red', message: "Please Authenticate"});
        mWindow = window.open(
          "https://talkingcloud.io/api/1/apiformun",
          "_blank",
          "toolbar=yes,scrollbars=yes,resizable=yes,top=500,left=500,width=800,height=800"
        );
      } else {
        data.append("apiKey", localstorage('get', "forUpdate"));
        sendItIn(data);
      }


    window.addEventListener("message", (e) => {
      if (typeof e.data === "string") {
        mWindow.close();
        data.append("apiKey", e.data);
        setTheStatus({code: "yellow", message: "Uploading File"});
        try {
          localStorage.setItem("forUpdate", e.data);
        } catch(err) {
          console.log(err)
        }

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
        setTheStatus({code: "green", message: "Update Created"});
        //Once the update is created, if there is a pending file, upload it!
        if (file) {
          setTheStatus({code: "yellow", message: "Uploading File"});
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
