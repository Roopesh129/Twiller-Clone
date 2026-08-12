"use client";
import { useAuth } from "@/context/AuthContext";
import React, { useState } from "react";
import LoadingSpinner from "../loading-spinner";
import Sidebar from "./Sidebar";
import RightSidebar from "./Rightsidebar";
import ProfilePage from "../ProfilePage";
import MessagesPage from "../MessagesPage";
import { Avatar, AvatarFallback, AvatarImage } from "../ui/avatar";
import { X, Menu } from "lucide-react";

const Mainlayout = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading } = useAuth();
  const [currentPage, setCurrentPage] = useState("home");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="text-foreground text-3xl font-bold mb-4">X</div>
          <LoadingSpinner size="md" />
        </div>
      </div>
    );
  }

  // If user is not logged in → show children (like login/signup pages)
  if (!user) {
    return <>{children}</>;
  }

  return (
    // 1. The Global Center: Centers the entire layout on ultra-wide monitors without overflow bugs
    <div className="min-h-screen bg-background text-foreground flex justify-center mx-auto w-full overflow-x-hidden">
      
      {/* 2. The Master Wrapper: Caps total layout width and aligns content correctly next to the left navigation header */}
      <div className="flex w-full justify-center lg:justify-normal max-w-[1265px] relative">
        
        {/* 3. The Left Anchor: Desktop Sidebar with auto scroll and no clipping */}
        <header className="hidden sm:flex flex-col justify-between w-[68px] sm:w-[88px] xl:w-[275px] shrink-0 sticky top-0 h-screen py-2 px-2 xl:px-3 box-border items-end overflow-y-auto no-scrollbar z-50">
          <div className="w-full flex-1 flex flex-col items-end xl:items-stretch pb-16">
            <div className="w-full xl:w-[230px] flex flex-col">
              <Sidebar currentPage={currentPage} onNavigate={setCurrentPage} />
            </div>
          </div>
        </header>

        {/* 4. The Right Group: Tethers the feed and right sidebar together */}
        <div className="flex w-full lg:w-[990px] justify-between lg:justify-start">
          
          {/* Center Feed: Strictly 600px wide, wrapped in borders with safe top padding for mobile header and ample bottom padding */}
          <main className="w-full max-w-[600px] min-h-screen border-x border-border shrink-0 pt-14 pb-32 sm:pt-0 sm:pb-10">
            {currentPage === "profile" ? <ProfilePage /> : currentPage === "messages" ? <MessagesPage /> : children}
          </main>

          {/* Right Sidebar: Fixed width, tethered to the feed with left-padding (pl-8) */}
          <div className="hidden lg:block w-[290px] xl:w-[350px] pl-8 py-3 shrink-0 sticky top-0 h-screen overflow-y-auto no-scrollbar z-40">
            <RightSidebar />
          </div>

        </div>

      </div>

      {/* MOBILE TOP BAR WITH THREE-LINES (HAMBURGER) MENU TOGGLE (< 640px) */}
      <div className="sm:hidden fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-md border-b border-border flex items-center justify-between px-4 h-14 shadow-sm w-full">
        <button 
          onClick={() => setIsMobileMenuOpen(true)}
          className="focus:outline-none p-2 rounded-full hover:bg-accent transition text-foreground"
          aria-label="Open Navigation Menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div className="font-bold text-base">Home</div>
        <div className="w-9"></div> {/* Spacer for symmetry */}
      </div>

      {/* MOBILE SLIDE-OUT DRAWER OVERLAY - Scaled down post button and elements specifically inside mobile view to prevent any vertical cutting */}
      {isMobileMenuOpen && (
        <div className="sm:hidden fixed inset-0 z-50 flex">
          {/* Backdrop */}
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-[280px] bg-background h-full shadow-2xl flex flex-col z-10 p-3 overflow-y-auto border-r border-border pb-16 no-scrollbar">
            <div className="flex justify-between items-center mb-3">
              <h3 className="font-bold text-lg">Account info</h3>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="p-1 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground transition"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* User Profile Mini Card */}
            <div className="mb-3 pb-3 border-b border-border">
              <div className="flex justify-between items-start mb-2">
                <Avatar className="h-10 w-10">
                  <AvatarImage src={user.avatar} />
                  <AvatarFallback className="text-base bg-muted text-foreground font-bold">
                    {user.displayName?.[0] || "?"}
                  </AvatarFallback>
                </Avatar>
              </div>
              <div className="font-bold text-sm text-foreground leading-snug">{user.displayName}</div>
              <div className="text-xs text-muted-foreground mb-2">@{user.username}</div>
              <div className="flex gap-3 text-xs">
                <div>
                  <span className="font-bold text-foreground">{user.following?.length || 0}</span>{" "}
                  <span className="text-muted-foreground">Following</span>
                </div>
                <div>
                  <span className="font-bold text-foreground">{user.followers?.length || 0}</span>{" "}
                  <span className="text-muted-foreground">Followers</span>
                </div>
              </div>
            </div>

            {/* Drawer Navigation Links */}
            <div className="flex-1 space-y-0.5 scale-95 origin-top-left">
              <Sidebar 
                currentPage={currentPage} 
                onNavigate={(page) => {
                  setCurrentPage(page);
                  setIsMobileMenuOpen(false);
                }} 
              />
            </div>
          </div>
        </div>
      )}

      {/* Global CSS utility to hide ugly scrollbars while keeping content fully scrollable */}
      <style jsx global>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>

    </div>
  );
};

export default Mainlayout;