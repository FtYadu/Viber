import { Metadata } from "next";
import { ModernImageGallery } from "@/components/portfolio/modern-image-gallery";
import { parseCSVData, getRandomImages } from "@/lib/utils/csv-parser";
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Portfolio Gallery | Yadu Krishnan",
  description: "Explore an interactive gallery of 2000+ creative images showcasing design, photography, and visual content",
};

export default async function PortfolioPage() {
  let images: any[] = [];
  
  try {
    // Read the CSV file from the public directory
    const csvPath = path.join(process.cwd(), 'public', 'portfolio-images.csv');
    const csvContent = await fs.readFile(csvPath, 'utf-8');
    
    // Parse CSV data
    const allImages = parseCSVData(csvContent);
    
    // Get a random selection for better performance (can be adjusted)
    images = getRandomImages(allImages, 2000); // Show up to 2000 images
    
    console.log(`Loaded ${images.length} images from CSV`);
  } catch (error) {
    console.error('Error loading CSV data:', error);
    // Fallback to empty array if CSV can't be loaded
    images = [];
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/10">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-transparent to-primary/5" />
        <div className="container mx-auto px-4 py-16 relative">
          <div className="text-center space-y-6">
            <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-primary/80 to-primary/60 bg-clip-text text-transparent">
              Visual Gallery
            </h1>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Discover an interactive collection of {images.length.toLocaleString()}+ stunning images, 
              designs, and creative works. Browse, search, and explore with modern gallery features.
            </p>
            <div className="flex flex-wrap justify-center gap-4 text-sm text-muted-foreground">
              <span className="bg-primary/10 px-3 py-1 rounded-full">✨ Interactive Gallery</span>
              <span className="bg-primary/10 px-3 py-1 rounded-full">🔍 Smart Search</span>
              <span className="bg-primary/10 px-3 py-1 rounded-full">❤️ Like & Share</span>
              <span className="bg-primary/10 px-3 py-1 rounded-full">📱 Responsive Design</span>
            </div>
          </div>
        </div>
      </div>

      {/* Gallery Section */}
      <div className="container mx-auto px-4 pb-16">
        {images.length > 0 ? (
          <ModernImageGallery images={images} />
        ) : (
          <div className="text-center py-16">
            <div className="space-y-4">
              <div className="text-6xl">🎨</div>
              <h2 className="text-2xl font-semibold">Gallery Loading</h2>
              <p className="text-muted-foreground">
                We're preparing your visual experience...
              </p>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}