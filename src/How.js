import React from "react";
export default function ({ context }) {
  const prev = (e) => {
    if (context.play !== 0) {
      context.setPlay(context.play - 1);
    } else {
      context.setPlay(3);
    }
  };
  const next = (e) => {
    if (context.play !== 3) {
      context.setPlay(context.play + 1);
    } else {
      context.setPlay(0);
    }
  };

  return (
    <div className="how-big-container">
      <div className="how-container">
        {context.play === 0 ? (
          <div className="one">
            <h3>Welcome</h3>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/9CP0eiwuVIc" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        ) : context.play === 1 ? (
          <div className="two">
            <h3>Show the website</h3>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/b_IXUVyQL4o" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        ) : context.play === 2 ? (
          <div className="three">
            <h3>Show the Idea</h3>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/q5DJc0kNPcs" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        ) : context.play === 3 ? (
          <div className="four">
            <h3>Show the Video</h3>
            <iframe width="560" height="315" src="https://www.youtube.com/embed/LalyTRtJuWo" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
          </div>
        ) : null}
        <div className="prev" onClick={(e) => prev()}>
          ❮
        </div>
        <div className="next" onClick={(e) => next()}>
          ❯
        </div>
      </div>
    </div>
  );
}
