import { Dispatch, JSX, SetStateAction, useEffect, useState } from "react";

import type {
  AppState,
  ExcalidrawImperativeAPI,
  BinaryFiles,
  ExcalidrawInitialDataState,
  UIAppState,
  SceneData,
  Collaborator,
} from "@excalidraw/excalidraw/types/types";
import { AlertColor, Autocomplete, Avatar, Backdrop, CardActionArea, CardHeader, CardMedia, Chip, CircularProgress, Divider, Drawer, IconButton, ListItemIcon, Menu, MenuItem, SpeedDial, SpeedDialAction, SpeedDialIcon, styled, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import CompareIcon from '@mui/icons-material/Compare';
import Card from '@mui/material/Card';
import CardActions from '@mui/material/CardActions';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import { RestoredDataState } from "@excalidraw/excalidraw/types/data/restore";

import DeleteIcon from '@mui/icons-material/Delete';
import DifferenceIcon from '@mui/icons-material/Difference';
import { checkCompatibleWithScene, compareDiagramWithScene } from "../developUtils";
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { ExcalidrawElement, NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";


export type DiagramEntry = { key: string, value?: RestoredDataState, SVGIcon?: SVGSVGElement, sha?: string }

export const updateScene = async (
  excalidrawAPI: ExcalidrawImperativeAPI | null,
  dataState: RestoredDataState
) => {
  if (excalidrawAPI) {
    const sceneData = {
      elements: dataState.elements,
      appState: dataState.appState,
      collaborators: new Map<string, Collaborator>()
    };
    excalidrawAPI.updateScene(sceneData);
    excalidrawAPI.scrollToContent(
      excalidrawAPI.getSceneElements(),
      {
        fitToViewport: true
      }
    );
  }
};

export const btoaUTF8 = (data: string) => {
  const utf8Data = new TextEncoder().encode(data);
  let binaryString = "";
  for (let i = 0; i < utf8Data.length; i++) {
    binaryString += String.fromCharCode(utf8Data[i]);
  }
  return btoa(binaryString);
}

export const diagramList = (
  getSceneElements: (() => readonly NonDeletedExcalidrawElement[]) | undefined,
  getAppState: (() => AppState) | undefined,
  updateScene: (<K extends keyof AppState>(sceneData: {
    elements?: SceneData["elements"];
    appState?: Pick<AppState, K> | null | undefined;
    collaborators?: SceneData["collaborators"];
    commitToHistory?: SceneData["commitToHistory"];
  }) => void) | undefined,
  scrollToContent: (() => void) | undefined,
  diagramsMap: Array<DiagramEntry> | undefined,
  docPath: string,
  docPathSet: Dispatch<SetStateAction<string>>,
  deleteDiagram: ((key: string, sha?: string) => Promise<void>) | null,
  diagramActionMenu: ((
    diagrammMoreMenuAnchorEl: () => { key: string, el: null | HTMLElement },
    handleDiagramMoreMenuClose: () => void) => JSX.Element) | null,
  openAlertDelegate: (severity: AlertColor, message: string) => void
) => {
  const [diagrammMoreMenuAnchorEl, diagrammMoreMenuAnchorElSet] = useState<{ key: string, el: null | HTMLElement }>({ key: '', el: null });
  const openDiagramMoreMenu = Boolean(diagrammMoreMenuAnchorEl.el);


  const handleDiagramMoreMenuClick = (event: React.MouseEvent<HTMLElement>, key: string) => {
    diagrammMoreMenuAnchorElSet({ key: key, el: event.currentTarget });
  };
  const handleDiagramMoreMenuClose = () => {
    diagrammMoreMenuAnchorElSet({ key: '', el: null });
  };

  return (diagramsMap && diagramsMap.length != 0) ?
    <Stack direction="column" spacing={1} style={{ width: '100%' }} >
      {diagramsMap?.map(item => {
        return <Paper elevation={3} >
          <Card sx={{ maxHeight: 300 }} variant="outlined">
            <CardHeader
              sx={docPath == item.key ? { "background-color": '#1976d255' } : { "background-color": 'text.secondary' }}
              title={<Typography gutterBottom sx={{ color: 'text.secondary', fontSize: 14 }}>
                {item.key}
              </Typography>}
              action={diagramActionMenu &&
                <IconButton
                  aria-label={"diagramMore" + item.key}
                  id={"diagrammMoreButton" + item.key}
                  aria-controls={openDiagramMoreMenu ? 'diagrammMoreMenu' : undefined}
                  aria-expanded={openDiagramMoreMenu ? 'true' : undefined}
                  aria-haspopup="true"
                  onClick={(event: React.MouseEvent<HTMLElement>) => {
                    handleDiagramMoreMenuClick(event, item.key);
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              }
            />
            <CardActionArea
              onClick={async () => {
                if (item.value) {
                  docPathSet(item.key);
                  const sceneData = {
                    elements: item.value.elements,
                    appState: item.value.appState,
                    collaborators: new Map<string, Collaborator>()
                  };
                  updateScene && updateScene(sceneData);
                  scrollToContent && scrollToContent();
                }
              }}
            >
              <CardMedia
                sx={{ height: "170px", "object-fit": "fill" }}
                component="img"
                alt="NO SVG IMAGE"
                src={URL.createObjectURL(new Blob([(item as { key: string, value: RestoredDataState, SVGIcon: SVGSVGElement }).SVGIcon?.outerHTML], { type: 'image/svg+xml' }))}
              >
              </CardMedia>
            </CardActionArea>
            <CardActions>
              <Tooltip title="Show difference">
                <IconButton
                  onClick={() => {
                    if (item.value) compareDiagramWithScene(item.value.elements, getSceneElements ? getSceneElements() : [], getAppState ? getAppState() : undefined, updateScene, openAlertDelegate)
                  }
                  }
                  sx={{
                    float: 'left'
                  }}>
                  <DifferenceIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Show incompatibility with the scene">
                <IconButton
                  onClick={() => {
                    if (item.value) checkCompatibleWithScene(item.value?.elements, getSceneElements ? getSceneElements() : [], getAppState ? getAppState() : undefined, updateScene);
                  }
                  }
                  sx={{
                    float: 'left'
                  }}>
                  <CompareIcon />
                </IconButton>
              </Tooltip>
              {deleteDiagram &&
                <IconButton
                  onClick={() => { deleteDiagram(item.key, item.sha) }}
                  sx={{
                    float: 'right'
                  }}>
                  <DeleteIcon />
                </IconButton>
              }
            </CardActions>
          </Card>
        </Paper>
      })
      }
      {diagramActionMenu && diagramActionMenu(() => { return diagrammMoreMenuAnchorEl }, handleDiagramMoreMenuClose)}
    </Stack>
    :
    <div>Empty Diagram list</div>
}

