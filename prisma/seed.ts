import { PrismaClient } from '@prisma/client';
import { portfolioItems } from './seed-data/portfolio-items';
import { cvSections } from './seed-data/cv-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Seed portfolio items
  console.log('Seeding portfolio items...');
  for (const item of portfolioItems) {
    // Check if item already exists by title
    const existingItem = await prisma.portfolioItem.findFirst({
      where: { title: item.title }
    });
    
    if (existingItem) {
      // Update existing item
      await prisma.portfolioItem.update({
        where: { id: existingItem.id },
        data: item,
      });
    } else {
      // Create new item
      await prisma.portfolioItem.create({
        data: item,
      });
    }
  }
  console.log(`Seeded ${portfolioItems.length} portfolio items`);

  // Seed CV sections
  console.log('Seeding CV sections...');
  for (const section of cvSections) {
    // Check if section already exists by title
    const existingSection = await prisma.cVSection.findFirst({
      where: { title: section.title }
    });
    
    if (existingSection) {
      // Update existing section
      await prisma.cVSection.update({
        where: { id: existingSection.id },
        data: section,
      });
    } else {
      // Create new section
      await prisma.cVSection.create({
        data: section,
      });
    }
  }
  console.log(`Seeded ${cvSections.length} CV sections`);

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });