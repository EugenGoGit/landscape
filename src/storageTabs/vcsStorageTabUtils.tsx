import { Dispatch, SetStateAction, useEffect, useState } from "react";

import type {
  AppState,
  ExcalidrawImperativeAPI,
  BinaryFiles,
  ExcalidrawInitialDataState,
  UIAppState,
  SceneData,
  Collaborator,
} from "@excalidraw/excalidraw/types/types";
import { AlertColor, Autocomplete, Avatar, Backdrop, CardActionArea, CardHeader, CardMedia, Chip, CircularProgress, Divider, Drawer, Fab, IconButton, ListItemIcon, Menu, MenuItem, SpeedDial, SpeedDialAction, SpeedDialIcon, styled, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import { ExcalidrawElement, ExcalidrawLinearElement, NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import TimelineIcon from '@mui/icons-material/Timeline';
import LandscapeIcon from '@mui/icons-material/Landscape';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import { exportToSvg, loadFromBlob } from "@excalidraw/excalidraw";
import { btoaUTF8, DiagramEntry } from "./storageTabUtils";
import LinkIcon from '@mui/icons-material/Link';
import MoreVertIcon from '@mui/icons-material/MoreVert';

export function parseDiagramFiles(treeJson: any[]) {
  console.log(treeJson)
  return treeJson
    .filter(entry => entry.type == "blob");
}

export type FileEntry = { path: string, sha: string }
export type upgrateDiagramParams = {
  getFilesUrl: (apiSourceURL: string, branch: string) => string,
  getContentUrl: (apiSourceURL: string, filePath: string, branch: string) => string,
  requestHeaders: (token: string) => HeadersInit,
  openAlertDelegate: (severity: AlertColor, message: string) => void,
  treeContent: boolean,
  sourceName: string,
  diagramElementsSet: Dispatch<SetStateAction<Array<DiagramEntry>>>,
  setProcessStateDelegate: Dispatch<SetStateAction<boolean>>
}

export type updateBranchListParams = {
  getBranchUrl: (apiSourceURL: string) => string,
  requestHeaders: (token: string) => HeadersInit,
  sourceName: string,
  openAlertDelegate: (severity: AlertColor, message: string) => void,
  jsonBranchesSet: Dispatch<SetStateAction<any[]>>
}

export type commitDiagramParams = {
  sceneElements: readonly NonDeletedExcalidrawElement[],
  appState: AppState | undefined,
  sceneFiles: BinaryFiles | null,
  openAlertDelegate: (severity: AlertColor, message: string) => void,
  needPathValueSet: Dispatch<SetStateAction<boolean>>,
  commitUrl: (apiSourceURL: string, filePath: string, branch: string) => string,
  sourceName: string,
  body: (branch: string, commitMessage: string, content: string, diagramElements: Array<DiagramEntry>, docPath: string) => any,
  requestHeaders: (token: string) => HeadersInit,
  diagramElementsSet: Dispatch<SetStateAction<Array<DiagramEntry>>>,
  method: (diagramElements: Array<DiagramEntry>, filePath: string) => string,
  setProcessStateDelegate: Dispatch<SetStateAction<boolean>>
}

export type deleteDiagramParams = {
  openAlertDelegate: (severity: AlertColor, message: string) => void,
  needPathValueSet: Dispatch<SetStateAction<boolean>>,
  deleteUrl: (apiSourceURL: string, filePath: string) => string,
  sourceName: string,
  body: (branch: string, commitMessage: string, sha?: string) => any,
  requestHeaders: (token: string) => HeadersInit,
  diagramElementsSet: Dispatch<SetStateAction<Array<DiagramEntry>>>,
  setProcessStateDelegate: Dispatch<SetStateAction<boolean>>
}

export const propertiesComponent = (docPath: string, docPathSet: Dispatch<SetStateAction<string>>, stateProtoJsonPath: string, stateProtoJsonPathSet: Dispatch<SetStateAction<string>>, stateProtoJsonHost: string, stateProtoJsonHostSet: Dispatch<SetStateAction<string>>, needValue: boolean | null, needValueSet: Dispatch<SetStateAction<boolean>> | null) => {
  const [tabToggle, setTabToggle] = useState("unclassified");

  const handleToggleChange = (
    event: React.MouseEvent<HTMLElement>,
    newAlignment: string,
  ) => {
    setTabToggle(newAlignment);
  };

  return <div style={{ width: '100%' }}>
    <Divider>Properties</Divider>
    <div style={{ width: '100%' }} >
      <TextField id="docPath"
        value={docPath}
        error={needValue ? needValue : false}
        helperText={needValue ? "Empty diagram path" : ""}
        sx={{ width: "100%" }}
        label="Diagram path"
        variant="outlined"
        size="small"
        onChange={(event) => {
          docPathSet(event.target.value);
          needValueSet && needValueSet(false);
        }}
      />
      <TextField
        value={stateProtoJsonPath}
        sx={{
          width: '100%'
        }}
        label={"Proto JSON Path"}
        variant="outlined" size="small"
        onChange={(event) => { stateProtoJsonPathSet(event.target.value); localStorage.setItem("ProtoJsonPath", event.target.value); }}
      />
      <TextField
        value={stateProtoJsonHost}
        sx={{
          width: '100%'
        }}
        label={"Proto JSON Host"}
        variant="outlined" size="small"
        onChange={(event) => { stateProtoJsonHostSet(event.target.value); localStorage.setItem("ProtoJsonHost", event.target.value); }}
      />
    </div>
    <div style={{ width: '100%' }} >
      <ToggleButtonGroup
        size="small"
        value={tabToggle}
        onChange={handleToggleChange}
        exclusive={true}
        aria-label="Small sizes"
        sx={{
          float: 'center'
        }}>
        <Tooltip title="STORY diagram type">
          <ToggleButton value="story" key="story">
            <TimelineIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="LANDSCAPE diagram type">
          <ToggleButton value="landscape" key="landscape">
            <LandscapeIcon fontSize="small" />
          </ToggleButton>
        </Tooltip>
        <Tooltip title="No diagram type">
          <ToggleButton value="unclassified" key="unclassified">
            <CheckBoxOutlineBlankIcon />
          </ToggleButton>
        </Tooltip>
      </ToggleButtonGroup>
    </div>
  </div>
}

export const storeSettingsDiv = (
  hiddenCondition: boolean,
  apiCaption: string,
  apiSourceURL: string,
  apiSourceURLSet: Dispatch<SetStateAction<string>>,
  apiURLTemplate: string,
  apiUrlLocalStorageKey: string,
  apiTokenLocalStorageKey: string,
  apiToken: string,
  apiTokenSet: Dispatch<SetStateAction<string>>,
  tokenHelper: string
) => {
  return <div style={{ width: '100%' }} hidden={hiddenCondition}>
    <Divider>{apiCaption + " Settings"}</Divider>
    <TextField
      value={apiSourceURL}
      sx={{
        width: '100%'
      }}
      label={apiCaption + " Project URL"}
      variant="outlined" size="small"
      helperText={apiURLTemplate}
      onChange={(event) => { apiSourceURLSet(event.target.value); localStorage.setItem(apiUrlLocalStorageKey, event.target.value); }}
    />
    <TextField
      sx={{
        width: '100%'
      }}
      error={!apiToken}
      helperText={!apiToken ? "Empty token" : ""}
      value={apiToken}
      label={apiCaption + " token" + tokenHelper}
      variant="outlined"
      type="password"
      size="small"
      onChange={(event) => { apiTokenSet(event.target.value); localStorage.setItem(apiTokenLocalStorageKey, event.target.value); }}
    />

  </div>
}

export const branchSelectComponent = (
  jsonBranches: any[],
  selectedBranchSet: Dispatch<SetStateAction<string | null>>,
  startingBranchLocalStorageKey: string,
  updateDiagramFilesParams: upgrateDiagramParams,
  selectedBranch: string | null,
  apiSourceUrl: string,
  token: string,
  openBackdropSet: Dispatch<SetStateAction<boolean>>
) => {
  return <Autocomplete
    disablePortal={true}
    options={jsonBranches.map(
      jsonBranch => {
        return { value: jsonBranch.name, label: jsonBranch.name }
      })}
    sx={{ width: "100%" }}
    renderInput={(params) => <TextField {...params}
      variant="outlined"
      size="small"
      error={jsonBranches.length == 0}
      label={jsonBranches.length != 0 ? "Select branch" : "Error"}
      helperText={jsonBranches.length == 0 ? "Empty branch list" : ""}
    />}
    forcePopupIcon={false}
    autoSelect={true}
    filterSelectedOptions={true}
    includeInputInList={true}
    onChange={(event, value) => {
      value && onSelectedBranchChange(
        value.value,
        selectedBranchSet,
        startingBranchLocalStorageKey,
        updateDiagramFiles,
        updateDiagramFilesParams,
        apiSourceUrl,
        token,
        openBackdropSet
      )
    }}
    value={jsonBranches.length != 0 ? { label: selectedBranch, value: selectedBranch } : null}
  />
}

function onSelectedBranchChange(
  newValue: string,
  selectedBranchSet: Dispatch<SetStateAction<string | null>>,
  startingBranchLocalStorageKey: string,
  updateDiagramFiles: (params: upgrateDiagramParams, apiSourceURL: string, branch: string, token: string, openBackdropSet: Dispatch<SetStateAction<boolean>>) => Promise<void>,
  params: upgrateDiagramParams,
  apiSourceUrl: string,
  token: string,
  openBackdropSet: Dispatch<SetStateAction<boolean>>
) {
  localStorage.setItem(startingBranchLocalStorageKey, newValue)
  selectedBranchSet(newValue);
  updateDiagramFiles(params, apiSourceUrl, newValue, token, openBackdropSet);
}


export const updateDiagramFiles = async (params: upgrateDiagramParams, apiSourceURL: string, branch: string, token: string) => {

  const getFilesFromApi = (): Promise<FileEntry[]> => {
    return fetch(params.getFilesUrl(apiSourceURL, branch), { headers: params.requestHeaders(token) })
      .then(response => {
        return response
          .json()
          .then(json => {
            if (response.ok) {
              return (params.treeContent ? json.tree as any[] : json as any[])
                .filter(entry => entry.type == "blob")
                .map(file => { return { path: file.path, sha: file.sha } })
            } else {
              params.openAlertDelegate("error", "Get " + params.sourceName + " files error " + response.status + " " + JSON.stringify(json));
              return new Array<FileEntry>();
            }
          })
          .catch(error => {
            console.log("updateDiagramFiles " + error);
            params.openAlertDelegate("error", "Get " + params.sourceName + " files error " + response.status + " " + error);
            return new Array<FileEntry>();
          })
      })
      .catch(error => {
        console.log("updateDiagramFiles " + error);
        params.openAlertDelegate("error", "Get " + params.sourceName + " files error " + error);
        return new Array<FileEntry>();
      });
  }
  const getDiagramFromApi = (file: FileEntry): Promise<DiagramEntry> => {
    return fetch(params.getContentUrl(apiSourceURL, file.path, branch), { headers: params.requestHeaders(token) })
      .then(response => {
        return response
          .blob()
          .then(blob => {
            if (response.ok) {
              console.log(file.path);
              console.log(blob.text);
              return loadFromBlob(new Blob([blob], { type: 'image/svg+xml' }), null, null)
                .then(restoreDataState => {
                  return exportToSvg({
                    elements: restoreDataState.elements,
                    appState: {
                      ...restoreDataState.appState,
                      exportEmbedScene: true
                    },
                    files: restoreDataState.files
                  })
                    .then(svg => {
                      console.log(file.path)
                      console.log(file)
                      return {
                        key: file.path,
                        value: restoreDataState,
                        SVGIcon: svg,
                        sha: file.sha
                      };
                    })
                })
                .catch(error => {
                  console.log("updateDiagramFiles " + error);
                  params.openAlertDelegate("warning", "Get " + params.sourceName + " file error " + response.status + " " + file.path + " " + error);
                  return {
                    key: file.path,
                    sha: file.sha
                  };
                })
            } else {
              params.openAlertDelegate("error", "Get " + params.sourceName + " file error " + response.status + " " + file.path);
              return {
                key: file.path,
                sha: file.sha
              };
            }
          })
          .catch(error => {
            console.log("updateDiagramFiles " + error);
            params.openAlertDelegate("error", "Get " + params.sourceName + " file error " + response.status + " " + file.path + " " + error);
            return {
              key: file.path,
              sha: JSON.stringify(file.sha)
            };
          })
      })
      .catch(error => {
        console.log("updateDiagramFiles " + error);
        params.openAlertDelegate("error", "Get " + params.sourceName + " file error " + " " + file.path + error);
        const res: DiagramEntry = {
          key: file.path,
          sha: JSON.stringify(file.sha)
        };
        return res;
      });
  }

  params.setProcessStateDelegate(true);
  const diagrams: DiagramEntry[] = [];
  for (const entry of (await getFilesFromApi())) {
    diagrams.push(await getDiagramFromApi(entry))
  }
  params.diagramElementsSet(diagrams);
  params.setProcessStateDelegate(false);
}

export const updateBranchList = async (params: updateBranchListParams, apiSourceURL: string, token: string) => {
  await fetch(params.getBranchUrl(apiSourceURL), { headers: params.requestHeaders(token) })
    .then(response => {
      if (response.ok) {
        response
          .json()
          .then(json => params.jsonBranchesSet(json))
          .catch(error => {
            console.log("updateBranchList " + error);
            params.openAlertDelegate("error", "Get " + params.sourceName + " branch error " + response.status + " " + error);
          })
      } else {
        response
          .text()
          .then(text => params.openAlertDelegate("error", "Get " + params.sourceName + " branch error " + response.status + " " + text))
          .catch(error => {
            console.log("updateBranchList " + error);
            params.openAlertDelegate("error", "Get " + params.sourceName + " branch error " + response.status + " " + error);
          })
      }
    })
    .catch(error => {
      console.log("updateBranchList " + error);
      params.openAlertDelegate("error", "Get " + params.sourceName + " branch error " + error);
    });
};

export const vcsDeleteDiagram = async (
  params: deleteDiagramParams,
  docPath: string,
  diagramElements: Array<DiagramEntry>,
  apiSourceURL: string,
  token: string,
  branch: string,
  commitMessage: string,
  sha?: string,
) => {
  console.log("deleteDiagram")
  const requestOptions = {
    method: 'DELETE',
    headers: params.requestHeaders(token),
    body: JSON.stringify(params.body(branch, commitMessage, sha)
    )
  };

  params.setProcessStateDelegate(true);
  await fetch(params.deleteUrl(apiSourceURL, docPath), requestOptions)
    .then(response => {
      if (response.ok) {
        response
          .text()
          .then(text => {
            params.openAlertDelegate("success", "Delete " + params.sourceName + " success " + response.status + text);
          })
          .catch(error => {
            params.openAlertDelegate("error", "Delete " + params.sourceName + " " + response.status + " " + error);
          })
        const newMap = diagramElements.filter(entry => entry.key != docPath);
        params.diagramElementsSet(newMap);
      } else {
        response
          .text()
          .then(text => params.openAlertDelegate("error", "Delete " + params.sourceName + " error " + response.status + " " + text))
          .catch(error => {
            console.log("Delete " + params.sourceName + " error " + error);
            params.openAlertDelegate("error", "Delete " + params.sourceName + " error " + response.status + " " + error);
          })
      }
    }
    )
    .catch(error => {
      console.log("Delete " + params.sourceName + " error " + error);
      params.openAlertDelegate("error", "Delete " + params.sourceName + " error " + error);
    });
  params.setProcessStateDelegate(false);
}

export const commitDiagram = async (
  params: commitDiagramParams,
  docPath: string,
  diagramElements: Array<DiagramEntry>,
  apiSourceURL: string,
  token: string,
  branch: string,
  commitMessage: string
) => {
  console.log("commitDiagram")

  if (!params.sceneElements) {
    return;
  }
  if (params.sceneElements.length == 0) {
    return;
  }
  if (docPath == "") {
    params.needPathValueSet(true);
    return;
  }


  const svg = await exportToSvg({
    elements: params.sceneElements,
    appState: {
      ...params.appState,
      exportEmbedScene: true
    },
    files: params.sceneFiles,
  });


  const requestOptions = {
    method: params.method(diagramElements, docPath),
    headers: params.requestHeaders(token),
    body: JSON.stringify(params.body(branch, commitMessage, btoaUTF8(svg.outerHTML), diagramElements, docPath)
    )
  };
  console.log(svg);
  params.setProcessStateDelegate(true);
  await fetch(params.commitUrl(apiSourceURL, docPath, branch), requestOptions)
    .then(response => {
      if (response.ok) {
        response
          .json()
          .then(json => {
            params.openAlertDelegate("success", "Commit " + params.sourceName + " success " + response.status + JSON.stringify(json));
            exportToSvg({ elements: params.sceneElements, appState: params.appState, files: {} })
              .then(svg => {
                const newMap = diagramElements.filter(entry => entry.key != docPath);
                newMap.unshift({
                  key: docPath,
                  value: params.appState ? {
                    elements: (params.sceneElements as ExcalidrawElement[]),
                    appState: params.appState,
                    files: {}
                  } : undefined,
                  SVGIcon: svg,
                  sha: json.content?.sha
                });
                params.diagramElementsSet(newMap);
              })
          })
          .catch(error => {
            console.log("Commit " + params.sourceName + " error " + error);
            params.openAlertDelegate("error", "Commit " + params.sourceName + " " + response.status + " " + error);
          })
      } else {
        response
          .text()
          .then(text => params.openAlertDelegate("error", "Commit " + params.sourceName + " error " + response.status + " " + text))
          .catch(error => {
            console.log("Commit " + params.sourceName + " error " + error);
            params.openAlertDelegate("error", "Commit " + params.sourceName + " error " + response.status + " " + error);
          })
      }
    }
    )
    .catch(error => {
      console.log("Commit " + params.sourceName + " error " + error);
      params.openAlertDelegate("error", "Commit " + params.sourceName + " error " + error);
    });
  params.setProcessStateDelegate(false);
};

export const diagramActionMenu = (
  diagrammMoreMenuAnchorEl: () => { key: string, el: null | HTMLElement },
  handleDiagramMoreMenuClose: () => void) => {

  const handleDiagramMoreMenuItemClick = () => {
    navigator.clipboard.writeText(
      "https://gitlab.infra.rtkit.dev/mvp/product-diagramm/diagramm-repository/-/blob/lartech/" + diagrammMoreMenuAnchorEl().key + "?ref_type=heads");
    handleDiagramMoreMenuClose();
  };


  return <Menu
    id="diagrammMoreMenu"
    MenuListProps={{
      'aria-labelledby': 'long-button',
    }}
    anchorEl={diagrammMoreMenuAnchorEl().el}
    open={Boolean(diagrammMoreMenuAnchorEl().el)}
    onClose={handleDiagramMoreMenuClose}
    slotProps={{
      paper: {
        style: {
          maxHeight: 48 * 4.5,
          width: '20ch',
        },
      },
    }}
  >
    <MenuItem onClick={handleDiagramMoreMenuItemClick}>
      <ListItemIcon>
        <LinkIcon fontSize="small" />
      </ListItemIcon>
      Save Link to clipboard
    </MenuItem>
  </Menu>


}
