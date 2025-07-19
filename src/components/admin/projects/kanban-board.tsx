'use client';

import { useState, useEffect } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Calendar, 
  Clock, 
  Plus, 
  MoreVertical, 
  Edit, 
  Trash2,
  AlertCircle
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { PRIORITY_COLORS } from '@/lib/constants';
import { Priority } from '@/types';
import { formatDate } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface KanbanBoardProps {
  projects: any[];
  onProjectClick: (project: any) => void;
  onAddProject: () => void;
  onEditProject: (project: any) => void;
  onDeleteProject: (project: any) => void;
  onStatusChange: (projectId: string, newStatus: string) => Promise<void>;
}

interface Column {
  id: string;
  title: string;
  projects: any[];
}

export function KanbanBoard({
  projects,
  onProjectClick,
  onAddProject,
  onEditProject,
  onDeleteProject,
  onStatusChange,
}: KanbanBoardProps) {
  const { toast } = useToast();
  const [columns, setColumns] = useState<Column[]>([]);
  const [loading, setLoading] = useState(false);

  // Initialize columns with projects
  useEffect(() => {
    const initialColumns: Column[] = [
      {
        id: 'PLANNING',
        title: 'Planning',
        projects: projects.filter(project => project.status === 'PLANNING'),
      },
      {
        id: 'IN_PROGRESS',
        title: 'In Progress',
        projects: projects.filter(project => project.status === 'IN_PROGRESS'),
      },
      {
        id: 'REVIEW',
        title: 'Review',
        projects: projects.filter(project => project.status === 'REVIEW'),
      },
      {
        id: 'COMPLETED',
        title: 'Completed',
        projects: projects.filter(project => project.status === 'COMPLETED'),
      },
      {
        id: 'ON_HOLD',
        title: 'On Hold',
        projects: projects.filter(project => project.status === 'ON_HOLD'),
      },
    ];
    
    setColumns(initialColumns);
  }, [projects]);

  // Handle drag and drop
  const handleDragEnd = async (result: any) => {
    const { destination, source, draggableId } = result;

    // If there's no destination or the item was dropped back into the same position
    if (!destination || 
        (destination.droppableId === source.droppableId && 
         destination.index === source.index)) {
      return;
    }

    // Find the project that was dragged
    const projectId = draggableId;
    const newStatus = destination.droppableId;

    // Update columns optimistically
    const sourceColumn = columns.find(col => col.id === source.droppableId);
    const destColumn = columns.find(col => col.id === destination.droppableId);
    
    if (!sourceColumn || !destColumn) return;

    const project = sourceColumn.projects.find(p => p.id === projectId);
    if (!project) return;

    // Create new columns array
    const newColumns = columns.map(col => {
      // Remove from source column
      if (col.id === source.droppableId) {
        return {
          ...col,
          projects: col.projects.filter(p => p.id !== projectId),
        };
      }
      
      // Add to destination column
      if (col.id === destination.droppableId) {
        const newProjects = [...col.projects];
        newProjects.splice(destination.index, 0, { ...project, status: newStatus });
        return {
          ...col,
          projects: newProjects,
        };
      }
      
      return col;
    });
    
    setColumns(newColumns);
    
    // Update project status in the backend
    setLoading(true);
    try {
      await onStatusChange(projectId, newStatus);
    } catch (error) {
      console.error('Failed to update project status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project status',
        variant: 'destructive',
      });
      
      // Revert to original state
      setColumns(columns);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex gap-4 overflow-x-auto pb-4 h-full">
          {columns.map(column => (
            <div key={column.id} className="flex-shrink-0 w-80">
              <div className="bg-muted rounded-lg p-4 h-full flex flex-col">
                <div className="flex justify-between items-center mb-4">
                  <h3 className="font-semibold text-lg">{column.title}</h3>
                  <Badge variant="outline">{column.projects.length}</Badge>
                </div>
                
                <Droppable droppableId={column.id}>
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.droppableProps}
                      className="flex-1 overflow-y-auto"
                    >
                      {column.projects.map((project, index) => (
                        <Draggable
                          key={project.id}
                          draggableId={project.id}
                          index={index}
                          isDragDisabled={loading}
                        >
                          {(provided, snapshot) => (
                            <div
                              ref={provided.innerRef}
                              {...provided.draggableProps}
                              {...provided.dragHandleProps}
                              className="mb-3"
                            >
                              <Card className={`${snapshot.isDragging ? 'shadow-lg' : ''} hover:shadow-md transition-shadow`}>
                                <CardContent className="p-4">
                                  <div className="flex justify-between items-start">
                                    <h4
                                      className="font-medium text-base cursor-pointer hover:text-primary transition-colors line-clamp-2"
                                      onClick={() => onProjectClick(project)}
                                    >
                                      {project.title}
                                    </h4>
                                    <DropdownMenu>
                                      <DropdownMenuTrigger asChild>
                                        <Button variant="ghost" size="icon" className="h-8 w-8">
                                          <MoreVertical className="h-4 w-4" />
                                        </Button>
                                      </DropdownMenuTrigger>
                                      <DropdownMenuContent align="end">
                                        <DropdownMenuItem onClick={() => onEditProject(project)}>
                                          <Edit className="mr-2 h-4 w-4" />
                                          Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                          className="text-destructive"
                                          onClick={() => onDeleteProject(project)}
                                        >
                                          <Trash2 className="mr-2 h-4 w-4" />
                                          Delete
                                        </DropdownMenuItem>
                                      </DropdownMenuContent>
                                    </DropdownMenu>
                                  </div>
                                  
                                  <div className="mt-2 text-sm text-muted-foreground line-clamp-2">
                                    {project.description}
                                  </div>
                                  
                                  <div className="mt-3 flex items-center justify-between">
                                    <Badge className={PRIORITY_COLORS[project.priority as Priority]}>
                                      {project.priority}
                                    </Badge>
                                    
                                    <div className="flex items-center text-xs text-muted-foreground">
                                      <Calendar className="h-3 w-3 mr-1" />
                                      {formatDate(project.startDate)}
                                    </div>
                                  </div>
                                  
                                  {project.deadline && (
                                    <div className="mt-2 flex items-center justify-end text-xs">
                                      <Clock className="h-3 w-3 mr-1" />
                                      <span className={
                                        new Date(project.deadline) < new Date() 
                                          ? 'text-destructive' 
                                          : 'text-muted-foreground'
                                      }>
                                        Due: {formatDate(project.deadline)}
                                        {new Date(project.deadline) < new Date() && (
                                          <AlertCircle className="inline-block ml-1 h-3 w-3 text-destructive" />
                                        )}
                                      </span>
                                    </div>
                                  )}
                                  
                                  <div className="mt-3 flex items-center">
                                    <div className="text-xs text-muted-foreground">
                                      Client: {project.client.name}
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            </div>
                          )}
                        </Draggable>
                      ))}
                      {provided.placeholder}
                      
                      {column.id === 'PLANNING' && (
                        <Button
                          variant="ghost"
                          className="w-full mt-2 border border-dashed border-muted-foreground/30"
                          onClick={onAddProject}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Add Project
                        </Button>
                      )}
                    </div>
                  )}
                </Droppable>
              </div>
            </div>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
}