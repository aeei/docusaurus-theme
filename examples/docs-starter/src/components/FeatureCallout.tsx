import React from "react";

export function FeatureCallout({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}): React.JSX.Element {
  return (
    <section className="markdown-demo-card">
      <h3>{title}</h3>
      <div>{children}</div>
    </section>
  );
}
