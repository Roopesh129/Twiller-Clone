"use client";

import React, { useState, useEffect } from "react";

const PREFERENCES_KEY = "notificationPreferences";

const loadNotificationPreferences = (): { cricket: boolean; science: boolean } => {
  if (typeof window === "undefined") {
    return { cricket: false, science: false };
  }

  try {
    const stored = window.localStorage.getItem(PREFERENCES_KEY);
    if (!stored) return { cricket: false, science: false };

    const parsed = JSON.parse(stored);
    return {
      cricket: typeof parsed.cricket === "boolean" ? parsed.cricket : false,
      science: typeof parsed.science === "boolean" ? parsed.science : false,
    };
  } catch {
    return { cricket: false, science: false };
  }
};

const saveNotificationPreferences = (prefs: { cricket: boolean; science: boolean }) => {
  if (typeof window === "undefined") return;

  try {
    window.localStorage.setItem(PREFERENCES_KEY, JSON.stringify(prefs));
  } catch {
    // ignore storage errors
  }
};

export default function NotificationSettings() {
  const [prefs, setPrefs] = useState<{ cricket: boolean; science: boolean }>({
    cricket: false,
    science: false,
  });
  const [permissionGranted, setPermissionGranted] = useState<boolean>(false);

  useEffect(() => {
    // Load initial preferences from local storage / manager
    const currentPrefs = loadNotificationPreferences();
    setPrefs(currentPrefs);

    if (typeof window !== "undefined" && "Notification" in window) {
      setPermissionGranted(Notification.permission === "granted");
    }
  }, []);

  const requestBrowserPermission = async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setPermissionGranted(permission === "granted");
    }
  };

  const handleToggle = (keyword: "cricket" | "science") => {
    const updated = { ...prefs, [keyword]: !prefs[keyword] };
    setPrefs(updated);
    saveNotificationPreferences(updated);
  };

  return (
    <div className="w-full p-4 sm:p-6 text-foreground min-h-screen">
      <h1 className="text-2xl font-bold mb-2">Notification Settings</h1>
      <p className="text-muted-foreground text-sm mb-6">
        Select topic keywords to receive real-time browser alerts whenever matching posts are published.
      </p>

      {!permissionGranted && (
        <div className="bg-yellow-500/10 border border-yellow-500/50 rounded-xl p-4 mb-6 flex items-center justify-between">
          <p className="text-sm text-yellow-600 dark:text-yellow-200">
            Browser notifications are currently disabled. Please grant permission to receive alerts.
          </p>
          <button
            onClick={requestBrowserPermission}
            className="bg-yellow-500 hover:bg-yellow-600 text-white text-xs font-semibold px-3 py-2 rounded-lg transition"
          >
            Enable Browser Alerts
          </button>
        </div>
      )}

      <div className="space-y-4">
        {/* Cricket Keyword Toggle */}
        <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border shadow-sm">
          <div>
            <h3 className="font-semibold text-lg text-foreground">Cricket Alerts</h3>
            <p className="text-xs text-muted-foreground">Get notified when a tweet contains "cricket"</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.cricket}
              onChange={() => handleToggle("cricket")}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>

        {/* Science Keyword Toggle */}
        <div className="flex items-center justify-between p-4 bg-background rounded-xl border border-border shadow-sm">
          <div>
            <h3 className="font-semibold text-lg text-foreground">Science Alerts</h3>
            <p className="text-xs text-muted-foreground">Get notified when a tweet contains "science"</p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={prefs.science}
              onChange={() => handleToggle("science")}
              className="sr-only peer"
            />
            <div className="w-11 h-6 bg-muted-foreground/30 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
          </label>
        </div>
      </div>
    </div>
  );
}