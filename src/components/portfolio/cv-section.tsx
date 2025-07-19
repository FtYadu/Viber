'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Download, Briefcase, GraduationCap, Award, Languages, Heart } from 'lucide-react';
import { formatDate } from '@/lib/utils';

interface CVSectionProps {
  className?: string;
}

interface Experience {
  title: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string | null;
  current: boolean;
  description: string;
  achievements: string[];
}

interface Education {
  institution: string;
  degree: string;
  fieldOfStudy: string;
  startDate: string;
  endDate: string;
  description: string;
}

interface Certification {
  name: string;
  issuer: string;
  date: string;
  expires: string | null;
  link: string;
}

interface Language {
  language: string;
  proficiency: string;
}

interface CV {
  id: string;
  name: string;
  title: string;
  email: string;
  phone: string;
  location: string;
  summary: string;
  skills: string[];
  experiences: Experience[];
  education: Education[];
  certifications: Certification[];
  languages: Language[];
  interests: string[];
  pdfUrl: string | null;
}

export function CVSection({ className = '' }: CVSectionProps) {
  const [cv, setCv] = useState<CV | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCV = async () => {
      try {
        const response = await fetch('/api/cv');
        const data = await response.json();
        
        if (data.success) {
          setCv(data.data);
        } else {
          setError(data.error || 'Failed to fetch CV data');
        }
      } catch (error) {
        console.error('Error fetching CV:', error);
        setError('An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchCV();
  }, []);

  const handleDownloadCV = () => {
    // Open the download endpoint in a new tab
    window.open('/api/cv/download', '_blank');
  };

  if (loading) {
    return (
      <section id="cv" className={`py-20 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Curriculum Vitae</h2>
            <p className="text-xl text-muted-foreground">Loading CV data...</p>
          </div>
          <div className="flex justify-center">
            <div className="animate-pulse w-full max-w-4xl">
              <div className="h-8 bg-muted rounded mb-4 w-1/3 mx-auto"></div>
              <div className="h-4 bg-muted rounded mb-8 w-2/3 mx-auto"></div>
              
              {/* Skills */}
              <div className="h-6 bg-muted rounded mb-2 w-1/6"></div>
              <div className="flex flex-wrap gap-2 mb-8">
                {Array.from({ length: 8 }).map((_, i) => (
                  <div key={i} className="h-8 bg-muted rounded w-24"></div>
                ))}
              </div>
              
              {/* Experience */}
              <div className="h-6 bg-muted rounded mb-4 w-1/6"></div>
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="mb-6">
                  <div className="h-5 bg-muted rounded mb-2 w-1/3"></div>
                  <div className="h-4 bg-muted rounded mb-2 w-1/4"></div>
                  <div className="h-4 bg-muted rounded mb-4 w-1/5"></div>
                  <div className="h-4 bg-muted rounded mb-2 w-full"></div>
                  <div className="h-4 bg-muted rounded mb-2 w-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    );
  }

  if (error || !cv) {
    return (
      <section id="cv" className={`py-20 ${className}`}>
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4">Curriculum Vitae</h2>
            <p className="text-xl text-red-500">
              {error || 'CV data not available'}
            </p>
            <Button 
              onClick={() => window.location.reload()}
              className="mt-4"
            >
              Retry
            </Button>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="cv" className={`py-20 ${className}`}>
      <div className="container mx-auto px-4">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          viewport={{ once: true }}
          className="text-center mb-12"
        >
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Curriculum Vitae</h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto mb-6">
            My professional background, experience, and qualifications.
          </p>
          <Button 
            onClick={handleDownloadCV}
            size="lg"
            className="bg-primary hover:bg-primary/90"
          >
            <Download className="mr-2 h-5 w-5" />
            Download CV
          </Button>
        </motion.div>

        {/* CV Content */}
        <div className="max-w-4xl mx-auto">
          {/* Personal Info */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="mb-12 text-center"
          >
            <h1 className="text-3xl font-bold mb-2">{cv.name}</h1>
            <h2 className="text-xl text-muted-foreground mb-4">{cv.title}</h2>
            <p className="text-sm">
              {cv.email} • {cv.phone} • {cv.location}
            </p>
          </motion.div>

          {/* Summary */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center border-b pb-2">
              Professional Summary
            </h3>
            <p className="text-muted-foreground leading-relaxed">
              {cv.summary}
            </p>
          </motion.div>

          {/* Skills */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center border-b pb-2">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {cv.skills.map((skill, index) => (
                <Badge key={index} variant="secondary" className="text-sm py-1">
                  {skill}
                </Badge>
              ))}
            </div>
          </motion.div>

          {/* Experience */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center border-b pb-2">
              <Briefcase className="mr-2 h-5 w-5" />
              Professional Experience
            </h3>
            
            <div className="space-y-8">
              {cv.experiences.map((exp, index) => (
                <Card key={index} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                      <div>
                        <h4 className="text-lg font-semibold">{exp.title}</h4>
                        <p className="text-muted-foreground">
                          {exp.company}, {exp.location}
                        </p>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 md:mt-0 md:text-right">
                        {new Date(exp.startDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })} - {
                          exp.current 
                            ? 'Present' 
                            : new Date(exp.endDate!).toLocaleDateString('en-US', { 
                                month: 'short', 
                                year: 'numeric' 
                              })
                        }
                      </div>
                    </div>
                    
                    <p className="mb-4">{exp.description}</p>
                    
                    {exp.achievements && exp.achievements.length > 0 && (
                      <div>
                        <p className="font-medium mb-2">Key Achievements:</p>
                        <ul className="list-disc pl-5 space-y-1">
                          {exp.achievements.map((achievement, i) => (
                            <li key={i} className="text-sm">{achievement}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Education */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            viewport={{ once: true }}
            className="mb-10"
          >
            <h3 className="text-xl font-semibold mb-4 flex items-center border-b pb-2">
              <GraduationCap className="mr-2 h-5 w-5" />
              Education
            </h3>
            
            <div className="space-y-6">
              {cv.education.map((edu, index) => (
                <Card key={index} className="border-0 shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                      <div>
                        <h4 className="text-lg font-semibold">{edu.institution}</h4>
                        <p className="font-medium">{edu.degree}</p>
                        <p className="text-muted-foreground">{edu.fieldOfStudy}</p>
                      </div>
                      <div className="text-sm text-muted-foreground mt-1 md:mt-0 md:text-right">
                        {new Date(edu.startDate).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })} - {
                          new Date(edu.endDate).toLocaleDateString('en-US', { 
                            month: 'short', 
                            year: 'numeric' 
                          })
                        }
                      </div>
                    </div>
                    
                    {edu.description && (
                      <p className="text-sm mt-2">{edu.description}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>

          {/* Certifications */}
          {cv.certifications && cv.certifications.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.7 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center border-b pb-2">
                <Award className="mr-2 h-5 w-5" />
                Certifications
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {cv.certifications.map((cert, index) => (
                  <Card key={index} className="border-0 shadow-sm">
                    <CardContent className="p-4">
                      <h4 className="font-semibold">{cert.name}</h4>
                      <p className="text-sm text-muted-foreground">
                        {cert.issuer} • Issued {new Date(cert.date).toLocaleDateString('en-US', { 
                          month: 'short', 
                          year: 'numeric' 
                        })}
                      </p>
                      {cert.expires && (
                        <p className="text-xs text-muted-foreground">
                          Expires: {new Date(cert.expires).toLocaleDateString('en-US', { 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </p>
                      )}
                      {cert.link && (
                        <a 
                          href={cert.link} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-xs text-primary hover:underline mt-1 inline-block"
                        >
                          View Certificate
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </motion.div>
          )}

          {/* Languages */}
          {cv.languages && cv.languages.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="mb-10"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center border-b pb-2">
                <Languages className="mr-2 h-5 w-5" />
                Languages
              </h3>
              
              <div className="flex flex-wrap gap-4">
                {cv.languages.map((lang, index) => (
                  <div key={index} className="flex items-center">
                    <span className="font-medium mr-2">{lang.language}:</span>
                    <span className="text-muted-foreground">{lang.proficiency}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {/* Interests */}
          {cv.interests && cv.interests.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.9 }}
              viewport={{ once: true }}
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center border-b pb-2">
                <Heart className="mr-2 h-5 w-5" />
                Interests
              </h3>
              
              <div className="flex flex-wrap gap-2">
                {cv.interests.map((interest, index) => (
                  <Badge key={index} variant="outline" className="text-sm py-1">
                    {interest}
                  </Badge>
                ))}
              </div>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  );
}