import React, { useRef, useState, Fragment, useEffect } from "react";

import "../styles/Video.css";
import { closeFullscreen, openFullscreen } from "../utils";
import HiddenButtons from "../utils/HiddenButtons";
export default function Capture(props) {
  const vidEle = useRef(null);
  const details = useRef(null);
  const videoBehind = useRef(null);
  const [height, setHeight] = useState(800);
  const [width, setWidth] = useState(800);
  const [initiated, setInitiated] = useState(false);
  const [globalStream, setStream] = useState(null);
  const [taken, setTaken] = useState(false);
  const [hideTip, setHideTip] = useState(true);
  const documentationEndpoint = "https://pepperaddict.github.io/item-visualizer-documentation/"

  const canny = useRef(null);
  const [src] = useState(null);
  const [error, setError] = useState({
    message: null, 
    type: null
  });
  const [captured, setCaptured] = useState(null);

  const sayStuff = (stream = globalStream, ini = initiated) => {
    if (ini) {
      let { width, height } = stream.getTracks()[0].getSettings();
      navigator.mediaSession.setActionHandler("pause", function () {
        navigator.mediaSession.playbackState = "paused";
        capture(true, width, height);
      });
    }
  };

  useEffect(() => {
    document.dispatchEvent(
      new KeyboardEvent(
        "keypress",
        {
          key: "Enter",
        },
        (e) => {
          console.log(e);
        }
      )
    );
  }, []);

  useEffect(() => {
    return () => {
      if (globalStream) {
        globalStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    };
  }, [globalStream]);

  useEffect(() => {
    videoBehind.current.src = require("../logofast.mp4");
    videoBehind.current
      .play()
      .then((_) => {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: "Waiting for Camera or Desktop",
          artist: "Item Visualizer",
          artwork: [
            {
              src: require("../icon/itemIcon.png"),
              sizes: "96x96",
              type: "image/png",
            },
          ],
        });
        sayStuff(null, false);
      })
      .catch((error) => console.log(error.message));
  }, [videoBehind]);

  const [isMobile] = useState(() => {
    let check = false;
    (() => {
      if (
        /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
          navigator.userAgent
        )
      ) {
        check = true;
      }
    })(navigator.userAgent || navigator.vendor || window.opera);
    return check;
  });

  const camera = (constraintObj) => {
    try {
      navigator.mediaDevices
        .getUserMedia(constraintObj)
        .then((stream) => {
          setInitiated(true);
          let video = vidEle.current;
          setStream(stream);
          if ("srcObject" in video) {
            video.srcObject = stream;
          } else {
            let vid = [];
            vid.push(stream);
            video.src = window.URL.createObjectURL(vid);
          }
          stream.getVideoTracks()[0].onended = () => {
            setInitiated(false);

            stream.getTracks().forEach(function (track) {
              track.stop();
            });
          };
          video.onloadedmetadata = (ev) => {
            video.play().then(() => {
              setInitiated(true);
              navigator.mediaSession.metadata = new window.MediaMetadata({
                title: "Camera Capture",
                artist: "Item Visualizer",
                artwork: [
                  {
                    src: require("../icon/itemIcon.png"),
                    sizes: "96x96",
                    type: "image/png",
                  },
                ],
              });
              sayStuff(stream, true);
            });
          };
        })
        .catch((err) => {
          if (err.name === "NotAllowedError") {
            setError({message: "Please Grant Permission to Use Microphone and Camera", type: 1});
          } else if (err.name === "NotFoundError") {
            setError({message: "Camera Not Detected", type: 2})
          } else {
            console.log(err.name)
            setError({message: "Something went wrong", type: 3});
          }
          setInitiated(false);
        });
    } catch (err) {
      setError({message: "Something went wrong", type: 3});
      setInitiated(false);
      console.log(err);
    }
  };

  const desktop = (constraintObj) => {
    navigator.mediaDevices
      .getDisplayMedia(constraintObj)
      .then((stream) => {
        setStream(stream);

        let video = vidEle.current;
        if ("srcObject" in video) {
          video.srcObject = stream;
        } else {
          let vid = [];
          vid.push(stream);
          video.srcObject = stream;
          video.src = window.URL.createObjectURL(vid);
        }
       
        stream.getVideoTracks()[0].onended = () => {


          setInitiated(false);
          stream.getTracks().forEach(function (track) {
            if (taken === false && navigator.mediaSession.playbackState == "none") {

              let { width, height } = globalStream.getTracks()[0].getSettings();
              capture(false, width, height);
            }
            track.stop();
          });
        };

        video.onloadedmetadata = (ev) => {
          video.play().then(() => {
            setInitiated(true);

            navigator.mediaSession.metadata = new window.MediaMetadata({
              title: "Screen Capture",
              artist: "Item Visualizer",
              artwork: [
                {
                  src: require("../icon/itemIcon.png"),
                  sizes: "96x96",
                  type: "image/png",
                },
              ],
            });
            sayStuff(stream, true);
          });
        };
      })
      .catch((err) => {
        setInitiated(false);
        setError({message: "Something went wrong", type: 3});
      });
  };

  const startRecord = (where = "camera") => {
    setInitiated(true);
    setTaken(false);
    navigator.mediaSession.playbackState = 'none'
    let constraintObj;
    switch (where) {
      case "environment":
        constraintObj = {
          video: { facingMode: { exact: "environment" } },
        };
        camera(constraintObj);
        break;
      case "face":
        constraintObj = {
          video: { facingMode: "user" },
        };
        camera(constraintObj);
        break;
      case "camera":
        constraintObj = {
          video: true,
        };
        camera(constraintObj);
        break;
      case "desktop":
        constraintObj = {
          video: true,
        };
        desktop(constraintObj);
        break;
      default:
        constraintObj = {
          video: true,
        };
        camera(constraintObj);
    }
  };

  const setDimensions = (e) => {
    setHeight(vidEle.current.videoHeight);
    setWidth(vidEle.current.videoWidth);
  };
  const stop = (e) => {
    if (taken === false && navigator.mediaSession.playbackState == "none") {

      let { width, height } = globalStream.getTracks()[0].getSettings();
      capture(false, width, height);
    }

    if (globalStream) {
      vidEle.current.srcObject = null;
      if (!taken) {
        let { width, height } = globalStream.getTracks()[0].getSettings();
        capture(false, width, height);
      }

      globalStream.getTracks().forEach((track) => {
        track.stop();
      });
    }

    setInitiated(false);
  };

  const captureReal = (w = null, h = null) => {
    try {
      canny.current
        .getContext("2d")
        .drawImage(vidEle.current, 0, 0, w ? w : width, h ? h : height);

      canny.current.toBlob((blob) => {
        setCaptured(blob);
      });
    } catch (err) {
      console.log(err);
    }
  };
  const capture = (e = false, w = null, h = null) => {

    if (e === true) {
      setTaken(true);
      navigator.mediaSession.playbackState = 'paused'
      captureReal(w, h);
    } else if (taken === false) {
      captureReal(w, h);
    }
  };

  const sendIt = (e) => {
    stop();
    const imageurl = URL.createObjectURL(captured);
    const iFrameData = {
      type: "Screen Capture",
      generatedImage: imageurl,
      rawImage: captured,
      thumbnail: null,
      realTitle: "Screen Capture",
    };
    const newfile = new File([captured], "screenshot.png" , {lastModified: Date.now(),  type: captured.type });

    props.setFile(newfile);
    props.setCurrentMock(iFrameData);
    props.setSetup(true);
    props.context.setReady(true);
  };

  const fullscreen = () => {
    if (!document.fullscreenElement) {
      openFullscreen(canny.current);
    } else {
      closeFullscreen();
    }
  };
  const goHere = (name) => {
    window.open(`${documentationEndpoint}#/how#${name}`, "_blank");
  };

  return (
    <div className="video-capture-container">
      {error.message && (
        <p className="error-message" onClick={() => setError({message: null, type: null})}>
          {error.message}
          {error.type == 1 && (
                      <span
            className="go-here tooltip"
            onClick={() => goHere("initialize")}
          >
            ?<span className="tooltiptext">Troubleshoot Error</span>
          </span>
          )}

        </p>
      )}
      <h3>Capture a screenshot from your camera or screen.</h3>
      <div className="video-options">
        {initiated ? (
          <div>
            <span className="split">
              <button className="button-red" onClick={() => stop()}>
                <span className="fontawesome-remove"></span>
                Stop Camera
              </button>
              <button className="button-blue" onClick={() => capture(true)}>
                <span className="fontawesome-circle-blank"></span>
                Capture
              </button>
            </span>
          </div>
        ) : isMobile ? (
          <div>
            <span>
              <button
                className={captured ? "button-gray" : "button-blue"}
                onClick={() => startRecord("front")}
              >
                <span className="fontawesome-user"></span>
                Front Camera
              </button>
              <button
                className={captured ? "button-gray" : "button-blue"}
                onClick={() => startRecord("environment")}
              >
                <span className="fontawesome-globe"></span>
                Back Camera
              </button>
            </span>
          </div>
        ) : (
          <div>
            <span className="split">
              <button
                className={captured ? "button-gray" : "button-blue"}
                onClick={() => startRecord("camera")}
              >
                <span className="fontawesome-camera"></span>
                Camera
              </button>
              <button
                className={captured ? "button-gray" : "button-blue"}
                onClick={() => startRecord("desktop")}
              >
                <span className="fontawesome-desktop"></span>
                Screen
              </button>
            </span>
          </div>
        )}
      </div>
      <video
        loop
        autoPlay
        src={require("../logofast.mp4")}
        controls
        ref={videoBehind}
        style={{ visibility: "hidden", position: "fixed" }}
      />

      <video
        ref={vidEle}
        className={src ? null : "inactive"}
        width="100%"
        height="100%"
        onLoadedData={() => setDimensions()}
        onLoadedMetadata={() => setDimensions()}
        autoPlay
        src={src && src}
        muted
        controls
      />


        <details className={(captured) ? "position-last quick-alert" : "quick-alert"} ref={details} >
          <summary> There are 3 ways to snap a screenshot while streaming: </summary>
        <p onClick={() => (details.current.open) ? details.current.open = false : details.current.open = true}>
        <span
            className="go-here tooltip"
            onClick={() => goHere("media-keys")}
          >
            ?<span className="tooltiptext">Learn more about Media Keys</span>
          </span>
          1. Press the <strong>Capture </strong>button.
          <br />
          2. Press your media <strong>play/pause </strong>key on your keyboard. <br />
          3. End your <i>screen capture stream</i> by pressing <strong>Stop Sharing</strong> if the
          above were not used.
          <br />

        </p>
        </details>

      <div className="limit">
        {captured && (
          <Fragment>
            <HiddenButtons
              fullscreen={fullscreen}
              setEditImage={null}
              edited={null}
              resetImage={null}
            />
            <div className="final">
              <button className="button-blue" onClick={() => sendIt()}>
                <span className="fontawesome-ok"></span>
                Save and Continue
              </button>
            </div>
          </Fragment>
        )}
        <canvas ref={canny} width={width} height={height} />
      </div>
    </div>
  );
}
