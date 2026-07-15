declare module "@docusaurus/theme-common/internal" {
  export * from "@docusaurus/theme-common/lib/internal";
}

declare module "@docusaurus/theme-common/Details" {
  export { Details } from "@docusaurus/theme-common/lib/components/Details";
}

declare module "@docusaurus/plugin-content-docs/client" {
  export const findFirstSidebarItemLink: any;
  export const isActiveSidebarItem: any;
  export const useDocSidebarItemsExpandedState: any;
  export const useVisibleSidebarItems: any;
  export const useDocsSidebar: any;
}
