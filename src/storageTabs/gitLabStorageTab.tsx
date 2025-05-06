import { Dispatch, SetStateAction, useEffect, useState } from "react";
import type {
  AppState,
  ExcalidrawImperativeAPI,
  BinaryFiles,
  ExcalidrawInitialDataState,
  UIAppState,
  SceneData,
} from "@excalidraw/excalidraw/types/types";
import { NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import { AlertColor, Backdrop, IconButton, TextField, CircularProgress } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import { RestoredDataState } from "@excalidraw/excalidraw/types/data/restore";
import { DiagramEntry, diagramList } from "./storageTabUtils";
import { branchSelectComponent, commitDiagram, commitDiagramParams, diagramActionMenu, storeSettingsDiv, updateBranchList, updateDiagramFiles, vcsDeleteDiagram } from "./vcsStorageTabUtils";


const apiSourceURLVar = localStorage.getItem('gitlab_project_api_url') ? localStorage.getItem('gitlab_project_api_url') : process.env.REACT_APP_GITLAB_API_PRJ_URL;
const apiSourceURL = apiSourceURLVar ? apiSourceURLVar : ""

const tokenVar = localStorage.getItem('gitlab_token') ? localStorage.getItem('gitlab_token') : process.env.REACT_APP_GITLAB_TOKEN;
const token = tokenVar ? tokenVar : ""

const startingBranch = localStorage.getItem('starting_gitlab_branch') ? localStorage.getItem('starting_gitlab_branch') : "main";

export function gitLabStorageTab(
  getSceneElements: (() => readonly NonDeletedExcalidrawElement[]) | undefined,
  getAppState: (() => AppState) | undefined,
  getSceneFiles: (() => BinaryFiles) | undefined,
  updateScene: (<K extends keyof AppState>(sceneData: {
    elements?: SceneData["elements"];
    appState?: Pick<AppState, K> | null | undefined;
    collaborators?: SceneData["collaborators"];
    commitToHistory?: SceneData["commitToHistory"];
  }) => void) | undefined,
  scrollToContent: (() => void) | undefined,
  storeSettingsHide: boolean,
  docPath: string,
  docPathSet: Dispatch<SetStateAction<string>>,
  openAlertDelegate: (severity: AlertColor, message: string) => void
) {

  const [selectedBranch, selectedBranchSet] = useState(startingBranch);
  const [jsonBranches, jsonBranchesSet] = useState<any[]>([]);
  const [stateApiSourceURL, stateApiSourceURLSet] = useState(apiSourceURL);
  const [stateToken, stateTokenSet] = useState(token);
  const [commitMessage, commitMessageSet] = useState("");
  const [needPathValue, needPathValueSet] = useState(false);
  const [diagramElements, diagramElementsSet] = useState<Array<DiagramEntry>>(Array<{ key: string, value: RestoredDataState, SVGIcon?: SVGSVGElement }>());
  const [longOperationInProcess, longOperationInProcessSet] = useState(false);


  const updateDiagramFilesParams = {
    getFilesUrl: (apiSourceURL: string, branch: string) => apiSourceURL + "repository/tree?path=Diagrams&recursive=true&ref=" + branch,
    getContentUrl: (apiSourceURL: string, filePath: string, branch: string) => apiSourceURL + "repository/files/" + encodeURIComponent(filePath) + "/raw?ref=" + branch,
    requestHeaders: (token: string) => {
      return {
        "PRIVATE-TOKEN": token
      }
    },
    openAlertDelegate: openAlertDelegate,
    treeContent: false,
    sourceName: "GitLab",
    diagramElementsSet: diagramElementsSet,
    setProcessStateDelegate: longOperationInProcessSet
  }

  const updateBranchParams = {
    getBranchUrl: (apiSourceURL: string) => apiSourceURL + "repository/branches",
    requestHeaders: (token: string) => {
      return {
        "PRIVATE-TOKEN": token
      }
    },
    sourceName: "GitLab",
    openAlertDelegate: openAlertDelegate,
    jsonBranchesSet: jsonBranchesSet
  }

  const deleteDiagramParams = {
    openAlertDelegate: openAlertDelegate,
    needPathValueSet: needPathValueSet,
    deleteUrl: (apiSourceURL: string, filePath: string) => apiSourceURL + "repository/files/" + encodeURIComponent(filePath),
    sourceName: "GitLab",
    body: (branch: string, commitMessage: string, sha?: string) => {
      return {
        branch: branch,
        commit_message: commitMessage
      }
    },
    requestHeaders: (token: string) => {
      return {
        "PRIVATE-TOKEN": token, "Content-Type": "application/json"
      }
    },
    diagramElementsSet: diagramElementsSet,
    setProcessStateDelegate: longOperationInProcessSet
  }

  const deleteDiagram = async (itemKey: string, sha?: string) => {
    selectedBranch && vcsDeleteDiagram(
      deleteDiagramParams,
      itemKey,
      diagramElements,
      stateApiSourceURL,
      stateToken,
      selectedBranch,
      commitMessage,
      sha
    )
  }

  useEffect(() => {
    stateApiSourceURL &&
      stateToken &&
      updateBranchList(updateBranchParams, stateApiSourceURL, stateToken);

    stateApiSourceURL &&
      stateToken &&
      selectedBranch &&
      updateDiagramFiles(
        updateDiagramFilesParams,
        stateApiSourceURL,
        selectedBranch,
        stateToken
      );
  }, []);



  return (
    <div>
      {storeSettingsDiv(
        storeSettingsHide,
        "GitLab API",
        stateApiSourceURL,
        stateApiSourceURLSet,
        "https://gitlab.domain.io/api/v4/projects/12345/",
        "gitlab_project_api_url",
        "gitlab_token",
        stateToken,
        stateTokenSet,
        ""
      )}

      <div style={{ width: '100%' }}>
        <IconButton
          onClick={() => {
            if (selectedBranch) {
              const commitParams: commitDiagramParams = {
                sceneElements: getSceneElements?getSceneElements():[],
                appState: getAppState?getAppState():undefined,
                sceneFiles: getSceneFiles?getSceneFiles():null,
                openAlertDelegate: openAlertDelegate,
                needPathValueSet: needPathValueSet,
                commitUrl: (apiSourceURL: string, filePath: string) => apiSourceURL + "repository/files/" + encodeURIComponent(filePath),
                sourceName: "GitLab",
                body: (branch: string, commitMessage: string, content: string, diagramElements: Array<DiagramEntry>, docPath: string) => {
                  return {
                    branch: branch,
                    commit_message: commitMessage,
                    encoding: "base64",
                    content: content
                  }
                },
                requestHeaders: (token: string) => {
                  return {
                    "PRIVATE-TOKEN": token, "Content-Type": "application/json"
                  }
                },
                diagramElementsSet: diagramElementsSet,
                method: (diagramElements: Array<DiagramEntry>, filePath: string) => diagramElements.find(entry => entry.key == filePath) ? 'PUT' : 'POST',
                setProcessStateDelegate: longOperationInProcessSet
              }
              commitDiagram(commitParams, docPath, diagramElements, stateApiSourceURL, stateToken, selectedBranch, commitMessage)
            }
          }}
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
        <TextField
          value={commitMessage}
          sx={{ float: 'left', width: '100%' }}
          label="Commit message"
          variant="outlined"
          size="small"
          onChange={(event) => {
            commitMessageSet(event.target.value);
          }}
        />
        {branchSelectComponent(
          jsonBranches,
          selectedBranchSet,
          "starting_gitlab_branch",
          updateDiagramFilesParams,
          selectedBranch,
          stateApiSourceURL,
          stateToken,
          longOperationInProcessSet
        )}
        {diagramList(
          getSceneElements,
          getAppState,
          updateScene,
          scrollToContent, diagramElements, docPath, docPathSet, deleteDiagram, diagramActionMenu, openAlertDelegate)}
      </div>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={longOperationInProcess}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </div >
  );
};




