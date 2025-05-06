import { convertToExcalidrawElements, Excalidraw, MIME_TYPES, serializeLibraryAsJSON, useHandleLibrary } from "@excalidraw/excalidraw";
import { ExcalidrawElement, ExcalidrawLinearElement, ExcalidrawTextElement, NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { HW, landscapeObject, newLandscapeObjectAbstract, XY } from "../landscapeToolUtils";

import { v4 as uuidv4 } from 'uuid';
import { landscapeDomain } from "./landscapeDomain";

export type landscapeProtoService = {
  name: string,
  domainName: string | null | undefined
} & landscapeObject

export const newLandscapeProtoService = (
  name?: string,
  domainName?: string | null
): landscapeProtoService => {
    const parent = newLandscapeObjectAbstract("proto_service")
  return {
    domainName: domainName,
    name: name ? name : "Proto " + parent.id,
    ...parent
  }
}

export type landscapeProtoServiceSceneProps = {
  xy?: XY,
  hw?: HW
}

export const landscapeProtoServiceSceneElements = (
  object: landscapeProtoService,
  props: landscapeProtoServiceSceneProps,
  boundElements?: Readonly<{
    id: ExcalidrawLinearElement["id"];
    type: "arrow" | "text";
  }>[]
): NonDeletedExcalidrawElement[] => {

  const xy = {
    x: props.xy?props.xy.x:10,
    y: props.xy?props.xy.y:10
  }

  const hw = {
    height: props.hw?props.hw.height:150,
    width: props.hw?props.hw.width:300
  }

  const groupElementId = uuidv4();
  const customData = {
    "type": "service",
    "name": object.name,
    "groupId": groupElementId
  }
  return protoIconElements(new Array<string>(groupElementId),xy, object.domainName)
    .concat(convertToExcalidrawElements([
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
    ], { regenerateIds: false }))
}

const protoIconElements = (
  groupIds: string[],
  XY: Readonly<{
    x: number;
    y: number;
  }>,
  frameId?: string | null | undefined
): ExcalidrawElement[] => {
  const groupElementId = uuidv4();
  return convertToExcalidrawElements([{
    "type": "line",
    "x": XY.x + 9,
    "y": XY.y + 6,
    "width": 8.392662423353515,
    "height": 7.1295536681477945,
    "angle": 0,
    "strokeColor": "#1e1e1e",
    "backgroundColor": "#db4437",
    "fillStyle": "solid",
    "strokeWidth": 1,
    "strokeStyle": "solid",
    "roughness": 0,
    "opacity": 100,
    "groupIds": groupIds.concat(groupElementId),
    "frameId": frameId,
    "roundness": null,
    "boundElements": null,
    "link": null,
    "locked": false,
    "points": [
      [
        0,
        0
      ],
      [
        5.9787196287137085,
        0
      ],
      [
        0.5613832156213272,
        7.1295536681477945
      ],
      [
        -2.413942794639805,
        3.143740225421502
      ],
      [
        0,
        0
      ]
    ],
    "lastCommittedPoint": [
      0,
      -0.8828291514037971
    ],
    "startBinding": null,
    "endBinding": null,
    "startArrowhead": null,
    "endArrowhead": null
  },
  {
    "type": "line",
    "x": XY.x + 19,
    "y": XY.y + 6,
    "width": 11.255711576340085,
    "height": 11.087297361179717,
    "angle": 0,
    "strokeColor": "#1e1e1e",
    "backgroundColor": "#0f9d58",
    "fillStyle": "solid",
    "strokeWidth": 1,
    "strokeStyle": "solid",
    "roughness": 0,
    "opacity": 100,
    "groupIds": groupIds.concat(groupElementId),
    "frameId": frameId,
    "roundness": null,
    "boundElements": null,
    "link": null,
    "locked": false,
    "points": [
      [
        0,
        0
      ],
      [
        8.336523994716236,
        11.087297361179717
      ],
      [
        11.255711576340085,
        7.045345489816145
      ],
      [
        6.006789378408086,
        0.028068678942906336
      ],
      [
        0,
        0
      ]
    ],
    "lastCommittedPoint": [
      -1.7656583028075374,
      -1.7656583028075659
    ],
    "startBinding": null,
    "endBinding": null,
    "startArrowhead": null,
    "endArrowhead": null
  },
  {
    "type": "line",
    "x": XY.x + 7,
    "y": XY.y + 9,
    "width": 11.311850004977368,
    "height": 10.946951824962253,
    "angle": 0,
    "strokeColor": "#1e1e1e",
    "backgroundColor": "#4285f4",
    "fillStyle": "solid",
    "strokeWidth": 1,
    "strokeStyle": "solid",
    "roughness": 0,
    "opacity": 100,
    "groupIds": groupIds.concat(groupElementId),
    "frameId": frameId,
    "roundness": null,
    "boundElements": null,
    "updated": 1738235258033,
    "link": null,
    "locked": false,
    "points": [
      [
        0,
        0
      ],
      [
        -2.8069107243492946,
        3.7612607989286384
      ],
      [
        2.526219651914362,
        10.946951824962253
      ],
      [
        8.504939280628072,
        10.778539751304816
      ],
      [
        0,
        0
      ]
    ],
    "lastCommittedPoint": [
      0,
      0
    ],
    "startBinding": null,
    "endBinding": null,
    "startArrowhead": null,
    "endArrowhead": null
  },
  {
    "type": "line",
    "x": XY.x + 19,
    "y": XY.y + 20,
    "width": 8.308455315773331,
    "height": 7.0734130980075856,
    "angle": 0,
    "strokeColor": "#1e1e1e",
    "backgroundColor": "#ffc107",
    "fillStyle": "solid",
    "strokeWidth": 1,
    "strokeStyle": "solid",
    "roughness": 0,
    "opacity": 100,
    "groupIds": groupIds.concat(groupElementId),
    "frameId": frameId,
    "roundness": null,
    "boundElements": null,
    "updated": 1738235258033,
    "link": null,
    "locked": false,
    "points": [
      [
        0,
        0
      ],
      [
        5.192784840046201,
        -7.045344419064679
      ],
      [
        8.308455315773331,
        -2.8911156904265445
      ],
      [
        5.922581200076428,
        0.028068678942906333
      ],
      [
        0,
        0
      ]
    ],
    "lastCommittedPoint": [
      -0.8828123128382686,
      0
    ],
    "startBinding": null,
    "endBinding": null,
    "startArrowhead": null,
    "endArrowhead": null
  },
  ]
  )
}