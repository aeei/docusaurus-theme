import React, {
  type ComponentProps,
  createContext,
  type ReactNode,
  useContext,
} from "react";

import { translate } from "@docusaurus/Translate";
import MDXA from "@theme/MDXComponents/A";
import MDXImg from "@theme/MDXComponents/Img";
import Mermaid from "@theme/Mermaid";
import type { Props as ImgProps } from "@theme/MDXComponents/Img";
import type { Props as MermaidProps } from "@theme/Mermaid";

import MediaViewer from "@theme/components/media-viewer";

const LinkedMediaContext = createContext(false);

export function MediaAwareLink(props: ComponentProps<typeof MDXA>): ReactNode {
  return (
    <LinkedMediaContext.Provider value>
      <MDXA {...props} />
    </LinkedMediaContext.Provider>
  );
}

export function ZoomableImage(props: ImgProps): ReactNode {
  const linked = useContext(LinkedMediaContext);
  if (linked) return <MDXImg {...props} />;

  const title =
    props.alt?.trim() ||
    translate({
      id: "theme.mediaViewer.imageTitle",
      message: "Image preview",
    });
  const {
    className: _className,
    style: _style,
    loading: _loading,
    decoding: _decoding,
    ...expandedProps
  } = props;

  return (
    <MediaViewer
      as="span"
      kind="image"
      title={title}
      preview={<MDXImg {...props} />}
      expanded={
        <MDXImg
          {...expandedProps}
          loading="eager"
          decoding="async"
          className="theme-media-viewer__expanded-image"
        />
      }
    />
  );
}

export function ZoomableMermaid(props: MermaidProps): ReactNode {
  const title = translate({
    id: "theme.mediaViewer.diagramTitle",
    message: "Diagram preview",
  });
  return (
    <MediaViewer
      as="div"
      kind="diagram"
      title={title}
      preview={<Mermaid {...props} />}
      expanded={<Mermaid {...props} />}
    />
  );
}
