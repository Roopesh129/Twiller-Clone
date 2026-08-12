// components/profile/Profile.tsx
"use client";

import React, { useState, useEffect } from "react";
import { requestNotificationPermission } from "@/lib/notificationManager";

export default function Profile() {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem("userNotificationsEnabled");
    if (saved !== null) {
      setNotificationsEnabled(saved === "true");
    }
  }, []);

  const handleToggle = async () => {
    if (!notificationsEnabled) {
      const granted = await requestNotificationPermission();
      if (granted) {
        setNotificationsEnabled(true);
        localStorage.setItem("userNotificationsEnabled", "true");
      } else {
        alert("Browser notification permissions are blocked.");
      }
    } else {
      setNotificationsEnabled(false);
      localStorage.setItem("userNotificationsEnabled", "false");
    }
  };

  if (!mounted) return <div className="p-4 text-gray-400">Loading profile...</div>;

  return (
    <div className="max-w-xl mx-auto p-6 bg-slate-900 text-white rounded-lg border border-slate-800">
      <h1 className="text-2xl font-bold mb-4">Profile Settings</h1>
      
      <div className="flex items-center justify-between p-4 bg-slate-800 rounded-md">
        <div>
          <h2 className="font-semibold text-lg">Keyword Notifications</h2>
          <p className="text-sm text-slate-400">
            Get browser alerts for tweets mentioning "cricket" or "science"
          </p>
        </div>

        <button
          onClick={handleToggle}
          className={`px-4 py-2 rounded-full font-medium transition-colors ${
            notificationsEnabled
              ? "bg-green-600 hover:bg-green-700 text-white"
              : "bg-slate-700 hover:bg-slate-600 text-slate-300"
          }`}
        >
          {notificationsEnabled ? "Enabled" : "Disabled"}
        </button>
      </div>
    </div>
  );
}