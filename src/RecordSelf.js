import React, { useState, useRef, Fragment, useEffect } from "react";
import Summary from "./Summary";
import "./styles/Video.css";
let mediaRecorder;
export default function RecordSelf(props) {
  const vidEle = useRef(null);
  const videoBehind = useRef(null);
  const [src, setSRC] = useState(null);
  const [currentMock, setCurrentMock] = useState({});
  const [recording, setRecording] = useState(false);
  const [thestream, setthestream] = useState(null);
  const [vid, setVid] = useState(null);
  const [hideTip, setHideTip] = useState(true);
  const [error, setError] = useState(null);
  const [mute, setMute] = useState(false);
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

  useEffect(() => {
    return () => {
      if (mediaRecorder && mediaRecorder.state === "recording") {
        mediaRecorder.stop();
      }
    }
  }, [])

  useEffect(() => {
    videoBehind.current.src = require("./logofast.mp4");
    videoBehind.current.volume = 1;
    videoBehind.current
      .play()
      .then((_) => {
        navigator.mediaSession.metadata = new window.MediaMetadata({
          title: "Waiting for Stream",
          artist: "Item Visualizer",
          artwork: [
            {
              src: require("./icon/itemIcon.png"),
              sizes: "96x96",
              type: "image/png",
            },
          ],
        });
      })
      .catch((error) => console.log(error.message));
    sayStuff(videoBehind.current);
  }, [videoBehind]);

  const sayStuff = (video) => {
    try {
      navigator.mediaSession.setActionHandler("play", function () {
        console.log("playing");
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }

        navigator.mediaSession.playbackState = "playing";
        video.play();
      });
      navigator.mediaSession.setActionHandler("pause", function () {
        console.log("paused");
        if (mediaRecorder && mediaRecorder.state === "recording") {
          mediaRecorder.stop();
        }
        navigator.mediaSession.playbackState = "paused";
        video.pause();
      });
    } catch (err) {
      console.log(err);
    }
  };

  const mediaEverything = (stream) => {
    try {
      mediaRecorder = new MediaRecorder(stream);
      mediaRecorder.start();
      mediaRecorder.ondataavailable = (ev) => {
        chunks.push(ev.data);
      };

      if (!mute) {
        stream.getAudioTracks()[0].enabled = true;
      } else if (mute) {
        stream.getAudioTracks()[0].enabled = false;
      }

      stream.getVideoTracks()[0].onended = () => {
        stream.getTracks().forEach(function (track) {
          track.stop();
        });
      };

      mediaRecorder.onstop = (ev) => {
        let blob = new Blob(chunks, { type: "video/mp4" });
        let kb = blob.size / 1024;
        kb = Number(kb.toFixed(2));

        try {
        if (kb > 20000) {
          let size = blob.size;
          setError(
            `Size Limit is 20MB. Your video is ${(
              size / Math.pow(1024, 2)
            ).toFixed(1)}MB. You can download your video, but cannot upload.`
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
        video.volume = 1;
        video.controls = true;
        video.defaultMuted = false;
        video.muted = false;

        video.play().then((res) => {
          navigator.mediaSession.metadata = new window.MediaMetadata({
            title: "Recorded Video",
            artist: "Item Visualizer",
            artwork: [
              {
                src: require("./icon/itemIcon.png"),
                sizes: "96x96",
                type: "image/png",
              },
            ],
          });
          navigator.mediaSession.setPositionState({
            duration: 999999, //didn't allow infinite from stream
            playbackRate: video.playbackRate,
            position: video.currentTime,
          });

          sayStuff(video);
        });

        setthestream(null);
        } catch(err) {
          console.log(err)
        }


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

          video.play();

          mediaEverything(newStream);
        } catch (err) {
          stream.getTracks().forEach((track) => track.stop());
          setRecording(false);
          if (err.name === "NotAllowedError") {
            setError("Please Grant Permission to Use Microphone and Camera");
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
    let kb = vid.size / 1024;
    kb = Number(kb.toFixed(2));
    if (kb > 20000) {
      let size = vid.size;
      setError(
        `Size Limit is 20MB. Your video is ${(size / Math.pow(1024, 2)).toFixed(
          1
        )}MB. You can download your video, but cannot upload.`
      );

      props.setFile(newFile);
      setCurrentMock(iFrameData);
      props.context.setSetup(true);
    } else {
      props.setFile(newFile);
      setCurrentMock(iFrameData);
      props.context.setSetup(true);
    }
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

        video.play();

        mediaEverything(stream);
      })
      .catch((err) => {
        if (err.name === "NotAllowedError") {
          setError("Please Grant Permission to Use Microphone and Camera");
        } else {
          setError("Something went wrong");
        }
        setRecording(false);
      });
  };

  const goHere = (name) => {
    window.open(`https://itemvisualizer.com/#/how#${name}`, "_blank");
  };

  const muteMe = (e) => {
    if (thestream && !mute) {
      setMute(e);
      thestream.getAudioTracks()[0].enabled = false;
    } else if (thestream && mute) {
      setMute(e);
      thestream.getAudioTracks()[0].enabled = true;
    }
  };

  return (
    <div className="video-big-container">
      {props.context.setup && currentMock ? (
        <Summary currentMock={currentMock} />
      ) : (
        <div className="video-container">
          {error && (
            <p className="error-message" onClick={() => setError(null)}>
              {error}
              <span className="go-here tooltip" onClick={() => goHere()}>
                ?<span className="tooltiptext">Troubleshoot</span>
              </span>
            </p>
          )}

          <h2>Show the Video</h2>
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

          <div className="mute-vid-dl">
            <video
              loop
              autoPlay
              controls
              ref={videoBehind}
              style={{ visibility: "hidden", position: "fixed" }}
            />
            <video
              ref={vidEle}
              className={src ? null : "inactive"}
              src={src && src}
            />
            {hideTip && (
                          <p className="quick-alert" onClick={() => setHideTip(false)}>Video Size Limit: 20MB <br/> <br />

            To end your recording, press the <strong>Stop</strong> button, <br />
            or press your <strong>play/pause</strong> media key.
              
             <span className="go-here tooltip" onClick={() => goHere('media-keys')}>
            ?<span className="tooltiptext">Learn more about Media Keys</span>
          </span>
          </p>
            )}



            {thestream && (
              <button
                className="button-round tooltip"
                onClick={() => (mute ? muteMe(false) : muteMe(true))}
              >
                {mute ? (
                  <Fragment>
                    <img src={require("./icon/mic-slash.svg")} />
                    <span className="tooltiptext">press to unmute</span>
                  </Fragment>
                ) : (
                  <Fragment>
                    <img src={require("./icon/mic.svg")} />
                    <span className="tooltiptext">press to mute</span>
                  </Fragment>
                )}
              </button>
            )}

            {src && (
              <a href={src} download>
                <button className="button-blue">Download Video</button>
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
