import React, { type ComponentProps } from "react";

import Head from "@docusaurus/Head";
import Admonition from "@theme/Admonition";
import MDXCode from "@theme/MDXComponents/Code";
import MDXDetails from "@theme/MDXComponents/Details";
import MDXHeading from "@theme/MDXComponents/Heading";
import MDXLi from "@theme/MDXComponents/Li";
import MDXPre from "@theme/MDXComponents/Pre";
import MDXUl from "@theme/MDXComponents/Ul";
import type { MDXComponentsObject } from "@theme/MDXComponents";

import {
  MediaAwareLink,
  ZoomableImage,
  ZoomableMermaid,
} from "@theme/components/media-viewer/mdx-media";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@theme/components/ui/table";

const MDXComponents: MDXComponentsObject = {
  Head,
  details: MDXDetails,
  Details: MDXDetails,
  code: MDXCode,
  a: MediaAwareLink,
  pre: MDXPre,
  ul: MDXUl,
  li: MDXLi,
  img: ZoomableImage,
  table: Table,
  thead: TableHeader,
  tbody: TableBody,
  tr: TableRow,
  th: TableHead,
  td: TableCell,
  h1: (props: ComponentProps<"h1">) => <MDXHeading as="h1" {...props} />,
  h2: (props: ComponentProps<"h2">) => <MDXHeading as="h2" {...props} />,
  h3: (props: ComponentProps<"h3">) => <MDXHeading as="h3" {...props} />,
  h4: (props: ComponentProps<"h4">) => <MDXHeading as="h4" {...props} />,
  h5: (props: ComponentProps<"h5">) => <MDXHeading as="h5" {...props} />,
  h6: (props: ComponentProps<"h6">) => <MDXHeading as="h6" {...props} />,
  admonition: Admonition,
  mermaid: ZoomableMermaid,
};

export default MDXComponents;
