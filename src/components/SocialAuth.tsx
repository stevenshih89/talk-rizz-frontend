import React, { useState } from "react";
import { IonButton, IonIcon } from "@ionic/react";
import { logoGoogle, logoApple } from "ionicons/icons";
import { supabase } from "../config/supabase";
import { Provider } from "@supabase/supabase-js";
import { getPlatforms } from "@ionic/react";
import { Capacitor } from "@capacitor/core";
import {
  SignInWithApple,
  SignInWithAppleOptions,
  SignInWithAppleResponse,
} from "@capacitor-community/apple-sign-in";
import "./SocialAuth.css";

interface SocialAuthProps {
  onError: (error: string) => void;
  onSuccess?: (data: any) => void;
}

const SocialAuth: React.FC<SocialAuthProps> = ({ onError, onSuccess }) => {
  const [isAppleLoading, setIsAppleLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const saveSessionData = (session: any) => {
    // Store session data in localStorage or your preferred storage
    localStorage.setItem("supabase.auth.token", JSON.stringify(session));
  };

  const saveUserData = (email: string, userId: string) => {
    // Store user data in localStorage or your preferred storage
    localStorage.setItem("user.email", email);
    localStorage.setItem("user.id", userId);
  };

  const handleSuccessfulSignIn = (data: any) => {
    console.log("Successful sign in:", data);
    if (onSuccess) {
      onSuccess(data);
    }
    // window.location.href = "/";
    // Additional success handling logic here
  };

  const handleAppleSignIn = async () => {
    setIsAppleLoading(true);
    console.log("Starting Apple Sign In process...");

    if (Capacitor.isNativePlatform()) {
      console.log("Using native Apple Sign In");
      let options: SignInWithAppleOptions = {
        clientId: "com.catnnect.ios",
        redirectURI: "App://oauth",
        scopes: "email name",
      };

      try {
        console.log("Calling SignInWithApple.authorize with options:", options);
        const appleResponse: SignInWithAppleResponse =
          await SignInWithApple.authorize(options);
        console.log("Apple response received:", appleResponse);

        if (!appleResponse.response || !appleResponse.response.identityToken) {
          console.error("No identity token received from Apple");
          setIsAppleLoading(false);
          onError("No identity token received from Apple");
          return;
        }

        console.log("Signing in to Supabase with Apple token");
        const { data, error } = await supabase.auth.signInWithIdToken({
          provider: "apple",
          token: appleResponse.response.identityToken,
        });

        if (error) {
          console.error("Supabase Apple login error:", error);
          setIsAppleLoading(false);
          onError(error.message);
          return;
        }

        console.log("Supabase auth successful:", data);
        if (!data.session?.user?.email) {
          console.error("No email received from Apple Sign In");
          setIsAppleLoading(false);
          onError("No email received from Apple Sign In");
          return;
        }

        const session = data.session;
        const userEmail = session.user.email!; // We already checked it exists above
        const userId = session.user.id;

        saveSessionData(session);
        saveUserData(userEmail, userId);

        if (data?.session?.access_token && data?.user?.email) {
          handleSuccessfulSignIn(data);
        }

        setIsAppleLoading(false);
      } catch (err) {
        console.error("Apple Sign In error:", err);
        setIsAppleLoading(false);
        onError(
          err instanceof Error ? err.message : "Apple authentication failed"
        );
      }
    } else {
      // Fallback to web OAuth for web platform
      console.log("Using web OAuth for Apple Sign In");
      try {
        await handleSocialAuth("apple");
      } catch (err) {
        setIsAppleLoading(false);
        console.error("Apple web auth error:", err);
        onError(
          err instanceof Error ? err.message : "Apple authentication failed"
        );
      }
    }
  };

  const handleSocialAuth = async (provider: Provider) => {
    try {
      if (provider === "google") {
        setIsGoogleLoading(true);
      }

      const platforms = getPlatforms();
      const isAndroid = platforms.includes("android");
      const isIOS = platforms.includes("ios");
      const isMobile = isAndroid || isIOS;

      // const isMobile = true;

      // Determine redirect URL based on platform
      let redirectTo: string;

      if (isMobile) {
        if (isIOS) {
          redirectTo = "App://oauth";
        } else {
          redirectTo = "io.catnnect.connect://oauth";
        }
      } else {
        // Web fallback
        redirectTo = `${window.location.origin}/auth/callback`;
      }

      console.log("Using redirect URL:", redirectTo);

      // Configure auth options based on provider
      const authOptions: any = {
        redirectTo,
        skipBrowserRedirect: isMobile, // Skip browser redirect on mobile
      };

      // Provider-specific configurations
      if (provider === "google") {
        authOptions.queryParams = {
          access_type: "offline",
          prompt: "consent",
        };
      }

      const { data, error } = await supabase.auth.signInWithOAuth({
        provider,
        options: authOptions,
      });

      if (error) {
        throw error;
      }

      console.log("Auth data:", data);

      // For mobile platforms, we need to handle the redirect manually
      if (isMobile && data?.url) {
        // Open the URL in the device's browser
        window.location.href = data.url;
      }

      if (provider === "google") {
        setIsGoogleLoading(false);
      }
    } catch (err) {
      if (provider === "google") {
        setIsGoogleLoading(false);
      }
      console.error(`${provider} authentication error:`, err);
      onError(err instanceof Error ? err.message : "Authentication failed");
    }
  };

  return (
    <div className="social-auth-buttons">
      <IonButton
        expand="block"
        fill="outline"
        onClick={() => handleSocialAuth("google")}
        className="google-btn"
        disabled={isGoogleLoading || isAppleLoading}
      >
        <IonIcon slot="start" icon={logoGoogle} />
        {isGoogleLoading ? "Signing in..." : "Continue with Google"}
      </IonButton>

      <IonButton
        expand="block"
        fill="outline"
        onClick={handleAppleSignIn}
        className="apple-btn"
        disabled={isAppleLoading || isGoogleLoading}
      >
        <IonIcon slot="start" icon={logoApple} />
        {isAppleLoading ? "Signing in..." : "Continue with Apple"}
      </IonButton>
    </div>
  );
};

export default SocialAuth;
