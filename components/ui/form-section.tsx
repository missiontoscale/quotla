"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import type { LucideIcon } from "lucide-react";
import { cn } from "./utils";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./collapsible";

interface FormSectionProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  collapsible?: boolean;
  defaultOpen?: boolean;
  className?: string;
}

function FormSection({
  title,
  description,
  icon: Icon,
  children,
  collapsible = false,
  defaultOpen = true,
  className,
}: FormSectionProps) {
  const headerContent = (
    <div className="flex items-center gap-2">
      {Icon && <Icon className="h-4 w-4 text-slate-400" />}
      <div className="flex-1">
        <h3 className="text-sm font-medium text-slate-200">{title}</h3>
        {description && (
          <p className="text-xs text-slate-400 mt-0.5">{description}</p>
        )}
      </div>
    </div>
  );

  const sectionStyles = cn(
    "bg-slate-800/50 border border-slate-700 rounded-lg p-4",
    className
  );

  if (collapsible) {
    return (
      <Collapsible defaultOpen={defaultOpen}>
        <div className={sectionStyles}>
          <CollapsibleTrigger className="w-full">
            <div className="flex items-center justify-between">
              {headerContent}
              <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 [[data-state=closed]_&]:-rotate-90" />
            </div>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <div className="mt-4 space-y-4">{children}</div>
          </CollapsibleContent>
        </div>
      </Collapsible>
    );
  }

  return (
    <div className={sectionStyles}>
      <div className="mb-4">{headerContent}</div>
      <div className="space-y-4">{children}</div>
    </div>
  );
}

export { FormSection };
export type { FormSectionProps };
