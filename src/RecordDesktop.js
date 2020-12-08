import React, { useState, useRef } from "react";
import Summary from "./Summary";
import "./styles/Video.css";
let mediaRecorder;

export default function RecordDesktop(props) {
  const vidEle = useRef(null);
  const [src, setSRC] = useState(null);
  const [currentMock, setCurrentMock] = useState({});
  const [recording, setRecording] = useState(false);
  const [thestream, setthestream] = useState(null);
  const [vid, setVid] = useState(null);
  const [error, setError] = useState(null)

  let chunks = [];

  const mediaEverything = (stream) => {
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
    mediaRecorder.onerror = (e) => {
      console.log("eerrrror");
    };

    mediaRecorder.onstop = (ev) => {
      setRecording(false);
      stream.getVideoTracks()[0].onended = () => {
        stream.getTracks().forEach(function (track) {
          track.stop();
        });
      };
      let blob = new Blob(chunks, { type: "video/mp4" });
      let kb = blob.size / 1024
      kb = Number((kb).toFixed(2))
      if (kb > 400000) {
        setError(`Sorry, the video is ${kb} KB which exceeds the upload size. You can download or re-record your video.`)
      } else {
        console.log(kb)
      }
      let videoUrl = window.URL.createObjectURL(blob);

      //clear the chunk and stop the tracks so it stops recording when it stops
      chunks = [];
      stream.getTracks().forEach(function (track) {
        track.stop();
      });

      let video = vidEle.current;
      setSRC(videoUrl);
      setVid(blob)

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
  };
  const saveVideo = e => {
    const iFrameData = {
      type: "Screen Video",
      iframe: src,
      realTitle: "Recorded Video of Screen",
      thumbnail: null,
      url: null,
      generatedImage: null,
    };
    const newFile = {
      file: vid,
      name: "desktop-video",
      ext: ".mp4",
    };

    
    props.setFile(newFile);
    setCurrentMock(iFrameData);
    props.context.setSetup(true);
  }
  const stopRecord = (e) => {
    mediaRecorder.stop();
  };

  const desktopRecord = (e) => {
    setRecording(true);

    const constraintObj = {
      video: true,
    };

    navigator.mediaDevices
      .getDisplayMedia(constraintObj)
      .then(async (stream) => {
        setError(false)
        const videoStream = stream.getVideoTracks()[0];
        const justAudio = await await navigator.mediaDevices.getUserMedia({
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
      })
      .catch((err) => {
        console.log(err)
        setRecording(false);
        setError('Something went wrong')
      });
  };

  return (
    <div className="video-big-container">
      {props.context.setup && currentMock ? (
        <Summary
          setFile={props.setFile}
          context={props.context}
          currentMock={currentMock}
        />
      ) : (
        <div className="video-container">
          {error && <p className="error-message" onClick={() => setError(null)}>{error}</p>}
          
          <h2>Show Your Screen</h2>
          <h3>Record your screen, application, or browser tab.</h3>

          {recording ? (
            <button className="button-red" onClick={(e) => stopRecord()}>
              Stop Record
            </button>
          ) : (
            <div className="together-vid">
              <button className={src ? "button-gray": "button-blue"} onClick={() => desktopRecord()}>
                {src ? "Re-record Video" : "Record Screen"}
              </button>
              {src && !error && <button onClick={e => saveVideo()} className="button-blue">Save Video</button>}
            </div>
          )}

          <video
            className={src ? null : "inactive"}
            autoPlay
            muted
            src={src && src}
            ref={vidEle}
          />
        </div>
      )}
    </div>
  );
}
