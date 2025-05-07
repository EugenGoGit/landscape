import { Dispatch, SetStateAction, useEffect, useState } from "react";
import type { AppState, BinaryFiles, ExcalidrawImperativeAPI, SceneData } from "@excalidraw/excalidraw/types/types";
import { AlertColor, Drawer, IconButton, Tab, Tabs } from "@mui/material";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SettingsIcon from '@mui/icons-material/Settings';
import React from "react";
import GitHubIcon from '@mui/icons-material/GitHub';
import BrowserUpdatedIcon from '@mui/icons-material/BrowserUpdated';
import { localStorageTab } from "./storageTabs/localStorageTab";
import { gitHubStorageTab } from "./storageTabs/gitHubStorageTab";
import { gitLabStorageTab } from "./storageTabs/gitLabStorageTab";
import { NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";

const drawerWidth = 460;

const storeTabToggleInitValue = localStorage.getItem('storeTabToggle') ?
  localStorage.getItem('storeTabToggle') :
  0;


export function LandscapeStorageDrawer(
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
  open: boolean,
  handleDrawerClose: () => void,
  openAlertDelegate: (severity: AlertColor, message: string) => void
) {
  const [storeSettingsHide, setStoreSettingsHide] = useState(true);
  const [storeTabToggle, storeTabToggleSet] = useState(Number(storeTabToggleInitValue));
  const [docPath, docPathSet] = useState("");


  return (
    <div>
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
          },
        }}
        variant="persistent"
        anchor="right"
        open={open}
      >
        <div style={{ height: '40px' }}>
          <IconButton
            onClick={handleDrawerClose}
            // size="small" 
            sx={{
              float: 'left'
            }}>
            <ChevronRightIcon />
          </IconButton>
        </div>
        <div >
          <span hidden={!(storeTabToggle == 0 || storeTabToggle == 1)}>
            <IconButton
              onClick={() => setStoreSettingsHide(!storeSettingsHide)}
              // size="small" 
              sx={{
                float: 'right'
              }}>
              <SettingsIcon color={storeSettingsHide ? "action" : "primary"} />
            </IconButton>
          </span>
          <Tabs value={storeTabToggle} onChange={(event: React.SyntheticEvent, newValue: number) => {
            localStorage.setItem("storeTabToggle", newValue.toString())
            storeTabToggleSet(newValue);
          }} aria-label="icon tabs example">
            <Tab icon={<svg
              xmlns="http://www.w3.org/2000/svg"
              fill={storeTabToggle == 0 ? "#1976d244" : "#00000044"}
              width="24px"
              height="24px"
              viewBox="-2 -2.5 24 24"
              strokeWidth={1.0}
              stroke={storeTabToggle == 0 ? "#1976d2" : "#00000099"}
              preserveAspectRatio="xMinYMin"
            >
              <path d="M10.006 18.443L6.326 7.118h7.36l-3.68 11.325zm0 0L1.168 7.118h5.158l3.68 11.325zM1.168 7.118l8.838 11.325-9.68-7.032a.762.762 0 0 1-.276-.852l1.118-3.441zm0 0L3.385.296a.38.38 0 0 1 .724 0l2.217 6.822H1.168zm8.838 11.325l3.68-11.325h5.157l-8.837 11.325zm8.837-11.325l1.119 3.441a.762.762 0 0 1-.277.852l-9.68 7.032 8.838-11.325zm0 0h-5.157L15.902.296a.38.38 0 0 1 .725 0l2.216 6.822z" />
            </svg>} aria-label="gitlab" />
            <Tab icon={<GitHubIcon />} aria-label="github" />
            <Tab icon={<BrowserUpdatedIcon />} aria-label="local" />
          </Tabs>
          <div hidden={storeTabToggle != 0}>
            {gitLabStorageTab(
              getSceneElements,
              getAppState,
              getSceneFiles,
              updateScene,
              scrollToContent,
              storeSettingsHide,
              docPath,
              docPathSet,
              openAlertDelegate)}
          </div>
          <div hidden={storeTabToggle != 1}>
            {gitHubStorageTab(
              getSceneElements,
              getAppState,
              getSceneFiles,
              updateScene,
              scrollToContent,
              storeSettingsHide,
              docPath,
              docPathSet,
              openAlertDelegate)}
          </div>
          <div hidden={storeTabToggle != 2}>
            {localStorageTab(
              getSceneElements,
              getAppState,
              updateScene,
              scrollToContent,
              docPath,
              docPathSet,
              openAlertDelegate)}
          </div>
        </div>
      </Drawer >
    </div >
  );
};




