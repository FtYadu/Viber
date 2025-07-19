'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { Loader2, Sparkles, Copy, RefreshCw, Mail } from 'lucide-react';

export function EmailComposer() {
  const [prompt, setPrompt] = useState('');
  const [context, setContext] = useState('');
  const [emailDraft, setEmailDraft] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  
  const handleGenerate = async () => {
    if (!prompt.trim()) {
      toast({
        title: 'Error',
        description: 'Please enter a prompt',
        variant: 'destructive',
      });
      return;
    }
    
    setIsGenerating(true);
    
    try {
      const response = await fetch('/api/ai/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          prompt,
          context: context.trim() ? context : undefined,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate email draft');
      }
      
      const data = await response.json();
      setEmailDraft(data.emailDraft);
    } catch (error) {
      console.error('Error generating email draft:', error);
      toast({
        title: 'Error',
        description: 'Failed to generate email draft',
        variant: 'destructive',
      });
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(emailDraft);
    setIsCopied(true);
    
    toast({
      title: 'Success',
      description: 'Email draft copied to clipboard',
      variant: 'default',
    });
    
    setTimeout(() => {
      setIsCopied(false);
    }, 2000);
  };
  
  const handleReset = () => {
    setPrompt('');
    setContext('');
    setEmailDraft('');
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Mail className="h-5 w-5 mr-2 text-primary" />
          AI Email Composer
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="prompt">What do you want to write about?</Label>
          <Textarea
            id="prompt"
            placeholder="e.g., Write a follow-up email to a client about their website project that's nearing completion"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="context">Additional context (optional)</Label>
          <Textarea
            id="context"
            placeholder="e.g., Client name is John Smith, project is a e-commerce website, deadline is next Friday"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            className="min-h-[100px]"
          />
        </div>
        
        {emailDraft && (
          <div className="space-y-2">
            <Label htmlFor="emailDraft">Generated Email Draft</Label>
            <div className="relative">
              <Textarea
                id="emailDraft"
                value={emailDraft}
                onChange={(e) => setEmailDraft(e.target.value)}
                className="min-h-[200px] pr-10 font-mono text-sm"
              />
              <Button
                variant="ghost"
                size="icon"
                className="absolute top-2 right-2"
                onClick={handleCopy}
                title="Copy to clipboard"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button
          variant="outline"
          onClick={handleReset}
          disabled={isGenerating || (!prompt && !context && !emailDraft)}
        >
          <RefreshCw className="mr-2 h-4 w-4" />
          Reset
        </Button>
        <Button onClick={handleGenerate} disabled={isGenerating || !prompt.trim()}>
          {isGenerating ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 h-4 w-4" />
              Generate Email
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
}