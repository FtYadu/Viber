#!/usr/bin/env tsx

import { readFileSync } from 'fs';
import { join } from 'path';
import { parse } from 'csv-parse/sync';
import { portfolioRepository } from '../src/lib/db/repositories';
import { logger } from '../src/lib/logger';

interface CSVRow {
  filename: string;
  imageurl: string;
  caption: string;
}

// Portfolio categories for random assignment
const CATEGORIES = [
  'Portrait Photography',
  'Lifestyle Photography', 
  'Event Photography',
  'Commercial Photography',
  'Street Photography',
  'Fashion Photography',
  'Nature Photography',
  'Creative Photography'
];

// Common photography tags
const PHOTOGRAPHY_TAGS = [
  'portrait', 'lifestyle', 'commercial', 'creative', 'professional',
  'outdoor', 'indoor', 'natural-light', 'studio', 'candid',
  'fashion', 'beauty', 'editorial', 'documentary', 'artistic',
  'color', 'black-and-white', 'vibrant', 'moody', 'bright',
  'composition', 'lighting', 'depth-of-field', 'bokeh', 'sharp'
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

function getRandomCategory(): string {
  return CATEGORIES[Math.floor(Math.random() * CATEGORIES.length)];
}

function getRandomTags(count: number = 3): string[] {
  const shuffled = shuffleArray(PHOTOGRAPHY_TAGS);
  return shuffled.slice(0, count);
}

function generateTitle(caption: string, index: number): string {
  // Clean up the caption to create a title
  const cleanCaption = caption
    .replace(/^a (man|woman|person|couple|little boy|little girl)/, '')
    .replace(/^an? /, '')
    .trim();
  
  if (cleanCaption.length > 3) {
    // Capitalize first letter and create a more descriptive title
    const title = cleanCaption.charAt(0).toUpperCase() + cleanCaption.slice(1);
    return title.length > 50 ? title.substring(0, 47) + '...' : title;
  }
  
  // Fallback to generic title with index
  return `Portfolio Image ${index + 1}`;
}

function generateDescription(caption: string): string {
  // Create a more detailed description from the caption
  const descriptions = [
    `A captivating photograph featuring ${caption}. This image showcases professional photography techniques with careful attention to composition and lighting.`,
    `Professional photography capturing ${caption}. The image demonstrates skilled use of natural lighting and thoughtful composition.`,
    `An artistic photograph showing ${caption}. This piece highlights the photographer's eye for detail and creative vision.`,
    `A stunning portrait featuring ${caption}. The image exemplifies professional photography with excellent technical execution.`,
    `Creative photography showcasing ${caption}. This work demonstrates mastery of lighting, composition, and visual storytelling.`
  ];
  
  return descriptions[Math.floor(Math.random() * descriptions.length)];
}

async function populatePortfolio() {
  try {
    logger.info('Starting portfolio population...');
    
    // Read and parse CSV file
    const csvPath = join(process.cwd(), 'Embeded Links (1).csv');
    const csvContent = readFileSync(csvPath, 'utf-8');
    const records: CSVRow[] = parse(csvContent, {
      columns: true,
      skip_empty_lines: true,
    });
    
    logger.info(`Found ${records.length} images in CSV file`);
    
    // Clear existing portfolio items
    const existingItems = await portfolioRepository.findMany();
    for (const item of existingItems) {
      await portfolioRepository.delete(item.id);
    }
    logger.info(`Cleared ${existingItems.length} existing portfolio items`);
    
    // Shuffle the records for random order
    const shuffledRecords = shuffleArray(records);
    
    // Take a subset of images (let's use 50-100 for a good portfolio size)
    const selectedRecords = shuffledRecords.slice(0, 80);
    
    // Create portfolio items
    const portfolioItems = [];
    
    for (let i = 0; i < selectedRecords.length; i++) {
      const record = selectedRecords[i];
      
      // Skip if image URL is invalid
      if (!record.imageurl || !record.imageurl.startsWith('http')) {
        continue;
      }
      
      const portfolioItem = {
        title: generateTitle(record.caption, i),
        description: generateDescription(record.caption),
        category: getRandomCategory(),
        tags: getRandomTags(Math.floor(Math.random() * 3) + 2), // 2-4 tags
        images: [record.imageurl],
        featured: Math.random() < 0.15, // 15% chance of being featured
        order: i,
      };
      
      portfolioItems.push(portfolioItem);
    }
    
    // Insert portfolio items in batches
    const batchSize = 10;
    let created = 0;
    
    for (let i = 0; i < portfolioItems.length; i += batchSize) {
      const batch = portfolioItems.slice(i, i + batchSize);
      
      for (const item of batch) {
        try {
          await portfolioRepository.create(item);
          created++;
          
          if (created % 10 === 0) {
            logger.info(`Created ${created}/${portfolioItems.length} portfolio items...`);
          }
        } catch (error) {
          logger.error(`Failed to create portfolio item: ${item.title}`, error);
        }
      }
    }
    
    logger.info(`✅ Successfully created ${created} portfolio items`);
    
    // Log some statistics
    const categories = await portfolioRepository.getAllCategories();
    const tags = await portfolioRepository.getAllTags();
    const featured = await portfolioRepository.findFeatured();
    
    logger.info(`📊 Portfolio Statistics:`);
    logger.info(`   - Total items: ${created}`);
    logger.info(`   - Categories: ${categories.length} (${categories.join(', ')})`);
    logger.info(`   - Unique tags: ${tags.length}`);
    logger.info(`   - Featured items: ${featured.length}`);
    
  } catch (error) {
    logger.error('Failed to populate portfolio:', error);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  populatePortfolio()
    .then(() => {
      logger.info('Portfolio population completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      logger.error('Portfolio population failed:', error);
      process.exit(1);
    });
}

export { populatePortfolio };