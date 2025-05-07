import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { ExcalidrawLandscapeApp} from "./ExcalidrawLandscapeApp";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    <ExcalidrawLandscapeApp />
  </StrictMode>
);
