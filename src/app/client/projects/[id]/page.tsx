import { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProjectDetail } from '@/components/client/project-detail';

interface ProjectDetailPageProps {
  params: {
    id: string;
  };
}

export async function generateMetadata({ params }: ProjectDetailPageProps): Promise<Metadata> {
  const session = await auth();
  
  if (!session) {
    return {
      title: 'Project Not Found | Yadu Krishnan',
    };
  }
  
  const project = await db.project.findUnique({
    where: {
      id: params.id,
    },
    include: {
      client: true,
    },
  });
  
  if (!project) {
    return {
      title: 'Project Not Found | Yadu Krishnan',
    };
  }
  
  return {
    title: `${project.title} | Yadu Krishnan`,
    description: project.description,
  };
}

export default async function ProjectDetailPage({ params }: ProjectDetailPageProps) {
  const session = await auth();
  
  if (!session) {
    redirect('/api/auth/signin');
  }
  
  // Get the project with related data
  const project = await db.project.findUnique({
    where: {
      id: params.id,
    },
    include: {
      client: true,
      tasks: {
        orderBy: {
          createdAt: 'desc',
        },
      },
      files: {
        orderBy: {
          createdAt: 'desc',
        },
      },
    },
  });
  
  if (!project) {
    notFound();
  }
  
  // Check if the client has access to this project
  const client = await db.client.findFirst({
    where: {
      user: {
        email: session.user.email,
      },
    },
  });
  
  if (!client || client.id !== project.clientId) {
    redirect('/unauthorized');
  }
  
  return <ProjectDetail project={project} />;
}