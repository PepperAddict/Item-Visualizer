import React, { useRef, useState, Fragment, useEffect } from "react";

import "./styles/Video.css";
import { closeFullscreen, openFullscreen } from "./utils";
import HiddenButtons from "./HiddenButtons";
export default function Capture(props) {
  const vidEle = useRef(null);
  const videoBehind = useRef(null);
  const [height, setHeight] = useState(800);
  const [width, setWidth] = useState(800);
  const [initiated, setInitiated] = useState(false);
  const [globalStream, setStream] = useState(null);
  const [taken, setTaken] = useState(false);
  const [hideTip, setHideTip] = useState(true)
  const canny = useRef(null);
  const [src] = useState(null);
  const [error, setError] = useState(null);
  const [captured, setCaptured] = useState(null);

  const sayStuff = (stream = globalStream, ini = initiated) => {
    if (ini) {
      let { width, height } = stream.getTracks()[0].getSettings();
      navigator.mediaSession.setActionHandler("play", async function () {
        capture(true, width, height);
      });

      navigator.mediaSession.setActionHandler("pause", function () {
        capture(true, width, height);
      });
    }
  };
  useEffect(() => {
    return () => {

      if (globalStream) {
        globalStream.getTracks().forEach((track) => {
          track.stop();
        });
      }
    }
  }, [globalStream])

  useEffect(() => {
    videoBehind.current.src = require("./logofast.mp4");
    videoBehind.current
      .play()
      .then((_) => {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: "Waiting for Camera or Desktop",
          artist: "Item Visualizer",
          artwork: [
            {
              src: require("./icon/itemIcon.png"),
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
                    src: require("./icon/itemIcon.png"),
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
            setError("Please Grant Permission to Use Microphone and Camera");
          } else {
            setError("Something went wrong");
          }
          setInitiated(false);
        });
    } catch (err) {
      setError("Something went wrong");
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
          // if (!taken) {
          //removed feature for now as it automatically screenshots upon close
          //   console.log("captured");
          //   capture(false, width, height);
          // }
          setInitiated(false);
          stream.getTracks().forEach(function (track) {
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
                  src: require("./icon/itemIcon.png"),
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
        setError("Something went wrong");
        console.log(err);
      });
  };

  const startRecord = (where = "camera") => {
    setInitiated(true);
    setTaken(false);
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
    if (globalStream) {
      vidEle.current.srcObject = null;
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
      captureReal(w, h);
    }
    if (taken === false) {
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
    const newfile = new File([captured], "screenshot", { type: captured.type });
    const thefile = {
      file: newfile,
      name: "screenshot",
      ext: ".png",
    };
    props.setFile(thefile);
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
  const goHere = () => {
    window.open("https://itemvisualizer.com/#/how#initialize", "_blank");
  };

  return (
    <div className="video-capture-container">
      {error && (
        <p className="error-message" onClick={() => setError(null)}>
          {error}
          <span className="go-here tooltip" onClick={() => goHere()}>
            ?<span className="tooltiptext">Troubleshoot</span>
          </span>
        </p>
      )}
      <h3>Capture a screenshot from your camera or screen.</h3>
      <div className="video-options">
        {initiated ? (
          <div className="initiate">
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
          <div className="initiate">
            <span className="split">
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
          <div className="initiate">
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
        src={require("./logofast.mp4")}
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

{hideTip &&  <p className="quick-alert" onClick={() => setHideTip(false)}>
        While streaming, press your play/pause media key on your keyboard to 
        snap a screenshot.
      </p>}


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
