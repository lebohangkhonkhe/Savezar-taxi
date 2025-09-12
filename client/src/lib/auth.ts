import { queryClient } from "./queryClient";

export interface User {
  id: string;
  email: string;
  name: string;
}

export const authStorage = {
  getUser(): User | null {
    const userData = localStorage.getItem('user');
    return userData ? JSON.parse(userData) : null;
  },

  setUser(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
  },

  removeUser(): void {
    localStorage.removeItem('user');
  },

  isAuthenticated(): boolean {
    return this.getUser() !== null;
  }
};

export const logout = async () => {
  try {
    await fetch('/api/auth/logout', { 
      method: 'POST',
      credentials: 'include'
    });
  } catch (error) {
    console.error('Logout error:', error);
  } finally {
    authStorage.removeUser();
    queryClient.clear();
    window.location.href = '/';
  }
};
