import type { ReactNode } from "react";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  variant?: "default" | "hero" | "success" | "purple";
  backButton?: ReactNode;
  actions?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  variant = "default",
  backButton,
  actions,
}: PageHeaderProps) {
  const variantClass =
    variant === "hero"
      ? "page-header--hero"
      : variant === "success"
        ? "page-header--success"
        : variant === "purple"
          ? "page-header--purple"
          : "";

  return (
    <header className={`page-header ${variantClass}`.trim()}>
      <div className="app-container">
        <div className="page-header__inner">
          <div className="page-header__left">
            {backButton}
            <h1 className="page-header__title">{title}</h1>
            {subtitle && (
              <p className="page-header__subtitle">{subtitle}</p>
            )}
          </div>
          {actions && (
            <div className="page-header__actions">{actions}</div>
          )}
        </div>
      </div>
    </header>
  );
}
