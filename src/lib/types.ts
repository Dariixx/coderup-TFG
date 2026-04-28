export interface StrapiMediaFormat {
  url: string;
  width?: number;
  height?: number;
}

export interface StrapiMedia {
  id?: number;
  url: string;
  alternativeText?: string | null;
  caption?: string | null;
  width?: number | null;
  height?: number | null;
  formats?: Record<string, StrapiMediaFormat>;
}

export interface SEO {
  metaTitle: string;
  metaDescription: string;
  canonicalURL?: string;
  keywords?: string[];
  ogImage?: StrapiMedia | null;
}

export interface Instructor {
  id: number | string;
  name: string;
  role: string;
  bio: string;
  avatar?: StrapiMedia | null;
}

export type CourseAccessType = "free" | "premium";
export type OrderStatus = "completed";
export type EnrollmentStatus = "active" | "completed";
export type DiscountType = "percentage";

export interface Category {
  id: number | string;
  name: string;
  slug: string;
  description: string;
  icon: string;
  count?: number;
  seo?: SEO;
}

export interface Tag {
  id: number | string;
  name: string;
  slug: string;
}

export interface Course {
  id: number | string;
  slug: string;
  title: string;
  description: string;
  shortDescription: string;
  category: Category;
  level: string;
  price: number;
  isFree: boolean;
  accessType: CourseAccessType;
  rating: number;
  students: number;
  duration: string;
  lessons: number;
  featured?: boolean;
  icon: string;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
  cover?: StrapiMedia | null;
  instructor: Instructor;
  seo: SEO;
}

export interface BlogCategory {
  id: number | string;
  name: string;
  slug: string;
  description: string;
}

export interface BlogPost {
  id: number | string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  publishedAt: string;
  readingTime: number;
  author: string;
  category: BlogCategory;
  tags: Tag[];
  icon: string;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
  cover?: StrapiMedia | null;
  seo: SEO;
}

export interface StrapiCollectionResponse<T> {
  data: T[];
  meta?: Record<string, unknown>;
}

export interface User {
  id: string;
  name: string;
  email: string;
  isNewUser: boolean;
  usedWelcomeCoupon: boolean;
  createdAt: string;
}

export interface StoredUser extends User {
  password: string;
}

export interface CartItem {
  courseId: string;
  slug: string;
  title: string;
  price: number;
  isFree: boolean;
  accessType: CourseAccessType;
  icon: string;
  iconColor: string;
  gradientFrom: string;
  gradientTo: string;
  category: string;
}

export interface Coupon {
  code: string;
  discountType: DiscountType;
  discountValue: number;
  onlyNewUsers: boolean;
  maxUses: number;
  active: boolean;
}

export interface AppliedCoupon {
  code: string;
  discountAmount: number;
}

export interface OrderItem {
  courseId: string;
  title: string;
  priceAtPurchase: number;
  slug: string;
}

export interface Order {
  id: string;
  orderNumber: string;
  userId: string;
  items: OrderItem[];
  subtotal: number;
  discount: number;
  total: number;
  status: OrderStatus;
  couponCode?: string;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  courseTitle: string;
  courseSlug: string;
  progress: number;
  status: EnrollmentStatus;
  enrolledAt: string;
  lastLesson: string;
}
