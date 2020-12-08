import React, { useState, useRef } from "react";
import Summary from "./Summary";
import "./styles/Video.css";
let mediaRecorder;
export default function RecordSelf(props) {
  const vidEle = useRef(null);
  const [src, setSRC] = useState(null);
  const [currentMock, setCurrentMock] = useState({});
  const [recording, setRecording] = useState(false);
  const [thestream, setthestream] = useState(null);
  const [vid, setVid] = useState(null);
  const [error, setError] = useState(null);
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
  let chunks = [];

  const mediaEverything = (stream) => {
    try {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      mediaRecorder.ondataavailable = (ev) => {
        chunks.push(ev.data);
      };
      stream.getVideoTracks()[0].onended = () => {
        stream.getTracks().forEach(function (track) {
          track.stop();
        });
      };
      mediaRecorder.onstop = (ev) => {
        let blob = new Blob(chunks, { type: "video/mp4" });
        let kb = blob.size / 1024;
        kb = Number(kb.toFixed(2));
        if (kb > 400000) {
          setError(
            `Sorry, the video is ${kb} KB which exceeds the upload size. You can download or re-record your video.`
          );
        }

        let videoUrl = window.URL.createObjectURL(blob);
        setRecording(false);
        //clear the chunk and stop the tracks so it stops recording when it stops
        chunks = [];
        stream.getTracks().forEach(function (track) {
          track.stop();
        });
        setSRC(videoUrl);
        setVid(blob);
        let video = vidEle.current;
        if ("srcObject" in video) {
          video.srcObject = thestream;
        } else {
          video.src = videoUrl;
        }
        video.controls = true;
        video.defaultMuted = false;
        video.muted = false;
        setthestream(null);
      };
    } catch (err) {
      console.log(err);
      setRecording(false);
      setError("Something went wrong");
    }
  };

  const desktopRecord = (e) => {
    setRecording(true);
    const constraintObj = {
      video: {
        width: { ideal: 4096 },
        height: { ideal: 2160 },
      },
    };

    navigator.mediaDevices
      .getDisplayMedia(constraintObj)
      .then(async (stream) => {
        setError(false);
        try {
          const videoStream = stream.getVideoTracks()[0];
          const justAudio = await navigator.mediaDevices.getUserMedia({
            audio: true,
          });
          const audioStream = justAudio.getAudioTracks()[0];
          const newStream = new MediaStream();

          newStream.addTrack(videoStream);
          newStream.addTrack(audioStream);
          
          setthestream(newStream);

          let video = vidEle.current;
          if ("srcObject" in video) {
            video.srcObject = newStream;
          } else {
            let vid = [];
            vid.push(newStream);
            video.src = video.URL.createObjectURL(vid);
          }

          video.defaultMuted = true;
          video.muted = true;
          video.onloadeddata = (ev) => {
            video.play();
          };

          mediaEverything(newStream);
        } catch (err) {
          stream.getTracks().forEach(track=> track.stop())
          setRecording(false);
          if (err.name === 'NotAllowedError') {
            setError("Please Grant Permission to Use Microphone and Camera")
          } else {
            setError("Something went wrong");
          }
          
        }
      })
      .catch((err) => {
        setRecording(false);
        setError("Something went wrong");
      });
  };

  const saveVideo = (e) => {
    const iFrameData = {
      type: "Video",
      iframe: src,
      realTitle: "Recorded Video",
      generatedImage: null,
      thumbnail: null,
      url: null,
    };

    const newFile = {
      file: vid,
      name: "desktop-video",
      ext: ".mp4",
    };

    props.setFile(newFile);
    setCurrentMock(iFrameData);
    props.context.setSetup(true);
  };

  const stopRecord = (e) => {
    mediaRecorder && mediaRecorder.stop();
  };

  const startRecord = (where = null) => {
    setError(false);
    setRecording(true);

    let constraintObj;
    if (where === "env") {
      constraintObj = {
        audio: true,
        video: { facingMode: { exact: "environment" } },
      };
    } else if (where === "face") {
      constraintObj = {
        audio: true,
        video: { facingMode: "user" },
      };
    } else {
      constraintObj = {
        audio: true,
        video: true,
      };
    }

    navigator.mediaDevices
      .getUserMedia(constraintObj)
      .then((stream) => {
        setthestream(stream);
        let video = vidEle.current;

        if ("srcObject" in video) {
          video.srcObject = stream;
        } else {
          let vid = [];
          vid.push(stream);
          video.src = window.URL.createObjectURL(vid);
        }
        video.defaultMuted = true;
        video.muted = true;

        video.onloadedmetadata = (ev) => {
          video.play();
        };

        mediaEverything(stream);
      })
      .catch((err) => {
        if (err.name === 'NotAllowedError') {
          setError("Please Grant Permission to Use Microphone and Camera")
        } else {
          setError("Something went wrong");
        }
        setRecording(false);
      });
  };

  const goHere = () => {
    window.open('https://itemvisualizer.com/#/how#initialize', '_blank')
  }

  return (
    <div className="video-big-container">
      {props.context.setup && currentMock ? (
        <Summary currentMock={currentMock} />
      ) : (
        <div className="video-container">
          {error && (
            <p className="error-message" onClick={() => setError(null)}>
              {error}
              <span className="go-here" onClick={() => goHere()}>?</span>
            </p>
          )}

          <h2>Show a Video</h2>
          <h3>Initiate and Record a video.</h3>
          {recording ? (
            <button className="button-red" onClick={() => stopRecord()}>
              <span className="fontawesome-remove"></span>
              Stop Recording
            </button>
          ) : (
            <div className="together-vid video-options">
              {isMobile ? (
                <span className="split">
                  <button
                    className={src ? "button-gray" : "button-blue"}
                    onClick={() => startRecord("face")}
                  >
                    <span className="fontawesome-user"></span>
                    Front
                  </button>
                  <button
                    className={src ? "button-gray" : "button-blue"}
                    onClick={() => startRecord("env")}
                  >
                    <span className="fontawesome-globe"></span>
                    Environment
                  </button>
                </span>
              ) : (
                <span className="split">
                  <button
                    className={src ? "button-gray" : "button-blue"}
                    onClick={() => startRecord()}
                  >
                    <span className="fontawesome-camera"></span>
                    Camera
                  </button>
                  <button
                    className={src ? "button-gray" : "button-blue"}
                    onClick={() => desktopRecord()}
                  >
                    <span className="fontawesome-desktop"></span>
                    Screen
                  </button>
                </span>
              )}

              {src && !error && (
                <button onClick={(e) => saveVideo()} className="button-blue">
                  <span className="fontawesome-ok"></span>
                  Save and Continue
                </button>
              )}
            </div>
          )}
          <video
            ref={vidEle}
            className={src ? null : "inactive"}
            autoPlay
            src={src && src}
            muted
          />
          {props.file && <a href={props.file}>Download</a>}
        </div>
      )}
    </div>
  );
}
