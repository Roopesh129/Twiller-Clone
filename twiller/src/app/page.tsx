"use client";

import React from "react";
import { useAuth } from "@/context/AuthContext";
import Mainlayout from "@/components/layout/Mainlayout";
import Feed from "@/components/Feed"; 
import Landing from "@/components/Landing";
import LoadingSpinner from "@/components/loading-spinner"; // Ensure this path is correct

export default function HomePage() {
  const { user, isLoading } = useAuth();

  // 1. Show the authentic Twitter X logo while checking the session
  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <LoadingSpinner size="xl" />
      </div>
    );
  }

  // 2. If the user is logged out, show the Landing page with login UI
  if (!user) {
    return <Landing />; 
  }

  // 3. If the user is logged in, show the main feed
  return (
    <Mainlayout>
      <Feed />
    </Mainlayout>
  );
}