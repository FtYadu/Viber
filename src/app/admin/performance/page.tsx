import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { PerformanceOptimizer } from "@/components/admin/performance-optimizer";

export const dynamic = "force-dynamic"; // No caching for performance page

export default async function PerformancePage() {
  const session = await getServerSession(authOptions);
  
  if (!session || session.user.role !== "ADMIN") {
    notFound();
  }

  return (
    <div className="container mx-auto py-8">
      <PerformanceOptimizer />
    </div>
  );
}