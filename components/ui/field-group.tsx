import * as React from "react";
import { cn } from "./utils";

interface FieldGroupProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

function FieldGroup({ children, label, className }: FieldGroupProps) {
  return (
    <div className={cn("bg-primary-700/30 rounded-lg p-3 space-y-3", className)}>
      {label && (
        <span className="text-xs font-medium text-primary-400">{label}</span>
      )}
      {children}
    </div>
  );
}

export { FieldGroup };
export type { FieldGroupProps };
