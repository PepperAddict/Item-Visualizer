import React, { useState, useEffect, useRef, Fragment } from "react";
import mergeImages from "merge-images";

import { closeFullscreen, openFullscreen } from "./index";


export default function EditImage(props) {
  const canvas = useRef(null);
  const [paint, setPaint] = useState(false);
  const [color, setColor] = useState("#F65F7C");
  const thisImg = new Image();
  const [bg, setbg] = useState(null);
  thisImg.src = bg;
  const reader = new FileReader();
  const [draw, setDraw] = useState(true);
  const [text, setText] = useState("text");
  const canny = document.getElementById("container");

  const [range, setRange] = useState(2);

  let clickX = [];
  let clickY = [];
  let forUndo = [];
  let redoStack = [];
  const [context, setContext] = useState(null);
  const [mounted, setMounted] = useState(false);

  const toDataURL = (url, callback) => {
    //this is for converting image to blob
    fetch("https://cors-anywhere.herokuapp.com/" + url)
      .then((res) => res.blob())
      .then((response) => {
        let newreader = new FileReader();
        newreader.readAsDataURL(response);
        newreader.onloadend = () => {
          callback(newreader.result);
        };
      })
      .catch(() => {
        props.setError("Sorry, this image cannot be edited");
        props.setEditImage(false);
      });
  };

  useEffect(() => {
    setMounted(true);
    if (props.image instanceof Blob) {
      reader.readAsDataURL(props.image);
      reader.onloadend = () => {
        setbg(reader.result);
      };
    } else {
      toDataURL(props.thumbnail, (dataUrl) => {
        setbg(dataUrl);
      });
    }

    return () => setMounted(false);
  }, [reader, toDataURL, mounted]);

  useEffect(() => {
    if (canvas && bg && mounted) {
      setContext(canvas.current.getContext("2d"));
    }

    return () => setMounted(false);
  }, [canvas, bg, mounted]);

  const addClick = (x, y, dragging) => {
    clickX.push(x);
    clickY.push(y);
  };

  const redraw = (e) => {
    context.strokeStyle = color;
    context.lineJoin = "round";
    context.lineWidth = range;

    for (var i = 0; i < clickX.length; i++) {
      context.beginPath();
      context.moveTo(clickX[i - 1], clickY[i - 1]);
      context.lineTo(clickX[i], clickY[i]);
      context.closePath();
      context.stroke();
    }
  };

  const font = (e) => {
    context.fillStyle = color;
    context.font = `bold ${range}px serif`;
    for (var i = 0; i < clickX.length; i++) {
      context.beginPath();
      context.moveTo(clickX[i - 1], clickY[i - 1]);
      let lines = text.split("\n");
      let lineheight = 15;
      for (var j = 0; j < lines.length; j++) {
        context.fillText(lines[j], clickX[i], clickY[i] + j * lineheight);
      }

      context.closePath();
      context.stroke();
    }
  };

  const move = (e) => {
    const rect = canvas.current.getBoundingClientRect();
    const sizeObj = {
      h: rect.left,
      t: rect.top,
    };

    if (paint) {
      addClick(e.pageX - sizeObj.h, e.pageY - sizeObj.t);
      if (draw) redraw();
      else font();
    }
  };

  const touchMove = (e) => {
    e.preventDefault();
    const rect = canvas.current.getBoundingClientRect();
    const sizeObj = {
      h: rect.left,
      t: rect.top,
    };

    if (paint) {
      addClick(e.touches[0].pageX - sizeObj.h, e.touches[0].pageY - sizeObj.t);
      if (draw) redraw();
      else font();
    }
  };

  const down = (e) => {
    const rect = canvas.current.getBoundingClientRect();
    const sizeObj = {
      h: rect.left,
      t: rect.top,
    };

    if (!paint) {
      setPaint(true);
      addClick(e.pageX - sizeObj.h, e.pageY - sizeObj.t);
      if (draw) redraw();
      else font();
    }
  };

  const touchDown = (e) => {
    e.preventDefault();
    const rect = canvas.current.getBoundingClientRect();
    const sizeObj = {
      h: rect.left,
      t: rect.top,
    };

    if (!paint) {
      setPaint(true);
      addClick(e.touches[0].pageX - sizeObj.h, e.touches[0].pageY - sizeObj.t);
      if (draw) redraw();
      else font();
    }
  };

  const up = (e) => {
    setPaint(false);

    const rect = canvas.current.getBoundingClientRect();
    const sizeObj = {
      h: rect.left,
      t: rect.top,
    };

    //save for undo
    forUndo.push({
      x: e.pageX - sizeObj.h,
      y: e.pageY - sizeObj.t,
      size: range,
      color: color,
      mode: draw ? "draw" : "text",
    });
  };

  const generateImage = async (e) => {
    
    if (mounted) {
      const drawing = canvas.current.toDataURL("image/png");
      await mergeImages([bg, drawing]).then(async (b64) => {
        //now lets convert the new image to blob for uploading
        await fetch(b64)
          .then((res) => res.blob())
          .then(async (res) => {
            const newfile = new File([res], "generated-image.png", {
              lastModified: Date.now(),
              type: res.type,
            });

            props.setRawImage(res);
            props.setFile(newfile);
            props.setGeneratedImage(b64);
            closeFullscreen(canny);
            props.setEdited(true);
            props.setEditImage(false);
            props.setReady(true);
          });
      }).catch((err) => console.log(err))
    }
  };

  const clearCanvas = (e) => {
    context.clearRect(0, 0, context.canvas.width, context.canvas.height);
    context.beginPath();
  };
  const fullscreen = () => {
    if (!document.fullscreenElement) {
      openFullscreen(canny);
    } else {
      closeFullscreen();
    }
  };
  const goBack = (e) => {
    props.setEditImage(false);
    closeFullscreen();
  };
  const redrawAll = (e) => {
    context.strokeStyle = color;
    context.lineJoin = "round";
    context.lineWidth = range;

    for (var i = 0; i < redoStack.length; i++) {
      console.log(i);
      // context.beginPath();
      // context.moveTo(redoStack.x[i - 1], redoStack.y[i - 1]);
      // context.lineTo(redoStack.x[i], redoStack.y[i]);
      // context.closePath();
      // context.stroke();
    }
  };

  return (
    <Fragment>
      {bg && (
        <div className="drawing-container" id="draw-container">
          <div className="draw-side-options">
            <div>
              <button type="submit" onClick={() => generateImage()}>
                Save Image
              </button>
              {/* <button onClick={() => undo()}> Undo </button> */}
              <p>
                <strong>Colors</strong>
              </p>
              <div className="together">
                <span
                  className={color === "#F65F7C" ? "active" : undefined}
                  style={{ background: "#F65F7C" }}
                  onClick={(e) => setColor("#F65F7C")}
                ></span>
                <span
                  className={color === "#A358DF" ? "active" : undefined}
                  style={{ background: "#A358DF" }}
                  onClick={(e) => setColor("#A358DF")}
                ></span>
                <span
                  className={color === "#0085FF" ? "active" : undefined}
                  style={{ background: "#0085FF" }}
                  onClick={(e) => setColor("#0085FF")}
                ></span>
                <span
                  className={color === "#000" ? "active" : undefined}
                  style={{ background: "#000" }}
                  onClick={(e) => setColor("#000")}
                ></span>
                <span
                  className={color === "#FFF" ? "active" : undefined}
                  style={{ background: "#FFF" }}
                  onClick={(e) => setColor("#FFF")}
                ></span>
              </div>

              <p>
                <strong>Tools</strong>
              </p>

              <div className="together">
                <span
                  className={draw ? "active" : undefined}
                  style={{ background: color }}
                  onClick={(e) => setDraw(true)}
                >
                  ✎
                </span>
                <span
                  className={!draw ? "active" : undefined}
                  style={{ background: color }}
                  onClick={(e) => {
                    setDraw(false);
                    if (range < 15) setRange(15);
                  }}
                >
                  A
                </span>
              </div>
              <div className="slidecontainer">
                <input
                  type="range"
                  min="1"
                  max="100"
                  value={range}
                  className="slider"
                  id="myRange"
                  onChange={(e) => setRange(e.target.value)}
                />
              </div>
              {!draw && (
                <label className="enter-text">
                  <p>
                    <strong>Enter Text</strong>
                  </p>
                  <textarea
                    value={text}
                    onChange={(e) => setText(e.target.value)}
                  />
                </label>
              )}
              <button onClick={(e) => clearCanvas()}>clear</button>
              <button onClick={(e) => goBack(e)}>Cancel</button>
            </div>
          </div>
          {bg && (
            <div className="canvas-container">
              {/* <HiddenButtons setEditImage={null} edited={null} resetImage={null} fullscreen={fullscreen}/> */}

              <canvas
                id="canvasDiv"
                style={{ background: `url(${bg})` }}
                width={thisImg.naturalWidth}
                height={thisImg.naturalHeight}
                onMouseMove={(e) => move(e)}
                onTouchMove={(e) => touchMove(e)}
                onTouchStartCapture={(e) => down(e)}
                onMouseDown={(e) => down(e)}
                onTouchStart={(e) => touchDown(e)}
                onMouseUp={(e) => up(e)}
                onTouchEnd={(e) => up(e)}
                onMouseLeave={(e) => up(e)}
                ref={canvas}
              />
            </div>
          )}
        </div>
      )}
    </Fragment>
  );
}
