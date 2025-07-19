'use client';

import { useState, useEffect } from 'react';
import { HeroSection } from '@/components/portfolio/hero-section';
import { PortfolioGallery } from '@/components/portfolio/portfolio-gallery';
import { PortfolioModal } from '@/components/portfolio/portfolio-modal';
import { ContactSection } from '@/components/portfolio/contact-section';
import { PortfolioItem } from '@prisma/client';

export default function Home() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  // Fetch portfolio items
  useEffect(() => {
    const fetchPortfolioItems = async () => {
      try {
        const response = await fetch('/api/portfolio');
        const data = await response.json();
        
        if (data.success) {
          setPortfolioItems(data.data);
        }
      } catch (error) {
        console.error('Failed to fetch portfolio items:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPortfolioItems();
  }, []);

  const handleItemClick = (item: PortfolioItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedItem(null);
  };

  const handleNext = () => {
    if (!selectedItem) return;
    
    const currentIndex = portfolioItems.findIndex(item => item.id === selectedItem.id);
    const nextIndex = (currentIndex + 1) % portfolioItems.length;
    setSelectedItem(portfolioItems[nextIndex]);
  };

  const handlePrevious = () => {
    if (!selectedItem) return;
    
    const currentIndex = portfolioItems.findIndex(item => item.id === selectedItem.id);
    const previousIndex = currentIndex === 0 ? portfolioItems.length - 1 : currentIndex - 1;
    setSelectedItem(portfolioItems[previousIndex]);
  };

  const currentIndex = selectedItem ? portfolioItems.findIndex(item => item.id === selectedItem.id) : -1;
  const hasNext = currentIndex < portfolioItems.length - 1;
  const hasPrevious = currentIndex > 0;

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <HeroSection 
        videoUrl="/videos/hero-background.mp4"
        name="Yadu Krishnan"
        title="Full-Stack Developer & Digital Solutions Architect"
        description="Crafting exceptional web experiences and scalable business solutions with modern technologies. Specializing in React, Next.js, and cloud-native applications."
        ctaText="View My Work"
      />
      
      {/* Portfolio Gallery */}
      <PortfolioGallery
        items={portfolioItems}
        onItemClick={handleItemClick}
        loading={loading}
      />

      {/* Contact Section */}
      <ContactSection 
        email="contact@yadukrishnan.com"
        phone="+1 (555) 123-4567"
        location="San Francisco, CA"
      />

      {/* Portfolio Modal */}
      <PortfolioModal
        item={selectedItem}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onNext={handleNext}
        onPrevious={handlePrevious}
        hasNext={hasNext}
        hasPrevious={hasPrevious}
      />
    </main>
  );
}
