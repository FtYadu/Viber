"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useInView } from "react-intersection-observer";
import { CSVImageData } from "@/lib/utils/csv-parser";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Search, 
  X, 
  Download, 
  Heart, 
  Share2, 
  ZoomIn,
  Filter,
  Grid3X3,
  List,
  Shuffle
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ModernImageGalleryProps {
  images: CSVImageData[];
  className?: string;
}

type ViewMode = 'grid' | 'masonry' | 'list';
type SortMode = 'random' | 'filename' | 'recent';

export function ModernImageGallery({ images, className }: ModernImageGalleryProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedImage, setSelectedImage] = useState<CSVImageData | null>(null);
  const [likedImages, setLikedImages] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('masonry');
  const [sortMode, setSortMode] = useState<SortMode>('random');
  const [visibleCount, setVisibleCount] = useState(24);
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Filter and sort images
  const filteredAndSortedImages = useMemo(() => {
    let filtered = images.filter(image => 
      image.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
      image.caption.toLowerCase().includes(searchTerm.toLowerCase())
    );

    switch (sortMode) {
      case 'filename':
        filtered = filtered.sort((a, b) => a.filename.localeCompare(b.filename));
        break;
      case 'random':
        filtered = filtered.sort(() => Math.random() - 0.5);
        break;
      default:
        break;
    }

    return filtered;
  }, [images, searchTerm, sortMode]);

  const visibleImages = useMemo(() => 
    filteredAndSortedImages.slice(0, visibleCount),
    [filteredAndSortedImages, visibleCount]
  );

  // Load more when scrolling
  useEffect(() => {
    if (inView && visibleCount < filteredAndSortedImages.length) {
      setVisibleCount(prev => Math.min(prev + 12, filteredAndSortedImages.length));
    }
  }, [inView, filteredAndSortedImages.length, visibleCount]);

  const toggleLike = useCallback((filename: string) => {
    setLikedImages(prev => {
      const newSet = new Set(prev);
      if (newSet.has(filename)) {
        newSet.delete(filename);
      } else {
        newSet.add(filename);
      }
      return newSet;
    });
  }, []);

  const handleImageClick = useCallback((image: CSVImageData) => {
    setSelectedImage(image);
  }, []);

  const handleShare = useCallback(async (image: CSVImageData) => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: image.filename,
          text: image.caption,
          url: image.imageurl,
        });
      } catch (err) {
        console.log('Error sharing:', err);
      }
    } else {
      navigator.clipboard.writeText(image.imageurl);
    }
  }, []);

  const handleDownload = useCallback((image: CSVImageData) => {
    const link = document.createElement('a');
    link.href = image.imageurl;
    link.download = image.filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }, []);

  const shuffleImages = useCallback(() => {
    setSortMode('random');
    setVisibleCount(24);
  }, []);

  return (
    <div className={cn("space-y-6", className)}>
      {/* Header Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search images by name or caption..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSearchTerm("")}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            onClick={shuffleImages}
          >
            <Shuffle className="w-4 h-4 mr-2" />
            Shuffle
          </Button>

          <div className="flex items-center border rounded-md">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="rounded-r-none"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'masonry' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('masonry')}
              className="rounded-none"
            >
              <div className="w-4 h-4 grid grid-cols-2 gap-0.5">
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
                <div className="bg-current rounded-sm"></div>
              </div>
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="rounded-l-none"
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Filter Panel */}
      <AnimatePresence>
        {isFilterOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="border rounded-lg p-4 space-y-4"
          >
            <div className="flex flex-wrap gap-2">
              <span className="text-sm font-medium">Sort by:</span>
              {(['random', 'filename', 'recent'] as SortMode[]).map((mode) => (
                <Badge
                  key={mode}
                  variant={sortMode === mode ? 'default' : 'outline'}
                  className="cursor-pointer"
                  onClick={() => setSortMode(mode)}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </Badge>
              ))}
            </div>
            
            <div className="text-sm text-muted-foreground">
              Showing {visibleImages.length} of {filteredAndSortedImages.length} images
              {likedImages.size > 0 && ` • ${likedImages.size} liked`}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gallery Grid */}
      <motion.div
        layout
        className={cn(
          "gap-4",
          viewMode === 'grid' && "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6",
          viewMode === 'masonry' && "columns-2 sm:columns-3 md:columns-4 lg:columns-5 xl:columns-6 space-y-4",
          viewMode === 'list' && "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3"
        )}
      >
        <AnimatePresence mode="popLayout">
          {visibleImages.map((image, index) => (
            <motion.div
              key={`${image.filename}-${index}`}
              layout
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ 
                duration: 0.3, 
                delay: index * 0.02,
                layout: { duration: 0.3 }
              }}
              className={cn(
                "group relative",
                viewMode === 'masonry' && "break-inside-avoid mb-4",
                viewMode === 'list' && "flex"
              )}
            >
              <Card className={cn(
                "overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-xl",
                viewMode === 'list' && "flex-row"
              )}>
                <div 
                  className={cn(
                    "relative overflow-hidden",
                    viewMode === 'grid' && "aspect-square",
                    viewMode === 'masonry' && "aspect-auto",
                    viewMode === 'list' && "w-32 h-32 flex-shrink-0"
                  )}
                  onClick={() => handleImageClick(image)}
                >
                  <img
                    src={image.imageurl}
                    alt={image.caption || image.filename}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                    loading="lazy"
                  />
                  
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <div className="flex gap-2">
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleImageClick(image);
                        }}
                      >
                        <ZoomIn className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleLike(image.filename);
                        }}
                      >
                        <Heart 
                          className={cn(
                            "w-4 h-4",
                            likedImages.has(image.filename) && "fill-red-500 text-red-500"
                          )} 
                        />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleShare(image);
                        }}
                      >
                        <Share2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        className="h-8 w-8 p-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownload(image);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Like indicator */}
                  {likedImages.has(image.filename) && (
                    <div className="absolute top-2 right-2">
                      <Heart className="w-5 h-5 fill-red-500 text-red-500" />
                    </div>
                  )}
                </div>

                {/* Caption */}
                {viewMode !== 'grid' && image.caption && (
                  <div className={cn(
                    "p-3",
                    viewMode === 'list' && "flex-1 flex flex-col justify-center"
                  )}>
                    <h3 className="font-medium text-sm line-clamp-2">{image.filename}</h3>
                    {image.caption && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {image.caption}
                      </p>
                    )}
                  </div>
                )}
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </motion.div>

      {/* Load More */}
      {visibleCount < filteredAndSortedImages.length && (
        <div ref={loadMoreRef} className="flex justify-center py-8">
          <Button
            variant="outline"
            onClick={() => setVisibleCount(prev => prev + 24)}
            className="px-8"
          >
            Load More ({filteredAndSortedImages.length - visibleCount} remaining)
          </Button>
        </div>
      )}

      {/* Image Modal */}
      <AnimatePresence>
        {selectedImage && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
            onClick={() => setSelectedImage(null)}
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              className="relative max-w-4xl max-h-[90vh] bg-white rounded-lg overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <Button
                variant="ghost"
                size="sm"
                className="absolute top-2 right-2 z-10 bg-black/50 text-white hover:bg-black/70"
                onClick={() => setSelectedImage(null)}
              >
                <X className="w-4 h-4" />
              </Button>
              
              <img
                src={selectedImage.imageurl}
                alt={selectedImage.caption || selectedImage.filename}
                className="w-full h-auto max-h-[70vh] object-contain"
              />
              
              <div className="p-4 space-y-2">
                <h3 className="font-semibold">{selectedImage.filename}</h3>
                {selectedImage.caption && (
                  <p className="text-sm text-muted-foreground">{selectedImage.caption}</p>
                )}
                
                <div className="flex gap-2 pt-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleLike(selectedImage.filename)}
                  >
                    <Heart 
                      className={cn(
                        "w-4 h-4 mr-2",
                        likedImages.has(selectedImage.filename) && "fill-red-500 text-red-500"
                      )} 
                    />
                    {likedImages.has(selectedImage.filename) ? 'Liked' : 'Like'}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleShare(selectedImage)}
                  >
                    <Share2 className="w-4 h-4 mr-2" />
                    Share
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDownload(selectedImage)}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
