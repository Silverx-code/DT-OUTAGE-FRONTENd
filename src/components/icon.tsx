import { CSSProperties } from "react";

interface IconProps {
  name: string;
  className?: string;
  size?: number;
  filled?: boolean;
}

/** Renders a Material Symbols Outlined glyph by name. */
export function Icon({ name, className, size = 20, filled = false }: IconProps) {
  const style: CSSProperties = {
    fontSize: `${size}px`,
    ...(filled ? { fontVariationSettings: "'FILL' 1" } : {}),
  };

  return (
    <span className={`material-symbols-outlined ${className ?? ""}`} style={style}>
      {name}
    </span>
  );
}
