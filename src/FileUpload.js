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

  useEffect(() => {
   console.log(window.clipboardData) 
  })

  const setLink = (e, nosupport = false, image = null) => {
    let data;
    const getExt = e.name.split(".").pop();
    const theFile = {
      file: e,
      name: "uploaded-file",
      ext: "." + getExt,
    };
    setFile(theFile);

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

    setCurrentMock(data);
    setSetup(true);
  };

  const fileupload = (e, file) => {
    e.preventDefault();
    const newfile = file.type;
    const imageFile = file;
    let size = file.size / 1024;
    let kb = parseFloat(size.toFixed(2));
    let numb = 500000;
    numb.toFixed(2);

    if (kb > numb) {
      setErr("Sorry, file exceeds 500 MB size limit");
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
  //get back to here when i figure out monday upload situation
  // const onChange = async ({
  //   target: {
  //     validity,
  //     files: [file],
  //   },
  // }) => {
  //   if (validity.valid) {
  //     var filename = file.name;

  //     // var blobit = new Blob([reader.result], {type: file.type})
  //     var formData = new FormData();

  //     formData.append("variables[file]", file, filename);

  //     const noVariableQuery = `mutation addFile($file: File!) {add_file_to_update (update_id: 766227121, file: $file) {id}}`;

  //     formData.append("query", noVariableQuery);
  //         monday
  //         .api(noVariableQuery)
  //         .then((res) => console.log(res))
  //         .catch((err) => console.log("nowork"));

  //     const proxyurl = "https://cors-anywhere.herokuapp.com/";
  //     await fetch('https://api.monday.com/v2/file', {
  //       method: "POST",
  //       body: formData,
  //       headers: {
  //         "Authorization": apikey
  //       }
  //     }).then((res) => res.json()).then((response) => console.log(response)).catch((err) => console.log(err))

  //     await fetch("https://api.monday.com/v2/", {
  //       method: "POST",
  //       body: formData,
  //       headers: {
  //         Authorization: apiKey
  //       },
  //     })
  //       .then((res) => res.json())
  //       .then((response) => console.log(response))
  //       .catch((err) => console.log(err));
  //   }
  // };

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
        Drag or
        <label>
          Choose
          <input
            type="file"
            id="myFile"
            name="filename"
            onChange={(e) => fileupload(e, e.target.files[0])}
          />
        </label>
        a file to upload
      </div>
      <p className="quick-alert">Size limit: 500 MB</p>
    </form>
  );
}
