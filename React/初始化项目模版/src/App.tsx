import React, { Suspense } from "react";
import { useRoutes } from "react-router-dom";

import routers from "@/router/index.router";

function App() {
  return (
    <div className="App">
      <Suspense fallback="">
        <div className="main">{useRoutes(routers)}</div>
      </Suspense>
    </div>
  );
}

export default App;
