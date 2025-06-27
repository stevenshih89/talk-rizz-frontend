import axios from "axios";
import { supabase } from "./supabase";

// Create an Axios instance with default configuration
const axiosInstance = axios.create({
  baseURL: "https://rizz-be.racewonder.cam/api",
  // baseURL: "http://localhost:8087/api",
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000, // 30 seconds timeout
});

// Request interceptor for adding auth token
axiosInstance.interceptors.request.use(
  async (config) => {
    // Get token from localStorage if available
    // Get token from supabase session
    // Import supabase client

    // Get the current session from supabase
    const getSupabaseToken = async () => {
      const { data } = await supabase.auth.getSession();
      return data.session?.access_token;
    };

    // Try to get token from supabase session
    let token;
    try {
      token = await getSupabaseToken();
    } catch (error) {
      console.error("Error getting Supabase token:", error);
    }

    // If token exists, add it to the headers
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for handling errors
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear token and redirect to login if needed
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        // Redirect logic can be added here if needed
      }
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
