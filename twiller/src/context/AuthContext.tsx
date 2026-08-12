"use client";

import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import React, { createContext, useContext, useState, useEffect } from "react";
import { auth } from "./firebase";
import axiosInstance from "../lib/axiosInstance";
import MfaModal from "../components/MfaModal";

export interface User {
  _id: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  joinedDate: string;
  email: string;
  website: string;
  location: string;
  subscriptionPlan?: string;
  tweetsCount?: number;
  notificationsEnabled?: boolean; // New field
  followers?: string[];
  following?: string[];
}

export interface AuthResponse {
  success?: boolean;
  user?: User;
  requiresOtp?: boolean;
  otpChallengeRequired?: boolean;
  cancelled?: boolean;
  email?: string;
  message?: string;
}

export interface AuthContextType {
  user: User | null;
  setUser: React.Dispatch<React.SetStateAction<User | null>>; // Exposed setUser
  login: (email: string, password?: string, otp?: string) => Promise<AuthResponse | undefined>;
  verifyOtp: (email: string, otp: string) => Promise<AuthResponse>;
  signup: (
    email: string,
    password: string,
    username: string,
    displayName: string
  ) => Promise<void>;
  updateProfile: (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
  }) => Promise<void>;
  logout: () => Promise<void>;
  isLoading: boolean;
  googlesignin: () => Promise<AuthResponse | undefined>;
  showMfaModal: boolean;
  mfaEmail: string;
  closeMfaModal: () => void;
  triggerMfaModal: (email: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const sanitizeUserData = (userData: Partial<User> | null | undefined): User | null => {
  if (!userData) return null;

  const emailPrefix = userData.email ? userData.email.split("@")[0] : "user";
  const fallbackUsername = userData.username || emailPrefix;
  const fallbackDisplayName = userData.displayName || fallbackUsername || "User";

  return {
    _id: userData._id || "",
    email: userData.email || "",
    joinedDate: userData.joinedDate || new Date().toISOString(),
    website: userData.website || "",
    location: userData.location || "",
    bio: userData.bio || "",
    subscriptionPlan: userData.subscriptionPlan,
    tweetsCount: userData.tweetsCount,
    notificationsEnabled: userData.notificationsEnabled ?? true,
    ...userData,
    username: fallbackUsername,
    displayName: fallbackDisplayName,
    avatar:
      userData.avatar ||
      "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400",
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUserState] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Custom setUser wrapper that also updates localStorage
  const setUser: React.Dispatch<React.SetStateAction<User | null>> = (action) => {
    setUserState((prevUser) => {
      const newUser = typeof action === "function" ? action(prevUser) : action;
      if (newUser) {
        localStorage.setItem("twitter-user", JSON.stringify(newUser));
      } else {
        localStorage.removeItem("twitter-user");
      }
      return newUser;
    });
  };

  // Global MFA Control States
  const [showMfaModal, setShowMfaModal] = useState<boolean>(false);
  const [mfaEmail, setMfaEmail] = useState<string>("");

  const triggerMfaModal = (email: string) => {
    sessionStorage.setItem("mfa_in_progress", "true");
    sessionStorage.setItem("pending_mfa_email", email);
    setMfaEmail(email);
    setShowMfaModal(true);
  };

  const closeMfaModal = () => {
    setShowMfaModal(false);
    setMfaEmail("");
    sessionStorage.removeItem("pending_mfa_email");
    sessionStorage.removeItem("mfa_in_progress");
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      const isMfaActive = sessionStorage.getItem("mfa_in_progress") === "true";
      const pendingEmail = sessionStorage.getItem("pending_mfa_email");

      if (isMfaActive && pendingEmail) {
        setMfaEmail(pendingEmail);
        setShowMfaModal(true);
        setIsLoading(false);
        return;
      }

      const savedUser = localStorage.getItem("twitter-user");

      if (savedUser) {
        try {
          const parsedUser = JSON.parse(savedUser);
          setUserState(sanitizeUserData(parsedUser));
        } catch {
          localStorage.removeItem("twitter-user");
          setUserState(null);
        }
      } else {
        setUserState(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Google Sign-In Sequence
  const googlesignin = async (): Promise<AuthResponse | undefined> => {
    try {
      setIsLoading(true);

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({ prompt: "select_account" });

      const result = await signInWithPopup(auth, provider);
      const googleEmail = result.user?.email;

      if (!googleEmail) {
        throw new Error("Could not retrieve email from Google Sign-In.");
      }

      const res = await axiosInstance.post("/api/auth/login", {
        email: googleEmail,
        password: "OAUTH_BYPASS_TEMPORARY_SECRET",
      });

      await signOut(auth);

      if (res.data?.requiresOtp || res.data?.requireOtp) {
        setUser(null);

        sessionStorage.setItem("mfa_in_progress", "true");
        sessionStorage.setItem("pending_mfa_email", googleEmail);

        setMfaEmail(googleEmail);
        setShowMfaModal(true);

        return {
          requiresOtp: true,
          email: googleEmail,
          message: "OTP sent to your email address.",
        };
      }

      closeMfaModal();
      const rawUser = res.data?.user || (res.data?._id ? res.data : null);
      const loggedInUser = sanitizeUserData(rawUser);

      if (loggedInUser) {
        setUser(loggedInUser);
        return { requiresOtp: false, user: loggedInUser };
      }
    } catch (error: any) {
      await signOut(auth);
      setUser(null);
      closeMfaModal();

      if (error.code === "auth/popup-closed-by-user") {
        return { cancelled: true };
      }

      const cleanMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Google Sign-In sequence failed.";

      alert(cleanMessage);

      throw new Error(cleanMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // OTP Verification
  const verifyOtp = async (email: string, otp: string): Promise<AuthResponse> => {
    try {
      setIsLoading(true);

      const res = await axiosInstance.post("/api/auth/verify-otp", {
        email: email.trim().toLowerCase(),
        otp: otp.trim(),
      });

      const rawUser = res.data?.user;
      const loggedInUser = sanitizeUserData(rawUser);

      if (loggedInUser) {
        setUser(loggedInUser);
        closeMfaModal();
        return { success: true, user: loggedInUser };
      }

      throw new Error("Failed to parse user session payload.");
    } catch (error: any) {
      const cleanMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Invalid or expired OTP code.";

      alert(cleanMessage);
      throw new Error(cleanMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Standard Login
  const login = async (email: string, password?: string, otp?: string): Promise<AuthResponse | undefined> => {
    try {
      setIsLoading(true);

      if (otp) {
        return await verifyOtp(email, otp);
      }

      const res = await axiosInstance.post("/api/auth/login", {
        email,
        password: password || "OAUTH_BYPASS_TEMPORARY_SECRET",
      });

      if (res.data && (res.data.requiresOtp || res.data.otpChallengeRequired)) {
        setUser(null);
        triggerMfaModal(email);
        return { requiresOtp: true, email };
      }

      const rawUser =
        res.data?.user ||
        res.data?.data?.user ||
        (res.data?._id || res.data?.email ? res.data : null);

      const loggedInUser = sanitizeUserData(rawUser);

      if (loggedInUser) {
        setUser(loggedInUser);
        closeMfaModal();
        return { success: true, user: loggedInUser };
      }

      return res.data;
    } catch (error: any) {
      const cleanMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Login failed.";

      alert(cleanMessage);

      throw new Error(cleanMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Registration
  const signup = async (
    email: string,
    password: string,
    username: string,
    displayName: string
  ): Promise<void> => {
    setIsLoading(true);
    try {
      const cleanEmail = email.trim().toLowerCase();
      const usercred = await createUserWithEmailAndPassword(auth, cleanEmail, password);
      const fbUser = usercred.user;

      const newUserPayload = {
        username: username.trim(),
        displayName: displayName.trim(),
        avatar:
          fbUser.photoURL ||
          "https://images.pexels.com/photos/1139743/pexels-photo-1139743.jpeg?auto=compress&cs=tinysrgb&w=400",
        email: cleanEmail,
        password,
        bio: "",
        location: "",
        website: "",
        joinedDate: new Date().toISOString(),
      };

      const res = await axiosInstance.post("/register", newUserPayload);
      if (res.data) {
        const cleanUser = sanitizeUserData(res.data);
        setUser(cleanUser);
      }
    } catch (error: any) {
      const cleanMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        error.message ||
        "Registration layer failed.";
      throw new Error(cleanMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async (): Promise<void> => {
    try {
      // 1. Tell Firebase to sign out and wait for it to finish completely
      await signOut(auth);

      // 2. Clear out your local state
      setUser(null);
      sessionStorage.clear();
      
      // Do NOT use window.location.href = "/" here.
      // Let React automatically switch the view in page.tsx!
      
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const updateProfile = async (profileData: {
    displayName: string;
    bio: string;
    location: string;
    website: string;
    avatar: string;
  }): Promise<void> => {
    if (!user) return;
    setIsLoading(true);
    try {
      const updatedUser = sanitizeUserData({ ...user, ...profileData });
      if (!updatedUser) return;

      const res = await axiosInstance.patch(`/userupdate/${user.email}`, updatedUser);
      const finalUser = res.data ? sanitizeUserData(res.data) || updatedUser : updatedUser;

      setUser(finalUser);
    } catch (error: any) {
      console.error("Profile update error:", error?.message || error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        verifyOtp,
        signup,
        updateProfile,
        logout,
        isLoading,
        googlesignin,
        showMfaModal,
        mfaEmail,
        closeMfaModal,
        triggerMfaModal,
      }}
    >
      {children}
      <MfaModal
        isOpen={showMfaModal}
        onClose={closeMfaModal}
        email={mfaEmail}
      />
    </AuthContext.Provider>
  );
};