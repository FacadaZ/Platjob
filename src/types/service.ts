export type RequestStatus =
  | "pending"
  | "accepted"
  | "in_progress"
  | "completed"
  | "cancelled";

export interface ServiceRequest {
  id: string;
  clientId: string;
  technicianId: string;
  technicianName: string;
  technicianAvatar?: string;
  category: string;
  title: string;
  description: string;
  status: RequestStatus;
  scheduledDate?: string;
  completedDate?: string;
  address: string;
  budget?: number;
  agreedRate?: number;
  createdAt: string;
  updatedAt: string;
}

export interface Review {
  id: string;
  requestId: string;
  clientId: string;
  clientName: string;
  clientAvatar?: string;
  technicianId: string;
  rating: number;
  comment: string;
  createdAt: string;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type?: string;
  metadata?: string | null;
  timestamp: string;
  isRead: boolean;
}

export interface Conversation {
  id: string;
  participantIds: string[];
  participantName: string;
  participantAvatar?: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  serviceRequest?: ServiceRequest;
}
