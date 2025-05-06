import React, { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import "@excalidraw/excalidraw/index.css";

import type * as TExcalidraw from "@excalidraw/excalidraw";

import { ExcalidrawLandscapeApp } from "./ExcalidrawLandscapeApp";

declare global {
  interface Window {
    ExcalidrawLib: typeof TExcalidraw;
  }
}

const rootElement = document.getElementById("root")!;
const root = createRoot(rootElement);
const { Excalidraw } = window.ExcalidrawLib;

root.render(
  <StrictMode>
    <ExcalidrawLandscapeApp
    excalidrawLib={window.ExcalidrawLib}
    >
      <div />
    </ExcalidrawLandscapeApp>
  </StrictMode>,
);
