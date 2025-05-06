import { useState } from "react";
import type { AppState, ExcalidrawImperativeAPI, SceneData } from "@excalidraw/excalidraw/types/types";
import { AlertColor, Autocomplete, Avatar, Backdrop, Button, ButtonGroup, Chip, CircularProgress, Divider, Drawer, IconButton, Paper, SpeedDial, SpeedDialAction, SpeedDialIcon, Tab, Tabs, TextField, ToggleButton, ToggleButtonGroup, Tooltip, Typography } from "@mui/material";
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SettingsIcon from '@mui/icons-material/Settings';
import React from "react";
import LandscapeIcon from '@mui/icons-material/Landscape';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import TimelineIcon from '@mui/icons-material/Timeline';
import GradingIcon from '@mui/icons-material/Grading';
import RuleIcon from '@mui/icons-material/Rule';
import { formatScene, lintScene } from "./developUtils";
import PublishedWithChangesIcon from '@mui/icons-material/PublishedWithChanges';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { landscapeToolType } from "./landscapeToolUtils";
import { NonDeletedExcalidrawElement } from "@excalidraw/excalidraw/types/element/types";
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Grow from '@mui/material/Grow';
import Popper from '@mui/material/Popper';
import MenuItem from '@mui/material/MenuItem';
import MenuList from '@mui/material/MenuList';

const drawerWidth = 180;


const protoJsonHostVar = localStorage.getItem('ProtoJsonHost') ?
  localStorage.getItem('ProtoJsonHost') :
  process.env.REACT_APP_PROTO_JSON_HOST;
const protoJsonHost = protoJsonHostVar ? protoJsonHostVar : ""

const protoJsonPathVar = localStorage.getItem('ProtoJsonPath') ?
  localStorage.getItem('ProtoJsonPath') :
  process.env.REACT_APP_PROTO_JSON_PATH;
const protoJsonPath = protoJsonPathVar ? protoJsonPathVar : ""





