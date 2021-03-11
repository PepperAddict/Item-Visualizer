import React from "react";
import fullIcon from "../icon/full.svg";

export default function HiddenButtons(props) {

  const editImage = () => {
    props.setEditImage(true)
    props.setReady(false)
  }
  return (

        <div
          className="button-container"
        >
          <span
            onClick={() => props.fullscreen("generated")}
            className="expand edit-image"
          >
            <img src={fullIcon} alt="fullscreen" />
          </span>

          {props.setEditImage && (
            <span
              onClick={() => editImage()}
              className="edit-image"
            >
              ✎
            </span>
          )}
          {props.edited === true ? (
            <button
              className="edit-image"
              onClick={() => props.resetImage()}
            >
              ↺
            </button>
          ) : null}
        </div>
  );
}
