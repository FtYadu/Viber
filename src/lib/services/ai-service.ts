import { AIGenerateContentRequest, AIGenerateContentResponse } from '@/types';
import { logger } from '@/lib/logger';

// Mock AI API for development
// In production, this would be replaced with a real AI API client (e.g., OpenAI, Anthropic, etc.)
class AIClient {
  private apiKey: string;
  private baseUrl: string;
  private rateLimitPerMinute: number;
  private requestCount: Map<string, number>;
  private lastResetTime: number;

  constructor(apiKey: string, baseUrl: string, rateLimitPerMinute: number = 10) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
    this.rateLimitPerMinute = rateLimitPerMinute;
    this.requestCount = new Map();
    this.lastResetTime = Date.now();
  }

  private checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const oneMinute = 60 * 1000;
    
    // Reset rate limit counters if it's been more than a minute
    if (now - this.lastResetTime > oneMinute) {
      this.requestCount.clear();
      this.lastResetTime = now;
    }
    
    // Check if the IP has exceeded the rate limit
    const count = this.requestCount.get(ip) || 0;
    if (count >= this.rateLimitPerMinute) {
      return false;
    }
    
    // Increment the request count for this IP
    this.requestCount.set(ip, count + 1);
    return true;
  }

  async generateContent(
    request: AIGenerateContentRequest,
    ip: string = '127.0.0.1'
  ): Promise<AIGenerateContentResponse> {
    // Check rate limit
    if (!this.checkRateLimit(ip)) {
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    // In development, generate mock responses
    if (process.env.NODE_ENV === 'development') {
      logger.info('AI content generation request:', request);
      
      // Generate different mock responses based on the request type
      let content = '';
      
      switch (request.type) {
        case 'caption':
          content = this.generateMockCaption(request.prompt);
          break;
        case 'email':
          content = this.generateMockEmail(request.prompt, request.context);
          break;
        case 'content':
          content = this.generateMockContent(request.prompt, request.context);
          break;
        default:
          throw new Error(`Unsupported content type: ${request.type}`);
      }
      
      return {
        content,
        usage: {
          inputTokens: Math.floor(request.prompt.length / 4),
          outputTokens: Math.floor(content.length / 4),
          totalTokens: Math.floor((request.prompt.length + content.length) / 4),
        },
      };
    }

    // In production, call the actual AI API
    try {
      // This would be the actual API call in production
      // const response = await fetch(`${this.baseUrl}/generate`, {
      //   method: 'POST',
      //   headers: {
      //     'Content-Type': 'application/json',
      //     'Authorization': `Bearer ${this.apiKey}`,
      //   },
      //   body: JSON.stringify(request),
      // });
      
      // if (!response.ok) {
      //   throw new Error(`AI API error: ${response.statusText}`);
      // }
      
      // const data = await response.json();
      // return data;
      
      // For now, return a mock response
      return this.generateMockResponse(request);
    } catch (error) {
      logger.error('Error calling AI API:', error);
      throw error;
    }
  }
  
  private generateMockCaption(prompt: string): string {
    const captions = [
      "Elevate your digital presence with our cutting-edge web solutions.",
      "Transforming ideas into seamless digital experiences.",
      "Where innovation meets functionality in the digital landscape.",
      "Crafting digital solutions that drive real business results.",
      "Pixel-perfect designs with powerful functionality.",
      "Bringing your vision to life with modern web technologies.",
      "Elevate your brand with our custom digital solutions.",
      "Innovative web development for forward-thinking businesses.",
      "Seamless user experiences that convert visitors into customers.",
      "Digital craftsmanship for the modern web.",
    ];
    
    // Use the prompt to "influence" which caption we return
    const index = Math.abs(prompt.length % captions.length);
    return captions[index];
  }
  
  private generateMockEmail(prompt: string, context?: string): string {
    const greeting = "Dear [Client Name],";
    
    const bodies = [
      "I hope this email finds you well. I wanted to follow up on our recent discussion about your project. We've made significant progress and I'm excited to share the latest updates with you.",
      "Thank you for your recent inquiry about our web development services. I'd be delighted to discuss how we can help bring your vision to life and create a stunning online presence for your business.",
      "I'm writing to provide you with an update on your project. We've completed the initial design phase and are ready to move forward with development. I'd love to schedule a call to review the designs and get your feedback.",
      "I wanted to touch base regarding the upcoming deadline for your project. We're on track to deliver as scheduled, but I wanted to check if you have any questions or concerns before we finalize everything.",
      "Thank you for your patience as we've been working on your project. I'm pleased to inform you that we've completed the requested revisions and the updated version is now ready for your review.",
    ];
    
    const closings = [
      "Please let me know if you have any questions or need any clarification. I'm here to help!\n\nBest regards,\nYadu Krishnan",
      "I look forward to your feedback and am excited about moving forward with this project.\n\nWarm regards,\nYadu Krishnan",
      "Don't hesitate to reach out if you need anything else. I'm always happy to assist.\n\nThank you,\nYadu Krishnan",
      "I'm available for a call this week if you'd like to discuss any aspects of the project in more detail.\n\nBest wishes,\nYadu Krishnan",
      "I value your partnership and am committed to ensuring your complete satisfaction with our work.\n\nSincerely,\nYadu Krishnan",
    ];
    
    // Use the prompt and context to "influence" which parts we return
    const bodyIndex = Math.abs((prompt.length + (context?.length || 0)) % bodies.length);
    const closingIndex = Math.abs(prompt.length % closings.length);
    
    return `${greeting}\n\n${bodies[bodyIndex]}\n\n${closings[closingIndex]}`;
  }
  
  private generateMockContent(prompt: string, context?: string): string {
    const paragraphs = [
      "In today's rapidly evolving digital landscape, having a strong online presence is no longer optional—it's essential. Businesses of all sizes are recognizing the need to invest in professional web development services to stay competitive and meet the expectations of their increasingly tech-savvy customers.",
      "Web development encompasses a wide range of services, from creating simple static pages to building complex web applications. The process typically involves front-end development (what users see and interact with) and back-end development (the server-side logic that powers the website). A well-executed web development project seamlessly integrates both aspects to create a cohesive and functional digital experience.",
      "User experience (UX) design plays a crucial role in modern web development. It focuses on creating websites that are not only visually appealing but also intuitive and easy to navigate. Good UX design considers the user's journey through the website, ensuring that they can find the information they need quickly and complete desired actions with minimal friction.",
      "Responsive design has become a standard practice in web development, ensuring that websites function properly across all devices, from desktop computers to smartphones and tablets. With mobile internet usage surpassing desktop usage, having a mobile-friendly website is critical for reaching and engaging with your audience effectively.",
      "E-commerce functionality has transformed the way businesses sell products and services online. From secure payment processing to inventory management, modern e-commerce websites offer a range of features that make online selling accessible to businesses of all sizes. A well-designed e-commerce platform can open up new revenue streams and expand your market reach globally.",
    ];
    
    // Use the prompt and context to "influence" how many paragraphs we return
    const numParagraphs = 1 + Math.abs((prompt.length + (context?.length || 0)) % 4);
    
    let content = '';
    for (let i = 0; i < numParagraphs; i++) {
      const index = (i + Math.abs(prompt.length % paragraphs.length)) % paragraphs.length;
      content += paragraphs[index] + '\n\n';
    }
    
    return content.trim();
  }
  
  private generateMockResponse(request: AIGenerateContentRequest): AIGenerateContentResponse {
    let content = '';
    
    switch (request.type) {
      case 'caption':
        content = this.generateMockCaption(request.prompt);
        break;
      case 'email':
        content = this.generateMockEmail(request.prompt, request.context);
        break;
      case 'content':
        content = this.generateMockContent(request.prompt, request.context);
        break;
      default:
        throw new Error(`Unsupported content type: ${request.type}`);
    }
    
    return {
      content,
      usage: {
        inputTokens: Math.floor(request.prompt.length / 4),
        outputTokens: Math.floor(content.length / 4),
        totalTokens: Math.floor((request.prompt.length + content.length) / 4),
      },
    };
  }
}

