import { communitySupabaseService } from '../services/communitySupabaseService';

export class ChatRepository {
  static async getChatRooms(userId: string) {
    try {
      return await communitySupabaseService.getChatRooms(userId);
    } catch (error) {
      console.error('Failed to get chat rooms:', error);
      return [];
    }
  }

  static async getChatMessages(roomId: string) {
    try {
      return await communitySupabaseService.getChatMessages(roomId);
    } catch (error) {
      console.error('Failed to get chat messages:', error);
      return [];
    }
  }

  static async sendChatMessage(roomId: string, senderId: string, content: string) {
    try {
      return await communitySupabaseService.sendChatMessage(roomId, senderId, content);
    } catch (error) {
      console.error('Failed to send chat message:', error);
      throw error;
    }
  }

  static async createChatRoom(userId: string, name: string, type: 'direct' | 'group' = 'group', password?: string) {
    try {
      return await communitySupabaseService.createChatRoom(userId, name, type, password);
    } catch (error) {
      console.error('Failed to create chat room:', error);
      throw error;
    }
  }

  static async joinChatRoom(roomId: string, userId: string, password?: string) {
    try {
      return await communitySupabaseService.joinChatRoom(roomId, userId, password);
    } catch (error) {
      console.error('Failed to join chat room:', error);
      throw error;
    }
  }
}
