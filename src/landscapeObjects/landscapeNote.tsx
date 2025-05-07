import { convertToExcalidrawElements, Excalidraw, MIME_TYPES, serializeLibraryAsJSON, useHandleLibrary } from "@excalidraw/excalidraw";
import { ExcalidrawElement, ExcalidrawLinearElement, ExcalidrawTextElement, NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { HW, landscapeObject, newLandscapeObjectAbstract, XY } from "../landscapeToolUtils";

import { v4 as uuidv4 } from 'uuid';
import { landscapeDomain } from "./landscapeDomain";

export type landscapeNote = {
  text?: string,
  domainName: string | null | undefined
} & landscapeObject

export const newLandscapeNote = (
  text?: string, 
  domainName?: string
): landscapeNote => {
  return {
    text: text,
    domainName: domainName,
    ...newLandscapeObjectAbstract("note")
  }
}

export type landscapeNoteSceneProps = {
  xy?: XY,
  hw?: HW
}

export const landscapeNoteSceneElements = (
  object: landscapeNote,
  props: landscapeNoteSceneProps,
  boundElements: Readonly<{
    id: ExcalidrawLinearElement["id"];
    type: "arrow" | "text";
  }>[] | null | undefined
): NonDeletedExcalidrawElement[] => {
  const groupElementId = uuidv4();
  const textElementId = uuidv4();
  const textBoundElement: Readonly<{
    id: ExcalidrawLinearElement["id"];
    type: "arrow" | "text";
  }>[] = [{
    "type": "text",
    "id": textElementId
  }];
  const customData = {
    "type": "note",
    "text": object.text,
    "groupId": groupElementId
  }

  return convertToExcalidrawElements(
    [
      {
        "type": "rectangle",
        "id": object.id,
        "customData": customData,
        "x": props.xy ? props.xy.x : 10,
        "y": props.xy ? props.xy.y : 10,
        "fillStyle": "solid",
        "strokeWidth": 2,
        "strokeStyle": "dashed",
        "roughness": 0,
        "opacity": 60,
        "angle": 0,
        "strokeColor": "#1e1e1e",
        "backgroundColor": "transparent",
        "width": props.hw ? props.hw.width : 400,
        "height": props.hw ? props.hw.height : 300,
        "groupIds": [],
        "frameId": object.domainName,
        "roundness": null,
        "boundElements": boundElements ? textBoundElement.concat(boundElements) : textBoundElement,
        "link": null,
        "locked": false
      },
      {
        "type": "text",
        "id": textElementId,
        "fillStyle": "solid",
        "strokeWidth": 2,
        "strokeStyle": "dashed",
        "roughness": 0,
        "opacity": 60,
        "angle": 0,
        "x": props.xy ? props.xy.x + 10 : 20,
        "y": props.xy ? props.xy.y + 10 : 20,
        "strokeColor": "#1e1e1e",
        "backgroundColor": "transparent",
        "groupIds": [],
        "frameId": object.domainName,
        "roundness": null,
        "boundElements": [],
        "link": null,
        "locked": false,
        "fontSize": 20,
        "fontFamily": 2,
        "text": object.text ? object.text : "",
        "textAlign": "left",
        "verticalAlign": "top",
        "containerId": object.id,
        "originalText": object.text,
        "lineHeight": 1.15 as number & {
          _brand: "unitlessLineHeight";
        },
        "baseline": 501
      }
    ], { regenerateIds: false })
}
