import React from "react";
import "./styles/Welcome.css";
import How from "./How";

export default function Welcome({ context }) {
  return (
    <div className="welcome-container">
      <div className="title-container">
        <h1>Item Visualizer</h1>
        <h2>
          Explain Better with
          <div className="thetions">
            <span className="tion">
              <span>Visualization</span>
              <span>Demonstration</span>
              <span>Presentation</span>
              <span>Illustration</span>
            </span>
          </div>
        </h2>
      </div>

      <How context={context} />
    </div>
  );
}
