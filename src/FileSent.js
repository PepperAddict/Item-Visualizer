import React, { Fragment } from "react";

export default function FileSent({ status, setStatus }) {
    
  return (
    <Fragment>
      {status && (
        <div onClick={() => setStatus(null)} className={status === 1 || status === 3 ?"status success" : "status sending"}>
          {status === 1 ? "Update Created" : status === 2 ? 
                  <div className="status sending">
                  File Sending
                  <span className="lds-ellipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </span>
                </div>
                 : (status === 3) && "File attached" }<span className="x">×</span>
        </div>
      ) }
    </Fragment>
  );
}
