import { Prisma } from '@prisma/client';

export const cvSections: Prisma.CVSectionCreateInput[] = [
  {
    title: 'Personal Information',
    content: JSON.stringify({
      name: 'Yadu Krishnan',
      title: 'Full-Stack Developer & Digital Solutions Architect',
      email: 'contact@yadukrishnan.com',
      phone: '+1 (555) 123-4567',
      location: 'San Francisco, CA',
    }),
    order: 1,
  },
  {
    title: 'Summary',
    content: 'Experienced Full-Stack Developer with over 8 years of expertise in building scalable web applications and digital solutions. Specializing in React, Next.js, Node.js, and cloud-native architectures. Passionate about creating elegant, efficient, and user-friendly applications that solve real-world problems.',
    order: 2,
  },
  {
    title: 'Skills',
    content: JSON.stringify([
      'JavaScript/TypeScript',
      'React.js',
      'Next.js',
      'Node.js',
      'Express',
      'PostgreSQL',
      'MongoDB',
      'AWS',
      'Docker',
      'Kubernetes',
      'GraphQL',
      'REST API Design',
      'Tailwind CSS',
      'Framer Motion',
      'CI/CD',
      'Test-Driven Development',
      'Agile Methodologies',
      'System Architecture',
    ]),
    order: 3,
  },
  {
    title: 'Experience',
    content: JSON.stringify([
      {
        title: 'Senior Full-Stack Developer',
        company: 'TechInnovate Solutions',
        location: 'San Francisco, CA',
        startDate: '2021-03-01',
        endDate: null,
        current: true,
        description: 'Lead developer for enterprise-level web applications using Next.js, TypeScript, and AWS. Architected and implemented scalable solutions for clients in fintech, healthcare, and e-commerce sectors.',
        achievements: [
          'Reduced application load time by 60% through performance optimizations and code splitting',
          'Implemented CI/CD pipelines that decreased deployment time by 75%',
          'Mentored junior developers and established coding standards across the team',
          'Designed and implemented a microservices architecture that improved system reliability by 40%'
        ]
      },
      {
        title: 'Full-Stack Developer',
        company: 'WebSphere Technologies',
        location: 'Austin, TX',
        startDate: '2018-06-01',
        endDate: '2021-02-28',
        current: false,
        description: 'Developed and maintained multiple client projects using React, Node.js, and MongoDB. Collaborated with UX designers to implement responsive and accessible user interfaces.',
        achievements: [
          'Built a real-time analytics dashboard that increased client revenue by 25%',
          'Implemented authentication system with multi-factor authentication improving security',
          'Optimized database queries resulting in 50% faster data retrieval',
          'Contributed to open-source projects and represented the company at tech conferences'
        ]
      },
      {
        title: 'Frontend Developer',
        company: 'Digital Creations',
        location: 'Portland, OR',
        startDate: '2016-01-01',
        endDate: '2018-05-30',
        current: false,
        description: 'Created responsive web applications with focus on user experience and performance. Worked with React, Redux, and various CSS frameworks.',
        achievements: [
          'Developed a component library that increased development speed by 35%',
          'Implemented A/B testing framework that improved conversion rates by 20%',
          'Reduced bundle size by 45% through code optimization techniques',
          'Collaborated with marketing team to implement SEO best practices'
        ]
      }
    ]),
    order: 4,
  },
  {
    title: 'Education',
    content: JSON.stringify([
      {
        institution: 'Stanford University',
        degree: 'Master of Science in Computer Science',
        fieldOfStudy: 'Software Engineering',
        startDate: '2014-09-01',
        endDate: '2016-06-30',
        description: 'Focused on distributed systems, cloud computing, and web technologies. Graduated with honors.'
      },
      {
        institution: 'University of California, Berkeley',
        degree: 'Bachelor of Science in Computer Science',
        fieldOfStudy: 'Computer Science',
        startDate: '2010-09-01',
        endDate: '2014-05-30',
        description: 'Coursework in algorithms, data structures, software engineering, and artificial intelligence.'
      }
    ]),
    order: 5,
  },
  {
    title: 'Projects',
    content: JSON.stringify([
      {
        title: 'E-Commerce Platform',
        description: 'A full-featured e-commerce platform built with Next.js, Stripe, and a headless CMS.',
        technologies: ['Next.js', 'React', 'Stripe', 'Tailwind CSS', 'TypeScript'],
        link: 'https://example-ecommerce.com'
      },
      {
        title: 'AI-Powered Content Generator',
        description: 'An application that leverages OpenAI\'s GPT models to generate marketing content, blog posts, and social media captions.',
        technologies: ['React', 'Node.js', 'OpenAI', 'Express', 'MongoDB'],
        link: 'https://ai-content-generator.com'
      },
      {
        title: 'Real Estate Management System',
        description: 'A comprehensive real estate management system for property listings, tenant management, and financial tracking.',
        technologies: ['React', 'Node.js', 'PostgreSQL', 'Google Maps API', 'Docker'],
        link: 'https://realestate-management.com'
      }
    ]),
    order: 6,
  },
  {
    title: 'Certifications',
    content: JSON.stringify([
      {
        name: 'AWS Certified Solutions Architect',
        issuer: 'Amazon Web Services',
        date: '2022-03-15',
        expires: '2025-03-15',
        link: 'https://aws.amazon.com/certification/'
      },
      {
        name: 'Google Cloud Professional Developer',
        issuer: 'Google Cloud',
        date: '2021-07-10',
        expires: '2024-07-10',
        link: 'https://cloud.google.com/certification/cloud-developer'
      },
      {
        name: 'MongoDB Certified Developer',
        issuer: 'MongoDB Inc.',
        date: '2020-11-05',
        expires: null,
        link: 'https://university.mongodb.com/certification'
      }
    ]),
    order: 7,
  },
];