
import { User, LinkItem, PasswordItem, CalendarEvent } from '../types';

// API Configuration
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// Helper: Get Auth Headers
const getHeaders = () => {
  const token = localStorage.getItem('nexus_token');
  return {
    'Content-Type': 'application/json',
    'Authorization': token ? `Bearer ${token}` : ''
  };
};

// Helper: Handle Response
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const error = await response.json().catch(() => ({ message: 'An error occurred' }));
    if (response.status === 401) {
      // Auto logout on unauthorized
      localStorage.removeItem('nexus_token');
      localStorage.removeItem('nexus_active_user');
      window.location.href = '/';
    }
    throw new Error(error.message || `Request failed: ${response.statusText}`);
  }
  return response.json();
};

export const api = {
  // --- AUTHENTICATION ---

  async register(email: string, password: string, name: string): Promise<User> {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password, name }),
    });
    
    const data = await handleResponse(response);
    
    // Save Session
    localStorage.setItem('nexus_token', data.token);
    return data.user;
  },

  async login(email: string, password: string): Promise<User> {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await handleResponse(response);
    
    // Save Session
    localStorage.setItem('nexus_token', data.token);
    return data.user;
  },

  // --- LINKS ---

  async getLinks(userId: string): Promise<LinkItem[]> {
    const response = await fetch(`${API_URL}/links`, {
      headers: getHeaders()
    });
    const data = await handleResponse(response);
    // Map MongoDB _id to id
    return data.map((item: any) => ({ ...item, id: item._id }));
  },

  async addLink(link: LinkItem): Promise<LinkItem> {
    // Remove ID if it exists (let MongoDB generate it)
    const { id, ...linkData } = link; 
    const response = await fetch(`${API_URL}/links`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(linkData),
    });
    const data = await handleResponse(response);
    return { ...data, id: data._id };
  },

  async deleteLink(id: string, userId: string): Promise<void> {
    await fetch(`${API_URL}/links/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },

  // --- PASSWORDS ---

  async getPasswords(userId: string): Promise<PasswordItem[]> {
    const response = await fetch(`${API_URL}/passwords`, {
      headers: getHeaders()
    });
    const data = await handleResponse(response);
    return data.map((item: any) => ({ ...item, id: item._id }));
  },

  async addPassword(pass: PasswordItem): Promise<PasswordItem> {
    const { id, ...passData } = pass;
    const response = await fetch(`${API_URL}/passwords`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(passData),
    });
    const data = await handleResponse(response);
    return { ...data, id: data._id };
  },

  async deletePassword(id: string, userId: string): Promise<void> {
    await fetch(`${API_URL}/passwords/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  },

  // --- EVENTS ---

  async getEvents(userId: string): Promise<CalendarEvent[]> {
    const response = await fetch(`${API_URL}/events`, {
      headers: getHeaders()
    });
    const data = await handleResponse(response);
    return data.map((item: any) => ({ ...item, id: item._id }));
  },

  async addEvent(event: CalendarEvent): Promise<CalendarEvent> {
    const { id, ...eventData } = event;
    const response = await fetch(`${API_URL}/events`, {
      method: 'POST',
      headers: getHeaders(),
      body: JSON.stringify(eventData),
    });
    const data = await handleResponse(response);
    return { ...data, id: data._id };
  },

  async updateEvent(event: CalendarEvent): Promise<void> {
    const { id, ...eventData } = event;
    // If id matches MongoDB format use it, otherwise API might fail if using temp ID
    await fetch(`${API_URL}/events/${id}`, {
      method: 'PUT',
      headers: getHeaders(),
      body: JSON.stringify(eventData),
    });
  },

  async deleteEvent(id: string, userId: string): Promise<void> {
    await fetch(`${API_URL}/events/${id}`, {
      method: 'DELETE',
      headers: getHeaders(),
    });
  }
};
