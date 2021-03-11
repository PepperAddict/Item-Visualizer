import React from "react";

import Container from './main-page/Container';
import { BoardProvider } from "./utils/Context";

function App() {
  return (
    <BoardProvider>
      <Container />
    </BoardProvider>
  );
}

export default App;
