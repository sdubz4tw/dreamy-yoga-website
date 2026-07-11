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

export interface YogaContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutBioText: string;
  services: ServiceItem[];
  heroImageUrl?: string;
  aboutImageUrl?: string;
  offerings: OfferingItem[];
  portfolio: PortfolioItem[];
}
