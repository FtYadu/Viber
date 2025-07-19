"use client";

import { useState, useEffect } from "react";
import { PortfolioItem } from "@prisma/client";
import { OptimizedImage } from "@/components/ui/optimized-image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";
import { useInView } from "react-intersection-observer";

interface PortfolioGalleryProps {
  items: PortfolioItem[];
  categories?: string[];
  onItemClick?: (item: PortfolioItem) => void;
  loading?: boolean;
}

export function PortfolioGallery({ 
  items, 
  categories = ["Web", "Mobile", "Design", "Branding"], 
  onItemClick,
  loading = false 
}: PortfolioGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [visibleItems, setVisibleItems] = useState<PortfolioItem[]>([]);
  const [itemsToShow, setItemsToShow] = useState(6);
  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: false,
  });

  // Filter items based on selected category
  const filteredItems = selectedCategory === "all"
    ? items
    : items.filter((item) => item.category === selectedCategory);

  // Update visible items when filtered items or itemsToShow changes
  useEffect(() => {
    setVisibleItems(filteredItems.slice(0, itemsToShow));
  }, [filteredItems, itemsToShow]);

  // Load more items when the load more button comes into view
  useEffect(() => {
    if (inView && visibleItems.length < filteredItems.length) {
      setItemsToShow((prev) => Math.min(prev + 6, filteredItems.length));
    }
  }, [inView, filteredItems.length, visibleItems.length]);

  return (
    <div className="space-y-8">
      <Tabs
        defaultValue="all"
        value={selectedCategory}
        onValueChange={setSelectedCategory}
        className="w-full"
      >
        <TabsList className="flex flex-wrap justify-center mb-8">
          <TabsTrigger value="all">All</TabsTrigger>
          {categories.map((category) => (
            <TabsTrigger key={category} value={category}>
              {category}
            </TabsTrigger>
          ))}
        </TabsList>
      </Tabs>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="overflow-hidden h-full">
              <div className="aspect-video bg-muted animate-pulse" />
              <CardContent className="p-4">
                <div className="h-6 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded mb-2" />
                <div className="h-4 bg-muted animate-pulse rounded w-2/3" />
                <div className="flex gap-2 mt-3">
                  <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                  <div className="h-5 w-16 bg-muted animate-pulse rounded-full" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.3 }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {visibleItems.map((item) => (
              <motion.div
                key={item.id}
                layout
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ duration: 0.3 }}
              >
                {onItemClick ? (
                  <Card 
                    className="overflow-hidden h-full hover:shadow-lg transition-shadow cursor-pointer" 
                    onClick={() => onItemClick(item)}
                  >
                    <div className="aspect-video overflow-hidden">
                      <OptimizedImage
                        src={item.images[0] || "/images/placeholder.jpg"}
                        alt={item.title}
                        width={400}
                        height={225}
                        className="w-full h-full object-cover transition-transform hover:scale-105"
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {item.description}
                      </p>
                      <div className="flex flex-wrap gap-2 mt-3">
                        <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                          {item.category}
                        </span>
                        {item.tags.slice(0, 2).map((tag) => (
                          <span
                            key={tag}
                            className="bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full text-xs"
                          >
                            {tag}
                          </span>
                        ))}
                        {item.tags.length > 2 && (
                          <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                            +{item.tags.length - 2}
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Link href={`/portfolio/${item.id}`}>
                    <Card className="overflow-hidden h-full hover:shadow-lg transition-shadow">
                      <div className="aspect-video overflow-hidden">
                        <OptimizedImage
                          src={item.images[0] || "/images/placeholder.jpg"}
                          alt={item.title}
                          width={400}
                          height={225}
                          className="w-full h-full object-cover transition-transform hover:scale-105"
                        />
                      </div>
                      <CardContent className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {item.description}
                        </p>
                        <div className="flex flex-wrap gap-2 mt-3">
                          <span className="bg-primary/10 text-primary px-2 py-0.5 rounded-full text-xs">
                            {item.category}
                          </span>
                          {item.tags.slice(0, 2).map((tag) => (
                            <span
                              key={tag}
                              className="bg-secondary/20 text-secondary-foreground px-2 py-0.5 rounded-full text-xs"
                            >
                              {tag}
                            </span>
                          ))}
                          {item.tags.length > 2 && (
                            <span className="bg-muted text-muted-foreground px-2 py-0.5 rounded-full text-xs">
                              +{item.tags.length - 2}
                            </span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )}
              </motion.div>
            ))}
          </motion.div>
        </AnimatePresence>
      )}

      {!loading && visibleItems.length < filteredItems.length && (
        <div className="flex justify-center mt-8" ref={ref}>
          <Button
            onClick={() => setItemsToShow((prev) => prev + 6)}
            variant="outline"
            size="lg"
          >
            Load More
          </Button>
        </div>
      )}
    </div>
  );
}