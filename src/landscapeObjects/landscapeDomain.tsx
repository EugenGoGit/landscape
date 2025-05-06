import { convertToExcalidrawElements, Excalidraw, MIME_TYPES, serializeLibraryAsJSON, useHandleLibrary } from "@excalidraw/excalidraw";
import { ExcalidrawElement, ExcalidrawLinearElement, ExcalidrawTextElement, NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { HW, landscapeObject, newLandscapeObjectAbstract, XY } from "../landscapeToolUtils";

export type landscapeDomain = {
  name: string
} & landscapeObject

export const newLandscapeDomain = (name?: string): landscapeDomain => {
  const parent = newLandscapeObjectAbstract("domain");
  return {
    name: name ? name : "Domain " + parent.id,
    ...parent
  }
}

export type landscapeDomainSceneProps = {
  xy?: XY,
  hw?: HW
}

export const landscapeDomainSceneElements = (
  object: landscapeDomain,
  props: landscapeDomainSceneProps,
  boundElements: Readonly<{
    id: ExcalidrawLinearElement["id"];
    type: "arrow" | "text";
  }>[] | null | undefined
): NonDeletedExcalidrawElement[] => {
  const customData = {
    "type": "domain",
    "name": object.name
  };
  const element = convertToExcalidrawElements([
    {
      "id": object.name,
      "type": "frame",
      "x": props.xy ? props.xy.x : 10,
      "y": props.xy ? props.xy.y : 10,
      "width": props.hw ? props.hw.width : 500,
      "height": props.hw ? props.hw.height : 200,
      "angle": 0,
      "strokeColor": "#bbb",
      "backgroundColor": "transparent",
      "fillStyle": "solid",
      "strokeWidth": 2,
      "strokeStyle": "solid",
      "roughness": 0,
      "opacity": 100,
      "groupIds": [],
      "frameId": null,
      "children": [],
      "roundness": null,
      "isDeleted": false,
      "boundElements": boundElements,
      "link": null,
      "locked": false,
      "name": object.name,
      customData: customData
    }
  ], { regenerateIds: false })[0]
  const el = JSON.parse(JSON.stringify(element));
  el.x = props.xy ? props.xy.x : 10;
  el.y = props.xy ? props.xy.y : 10;
  return [el]
}
