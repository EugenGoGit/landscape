import { convertToExcalidrawElements, Excalidraw, MIME_TYPES, serializeLibraryAsJSON, useHandleLibrary } from "@excalidraw/excalidraw";
import { ExcalidrawElement, ExcalidrawLinearElement, ExcalidrawTextElement, NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { HW, landscapeObject, newLandscapeObjectAbstract, XY } from "../landscapeToolUtils";

import { v4 as uuidv4 } from 'uuid';
import { landscapeDomain } from "./landscapeDomain";

export type landscapeMethod = {
  name: string,
  domainName: string | null | undefined
} & landscapeObject

export const newLandscapeMethod = (
  name?: string,
  domainName?: string
): landscapeMethod => {
    const parent = newLandscapeObjectAbstract("method")
  return {
    domainName: domainName,
    name: name ? name : "Method " + parent.id,
    ...parent
  }
}

export type landscapeMethodSceneProps = {
  xy?: XY,
  hw?: HW
}

export const landscapeMethodSceneElements = (
  object: landscapeMethod,
  props: landscapeMethodSceneProps,
  boundElements: Readonly<{
    id: ExcalidrawLinearElement["id"];
    type: "arrow" | "text";
  }>[] | null | undefined
): NonDeletedExcalidrawElement[] => {


  const xy = {
    x: props.xy?props.xy.x:10,
    y: props.xy?props.xy.y:10
  }

  const hw = {
    height: props.hw?props.hw.height:100,
    width: props.hw?props.hw.width:200
  }

  const groupElementId = uuidv4();
  const customData = {
    "type": "method",
    "name": object.name,
    "groupId": groupElementId
  }
  return convertToExcalidrawElements([
    {
      "type": "text",
      "x": xy.x + 120,
      "y": xy.y + 35,
      "width": hw.width,
      "height": hw.height,
      "angle": 0,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 1,
      "opacity": 100,
      "groupIds": [
        groupElementId
      ],
      "frameId": object.domainName,
      "roundness": null,
      "isDeleted": false,
      "boundElements": null,
      "updated": 1738244151799,
      "link": null,
      "locked": false,
      "text": object.name,
      "fontSize": 20,
      "fontFamily": 3,
      "textAlign": "center",
      "verticalAlign": "middle",
      "baseline": 19,
      "originalText": object.name,
      "lineHeight": 1.2 as ExcalidrawTextElement["lineHeight"]
    },
    {
      "type": "rectangle",
      id: object.id,
      "customData": customData,
      "x": xy.x,
      "y": xy.y,
      "width": hw.width,
      "height": hw.height,
      "angle": 0,
      "strokeColor": "#1e1e1e",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 1,
      "strokeStyle": "solid",
      "roughness": 0,
      "opacity": 100,
      "groupIds": [
        groupElementId
      ],
      "boundElements": boundElements,
      "frameId": object.domainName,
      "roundness": null,
      "link": null,
      "locked": false
    }
  ], { regenerateIds: false })
}
