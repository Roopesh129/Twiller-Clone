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

  if (!isEnabled) {
    alert("Notification skipped because they are toggled OFF (or the browser hasn't synced the setting yet. Please visit the Profile page!).");
    return;
  }

  // 2. Ensure Browser API support & granted permission
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }
  
  if (Notification.permission !== "granted") {
    alert("Notification permission is not granted! Please allow it in your browser settings.");
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
      alert(`SYSTEM NOTIFICATION: ${title}\n\n(If you did not see a desktop popup, Windows Do Not Disturb is blocking it!)`);
      // Prioritize classic Notification constructor for reliable desktop testing
      new Notification(title, options);
    } catch (err) {
      console.warn("Classic Notification failed (likely mobile browser). Attempting ServiceWorker fallback...", err);
      try {
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.ready;
          if (registration && registration.showNotification) {
            await registration.showNotification(title, options);
          }
        }
      } catch (swErr) {
        console.error("ServiceWorker notification fallback also failed:", swErr);
      }
    }
  }
};