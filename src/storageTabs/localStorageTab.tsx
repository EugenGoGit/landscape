import { exportToSvg } from "@excalidraw/excalidraw";
import { Dispatch, SetStateAction, useEffect, useState } from "react";


import type {
  AppState,
  ExcalidrawImperativeAPI,
  SceneData,
} from "@excalidraw/excalidraw/types/types";
import { AlertColor, Autocomplete, Avatar, Chip, Divider, Drawer, IconButton, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import { ExcalidrawElement, ExcalidrawLinearElement, NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import SaveIcon from '@mui/icons-material/Save';
import { DiagramEntry, diagramList } from "./storageTabUtils";



export function localStorageTab(
  getSceneElements: (() => readonly NonDeletedExcalidrawElement[]) | undefined,
  getAppState: (() => AppState) | undefined,
  updateScene: (<K extends keyof AppState>(sceneData: {
    elements?: SceneData["elements"];
    appState?: Pick<AppState, K> | null | undefined;
    collaborators?: SceneData["collaborators"];
    commitToHistory?: SceneData["commitToHistory"];
  }) => void) | undefined,
  scrollToContent: (() => void) | undefined,
  docPath: string,
  docPathSet: Dispatch<SetStateAction<string>>,
  openAlertDelegate: (severity: AlertColor, message: string) => void
) {
  const [localDiagramElements, localDiagramElementsSet] = useState<Array<DiagramEntry>>(Array<DiagramEntry>());
  const [needPathValue, needPathValueSet] = useState(false);

  const updateDiagramFiles = async () => {
    const mapJson = localStorage.getItem("LOCAL_STORAGE_DIAGRAMS");
    if (mapJson && mapJson != "{}") {
      const newMap = Array<DiagramEntry>();

      for (var entry of JSON.parse(mapJson)) {
        newMap.push(
          {
            key: entry.key,
            value: entry.value,
            SVGIcon: await exportToSvg({ elements: entry.value.elements, appState: entry.value.appState, files: {} })
          }
        )
      }

      localDiagramElementsSet(newMap);
    } else localDiagramElementsSet(Array<DiagramEntry>());
  }

  useEffect(() => {
    updateDiagramFiles();
  }, []);


  const saveDiagramLocal = async () => {
    console.log("saveDiagramLocal")
    const elems = getSceneElements ? getSceneElements() : [];
    if (!elems) {
      return;
    }
    if (elems.length == 0) {
      return;
    }
    if (docPath == "") {
      needPathValueSet(true);
      return;
    }



    const newMap = localDiagramElements.filter(entry => entry.key != docPath);
    if (getAppState)
      newMap.unshift({
        key: docPath,
        value: {
          elements: (elems as ExcalidrawElement[]),
          appState: getAppState(),
          files: {}
        },
        SVGIcon: (await exportToSvg({ elements: elems, appState: getAppState ? getAppState() : undefined, files: {} }))
      });
    localStorage.setItem(
      "LOCAL_STORAGE_DIAGRAMS",
      JSON.stringify(newMap)
    );
    localDiagramElementsSet(newMap);
    console.log("newMap")
    console.log(newMap)
  };


  const deleteDiagramLocal = async (itemKey: string) => {
    const diagrams = localDiagramElements.filter(
      entry => entry.key != itemKey
    );
    localDiagramElementsSet(diagrams);
    localStorage.setItem(
      "LOCAL_STORAGE_DIAGRAMS",
      JSON.stringify(diagrams)
    );
  }


  return <div style={{ width: '100%' }}>
    <div style={{ width: '100%' }} >
      <IconButton
        onClick={() => saveDiagramLocal()}
        sx={{
          float: 'left'
        }}>
        <SaveIcon />
      </IconButton>
      <TextField
        value={docPath}
        error={needPathValue ? needPathValue : false}
        helperText={needPathValue ? "Empty diagram path" : ""}
        sx={{ float: 'left', width: '90%' }}
        label="Diagram path"
        variant="outlined"
        size="small"
        onChange={(event) => {
          docPathSet(event.target.value);
          needPathValueSet && needPathValueSet(false);
        }}
      />
    </div>
    <div style={{ width: '100%' }} >
      {diagramList(
        getSceneElements,
        getAppState,
        updateScene,
        scrollToContent,
        localDiagramElements,
        docPath,
        docPathSet,
        deleteDiagramLocal,
        null,
        openAlertDelegate
      )}
    </div>
  </div>

};




