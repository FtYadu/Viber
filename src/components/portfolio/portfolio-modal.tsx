'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  ExternalLink, 
  Github, 
  X, 
  ChevronLeft, 
  ChevronRight,
  Calendar,
  Tag,
  Globe
} from 'lucide-react';
import { PortfolioItem } from '@prisma/client';

interface PortfolioModalProps {
  item: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
  onNext?: () => void;
  onPrevious?: () => void;
  hasNext?: boolean;
  hasPrevious?: boolean;
}

export function PortfolioModal({
  item,
  isOpen,
  onClose,
  onNext,
  onPrevious,
  hasNext = false,
  hasPrevious = false,
}: PortfolioModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  // Reset image index when item changes
  useEffect(() => {
    setCurrentImageIndex(0);
    setImageLoaded(false);
  }, [item]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (!isOpen) return;

      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          if (hasPrevious) {
            onPrevious?.();
          } else if (currentImageIndex > 0) {
            setCurrentImageIndex(prev => prev - 1);
          }
          break;
        case 'ArrowRight':
          if (hasNext) {
            onNext?.();
          } else if (item && currentImageIndex < item.images.length - 1) {
            setCurrentImageIndex(prev => prev + 1);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose, onNext, onPrevious, hasNext, hasPrevious, currentImageIndex, item]);

  if (!item) return null;

  const nextImage = () => {
    if (currentImageIndex < item.images.length - 1) {
      setCurrentImageIndex(prev => prev + 1);
      setImageLoaded(false);
    }
  };

  const previousImage = () => {
    if (currentImageIndex > 0) {
      setCurrentImageIndex(prev => prev - 1);
      setImageLoaded(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-hidden p-0">
        <div className="relative">
          {/* Navigation Buttons */}
          <div className="absolute top-4 right-4 z-50 flex gap-2">
            {hasPrevious && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onPrevious}
                className="backdrop-blur-sm bg-background/80"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
            {hasNext && (
              <Button
                variant="secondary"
                size="sm"
                onClick={onNext}
                className="backdrop-blur-sm bg-background/80"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="secondary"
              size="sm"
              onClick={onClose}
              className="backdrop-blur-sm bg-background/80"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] max-h-[80vh] lg:max-h-none">
            {/* Image Section */}
            <div className="relative bg-muted">
              {item.images.length > 0 && (
                <>
                  <div className="relative aspect-video lg:aspect-auto lg:h-full">
                    <Image
                      src={item.images[currentImageIndex]}
                      alt={`${item.title} - Image ${currentImageIndex + 1}`}
                      fill
                      className={`object-cover transition-opacity duration-300 ${
                        imageLoaded ? 'opacity-100' : 'opacity-0'
                      }`}
                      onLoad={() => setImageLoaded(true)}
                      onError={() => {
                        setImageLoaded(true);
                        setImageError(true);
                      }}
                      sizes="(max-width: 1024px) 100vw, 50vw"
                      priority
                    />
                    
                    {/* Image Error State */}
                    {imageError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-muted/50">
                        <div className="text-center p-4">
                          <p className="text-muted-foreground">Image could not be loaded</p>
                        </div>
                      </div>
                    )}
                    
                    {/* Loading State */}
                    {!imageLoaded && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                      </div>
                    )}
                  </div>

                  {/* Image Navigation */}
                  {item.images.length > 1 && (
                    <>
                      {currentImageIndex > 0 && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={previousImage}
                          className="absolute left-4 top-1/2 -translate-y-1/2 backdrop-blur-sm bg-background/80"
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </Button>
                      )}
                      {currentImageIndex < item.images.length - 1 && (
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={nextImage}
                          className="absolute right-4 top-1/2 -translate-y-1/2 backdrop-blur-sm bg-background/80"
                        >
                          <ChevronRight className="h-4 w-4" />
                        </Button>
                      )}

                      {/* Image Indicators */}
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                        {item.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => {
                              setCurrentImageIndex(index);
                              setImageLoaded(false);
                            }}
                            className={`w-2 h-2 rounded-full transition-all ${
                              index === currentImageIndex
                                ? 'bg-white'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </>
              )}
            </div>

            {/* Content Section */}
            <div className="p-8 overflow-y-auto">
              <DialogHeader className="mb-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <Badge variant="outline" className="mb-2">
                      {item.category}
                    </Badge>
                    {item.featured && (
                      <Badge className="ml-2 bg-primary text-primary-foreground">
                        Featured
                      </Badge>
                    )}
                  </div>
                </div>
                
                <DialogTitle className="text-3xl font-bold mb-4">
                  {item.title}
                </DialogTitle>
              </DialogHeader>

              {/* Description */}
              <div className="mb-6">
                <p className="text-muted-foreground leading-relaxed">
                  {item.description}
                </p>
              </div>

              {/* Project Details */}
              <div className="space-y-4 mb-6">
                {/* Category */}
                <div className="flex items-center gap-2 text-sm">
                  <Tag className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Category:</span>
                  <span className="text-muted-foreground">{item.category}</span>
                </div>

                {/* Created Date */}
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="font-medium">Created:</span>
                  <span className="text-muted-foreground">
                    {new Date(item.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              {/* Technologies */}
              <div className="mb-6">
                <h4 className="font-semibold mb-3">Technologies Used</h4>
                <div className="flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <Badge key={tag} variant="secondary">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                {item.liveUrl && (
                  <Button
                    onClick={() => window.open(item.liveUrl!, '_blank')}
                    className="flex-1"
                  >
                    <Globe className="mr-2 h-4 w-4" />
                    View Live Site
                  </Button>
                )}
                {item.githubUrl && (
                  <Button
                    variant="outline"
                    onClick={() => window.open(item.githubUrl!, '_blank')}
                    className="flex-1"
                  >
                    <Github className="mr-2 h-4 w-4" />
                    View Code
                  </Button>
                )}
              </div>

              {/* Additional Info */}
              {(item.liveUrl || item.githubUrl) && (
                <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">
                    💡 Use arrow keys to navigate between projects or images
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}