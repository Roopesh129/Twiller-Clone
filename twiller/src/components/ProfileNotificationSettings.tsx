"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import { requestNotificationPermission } from "@/lib/notificationManager";
import { Bell, BellOff } from "lucide-react";

export default function ProfileNotificationSettings() {
  const { user, setUser } = useAuth();

  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(
    ((user as any)?.notificationsEnabled as boolean) ?? true
  );
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    const userNotificationsEnabled = (user as any)?.notificationsEnabled;
    if (user && typeof userNotificationsEnabled === "boolean") {
      setNotificationsEnabled(userNotificationsEnabled);
    }
  }, [user]);

  const handleToggle = async () => {
    const nextState = !notificationsEnabled;

    // Request browser permission when enabling
    if (nextState) {
      const granted = await requestNotificationPermission();
      if (!granted) {
        alert("Please allow notification permissions in your browser settings to receive alerts.");
        return;
      }
    }

    setLoading(true);
    try {
      setNotificationsEnabled(nextState);

      // Save preference to MongoDB
      if (user?._id) {
        await axiosInstance.put("/api/user/preferences/notifications", {
          userId: user._id,
          notificationsEnabled: nextState,
        });
      }

      // Update local Auth Context
      if (setUser && user) {
        setUser({ ...user, notificationsEnabled: nextState });
      }
    } catch (error) {
      console.error("Failed to save notification preference:", error);
      setNotificationsEnabled(!nextState); // Rollback state on error
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border-b border-gray-800 text-white max-w-xl">
      <h2 className="font-bold text-lg mb-3">Notification Preferences</h2>

      <div className="flex items-center justify-between p-4 bg-gray-950 rounded-2xl border border-gray-800">
        <div className="flex items-center space-x-3">
          {notificationsEnabled ? (
            <Bell className="h-6 w-6 text-sky-500" />
          ) : (
            <BellOff className="h-6 w-6 text-gray-500" />
          )}
          <div>
            <p className="font-bold text-sm">Keyword Popup Alerts</p>
            <p className="text-xs text-gray-400">
              Trigger browser notifications for tweets containing "cricket" or "science".
            </p>
          </div>
        </div>

        <button
          onClick={handleToggle}
          disabled={loading}
          type="button"
          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
            notificationsEnabled ? "bg-sky-500" : "bg-gray-700"
          }`}
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
              notificationsEnabled ? "translate-x-6" : "translate-x-1"
            }`}
          />
        </button>
      </div>
    </div>
  );
}