/**
 * AppSidebar - Sidebar lateral colapsável com navegação de sub-opções
 */

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

export interface SidebarItem {
  id: string;
  label: string;
  icon: LucideIcon;
  badge?: string | number;
}

interface AppSidebarProps {
  items: SidebarItem[];
  activeItem: string;
  onItemChange: (id: string) => void;
  title?: string;
  className?: string;
}

export function AppSidebar({ 
  items, 
  activeItem, 
  onItemChange, 
  title,
  className 
}: AppSidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          "hidden md:flex flex-col border-r border-border bg-card/50 transition-all duration-300 shrink-0",
          collapsed ? "w-16" : "w-56",
          className
        )}
      >
        {/* Header with collapse toggle */}
        <div className="flex items-center justify-between p-3 border-b border-border/50">
          {!collapsed && title && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm font-medium text-muted-foreground truncate"
            >
              {title}
            </motion.span>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className={cn(
              "p-1.5 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-foreground",
              collapsed && "mx-auto"
            )}
          >
            {collapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {items.map((item) => {
            const isActive = activeItem === item.id;
            const ItemIcon = item.icon;

            const buttonContent = (
              <button
                onClick={() => onItemChange(item.id)}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="sidebarActiveItem"
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                  />
                )}
                <ItemIcon className={cn("w-5 h-5 shrink-0", collapsed && "mx-auto")} />
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="truncate flex-1 text-left text-sm"
                  >
                    {item.label}
                  </motion.span>
                )}
                {!collapsed && item.badge !== undefined && (
                  <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                    {item.badge}
                  </span>
                )}
              </button>
            );

            if (collapsed) {
              return (
                <Tooltip key={item.id} delayDuration={0}>
                  <TooltipTrigger asChild>
                    {buttonContent}
                  </TooltipTrigger>
                  <TooltipContent side="right" className="flex items-center gap-2">
                    {item.label}
                    {item.badge !== undefined && (
                      <span className="text-xs bg-muted px-1.5 py-0.5 rounded-full">
                        {item.badge}
                      </span>
                    )}
                  </TooltipContent>
                </Tooltip>
              );
            }

            return <div key={item.id}>{buttonContent}</div>;
          })}
        </nav>
      </aside>

      {/* Mobile - Hidden, navigation via Sheet from header */}
    </>
  );
}

// Mobile Sheet Version
interface MobileSidebarProps extends AppSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MobileSidebar({ 
  items, 
  activeItem, 
  onItemChange, 
  title,
  isOpen,
  onClose 
}: MobileSidebarProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent side="left" className="w-72 p-0">
        <div className="flex flex-col h-full">
          {/* Header */}
          {title && (
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold text-foreground">{title}</h3>
            </div>
          )}

          {/* Navigation Items */}
          <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
            {items.map((item) => {
              const isActive = activeItem === item.id;
              const ItemIcon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={() => {
                    onItemChange(item.id);
                    onClose();
                  }}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 relative",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                  )}
                >
                  {isActive && (
                    <motion.div
                      layoutId="mobileSidebarActiveItem"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r-full"
                      transition={{ type: "spring", bounce: 0.2, duration: 0.4 }}
                    />
                  )}
                  <ItemIcon className="w-5 h-5 shrink-0" />
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.badge !== undefined && (
                    <span className="text-xs bg-muted px-2 py-0.5 rounded-full">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </SheetContent>
    </Sheet>
  );
}
