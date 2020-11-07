import React, { useEffect, useState } from "react";
import RecordDesktop from "./RecordDesktop";
import Prototype from "./Prototype";
import Sidebar from "./Sidebar";
import Welcome from "./Welcome";
import Screenshot from "./Screenshot";
import Self from "./RecordSelf";
import "./styles/App.css";

import { BoardContext } from "./Context";
import mondaySDK from "monday-sdk-js";
const monday = mondaySDK();

export default function Container() {
  const [mode, setMode] = useState("light");

  useEffect(() => {
    //night mode option doesn't work yet...
    const el1 = document.getElementById("style1"),
      el2 = document.getElementById("style2");
    if (mode === "light") {
      el1.disabled = undefined;
      el2.disabled = "disabled";
    } else if (mode === "dark") {
      el1.disabled = "disabled";
      el2.disabled = undefined;
    }
  }, [mode]);

  useEffect(() => {
    monday.listen(["settings", "context"], async (res) => {
      await setMode(res.data.theme);
    });
  }, []);

  return (
    <BoardContext.Consumer>
      {(context) => (
        <div className="App" id="App">
          <div className="container" id="container">
            {context.nav === "welcome" ? (
              <Welcome context={context} />
            ) : context.nav === "mockup" ? (
              <Prototype
                setFile={context.setFile}
                monday={context.monday}
                context={context}
              />
            ) : context.nav === "screenshot" ? (
              <Screenshot
                setFile={context.setFile}
                monday={context.monday}
                context={context}
              />
            ) : context.nav === "record" ? (
              <RecordDesktop
                monday={context.monday}
                setFile={context.setFile}
                context={context}
              />
            ) : context.nav === "self" ? (
              <Self
                monday={context.monday}
                setFile={context.setFile}
                context={context}
              />
            ) : null}
          </div>

          <Sidebar
            nav={context.nav}
            setWhichOne={context.setNav}
            monday={context.monday}
            context={context}
          />
        </div>
      )}
    </BoardContext.Consumer>
  );
}
