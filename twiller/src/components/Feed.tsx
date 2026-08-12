'use client';

import React, { useEffect, useState, useRef } from "react";
import LoadingSpinner from "./loading-spinner";
import TweetCard from "./TweetCard";
import TweetComposer from "./TweetComposer";
import axiosInstance from "@/lib/axiosInstance";
import { checkAndTriggerNotification } from "@/lib/notificationManager";
import { useAuth } from "@/context/AuthContext";
import { useLanguage } from "@/context/LanguageContext";

export interface Tweet {
  _id: string;
  author: {
    id: string;
    username: string;
    displayName: string;
    avatar: string;
    verified?: boolean;
  };
  content: string;
  timestamp: string;
  likes: number;
  retweets: number;
  comments: number;
  liked?: boolean;
  retweeted?: boolean;
  image?: string;
  mediaType?: 'text' | 'image' | 'video' | 'audio';
  audioUrl?: string;
  audioDuration?: number;
}

const Feed = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const [tweets, setTweets] = useState<Tweet[]>([]);
  const [loading, setloading] = useState(false);

  const seenTweetIds = useRef<Set<string>>(new Set());

  const normalizeBackendTweets = (rawItems: any[]): Tweet[] => {
    if (!Array.isArray(rawItems)) return [];

    return rawItems.map((item) => {
      const isAuthorObject = item.author && typeof item.author === 'object';

      const authorObj = isAuthorObject
        ? {
            id: item.author._id || item.author.id || "unknown",
            username: item.author.username || item.author.name || "anonymous",
            displayName: item.author.displayName || item.author.name || item.author.username || "Anonymous User",
            avatar: item.author.avatar || "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png",
            verified: item.author.verified || false
          }
        : {
            id: item.author || item.user?._id || "unknown",
            username: "anonymous",
            displayName: "Anonymous User",
            avatar: "https://abs.twimg.com/sticky/default_profile_images/default_profile_400x400.png",
            verified: false
          };

      return {
        _id: item._id,
        content: item.content || item.text || "",
        image: item.image || undefined,
        timestamp: item.createdAt || "Just now",
        likes: item.likes || 0,
        retweets: item.retweets || 0,
        comments: item.comments || 0,
        liked: false,
        retweeted: false,
        author: authorObj,
        mediaType: item.mediaType || (item.audioUrl ? 'audio' : 'text'),
        audioUrl: item.audioUrl || undefined,
        audioDuration: item.audioDuration || 0,
        replies: item.replies || []
      };
    });
  };

  const triggerNotificationForTweet = (tweet: Tweet) => {
    if (!tweet._id || seenTweetIds.current.has(tweet._id)) return;

    seenTweetIds.current.add(tweet._id);

    const authorName = tweet.author?.displayName || tweet.author?.username || "User";

    const isEnabledLocal = typeof window !== "undefined" ? localStorage.getItem("userNotificationsEnabled") : null;
    const userNotificationsEnabled = isEnabledLocal !== null 
      ? isEnabledLocal === "true" 
      : ((user as any)?.notificationsEnabled ?? true);

    checkAndTriggerNotification(
      tweet.content || "",
      authorName,
      userNotificationsEnabled
    );
  };

  const fetchTweets = async () => {
    try {
      setloading(true);
      const res = await axiosInstance.get("/post");
      const cleanTweets = normalizeBackendTweets(res.data);

      cleanTweets.forEach((tweet) => {
        if (tweet._id) seenTweetIds.current.add(tweet._id);
      });

      setTweets(cleanTweets);
    } catch (error) {
      console.error("Error downloading feed updates:", error);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  const handlenewtweet = (newtweet: any) => {
    const wrappedTweet = normalizeBackendTweets([newtweet])[0];
    if (wrappedTweet) {
      triggerNotificationForTweet(wrappedTweet);
      setTweets((prev) => [wrappedTweet, ...prev]);
    }
  };

  return (
    <div className="w-full max-w-[600px] border-x border-border min-h-screen pb-20 bg-background text-foreground">
      
      {/* Sticky Header with Backdrop Blur */}
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-md border-b border-border flex flex-col cursor-pointer">
        <div className="px-4 py-3 text-xl font-bold hidden sm:block">{t("home") || "Home"}</div>
        
        {/* Custom Twitter-Style Tabs without Shadcn Borders */}
        <div className="flex w-full overflow-x-auto no-scrollbar">
          {[t("explore") || "For you", "Following", "Sports", "Tech", "Gaming"].map((tab, idx) => (
            <div key={tab} className="flex-1 min-w-[100px] hover:bg-accent transition-colors flex items-center justify-center cursor-pointer">
              <div className={`relative py-4 text-[15px] whitespace-nowrap px-2 flex flex-col items-center ${idx === 0 ? 'text-foreground font-bold' : 'text-muted-foreground font-medium hover:text-foreground'}`}>
                {tab}
                {idx === 0 && <div className="absolute bottom-0 h-1 w-12 rounded-full bg-primary"></div>}
              </div>
            </div>
          ))}
          <div className="min-w-[60px] hover:bg-accent transition-colors flex items-center justify-center cursor-pointer">
            <div className="py-4 text-muted-foreground font-medium hover:text-foreground text-[15px]">+</div>
          </div>
        </div>
      </header>

      {/* Your Composer Component embedded in the layout */}
      <div className="border-b border-border">
        <TweetComposer onTweetPosted={handlenewtweet} />
      </div>

      {/* The Feed */}
      <div className="divide-y divide-border">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center">
            <LoadingSpinner size="lg" className="mb-4" />
            <p className="text-muted-foreground font-medium">{t("more") || "Loading"}...</p>
          </div>
        ) : (
          tweets.map((tweet) => <TweetCard key={tweet._id} tweet={tweet} />)
        )}
      </div>
      
    </div>
  );
};

export default Feed;