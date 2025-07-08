import AsyncStorage from '@react-native-async-storage/async-storage';

/**
 * Session Manager for Cart Persistence
 * 
 * This utility handles:
 * - Session ID generation and persistence
 * - Device fingerprinting for guest cart identification
 * - Cart session lifecycle management
 * - Session merging when users authenticate
 * 
 * @version 1.0.0
 */

export interface SessionInfo {
  sessionId: string;
  deviceFingerprint: string;
  isGuest: boolean;
  userId?: string;
  createdAt: Date;
  lastActivityAt: Date;
  cartId?: string;
}

export interface CartSessionData {
  sessionId: string;
  deviceFingerprint: string;
  cartId?: string;
  expiresAt: Date;
  itemCount: number;
  lastSyncAt: Date;
}

class SessionManager {
  private sessionInfo: SessionInfo | null = null;
  private readonly SESSION_KEY = 'cart_session_v1';
  private readonly CART_SESSION_KEY = 'cart_session_data_v1';

  /**
   * Initialize session manager
   */
  async initialize(): Promise<SessionInfo> {
    try {
      const storedSession = await AsyncStorage.getItem(this.SESSION_KEY);
      
      if (storedSession) {
        const parsed = JSON.parse(storedSession);
        this.sessionInfo = {
          ...parsed,
          createdAt: new Date(parsed.createdAt),
          lastActivityAt: new Date(parsed.lastActivityAt),
        };
        
        // Update last activity
        this.sessionInfo.lastActivityAt = new Date();
        await this.saveSession();
      } else {
        this.sessionInfo = await this.createNewSession();
      }
      
      return this.sessionInfo;
    } catch (error) {
      console.error('Failed to initialize session:', error);
      this.sessionInfo = await this.createNewSession();
      return this.sessionInfo;
    }
  }

  /**
   * Create a new session
   */
  private async createNewSession(): Promise<SessionInfo> {
    const sessionInfo: SessionInfo = {
      sessionId: this.generateSessionId(),
      deviceFingerprint: this.generateDeviceFingerprint(),
      isGuest: true,
      createdAt: new Date(),
      lastActivityAt: new Date(),
    };
    
    this.sessionInfo = sessionInfo;
    await this.saveSession();
    
    return sessionInfo;
  }

  /**
   * Generate a unique session ID
   */
  private generateSessionId(): string {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substring(2, 15);
    return `${timestamp}-${random}`;
  }

  /**
   * Generate device fingerprint for guest cart identification
   */
  private generateDeviceFingerprint(): string {
    try {
      const components = [
        // Platform specific
        'react-native', // Platform identifier
        Date.now().toString(), // Installation timestamp
        Math.random().toString(36).substring(2, 15), // Random component
        
        // Device characteristics (simulated for React Native)
        'mobile', // Device type
        'ios-android', // Platform
        '1080x1920', // Typical screen resolution
        'UTC', // Timezone
      ];
      
      const fingerprint = components.join('|');
      return btoa(fingerprint).slice(0, 32); // Base64 encode and truncate
    } catch (error) {
      console.error('Failed to generate device fingerprint:', error);
      return Math.random().toString(36).substring(2, 34);
    }
  }

  /**
   * Get current session info
   */
  async getSessionInfo(): Promise<SessionInfo> {
    if (!this.sessionInfo) {
      return await this.initialize();
    }
    
    // Update last activity
    this.sessionInfo.lastActivityAt = new Date();
    await this.saveSession();
    
    return this.sessionInfo;
  }

  /**
   * Update session when user authenticates
   */
  async authenticateUser(userId: string): Promise<SessionInfo> {
    if (!this.sessionInfo) {
      this.sessionInfo = await this.initialize();
    }
    
    this.sessionInfo.userId = userId;
    this.sessionInfo.isGuest = false;
    this.sessionInfo.lastActivityAt = new Date();
    
    await this.saveSession();
    
    return this.sessionInfo;
  }

  /**
   * Clear session when user logs out
   */
  async logout(): Promise<void> {
    if (this.sessionInfo) {
      this.sessionInfo.userId = undefined;
      this.sessionInfo.isGuest = true;
      this.sessionInfo.lastActivityAt = new Date();
      
      await this.saveSession();
    }
  }

