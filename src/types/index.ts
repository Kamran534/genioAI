// Core types for the GenioAI application
import React from 'react';

export interface Plan {
  name: string;
  price: string;
  per: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  borderColor: string;
  features: string[];
  cta: string;
  popular: boolean;
}

export interface Testimonial {
  name: string;
  role: string;
  company: string;
  content: string;
  image: string;
  likes: number;
  comments: number;
  rating: number;
}

export interface Tool {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
}

export interface Brand {
  name: string;
  Icon: React.ComponentType<{ className?: string }>;
  colorClass: string;
}

export interface NewsletterFormData {
  email: string;
}

export interface NewsletterState {
  email: string;
  isSubscribed: boolean;
  isLoading: boolean;
  error: string | null;
}

// API response types (for future backend integration)
export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface NewsletterSubscriptionResponse {
  success: boolean;
  message: string;
}

// Component prop types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Animation types
export interface AnimationProps {
  delay?: number;
  duration?: number;
  direction?: 'up' | 'down' | 'left' | 'right';
}

// Community types
export interface CommunityAuthor {
  name: string;
  avatar: string;
  verified: boolean;
}

export interface CommunityImage {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  author: CommunityAuthor;
  likes: number;
  downloads: number;
  views: number;
  tags: string[];
  createdAt: string;
  isLiked: boolean;
  category: string;
}

export interface CommunityFilters {
  category: string;
  sortBy: string;
  searchQuery: string;
  viewMode: 'grid' | 'list';
}

export interface UploadImageData {
  title: string;
  description: string;
  tags: string[];
  category: string;
  file: File | null;
}