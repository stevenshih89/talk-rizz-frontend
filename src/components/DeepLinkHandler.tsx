// src/components/DeepLinkHandler.tsx
import { useEffect } from "react";
import { App, URLOpenListenerEvent } from "@capacitor/app";
import { supabase } from "../config/supabase";
import { useAuth } from "../contexts/AuthContext";
import { useHistory } from "react-router-dom";

export const DeepLinkHandler = () => {
  const { handleAuthCallback } = useAuth();
  const history = useHistory();
  
  const handleDeepLink = async (event: URLOpenListenerEvent) => {
    const { url } = event;
    console.log("Deep link received:", url);
    
    if (url.includes("io.catnnect.connect://oauth")) {
      console.log("Processing OAuth callback...");
      
      try {
        // Parse the URL to extract parameters
        const urlObj = new URL(url);
        const code = urlObj.searchParams.get("code");
        const error = urlObj.searchParams.get("error");
        const errorDescription = urlObj.searchParams.get("error_description");
        const provider = urlObj.searchParams.get("provider") || "unknown";

        console.log(`OAuth callback for provider: ${provider}`);
        
        // Handle OAuth errors
        if (error) {
          console.error("OAuth error:", error, errorDescription);
          history.replace("/auth/error?error=" + encodeURIComponent(error));
          return;
        }

        if (!code) {
          console.error("No authorization code found in URL");
          history.replace("/auth/error?error=no_code");
          return;
        }

        console.log("Exchanging code for session...");
        
        // Exchange the authorization code for a session
        const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

        if (exchangeError) {
          console.error("Code exchange error:", exchangeError);
          history.replace("/auth/error?error=" + encodeURIComponent(exchangeError.message));
          return;
        }

        if (!data.session) {
          console.error("No session returned from code exchange");
          history.replace("/auth/error?error=no_session");
          return;
        }

        console.log("Session created successfully:", {
          user: data.session.user.email,
          provider: data.session.user.app_metadata?.provider
        });

        // Handle the auth callback to set up user profile
        await handleAuthCallback();
        
        // Navigate to the main app
        history.replace("/app/profile");
        
      } catch (err) {
        console.error("Error processing OAuth callback:", err);
        history.replace("/auth/error?error=" + encodeURIComponent("callback_processing_failed"));
      }
    }
  };

  useEffect(() => {
    // Variable to store the listener handle once resolved
    let listenerCleanup: (() => void) | undefined;
    
    // Add the app URL open listener
    App.addListener("appUrlOpen", handleDeepLink).then(listener => {
      listenerCleanup = () => listener.remove();
    });

    // Check if we were opened with a deep link
    App.getLaunchUrl().then(result => {
      if (result && result.url) {
        console.log("App was launched with URL:", result.url);
        handleDeepLink({ url: result.url });
      }
    });

    // Cleanup listener on unmount
    return () => {
      if (listenerCleanup) {
        listenerCleanup();
      }
    };
  }, [handleAuthCallback, history]);

  return null; // This component doesn't render anything
};
