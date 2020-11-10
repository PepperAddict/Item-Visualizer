import React, { Fragment, useState } from "react";
import fullIcon from "./icon/full.svg";

export default function HiddenButtons(props) {
  const [showMore, setShowMore] = useState(false);

  const editImage = () => {
    props.setEditImage(true)
    props.setReady(false)
  }
  return (
    <Fragment>
      {showMore ? (
        <div
          className="button-container"
          onMouseLeave={() => setShowMore(false)}
        >
          <span
            onClick={() => props.fullscreen("generated")}
            className="expand"
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
              className="button-gray reset-button"
              onClick={() => props.resetImage()}
            >
              ↺
            </button>
          ) : null}
        </div>
      ) : (
        <span
          className="show-more"
          onMouseEnter={() => setShowMore(true)}
          onMouseLeave={() => setShowMore(false)}
          onClick={() => (showMore ? setShowMore(false) : setShowMore(true))}
        >
          {" "}
          <img src={require("./icon/dotshorz.svg")} alt="Show Available Options"/>
        </span>
      )}
    </Fragment>
  );
}
