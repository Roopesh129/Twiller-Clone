/**
 * Utility to request permission and display browser notifications
 * when a tweet contains "cricket" or "science".
 */

export const requestNotificationPermission = async (): Promise<boolean> => {
  if (typeof window === "undefined" || !("Notification" in window)) {
    console.warn("This browser does not support desktop notifications.");
    return false;
  }

  if (Notification.permission === "granted") {
    return true;
  }

  if (Notification.permission !== "denied") {
    const permission = await Notification.requestPermission();
    return permission === "granted";
  }

  return false;
};

export const checkAndTriggerNotification = async (
  tweetContent: string,
  authorName: string,
  userNotificationsEnabled: boolean
) => {
  // 1. Check user preference from parameter or localStorage
  const isEnabled =
    userNotificationsEnabled ??
    (typeof window !== "undefined" &&
      localStorage.getItem("userNotificationsEnabled") === "true");

  if (!isEnabled) return;

  // 2. Ensure Browser API support & granted permission
  if (
    typeof window === "undefined" ||
    !("Notification" in window) ||
    Notification.permission !== "granted"
  ) {
    return;
  }

  if (!tweetContent) return;

  // 3. Keyword Check: "cricket" or "science" (case-insensitive)
  const lowerContent = tweetContent.toLowerCase();
  const hasCricket = lowerContent.includes("cricket");
  const hasScience = lowerContent.includes("science");

  if (hasCricket || hasScience) {
    const topic = hasCricket ? "Cricket" : "Science";
    const title = `New ${topic} Tweet from ${authorName}`;
    const options: NotificationOptions = {
      body: tweetContent,
      icon: "https://abs.twimg.com/favicons/twitter.3.ico",
      dir: "auto",
      requireInteraction: true,
    };

    try {
      // Modern approach: Check if Service Worker is active WITH a timeout fallback
      if ("serviceWorker" in navigator && navigator.serviceWorker.controller) {
        const swPromise = navigator.serviceWorker.ready;
        // Timeout after 500ms if SW is stuck
        const timeoutPromise = new Promise((resolve) => setTimeout(resolve, 500));
        
        const registration = await Promise.race([swPromise, timeoutPromise]) as ServiceWorkerRegistration | undefined;

        if (registration && registration.showNotification) {
          await registration.showNotification(title, options);
          return;
        }
      }

      // Fallback to classic Constructor
      new Notification(title, options);
    } catch (err) {
      console.error("Failed to trigger browser notification:", err);
      // Direct fallback attempt if SW fails
      try {
        new Notification(title, options);
      } catch (fallbackErr) {
        console.error("Classic notification failed:", fallbackErr);
      }
    }
  }
};