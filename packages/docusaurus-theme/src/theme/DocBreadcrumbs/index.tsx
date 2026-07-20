import React, { type ReactNode } from "react";

import Link from "@docusaurus/Link";
import { translate } from "@docusaurus/Translate";
import { useHomePageRoute } from "@docusaurus/theme-common/internal";
import * as DocsClient from "@docusaurus/plugin-content-docs/client";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@theme/components/ui/breadcrumb";
import DocBreadcrumbsStructuredData from "@theme/DocBreadcrumbs/StructuredData";

export default function DocBreadcrumbs(): ReactNode {
  const breadcrumbs = (DocsClient as any).useSidebarBreadcrumbs();
  const homePageRoute = useHomePageRoute();

  if (!breadcrumbs) return null;

  return (
    <>
      <DocBreadcrumbsStructuredData breadcrumbs={breadcrumbs} />
      <Breadcrumb
        aria-label={translate({
          id: "theme.docs.breadcrumbs.navAriaLabel",
          message: "Breadcrumbs",
          description: "Breadcrumb navigation label",
        })}
      >
        <BreadcrumbList>
          {homePageRoute && (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink
                  render={
                    <Link
                      href="/"
                      aria-label={translate({
                        id: "theme.docs.breadcrumbs.home",
                        message: "Home page",
                        description: "Home breadcrumb label",
                      })}
                    />
                  }
                >
                  Home
                </BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator className="theme-breadcrumb-separator" />
            </>
          )}
          {breadcrumbs.map((item: any, index: number) => {
            const isLast = index === breadcrumbs.length - 1;
            const href =
              item.type === "category" && item.linkUnlisted
                ? undefined
                : item.href;

            return (
              <React.Fragment key={`${item.label}-${index}`}>
                <BreadcrumbItem>
                  {isLast || !href ? (
                    <BreadcrumbPage>{item.label}</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink render={<Link href={href} />}>
                      {item.label}
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {!isLast && (
                  <BreadcrumbSeparator className="theme-breadcrumb-separator" />
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </>
  );
}
