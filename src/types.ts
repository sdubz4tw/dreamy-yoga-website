export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface OfferingItem {
  id: string;
  title: string;
  price: number;
  description: string;
  image: string;
}

export interface PortfolioItem {
  id: string;
  title: string;
  image: string;
  category: string;
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  quote: string;
  rating: number;
  source: string;
}

export interface BlogPostItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  featuredImage: string;
  date: string;
  category?: string;
  readTime?: string;
  likes?: number;
  status?: "draft" | "published";
  tags?: string[];
  isFeatured?: boolean;
}

export interface LeadItem {
  id: string;
  name: string;
  email: string;
  message: string;
  timestamp: string;
  status: "New" | "Read";
}

export interface YogaContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutBioText: string;
  services: ServiceItem[];
  heroImageUrl?: string;
  aboutImageUrl?: string;
  offerings: OfferingItem[];
  portfolio: PortfolioItem[];
  testimonials: TestimonialItem[];
  blogPosts: BlogPostItem[];
  authorName?: string;
  authorBio?: string;
  contactEmail?: string;
  leads?: LeadItem[];
  studioName?: string;

  // Section visibility toggles
  hideHero?: boolean;
  hideAbout?: boolean;
  hideOfferings?: boolean;
  hidePortfolio?: boolean;
  hideTestimonials?: boolean;
  hideBlog?: boolean;

  // Theme color design tokens
  themePrimary?: string;    // Primary accent / button color
  themeBackground?: string; // Main page background
  themeCard?: string;       // Card/panel background
  themeText?: string;       // Primary text color
  themeAccent?: string;     // Sage/accent secondary color

  // Ambient audio settings
  audioEnabled?: boolean;
  audioPreset?: "tibetan-bowl" | "sacred-gong" | "peace-chimes";

  // Contact section portrait
  contactPortraitUrl?: string;

  // Footer social media
  socialEnabled?: boolean;
  socialInstagram?: string;
  socialFacebook?: string;
  socialYoutube?: string;
}
