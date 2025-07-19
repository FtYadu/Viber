import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ArrowRight, ExternalLink, Play } from "lucide-react";
import Link from "next/link";
import { WorkflowTriggerDialog } from "@/components/workflows/workflow-trigger-dialog";

export type WorkflowWithCounts = {
  id: string;
  name: string;
  description: string | null;
  webhookUrl: string;
  type: string;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    executions: number;
    webhookRegistrations: number;
  };
};

export const columns: ColumnDef<WorkflowWithCounts>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => {
      return (
        <div>
          <div className="font-medium">{row.getValue("name")}</div>
          <div className="text-sm text-muted-foreground">
            {row.original.description || "No description"}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => {
      return <Badge variant="outline">{row.getValue("type")}</Badge>;
    },
  },
  {
    accessorKey: "webhookUrl",
    header: "n8n Webhook",
    cell: ({ row }) => {
      const url = row.getValue("webhookUrl") as string;
      return (
        <div className="flex items-center">
          <div className="max-w-[200px] truncate font-mono text-xs">
            {url}
          </div>
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="ml-2 h-6 w-6"
          >
            <a href={url} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="h-3 w-3" />
            </a>
          </Button>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created",
    cell: ({ row }) => {
      return format(row.original.createdAt, "MMM d, yyyy");
    },
  },
  {
    accessorKey: "_count.executions",
    header: "Executions",
    cell: ({ row }) => {
      return row.original._count.executions;
    },
  },
  {
    accessorKey: "_count.webhookRegistrations",
    header: "Webhooks",
    cell: ({ row }) => {
      return row.original._count.webhookRegistrations;
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      return (
        <div className="flex items-center space-x-2">
          <Button size="sm" variant="outline">
            <Play className="mr-2 h-4 w-4" />
            Trigger
          </Button>
          <Button asChild size="sm">
            <Link href={`/admin/workflows/${row.original.id}`}>
              Details
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      );
    },
  },
];