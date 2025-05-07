import { convertToExcalidrawElements, Excalidraw, MIME_TYPES, serializeLibraryAsJSON, useHandleLibrary } from "@excalidraw/excalidraw";
import { LandscapeDevelopDrawer } from "./LandscapeDevelopDrawer";
import { AppState, BinaryFiles, Collaborator, ExcalidrawImperativeAPI, Gesture, PointerDownState } from "@excalidraw/excalidraw/types/types";
import React, { useEffect, useState, useRef, useCallback } from "react";
import { IconButton, Menu, MenuItem, Snackbar, SnackbarCloseReason, SpeedDial, SpeedDialAction, SpeedDialIcon, TextField, Tooltip } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import { landscapeToolCursor, LandscapeToolDialog, landscapeObjectSceneElements, newLandscapeObject, landscapeToolType, XY, HW } from "./landscapeToolUtils";
import LandscapeIcon from '@mui/icons-material/Landscape';
import { closeSnackbar } from 'notistack'
import { setCursor } from "@excalidraw/excalidraw/types/cursor";
import type * as TExcalidraw from "@excalidraw/excalidraw";


import { SnackbarProvider, VariantType, enqueueSnackbar, BaseVariant, useSnackbar } from 'notistack';

import CloseIcon from '@mui/icons-material/Close';
import { ExcalidrawElement, ExcalidrawLinearElement, ExcalidrawTextElement, NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { LandscapeStorageDrawer } from "./LandscapeStorageDrawer";

const developDrawerOpenInitValue = localStorage.getItem('developDrawerOpen') ?
  localStorage.getItem('developDrawerOpen') :
  "false";

const storageDrawerOpenInitValue = localStorage.getItem('storageDrawerOpen') ?
  localStorage.getItem('storageDrawerOpen') :
  "false";

export interface AppProps {
  children: React.ReactNode;
  excalidrawLib: typeof TExcalidraw;
}

export function ExcalidrawLandscapeApp({
  children,
  excalidrawLib
}: AppProps) {
  const [excalidrawAPI, setExcalidrawAPI] = useState<ExcalidrawImperativeAPI>();
  const [developDrawerOpen, developDrawerOpenSet] = useState(developDrawerOpenInitValue == "true");
  const [storageDrawerOpen, storageDrawerOpenSet] = useState(storageDrawerOpenInitValue == "true");
  const [selectedElement, selectedElementSet] = useState<NonDeletedExcalidrawElement | null>();

  const [landscapeToolDialogOpen, landscapeToolDialogOpenSet] = useState<
    {
      open: boolean,
      landscapeToolType: landscapeToolType,
      addOrReplace: boolean,
      pointerDownPos?: XY,
      fields?: string
    }>
    ({ open: false, landscapeToolType: "comment", addOrReplace: true });




  const addLandscapeToolToScene = (
    landscapeToolType: landscapeToolType,
    fields?: string,
    pointerDownPos?: XY
  ) => {
    const elements = excalidrawAPI?.getSceneElements();
    const appState = excalidrawAPI?.getAppState();
    const sceneData = {
      elements: elements?.concat(
        landscapeObjectSceneElements(
          newLandscapeObject(
            landscapeToolType,
            fields
          ),
          pointerDownPos
        )
      ),
      appState: appState
    };
    excalidrawAPI?.updateScene(sceneData);
    excalidrawAPI?.setActiveTool({
      type: "selection"
    });
  }


  const onChange = (elements: readonly ExcalidrawElement[], appState: AppState, files: BinaryFiles) => {
    localStorage.setItem(
      "LOCAL_STORAGE_INITIAL",
      JSON.stringify({
        elements: elements,
        appState: appState,
        files: files
      })
    );
  };

  const onPointerDown = (
    activeTool: AppState["activeTool"],
    pointerDownState: PointerDownState
  ) => {
    selectedElementSet(pointerDownState.hit.element);
    if (activeTool.type === "custom")
      landscapeToolDialogOpenSet({
        open: true,
        landscapeToolType: activeTool.customType as landscapeToolType,
        pointerDownPos: pointerDownState.origin,
        addOrReplace: true
      });
  };

  const onPointerUpdate = (payload: {
    pointer: { x: number; y: number };
    button: "down" | "up";
    pointersMap: Gesture["pointers"];
  }) => {
    console.log(payload.button);
  }

  const handleStorageDrawerOpen = () => {
    localStorage.setItem('storageDrawerOpen', "true");
    storageDrawerOpenSet(true);
  };

  const handleStorageDrawerClose = () => {
    localStorage.setItem('storageDrawerOpen', "false");
    storageDrawerOpenSet(false);
  };

  const handleDevelopDrawerOpen = () => {
    localStorage.setItem('developDrawerOpen', "true");
    developDrawerOpenSet(true);
  };

  const handleDevelopDrawerClose = () => {
    localStorage.setItem('developDrawerOpen', "false");
    developDrawerOpenSet(false);
  };


  const addLandscapeToolBegin = (landscapeToolType: string) => {
    excalidrawAPI?.setActiveTool({
      type: "custom",
      customType: landscapeToolType
    });
    // excalidrawAPI?.setCursor(`url(${landscapeToolCursor["comment"]}), auto`);
    excalidrawAPI?.setCursor("crosshair");
  }

  const getOriginText = (element: NonDeletedExcalidrawElement | undefined): string | undefined => {
    switch (element?.type) {
      case "arrow": return (excalidrawAPI?.getSceneElements()?.
        filter(el => element?.boundElements?.find(boundEl => boundEl.type == "text" && boundEl.id == el.id) && el.type == "text")[0] as ExcalidrawTextElement)?.text;
      case "text": return element.text;
      case "rectangle": return (excalidrawAPI?.getSceneElements()?.
        filter(el => element?.boundElements?.find(boundEl => boundEl.type == "text" && boundEl.id == el.id) && el.type == "text")[0] as ExcalidrawTextElement)?.text;
    }
  }

  const replaceToLandscapeToolBegin = (landscapeToolType: string, originEl: NonDeletedExcalidrawElement) => {
    landscapeToolDialogOpenSet({
      open: true,
      landscapeToolType: landscapeToolType as landscapeToolType,
      addOrReplace: false,
      fields: getOriginText(originEl)
    });
  }

  const replaceToLandscapeTool = (
    landscapeToolType: landscapeToolType,
    fields?: string
  ) => {
    const elements = excalidrawAPI?.getSceneElements();
    const appState = excalidrawAPI?.getAppState();
    // Заменяем первый элемент из выбранных
    const originEl = elements?.
      filter(el => appState?.selectedElementIds[el.id])[0]


    if (originEl) {
      // Стрелки, привязанные к заменяемому элементу
      const arrowsToEl = elements?.
        filter(el => originEl?.boundElements?.find(boundEl => boundEl.type == "arrow" && boundEl.id == el.id))
      // Элементы, имеющие привязку к заменяемому элементу
      const elementsBoundToElements = elements?.
        filter(el => el.boundElements?.find(boundEl => boundEl.id == originEl.id))
      // Заменяющий элемент
      const landscapeToolElement =
        newLandscapeObject(landscapeToolType,
          fields
        );
      // Изменяем привязки в стрелках на заменяющий элемент
      const arrowElements = arrowsToEl
        .map(element => {
          const el = JSON.parse(JSON.stringify(element));
          if (el.startBinding.elementId == originEl.id)
            el.startBinding.elementId = landscapeToolElement.id;
          if (el.endBinding.elementId == originEl.id)
            el.endBinding.elementId = landscapeToolElement.id;
          return el
        }
        );
      // Изменяем привязки в привязанных элементах на заменяющий элемент
      const boundElements = elementsBoundToElements
        .map(element => {
          const boundElements = element.boundElements ?
            element.boundElements
              .map(boundEl => {
                if (boundEl.id == originEl.id)
                  return { type: boundEl.type, id: landscapeToolElement.id }
                else
                  return boundEl
              })
            : null
          const el = JSON.parse(JSON.stringify(element));
          el.boundElements = boundElements;
          return el
        }
        );
      const sceneData = {
        elements: elements?.
          // Убираем заменяемый элемент и привязанные к нему текстовые
          filter(el => el != originEl && !originEl?.boundElements?.find(boundEl => boundEl.type == "text" && boundEl.id == el.id))
          // Убираем стрелки заменяемого элемента
          .filter(el => !arrowsToEl.find(arrow => arrow == el))
          // Убираем привязанные к заменяемому элементу
          .filter(el => !elementsBoundToElements.find(bound => bound == el))
          // Добавляем кастомный элемент с привязанными стрелками от выделенного
          .concat(landscapeObjectSceneElements(
            landscapeToolElement,
            { x: originEl.x, y: originEl.y },
            { height: originEl.height, width: originEl.width },
            originEl.boundElements?.filter(el => el.type == "arrow"),
            originEl.type == "arrow" ? (originEl as ExcalidrawLinearElement).startBinding : undefined,
            originEl.type == "arrow" ? (originEl as ExcalidrawLinearElement).endBinding : undefined,
            originEl.type == "arrow" ? (originEl as ExcalidrawLinearElement).points : undefined
          )
          )
          // Добавляем стрелки с измененными привязками
          .concat(arrowElements)
          // Добавляем привязанные с измененными привязками
          .concat(boundElements),
        appState: appState
      };
      excalidrawAPI?.updateScene(sceneData);
      excalidrawAPI?.refresh();
      excalidrawAPI?.setActiveTool({
        type: "selection"
      });
    }
  }

  const handleLandscapeDialogClose = (
    okPressed: boolean,
    landscapeToolType: landscapeToolType,
    addOrReplace: boolean,
    pointerDownPos?: XY,
    fields?: string
  ) => {
    landscapeToolDialogOpenSet({
      open: false,
      landscapeToolType: landscapeToolType,
      addOrReplace: addOrReplace
    });
    if (okPressed)
      if (addOrReplace)
        addLandscapeToolToScene(landscapeToolType, fields, pointerDownPos)
      else
        replaceToLandscapeTool(landscapeToolType, fields)
  };

  const openAlertSnackbarDelegate = (var1: string, message: string) => {
    if (var1 == 'default' || var1 == 'error' || var1 == 'success' || var1 == 'warning' || var1 == 'info')
      // const variant1: VariantType = var1 ;
      enqueueSnackbar(message, { autoHideDuration: 20000, preventDuplicate: true, variant: var1 as VariantType });
    else enqueueSnackbar(message, { autoHideDuration: 20000, preventDuplicate: true, variant: "default" });
  }
  const initialDataStr = localStorage.getItem("LOCAL_STORAGE_INITIAL");
  const initialDataJSON = initialDataStr ? JSON.parse(initialDataStr) : undefined;

  let initialData;
  if (initialDataJSON) {
    if (JSON.stringify(initialDataJSON.appState.collaborators) == "{}") 
      initialDataJSON.appState.collaborators = new Map<string, Collaborator>();
    initialData = {
      elements: initialDataJSON.elements,
      appState: initialDataJSON.appState,
      files: initialDataJSON.files
    }
  } else {
    initialData = {
      elements: [],
      appState: {
        collaborators: new Map<string, Collaborator>()
      },
      files: []
    }
  }

  return (
    <SnackbarProvider
      anchorOrigin={{
        vertical: 'bottom',
        horizontal: 'right'
      }}
      maxSnack={10}
      action={(snackbarId) => (
        <IconButton
          size="small"
          aria-label="close"
          color="inherit"
          onClick={() => closeSnackbar(snackbarId)}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      )}>
      <div style={{ height: "97vh" }}>
        <Excalidraw
          excalidrawAPI={(api: ExcalidrawImperativeAPI) => setExcalidrawAPI(api)}
          onChange={onChange}
          initialData={initialData}
          onPointerDown={onPointerDown}
          onPointerUpdate={onPointerUpdate}
          renderTopRightUI={() => {
            return (
              <div className="top-right-ui" style={{ width: "100px" }}>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleDevelopDrawerOpen}
                  edge="start"
                  sx={[
                    {
                      mr: 2,
                      float: "right"
                    },
                    developDrawerOpen && { display: 'none' },
                  ]}
                >
                  <LandscapeIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                  color="inherit"
                  aria-label="open drawer"
                  onClick={handleStorageDrawerOpen}
                  edge="start"
                  sx={[
                    {
                      mr: 2,
                      float: "right"
                    },
                    storageDrawerOpen && { display: 'none' },
                  ]}
                >
                  <SaveIcon fontSize="inherit" />
                </IconButton>
              </div>
            );
          }}
        >
        </Excalidraw>
        {LandscapeDevelopDrawer(
          excalidrawAPI?.getSceneElements,
          excalidrawAPI?.getAppState,
          excalidrawAPI?.updateScene,
          developDrawerOpen,
          handleDevelopDrawerClose,
          addLandscapeToolBegin,
          replaceToLandscapeToolBegin,
          openAlertSnackbarDelegate,
          selectedElement)}
        {LandscapeStorageDrawer(
          excalidrawAPI?.getSceneElements,
          excalidrawAPI?.getAppState,
          excalidrawAPI?.getFiles,
          excalidrawAPI?.updateScene,
          excalidrawAPI?.scrollToContent,
          storageDrawerOpen,
          handleStorageDrawerClose,
          openAlertSnackbarDelegate
        )}
        <LandscapeToolDialog
          openProps={landscapeToolDialogOpen}
          onClose={handleLandscapeDialogClose}
        />
      </div>
    </SnackbarProvider>

  );
};

