'use client';

import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Edit, 
  Trash2, 
  Eye, 
  Calendar, 
  AlertCircle 
} from 'lucide-react';
import { PROJECT_STATUS_COLORS, PRIORITY_COLORS } from '@/lib/constants';
import { ProjectStatus, Priority } from '@/types';
import { formatDate } from '@/lib/utils';

interface ProjectListProps {
  projects: any[];
  onProjectClick: (project: any) => void;
  onEditProject: (project: any) => void;
  onDeleteProject: (project: any) => void;
}

export function ProjectList({
  projects,
  onProjectClick,
  onEditProject,
  onDeleteProject,
}: ProjectListProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Title</TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Start Date</TableHead>
            <TableHead>Deadline</TableHead>
            <TableHead>Tasks</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {projects.map((project) => (
            <TableRow key={project.id}>
              <TableCell className="font-medium">
                <div 
                  className="cursor-pointer hover:text-primary transition-colors"
                  onClick={() => onProjectClick(project)}
                >
                  {project.title}
                </div>
              </TableCell>
              <TableCell>{project.client.name}</TableCell>
              <TableCell>
                <Badge className={PROJECT_STATUS_COLORS[project.status as ProjectStatus]}>
                  {project.status}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge className={PRIORITY_COLORS[project.priority as Priority]}>
                  {project.priority}
                </Badge>
              </TableCell>
              <TableCell>{formatDate(project.startDate)}</TableCell>
              <TableCell>
                {project.deadline ? (
                  <div className="flex items-center">
                    {formatDate(project.deadline)}
                    {new Date(project.deadline) < new Date() && (
                      <AlertCircle className="ml-1 h-4 w-4 text-destructive" />
                    )}
                  </div>
                ) : (
                  '-'
                )}
              </TableCell>
              <TableCell>
                {project.tasks ? project.tasks.length : 0}
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onProjectClick(project)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditProject(project)}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeleteProject(project)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}