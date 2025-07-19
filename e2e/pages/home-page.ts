import { Page, Locator } from '@playwright/test';
import { BasePage } from './base-page';

export class HomePage extends BasePage {
  // Locators
  readonly heroSection: Locator;
  readonly heroTitle: Locator;
  readonly heroDescription: Locator;
  readonly heroVideo: Locator;
  readonly cvSection: Locator;
  readonly downloadCvButton: Locator;
  readonly portfolioSection: Locator;
  readonly portfolioItems: Locator;
  readonly contactSection: Locator;
  readonly chatBubble: Locator;
  readonly navigationMenu: Locator;
  readonly mobileMenuToggle: Locator;

  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.heroSection = page.locator('[data-testid="hero-section"]');
    this.heroTitle = page.locator('[data-testid="hero-title"]');
    this.heroDescription = page.locator('[data-testid="hero-description"]');
    this.heroVideo = page.locator('[data-testid="hero-video"]');
    this.cvSection = page.locator('[data-testid="cv-section"]');
    this.downloadCvButton = page.locator('[data-testid="download-cv-button"]');
    this.portfolioSection = page.locator('[data-testid="portfolio-section"]');
    this.portfolioItems = page.locator('[data-testid="portfolio-item"]');
    this.contactSection = page.locator('[data-testid="contact-section"]');
    this.chatBubble = page.locator('[data-testid="chat-bubble"]');
    this.navigationMenu = page.locator('[data-testid="navigation-menu"]');
    this.mobileMenuToggle = page.locator('[data-testid="mobile-menu-toggle"]');
  }

  // Navigation methods
  async navigateToHome() {
    await this.goto('/');
    await this.waitForLoadState();
  }

  async navigateToPortfolio() {
    await this.clickElement('[data-testid="portfolio-link"]');
    await this.expectUrl('/portfolio');
  }

  async navigateToContact() {
    await this.clickElement('[data-testid="contact-link"]');
    await this.expectUrl('/contact');
  }

  // Hero section interactions
  async verifyHeroSection() {
    await this.expectElementVisible('[data-testid="hero-section"]');
    await this.expectElementVisible('[data-testid="hero-title"]');
    await this.expectElementVisible('[data-testid="hero-description"]');
  }

  async verifyHeroVideo() {
    await this.expectElementVisible('[data-testid="hero-video"]');
    
    // Check if video is playing
    const isPlaying = await this.page.evaluate(() => {
      const video = document.querySelector('[data-testid="hero-video"]') as HTMLVideoElement;
      return video && !video.paused;
    });
    
    return isPlaying;
  }

  // CV section interactions
  async verifyCvSection() {
    await this.expectElementVisible('[data-testid="cv-section"]');
    await this.expectElementVisible('[data-testid="download-cv-button"]');
  }

  async downloadCv() {
    // Set up download handler
    const downloadPromise = this.page.waitForEvent('download');
    
    await this.clickElement('[data-testid="download-cv-button"]');
    
    const download = await downloadPromise;
    return download;
  }

  // Portfolio section interactions
  async verifyPortfolioSection() {
    await this.expectElementVisible('[data-testid="portfolio-section"]');
    
    const itemCount = await this.portfolioItems.count();
    return itemCount;
  }

  async clickPortfolioItem(index: number = 0) {
    await this.portfolioItems.nth(index).click();
  }

  async filterPortfolioByCategory(category: string) {
    await this.clickElement(`[data-testid="filter-${category.toLowerCase()}"]`);
    await this.waitForSelector('[data-testid="portfolio-item"]');
  }

  // Contact section interactions
  async verifyContactSection() {
    await this.expectElementVisible('[data-testid="contact-section"]');
  }

  async fillContactForm(data: {
    name: string;
    email: string;
    message: string;
  }) {
    await this.fillInput('[data-testid="contact-name"]', data.name);
    await this.fillInput('[data-testid="contact-email"]', data.email);
    await this.fillInput('[data-testid="contact-message"]', data.message);
  }

  async submitContactForm() {
    await this.clickElement('[data-testid="contact-submit"]');
    
    // Wait for success message
    await this.waitForSelector('[data-testid="contact-success"]');
  }

  // Chat interactions
  async openChat() {
    await this.expectElementVisible('[data-testid="chat-bubble"]');
    await this.clickElement('[data-testid="chat-bubble"]');
    await this.waitForSelector('[data-testid="chat-window"]');
  }

  async sendChatMessage(message: string) {
    await this.fillInput('[data-testid="chat-input"]', message);
    await this.clickElement('[data-testid="chat-send"]');
    
    // Wait for response
    await this.waitForSelector('[data-testid="chat-message-assistant"]');
  }

  async closeChat() {
    await this.clickElement('[data-testid="chat-close"]');
    await this.expectElementHidden('[data-testid="chat-window"]');
  }

  // Mobile navigation
  async openMobileMenu() {
    if (await this.isMobile()) {
      await this.clickElement('[data-testid="mobile-menu-toggle"]');
      await this.waitForSelector('[data-testid="mobile-menu"]');
    }
  }

  async closeMobileMenu() {
    if (await this.isMobile()) {
      await this.clickElement('[data-testid="mobile-menu-close"]');
      await this.expectElementHidden('[data-testid="mobile-menu"]');
    }
  }

  // Responsive design checks
  async verifyResponsiveDesign() {
    const isMobile = await this.isMobile();
    
    if (isMobile) {
      await this.expectElementVisible('[data-testid="mobile-menu-toggle"]');
      await this.expectElementHidden('[data-testid="desktop-navigation"]');
    } else {
      await this.expectElementHidden('[data-testid="mobile-menu-toggle"]');
      await this.expectElementVisible('[data-testid="desktop-navigation"]');
    }
  }

  // Performance checks
  async checkPagePerformance() {
    const loadTime = await this.measurePageLoad();
    
    // Check if critical elements are visible
    await this.expectElementVisible('[data-testid="hero-section"]');
    await this.expectElementVisible('[data-testid="navigation-menu"]');
    
    return {
      loadTime,
      criticalElementsVisible: true,
    };
  }

  // SEO checks
  async checkSeoElements() {
    const title = await this.page.title();
    const metaDescription = await this.page.getAttribute('meta[name="description"]', 'content');
    const h1Count = await this.page.locator('h1').count();
    
    return {
      title,
      metaDescription,
      h1Count,
      hasTitle: title.length > 0,
      hasMetaDescription: metaDescription !== null,
      hasProperH1Structure: h1Count === 1,
    };
  }
}