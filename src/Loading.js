import React, { Fragment } from "react";
import "./styles/loading.css";

export default function Loading(props) {
  return (
    <Fragment>
      <div className="lds-ellipsis">
        <div></div>
        <div></div>
        <div></div>
        <div></div>
      </div>
      <div className="quick-alert">
        This may take up to 30 seconds
        <button onClick={() => props.controller.abort()}>cancel</button>
      </div>
    </Fragment>
  );
}
