import React, {createContext, useState, useRef} from 'react';
import mondaySDK from "monday-sdk-js";
const monday = mondaySDK();
export const BoardContext = createContext(null)

export function BoardProvider(props) {
    const [element, setElement] = useState(null);
    const setSumm = useRef(null);
    const [setup, setSetup] = useState(null)
    const [file, setFile] = useState(null);
    const [nav, setNav] = useState('welcome')
    const [play, setPlay] = useState(0);

  

    return (
    <BoardContext.Provider value={{
        monday,
        element,
        play, 
        setPlay: e => setPlay(e),
        setElement: e=>setElement(e),
        setSumm,
        file, 
        setFile: e => setFile(e),
        nav, 
        setNav: e => setNav(e),
        setup, 
        setSetup: e => setSetup(e)
    }}>{props.children}</BoardContext.Provider>
    )
}