// Initialize AI client
const aiClient = new AIClient(
  process.env.OPENAI_API_KEY || 'mock-api-key',
  process.env.OPENAI_API_URL || 'https://api.openai.com/v1',
  parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE || '10')
);

export class AIService {
  /**
   * Generate content using AI
   */
  static async generateContent(
    request: AIGenerateContentRequest,
    ip: string = '127.0.0.1'
  ): Promise<AIGenerateContentResponse> {
    try {
      return await aiClient.generateContent(request, ip);
    } catch (error) {
      logger.error('Error generating AI content:', error);
      throw error;
    }
  }
  
  /**
   * Generate a caption for an image or content
   */
  static async generateCaption(
    prompt: string,
    ip: string = '127.0.0.1'
  ): Promise<string> {
    try {
      const response = await this.generateContent(
        {
          prompt,
          type: 'caption',
        },
        ip
      );
      
      return response.content;
    } catch (error) {
      logger.error('Error generating caption:', error);
      throw error;
    }
  }
  
  /**
   * Generate an email draft
   */
  static async generateEmailDraft(
    prompt: string,
    context?: string,
    ip: string = '127.0.0.1'
  ): Promise<string> {
    try {
      const response = await this.generateContent(
        {
          prompt,
          type: 'email',
          context,
        },
        ip
      );
      
      return response.content;
    } catch (error) {
      logger.error('Error generating email draft:', error);
      throw error;
    }
  }
  
  /**
   * Generate general content
   */
  static async generateGeneralContent(
    prompt: string,
    context?: string,
    ip: string = '127.0.0.1'
  ): Promise<string> {
    try {
      const response = await this.generateContent(
        {
          prompt,
          type: 'content',
          context,
        },
        ip
      );
      
      return response.content;
    } catch (error) {
      logger.error('Error generating general content:', error);
      throw error;
    }
  }
}