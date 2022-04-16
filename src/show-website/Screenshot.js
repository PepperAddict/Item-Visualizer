import React, { useState} from "react";
import Summary from "../update/Summary";
import "../styles/Summary.css";
import Loading from '../utils/Loading'
let controller
export default function ApiCall(props) {
  const [error, setError] = useState(false);
  const [currentMock, setCurrentMock] = useState({});
  const [url, setUrl] = useState(null);
  const [full, setFull] = useState("no");
  const [resolution, setResolution] = useState("desktop");
  const [loading, setLoading] = useState(false);
  const endpointRoute = 'https://iv-backend.herokuapp.com/'

  const quickThumbnail = async (e) => {

    e.preventDefault();
    let isUrl;
    try {
      isUrl = Boolean(new URL(url));
    } catch {
      setError('Please enter a valid URL. ex: https://www.example.com');
      isUrl = false;
    }

    const talkingImage = `${endpointRoute}api/1/puppeteer/?url=${url}&mode=${resolution}&full=${full}`;
    if (isUrl) {
      setLoading(true)
      controller = new AbortController();
      //abort fetch if it takes longer than 60 seconds.
      setTimeout(() => {controller.abort()}, 60000)

      fetch(talkingImage, {signal: controller.signal})
        .then((res) => res.blob())
        .then(async (image) => {
          var imageUrl = URL.createObjectURL(image);
          const iFrameData = {
            type: "Generated Screenshot",
            generatedImage: imageUrl,
            screenshotInfo: (full === "yes") ? `${resolution.charAt(0).toUpperCase() + resolution.slice(1)} (Full Page)`: resolution.charAt(0).toUpperCase() + resolution.slice(1) ,
            rawImage: image,
            thumbnail: null,
            realTitle: url.split('/')[2],
            url: url,
            iframe: null,
          };
          const myFile = new File([image], "thumbnail.jpg", { type: image.type });

          setError(false)
          props.setFile(myFile);
          setLoading(false)
          await setCurrentMock(iFrameData);
          props.context.setSetup(true);
        })
        .catch((ee) => {
          controller = new AbortController();
          setError('Something went wrong. Please try again')
          console.log(ee)
          setLoading(false)});
    }
  };

  return (
    <div className="choose-container">
      {props.context.setup && currentMock && !error ? (
        <Summary currentMock={currentMock} setFile={props.setFile} context={props.context} />
      ) : (
        <div className="input-container">
          <form onSubmit={quickThumbnail} className="form-submit">
          {error && (
            <p className="error-message" onClick={() => setError(false)}>
              {error}
            </p>
          )}
            <label htmlFor="url" className="input-link">
              <h2>Show the Website</h2>
              <h3>Generate a screenshot of a webpage</h3>
              <span className="input-button-together">
                <input
                  id="url"
                  name="url"
                  placeholder="Paste URL ex: https://www.example.com"
                  onChange={(e) => setUrl(e.target.value)}
                />
                {loading ?<Loading controller={controller} />
                :
                <button type="submit">Attach</button>}
              </span>
            </label>

            <div className="button-mode-real">
              <div className="viewport-section">
                <p>
                  <strong>Viewport</strong>
                </p>

                <label
                  htmlFor="desktop"
                  className={resolution === "desktop" ? "active" : undefined}
                >
                  <input
                    type="radio"
                    id="desktop"
                    name="resolution"
                    value="desktop"
                    onChange={(e) => setResolution(e.target.value)}
                    checked={resolution === "desktop" ? true : false}
                  />
                  Desktop
                </label>

                <label
                  htmlFor="tablet"
                  className={resolution === "tablet" ? "active" : undefined}
                >
                  <input
                    type="radio"
                    id="tablet"
                    name="resolution"
                    value="tablet"
                    onChange={(e) => setResolution(e.target.value)}
                    checked={resolution === "tablet" ? true : false}
                  />
                  Tablet
                </label>

                <label
                  htmlFor="mobile"
                  className={resolution === "mobile" ? "active" : undefined}
                >
                  <input
                    type="radio"
                    id="mobile"
                    name="resolution"
                    value="mobile"
                    onChange={(e) => setResolution(e.target.value)}
                    checked={resolution === "mobile" ? true : false}
                  />
                  Mobile
                </label>
              </div>

              <div className="page-section">
                <p>
                  <strong>Full Page</strong>
                </p>

                <label
                  htmlFor="no-fullpage"
                  className={full === "no" ? "active" : undefined}
                >
                  <input
                    type="radio"
                    id="no-fullpage"
                    name="fullpage"
                    value="no"
                    onChange={(e) => setFull(e.target.value)}
                    checked={full === "no" ? true : false}
                  />
                  No
                </label>

                <label
                  htmlFor="yes-fullpage"
                  className={full === "yes" ? "active" : undefined}
                >
                  <input
                    type="radio"
                    id="yes-fullpage"
                    name="fullpage"
                    value="yes"
                    onChange={(e) => setFull(e.target.value)}
                    checked={full === "yes" ? true : false}
                  />
                  Yes
                </label>
              </div>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
