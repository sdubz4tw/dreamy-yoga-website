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
  featuredImage: string; // Vercel Blob URL or local path
  date: string;
  category?: string;
  readTime?: string;
  likes?: number;
  status?: "draft" | "published"; // WordPress Post Status
  tags?: string[]; // WordPress Categories/Tags
  isFeatured?: boolean; // Featured toggle to pin posts
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
  authorName?: string; // WordPress Global Author name
  authorBio?: string; // WordPress Global Author bio
  contactEmail?: string; // Email to route leads/inquiries
  leads?: LeadItem[]; // Lead submissions database
  studioName?: string; // Custom Studio name (default 'Elena Yoga')
  hideHero?: boolean; // Toggle for Hero section visibility
  hideAbout?: boolean; // Toggle for About section visibility
  hideOfferings?: boolean; // Toggle for Offerings section visibility
  hidePortfolio?: boolean; // Toggle for Portfolio section visibility
  hideTestimonials?: boolean; // Toggle for Testimonials section visibility
  hideBlog?: boolean; // Toggle for Blog section visibility
}
