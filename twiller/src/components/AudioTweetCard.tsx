"use client";

import React, { useRef, useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import { Card, CardContent } from "./ui/card";
import {
  Heart,
  MessageCircle,
  Repeat2,
  Share,
  MoreHorizontal,
  Play,
  Pause,
} from "lucide-react";

interface AudioTweetProps {
  tweetId: string;
  authorDisplayName: string;
  authorUsername: string;
  authorAvatar?: string;
  content?: string;
  audioUrl: string;
  audioDuration?: number;
  createdAt: string;
  likes?: number;
  retweets?: number;
  comments?: number;
  isLiked?: boolean;
  isRetweet?: boolean;
  onLike?: () => void;
  onRetweet?: () => void;
}

export default function AudioTweetCard({
  tweetId,
  authorDisplayName,
  authorUsername,
  authorAvatar,
  content,
  audioUrl,
  audioDuration = 0,
  createdAt,
  likes = 0,
  retweets = 0,
  comments = 0,
  isLiked = false,
  isRetweet = false,
  onLike,
  onRetweet,
}: AudioTweetProps) {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(audioDuration);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // GLOBAL AUDIO SINGLETON LISTENER
  // Listens for a custom 'audio-play-started' event to pause other playing audios
  useEffect(() => {
    const handleOtherAudioPlay = (e: CustomEvent) => {
      if (e.detail?.id !== tweetId && isPlaying && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }
    };

    window.addEventListener(
      "audio-play-started",
      handleOtherAudioPlay as EventListener
    );
    return () => {
      window.removeEventListener(
        "audio-play-started",
        handleOtherAudioPlay as EventListener
      );
    };
  }, [tweetId, isPlaying]);

  const togglePlay = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      // Dispatch event to stop all other playing audio cards
      window.dispatchEvent(
        new CustomEvent("audio-play-started", { detail: { id: tweetId } })
      );
      audioRef.current.play().catch((err) => console.error("Playback error:", err));
      setIsPlaying(true);
    }
  };

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (audioRef.current && audioRef.current.duration) {
      setDuration(audioRef.current.duration);
    }
  };

  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const formatNumber = (num: number) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getAudioSource = (url: string) => {
    if (!url) return "";
    if (url.startsWith("http://") || url.startsWith("https://")) return url;
    const cleanPath = url.startsWith("/") ? url : `/${url}`;
    const backendPort = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    return `${backendPort}${cleanPath}`;
  };

  const resolvedAudioUrl = getAudioSource(audioUrl);
  const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <Card className="bg-background border-border border-x-0 border-t-0 rounded-none hover:bg-accent/30 transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex space-x-3">
          {/* Avatar with Voice Ring Indicator */}
          <div className="relative shrink-0">
            <Avatar className="h-12 w-12 ">
              <AvatarImage src={authorAvatar} alt={authorDisplayName} />
              <AvatarFallback>{authorDisplayName.charAt(0)}</AvatarFallback>
            </Avatar>
            {isPlaying && (
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-sky-500" />
              </span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            {/* Tweet Header */}
            <div className="flex items-center space-x-2 mb-1">
              <span className="font-bold text-foreground text-sm truncate">
                {authorDisplayName}
              </span>
              <span className="text-muted-foreground text-xs truncate">
                @{authorUsername} · {createdAt}
              </span>
              <div className="ml-auto">
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-1 rounded-full hover:bg-sky-500/10 group-hover:text-sky-500"
                >
                  <MoreHorizontal className="h-5 w-5 text-muted-foreground" />
                </Button>
              </div>
            </div>

            {/* Content Caption */}
            {content && (
              <div className="text-foreground mb-3 text-sm leading-relaxed break-words">
                {content}
              </div>
            )}

            {/* TWITTER EXACT VOICE PLAYER PILL */}
            <div className="my-2 bg-gradient-to-r from-sky-500 to-blue-600 rounded-3xl p-3.5 text-white shadow-sm max-w-md">
              <div className="flex items-center space-x-3">
                <button
                  type="button"
                  onClick={togglePlay}
                  className="w-10 h-10 rounded-full bg-white text-sky-600 flex items-center justify-center hover:scale-105 active:scale-95 transition shrink-0 shadow-md"
                >
                  {isPlaying ? (
                    <Pause className="h-5 w-5 fill-current" />
                  ) : (
                    <Play className="h-5 w-5 fill-current ml-0.5" />
                  )}
                </button>

                <div className="flex-1 min-w-0">
                  <div className="flex justify-between text-xs font-semibold tracking-wide mb-1.5 opacity-90">
                    <span>Voice Note</span>
                    <span>
                      {isPlaying ? formatTime(currentTime) : formatTime(duration)}
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="h-1.5 w-full bg-white/30 rounded-full overflow-hidden relative">
                    <div
                      className="h-full bg-white transition-all duration-100 ease-linear"
                      style={{ width: `${Math.min(progressPercentage, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

              <audio
                ref={audioRef}
                src={resolvedAudioUrl}
                onTimeUpdate={handleTimeUpdate}
                onLoadedMetadata={handleLoadedMetadata}
                onEnded={() => {
                  setIsPlaying(false);
                  setCurrentTime(0);
                }}
                className="hidden"
                preload="metadata"
              />
            </div>

            {/* Twitter Engagement Action Bar */}
            <div className="flex items-center justify-between max-w-md mt-3">
              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-sky-500/10 text-muted-foreground hover:text-sky-500 group"
              >
                <MessageCircle className="h-5 w-5 group-hover:text-sky-500" />
                <span className="text-sm">{formatNumber(comments)}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-2 p-2 rounded-full hover:bg-emerald-500/10 group ${
                  isRetweet ? "text-emerald-500" : "text-muted-foreground hover:text-emerald-500"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onRetweet?.();
                }}
              >
                <Repeat2
                  className={`h-5 w-5 ${
                    isRetweet ? "text-emerald-500" : "group-hover:text-emerald-500"
                  }`}
                />
                <span className="text-sm">{formatNumber(retweets)}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className={`flex items-center space-x-2 p-2 rounded-full hover:bg-pink-600/10 group ${
                  isLiked ? "text-pink-600" : "text-muted-foreground hover:text-pink-600"
                }`}
                onClick={(e) => {
                  e.stopPropagation();
                  onLike?.();
                }}
              >
                <Heart
                  className={`h-5 w-5 ${
                    isLiked ? "text-pink-600 fill-current" : "group-hover:text-pink-600"
                  }`}
                />
                <span className="text-sm">{formatNumber(likes)}</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                className="flex items-center space-x-2 p-2 rounded-full hover:bg-sky-500/10 text-muted-foreground hover:text-sky-500 group"
              >
                <Share className="h-5 w-5 group-hover:text-sky-500" />
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
