'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { FileUp, X, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { MAX_FILE_SIZE, ALLOWED_FILE_TYPES } from '@/lib/constants';

interface FileUploaderProps {
  projectId: string;
  onUploadComplete: () => void;
}

export function FileUploader({ projectId, onUploadComplete }: FileUploaderProps) {
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    
    if (!file) return;
    
    // Reset states
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);
    
    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      setUploadError(`File size exceeds the limit of ${MAX_FILE_SIZE / (1024 * 1024)}MB`);
      return;
    }
    
    // Validate file type
    if (!ALLOWED_FILE_TYPES.includes(file.type as any)) {
      setUploadError('File type not allowed');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    
    setIsUploading(true);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);
    
    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('projectId', projectId);
      
      // Simulate progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 95) {
            clearInterval(progressInterval);
            return 95;
          }
          return prev + 5;
        });
      }, 100);
      
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });
      
      clearInterval(progressInterval);
      
      const data = await response.json();
      
      if (data.success) {
        setUploadProgress(100);
        setUploadSuccess(true);
        
        toast({
          title: 'Success',
          description: 'File uploaded successfully',
        });
        
        // Reset form
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
        
        // Notify parent
        onUploadComplete();
      } else {
        setUploadError(data.error || 'Failed to upload file');
        setUploadProgress(0);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setUploadError('An unexpected error occurred');
      setUploadProgress(0);
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancel = () => {
    setSelectedFile(null);
    setUploadProgress(0);
    setUploadError(null);
    setUploadSuccess(false);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className="space-y-4">
      {/* File Input */}
      <div className="flex items-center gap-4">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          disabled={isUploading}
        />
        <Button
          variant="outline"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          <FileUp className="mr-2 h-4 w-4" />
          Select File
        </Button>
        {selectedFile && (
          <div className="flex items-center gap-2">
            <span className="text-sm truncate max-w-[200px]">
              {selectedFile.name}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={handleCancel}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Upload Progress */}
      {selectedFile && uploadProgress > 0 && (
        <div className="space-y-2">
          <div className="flex justify-between text-xs">
            <span>{uploadProgress}%</span>
            <span>{Math.round((selectedFile.size * uploadProgress) / 100 / 1024)} KB / {Math.round(selectedFile.size / 1024)} KB</span>
          </div>
          <Progress value={uploadProgress} />
        </div>
      )}

      {/* Upload Error */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Upload Success */}
      {uploadSuccess && (
        <Alert className="bg-green-50 text-green-800 border-green-200">
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>File uploaded successfully</AlertDescription>
        </Alert>
      )}

      {/* Upload Button */}
      {selectedFile && !uploadSuccess && (
        <Button
          onClick={handleUpload}
          disabled={isUploading}
          className="w-full"
        >
          {isUploading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Uploading...
            </>
          ) : (
            <>
              <FileUp className="mr-2 h-4 w-4" />
              Upload File
            </>
          )}
        </Button>
      )}

      {/* File Type Info */}
      <div className="text-xs text-muted-foreground">
        <p>Allowed file types: {ALLOWED_FILE_TYPES.map(type => type.split('/')[1]).join(', ')}</p>
        <p>Maximum file size: {MAX_FILE_SIZE / (1024 * 1024)}MB</p>
      </div>
    </div>
  );
}