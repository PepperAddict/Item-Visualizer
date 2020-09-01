import React from "react";

import Container from './Container';
import { BoardProvider } from "./Context";

function App() {
  return (
    <BoardProvider>
      <Container />
    </BoardProvider>
  );
}

export default App;
