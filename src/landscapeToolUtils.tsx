import { convertToExcalidrawElements, Excalidraw, MIME_TYPES, serializeLibraryAsJSON, useHandleLibrary } from "@excalidraw/excalidraw";
import { ExcalidrawElement, ExcalidrawLinearElement, ExcalidrawTextElement, NonDeletedExcalidrawElement, PointBinding } from "@excalidraw/excalidraw/types/element/types";
import { Button, Dialog, DialogActions, DialogContent, DialogContentText, DialogTitle, TextField } from "@mui/material";
import { useState } from "react";

import { v4 as uuidv4 } from 'uuid';
import { landscapeComment, landscapeCommentSceneElements, newLandscapeComment } from "./landscapeObjects/landscapeComment";
import { landscapeNote, landscapeNoteSceneElements, newLandscapeNote } from "./landscapeObjects/landscapeNote";
import { landscapeDomain, landscapeDomainSceneElements, newLandscapeDomain } from "./landscapeObjects/landscapeDomain";
import { landscapeProtoService, landscapeProtoServiceSceneElements, newLandscapeProtoService } from "./landscapeObjects/landscapeProtoService";
import { landscapeService, landscapeServiceSceneElements, newLandscapeService } from "./landscapeObjects/landscapeService";
import { landscapeCall, landscapeCallSceneElements, newLandscapeCall } from "./landscapeObjects/landscapeCall";
import { landscapeMethod, landscapeMethodSceneElements, newLandscapeMethod } from "./landscapeObjects/landscapeMethod";
import { Point } from "@excalidraw/excalidraw/types/types";

export type XY = Readonly<{
  x: number;
  y: number;
}>

export type HW = {
  height: number,
  width: number,
}

export type landscapeToolType =
  "comment" |
  "proto_service" |
  "service" |
  "domain" |
  "note" |
  "call" |
  "method";

interface landscapeToolDialogProps {
  openProps: {
    open: boolean,
    landscapeToolType: landscapeToolType,
    addOrReplace: boolean,
    pointerDownPos?: XY,
    fields?: string
  };
  onClose: (
    okPressed: boolean,
    landscapeToolType: landscapeToolType,
    addOrReplace: boolean,
    pointerDownPos?: XY,
    fields?: string) => void;
}

export function LandscapeToolDialog(props: landscapeToolDialogProps) {
  const [caption, captionSet] = useState("");
  const [name, nameSet] = useState("");
  const [descripton, descriptonSet] = useState("");
  const { onClose, openProps } = props;

  const handleClose = (okPressed: boolean) => {
    const captionCurrent = caption == "" ? openProps.fields : caption;
    captionSet("");
    nameSet("");
    descriptonSet("");
    onClose(
      okPressed,
      openProps.landscapeToolType,
      openProps.addOrReplace,
      openProps.pointerDownPos,
      captionCurrent)
  };

  return (
    <Dialog
      open={openProps.open}>
      <DialogTitle>Add {openProps.landscapeToolType} element</DialogTitle>
      <TextField id="caption"
        value={caption == "" ? openProps.fields : caption}
        sx={{ width: "100%" }}
        label="Caption"
        variant="outlined"
        size="small"
        helperText={"My element caption"}
        onChange={(event) => captionSet(event.target.value)}
      />
      {(openProps.landscapeToolType == "proto_service"
        || openProps.landscapeToolType == "service"
      ) &&
        <TextField id="name"
          value={name}
          sx={{ width: "100%" }}
          label="Service name"
          variant="outlined"
          size="small"
          helperText={"My service name"}
          onChange={(event) => nameSet(event.target.value)}
        />}
      {(openProps.landscapeToolType == "proto_service"
        || openProps.landscapeToolType == "service"
      ) &&
        <TextField id="descripton"
          value={descripton}
          sx={{ width: "100%" }}
          label="Service descripton"
          variant="outlined"
          size="small"
          helperText={"My service descripton"}
          onChange={(event) => descriptonSet(event.target.value)}
        />}
      {/* <DialogContent>
        <DialogContentText id="alert-dialog-description">
          Let Google help apps determine location. This means sending anonymous
          location data to Google, even when no apps are running.
        </DialogContentText>
      </DialogContent> */}
      <DialogActions>
        <Button onClick={() => handleClose(false)}>Cancel</Button>
        <Button onClick={() => handleClose(true)} autoFocus>OK</Button>
      </DialogActions>
    </Dialog>
  );
}

export const landscapeToolCursor = {
  comment: `data:${MIME_TYPES.svg},${encodeURIComponent(
    `<svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="feather feather-message-circle"
      >
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 14H6l-2 2V4h16z"></path>
      </svg>`
  )}`
  ,
  proto_service: `data:${MIME_TYPES.svg},${encodeURIComponent(
    `<svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="feather feather-message-circle"
      >
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 14H6l-2 2V4h16z"></path>
      </svg>`
  )}`
  ,
  service: `data:${MIME_TYPES.svg},${encodeURIComponent(
    `<svg
        xmlns="http://www.w3.org/2000/svg"
        width="24"
        height="24"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="1"
        stroke-linecap="round"
        stroke-linejoin="round"
        class="feather feather-message-circle"
      >
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2m0 14H6l-2 2V4h16z"></path>
      </svg>`
  )}`

}

export type landscapeObject =
  {
    type: landscapeToolType,
    id: string
  }




export const newLandscapeObjectAbstract = (type: landscapeToolType): landscapeObject => {
  return { type: type, id: uuidv4() }
}

export const newLandscapeObject = (type: landscapeToolType, text?: string): landscapeObject => {
  switch (type) {
    case "comment": return newLandscapeComment(text)
    case "domain": return newLandscapeDomain(text)
    case "note": return newLandscapeNote(text)
    case "proto_service": return newLandscapeProtoService(text)
    case "service": return newLandscapeService(text)
    case "call": return newLandscapeCall(text)
    case "method": return newLandscapeMethod(text)
  }
}




export const landscapeObjectSceneElements = (
  object: landscapeObject,
  xy?: XY,
  hw?: HW,
  boundElements?: Readonly<{
    id: ExcalidrawLinearElement["id"];
    type: "arrow" | "text";
  }>[],
  startBinding?: PointBinding | null,
  endBinding?: PointBinding | null,
  points?: readonly Point[]
): NonDeletedExcalidrawElement[] => {
  switch (object.type) {
    case "comment": return landscapeCommentSceneElements(object as landscapeComment, { xy: xy, hw: hw })
    case "domain": return landscapeDomainSceneElements(object as landscapeDomain, { xy: xy, hw: hw }, boundElements)
    case "note": return landscapeNoteSceneElements(object as landscapeNote, { xy: xy, hw: hw }, boundElements)
    case "proto_service": return landscapeProtoServiceSceneElements(object as landscapeProtoService, { xy: xy, hw: hw }, boundElements)
    case "service": return landscapeServiceSceneElements(object as landscapeService, { xy: xy, hw: hw }, boundElements)
    case "call": return landscapeCallSceneElements(object as landscapeCall, { xy: xy, hw: hw, startBinding, endBinding, points })
    case "method": return landscapeMethodSceneElements(object as landscapeMethod, { xy: xy, hw: hw }, boundElements)
  }
}