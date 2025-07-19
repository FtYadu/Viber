import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { RefreshCw } from 'lucide-react';

interface DataTableProps<TData> {
  columns: {
    accessorKey?: string;
    id?: string;
    header: string;
    cell: ({ row }: { row: { original: TData } }) => React.ReactNode;
  }[];
  data: TData[];
  loading?: boolean;
  noDataMessage?: string;
}

export function DataTable<TData>({
  columns,
  data,
  loading = false,
  noDataMessage = 'No data available',
}: DataTableProps<TData>) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            {columns.map((column) => (
              <TableHead key={column.id || column.accessorKey}>
                {column.header}
              </TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                <div className="flex justify-center items-center">
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </div>
              </TableCell>
            </TableRow>
          ) : data.length === 0 ? (
            <TableRow>
              <TableCell
                colSpan={columns.length}
                className="h-24 text-center"
              >
                {noDataMessage}
              </TableCell>
            </TableRow>
          ) : (
            data.map((row, i) => (
              <TableRow key={i}>
                {columns.map((column) => (
                  <TableCell key={column.id || column.accessorKey}>
                    {column.cell({ row: { original: row } })}
                  </TableCell>
                ))}
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
}