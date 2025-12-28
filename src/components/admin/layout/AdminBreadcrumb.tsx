/**
 * AdminBreadcrumb - Navegação contextual com breadcrumbs
 */

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { AdminSection, getSectionLabel, getSectionParent } from "./AdminSidebar";

interface AdminBreadcrumbProps {
  currentSection: AdminSection;
  onNavigate?: (section: AdminSection) => void;
}

export function AdminBreadcrumb({ currentSection, onNavigate }: AdminBreadcrumbProps) {
  const parent = getSectionParent(currentSection);
  const currentLabel = getSectionLabel(currentSection);

  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNavigate?.("overview");
            }}
            className="text-muted-foreground hover:text-foreground"
          >
            Admin
          </BreadcrumbLink>
        </BreadcrumbItem>

        {parent && (
          <>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <span className="text-muted-foreground">{parent.label}</span>
            </BreadcrumbItem>
          </>
        )}

        <BreadcrumbSeparator />
        <BreadcrumbItem>
          <BreadcrumbPage className="font-medium">{currentLabel}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
