export type EventType =
  | 'Wedding'
  | 'Birthday'
  | 'BabyShower'
  | 'Housewarming'
  | 'Custom';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
}

export interface AppNotification {
  id: string;
  eventId: string;
  eventTitle: string;
  threshold: number;
  title: string;
  body: string;
  isRead: boolean;
  createdAt: string;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

export interface EventSummary {
  id: string;
  title: string;
  type: EventType;
  eventDate: string | null;
  slug: string;
  totalItems: number;
  coveredItems: number;
  reservedByMe: number | null;
}

export interface OwnerItem {
  id: string;
  title: string;
  description: string | null;
  imageUrl: string | null;
  store: string | null;
  price: number | null;
  currency: string | null;
  purchaseLink: string | null;
  priority: number;
}

export interface OwnerEvent {
  id: string;
  title: string;
  type: EventType;
  eventDate: string | null;
  slug: string;
  totalItems: number;
  coveredItems: number;
  items: OwnerItem[];
}

export interface GuestItem {
  id: string;
  title: string;
  store: string | null;
  imageUrl: string | null;
  price: number | null;
  currency: string | null;
  purchaseLink: string | null;
  isReserved: boolean;
  reservedByMe: boolean;
}

export interface LinkPreview {
  title: string | null;
  imageUrl: string | null;
  store: string | null;
  price: number | null;
  currency: string | null;
}

export interface GuestEvent {
  slug: string;
  title: string;
  type: EventType;
  eventDate: string | null;
  ownerName: string;
  totalItems: number;
  chosenItems: number;
  items: GuestItem[];
}

export interface CreateItemInput {
  title: string;
  description?: string | null;
  imageUrl?: string | null;
  store?: string | null;
  price?: number | null;
  currency?: string | null;
  purchaseLink?: string | null;
  priority: number;
}
