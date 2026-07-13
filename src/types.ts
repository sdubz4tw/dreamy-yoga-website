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
  location?: string;
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

  // ─── Section text labels & copy ───────────────────────────────────────────

  // Navigation
  navCtaLabel?: string;           // Header "Book Session" button

  // Hero section
  heroTagline?: string;           // Small eyebrow label above title
  heroCtaLabel?: string;          // Big CTA button inside hero

  // About section
  aboutTagline?: string;          // Small eyebrow label "The Instructor"
  aboutHeading?: string;          // Large heading "Hi, I am Elena"
  aboutImageSubtitle?: string;    // Overlay caption beneath/over about image
  aboutCtaLabel?: string;         // Link text "Explore Offerings"

  // Offerings / Services section
  offeringsTagline?: string;      // Eyebrow label "Curated Programs"
  offeringsHeading?: string;      // Section heading "Bespoke Offerings"
  offeringsSubtitle?: string;     // Subtitle paragraph
  offeringsCtaLabel?: string;     // Per-card CTA link "Inquire Space"

  // Portfolio / Gallery section
  portfolioTagline?: string;      // Eyebrow label "Visual Sanctuary"
  portfolioHeading?: string;      // Section heading "Portfolio Gallery"

  // Testimonials section
  testimonialsTagline?: string;   // Eyebrow label "Resonance"
  testimonialsHeading?: string;   // Section heading "Client Testimonials"

  // Blog / Journal section
  blogTagline?: string;           // Eyebrow label "Insights"
  blogHeading?: string;           // Section heading "The Philosophy Journal"
  blogSubtitle?: string;          // Intro paragraph under heading

  // Contact / Inquiry section
  contactTagline?: string;        // Eyebrow label "Begin Journey"
  contactHeading?: string;        // Section heading "Book a Session"
  contactSubtitle?: string;       // Intro paragraph under heading
  contactNameLabel?: string;      // Form label "Name"
  contactEmailLabel?: string;     // Form label "Email"
  contactLocationLabel?: string;  // Form label "Location"
  contactMessageLabel?: string;   // Form label "Message or Intentions"
  contactSubmitLabel?: string;    // Submit button text "Send Request"
  contactSuccessTitle?: string;   // Success state heading "Request Transmitted"
  contactSuccessMessage?: string; // Success state body copy

  // Footer
  footerTagline?: string;         // Tagline "Peace • Alignment • Somatic Wisdom"
}
