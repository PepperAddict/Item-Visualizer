import React, { useRef, useState, Fragment } from "react";
import fullIcon from "./icon/full.svg";
import "./styles/Video.css";
import { closeFullscreen, openFullscreen } from "./utils";
export default function Capture(props) {
  const vidEle = useRef(null);
  const [height, setHeight] = useState(800);
  const [width, setWidth] = useState(800);
  const [initiated, setInitiated] = useState(false);
  const [globalStream, setStream] = useState(null);

  const canny = useRef(null);
  const [src, setSRC] = useState(null);
  const [error, setError] = useState(null);
  const [captured, setCaptured] = useState(null);
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
    navigator.mediaDevices
      .getUserMedia(constraintObj)
      .then((stream) => {
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
          video.play();
        };
      })
      .catch((err) => {
        setInitiated(false);
      });
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
          video.src = window.URL.createObjectURL(vid);
        }
        stream.getVideoTracks()[0].onended = () => {
          setInitiated(false);
          stream.getTracks().forEach(function (track) {
            track.stop();
          });
        };
        video.onloadedmetadata = (ev) => {
          video.play();
        };
      })
      .catch((err) => {
        setInitiated(false);
        setError("something went wrong");
        console.log(err);
      });
  };

  const startRecord = (where = "camera") => {
    setInitiated(true);
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
      globalStream.getTracks().forEach((track) => {
        track.stop();
        setInitiated(false);
      });
    }

    setInitiated(false);
  };

  const capture = (e) => {
    canny.current
      .getContext("2d")
      .drawImage(vidEle.current, 0, 0, width, height);
    canny.current.toBlob((blob) => {
      setCaptured(blob);
    });
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
  };

  const fullscreen = () => {

    if (!document.fullscreenElement) {
      openFullscreen(canny.current);
    } else {
      closeFullscreen()
    }
  };

  return (
    <div className="video-capture-container">
      <h3>Snap your own screenshot using your camera.</h3>
      <div className="video-options">
        {initiated ? (
          <div className="snap">
            <h4>Step 2: Snap a picture</h4>
            <span>
              <button className="button-red" onClick={() => stop()}>
                Stop Camera
              </button>
              <button className="button-blue" onClick={() => capture()}>
                Capture
              </button>
            </span>
          </div>
        ) : isMobile ? (
          <div className="initiate">
            <h4>Step 1: Initiate the Camera</h4>
            <span>
              <button
                className={captured ? "button-gray" : "button-blue"}
                onClick={() => startRecord("front")}
              >
                Front Camera
              </button>
              <button
                className={captured ? "button-gray" : "button-blue"}
                onClick={() => startRecord("environment")}
              >
                Back Camera
              </button>
            </span>
          </div>
        ) : (
          <div className="initiate">
            <h4>Step 1: Initiate the Camera</h4>
            <span>
              <button
                className={captured ? "button-gray" : "button-blue"}
                onClick={() => startRecord("desktop")}
              >
                Screen
              </button>
              <button
                className={captured ? "button-gray" : "button-blue"}
                onClick={() => startRecord("camera")}
              >
                Camera
              </button>
            </span>
          </div>
        )}

        {captured && (
          <div className="final">
            <h4>Final Step: Save and Continue</h4>
            <button className="button-blue" onClick={() => sendIt()}>
              Save
            </button>
          </div>
        )}
      </div>
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
      />
      <div className="limit">
        {captured && (
          <span
            onClick={() =>  fullscreen() }
            className="expand"
          >
            <img src={fullIcon} alt="fullscreen" />
          </span>
        )}

        <canvas ref={canny} width={width} height={height} />
      </div>
    </div>
  );
}
