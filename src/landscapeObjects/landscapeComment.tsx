import { convertToExcalidrawElements } from "@excalidraw/excalidraw";
import { HW, landscapeObject, newLandscapeObjectAbstract, XY } from "../landscapeToolUtils";

import { v4 as uuidv4 } from 'uuid';
import { NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

export type landscapeComment = landscapeObject &
{
  text?: string
}

export type landscapeCommentSceneProps = {
  xy?: XY,
  hw?: HW
}

export const newLandscapeComment = (text: string | undefined): landscapeComment => {
  return {
    ...newLandscapeObjectAbstract("comment"),
    text: text
  }
}

export const landscapeCommentSceneElements = (
  object: landscapeComment,
  props: landscapeCommentSceneProps
): NonDeletedExcalidrawElement[] => {
  const customData = {
    "type": "comment",
    "text": object.text
  };

  return convertToExcalidrawElements([
    {
      type: "rectangle",
      id: object.id,
      locked: true,
      opacity: 50,
      label: {
        text: object.text ? object.text : "",
        locked: true,
        opacity: 50
      },
      x: props.xy ? props.xy.x : 10,
      y: props.xy ? props.xy.y : 10,
      height: props.hw ? props.hw.height : 300,
      width: props.hw ? props.hw.width : 150,
      customData: customData
    }
  ], { regenerateIds: false })
}