  /**
   * Save session to storage
   */
  private async saveSession(): Promise<void> {
    if (this.sessionInfo) {
      try {
        await AsyncStorage.setItem(this.SESSION_KEY, JSON.stringify(this.sessionInfo));
      } catch (error) {
        console.error('Failed to save session:', error);
      }
    }
  }

  /**
   * Save cart session data
   */
  async saveCartSession(cartSessionData: CartSessionData): Promise<void> {
    try {
      await AsyncStorage.setItem(this.CART_SESSION_KEY, JSON.stringify(cartSessionData));
    } catch (error) {
      console.error('Failed to save cart session:', error);
    }
  }

  /**
   * Get cart session data
   */
  async getCartSession(): Promise<CartSessionData | null> {
    try {
      const stored = await AsyncStorage.getItem(this.CART_SESSION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        return {
          ...parsed,
          expiresAt: new Date(parsed.expiresAt),
          lastSyncAt: new Date(parsed.lastSyncAt),
        };
      }
      return null;
    } catch (error) {
      console.error('Failed to get cart session:', error);
      return null;
    }
  }

  /**
   * Clear cart session data
   */
  async clearCartSession(): Promise<void> {
    try {
      await AsyncStorage.removeItem(this.CART_SESSION_KEY);
    } catch (error) {
      console.error('Failed to clear cart session:', error);
    }
  }

  /**
   * Check if cart session is expired
   */
  async isCartSessionExpired(): Promise<boolean> {
    const cartSession = await this.getCartSession();
    if (!cartSession) return true;
    
    return new Date() > cartSession.expiresAt;
  }

  /**
   * Create cart session with expiration
   */
  async createCartSession(cartId: string, itemCount: number = 0): Promise<CartSessionData> {
    const sessionInfo = await this.getSessionInfo();
    
    const cartSession: CartSessionData = {
      sessionId: sessionInfo.sessionId,
      deviceFingerprint: sessionInfo.deviceFingerprint,
      cartId,
      expiresAt: new Date(Date.now() + (sessionInfo.isGuest ? 24 * 60 * 60 * 1000 : 30 * 24 * 60 * 60 * 1000)), // 24h for guest, 30 days for user
      itemCount,
      lastSyncAt: new Date(),
    };
    
    await this.saveCartSession(cartSession);
    return cartSession;
  }

  /**
   * Update cart session activity
   */
  async updateCartActivity(itemCount: number): Promise<void> {
    const cartSession = await this.getCartSession();
    if (cartSession) {
      cartSession.itemCount = itemCount;
      cartSession.lastSyncAt = new Date();
      await this.saveCartSession(cartSession);
    }
  }

  /**
   * Get session headers for API requests
   */
  async getSessionHeaders(): Promise<Record<string, string>> {
    const sessionInfo = await this.getSessionInfo();
    
    return {
      'X-Session-ID': sessionInfo.sessionId,
      'X-Device-Fingerprint': sessionInfo.deviceFingerprint,
      ...(sessionInfo.userId && { 'X-User-ID': sessionInfo.userId }),
    };
  }

  /**
   * Reset session (useful for testing or recovery)
   */
  async resetSession(): Promise<SessionInfo> {
    try {
      await AsyncStorage.removeItem(this.SESSION_KEY);
      await AsyncStorage.removeItem(this.CART_SESSION_KEY);
      this.sessionInfo = null;
      return await this.initialize();
    } catch (error) {
      console.error('Failed to reset session:', error);
      return await this.createNewSession();
    }
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

// Utility functions for easy access
export const getSessionInfo = () => sessionManager.getSessionInfo();
export const getSessionHeaders = () => sessionManager.getSessionHeaders();
export const authenticateUser = (userId: string) => sessionManager.authenticateUser(userId);
export const logout = () => sessionManager.logout();
export const resetSession = () => sessionManager.resetSession();
export const isCartSessionExpired = () => sessionManager.isCartSessionExpired();
export const createCartSession = (cartId: string, itemCount?: number) => 
  sessionManager.createCartSession(cartId, itemCount);
export const updateCartActivity = (itemCount: number) => 
  sessionManager.updateCartActivity(itemCount); 