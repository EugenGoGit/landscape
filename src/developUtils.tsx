import { Dispatch, SetStateAction, useEffect, useState } from "react";

import type {
  AppState,
  ExcalidrawImperativeAPI,
  SceneData,
} from "@excalidraw/excalidraw/types/types";

import { ExcalidrawElement, ExcalidrawFrameElement, ExcalidrawLinearElement, ExcalidrawTextElement, NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { landscapeObject, newLandscapeObject, XY } from "./landscapeToolUtils";
import { landscapeDomainSceneElements, newLandscapeDomain } from "./landscapeObjects/landscapeDomain";
import type { landscapeDomain } from "./landscapeObjects/landscapeDomain";
import { landscapeProtoService, landscapeProtoServiceSceneElements, newLandscapeProtoService } from "./landscapeObjects/landscapeProtoService";
import { landscapeService, landscapeServiceSceneElements, newLandscapeService } from "./landscapeObjects/landscapeService";
import { landscapeComment, landscapeCommentSceneElements, newLandscapeComment } from "./landscapeObjects/landscapeComment";
import { AlertColor } from "@mui/material";



export const isElementIdentical = (elementOne: ExcalidrawElement, elementTwo: ExcalidrawElement): boolean => {
  return elementOne.type == elementTwo.type
    && elementOne.x == elementTwo.x
    && elementOne.y == elementTwo.y
    && elementOne.width == elementTwo.width
    && elementOne.height == elementTwo.height
    && (
      (elementOne as ExcalidrawLinearElement).endBinding?.elementId == (elementTwo as ExcalidrawLinearElement).endBinding?.elementId
      && (elementOne as ExcalidrawLinearElement).startBinding?.elementId == (elementTwo as ExcalidrawLinearElement).startBinding?.elementId
      && (elementOne as ExcalidrawLinearElement).startBinding?.elementId == (elementTwo as ExcalidrawLinearElement).startBinding?.elementId
    );
}

export const getDifferenceWithScene = async (
  oldElements: ExcalidrawElement[],
  sceneElements: readonly NonDeletedExcalidrawElement[]
):
  Promise<{
    removedElements: ExcalidrawElement[],
    addedElements: ExcalidrawElement[],
    matchingElements: ExcalidrawElement[]
  }> => {
  const sceneDiagramElements = sceneElements.filter(el => el.customData?.type != "diff_note")
  const newDiagramElements = sceneDiagramElements ? sceneDiagramElements : [];
  if (!oldElements) return new Promise((resolve, reject) => {
    resolve({
      removedElements: [],
      addedElements: [],
      matchingElements: []
    })
  });
  else return new Promise((resolve, reject) => {
    resolve({
      removedElements: oldElements
        .filter(oldElement => !(newDiagramElements?.find(newElement => isElementIdentical(newElement, oldElement)))),
      addedElements: newDiagramElements
        .filter(newElement => !(oldElements?.find(oldElement => isElementIdentical(newElement, oldElement)))),
      matchingElements: newDiagramElements
        .filter(newElement => oldElements?.find(oldElement => isElementIdentical(newElement, oldElement)))
    })
  })
}

export const compareDiagramWithScene = async (
  oldElements: ExcalidrawElement[],
  sceneElements: readonly NonDeletedExcalidrawElement[],
  appState: AppState | undefined,
  updateScene: (<K extends keyof AppState>(sceneData: {
    elements?: SceneData["elements"];
    appState?: Pick<AppState, K> | null | undefined;
    collaborators?: SceneData["collaborators"];
    commitToHistory?: SceneData["commitToHistory"];
  }) => void) | undefined,
  openAlertDelegate: (severity: AlertColor, message: string) => void
) => {
  const difference = await getDifferenceWithScene(oldElements, sceneElements);

  if (difference.removedElements.length == 0 && difference.addedElements.length == 0)
    openAlertDelegate('info', "No difference")
  else {
    openAlertDelegate('info', "Added " + difference.addedElements.length + " elements." + "Removed " + difference.removedElements.length + " elements.")
    const sceneData = {
      elements: difference.matchingElements
        .concat(difference.removedElements.map(element => {
          const el = JSON.parse(JSON.stringify(element));
          el.strokeColor = "#fcc2d7";
          el.strokeWidth = 2;
          el.strokeStyle = "dotted";
          el.locked = true;
          el.customData = {
            type: "diff_note",
            action: "removed"
          }
          return el
        }
        ))
        .concat(difference.addedElements.map(element => {
          const el = JSON.parse(JSON.stringify(element));
          el.strokeColor = "#b2f2bb";
          el.strokeWidth = 2;
          return el
        }
        )),
      appState: appState,
    };

    updateScene && updateScene(sceneData)
  }
}

export const checkCompatibleWithScene = async (
  oldElements: ExcalidrawElement[],
  sceneElements: readonly NonDeletedExcalidrawElement[],
  appState: AppState | undefined,
  updateScene: (<K extends keyof AppState>(sceneData: {
    elements?: SceneData["elements"];
    appState?: Pick<AppState, K> | null | undefined;
    collaborators?: SceneData["collaborators"];
    commitToHistory?: SceneData["commitToHistory"];
  }) => void) | undefined,
) => {
  const difference = await getDifferenceWithScene(oldElements, sceneElements);

  const formalizedGroupIds = difference.removedElements?.filter(element => element.customData)
    .map(element => element.groupIds[0])

  const formalizedIds = difference.removedElements?.
    filter(element => element.groupIds.filter(groupId => formalizedGroupIds?.includes(groupId)).length > 0)
    .map(element => element.id)

  const sceneData = {
    elements: difference.matchingElements
      .concat(difference.addedElements)
      .concat(difference.removedElements
        .filter(element => formalizedIds?.includes(element.id))
        .map(element => {
          const el = JSON.parse(JSON.stringify(element));
          el.strokeColor = "#fcc2d7";
          el.strokeWidth = 2;
          el.strokeStyle = "dotted";
          el.locked = true;
          return el
        }
        )),
    appState: appState,
  };

  updateScene && updateScene(sceneData)
}

const getProtoObjects = async (protoJsonHost: string, protoJsonPath: string): Promise<{
  protoServices: {
    name: string,
    fullName: string,
    domain: string,
    description: string
  }[],
  protoDomains: Set<string>
}> => {
  const response = await fetch(protoJsonHost + protoJsonPath)
  const protosList: string[] = await response.json();
  const protoFileUrls = protosList.map((proto) => `${protoJsonHost}${proto}`);

  const protoServices: {
    name: string,
    fullName: string,
    domain: string,
    description: string
  }[] = [];
  const protoDomains = new Set<string>();
  for (const url of protoFileUrls) {
    const proto = await (await fetch(url)).json();
    (proto.files as Array<any>).forEach(file => (file.services as Array<any>).forEach(service => {
      protoServices.push({
        name: service.name,
        fullName: service.fullName,
        domain: (service.fullName as string).split('.')[0] + "." + (service.fullName as string).split('.')[1],
        description: service.description
      });
      protoDomains.add((service.fullName as string).split('.')[0] + "." + (service.fullName as string).split('.')[1])
    }
    ));
  }
  return {
    protoServices: protoServices,
    protoDomains: protoDomains
  };

}

export const formatScene = async (
  sceneElements: readonly NonDeletedExcalidrawElement[],
  appState: AppState | undefined,
  updateScene: (<K extends keyof AppState>(sceneData: {
    elements?: SceneData["elements"];
    appState?: Pick<AppState, K> | null | undefined;
    collaborators?: SceneData["collaborators"];
    commitToHistory?: SceneData["commitToHistory"];
  }) => void) | undefined,
  setProcessStateDelegate: Dispatch<SetStateAction<boolean>>,
  _protoJsonHost: string,
  _protoJsonPath: string
) => {
  setProcessStateDelegate(true);
  const sceneDiagramElements = sceneElements;
  const formalizedSceneElements = await sceneFormalizedElements(sceneDiagramElements, _protoJsonHost, _protoJsonPath);

  const sceneData = {
    elements: formalizedSceneElements.absentProtoServiceElements
      .concat(formalizedSceneElements.absentProtoDomainElements)
      .concat(formalizedSceneElements.formalizedSceneElements ? formalizedSceneElements.formalizedSceneElements : []),
    appState: appState,
  };

  updateScene && updateScene(sceneData)

  setProcessStateDelegate(false);
}

const getWarningElement = (element: NonDeletedExcalidrawElement): NonDeletedExcalidrawElement => {
  const el = JSON.parse(JSON.stringify(element));
  el.strokeColor = "#fcc2d7";
  el.strokeWidth = 2;
  el.strokeStyle = "dotted";
  el.locked = true;
  el.customData = undefined;
  return el
}

const landscapeToolScene = (elements: readonly NonDeletedExcalidrawElement[]): {
  sceneProtoServices: { object: landscapeProtoService, xy: XY }[],
  sceneServices: { object: landscapeService, xy: XY }[],
  sceneComments: { object: landscapeComment, xy: XY }[],
  sceneDomains: { object: landscapeDomain, xy: XY }[]
} => {
  return {
    sceneProtoServices: elements.filter(element =>
      element.customData?.type == "proto_service" &&
      element.customData?.caption &&
      element.customData?.groupId
    )
      .map(element => {
        return {
          object: newLandscapeProtoService(
            element.customData?.name,
            (elements?.filter(el => el.type == "frame" && el.id == element.frameId && el.customData?.type == "domain")[0] as ExcalidrawFrameElement)?.name
          ),
          xy: { x: element.x, y: element.y }
        }
      }
      ),
    sceneServices: elements?.filter(element =>
      element.customData?.type == "service" &&
      element.customData?.caption &&
      element.customData?.groupId
    )
      .map(element => {
        return {
          object: newLandscapeService(
            element.customData?.name,
            (elements?.filter(el => el.type == "frame" && el.id == element.frameId && el.customData?.type == "domain")[0] as ExcalidrawFrameElement)?.name
          ),
          xy: { x: element.x, y: element.y }
        }
      }
      ),
    sceneComments: elements?.filter(element =>
      element.customData?.type == "comment"
    )
      .map(element => {
        return {
          object: newLandscapeComment(
            element.customData?.name
          ),
          xy: { x: element.x, y: element.y }
        }
      }),
    sceneDomains: elements?.filter(element =>
      element.customData?.type == "domain"
    )
      .map(element => {
        return {
          object: newLandscapeDomain(
            element.customData?.name
          ),
          xy: { x: element.x, y: element.y }
        }
      })
  }
}

export const sceneFormalizedElements = async (
  sceneDiagramElements: readonly NonDeletedExcalidrawElement[] | undefined,
  _protoJsonHost: string,
  _protoJsonPath: string
) => {

  const sceneLandscapeTools = sceneDiagramElements ? landscapeToolScene(sceneDiagramElements) : null;

  var tempX: number = 0;
  var tempY: number = 0;
  var tempDomainX: number = 0;
  var tempDomainY: number = 0;

  const protoObjects = await getProtoObjects(_protoJsonHost, _protoJsonPath);
  const absentProtoDomains = Array.from(protoObjects.protoDomains)
    .filter(protoDomain => !sceneLandscapeTools?.sceneDomains.find(el => el.object.name == protoDomain))
    .map(domainName => newLandscapeDomain(domainName));


  return {
    absentProtoServiceElements: protoObjects.protoServices
      .filter(protoService => !sceneLandscapeTools?.sceneProtoServices?.find(el => el.object.name == protoService.name))
      .flatMap(service => {
        tempY = tempY + 100;
        const domainFromAbsent = absentProtoDomains.find(domain => (domain as landscapeDomain).name == service.domain);
        const domainName = !domainFromAbsent ? sceneLandscapeTools?.sceneDomains?.find(domain => domain.object.name == service.domain)?.object.name : domainFromAbsent.name;
        return landscapeProtoServiceSceneElements(
          newLandscapeProtoService(service.name, domainName),
          { xy: { x: tempX, y: tempY } }
        );
      }
      ),
    absentProtoDomainElements: absentProtoDomains.flatMap(domain => {
      tempDomainX = tempDomainX + 300;
      return landscapeDomainSceneElements(domain, { xy: { x: tempDomainX, y: tempDomainY }, hw: undefined }, null)
    })
    ,
    formalizedSceneElements: sceneLandscapeTools?.sceneProtoServices?.flatMap(el =>
      landscapeProtoServiceSceneElements(
        el.object,
        { xy: { x: el.xy.x, y: el.xy.y } }
      ))
      .concat(sceneLandscapeTools?.sceneServices?.flatMap(el =>
        landscapeServiceSceneElements(
          el.object,
          { xy: { x: el.xy.x, y: el.xy.y } }
        ))
      )
      .concat(sceneLandscapeTools?.sceneComments?.flatMap(el =>
        landscapeCommentSceneElements(
          el.object,
          { xy: { x: el.xy.x, y: el.xy.y }, hw: undefined },
        ))
      )
      .concat(sceneLandscapeTools?.sceneDomains?.flatMap(el =>
        landscapeDomainSceneElements(
          el.object,
          { xy: { x: el.xy.x, y: el.xy.y }, hw: undefined },
          null
        )))
  }
}

export const lintScene = async (
  sceneDiagramElements: readonly NonDeletedExcalidrawElement[],
  appState: AppState | undefined,
  updateScene: (<K extends keyof AppState>(sceneData: {
    elements?: SceneData["elements"];
    appState?: Pick<AppState, K> | null | undefined;
    collaborators?: SceneData["collaborators"];
    commitToHistory?: SceneData["commitToHistory"];
  }) => void) | undefined,
  setProcessStateDelegate: Dispatch<SetStateAction<boolean>>,
  _protoJsonHost: string,
  _protoJsonPath: string,
  openAlertDelegate: (severity: 'success' | 'info' | 'warning' | 'error', message: string) => void,
) => {
  setProcessStateDelegate(true);
  const formalizedSceneElements = await sceneFormalizedElements(sceneDiagramElements, _protoJsonHost, _protoJsonPath);

  const notFormalizedSceneElements = sceneDiagramElements?.filter(n => !formalizedSceneElements.formalizedSceneElements?.includes(n));

  const sceneData = {
    elements: notFormalizedSceneElements?.map(element => {
      openAlertDelegate('warning', element.type + ' not formalized');
      return getWarningElement(element)
    })
      .concat(formalizedSceneElements.absentProtoServiceElements.map(element => {
        openAlertDelegate('warning', 'proto absent ' + element.customData?.caption);
        return getWarningElement(element)
      }))
      .concat(formalizedSceneElements.absentProtoDomainElements.map(element => {
        openAlertDelegate('warning', 'proto domain absent ' + element.customData?.caption);
        return getWarningElement(element)
      }))
      .concat(formalizedSceneElements.formalizedSceneElements ? formalizedSceneElements.formalizedSceneElements : []),
    appState: appState,
  };

  updateScene && updateScene(sceneData)

  setProcessStateDelegate(false);
}


