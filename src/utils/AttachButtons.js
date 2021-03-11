import React, {useState} from 'react';

export default function AttachButtons(props) {
    return (
        <span className="upload-attach">
                <p className={(props.which === "url") ? "current top-bottom url" : "top-bottom url"}  onClick={() => props.setupload(false)}>
                    <span><img src="/icons/glink.svg" alt="link attachment"/></span>
                    <span>URL</span>
                </p>
                <p className={(props.which === "upload") ? "current top-bottom upload" : "top-bottom upload"} 
                    onClick={() => props.setupload(true)}>
                    <span className="upload-button"><img src="/icons/gfolder.svg" alt="upload"/></span>
                    <span>Browse</span>
                </p>
            </span>
    )
}