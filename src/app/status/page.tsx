import { Metadata } from "next";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { format } from "date-fns";

export const metadata: Metadata = {
  title: "System Status | Yadu Krishnan",
  description: "Real-time status of Yadu Krishnan's portfolio and business platform",
};

// This would typically fetch from UptimeRobot API
const mockStatusData = {
  overall: {
    status: "operational",
    uptime: 99.95,
  },
  services: [
    {
      name: "Website",
      status: "operational",
      uptime: 99.98,
      description: "Main portfolio website",
    },
    {
      name: "Admin Panel",
      status: "operational",
      uptime: 99.95,
      description: "Administrative interface",
    },
    {
      name: "API Services",
      status: "operational",
      uptime: 99.92,
      description: "Backend API endpoints",
    },
    {
      name: "Database",
      status: "operational",
      uptime: 99.99,
      description: "Data storage and retrieval",
    },
  ],
  lastUpdated: new Date().toISOString(),
};

function getStatusIcon(status: string) {
  switch (status) {
    case "operational":
      return <CheckCircle className="h-5 w-5 text-green-500" />;
    case "degraded":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
    case "down":
      return <XCircle className="h-5 w-5 text-red-500" />;
    default:
      return <AlertTriangle className="h-5 w-5 text-gray-500" />;
  }
}

function getStatusBadge(status: string) {
  switch (status) {
    case "operational":
      return <Badge className="bg-green-100 text-green-800 hover:bg-green-100">Operational</Badge>;
    case "degraded":
      return <Badge className="bg-yellow-100 text-yellow-800 hover:bg-yellow-100">Degraded Performance</Badge>;
    case "down":
      return <Badge className="bg-red-100 text-red-800 hover:bg-red-100">Service Outage</Badge>;
    default:
      return <Badge variant="secondary">Unknown</Badge>;
  }
}

export default function StatusPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold mb-4">System Status</h1>
            <p className="text-lg text-muted-foreground">
              Real-time status of Yadu Krishnan's portfolio and business platform
            </p>
          </div>

          {/* Overall Status */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  {getStatusIcon(mockStatusData.overall.status)}
                  <CardTitle className="ml-3">All Systems Operational</CardTitle>
                </div>
                {getStatusBadge(mockStatusData.overall.status)}
              </div>
              <CardDescription>
                Overall uptime: {mockStatusData.overall.uptime}% over the last 30 days
              </CardDescription>
            </CardHeader>
          </Card>

          {/* Individual Services */}
          <div className="space-y-4 mb-8">
            <h2 className="text-2xl font-semibold">Services</h2>
            {mockStatusData.services.map((service) => (
              <Card key={service.name}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      {getStatusIcon(service.status)}
                      <div className="ml-3">
                        <h3 className="font-semibold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      {getStatusBadge(service.status)}
                      <div className="text-sm text-muted-foreground mt-1">
                        {service.uptime}% uptime
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Footer */}
          <div className="text-center text-sm text-muted-foreground">
            <p>
              Last updated: {format(new Date(mockStatusData.lastUpdated), "PPpp")}
            </p>
            <p className="mt-2">
              For support, contact{" "}
              <a href="mailto:admin@yadukrishnan.com" className="text-primary hover:underline">
                admin@yadukrishnan.com
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}