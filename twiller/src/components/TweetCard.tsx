"use client";

import React, { useState, useEffect } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Button } from "./ui/button";
import {
  Heart,
  MessageCircle,
  Repeat2,
  MoreHorizontal,
  Bookmark,
  Upload,
  X
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import axiosInstance from "@/lib/axiosInstance";
import AudioTweetCard from "./AudioTweetCard";

const getMediaUrl = (url?: string) => {
  if (!url) return "";
  if (url.startsWith("http")) return url;
  const baseUrl = (process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000").replace(/\/+$/, "");
  return `${baseUrl}${url.startsWith("/") ? "" : "/"}${url}`;
};

export default function TweetCard({ tweet }: any) {
  const { user } = useAuth();
  const [tweetstate, settweetstate] = useState(tweet);

  // Keep local tweet state perfectly synced when parent props update
  useEffect(() => {
    settweetstate(tweet);
  }, [tweet]);
  
  // Reply Modal States
  const [showReplyModal, setShowReplyModal] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [isReplying, setIsReplying] = useState(false);

  // OPTIMISTIC UPDATE: Like
  const likeTweet = async (tweetId: string) => {
    const currentUserId = user?._id?.toString();
    const likedByArray = (tweetstate.likedBy || []).map((id: any) => id?.toString());
    const currentlyLiked = currentUserId ? likedByArray.includes(currentUserId) : false;

    settweetstate((prev: any) => {
      const prevLikedBy = (prev.likedBy || []).map((id: any) => id?.toString());
      const newLikedBy = currentlyLiked 
        ? prevLikedBy.filter((id: string) => id !== currentUserId)
        : [...prevLikedBy, currentUserId];
        
      return {
        ...prev,
        likedBy: newLikedBy,
        likes: currentlyLiked ? Math.max(0, (prev.likes || 1) - 1) : (prev.likes || 0) + 1,
      };
    });

    try {
      const res = await axiosInstance.post(`/like/${tweetId}`, { userId: user?._id });
      settweetstate(res.data);
    } catch (error) {
      console.error("Like failed", error);
    }
  };

  // OPTIMISTIC UPDATE: Retweet
  const retweetTweet = async (tweetId: string) => {
    const currentUserId = user?._id?.toString();
    const retweetedByArray = (tweetstate.retweetedBy || []).map((id: any) => id?.toString());
    const currentlyRetweeted = currentUserId ? retweetedByArray.includes(currentUserId) : false;

    settweetstate((prev: any) => {
      const prevRetweetedBy = (prev.retweetedBy || []).map((id: any) => id?.toString());
      const newRetweetedBy = currentlyRetweeted
        ? prevRetweetedBy.filter((id: string) => id !== currentUserId)
        : [...prevRetweetedBy, currentUserId];
        
      return {
        ...prev,
        retweetedBy: newRetweetedBy,
        retweets: currentlyRetweeted ? Math.max(0, (prev.retweets || 1) - 1) : (prev.retweets || 0) + 1,
      };
    });

    try {
      const res = await axiosInstance.post(`/retweet/${tweetId}`, { userId: user?._id });
      settweetstate(res.data);
    } catch (error) {
      console.error("Retweet failed", error);
    }
  };

  // OPTIMISTIC UPDATE: Reply
  const submitReply = async () => {
    if (!replyText.trim()) return;
    
    // 1. Instantly update the comment count UI
    settweetstate((prev: any) => ({
      ...prev,
      comments: (prev.comments || 0) + 1
    }));
    
    // 2. Close modal & reset text instantly for snappy feel
    setShowReplyModal(false);
    const textToSend = replyText;
    setReplyText("");
    setIsReplying(true);

    // 3. Perform backend submission in the background
    try {
      const res = await axiosInstance.post(`/comment/${tweetstate._id}`, {
        userId: user?._id,
        content: textToSend,
      });
      settweetstate(res.data);
    } catch (error) {
      console.error("Reply failed", error);
      // Revert optimistic update on failure
      settweetstate((prev: any) => ({
        ...prev,
        comments: Math.max(0, (prev.comments || 1) - 1)
      }));
    } finally {
      setIsReplying(false);
    }
  };

  const formatNumber = (num: number) => {
    if (!num) return "0";
    if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
    if (num >= 1000) return (num / 1000).toFixed(1) + "K";
    return num.toString();
  };

  const getFormattedDate = (rawTime: any) => {
    if (!rawTime || rawTime === "Just now") return "Just now";
    const parsed = new Date(rawTime);
    if (isNaN(parsed.getTime())) return String(rawTime);
    return parsed.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }).toLowerCase();
  };

  const currentUserId = user?._id?.toString();
  const isLiked = currentUserId ? (tweetstate.likedBy || []).map((id: any) => id?.toString()).includes(currentUserId) : false;
  const isRetweet = currentUserId ? (tweetstate.retweetedBy || []).map((id: any) => id?.toString()).includes(currentUserId) : false;
  
  const authorDisplayName = tweetstate.author?.displayName || tweetstate.author?.username || "Anonymous";
  const authorUsername = tweetstate.author?.username || "anonymous";

  if (tweetstate.mediaType === "audio" || tweetstate.audioUrl) {
    return (
      <>
        <AudioTweetCard
          tweetId={tweetstate._id}
          authorDisplayName={authorDisplayName}
          authorUsername={authorUsername}
          authorAvatar={tweetstate.author?.avatar}
          content={tweetstate.content}
          audioUrl={tweetstate.audioUrl}
          audioDuration={tweetstate.audioDuration || 0}
          createdAt={getFormattedDate(tweetstate.timestamp || tweetstate.createdAt)}
          likes={tweetstate.likes}
          retweets={tweetstate.retweets}
          comments={tweetstate.comments}
          isLiked={isLiked}
          isRetweet={isRetweet}
          onLike={() => likeTweet(tweetstate._id)}
          onRetweet={() => retweetTweet(tweetstate._id)}
          onReply={() => {
            setReplyText(`@${authorUsername} `);
            setShowReplyModal(true);
          }}
        />
        {showReplyModal && (
          <div 
            className="fixed inset-0 z-[150] flex items-start justify-center bg-black/40 backdrop-blur-sm sm:items-center p-3 sm:p-4"
            onClick={(e) => {
              e.stopPropagation();
              setShowReplyModal(false);
            }}
          >
            <div 
              className="bg-background w-full max-w-[600px] rounded-2xl border border-border shadow-2xl mt-12 sm:mt-0 flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between px-4 py-2 border-b border-border">
                <button 
                  onClick={() => setShowReplyModal(false)}
                  className="p-2 hover:bg-accent rounded-full transition-colors -ml-2"
                >
                  <X className="h-5 w-5 text-foreground" />
                </button>
                <Button 
                  onClick={submitReply}
                  disabled={!replyText.trim() || isReplying}
                  className={`rounded-full px-5 font-bold h-8 transition-opacity ${
                    !replyText.trim() 
                      ? "bg-[#C4C4C4] text-white opacity-70 cursor-not-allowed hover:bg-[#C4C4C4]" 
                      : "bg-primary text-primary-foreground hover:bg-primary/90"
                  }`}
                >
                  Reply
                </Button>
              </div>

              <div className="px-4 pt-4 pb-2 flex gap-3">
                <div className="flex flex-col items-center shrink-0">
                  <Avatar className="h-10 w-10 sm:h-12 sm:w-12">
                    <AvatarImage src={getMediaUrl(user?.avatar)} alt={user?.displayName || "User"} />
                    <AvatarFallback className="bg-slate-300 text-slate-600 font-bold text-sm sm:text-base">
                      {user?.displayName?.charAt(0) || "U"}
                    </AvatarFallback>
                  </Avatar>
                </div>
                <div className="flex-1 min-w-0 pt-1">
                  <textarea
                    placeholder="Post your reply"
                    value={replyText}
                    onChange={(e) => setReplyText(e.target.value)}
                    className="w-full bg-transparent text-foreground text-lg sm:text-xl outline-none resize-none overflow-hidden placeholder-muted-foreground/70 min-h-[120px]"
                    autoFocus
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      <article className="px-3 sm:px-4 pt-3 pb-2 border-b border-border hover:bg-accent/30 transition-colors cursor-pointer bg-background">
        <div className="flex space-x-3">
          
          <Avatar className="h-9 w-9 sm:h-10 sm:w-10 shrink-0 mt-1">
            <AvatarImage src={getMediaUrl(tweetstate.author?.avatar)} alt={authorDisplayName} />
            <AvatarFallback className="bg-slate-300 text-slate-600 font-bold text-xs sm:text-sm">
              {authorDisplayName.charAt(0)}
            </AvatarFallback>
          </Avatar>

          <div className="flex-1 min-w-0">
            
            <div className="flex items-center justify-between mb-0.5">
              <div className="flex items-center gap-1 truncate text-sm sm:text-[15px]">
                <span className="font-bold text-foreground hover:underline truncate">
                  {authorDisplayName}
                </span>
                {tweetstate.author?.verified && (
                  <div className="text-blue-500 shrink-0">
                    <svg className="h-[18px] w-[18px] fill-current" viewBox="0 0 24 24">
                      <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.792-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.756 2.75 1.884 3.45-.11.42-.168.86-.168 1.3 0 2.21 1.71 4 3.918 4 .47 0 .92-.086 1.336-.25 1.526 1.333 2.834 2.25 4.337 2.25 1.5 0 2.816-.917 3.337-2.25.416.164.866.25 1.336.25 2.21 0 3.918-1.792 3.918-4 0-.44-.058-.88-.168-1.3 1.128-.7 1.884-1.99 1.884-3.45zm-14.288 1.864L5 11.166l1.414-1.414 2 2L15.586 4.586l1.414 1.414-8.788 8.788z" />
                    </svg>
                  </div>
                )}
                <span className="text-muted-foreground truncate">
                  @{authorUsername}
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground hover:underline shrink-0">
                  {getFormattedDate(tweetstate.timestamp || tweetstate.createdAt)}
                </span>
              </div>

              <button className="p-2 hover:bg-sky-500/10 text-muted-foreground hover:text-sky-500 rounded-full transition-colors -mr-2 outline-none group shrink-0" onClick={(e) => e.stopPropagation()}>
                <MoreHorizontal className="h-5 w-5 group-hover:text-sky-500" />
              </button>
            </div>

            <div className="text-foreground text-sm sm:text-[15px] mb-3 leading-normal whitespace-pre-wrap break-words">
              {tweetstate.content}
            </div>

            {tweetstate.image && (
              <div className="mb-3 rounded-2xl overflow-hidden border border-border">
                <img
                  src={getMediaUrl(tweetstate.image)}
                  alt="Tweet image"
                  className="w-full h-auto max-h-[510px] object-cover"
                />
              </div>
            )}

            <div className="flex items-center justify-between text-muted-foreground mt-2 w-full">
              <div className="flex items-center justify-between flex-1 max-w-[300px] pr-2 sm:pr-4">
                
                <button 
                  className="flex items-center group transition-colors outline-none" 
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowReplyModal(true);
                  }}
                >
                  <div className="p-2 group-hover:bg-sky-500/10 group-hover:text-sky-500 rounded-full transition-colors -ml-2">
                    <MessageCircle className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[12px] sm:text-[13px] px-0.5 sm:px-1 group-hover:text-sky-500 transition-colors">
                    {tweetstate.comments > 0 ? formatNumber(tweetstate.comments) : ""}
                  </span>
                </button>

                <button 
                  className={`flex items-center group transition-colors outline-none ${isRetweet ? "text-emerald-500" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    retweetTweet(tweetstate._id);
                  }}
                >
                  <div className="p-2 group-hover:bg-emerald-500/10 group-hover:text-emerald-500 rounded-full transition-colors">
                    <Repeat2 className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </div>
                  <span className="text-[12px] sm:text-[13px] px-0.5 sm:px-1 group-hover:text-emerald-500 transition-colors">
                    {tweetstate.retweets > 0 ? formatNumber(tweetstate.retweets) : ""}
                  </span>
                </button>

                <button 
                  className={`flex items-center group transition-colors outline-none ${isLiked ? "text-pink-600" : ""}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    likeTweet(tweetstate._id);
                  }}
                >
                  <div className="p-2 group-hover:bg-pink-600/10 group-hover:text-pink-600 rounded-full transition-colors">
                    <Heart className={`h-[18px] w-[18px] ${isLiked ? "fill-current text-pink-600" : ""}`} strokeWidth={1.5} />
                  </div>
                  <span className="text-[12px] sm:text-[13px] px-0.5 sm:px-1 group-hover:text-pink-600 transition-colors">
                    {tweetstate.likes > 0 ? formatNumber(tweetstate.likes) : ""}
                  </span>
                </button>
              </div>

              <div className="flex items-center gap-1 -mr-2 shrink-0">
                <button className="p-2 group outline-none" onClick={(e) => e.stopPropagation()}>
                  <div className="group-hover:bg-sky-500/10 group-hover:text-sky-500 rounded-full transition-colors p-1">
                    <Bookmark className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </div>
                </button>
                <button className="p-2 group outline-none" onClick={(e) => e.stopPropagation()}>
                  <div className="group-hover:bg-sky-500/10 group-hover:text-sky-500 rounded-full transition-colors p-1">
                    <Upload className="h-[18px] w-[18px]" strokeWidth={1.5} />
                  </div>
                </button>
              </div>
              
              {/* Replies have been moved to the modal */}
            </div>
          </div>
        </div>
      </article>

      {showReplyModal && (
        <div 
          className="fixed inset-0 z-[150] flex items-start justify-center bg-black/40 backdrop-blur-sm sm:items-center p-3 sm:p-4"
          onClick={(e) => {
            e.stopPropagation();
            setShowReplyModal(false);
          }}
        >
          <div 
            className="bg-background w-full max-w-[600px] rounded-2xl border border-border shadow-2xl mt-12 sm:mt-0 flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-4 py-2 border-b border-border">
              <button 
                onClick={() => setShowReplyModal(false)}
                className="p-2 hover:bg-accent rounded-full transition-colors -ml-2"
              >
                <X className="h-5 w-5 text-foreground" />
              </button>
              <Button 
                onClick={submitReply}
                disabled={!replyText.trim() || isReplying}
                className={`rounded-full px-5 font-bold h-8 transition-opacity ${
                  !replyText.trim() 
                    ? "bg-[#C4C4C4] text-white opacity-70 cursor-not-allowed hover:bg-[#C4C4C4]" 
                    : "bg-primary text-primary-foreground hover:bg-primary/90"
                }`}
              >
                Reply
              </Button>
            </div>

            <div className="px-4 pt-4 pb-2 flex gap-3">
              <div className="flex flex-col items-center shrink-0">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user?.avatar} alt={user?.displayName} />
                  <AvatarFallback className="bg-slate-300 text-slate-600 font-bold">
                    {user?.displayName?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="flex-1 min-w-0 pt-1 pb-4">
                <div className="text-[15px] text-muted-foreground mb-3 truncate">
                  Replying to <span className="text-sky-500 hover:underline cursor-pointer">@{authorUsername}</span>
                </div>
                
                <textarea
                  autoFocus
                  placeholder="Post your reply"
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="w-full bg-transparent text-foreground text-lg sm:text-xl placeholder-muted-foreground border-none focus:ring-0 outline-none resize-none min-h-[80px]"
                />
              </div>
            </div>

            {/* RENDER PREVIOUS REPLIES IN MODAL */}
            <div className="px-4 border-t border-border pt-4 pb-4 max-h-[300px] overflow-y-auto no-scrollbar bg-accent/10">
              <h3 className="font-bold text-sm text-muted-foreground mb-4">Previous Replies</h3>
              {(!tweetstate.replies || tweetstate.replies.length === 0) ? (
                <div className="text-center text-muted-foreground text-[14px] py-4">
                  No replies yet. Be the first to reply!
                </div>
              ) : (
                <div className="space-y-4">
                  {[...tweetstate.replies].reverse().map((reply: any, idx: number) => (
                    <div key={idx} className="flex gap-3">
                      <Avatar className="w-8 h-8 shrink-0 mt-0.5">
                        <AvatarImage src={reply.userId?.avatar || `https://i.pravatar.cc/150?u=${reply.userId || idx}`} />
                        <AvatarFallback className="bg-slate-300 text-slate-700 text-xs font-bold">
                          {reply.userId?.displayName?.[0] || "?"}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col min-w-0 flex-1">
                        <div className="flex items-center gap-1 truncate w-full">
                          <span className="font-bold text-[14px] text-foreground truncate">{reply.userId?.displayName || "User"}</span>
                          <span className="text-muted-foreground text-[14px] truncate">@{reply.userId?.username || "user"}</span>
                        </div>
                        <p className="text-[14px] text-foreground mt-0.5 whitespace-pre-wrap break-words">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}