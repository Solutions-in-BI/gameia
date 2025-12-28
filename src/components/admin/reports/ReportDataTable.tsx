/**
 * Tabela de dados do relatório
 */

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Column {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  format?: (value: any) => string;
}

interface ReportDataTableProps {
  columns: Column[];
  data: Record<string, any>[];
  maxRows?: number;
}

export function ReportDataTable({ columns, data, maxRows = 10 }: ReportDataTableProps) {
  const displayData = data.slice(0, maxRows);
  const hasMore = data.length > maxRows;

  if (data.length === 0) {
    return (
      <div className="py-8 text-center text-muted-foreground text-sm">
        Nenhum dado disponível para este relatório
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <ScrollArea className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead
                  key={col.key}
                  className={
                    col.align === "right"
                      ? "text-right"
                      : col.align === "center"
                      ? "text-center"
                      : "text-left"
                  }
                >
                  {col.label}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {displayData.map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {columns.map((col) => (
                  <TableCell
                    key={col.key}
                    className={
                      col.align === "right"
                        ? "text-right"
                        : col.align === "center"
                        ? "text-center"
                        : "text-left"
                    }
                  >
                    {col.format ? col.format(row[col.key]) : row[col.key] ?? "-"}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </ScrollArea>
      {hasMore && (
        <p className="text-xs text-muted-foreground text-center">
          Mostrando {maxRows} de {data.length} registros
        </p>
      )}
    </div>
  );
}
