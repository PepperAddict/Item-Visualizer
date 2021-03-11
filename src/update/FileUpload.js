import React, { useState, useEffect } from "react";

// const reader = new FileReader();

export default function FileUpload({
  // monday,
  setCurrentMock,
  setSetup,
  setFile,
  setErr,
}) {
  const [hover, setHover] = useState(null);

  const setLink = (e, nosupport = false, image = null) => {
    let data;


    if (!nosupport) {
      if (image) {
        var objectURL = URL.createObjectURL(e);
        data = {
          type: "Uploaded Image",
          generatedImage: objectURL,
          rawImage: e,
          realTitle: e.name,
          thumbnail: null,
          url: null,
          iframe: null,
        };
      } else {
        data = {
          type: "Uploaded File",
          generatedImage: null,
          iframe: URL.createObjectURL(e),
          thumbnail: false,
          realTitle: e.name,
          url: null,
        };
      }
    } else {
      data = {
        type: "Uploaded File",
        rawImage: null,
        thumbnail: null,
        realTitle: e.name,
        url: null,
        generatedImage: null,
      };
    }
    setFile(e)

    setCurrentMock(data);
    setSetup(true);
  };

  const fileupload = (e, file) => {
    e.preventDefault();
    const newfile = file.type;
    const imageFile = file;
    let size = file.size / 1024;
    let kb = parseFloat(size.toFixed(2));
    let numb = 20000;
    numb.toFixed(2);

    if (kb > numb) {
      setErr("Sorry, file exceeds 20 MB size limit");
    } else {
      switch (newfile) {
        case "image/png":
        case "image/jpeg":
          setLink(imageFile, false, true);
          break;
        case "image/svg+xml":
        case "application/octet-stream":
        case "text/html":
        case "video/mp4":
        case "application/pdf":
          setLink(imageFile);
          break;
        case "load":
          setLink(imageFile, false, true);
          break;
        default:
          setLink(imageFile, true);
      }
    }
  };


  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setHover(true);
  };
  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setHover(false);
  };
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setHover(true);
  };
  const handleDrop = (ev) => {
    ev.preventDefault();
    ev.stopPropagation();

    if (ev.dataTransfer.items) {
      // Use DataTransferItemList interface to access the file(s)
      for (var i = 0; i < ev.dataTransfer.items.length; i++) {
        // If dropped items aren't files, reject them
        if (ev.dataTransfer.items[i].kind === "file") {
          var file = ev.dataTransfer.items[i].getAsFile();
          fileupload(ev, file);
        }
      }
    }
  };

  const handlePaste = (e) => {
    const items = (e.clipboardData || window.clipboardData).items;
    for (let item of items) {
      if (item.kind === "file") {
        var blob = item.getAsFile();
        var reader = new FileReader();
        reader.onload = (event) => {
          fileupload(e, blob);
        };
        reader.readAsDataURL(blob);
      }
    }
  };

  return (
    <form>
      <h3>Upload a brainstorm/sketch/wireframe/mockup/prototype/etc.</h3>

      <div
        className={hover ? "drag-drop-zone active" : "drag-drop-zone"}
        onDrop={(e) => handleDrop(e)}
        onDragOver={(e) => handleDragOver(e)}
        onDragEnter={(e) => handleDragEnter(e)}
        onDragLeave={(e) => handleDragLeave(e)}
        onPaste={(e) => handlePaste(e)}
        onCopy={(e) => handlePaste(e)}
      >
        Drag, paste, or
        <label>
          choose
          <input
            type="file"
            id="myFile"
            name="filename"
            onChange={(e) => fileupload(e, e.target.files[0])}
          />
        </label>
        a file to upload
      </div>
      <p className="small-alert">Size limit: 20 MB</p>
    </form>
  );
}
