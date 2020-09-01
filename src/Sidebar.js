import Workspace from "./WorkSpace";
import React, {useState} from 'react';
import './styles/Sidebar.css'


export default function Sidebar({setWhichOne, monday, context, nav}) {
    const [hideSideBar, setHideSideBar] = useState(false);
    const [width] = useState(window.innerWidth)
    let timeout;
  
    const whenClick = (e, how = false) => {
      setWhichOne(e)
      context.setSetup(false);
      context.setFile(null);

      if (how) context.setPlay(0);
    }
    const triggerElement = (num) => {
      timeout = setTimeout(() => {context.setPlay(num)}, 2000)
    }

    return (
        <div className="sidebar" style={(hideSideBar) ? (width < 850) ? {height: "20px"} : {width: "40px" }: (width < 850) ? {height: "100%"}: {width: "300px"}}>
            <div className={(hideSideBar) ? 'hide-ele active' : 'hide-ele'} onClick={() => (hideSideBar) ? setHideSideBar(false) : setHideSideBar(true)}>❯</div>
          <div className="sidebar-content" style={(hideSideBar) ? (width < 850) ? {height: "20px"} : {width: "20px", height: "20px"}: (width < 850) ? {height: "100%"}: {width: "300px"}} >
            <Workspace monday={monday} file={context.file} setFile={context.setFile} context={context} />
          <nav>
            <strong>Methods</strong>
            <ul>
              <li onMouseEnter={e => triggerElement(1)} onMouseLeave={e => clearTimeout(timeout)} className={(nav === 'screenshot') ? 'button-active' : undefined} onClick={e => whenClick('screenshot')}>Show the Website</li>
              <li onMouseEnter={e => triggerElement(2)} onMouseLeave={e => clearTimeout(timeout)} className={(nav === 'mockup') ? 'button-active' : undefined} onClick={e => whenClick('mockup')}>Show the Idea</li>
              <li onMouseEnter={e => triggerElement(3)} onMouseLeave={e => clearTimeout(timeout)} className={(nav === 'self') ? 'button-active': undefined}onClick={e => whenClick('self')}>Show the Video</li>
            </ul>
          </nav>  

          <span className="how-button" onClick={e => whenClick('welcome', true)}>How To Use</span>
          </div>

        </div>

    )
}