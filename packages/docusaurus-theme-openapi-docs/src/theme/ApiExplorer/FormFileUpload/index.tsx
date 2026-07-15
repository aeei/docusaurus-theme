/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useState } from "react";

import { translate } from "@docusaurus/Translate";
import FloatingButton from "@theme/ApiExplorer/FloatingButton";
import { File } from "lucide-react";
import MagicDropzone from "react-magic-dropzone";

type PreviewFile = { preview: string } & File;

interface RenderPreviewProps {
  file: PreviewFile;
}

function RenderPreview({ file }: RenderPreviewProps) {
  switch (file.type) {
    case "image/png":
    case "image/jpeg":
    case "image/jpg":
    case "image/svg+xml":
      return (
        <img
          style={{
            borderRadius: "4px",
          }}
          src={file.preview}
          alt=""
        />
      );
    default:
      return (
        <div
          style={{
            display: "flex",
            alignItems: "center",
            minWidth: 0,
          }}
        >
          <File aria-hidden="true" size={50} strokeWidth={1.5} />
          <div className="openapi-explorer__file-name">{file.name}</div>
        </div>
      );
  }
}

export interface Props {
  placeholder: string;
  onChange?(file?: File): any;
}

function FormFileUpload({ placeholder, onChange }: Props) {
  const [hover, setHover] = useState(false);
  const [file, setFile] = useState<PreviewFile>();

  function setAndNotifyFile(file?: PreviewFile) {
    setFile(file);
    onChange?.(file);
  }

  function handleDrop(accepted: PreviewFile[]) {
    const [file] = accepted;
    setAndNotifyFile(file);
    setHover(false);
  }

  return (
    <FloatingButton>
      <MagicDropzone
        className={
          hover
            ? "openapi-explorer__dropzone-hover"
            : "openapi-explorer__dropzone"
        }
        onDrop={handleDrop}
        onDragEnter={() => setHover(true)}
        onDragLeave={() => setHover(false)}
        multiple={false}
        style={{ marginTop: "calc(var(--ifm-pre-padding) / 2)" }}
      >
        {file ? (
          <>
            <button
              style={{ marginTop: "calc(var(--ifm-pre-padding) / 2)" }}
              onClick={(e) => {
                e.stopPropagation();
                setAndNotifyFile(undefined);
              }}
            >
              {translate({
                id: "theme.openapi.formFileUpload.clearButton",
                message: "Clear",
              })}
            </button>
            <RenderPreview file={file} />
          </>
        ) : (
          <div className="openapi-explorer__dropzone-content">
            {placeholder}
          </div>
        )}
      </MagicDropzone>
    </FloatingButton>
  );
}

export default FormFileUpload;
