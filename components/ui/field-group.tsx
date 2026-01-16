import * as React from "react";
import { cn } from "./utils";

interface FieldGroupProps {
  children: React.ReactNode;
  label?: string;
  className?: string;
}

function FieldGroup({ children, label, className }: FieldGroupProps) {
  return (
    <div className={cn("bg-slate-800/30 rounded-lg p-3 space-y-3", className)}>
      {label && (
        <span className="text-xs font-medium text-slate-400">{label}</span>
      )}
      {children}
    </div>
  );
}

export { FieldGroup };
export type { FieldGroupProps };
