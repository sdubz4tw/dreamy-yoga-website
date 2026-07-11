export interface ServiceItem {
  id: string;
  name: string;
  description: string;
  price: number;
}

export interface YogaContent {
  heroTitle: string;
  heroSubtitle: string;
  aboutBioText: string;
  services: ServiceItem[];
}
