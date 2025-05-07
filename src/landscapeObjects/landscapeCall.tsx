import { convertToExcalidrawElements, Excalidraw, MIME_TYPES, serializeLibraryAsJSON, useHandleLibrary } from "@excalidraw/excalidraw";
import { ExcalidrawElement, ExcalidrawLinearElement, ExcalidrawTextElement, NonDeletedExcalidrawElement, PointBinding } from "@excalidraw/excalidraw/types/element/types";
import { HW, landscapeObject, newLandscapeObjectAbstract, XY } from "../landscapeToolUtils";

import { v4 as uuidv4 } from 'uuid';
import { landscapeDomain } from "./landscapeDomain";
import { Point } from "@excalidraw/excalidraw/types/types";

export type landscapeCall = {
  text?: string,
  domainName: string | null | undefined
} & landscapeObject

export const newLandscapeCall = (
  text?: string,
  domainName?: string
): landscapeCall => {
  return {
    text: text,
    domainName: domainName,
    ...newLandscapeObjectAbstract("call")
  }
}

export type landscapeCallSceneProps = {
  xy?: XY,
  hw?: HW,
  startBinding?: PointBinding | null,
  endBinding?: PointBinding | null,
  points?: readonly Point[]
}

export const landscapeCallSceneElements = (
  object: landscapeCall,
  props: landscapeCallSceneProps,
): NonDeletedExcalidrawElement[] => {

  const xy = {
    x: props.xy ? props.xy.x : 10,
    y: props.xy ? props.xy.y : 10
  }

  const hw = {
    height: props.hw ? props.hw.height : 150,
    width: props.hw ? props.hw.width : 300
  }
  
  const textElementId = uuidv4();
  const customData = {
    "type": "call",
    "text": object.text
  }

  const label =
    convertToExcalidrawElements([
      {
        "id": textElementId,
        "type": "text",
        "x": xy.x + 10,
        "y": xy.y,
        "width": 150,
        "height": 25,
        "angle": 0,
        "strokeColor": "#1e1e1e",
        "backgroundColor": "transparent",
        "fillStyle": "solid",
        "strokeWidth": 2,
        "strokeStyle": "solid",
        "roughness": 1,
        "opacity": 100,
        "groupIds": [],
        "frameId": object.domainName,
        "roundness": null,
        "isDeleted": false,
        "boundElements": null,
        "link": null,
        "locked": false,
        "text": object.text ? object.text : "",
        "fontSize": 20,
        "fontFamily": 1,
        "textAlign": "center",
        "verticalAlign": "middle",
        "baseline": 18,
        "containerId": object.id,
        "originalText": object.text,
        "lineHeight": 1.15 as number & {
          _brand: "unitlessLineHeight";
        },
      }
    ], { regenerateIds: false })

  const arrow =
    convertToExcalidrawElements([
      {
        id: object.id,
        "type": "arrow",
        "x": xy.x,
        "y": xy.y,
        customData: customData,
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
        "groupIds": [],
        "frameId": object.domainName,
        "roundness": {
          "type": 2
        },
        "isDeleted": false,
        "boundElements": [
          {
            "type": "text",
            "id": textElementId
          }
        ],
        "link": null,
        "locked": false,
        "points": props.points,
        "lastCommittedPoint": null,
        "startBinding": props.startBinding,
        "endBinding": props.endBinding,
        "startArrowhead": null,
        "endArrowhead": "arrow"
      }
    ], { regenerateIds: false })
      .map(element => {
        const el = JSON.parse(JSON.stringify(element));
        el.startBinding = props.startBinding;
        el.endBinding = props.endBinding;
        return el
      }
      )

  return [label[0], arrow[0]]
}
