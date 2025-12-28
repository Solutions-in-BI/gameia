/**
 * Card de seleção de relatório
 */

import { motion } from "framer-motion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface ReportCardProps {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  category: string;
  isSelected: boolean;
  onClick: () => void;
}

export function ReportCard({
  id,
  title,
  description,
  icon: Icon,
  category,
  isSelected,
  onClick,
}: ReportCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      layout
    >
      <Card
        className={`cursor-pointer transition-all h-full ${
          isSelected
            ? "border-primary ring-2 ring-primary/20 bg-primary/5"
            : "hover:border-muted-foreground/30"
        }`}
        onClick={onClick}
      >
        <CardHeader className="pb-2">
          <div className="flex items-start justify-between gap-2">
            <div
              className={`p-2 rounded-lg shrink-0 ${
                isSelected ? "bg-primary/10" : "bg-muted"
              }`}
            >
              <Icon
                className={`h-5 w-5 ${
                  isSelected ? "text-primary" : "text-muted-foreground"
                }`}
              />
            </div>
            <Badge variant="secondary" className="text-xs shrink-0">
              {category}
            </Badge>
          </div>
          <CardTitle className="text-base mt-3">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription className="text-xs">{description}</CardDescription>
        </CardContent>
      </Card>
    </motion.div>
  );
}
