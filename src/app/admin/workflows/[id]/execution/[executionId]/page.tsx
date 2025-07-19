import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Clock, FileJson } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";

export default async function WorkflowExecutionPage({
  params,
}: {
  params: { id: string; executionId: string };
}) {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    notFound();
  }

  const execution = await db.workflowExecution.findUnique({
    where: {
      id: params.executionId,
      workflowConfigId: params.id,
    },
    include: {
      workflowConfig: true,
    },
  });

  if (!execution) {
    notFound();
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "SUCCESS":
        return "bg-green-500";
      case "FAILED":
        return "bg-red-500";
      case "RUNNING":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Button
          variant="ghost"
          size="sm"
          asChild
          className="mr-2"
        >
          <Link href={`/admin/workflows/${params.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to workflow
          </Link>
        </Button>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl">
                Execution Details
              </CardTitle>
              <Badge className={getStatusColor(execution.status)}>
                {execution.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-2" />
                Started: {format(execution.createdAt, "PPpp")}
                {execution.completedAt && (
                  <span className="ml-4">
                    Completed: {format(execution.completedAt, "PPpp")}
                  </span>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="font-medium mb-2">Workflow</h3>
                <p>{execution.workflowConfig.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {execution.workflowConfig.description}
                </p>
              </div>

              {execution.error && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-2 text-red-500">Error</h3>
                    <pre className="bg-red-50 p-4 rounded-md text-sm overflow-auto">
                      {execution.error}
                    </pre>
                  </div>
                </>
              )}

              <Separator />

              <div>
                <h3 className="font-medium mb-2 flex items-center">
                  <FileJson className="h-4 w-4 mr-2" />
                  Payload
                </h3>
                <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-auto">
                  {JSON.stringify(execution.payload, null, 2)}
                </pre>
              </div>

              {execution.result && (
                <>
                  <Separator />
                  <div>
                    <h3 className="font-medium mb-2 flex items-center">
                      <FileJson className="h-4 w-4 mr-2" />
                      Result
                    </h3>
                    <pre className="bg-gray-50 p-4 rounded-md text-sm overflow-auto">
                      {JSON.stringify(execution.result, null, 2)}
                    </pre>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}