declare module "@theme/components/ui/card" {
  import type { ComponentProps, JSX } from "react";

  export function Card(
    props: ComponentProps<"div"> & { size?: "default" | "sm" }
  ): JSX.Element;
  export function CardHeader(props: ComponentProps<"div">): JSX.Element;
  export function CardTitle(props: ComponentProps<"div">): JSX.Element;
  export function CardDescription(props: ComponentProps<"div">): JSX.Element;
  export function CardContent(props: ComponentProps<"div">): JSX.Element;
  export function CardFooter(props: ComponentProps<"div">): JSX.Element;
}
