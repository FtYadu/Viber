'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { ArrowDown, Download, Mail } from 'lucide-react';
import Link from 'next/link';

interface HeroSectionProps {
  name?: string;
  title?: string;
  description?: string;
  videoUrl?: string;
  ctaText?: string;
  onCTAClick?: () => void;
}

export function HeroSection({
  name = "Yadu Krishnan",
  title = "Full-Stack Developer & Digital Solutions Architect",
  description = "Crafting exceptional web experiences and scalable business solutions with modern technologies. Specializing in React, Next.js, and cloud-native applications.",
  videoUrl = "",
  ctaText = "View My Work",
  onCTAClick
}: HeroSectionProps) {
  const [isVideoLoaded, setIsVideoLoaded] = useState(false);
  const [showFallback, setShowFallback] = useState(false);

  useEffect(() => {
    // Fallback to gradient background if video fails to load
    const timer = setTimeout(() => {
      if (!isVideoLoaded) {
        setShowFallback(true);
      }
    }, 3000);

    return () => clearTimeout(timer);
  }, [isVideoLoaded]);

  const scrollToPortfolio = () => {
    const portfolioSection = document.getElementById('portfolio');
    if (portfolioSection) {
      portfolioSection.scrollIntoView({ behavior: 'smooth' });
    }
    onCTAClick?.();
  };

  const handleContactClick = () => {
    const contactSection = document.getElementById('contact');
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
      {/* Video Background */}
      {!showFallback && videoUrl && (
        <div className="absolute inset-0 z-0">
          <video
            autoPlay
            muted
            loop
            playsInline
            className="w-full h-full object-cover"
            onLoadedData={() => setIsVideoLoaded(true)}
            onError={() => setShowFallback(true)}
          >
            <source src={videoUrl} type="video/mp4" />
          </video>
          {/* Video Overlay */}
          <div className="absolute inset-0 bg-black/50" />
        </div>
      )}

      {/* Fallback Gradient Background */}
      {showFallback && (
        <div className="absolute inset-0 z-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20" />
      )}

      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="max-w-4xl mx-auto"
        >
          {/* Name */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-5xl md:text-7xl font-bold mb-4 text-white drop-shadow-lg"
          >
            {name}
          </motion.h1>

          {/* Title */}
          <motion.h2
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="text-xl md:text-2xl font-medium mb-6 text-white/90 drop-shadow-md"
          >
            {title}
          </motion.h2>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.8 }}
            className="text-lg md:text-xl mb-8 text-white/80 max-w-2xl mx-auto leading-relaxed drop-shadow-sm"
          >
            {description}
          </motion.p>

          {/* CTA Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 1.0 }}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-12"
          >
            <Button
              size="lg"
              onClick={scrollToPortfolio}
              className="bg-primary hover:bg-primary/90 text-primary-foreground px-8 py-3 text-lg font-medium shadow-lg hover:shadow-xl transition-all duration-300"
            >
              {ctaText}
              <ArrowDown className="ml-2 h-5 w-5" />
            </Button>
            
            <Link href="/portfolio">
              <Button
                variant="outline"
                size="lg"
                className="border-primary/50 text-primary bg-white/10 hover:bg-white/20 hover:border-primary/70 px-8 py-3 text-lg font-medium backdrop-blur-sm shadow-lg"
              >
                🎨 Visual Gallery
                <span className="ml-2 text-sm bg-primary/20 px-2 py-0.5 rounded-full">2000+</span>
              </Button>
            </Link>
            
            <Button
              variant="outline"
              size="lg"
              onClick={handleContactClick}
              className="border-white/30 text-white hover:bg-white/10 hover:border-white/50 px-8 py-3 text-lg font-medium backdrop-blur-sm"
            >
              <Mail className="mr-2 h-5 w-5" />
              Get In Touch
            </Button>
          </motion.div>

          {/* Scroll Indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.2 }}
            className="flex flex-col items-center text-white/60"
          >
            <span className="text-sm mb-2 font-medium">Scroll to explore</span>
            <motion.div
              animate={{ y: [0, 10, 0] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            >
              <ArrowDown className="h-6 w-6" />
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute inset-0 z-5 pointer-events-none">
        {/* Floating particles or geometric shapes can be added here */}
        <motion.div
          animate={{
            x: [0, 100, 0],
            y: [0, -50, 0],
            rotate: [0, 180, 360],
          }}
          transition={{
            duration: 20,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-1/4 left-1/4 w-4 h-4 bg-white/10 rounded-full"
        />
        <motion.div
          animate={{
            x: [0, -80, 0],
            y: [0, 60, 0],
            rotate: [0, -180, -360],
          }}
          transition={{
            duration: 25,
            repeat: Infinity,
            ease: "linear",
          }}
          className="absolute top-3/4 right-1/3 w-6 h-6 bg-white/5 rounded-full"
        />
      </div>
    </section>
  );
}