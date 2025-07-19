import { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ExternalLink, Github } from "lucide-react";
import Link from "next/link";

// Enable ISR with revalidation every 1 hour (3600 seconds)
export const revalidate = 3600;

// Generate metadata for the page
export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Promise<Metadata> {
  const portfolioItem = await getPortfolioItem(params.slug);

  if (!portfolioItem) {
    return {
      title: "Project Not Found | Yadu Krishnan",
    };
  }

  return {
    title: `${portfolioItem.title} | Yadu Krishnan's Portfolio`,
    description: portfolioItem.description,
  };
}

// Generate static params for all portfolio items
export async function generateStaticParams() {
  try {
    const portfolioItems = await db.portfolioItem.findMany({
      select: { id: true },
    });

    return portfolioItems.map((item) => ({
      slug: item.id,
    }));
  } catch (error) {
    // Return empty array if database is not available (e.g., during build without DB)
    console.warn('Database not available during build, skipping static params generation');
    return [];
  }
}

// Helper function to get portfolio item
async function getPortfolioItem(slug: string) {
  return db.portfolioItem.findUnique({
    where: { id: slug },
  });
}

export default async function PortfolioItemPage({
  params,
}: {
  params: { slug: string };
}) {
  const portfolioItem = await getPortfolioItem(params.slug);

  if (!portfolioItem) {
    notFound();
  }

  return (
    <main className="container mx-auto py-12">
      <div className="mb-8">
        <Button variant="ghost" asChild>
          <Link href="/portfolio">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Portfolio
          </Link>
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-2">
        <div>
          {portfolioItem.images.length > 0 && (
            <div className="rounded-lg overflow-hidden">
              <OptimizedImage
                src={portfolioItem.images[0]}
                alt={portfolioItem.title}
                width={600}
                height={400}
                className="w-full h-auto"
              />
            </div>
          )}

          {portfolioItem.images.length > 1 && (
            <div className="grid grid-cols-3 gap-4 mt-4">
              {portfolioItem.images.slice(1, 4).map((image, index) => (
                <div key={index} className="rounded-lg overflow-hidden">
                  <OptimizedImage
                    src={image}
                    alt={`${portfolioItem.title} - Image ${index + 2}`}
                    width={200}
                    height={150}
                    className="w-full h-auto"
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h1 className="text-3xl font-bold mb-4">{portfolioItem.title}</h1>
          
          <div className="flex flex-wrap gap-2 mb-4">
            <span className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm">
              {portfolioItem.category}
            </span>
            
            {portfolioItem.tags.map((tag) => (
              <span
                key={tag}
                className="bg-secondary/20 text-secondary-foreground px-3 py-1 rounded-full text-sm"
              >
                {tag}
              </span>
            ))}
          </div>

          <div className="prose max-w-none mb-6">
            <p>{portfolioItem.description}</p>
          </div>

          <div className="flex flex-wrap gap-4">
            {portfolioItem.liveUrl && (
              <Button asChild>
                <a
                  href={portfolioItem.liveUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="mr-2 h-4 w-4" />
                  View Live
                </a>
              </Button>
            )}
            
            {portfolioItem.githubUrl && (
              <Button variant="outline" asChild>
                <a
                  href={portfolioItem.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Github className="mr-2 h-4 w-4" />
                  View Code
                </a>
              </Button>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}