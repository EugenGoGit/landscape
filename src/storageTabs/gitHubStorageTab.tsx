import { Dispatch, SetStateAction, useEffect, useState } from "react";
import type {
  AppState,
  ExcalidrawImperativeAPI,
  BinaryFiles,
  ExcalidrawInitialDataState,
  UIAppState,
  SceneData,
} from "@excalidraw/excalidraw/types/types";
import { AlertColor, Backdrop, IconButton, TextField, CircularProgress, Menu, MenuItem, Popover, List, ListItem, ListItemButton, ListItemIcon, ListItemText } from "@mui/material";
import SaveIcon from '@mui/icons-material/Save';
import { RestoredDataState } from "@excalidraw/excalidraw/types/data/restore";
import { DiagramEntry, diagramList } from "../storageTabs/storageTabUtils";
import { branchSelectComponent, commitDiagram, commitDiagramParams, diagramActionMenu, storeSettingsDiv, updateBranchList, updateDiagramFiles, vcsDeleteDiagram } from "./vcsStorageTabUtils";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

const apiSourceURLVar = localStorage.getItem('github_project_api_url') ? localStorage.getItem('github_project_api_url') : process.env.REACT_APP_GITHUB_API_PRJ_URL;
const apiSourceURL = apiSourceURLVar ? apiSourceURLVar : ""

const tokenVar = localStorage.getItem('github_token') ? localStorage.getItem('github_token') : process.env.REACT_APP_GITHUB_TOKEN;
const token = tokenVar ? tokenVar : ""

const startingBranch = localStorage.getItem('starting_github_branch') ? localStorage.getItem('starting_github_branch') : "main";

export function gitHubStorageTab(
  getSceneElements: (() => readonly NonDeletedExcalidrawElement[]) | undefined,
  getAppState: (() => AppState)|undefined,
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
    getFilesUrl: (apiSourceURL: string, branch: string) => apiSourceURL + "git/trees/" + branch + "?recursive=1",
    getContentUrl: (apiSourceURL: string, filePath: string, branch: string) => apiSourceURL + "contents/" + encodeURIComponent(filePath) + "?ref=" + branch,
    requestHeaders: (token: string) => {
      return {
        Authorization: "Bearer " + token, Accept: "application/vnd.github.v3.raw"
      }
    },
    openAlertDelegate: openAlertDelegate,
    treeContent: true,
    sourceName: "GitHub",
    diagramElementsSet: diagramElementsSet,
    setProcessStateDelegate: longOperationInProcessSet
  }

  const updateBranchParams = {
    getBranchUrl: (apiSourceURL: string) => apiSourceURL + "branches",
    requestHeaders: (token: string) => {
      return {
        Authorization: "Bearer " + token, Accept: "application/vnd.github+json"
      }
    },
    sourceName: "GitHub",
    openAlertDelegate: openAlertDelegate,
    jsonBranchesSet: jsonBranchesSet
  }

  const deleteDiagramParams = {
    openAlertDelegate: openAlertDelegate,
    needPathValueSet: needPathValueSet,
    deleteUrl: (apiSourceURL: string, filePath: string) => apiSourceURL + "contents/" + encodeURIComponent(filePath),
    sourceName: "GitHub",
    body: (branch: string, commitMessage: string, sha?: string) => {
      return {
        branch: branch,
        message: commitMessage,
        sha: sha
      }
    },
    requestHeaders: (token: string) => {
      return {
        Authorization: "Bearer " + token, Accept: "application/vnd.github+json"
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


  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const handlePopoverOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handlePopoverClose = () => {
    setAnchorEl(null);
  };

  return (
    <div>
      {storeSettingsDiv(
        storeSettingsHide,
        "GitHub API",
        stateApiSourceURL,
        stateApiSourceURLSet,
        "https://api.github.com/repos/OWNER/REPO/",
        "github_project_api_url",
        "github_token",
        stateToken,
        stateTokenSet,
        "(Read access to metadata;Read and Write access to code)"
      )}

      <div style={{ width: '100%' }}>
        <IconButton
          onClick={() => {
            if (selectedBranch) {
              const commitParams: commitDiagramParams = {
                sceneElements: getSceneElements ? getSceneElements() : [],
                appState: getAppState?getAppState():undefined,
                sceneFiles: getSceneFiles?getSceneFiles():null,
                openAlertDelegate: openAlertDelegate,
                needPathValueSet: needPathValueSet,
                commitUrl: (apiSourceURL: string, filePath: string) => apiSourceURL + "contents/" + encodeURIComponent(filePath),
                sourceName: "GitHub",
                body: (branch: string, commitMessage: string, content: string, diagramElements: Array<DiagramEntry>, docPath: string) => {
                  return {
                    branch: branch,
                    message: commitMessage,
                    content: content,
                    sha: diagramElements.find(entry => entry.key == docPath)?.sha
                  }
                },
                requestHeaders: (token: string) => {
                  return {
                    Authorization: "Bearer " + token, Accept: "application/vnd.github+json"
                  }
                },
                diagramElementsSet: diagramElementsSet,
                method: () => 'PUT',
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
          "starting_github_branch",
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
          scrollToContent,
          diagramElements,
          docPath,
          docPathSet,
          deleteDiagram,
          diagramActionMenu,
          openAlertDelegate
        )}
      </div>
      <Backdrop
        sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
        open={longOperationInProcess}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
      <Popover
        id="mouse-over-popover"
        sx={{ pointerEvents: 'none' }}
        open={open}
        anchorEl={anchorEl}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        onClose={handlePopoverClose}
        disableRestoreFocus
        onMouseEnter={handlePopoverOpen}
        onMouseLeave={handlePopoverClose}
      >
        <List>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <MoreVertIcon />
              </ListItemIcon>
              <ListItemText primary="Inbox" />
            </ListItemButton>
          </ListItem>
          <ListItem disablePadding>
            <ListItemButton>
              <ListItemIcon>
                <MoreVertIcon />
              </ListItemIcon>
              <ListItemText primary="Drafts" />
            </ListItemButton>
          </ListItem>
        </List>
      </Popover>
    </div >
  );
};




