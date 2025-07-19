'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/hooks/use-toast';
import { Mail, MessageSquare, Phone, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

interface ClientSupportProps {
  client: any; // Using any for now, but should be properly typed
}

export function ClientSupport({ client }: ClientSupportProps) {
  const [activeTab, setActiveTab] = useState('contact');
  const [formData, setFormData] = useState({
    subject: '',
    message: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');
    
    try {
      // In a real implementation, this would send data to an API endpoint
      // For now, we'll simulate a successful submission after a delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Reset form
      setFormData({
        subject: '',
        message: '',
      });
      
      setSubmitStatus('success');
      toast({
        title: 'Message Sent',
        description: 'Your support request has been submitted successfully.',
        variant: 'default',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setErrorMessage('Failed to send message. Please try again later.');
      toast({
        title: 'Error',
        description: 'Failed to send message. Please try again later.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl font-bold mb-2">Support Center</h2>
                <p className="text-muted-foreground">
                  Get help with your projects and services
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
      
      {/* Support Tabs */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs
          defaultValue="contact"
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-6">
            <TabsTrigger value="contact">Contact Support</TabsTrigger>
            <TabsTrigger value="faq">FAQ</TabsTrigger>
          </TabsList>
          
          {/* Contact Support Tab */}
          <TabsContent value="contact">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Contact Info */}
              <Card className="md:col-span-1">
                <CardHeader>
                  <CardTitle>Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Mail className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Email</h3>
                      <a
                        href="mailto:support@yadukrishnan.com"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        support@yadukrishnan.com
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <Phone className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Phone</h3>
                      <a
                        href="tel:+15551234567"
                        className="text-muted-foreground hover:text-primary transition-colors"
                      >
                        +1 (555) 123-4567
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <div className="bg-primary/10 p-3 rounded-full mr-4">
                      <MessageSquare className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-medium mb-1">Live Chat</h3>
                      <p className="text-muted-foreground">
                        Available Monday-Friday
                        <br />
                        9:00 AM - 5:00 PM PST
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Contact Form */}
              <Card className="md:col-span-2">
                <CardHeader>
                  <CardTitle>Send a Message</CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Form Status Alerts */}
                    {submitStatus === 'success' && (
                      <Alert className="bg-green-50 text-green-800 border-green-200">
                        <CheckCircle className="h-4 w-4 mr-2" />
                        <AlertDescription>
                          Your message has been sent successfully! We'll get back to you soon.
                        </AlertDescription>
                      </Alert>
                    )}
                    
                    {submitStatus === 'error' && (
                      <Alert className="bg-red-50 text-red-800 border-red-200">
                        <AlertCircle className="h-4 w-4 mr-2" />
                        <AlertDescription>{errorMessage}</AlertDescription>
                      </Alert>
                    )}
                    
                    {/* Client Info (Pre-filled) */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="name">Name</Label>
                        <Input
                          id="name"
                          value={client.name}
                          disabled
                          className="bg-muted/30"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={client.email}
                          disabled
                          className="bg-muted/30"
                        />
                      </div>
                    </div>
                    
                    {/* Subject Field */}
                    <div className="space-y-2">
                      <Label htmlFor="subject">Subject</Label>
                      <Input
                        id="subject"
                        name="subject"
                        placeholder="What's this about?"
                        value={formData.subject}
                        onChange={handleChange}
                        required
                      />
                    </div>
                    
                    {/* Message Field */}
                    <div className="space-y-2">
                      <Label htmlFor="message">Message</Label>
                      <Textarea
                        id="message"
                        name="message"
                        placeholder="How can we help you?"
                        value={formData.message}
                        onChange={handleChange}
                        required
                        className="min-h-[150px]"
                      />
                    </div>
                    
                    {/* Submit Button */}
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Send Message
                        </>
                      )}
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
          
          {/* FAQ Tab */}
          <TabsContent value="faq">
            <Card>
              <CardHeader>
                <CardTitle>Frequently Asked Questions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div className="border-b pb-4">
                    <h3 className="font-medium mb-2">How do I view my project status?</h3>
                    <p className="text-muted-foreground">
                      You can view your project status by navigating to the Projects section in your client portal. 
                      Click on any project to see detailed information including progress, tasks, and files.
                    </p>
                  </div>
                  
                  <div className="border-b pb-4">
                    <h3 className="font-medium mb-2">How do I pay an invoice?</h3>
                    <p className="text-muted-foreground">
                      To pay an invoice, go to the Invoices section and find the invoice you want to pay. 
                      Click on the "Pay Now" button and follow the secure payment process. We accept all major credit cards.
                    </p>
                  </div>
                  
                  <div className="border-b pb-4">
                    <h3 className="font-medium mb-2">Can I download my invoices?</h3>
                    <p className="text-muted-foreground">
                      Yes, you can download any invoice as a PDF. Simply go to the Invoices section, 
                      find the invoice you want to download, and click on the download button.
                    </p>
                  </div>
                  
                  <div className="border-b pb-4">
                    <h3 className="font-medium mb-2">How do I request changes to my project?</h3>
                    <p className="text-muted-foreground">
                      If you need to request changes to your project, please use the Contact Support form 
                      with details about the changes you'd like to make. Our team will review your request 
                      and get back to you promptly.
                    </p>
                  </div>
                  
                  <div className="border-b pb-4">
                    <h3 className="font-medium mb-2">What are your business hours?</h3>
                    <p className="text-muted-foreground">
                      Our support team is available Monday through Friday, 9:00 AM to 5:00 PM Pacific Standard Time. 
                      For urgent matters outside of business hours, please email support@yadukrishnan.com.
                    </p>
                  </div>
                </div>
                
                <div className="bg-muted/30 p-4 rounded-md">
                  <h3 className="font-medium mb-2">Still have questions?</h3>
                  <p className="text-muted-foreground mb-4">
                    If you couldn't find the answer to your question, please don't hesitate to contact us directly.
                  </p>
                  <Button onClick={() => setActiveTab('contact')}>
                    Contact Support
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </div>
  );
}