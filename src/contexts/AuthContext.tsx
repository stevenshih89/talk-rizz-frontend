import { createContext, useContext, useState, ReactNode } from "react";
import { supabase } from "../config/supabase";
import { useHistory } from "react-router-dom";
import { UserProfile } from "../types/profile";
import { profileService } from "../services/profileService";
import { connectService } from "../services/connectService";
import { Connect } from "../types/connect";

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

interface Session {
  user: User | null;
  access_token: string | null;
}

interface AuthContextType {
  session: Session | null;
  setSession: (session: Session | null) => void;
  user: User | null;
  profile: UserProfile | null;
  setProfile: (profile: UserProfile) => void;
  connect: Connect | null;
  setConnect: (connect: Connect) => void;
  isLoading: boolean;
  setIsLoading: (isLoading: boolean) => void;
  isDirectChat: boolean;
  setIsDirectChat: (isDirectChat: boolean) => void;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  handleAuthCallback: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [connect, setConnect] = useState<Connect | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDirectChat, setIsDirectChat] = useState(false);
  const history = useHistory();

  const signIn = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      console.log("email", email);
      console.log("password", password);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      console.log("data", data);
      console.log("error", error);

      if (error) {
        throw error;
      }

      console.log("data.user", data.user);

      if (data.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        const name = userData?.name || null;
        await handleMongoDBUser(name);
        await handleMongoDBConnect();

        console.log("Data user~~~~:", data.user);

        setSession({
          access_token: data.session.access_token,
          user: {
            id: data.user.id,
            email: data.user.email || "",
            name: userData?.name || "User",
            avatar: userData?.avatar_url,
          },
        });

        history.push("/app/profile");
      } else {
        signOut();
      }
    } catch (error: any) {
      console.error("Error signing in:", error.message);
      signOut();
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      // Validate email and password
      if (!email.includes("@")) {
        throw new Error("Please enter a valid email address");
      }

      if (password.length < 6) {
        throw new Error("Password must be at least 6 characters long");
      }

      console.log("email", email);
      console.log("password", password);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      console.log("data", data);
      console.log("error", error);

      if (error) {
        throw error;
      }

      if (data?.user) {
        const { data: userData } = await supabase
          .from("users")
          .select("*")
          .eq("id", data.user.id)
          .single();

        try {
          const response = await profileService.createProfile({
            name: userData?.name || "User",
          });

          console.log("profileData", response.data);
          if (response.status === 200) {
            setProfile(response.data);
          } else {
            console.error("Failed to create profile");
          }
        } catch (error) {
          console.error("Error signing up:", error);
        }
      } else {
        signOut();
      }
      setIsLoading(false);
    } catch (error: any) {
      console.error("Error signing up:", error.message);
      signOut();
    }
  };

  const signOut = async () => {
    setIsLoading(true);
    try {
      localStorage.clear();
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw error;
      }
      setSession(null);
      setProfile(null);
      setIsDirectChat(false);
      setIsLoading(false);
      console.log("window.location.pathname", window.location.pathname);
      if (window.location.pathname !== "/onboarding-chat") {
        history.push("/");
      }
    } catch (error: any) {
      console.error("Error signing out:", error.message);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthCallback = async () => {
    try {
      const {
        data: { session },
        error,
      } = await supabase.auth.getSession();

      if (error) throw error;

      if (session?.user) {
        console.log("User metadata:", session.user.user_metadata);
        console.log("User:", session.user);
        
        const name = session.user.user_metadata?.full_name || 
                    session.user.user_metadata?.name ||
                    session.user.email?.split("@")[0] || 
                    "User";
                    
        // Set session first to ensure we have authentication for API calls
        setSession({
          access_token: session.access_token,
          user: {
            id: session.user.id,
            email: session.user.email || "",
            name: name,
            avatar: session.user.user_metadata.avatar_url,
          },
        });
        
        // Then get or create MongoDB user profile
        await handleMongoDBUser(name);
        await handleMongoDBConnect();
      }
    } catch (error) {
      console.error("Error in auth callback:", error);
      throw error;
    }
  };

  const handleMongoDBUser = async (name: string | null) => {
    try {
      console.log("Fetching user profile from MongoDB...");
      const response = await profileService.getUserProfile();

      console.log("getUserProfile response", response);

      if (response.status === 200) {
        console.log("Profile found, setting profile state");
        setProfile(response.data);
        return;
      } 
      
      console.error("Failed to fetch profile with status:", response.status);
    } catch (error: any) {
      console.error("Error fetching profile:", error?.response?.status, error?.response?.data);
      
      if (error?.response?.status === 404 || error?.response?.data?.error === "Profile not found") {
        console.log("Profile not found, creating new profile with name:", name);
        try {
          const createResponse = await profileService.createProfile({
            name: name || "User",
          });
          
          console.log("Profile creation response:", createResponse);

          if (createResponse.status === 200) {
            setProfile(createResponse.data);
          } else {
            console.error("Failed to create profile:", createResponse);
          }
        } catch (createError) {
          console.error("Error creating profile:", createError);
        }
      }
    }
  };

  const handleMongoDBConnect = async () => {
    const response = await connectService.getConnect();
    console.log("getConnect response", response);

    if (response.status === 200) {
      setConnect(response.data);
    } else {
      console.error("Failed to fetch connect");
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        setSession,
        user: session?.user || null,
        profile,
        setProfile,
        connect,
        setConnect,
        isLoading,
        setIsLoading,
        isDirectChat,
        setIsDirectChat,
        signIn,
        signUp,
        signOut,
        handleAuthCallback,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
