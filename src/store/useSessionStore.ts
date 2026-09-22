import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  companyName: string;
  gstin: string;
}

export interface Account extends User {
  passwordHash: string; // Plain text password for client-side demo
  phone?: string;
}

export interface VerificationToken {
  otp: string;
  email: string;
  createdAt: number;
  expiresAt: number;
  verified: boolean;
}

interface SessionState {
  user: User | null;
  isAuthenticated: boolean;
  accounts: Record<string, Account>;
  verificationTokens: Record<string, VerificationToken>;
  
  // Actions
  login: (user: User) => void;
  loginUser: (email: string, password: string) => { success: boolean; error?: string };
  registerUser: (name: string, email: string, password: string, companyName: string, gstin: string, phone?: string) => { success: boolean; error?: string };
  
  // Realistic Account Verification & Password Recovery
  requestPasswordResetOtp: (email: string) => { success: boolean; otp?: string; error?: string; maskedContact?: string };
  verifyResetOtp: (email: string, otp: string) => { success: boolean; error?: string };
  completePasswordReset: (email: string, otp: string, newPassword: string) => { success: boolean; error?: string };
  
  // Legacy / Direct helpers
  forgotPassword: (email: string) => boolean;
  resetPassword: (email: string, newPassword: string) => boolean;
  logout: () => void;
}

const defaultAccount: Account = {
  id: "usr_demo_123",
  name: "Rajesh Kumar",
  email: "rajesh@techsolutions.in",
  role: "admin",
  companyName: "Tech Solutions Pvt Ltd",
  gstin: "27AADCB2230M1Z2",
  passwordHash: "password",
  phone: "+91 98765 43210"
};

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      accounts: {
        "rajesh@techsolutions.in": defaultAccount
      },
      verificationTokens: {},

      // Keep compatibility with simple login
      login: (user) => set({ user, isAuthenticated: true }),

      loginUser: (email, password) => {
        const cleanedEmail = email.trim().toLowerCase();
        const account = get().accounts[cleanedEmail];
        
        if (!account) {
          return { success: false, error: "No account exists with this email address." };
        }
        if (account.passwordHash !== password) {
          return { success: false, error: "Incorrect password. Please try again." };
        }

        // Set active user session
        const activeUser: User = {
          id: account.id,
          name: account.name,
          email: account.email,
          role: account.role,
          companyName: account.companyName,
          gstin: account.gstin
        };
        
        set({ user: activeUser, isAuthenticated: true });
        return { success: true };
      },

      registerUser: (name, email, password, companyName, gstin, phone) => {
        const cleanedEmail = email.trim().toLowerCase();
        const existing = get().accounts[cleanedEmail];

        if (existing) {
          return { success: false, error: "An account is already registered with this email." };
        }

        const newAccount: Account = {
          id: `usr_${Date.now()}`,
          name: name.trim(),
          email: cleanedEmail,
          role: "admin",
          companyName: companyName.trim() || "Tech Solutions Pvt Ltd",
          gstin: gstin.trim().toUpperCase() || "27AADCB2230M1Z2",
          passwordHash: password,
          phone: phone || "+91 98765 00000"
        };

        const updatedAccounts = {
          ...get().accounts,
          [cleanedEmail]: newAccount
        };

        const activeUser: User = {
          id: newAccount.id,
          name: newAccount.name,
          email: newAccount.email,
          role: newAccount.role,
          companyName: newAccount.companyName,
          gstin: newAccount.gstin
        };

        set({
          accounts: updatedAccounts,
          user: activeUser,
          isAuthenticated: true
        });

        return { success: true };
      },

      // Request 6-digit OTP for Account Verification
      requestPasswordResetOtp: (email: string) => {
        const cleanedEmail = email.trim().toLowerCase();
        const account = get().accounts[cleanedEmail];

        if (!account) {
          return { success: false, error: "No registered enterprise account found with this email." };
        }

        // Generate 6-digit numeric OTP
        const otp = Math.floor(100000 + Math.random() * 900000).toString();
        const now = Date.now();
        const expiresAt = now + 10 * 60 * 1000; // 10 minutes validity

        const token: VerificationToken = {
          otp,
          email: cleanedEmail,
          createdAt: now,
          expiresAt,
          verified: false
        };

        set({
          verificationTokens: {
            ...get().verificationTokens,
            [cleanedEmail]: token
          }
        });

        // Create masked email/contact indicator for realistic security feedback
        const parts = cleanedEmail.split("@");
        const maskedEmail = parts[0].length > 2 
          ? `${parts[0][0]}***${parts[0][parts[0].length - 1]}@${parts[1]}`
          : cleanedEmail;

        return {
          success: true,
          otp,
          maskedContact: maskedEmail
        };
      },

      // Verify the 6-digit OTP entered by user
      verifyResetOtp: (email: string, otp: string) => {
        const cleanedEmail = email.trim().toLowerCase();
        const token = get().verificationTokens[cleanedEmail];

        if (!token) {
          return { success: false, error: "No verification request found. Please request a new code." };
        }

        if (Date.now() > token.expiresAt) {
          return { success: false, error: "Verification code has expired. Please request a new one." };
        }

        if (token.otp.trim() !== otp.trim()) {
          return { success: false, error: "Invalid verification code. Please check and try again." };
        }

        // Mark as verified
        set({
          verificationTokens: {
            ...get().verificationTokens,
            [cleanedEmail]: {
              ...token,
              verified: true
            }
          }
        });

        return { success: true };
      },

      // Complete Password Reset only after account is verified
      completePasswordReset: (email: string, otp: string, newPassword: string) => {
        const cleanedEmail = email.trim().toLowerCase();
        const token = get().verificationTokens[cleanedEmail];
        const account = get().accounts[cleanedEmail];

        if (!account) {
          return { success: false, error: "Account not found." };
        }

        if (!token || !token.verified || token.otp.trim() !== otp.trim()) {
          return { success: false, error: "Account verification failed. Please verify your account first." };
        }

        if (newPassword.length < 6) {
          return { success: false, error: "Password must be at least 6 characters long." };
        }

        // Update password and clear used token
        const updatedAccounts = {
          ...get().accounts,
          [cleanedEmail]: {
            ...account,
            passwordHash: newPassword
          }
        };

        const updatedTokens = { ...get().verificationTokens };
        delete updatedTokens[cleanedEmail];

        set({
          accounts: updatedAccounts,
          verificationTokens: updatedTokens
        });

        return { success: true };
      },

      forgotPassword: (email) => {
        const cleanedEmail = email.trim().toLowerCase();
        return !!get().accounts[cleanedEmail];
      },

      resetPassword: (email, newPassword) => {
        const cleanedEmail = email.trim().toLowerCase();
        const account = get().accounts[cleanedEmail];

        if (!account) return false;

        const updatedAccounts = {
          ...get().accounts,
          [cleanedEmail]: {
            ...account,
            passwordHash: newPassword
          }
        };

        set({ accounts: updatedAccounts });
        return true;
      },

      logout: () => set({ user: null, isAuthenticated: false })
    }),
    {
      name: "gstshield-session-store"
    }
  )
);
