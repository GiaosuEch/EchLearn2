export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  authorLevel: number;
  content: string;
  imageUrl?: string | null;
  language: string;
  tags: string[];
  likes: number;
  comments: CommunityComment[];
  isLiked: boolean;
  createdAt: string;
}

export interface CommunityComment {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  likes: number;
  createdAt: string;
}

export interface StudyGroup {
  id: string;
  name: string;
  description: string;
  language: string;
  level: string;
  ownerId: string;
  ownerName: string;
  members: GroupMember[];
  maxMembers: number;
  isPublic: boolean;
  tags: string[];
  avatarUrl: string;
  createdAt: string;
  nextSession?: string;
  weeklyXP: number;
}

export interface GroupMember {
  id: string;
  displayName: string;
  avatarUrl: string;
  role: 'owner' | 'admin' | 'member';
  xp: number;
  joinedAt: string;
}

export interface VoiceRoom {
  id: string;
  name: string;
  topic: string;
  language: string;
  hostId: string;
  hostName: string;
  participants: VoiceParticipant[];
  maxParticipants: number;
  isLive: boolean;
  studyTimer?: number;
  createdAt: string;
}

export interface VoiceParticipant {
  id: string;
  displayName: string;
  avatarUrl: string;
  isMuted: boolean;
  isSpeaking: boolean;
  joinedAt: string;
}

export interface ChatRoom {
  id: string;
  type: 'direct' | 'group';
  name: string;
  participants: string[];
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export interface ChatMessage {
  id: string;
  roomId: string;
  senderId: string;
  senderName: string;
  senderAvatar?: string;
  content: string;
  type?: 'text' | 'image' | 'audio' | 'system';
  createdAt?: string;
  timestamp?: string;
  isRead?: boolean;
  reactions?: MessageReaction[];
}

export interface MessageReaction {
  emoji: string;
  count: number;
  userReacted: boolean;
}
