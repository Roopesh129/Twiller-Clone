"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Link as LinkIcon,
  MoreHorizontal,
  Camera,
  Laptop,
  Smartphone,
  Monitor,
  ShieldCheck,
  Bell,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "./ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import TweetCard from "./TweetCard";
import { Card, CardContent } from "./ui/card";
import Editprofile from "./Editprofile";
import axiosInstance from "@/lib/axiosInstance";

interface Tweet {
  id: string;
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
}

interface LoginSession {
  _id?: string;
  browser: string;
  os: string;
  deviceCategory: 'desktop' | 'laptop' | 'mobile';
  ipAddress: string;
  loginTimestamp: string | Date;
}

export default function ProfilePage() {
  const { user } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("posts");
  const [showEditModal, setShowEditModal] = useState(false);
  const [tweets, setTweets] = useState<any>([]);
  const [loading, setloading] = useState(false);

  const fetchTweets = async () => {
    try {
      setloading(true);
      const res = await axiosInstance.get("/post");
      setTweets(res.data);
    } catch (error) {
      console.error(error);
    } finally {
      setloading(false);
    }
  };

  useEffect(() => {
    fetchTweets();
  }, []);

  if (!user) return null;

  // Filter tweets by current user
  const userTweets = tweets.filter((tweet: any) => tweet.author?._id === user._id);
  const loginHistory: LoginSession[] =
    (user as { loginHistory?: LoginSession[] }).loginHistory || [];

  const formattedJoinedDate = user.joinedDate 
    ? new Date(user.joinedDate).toLocaleDateString("en-US", { month: "long", year: "numeric" })
    : "July 2026";

  return (
    <div className="min-h-screen bg-background text-foreground w-full overflow-x-hidden">
      {/* Sticky Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between px-3 sm:px-4 py-3 bg-background/95 backdrop-blur-md border-b border-border">
        <div className="flex items-center space-x-4 sm:space-x-6 min-w-0">
          <Button
            variant="ghost"
            size="sm"
            className="p-2 rounded-full hover:bg-accent shrink-0"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-5 w-5 text-foreground" />
          </Button>
          <div className="min-w-0">
            <h1 className="text-lg sm:text-xl font-bold text-foreground flex items-center gap-1 truncate">
              <span className="truncate">{user.displayName}</span>
              {(user as any).verified && (
                <svg className="h-[18px] w-[18px] fill-blue-500 inline-block shrink-0" viewBox="0 0 24 24">
                  <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.792-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.756 2.75 1.884 3.45-.11.42-.168.86-.168 1.3 0 2.21 1.71 4 3.918 4 .47 0 .92-.086 1.336-.25 1.526 1.333 2.834 2.25 4.337 2.25 1.5 0 2.816-.917 3.337-2.25.416.164.866.25 1.336.25 2.21 0 3.918-1.792 3.918-4 0-.44-.058-.88-.168-1.3 1.128-.7 1.884-1.99 1.884-3.45zm-14.288 1.864L5 11.166l1.414-1.414 2 2L15.586 4.586l1.414 1.414-8.788 8.788z" />
                </svg>
              )}
            </h1>
            <p className="text-xs text-muted-foreground">{userTweets.length} posts</p>
          </div>
        </div>

        {/* Dedicated Notification Settings Route Link */}
        <Link
          href="/settings/notifications"
          className="hidden sm:flex items-center gap-2 bg-card hover:bg-accent text-foreground text-xs font-semibold px-3 py-2 rounded-full border border-border transition shrink-0"
        >
          <Bell className="h-4 w-4 text-blue-400" />
          <span>Notification Settings</span>
        </Link>
      </div>

      {/* Cover Photo / Banner (Responsive 3:1 height scale) */}
      <div className="relative h-32 sm:h-48 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600">
        <Button
          variant="ghost"
          size="sm"
          className="absolute top-3 right-3 p-2.5 rounded-full bg-background/50 hover:bg-background/70 backdrop-blur-sm"
        >
          <Camera className="h-4 w-4 text-foreground" />
        </Button>
      </div>

      {/* Profile Section Content */}
      <div className="px-3 sm:px-4 pb-4">
        {/* Row for Avatar and Action Buttons */}
        <div className="flex justify-between items-end relative">
          
          {/* Overlapping Avatar Ring (Responsive scaling) */}
          <div className="-mt-12 sm:-mt-16 relative inline-block rounded-full border-4 border-background bg-background shadow-md shrink-0">
            <Avatar className="h-24 w-24 sm:h-36 sm:w-36">
              <AvatarImage src={user.avatar} alt={user.displayName} />
              <AvatarFallback className="text-2xl sm:text-4xl bg-muted text-foreground font-bold">
                {user.displayName ? user.displayName[0] : "?"}
              </AvatarFallback>
            </Avatar>
            <Button
              variant="ghost"
              size="sm"
              className="absolute bottom-1 right-1 sm:bottom-2 sm:right-2 p-1.5 sm:p-2 rounded-full bg-background/70 hover:bg-background/90 border-2 border-background"
            >
              <Camera className="h-3 w-3 sm:h-4 sm:w-4 text-foreground" />
            </Button>
          </div>

          {/* Action Buttons Right aligned */}
          <div className="flex items-center gap-1.5 sm:gap-3 mb-2">
            <Button
              variant="outline"
              size="icon"
              className="border-border text-foreground bg-card rounded-full hover:bg-accent h-8 w-8 sm:h-9 sm:w-9"
              title="More options"
            >
              <MoreHorizontal className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground" />
            </Button>

            <Link href="/settings/notifications">
              <Button
                variant="outline"
                size="icon"
                className="border-border text-foreground bg-card rounded-full hover:bg-accent h-8 w-8 sm:h-9 sm:w-9 sm:hidden"
                title="Keyword Notification Settings"
              >
                <Bell className="h-4 w-4 text-blue-400" />
              </Button>
            </Link>

            <Button
              variant="outline"
              className="border-border text-foreground bg-background font-bold rounded-full px-3 sm:px-4 h-8 sm:h-9 text-xs sm:text-sm hover:bg-accent"
              onClick={() => setShowEditModal(true)}
            >
              Edit profile
            </Button>
          </div>
        </div>

        {/* Names & Handle */}
        <div className="mt-3">
          <div className="flex items-center gap-1">
            <h1 className="text-xl font-bold text-foreground leading-none">
              {user.displayName}
            </h1>
            {(user as any).verified && (
              <svg className="h-[18px] w-[18px] fill-blue-500" viewBox="0 0 24 24">
                <path d="M22.5 12.5c0-1.58-.875-2.95-2.148-3.6.154-.435.238-.905.238-1.4 0-2.21-1.71-3.998-3.918-3.998-.47 0-.92.084-1.336.25C14.818 2.415 13.51 1.5 12 1.5s-2.816.917-3.337 2.25c-.416-.165-.866-.25-1.336-.25-2.21 0-3.918 1.792-3.918 4 0 .495.084.965.238 1.4-1.273.65-2.148 2.02-2.148 3.6 0 1.46.756 2.75 1.884 3.45-.11.42-.168.86-.168 1.3 0 2.21 1.71 4 3.918 4 .47 0 .92-.086 1.336-.25 1.526 1.333 2.834 2.25 4.337 2.25 1.5 0 2.816-.917 3.337-2.25.416.164.866.25 1.336.25 2.21 0 3.918-1.792 3.918-4 0-.44-.058-.88-.168-1.3 1.128-.7 1.884-1.99 1.884-3.45zm-14.288 1.864L5 11.166l1.414-1.414 2 2L15.586 4.586l1.414 1.414-8.788 8.788z" />
              </svg>
            )}
          </div>
          <p className="text-sm text-muted-foreground mt-0.5">@{user.username}</p>
        </div>

        {/* Bio */}
        {user.bio && (
          <p className="text-foreground mt-3 text-[15px] leading-snug whitespace-pre-wrap break-words">{user.bio}</p>
        )}

        {/* Metadata Details Row */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 text-sm text-muted-foreground">
          <div className="flex items-center space-x-1.5">
            <MapPin className="h-4 w-4 shrink-0" />
            <span>{user.location ? user.location : "Earth"}</span>
          </div>
          <div className="flex items-center space-x-1.5 truncate">
            <LinkIcon className="h-4 w-4 shrink-0" />
            <a 
              href={user.website?.startsWith("http") ? user.website : `https://${user.website || "example.com"}`} 
              target="_blank" 
              rel="noreferrer"
              className="text-blue-400 hover:underline truncate"
            >
              {(user.website || "example.com").replace(/^https?:\/\//, '')}
            </a>
          </div>
          <div className="flex items-center space-x-1.5">
            <Calendar className="h-4 w-4 shrink-0" />
            <span>Joined {formattedJoinedDate}</span>
          </div>
        </div>

        {/* Following / Followers count row */}
        <div className="flex items-center gap-4 mt-3 text-sm">
          <div className="hover:underline cursor-pointer">
            <span className="font-bold text-foreground">{(user as any).following?.length || 0}</span>{" "}
            <span className="text-muted-foreground">Following</span>
          </div>
          <div className="hover:underline cursor-pointer">
            <span className="font-bold text-foreground">{(user as any).followers?.length || 0}</span>{" "}
            <span className="text-muted-foreground">Followers</span>
          </div>
        </div>
      </div>

      {/* Security Section: Login History Component Integration */}
      <div className="px-3 sm:px-4 pb-6">
        <LoginHistoryTable history={loginHistory} />
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5 bg-transparent border-b border-border rounded-none h-auto">
          <TabsTrigger
            value="posts"
            className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none text-muted-foreground hover:bg-accent py-3 sm:py-4 text-xs sm:text-sm font-semibold"
          >
            Posts
          </TabsTrigger>
          <TabsTrigger
            value="replies"
            className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none text-muted-foreground hover:bg-accent py-3 sm:py-4 text-xs sm:text-sm font-semibold"
          >
            Replies
          </TabsTrigger>
          <TabsTrigger
            value="highlights"
            className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none text-muted-foreground hover:bg-accent py-3 sm:py-4 text-xs sm:text-sm font-semibold"
          >
            Highlights
          </TabsTrigger>
          <TabsTrigger
            value="articles"
            className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none text-muted-foreground hover:bg-accent py-3 sm:py-4 text-xs sm:text-sm font-semibold"
          >
            Articles
          </TabsTrigger>
          <TabsTrigger
            value="media"
            className="data-[state=active]:bg-transparent data-[state=active]:text-foreground data-[state=active]:border-b-2 data-[state=active]:border-blue-500 data-[state=active]:rounded-none text-muted-foreground hover:bg-accent py-3 sm:py-4 text-xs sm:text-sm font-semibold"
          >
            Media
          </TabsTrigger>
        </TabsList>

        <TabsContent value="posts" className="mt-0">
          <div className="divide-y divide-border">
            {loading ? (
              <Card className="bg-background border-none">
                <CardContent className="py-12 text-center">
                  <div className="text-muted-foreground">
                    <h3 className="text-2xl font-bold mb-2">Loading posts...</h3>
                  </div>
                </CardContent>
              </Card>
            ) : userTweets.length === 0 ? (
              <Card className="bg-background border-none">
                <CardContent className="py-12 text-center">
                  <div className="text-muted-foreground">
                    <h3 className="text-2xl font-bold mb-2">
                      You haven't posted yet
                    </h3>
                    <p>When you post, it will show up here.</p>
                  </div>
                </CardContent>
              </Card>
            ) : (
              userTweets.map((tweet: any) => (
                <TweetCard key={tweet._id || tweet.id} tweet={tweet} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="replies" className="mt-0">
          <Card className="bg-background border-none">
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <h3 className="text-2xl font-bold mb-2">
                  You haven't replied yet
                </h3>
                <p>When you reply to a post, it will show up here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="highlights" className="mt-0">
          <Card className="bg-background border-none">
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <h3 className="text-2xl font-bold mb-2">
                  Lights, camera … attachments!
                </h3>
                <p>When you post photos or videos, they will show up here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="articles" className="mt-0">
          <Card className="bg-background border-none">
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <h3 className="text-2xl font-bold mb-2">
                  You haven't written any articles
                </h3>
                <p>When you write articles, they will show up here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="media" className="mt-0">
          <Card className="bg-background border-none">
            <CardContent className="py-12 text-center">
              <div className="text-muted-foreground">
                <h3 className="text-2xl font-bold mb-2">
                  Lights, camera … attachments!
                </h3>
                <p>When you post photos or videos, they will show up here.</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Editprofile
        isopen={showEditModal}
        onclose={() => setShowEditModal(false)}
      />
    </div>
  );
}

// =========================================================================
// Local Modular Component: LoginHistoryTable
// =========================================================================
function LoginHistoryTable({ history }: { history: LoginSession[] }) {
  const getDeviceIcon = (category: 'desktop' | 'laptop' | 'mobile') => {
    switch (category) {
      case "mobile":
        return <Smartphone className="w-4 h-4 text-muted-foreground shrink-0" />;
      case "laptop":
        return <Laptop className="w-4 h-4 text-muted-foreground shrink-0" />;
      default:
        return <Monitor className="w-4 h-4 text-muted-foreground shrink-0" />;
    }
  };

  const sortedHistory = [...(history || [])].sort(
    (a, b) => new Date(b.loginTimestamp).getTime() - new Date(a.loginTimestamp).getTime()
  );

  return (
    <div className="w-full bg-card text-foreground rounded-2xl border border-border p-4 sm:p-5 mt-4 overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0" />
        <h3 className="text-base sm:text-lg font-bold tracking-tight">Login History & Device Safety</h3>
      </div>
      
      <p className="text-xs text-muted-foreground mb-4 leading-normal">
        Your dynamic session tracking logging monitoring information is rendered below for transparency.
      </p>

      {sortedHistory.length === 0 ? (
        <div className="text-center py-6 border border-dashed border-border rounded-xl text-muted-foreground text-xs font-medium">
          No recorded security login history sessions available.
        </div>
      ) : (
        <div className="overflow-x-auto w-full rounded-xl border border-border bg-background">
          <table className="w-full text-left border-collapse text-xs whitespace-nowrap sm:whitespace-normal">
            <thead>
              <tr className="bg-muted/60 border-b border-border font-semibold text-muted-foreground">
                <th className="p-3">Device & OS</th>
                <th className="p-3">Browser</th>
                <th className="p-3">IP Address</th>
                <th className="p-3 text-right">Time Checked (IST)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-muted-foreground">
              {sortedHistory.map((session, index) => {
                const sessionDate = new Date(session.loginTimestamp).toLocaleString("en-IN", {
                  timeZone: "Asia/Kolkata",
                  dateStyle: "medium",
                  timeStyle: "short",
                });

                return (
                  <tr key={session._id || index} className="hover:bg-accent/40 transition-colors">
                    <td className="p-3 flex items-center gap-2 font-medium">
                      <div className="p-1 bg-card border border-border rounded">
                        {getDeviceIcon(session.deviceCategory)}
                      </div>
                      <span className="capitalize">{session.os || "Unknown OS"}</span>
                    </td>
                    <td className="p-3">{session.browser}</td>
                    <td className="p-3 font-mono text-[11px] text-muted-foreground">{session.ipAddress}</td>
                    <td className="p-3 text-right text-muted-foreground">{sessionDate}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}