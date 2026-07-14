/* ============================================================================
 * Copyright (c) Palo Alto Networks
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 * ========================================================================== */

import React, { useEffect, useState } from "react";

import { usePrismTheme } from "@docusaurus/theme-common";
import { translate } from "@docusaurus/Translate";
import Container from "@theme/ApiExplorer/ApiCodeBlock/Container";
import CopyButton from "@theme/ApiExplorer/ApiCodeBlock/CopyButton";
import ExitButton from "@theme/ApiExplorer/ApiCodeBlock/ExitButton";
import Line from "@theme/ApiExplorer/ApiCodeBlock/Line";
import clsx from "clsx";
import { Check, Maximize2 } from "lucide-react";
import { Highlight, Language } from "prism-react-renderer";
import Modal from "react-modal";

export interface Props {
  readonly code: string;
  readonly className: string;
  readonly language: Language;
  readonly showLineNumbers: boolean;
  readonly blockClassName: string;
  readonly title: string | undefined;
  readonly lineClassNames: { [lineIndex: number]: string[] };
}

export default function ExpandButton({
  code,
  className,
  language,
  showLineNumbers,
  blockClassName,
  title,
  lineClassNames,
}: Props): React.JSX.Element {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const prismTheme = usePrismTheme();

  useEffect(() => {
    Modal.setAppElement("body");
  }, []);

  return (
    <>
      <button
        type="button"
        aria-label={
          isModalOpen
            ? translate({
                id: "theme.CodeBlock.expanded",
                message: "Expanded",
                description: "The expanded button label on code blocks",
              })
            : translate({
                id: "theme.CodeBlock.expandButtonAriaLabel",
                message: "Expand code to fullscreen",
                description: "The ARIA label for expand code blocks button",
              })
        }
        title={translate({
          id: "theme.CodeBlock.expand",
          message: "Expand",
          description: "The expand button label on code blocks",
        })}
        className={clsx(
          "clean-btn",
          className,
          "openapi-explorer__code-block-expand-btn",
          isModalOpen && "openapi-explorer__code-block-expand-btn--copied"
        )}
        onClick={() => setIsModalOpen(true)}
      >
        <span
          className="openapi-explorer__code-block-expand-btn-icons"
          aria-hidden="true"
        >
          <Maximize2 className="openapi-explorer__code-block-expand-btn-icon" />
          <Check className="openapi-explorer__code-block-expand-btn-icon--success" />
        </span>
      </button>
      <Modal
        className="openapi-explorer__expand-modal-content"
        overlayClassName="openapi-explorer__expand-modal-overlay"
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="Code Snippet"
      >
        <Container
          as="div"
          className={clsx(
            "openapi-explorer__code-block-container",
            language &&
              !blockClassName.includes(`language-${language}`) &&
              `language-${language}`
          )}
        >
          {title && (
            <div className="openapi-explorer__code-block-title">{title}</div>
          )}
          <div className="openapi-explorer__code-block-content">
            <Highlight
              // {...defaultProps}
              theme={prismTheme}
              code={code}
              language={language ?? "text"}
            >
              {({ className, tokens, getLineProps, getTokenProps }) => (
                <pre
                  /* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */
                  tabIndex={0}
                  className={clsx(
                    className,
                    "openapi-explorer__code-block",
                    "thin-scrollbar"
                  )}
                >
                  <code
                    className={clsx(
                      "openapi-explorer__code-block-lines",
                      showLineNumbers &&
                        "openapi-explorer__code-block-lines-numbers"
                    )}
                  >
                    {tokens.map((line, i) => (
                      <Line
                        key={i}
                        line={line}
                        getLineProps={getLineProps}
                        getTokenProps={getTokenProps}
                        classNames={lineClassNames[i]}
                        showLineNumbers={showLineNumbers}
                      />
                    ))}
                  </code>
                </pre>
              )}
            </Highlight>
            <div className="openapi-explorer__code-block-btn-group">
              <CopyButton
                className="openapi-explorer__code-block-code-btn"
                code={code}
              />
              <ExitButton
                className="openapi-explorer__code-block-code-btn"
                handler={() => setIsModalOpen(false)}
              />
            </div>
          </div>
        </Container>
      </Modal>
    </>
  );
}