export function LandscapeDevelopDrawer(
  getSceneElements: (() => readonly NonDeletedExcalidrawElement[]) | undefined,
  getAppState: (() => AppState) | undefined,
  updateScene: (<K extends keyof AppState>(sceneData: {
    elements?: SceneData["elements"];
    appState?: Pick<AppState, K> | null | undefined;
    collaborators?: SceneData["collaborators"];
    commitToHistory?: SceneData["commitToHistory"];
  }) => void) | undefined,
  open: boolean,
  handleDrawerClose: () => void,
  addLandscapeToolBegin: (landscapeToolType: string) => void,
  replaceToLandscapeTool: (landscapeToolType: string, originEl: NonDeletedExcalidrawElement) => void,
  openAlertDelegate: (severity: AlertColor, message: string) => void,
  selectedElement: NonDeletedExcalidrawElement | null | undefined
) {
  const [stateProtoJsonPath, stateProtoJsonPathSet] = useState(protoJsonPath);
  const [stateProtoJsonHost, stateProtoJsonHostSet] = useState(protoJsonHost);
  const [openBackdrop, openBackdropSet] = useState(false);
  const [customSettingsHide, customSettingsHideSet] = useState(true);

  const handleClickLandscapeTool = (landscapeToolType: landscapeToolType) =>
    selectedElement ? replaceToLandscapeTool(landscapeToolType, selectedElement) : addLandscapeToolBegin(landscapeToolType)

  const customSettingsComponent = (
  ) => {
    return <div style={{ width: '100%' }} hidden={customSettingsHide}>
      <Divider>Properties</Divider>
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
  }



  function ToolMenuPopover() {
    const [open, setOpen] = React.useState(false);
    const anchorRef = React.useRef<HTMLDivElement>(null);
    const [selectedIndex, setSelectedIndex] = React.useState(0);
    const options = ['comment', 'note', 'domain', 'service', 'proto_service', 'call', 'method'];
    const optionNames = ['Comment', 'Note', 'Domain', 'Service', 'ProtoService', 'Call', 'Method'];

    const handleClick = () => {
      handleClickLandscapeTool(options[selectedIndex] as landscapeToolType);
    };

    const handleToggle = () => {
      setOpen((prevOpen) => !prevOpen);
      handleClickLandscapeTool(options[selectedIndex] as landscapeToolType)
    };
    const handleOpen = () => {
      setOpen(true);
    };
    const handleClose = () => {
      setOpen(false);
    };

    const handleClickAwayClose = (event: Event) => {
      if (
        anchorRef.current &&
        anchorRef.current.contains(event.target as HTMLElement)
      ) {
        return;
      }
      setOpen(false);
    };

    return (
      <React.Fragment>
        <ButtonGroup
          variant="text"
          ref={anchorRef}
          aria-label="Button group with a nested menu"
        >
          <Button
            size="small"
            aria-controls={open ? 'split-button-menu' : undefined}
            aria-expanded={open ? 'true' : undefined}
            aria-label="select merge strategy"
            aria-haspopup="menu"
            onClick={handleClick}
          >
            {selectedElement ? <PublishedWithChangesIcon /> : <AddCircleOutlineIcon />}
          </Button>
          <Button
            onClick={handleToggle}
            onMouseEnter={handleOpen}
          >
            {optionNames[selectedIndex]}
          </Button>
        </ButtonGroup>
        <Popper
          sx={{ zIndex: 1 }}
          open={open}
          anchorEl={anchorRef.current}
          role={undefined}
          transition
          disablePortal
        >
          {({ TransitionProps, placement }) => (
            <Grow
              {...TransitionProps}
              style={{
                transformOrigin:
                  placement === 'bottom' ? 'center top' : 'center bottom',
              }}
            >
              <Paper
                onMouseLeave={handleClose}>
                <ClickAwayListener onClickAway={handleClickAwayClose}>
                  <MenuList id="split-button-menu" autoFocusItem>
                    {options.map((option, index) => (
                      <MenuItem
                        key={option}
                        selected={index === selectedIndex}
                        onClick={(event) => {
                          setSelectedIndex(index);
                          setOpen(false);
                          handleClickLandscapeTool(option as landscapeToolType)
                        }}
                      >
                        {optionNames[index]}
                      </MenuItem>
                    ))}
                  </MenuList>
                </ClickAwayListener>
              </Paper>
            </Grow>
          )}
        </Popper>
      </React.Fragment>
    );
  }

  const propertiesComponent = (
  ) => {
    const [tabToggle, setTabToggle] = useState("unclassified");

    const handleToggleChange = (
      event: React.MouseEvent<HTMLElement>,
      newAlignment: string,
    ) => {
      setTabToggle(newAlignment);
    };


    return <div style={{ width: '100%' }}>
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
        <div>
          <IconButton
            onClick={() => customSettingsHideSet(!customSettingsHide)}
            // size="small" 
            sx={{
              float: 'right'
            }}>
            <SettingsIcon color={customSettingsHide ? "action" : "primary"} />
          </IconButton>
          {customSettingsComponent()}
          {propertiesComponent()}
          <div style={{ height: '40px' }}>
            <Tooltip title="Linter">
              <IconButton
                onClick={() =>
                  lintScene(
                    getSceneElements ? getSceneElements() : [],
                    getAppState ? getAppState() : undefined,
                    updateScene,
                    openBackdropSet,
                    stateProtoJsonHost,
                    stateProtoJsonPath,
                    openAlertDelegate
                  )}
                sx={{
                  float: 'left'
                }}>
                <RuleIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Format scene">
              <IconButton
                onClick={() => formatScene(
                  getSceneElements ? getSceneElements() : [],
                  getAppState ? getAppState() : undefined,
                  updateScene,
                  openBackdropSet,
                  stateProtoJsonHost,
                  stateProtoJsonPath
                )}
                sx={{
                  float: 'left'
                }}>
                <GradingIcon />
              </IconButton>
            </Tooltip>
            <Backdrop
              sx={(theme) => ({ color: '#fff', zIndex: theme.zIndex.drawer + 1 })}
              open={openBackdrop}
            >
              <CircularProgress color="inherit" />
            </Backdrop>
          </div>
          {ToolMenuPopover()}
          <div style={{ width: '100%' }} >
            <Paper>
              {JSON.stringify(selectedElement?.customData)}
            </Paper>
          </div>
        </div>
      </Drawer >
    </div >
  );
};




