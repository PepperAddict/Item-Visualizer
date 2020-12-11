import React, { Fragment, useEffect } from "react";

export default function FileSent({ status, setStatus }) {


  useEffect(() => {
    setTimeout(function(){ 
      setStatus(null)
     }, 10000);
  })
    
  return (
    <Fragment>
      {status && (
        <div onClick={() => setStatus(null)} className={status.code === 'green' ? "status success" : (status.code === 'yellow') ? "status sending" : (status.code === 'red') && "status error"}>
          {status.code === 'green' ? status.message : status.code === 'yellow' ? 
                  <div className="status sending">
                  {status.message}
                  <span className="lds-ellipsis">
                    <div></div>
                    <div></div>
                    <div></div>
                    <div></div>
                  </span>
                </div>
                : (status.code === 'red') && status.message  }<span className="x">×</span>
        </div>
      ) }
    </Fragment>
  );
}
