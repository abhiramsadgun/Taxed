import { create } from 'zustand';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyName: string;
  gstin: string;
}

interface SessionState {
  user: User | null;
  isAuthenticated: boolean;
  login: (user: User) => void;
  logout: () => void;
}

const demoUser: User = {
  id: "usr_demo_123",
  name: "Rajesh Kumar",
  email: "rajesh@techsolutions.in",
  role: "admin",
  companyName: "Tech Solutions Pvt Ltd",
  gstin: "27AADCB2230M1Z2"
};

export const useSessionStore = create<SessionState>((set) => ({
  user: demoUser,
  isAuthenticated: true,
  login: (user) => set({ user, isAuthenticated: true }),
  logout: () => set({ user: null, isAuthenticated: false }),
}));
