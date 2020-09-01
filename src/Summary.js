import React, { useState, Fragment, useRef } from "react";
import moment from "moment";
import { BoardContext } from "./Context";
import EditImage from "./EditImage";
import "./styles/Summary.css";
import { closeFullscreen, openFullscreen } from "./utils";
import fullIcon from "./icon/full.svg";

export default function Summary({ currentMock }) {
  const canny = useRef(null);
  const [mock, setmock] = useState(currentMock);
  const [error, setError] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [fromThumbnail, setFromThumbnail] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(mock.generatedImage);
  const [newTitle, setNewTitle] = useState(mock.realTitle);
  const [rawImage, setRawImage] = useState(mock.rawImage);
  const [fully, setFully] = useState(false);

  const thumbnailEdit = (e) => {
    setFromThumbnail(true);
    setEditImage(true);
  };

  const resetImage = (e) => {
    if (mock.generatedImage) {
      setGeneratedImage(mock.generatedImage);
      setRawImage(mock.rawImage)
    } else if (mock.thumbnail) {
      setGeneratedImage(null);
    }
  };

  const fullscreen = (name) => {
    let thatElement = document.getElementById(name)

    if (!document.fullscreenElement) {
      openFullscreen(thatElement);
    } else {
      closeFullscreen()
    }
  };

  return (
    <div className="summary-container">
      {error && (
        <p
          className="error-message"
          onClick={() => setError(false)}
          style={{ position: "absolute" }}
        >
          {error}
        </p>
      )}
      <BoardContext.Consumer>
        {(context) =>
          !editImage ? (
            <Fragment>
              {generatedImage && (
                <div className="generated-image" id="generated">
                  <span
                    onClick={(e) => setEditImage(true)}
                    className="edit-image"
                  >
                    ✎
                  </span>
                  <span onClick={() => fullscreen('generated')} className="expand">
                    <img src={fullIcon} alt="fullscreen" />
                  </span>

                  <img src={generatedImage} alt="generated screen shot" />
                  <button
                    className="button-gray bottom-corner"
                    onClick={() => resetImage()}
                  >
                    Reset Image
                  </button>
                </div>
              )}
              {mock.iframe && <embed src={mock.iframe} />}
              {!mock.iframe && !mock.generatedImage && !mock.thumbnail && (
                <div className="no-preview">Sorry, No Preview Available</div>
              )}

              <div
                style={{
                  width: "100%",
                  margin: "auto",
                  height: "100%",
                  gridGap: "10px",
                  textAlign: "left",
                  display: "grid",
                  alignItems: "start",
                  gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
                }}
                id="containit"
                ref={context.setSumm}
              >    

                {mock.thumbnail && !generatedImage && (
                  <div
                  id="thumbnail"
                    style={{
                      width: "100%",
                      height: "100%",
                      overflow: "auto",
                      position: "relative",
      
                    }}
                  >
                    <span
                      onClick={(e) => thumbnailEdit()}
                      className="edit-image hide-this-thing"
                    >
                      ✎
                    </span>
                    <span onClick={() => fullscreen('thumbnail')} className="expand hide-this-thing">
                    <img src={fullIcon} alt="fullscreen" />
                  </span>
                    <img
                      style={{
                        width: "100%",
                        objectFit: "cover",
                        height: "auto",
                        background: "#fff",
                      }}
                      alt="thumbnail"
                      src={mock.thumbnail}
                    />
                  </div>
                )}

                <div
                  style={{
                    display: "grid",
                    gridRowGap: "5px"
                  }}
                >
                                          <h3>Summary</h3>
                  <label style={{ display: "flex" }}>
                    <p style={{ marginRight: "10px", width: "60px" }}>
                      <strong>Title:</strong>
                    </p>
                    <textarea
                      style={{ height: "40px" }}
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                    />
                  </label>

                  {mock.lastEdited && (
                    <p>
                      <strong>Last Modified: </strong>
                      {moment(mock.lastEdited).format("MMMM Do h:mm A")},{" "}
                      {moment(mock.lastEdited).fromNow()}
                    </p>
                  )}
                  {mock.screenshotInfo && (
                    <p>
                      <strong>View:</strong> {mock.screenshotInfo}
                    </p>
                  )}
                  {mock.url && (
                    <p>
                      <strong>Link: </strong>
                      <a
                        href={mock.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                      >
                        {mock.type} URL
                      </a>
                    </p>
                  )}

                  <label style={{ width: "100%" }}>
                    <p>
                      <strong>Description:</strong>
                    </p>
                    <textarea
                      value={mock.description}
                      onChange={(e) =>
                        setmock({ ...mock, description: e.target.value })
                      }
                    />
                  </label>
                </div>
              </div>
            </Fragment>
          ) : (
            <EditImage
              fromThumbnail={fromThumbnail}
              setRawImage={setRawImage}
              setFromThumbnail={setFromThumbnail}
              thumbnail={mock.thumbnail}
              image={rawImage}
              setGeneratedImage={setGeneratedImage}
              setEditImage={setEditImage}
              setFile={context.setFile}
              setError={setError}
            />
          )
        }
      </BoardContext.Consumer>
    </div>
  );
}
