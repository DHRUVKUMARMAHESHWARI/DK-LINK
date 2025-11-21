
import { User, LinkItem, PasswordItem, CalendarEvent, ChatMessage } from '../types';

const SIMULATED_DELAY = 400;

const delay = () => new Promise(resolve => setTimeout(resolve, SIMULATED_DELAY));

// Helper to safely write to localStorage with Quota error handling
const safeSetItem = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch (e: any) {
    if (
      e.name === 'QuotaExceededError' || 
      e.name === 'NS_ERROR_DOM_QUOTA_REACHED' || 
      e.message?.toLowerCase().includes('quota')
    ) {
      throw new Error("⚠️ Storage Full! Please delete old items to save new data.");
    }
    throw e;
  }
};

const getData = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

// Internal helpers extracted to avoid 'this' context issues with generics
const _add = async <T extends { id: string }>(collectionKey: string, item: T, userId: string): Promise<T> => {
  await delay();
  const key = `nexus_${collectionKey}_${userId}`;
  const items = getData<T>(key);
  
  // Assign a local ID if not present or generic
  const newItem = { ...item, id: Date.now().toString() };
  
  items.unshift(newItem); // Add to top
  safeSetItem(key, JSON.stringify(items));
  return newItem;
};

const _get = async <T>(collectionKey: string, userId: string): Promise<T[]> => {
  await delay();
  return getData<T>(`nexus_${collectionKey}_${userId}`);
};

const _delete = async (collectionKey: string, id: string, userId: string): Promise<void> => {
  await delay();
  const key = `nexus_${collectionKey}_${userId}`;
  const items = getData<any>(key);
  const filtered = items.filter((i: any) => i.id !== id);
  safeSetItem(key, JSON.stringify(filtered));
};

const _update = async <T extends { id: string }>(collectionKey: string, item: T, userId: string): Promise<void> => {
  await delay();
  const key = `nexus_${collectionKey}_${userId}`;
  const items = getData<any>(key);
  const index = items.findIndex((i: any) => i.id === item.id);
  if (index !== -1) {
    items[index] = item;
    safeSetItem(key, JSON.stringify(items));
  }
};

export const api = {
  // --- AUTHENTICATION (Simulated) ---

  async register(email: string, password: string, name: string): Promise<User> {
    await delay();
    const users = getData<any>('nexus_users');
    
    if (users.find(u => u.email === email)) {
      throw new Error('User already exists');
    }
    
    const newUser = {
      id: 'user_' + Date.now(),
      email,
      password, // In a real local-only app, this is stored in LS.
      name,
      isAuthenticated: true
    };
    
    users.push(newUser);
    safeSetItem('nexus_users', JSON.stringify(users));
    
    const { password: _, ...userSafe } = newUser;
    return userSafe;
  },

  async login(email: string, password: string): Promise<User> {
    await delay();
    const users = getData<any>('nexus_users');
    const user = users.find(u => u.email === email && u.password === password);
    
    if (!user) throw new Error('Invalid credentials');
    
    const { password: _, ...userSafe } = user;
    return userSafe;
  },

  // --- LINKS ---
  async getLinks(userId: string) { return _get<LinkItem>('links', userId); },
  async addLink(link: LinkItem) { return _add('links', link, link.userId); },
  async deleteLink(id: string, userId: string) { return _delete('links', id, userId); },

  // --- PASSWORDS ---
  async getPasswords(userId: string) { return _get<PasswordItem>('passwords', userId); },
  async addPassword(pass: PasswordItem) { return _add('passwords', pass, pass.userId); },
  async deletePassword(id: string, userId: string) { return _delete('passwords', id, userId); },

  // --- EVENTS ---
  async getEvents(userId: string) { return _get<CalendarEvent>('events', userId); },
  async addEvent(event: CalendarEvent) { return _add('events', event, event.userId); },
  async updateEvent(event: CalendarEvent) { return _update('events', event, event.userId); },
  async deleteEvent(id: string, userId: string) { return _delete('events', id, userId); },

  // --- CHATS ---
  async getChats(userId: string) {
    const chats = await _get<ChatMessage>('chats', userId);
    // Sort chronological for display (oldest to newest)
    return chats.sort((a, b) => a.timestamp - b.timestamp); 
  },
  async addChat(chat: ChatMessage, userId: string) {
    return _add('chats', chat, userId);
  },
  
  // --- STORAGE MANAGEMENT ---
  /**
   * Cleans up unnecessary data to free space:
   * 1. Removes chat messages older than 24 hours
   * 2. Keeps a maximum of 50 recent messages
   */
  async cleanupStorage(userId: string, forceAll: boolean = false): Promise<number> {
    const key = `nexus_chats_${userId}`;
    
    if (forceAll) {
      safeSetItem(key, JSON.stringify([]));
      return 1; // Generic success indicator
    }

    const chats = getData<ChatMessage>(key);
    const initialCount = chats.length;

    // Retention Policy: 24 Hours
    const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
    let keptChats = chats.filter(c => c.timestamp > oneDayAgo);

    // Cap Policy: Max 50 messages
    if (keptChats.length > 50) {
      // Keep the 50 most recent (since they are stored in 'unshift' order in _add, 
      // index 0 is newest. So slice(0, 50) keeps newest)
      keptChats = keptChats.slice(0, 50);
    }

    if (keptChats.length !== initialCount) {
      safeSetItem(key, JSON.stringify(keptChats));
      console.log(`[Storage] Cleaned up ${initialCount - keptChats.length} old messages`);
      return initialCount - keptChats.length;
    }
    return 0;
  }
};
