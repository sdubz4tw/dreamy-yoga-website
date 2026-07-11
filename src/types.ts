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
  category: string; // 'Studio' | 'Classes' | 'Workshops'
}

export interface TestimonialItem {
  id: string;
  clientName: string;
  quote: string;
  rating: number; // e.g., 1-5
  source: string; // e.g., '1-on-1 Client', 'Workshop Cohort'
}

export interface BlogPostItem {
  id: string;
  title: string;
  excerpt: string;
  content: string; // Main post body
  featuredImage: string; // Vercel Blob URL or empty
  date: string;
  category?: string;  // NEW
  readTime?: string;  // NEW
  likes?: number;     // NEW
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
}
