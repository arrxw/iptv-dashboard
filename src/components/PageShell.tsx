import type { ReactNode } from "react";

interface PageShellProps {
  children: ReactNode;
  containerSize?: "default" | "md" | "sm";
  className?: string;
}

export default function PageShell({
  children,
  containerSize = "default",
  className = "",
}: PageShellProps) {
  const containerClass =
    containerSize === "md"
      ? "app-container app-container--md"
      : containerSize === "sm"
        ? "app-container app-container--sm"
        : "app-container";

  return (
    <div className={`app-page ${className}`.trim()}>
      <div className={containerClass}>
        <div className="app-content">{children}</div>
      </div>
    </div>
  );
}
