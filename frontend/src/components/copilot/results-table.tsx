import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatCell, humanize } from "@/lib/format";
import type { QueryResponse } from "@/lib/types";

export function ResultsTable({ result }: { result: QueryResponse }) {
  return (
    <Card className="gap-4">
      <CardHeader>
        <CardTitle className="text-sm">
          {result.rows.length} row{result.rows.length === 1 ? "" : "s"}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {result.columns.map((col) => (
                <TableHead key={col}>{humanize(col)}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className="font-mono text-xs">
            {result.rows.map((row, i) => (
              <TableRow key={i}>
                {result.columns.map((col) => (
                  <TableCell key={col}>{formatCell(col, row[col])}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
