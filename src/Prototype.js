import React, { useState, Fragment } from "react";
import Summary from "./Summary";
import Upload from "./FileUpload";
import support from "./icon/supports.png";
import Capture from "./Capture";
import Loading from "./Loading";
import "./styles/Prototype.css";
let controller;

export default function Prototype(props) {
  const [url, setUrl] = useState(null);
  const [error, setError] = useState(null);
  const [currentMock, setCurrentMock] = useState({});
  const [loading, setLoading] = useState(false);

  const [attachment, setattachment] = useState("url");

  const xdCommunication = async ( url, name) => {
    //get XD's ID from the URL
    const newurl = url.split("/");
    const viewIndex = newurl.indexOf("view");
    const xdId = newurl[viewIndex + 1];
    const xd = await fetch("https://talkingcloud.io/api/1/xd-call/?xdid=" + xdId);
    await xd
      .json()
      .then(async (res) => {
        const xdObject = {
          type: name,
          id: xdId,
          realTitle: res.name + " by " + res.publisher.displayName,
          url,
          iframe: null,
          thumbnail: res.thumbnail.url,
          lastEdited: res.lastupdated,
        };
        setCurrentMock(xdObject);
      })
      .then(() => props.context.setSetup(true));
  };

  const figmaCommunication = async (service, id) => {
    if (service === "Figma") {
      const apiId = `figma-${id}`;
      if (id) {
        const figma = await fetch(`https://talkingcloud.io/api/1/figma-call/?figid=${id}`);
        await figma
          .json()
          .then(async (res) => {
            const figmaFile = "https://figma.com/file/" + id;

            const figmaObject = {
              type: service,
              id: apiId,
              realTitle: res.name,
              iframe: null,
              url: figmaFile,
              thumbnail: res.thumbnailUrl,
              lastEdited: res.lastModified,
            };
            setCurrentMock(figmaObject);
          })
          .then(() => {
            props.context.setSetup(true);
          })
          .catch(() => {
            setError("Sorry, something went wrong. Please try again.");
            setLoading(false);
          });
      } else {
        console.log("Sorry, could not find an ID");
      }
    }
  };

  const quickThumbnail = async (url, service) => {
    controller = new AbortController();

    setTimeout(() => controller.abort(), 30000);
    setLoading(true);
    const apicall = {
      mode: "desktop",
      full: "yes",
    };
    const talkingImage = `https://talkingcloud.io/api/1/play/?url=${url}&mode=${apicall.mode}&full=${apicall.full}`;
    try {
      fetch(talkingImage, {signal: controller.signal})
        .then((res) => res.blob())
        .then(async (image) => {
          var imageUrl = URL.createObjectURL(image);
          const iFrameData = {
            type: service,
            realTitle: service + " service",
            generatedImage: imageUrl,
            rawImage: image,
            thumbnail: null,
            url: url,
            iframe: null,
          };

          const myFile = new File([image], "thumbnail", { type: image.type });

          const theFile = {
            file: myFile,
            name: "thumbnail",
            ext: ".jpg",
          };

          props.setFile(theFile);
          await setCurrentMock(iFrameData);
          props.context.setSetup(true);
          setLoading(false);
        })
        .catch((err) => {
          controller = new AbortController();
          setLoading(false);
          setError("Sorry, something went wrong. Please try again.");
        });
    } catch {
      setError("Sorry, something went wrong");
    }
  };

  const imageCommunication = async (url) => {
    const imageData = {
      type: "Image",
      thumbnail: url,
      url: url,
      iframe: null,
      lastEdited: null,
      added: new Date(),
    };
    await setCurrentMock(imageData);
    props.context.setSetup(true);
    setError(false);
  };

  const checkForm = async (e, mode) => {
    e.preventDefault();
    let isUrl;

    try {
      isUrl = Boolean(new URL(url));
    } catch {
      setError("Sorry, the URL was not valid");
      isUrl = false;
    }

    if (isUrl) {
      const userInput = url.split("/");
      const urlSplit = url.split(".");
      const urlEnding = urlSplit[urlSplit.length - 1];
      const isimg = /jpeg|jpg|png/g;
      const isVid = /gif|webm|mp4|flv|vob|avi|wmv|mpg|mpeg/g;
      const isItAnImage = urlEnding.match(isimg);
      const isItAVid = urlEnding.match(isVid);

      if (userInput.length > 1 && !isItAnImage && !isItAVid) {
        const cloudUrl = userInput[2];

        const findService = (service) => {
          if (cloudUrl.includes(service)) {
            return cloudUrl;
          }
        };
        switch (cloudUrl) {
          case findService("figma"):
            const id = userInput[4];
            setError(false);
            figmaCommunication("Figma", id);
            break;
          case findService("animaapp"):
            quickThumbnail(url, "Anima");
            setError(false);
            break;
          case findService("adobe"):
            xdCommunication(url, "adobe XD");
            setError(false);
            break;
          case findService("docs.google"):
            quickThumbnail(url, "Google Drive");
            setError(false);
            break;
          case findService("invis"):
            setError(false);
            quickThumbnail(url, "Invision");
            break;
          default:
            quickThumbnail(url, "Custom");
            setError(false);
        }
      } else if (isItAnImage) {
        imageCommunication(url);
      } else if (isItAVid) {
        setError("Sorry, video links are not supported");
      } else {
        setError("Sorry, something went wrong. Please try again.");
      }
    }
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setattachment("upload");
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setattachment("upload");
  };

  return (
    <div className="choose-container">
      {props.context.setup && currentMock && !error ? (
        <Summary currentMock={currentMock} setFile={props.setFile} />
      ) : (
        <div className="input-container">
          {error && (
            <p className="error-message" onClick={() => setError(false)}>
              {error}
            </p>
          )}
          <h2>Show the Idea</h2>
          <div className="button-mode">
            <label className={attachment === "url" ? "active" : undefined}>
              <input
                type="radio"
                name="attach"
                value="url"
                onChange={(e) => setattachment(e.target.value)}
                checked={attachment === "url" ? true : false}
              />
              URL
            </label>

            <label
              htmlFor="tablet"
              className={attachment === "upload" ? "active" : undefined}
            >
              <input
                type="radio"
                name="attach"
                value="upload"
                onChange={(e) => setattachment(e.target.value)}
                checked={attachment === "upload" ? true : false}
              />
              Upload
            </label>

            <label className={attachment === "capture" ? "active" : undefined}>
              <input
                type="radio"
                name="capture"
                value="capture"
                onChange={(e) => setattachment(e.target.value)}
                checked={attachment === "capture" ? true : false}
              />
              Capture
            </label>
          </div>
          {attachment === "url" ? (
            <form onSubmit={(e) => checkForm(e, "desktop")}>
              <h3>Link a brainstorm/sketch/wireframe/mockup/prototype/etc.</h3>

              <label className="input-link">
                <span className="input-button-together">
                  <input
                    onDragOver={(e) => handleDragOver(e)}
                    onDragEnter={(e) => handleDragEnter(e)}
                    id="url"
                    name="url"
                    placeholder="Enter URL ex: https://www.example.com/"
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  {loading ? (
                    <Loading controller={controller} />
                  ) : (
                    <button type="submit">Attach</button>
                  )}
                </span>
              </label>

              <div className="show-support">
                <strong>Supports:</strong>
                <img src={support} alt="supports" />
              </div>
            </form>
          ) : attachment === "upload" ? (
            <Upload
              setCurrentMock={setCurrentMock}
              setSetup={props.context.setSetup}
              setFile={props.context.setFile}
              setErr={setError}
            />
          ) : (
            <Capture
              setCurrentMock={setCurrentMock}
              setSetup={props.context.setSetup}
              context={props.context}
              setFile={props.context.setFile}
              setErr={setError}
            />
          )}
        </div>
      )}
    </div>
  );
}
