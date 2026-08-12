import axios from "axios";

const axiosInstance = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000", // Points to Vercel env or falls back to local
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Structural Interceptor to accurately forward custom client platform properties
axiosInstance.interceptors.request.use(
  (config) => {
    // Explicit runtime device context flag assertion logic
    const isMobileDevice = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
    
    config.headers["x-client-device"] = isMobileDevice ? "mobile" : "desktop";
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export default axiosInstance;