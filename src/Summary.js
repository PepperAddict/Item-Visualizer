import React, { useState, Fragment } from "react";
import moment from "moment";
import { BoardContext } from "./Context";
import EditImage from "./EditImage";
import "./styles/Summary.css";
import { closeFullscreen, openFullscreen } from "./utils";

import HiddenButtons from "./HiddenButtons";

export default function Summary({ currentMock }) {
  const [mock, setmock] = useState(currentMock);
  const [error, setError] = useState(null);
  const [editImage, setEditImage] = useState(null);
  const [fromThumbnail, setFromThumbnail] = useState(false);
  const [generatedImage, setGeneratedImage] = useState(mock.generatedImage);
  const [newTitle, setNewTitle] = useState(mock.realTitle);
  const [rawImage, setRawImage] = useState(mock.rawImage);
  const [edited, setEdited] = useState(false);



  const resetImage = (e) => {
    if (mock.generatedImage) {
      setEdited(false);
      setGeneratedImage(mock.generatedImage);
      setRawImage(mock.rawImage);
    } else if (mock.thumbnail) {
      setGeneratedImage(null);
    }
  };

  const fullscreen = (name) => {
    let thatElement = document.getElementById(name);

    if (!document.fullscreenElement) {
      openFullscreen(thatElement);
    } else {
      closeFullscreen();
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
                  <HiddenButtons
                    fullscreen={fullscreen}
                    setEditImage={setEditImage}
                    edited={edited}
                    resetImage={resetImage}
                    setReady={context.setReady}
                  />

                  <span className="thumb-container">
                    <img src={generatedImage} alt="generated screen shot" />
                  </span>
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
                    <HiddenButtons
                      fullscreen={fullscreen}
                      setEditImage={setEditImage}
                      edited={edited}
                      resetImage={resetImage}
                      setReady={context.setReady}


                    />
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
                    gridRowGap: "5px",
                  }}
                >
                  <h1>Summary</h1>
                  <label style={{ display: "flex" }}>
                    <p style={{ marginRight: "10px", width: "60px" }}>
                      <strong>Title:</strong>
                    </p>
                    <textarea
                      placeholder="Enter a Title"
                      style={{ height: "45px" }}
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
                      placeholder="Enter a Description"
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
              setEdited={setEdited}
              setReady={context.setReady}
            />
          )
        }
      </BoardContext.Consumer>
    </div>
  );
}
