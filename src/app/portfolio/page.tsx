import { Metadata } from "next";
import { db } from "@/lib/db";
import { PortfolioGallery } from "@/components/portfolio/portfolio-gallery";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Portfolio | Yadu Krishnan",
  description: "Explore Yadu Krishnan's portfolio of web and mobile development projects",
};

// Enable ISR with revalidation every 1 hour (3600 seconds)
export const revalidate = 3600;

export default async function PortfolioPage() {
  // Fetch portfolio items from the database
  const portfolioItems = await db.portfolioItem.findMany({
    orderBy: [
      { featured: "desc" },
      { order: "asc" },
      { createdAt: "desc" },
    ],
  });

  // Get unique categories for filtering
  const categories = Array.from(
    new Set(portfolioItems.map((item) => item.category))
  );

  return (
    <main className="container mx-auto py-12">
      <h1 className="text-4xl font-bold mb-8 text-center">Portfolio</h1>
      <PortfolioGallery items={portfolioItems} categories={categories} />
    </main>
  );
}