'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Plus, Save, Trash, Upload } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

export default function AdminCVPage() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [cv, setCv] = useState<any>(null);
  const [newSkill, setNewSkill] = useState('');
  const [newInterest, setNewInterest] = useState('');

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const response = await fetch('/api/cv');
        const data = await response.json();
        
        if (data.success) {
          setCv(data.data);
        } else {
          toast({
            title: 'Error',
            description: data.error || 'Failed to fetch CV data',
            variant: 'destructive',
          });
        }
      } catch (error) {
        console.error('Error fetching CV:', error);
        toast({
          title: 'Error',
          description: 'An unexpected error occurred',
          variant: 'destructive',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, [toast]);

  const handleInputChange = (field: string, value: any) => {
    setCv((prev: any) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleAddSkill = () => {
    if (!newSkill.trim()) return;
    
    setCv((prev: any) => ({
      ...prev,
      skills: [...prev.skills, newSkill.trim()],
    }));
    
    setNewSkill('');
  };

  const handleRemoveSkill = (index: number) => {
    setCv((prev: any) => ({
      ...prev,
      skills: prev.skills.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleAddInterest = () => {
    if (!newInterest.trim()) return;
    
    setCv((prev: any) => ({
      ...prev,
      interests: [...prev.interests, newInterest.trim()],
    }));
    
    setNewInterest('');
  };

  const handleRemoveInterest = (index: number) => {
    setCv((prev: any) => ({
      ...prev,
      interests: prev.interests.filter((_: any, i: number) => i !== index),
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    
    try {
      const response = await fetch('/api/cv', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(cv),
      });
      
      const data = await response.json();
      
      if (data.success) {
        toast({
          title: 'Success',
          description: 'CV data saved successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to save CV data',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error saving CV:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  const handleUploadPDF = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const response = await fetch('/api/cv/upload', {
        method: 'POST',
        body: formData,
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCv((prev: any) => ({
          ...prev,
          pdfUrl: data.url,
        }));
        
        toast({
          title: 'Success',
          description: 'CV PDF uploaded successfully',
        });
      } else {
        toast({
          title: 'Error',
          description: data.error || 'Failed to upload CV PDF',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error uploading CV PDF:', error);
      toast({
        title: 'Error',
        description: 'An unexpected error occurred',
        variant: 'destructive',
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!cv) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center h-64">
          <h2 className="text-2xl font-bold mb-4">CV Data Not Found</h2>
          <p className="text-muted-foreground mb-4">No CV data is available. Create a new CV?</p>
          <Button>Create New CV</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">CV Management</h1>
        <div className="flex gap-4">
          <Button
            variant="outline"
            onClick={() => window.open('/api/cv/download', '_blank')}
          >
            Preview PDF
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {/* Personal Information */}
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={cv.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="title">Professional Title</Label>
                <Input
                  id="title"
                  value={cv.title}
                  onChange={(e) => handleInputChange('title', e.target.value)}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={cv.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={cv.phone}
                  onChange={(e) => handleInputChange('phone', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={cv.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>
            </div>
            <div>
              <Label htmlFor="summary">Professional Summary</Label>
              <Textarea
                id="summary"
                rows={4}
                value={cv.summary}
                onChange={(e) => handleInputChange('summary', e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Skills */}
        <Card>
          <CardHeader>
            <CardTitle>Skills</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {cv.skills.map((skill: string, index: number) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="px-3 py-1 text-sm flex items-center gap-2"
                >
                  {skill}
                  <button
                    type="button"
                    onClick={() => handleRemoveSkill(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add a skill..."
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddSkill();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddSkill}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Interests */}
        <Card>
          <CardHeader>
            <CardTitle>Interests</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 mb-4">
              {cv.interests.map((interest: string, index: number) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="px-3 py-1 text-sm flex items-center gap-2"
                >
                  {interest}
                  <button
                    type="button"
                    onClick={() => handleRemoveInterest(index)}
                    className="text-muted-foreground hover:text-destructive transition-colors"
                  >
                    <Trash className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add an interest..."
                value={newInterest}
                onChange={(e) => setNewInterest(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddInterest();
                  }
                }}
              />
              <Button
                type="button"
                onClick={handleAddInterest}
                variant="outline"
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* PDF Upload */}
        <Card>
          <CardHeader>
            <CardTitle>CV PDF</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              {cv.pdfUrl ? (
                <div className="flex items-center gap-4">
                  <span className="text-sm text-muted-foreground">Current PDF: </span>
                  <a
                    href={cv.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    View PDF
                  </a>
                </div>
              ) : (
                <p className="text-sm text-muted-foreground mb-4">
                  No PDF uploaded. The system will generate one automatically when users download the CV.
                </p>
              )}
            </div>
            <div className="flex items-center gap-4">
              <Label htmlFor="pdf-upload" className="cursor-pointer">
                <div className="flex items-center gap-2 px-4 py-2 border rounded-md hover:bg-muted transition-colors">
                  <Upload className="h-4 w-4" />
                  <span>Upload Custom PDF</span>
                </div>
                <input
                  id="pdf-upload"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleUploadPDF}
                />
              </Label>
              {cv.pdfUrl && (
                <Button
                  variant="outline"
                  onClick={() => handleInputChange('pdfUrl', null)}
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Remove PDF
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}